param(
  [string]$Name = "baseline"
)

$ErrorActionPreference = "Stop"

# Paths
$projectRoot = Split-Path -Parent $PSScriptRoot
$repoRoot = Split-Path -Parent (Split-Path -Parent $projectRoot)
$resources = Join-Path $projectRoot "src\main\resources"
$migrationDir = Join-Path $resources "db\migration"
$changelogDir = Join-Path $resources "db\changelog"

# Ensure dirs exist
New-Item -ItemType Directory -Force -Path $migrationDir | Out-Null
New-Item -ItemType Directory -Force -Path $changelogDir | Out-Null

# Load .env from repo root
$envFile = Join-Path $repoRoot ".env"
if (Test-Path $envFile) {
  Write-Host "Loading env from $envFile" -ForegroundColor DarkGray
  Get-Content $envFile | ForEach-Object {
      if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
          $key = $matches[1].Trim()
          $value = $matches[2].Trim() -replace '^["'']|["'']$', ''
          [Environment]::SetEnvironmentVariable($key, $value, "Process")
      }
  }
}

$dbUrl = $env:SPRING_DATASOURCE_URL
$dbUser = $env:SPRING_DATASOURCE_USERNAME
$dbPass = $env:SPRING_DATASOURCE_PASSWORD
if (-not $dbUrl) { throw "SPRING_DATASOURCE_URL not set" }

Write-Host "Generating migration from JPA entities using Hibernate..." -ForegroundColor Cyan

# Compute next Flyway version
$existing = Get-ChildItem -Path $migrationDir -Filter "V*__*.sql" -ErrorAction SilentlyContinue
$max = 0
foreach ($f in $existing) {
  if ($f.BaseName -match '^V(\d+)__') {
    $v = [int]$Matches[1]
    if ($v -gt $max) { $max = $v }
  }
}
$next = $max + 1
$targetSql = Join-Path $migrationDir ("V{0}__{1}.sql" -f $next,$Name)

# Generate complete JPA schema using Hibernate via SchemaExporter main class
$createSchemaPath = Join-Path $changelogDir "jpa_create.sql"

Write-Host "Exporting JPA schema DDL..." -ForegroundColor Cyan

# Create temporary application config for schema export
$tempConfigPath = Join-Path $changelogDir "temp-schema-gen.yml"
@"
spring:
  datasource:
    url: $dbUrl
    username: $dbUser
    password: $dbPass
  flyway:
    enabled: false
  jpa:
    hibernate:
      ddl-auto: none
    properties:
      jakarta:
        persistence:
          schema-generation:
            scripts:
              action: create
              create-target: $createSchemaPath
              create-source: metadata
            database:
              action: none
      hibernate:
        format_sql: true
  main:
    web-application-type: none
"@ | Out-File -FilePath $tempConfigPath -Encoding UTF8

Push-Location $projectRoot
try {
  Write-Host "Starting SchemaExporter (background job)..." -ForegroundColor DarkGray
  $job = Start-Job -ScriptBlock {
    param($projectPath, $cfg)
    Set-Location $projectPath
    & .\mvnw.ps1 -q -DskipTests -Dspring-boot.run.main-class=com.tickets.api.SchemaExporter -Dspring.config.additional-location="file:$cfg" spring-boot:run
  } -ArgumentList $projectRoot, $tempConfigPath

  # Wait up to 60 seconds for schema to be written
  $waitSeconds = 0
  while (($waitSeconds -lt 60) -and -not (Test-Path $createSchemaPath)) {
    Start-Sleep -Seconds 1
    $waitSeconds++
  }

  # Stop the background job if still running
  if ($job -and ($job.State -eq 'Running')) {
    Stop-Job -Job $job -ErrorAction SilentlyContinue
  }
  if ($job) { Remove-Job -Job $job -Force -ErrorAction SilentlyContinue }
} catch {
  Write-Host "Schema export process completed" -ForegroundColor DarkGray
} finally {
  Remove-Item -Force $tempConfigPath -ErrorAction SilentlyContinue
  Pop-Location
}

if (-not (Test-Path $createSchemaPath)) {
  Write-Error "Failed to generate JPA schema. File not created: $createSchemaPath"
  exit 1
}

$schemaContent = Get-Content $createSchemaPath -Raw
if ($schemaContent.Length -lt 100) {
  Write-Error "Generated schema file is too small (probably empty or incomplete)"
  exit 1
}

Write-Host "[SUCCESS] JPA schema exported successfully" -ForegroundColor Green

$header = @"
-- Flyway baseline generated from JPA metadata
-- Timestamp: $(Get-Date -Format o)

-- Ensure required extensions exist
CREATE EXTENSION IF NOT EXISTS pgcrypto;
"@
Set-Content -Path $targetSql -Value $header -Encoding UTF8
Add-Content -Path $targetSql -Value (Get-Content $createSchemaPath -Raw) -Encoding UTF8