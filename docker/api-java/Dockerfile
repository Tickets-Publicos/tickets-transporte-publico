# syntax=docker/dockerfile:1.6

# ==============================================================================
# Etapa 1: Runtime (imagem leve apenas com JRE)
# Usa JAR pré-compilado do CI ou build local
# ==============================================================================
FROM eclipse-temurin:25-jre-alpine AS runtime

WORKDIR /app

# Instala wget e cria usuário em uma única layer
RUN apk add --no-cache wget && \
    addgroup -S spring && \
    adduser -S spring -G spring && \
    rm -rf /var/cache/apk/*

# Copia JAR (será fornecido pelo build do CI ou copiado manualmente)
# Context de build é a raiz do projeto (.)
COPY apps/api-java/target/api-java-*.jar app.jar

# Muda para usuário não-root
USER spring:spring

# Expõe porta padrão
EXPOSE 8080

# Configuração de ambiente para produção
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:+UseStringDeduplication -Djava.security.egd=file:/dev/./urandom"

# Health check otimizado
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Comando de inicialização
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
