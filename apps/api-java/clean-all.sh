#!/bin/bash
# Script para limpar completamente o build e cache do Maven/Lombok

echo "🧹 Limpando build do Maven..."
./mvnw clean

echo "🗑️  Removendo diretório target..."
rm -rf target

echo "🔄 Forçando atualização de dependências..."
./mvnw dependency:purge-local-repository -DactTransitively=false -DreResolve=false

echo "✅ Limpeza completa! Execute './mvnw spring-boot:run' para recompilar."
