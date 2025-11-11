FROM nginx:alpine

# Remove configuração padrão e cria diretório SSL em uma única layer
RUN rm /etc/nginx/conf.d/default.conf && \
    mkdir -p /etc/nginx/ssl && \
    rm -rf /var/cache/apk/*

# Copiar configuração customizada
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf

# Expor portas
EXPOSE 80 443

# Healthcheck otimizado
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
