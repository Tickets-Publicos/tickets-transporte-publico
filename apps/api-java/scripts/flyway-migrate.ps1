param(
  [string]$Url = $env:SPRING_DATASOURCE_URL,
  [string]$User = $env:SPRING_DATASOURCE_USERNAME,
  [string]$Password = $env:SPRING_DATASOURCE_PASSWORD,
  [string]$Goal = "flyway:migrate"
)

if (-not $Url -or -not $User -or -not $Password) {
  Write-Error "SPRING_DATASOURCE_URL/USERNAME/PASSWORD não estão definidos. Garanta que .env foi carregado (usando pnpm com dotenv)."
  exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projDir = Resolve-Path (Join-Path $scriptDir "..")
$wrapperJar = Join-Path $projDir ".mvn/wrapper/maven-wrapper.jar"

Push-Location $projDir
try {
  if (Test-Path $wrapperJar) {
    Write-Host "Usando Maven Wrapper (jar presente)" -ForegroundColor Cyan
    & "$projDir\mvnw.ps1" "-Dflyway.url=$Url" "-Dflyway.user=$User" "-Dflyway.password=$Password" $Goal
    exit $LASTEXITCODE
  }
  # Se não há wrapper jar, preferir mvn local, se existir
  $mvn = Get-Command mvn -ErrorAction SilentlyContinue
  if ($mvn) {
    Write-Host "Wrapper não encontrado; usando mvn local: $($mvn.Source)" -ForegroundColor Yellow
    & $mvn.Source "-Dflyway.url=$Url" "-Dflyway.user=$User" "-Dflyway.password=$Password" $Goal
    exit $LASTEXITCODE
  } else {
    Write-Host "Tentando Maven Wrapper (download do jar pode ser necessário)" -ForegroundColor Yellow
    & "$projDir\mvnw.ps1" "-Dflyway.url=$Url" "-Dflyway.user=$User" "-Dflyway.password=$Password" $Goal
    exit $LASTEXITCODE
  }
}
finally {
  Pop-Location
}
