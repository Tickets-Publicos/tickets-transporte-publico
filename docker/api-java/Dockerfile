# syntax=docker/dockerfile:1.6

# ==============================================================================
# Etapa 1: Runtime (imagem leve apenas com JRE)
# Usa JAR pré-compilado do CI ou build local
# ==============================================================================
FROM eclipse-temurin:25-jre-alpine AS runtime

WORKDIR /app

# Cria usuário não-root para segurança
RUN addgroup -S spring && adduser -S spring -G spring

# Copia JAR (será fornecido pelo build do CI ou copiado manualmente)
# Context de build é a raiz do projeto (.)
COPY apps/api-java/target/api-java-*.jar app.jar

# Muda para usuário não-root
USER spring:spring

# Expõe porta padrão
EXPOSE 3000

# Configuração de ambiente para produção
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75 -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/actuator/health || exit 1

# Comando de inicialização
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
