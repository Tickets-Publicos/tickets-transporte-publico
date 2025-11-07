#!/bin/bash
# Script para limpar cache do Lombok e recompilar o projeto
# Use este script se encontrar erros relacionados ao Lombok

echo "🧹 Limpando cache do Maven..."

# Limpar o projeto
echo ""
echo "📦 Executando mvn clean..."
./mvnw clean

# Remover cache do Lombok
LOMBOK_CACHE="$HOME/.m2/repository/org/projectlombok"
if [ -d "$LOMBOK_CACHE" ]; then
    echo ""
    echo "🗑️  Removendo cache do Lombok em: $LOMBOK_CACHE"
    rm -rf "$LOMBOK_CACHE"
    echo "✅ Cache do Lombok removido"
else
    echo "ℹ️  Cache do Lombok não encontrado"
fi

# Recompilar
echo ""
echo "🔨 Recompilando o projeto..."
./mvnw compile

echo ""
echo "✅ Processo concluído! Agora você pode executar o servidor."
echo "   Execute: ./mvnw spring-boot:run"
