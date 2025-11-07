#!/usr/bin/env pwsh
# Script para limpar cache do Lombok e recompilar o projeto
# Use este script se encontrar erros relacionados ao Lombok

Write-Host "🧹 Limpando cache do Maven..." -ForegroundColor Cyan

# Limpar o projeto
Write-Host "`n📦 Executando mvn clean..." -ForegroundColor Yellow
& "$PSScriptRoot\mvnw.ps1" clean

# Remover cache do Lombok
$lombokCache = "$env:USERPROFILE\.m2\repository\org\projectlombok"
if (Test-Path $lombokCache) {
    Write-Host "`n🗑️  Removendo cache do Lombok em: $lombokCache" -ForegroundColor Yellow
    Remove-Item -Recurse -Force $lombokCache
    Write-Host "✅ Cache do Lombok removido" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Cache do Lombok não encontrado" -ForegroundColor Blue
}

# Recompilar
Write-Host "`n🔨 Recompilando o projeto..." -ForegroundColor Yellow
& "$PSScriptRoot\mvnw.ps1" compile

Write-Host "`n✅ Processo concluído! Agora você pode executar o servidor." -ForegroundColor Green
Write-Host "   Execute: .\mvnw.ps1 spring-boot:run" -ForegroundColor Cyan
