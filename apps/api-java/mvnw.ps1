# Maven Wrapper PowerShell script
# This script ensures JAVA_HOME is set before calling mvnw.cmd
# Environment variables are automatically injected by Turborepo from the root .env file

$ErrorActionPreference = "Stop"

# Detect JAVA_HOME if not set
if (-not $env:JAVA_HOME) {
    # Try to find Java installation
    $javaExecutable = Get-Command java -ErrorAction SilentlyContinue
    if ($javaExecutable) {
        $javaHome = Split-Path (Split-Path $javaExecutable.Source)
        $env:JAVA_HOME = $javaHome
        Write-Host "Detected JAVA_HOME: $javaHome"
    } else {
        Write-Error "JAVA_HOME is not set and Java could not be found in PATH"
        exit 1
    }
}

# Verify JAVA_HOME points to a valid JDK
$javaExe = Join-Path $env:JAVA_HOME "bin\java.exe"
if (-not (Test-Path $javaExe)) {
    Write-Error "JAVA_HOME is set to an invalid directory: $env:JAVA_HOME"
    exit 1
}

Write-Host "Using JAVA_HOME: $env:JAVA_HOME"

# Call mvnw.cmd with all arguments
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$mvnwCmd = Join-Path $scriptDir "mvnw.cmd"

& cmd /c "$mvnwCmd $args"
exit $LASTEXITCODE
