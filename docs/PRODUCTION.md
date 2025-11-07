# Produção - Guia Rápido

## Como Funciona

```
Cliente → Nginx (porta 443) → Next.js (:3000) ou Java (:8080)
```

### Roteamento Nginx

- `/api/auth/*` → Next.js (Better Auth para OAuth)
- `/api/v1/*` → Java (rewrite remove `/api/v1`)
- `/*` → Next.js (frontend)

**Cliente chama:** `https://dominio.com/api/v1/users`  
**Java recebe:** `/users`

## Deploy

### 1. Gerar Secrets

```bash
openssl rand -base64 32  # JWT_SECRET (usar o MESMO em Next.js e Java)
openssl rand -base64 32  # AUTH_SECRET
openssl rand -base64 32  # API_SECRET
```

### 2. Configurar .env.production

```bash
cp .env.production.example .env.production
```

Edite `.env.production`:

```env
# DEVEM SER IGUAIS no Next.js e Java
JWT_SECRET="seu-secret-aqui"

# URLs
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
NEXT_PUBLIC_API_URL=https://seu-dominio.com/api/v1

# OAuth (configurar nos consoles)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Database
DATABASE_URL="postgresql://user:pass@postgres:5432/tickets"
```

### 3. Configurar OAuth Callbacks

**Google Console:**
- Redirect URI: `https://seu-dominio.com/api/auth/callback/google`

**GitHub Settings:**
- Callback URL: `https://seu-dominio.com/api/auth/callback/github`

### 4. SSL/TLS

Descomentar bloco HTTPS no `nginx.conf` e adicionar certificados:

```bash
# Let's Encrypt
certbot certonly --nginx -d seu-dominio.com
```

Ou copiar certificados para `docker/nginx/ssl/`

### 5. Deploy

```bash
docker compose -f docker-compose.prod.yml up -d
```

### 6. Verificar

```bash
# Health checks
curl https://seu-dominio.com/actuator/health  # Java
curl https://seu-dominio.com/  # Next.js

# Testar login
# Abrir https://seu-dominio.com/login no navegador
```

## Fluxo de Autenticação

1. **Login OAuth** → Better Auth (Next.js) autentica com Google/GitHub/Microsoft
2. **Sync User** → Next.js envia dados para Java via `POST /auth/sync-user`
3. **Java Upsert** → Cria novo usuário ou atualiza existente
4. **JWT Token** → Next.js emite token JWT (validade 7 dias)
5. **Cliente** → Usa token em `Authorization: Bearer <token>` para chamar Java
6. **Java Valida** → `JwtAuthenticationFilter` valida token e processa requisição

## Troubleshooting

### 401 Unauthorized
- Token expirou → obter novo em `/api/auth/token`
- JWT_SECRET diferente entre Next.js e Java

### 403 Forbidden em /auth/sync-user
- API_SECRET incorreto
- Verificar headers `X-API-Secret`

### Erro CORS
- Verificar `nginx.conf` tem headers CORS no bloco `/api/v1/`

### OAuth callback failed
- URL de callback incorreta nos providers
- Deve ser: `https://dominio.com/api/auth/callback/{provider}`

## Estrutura de Arquivos Importantes

```
docker/
  nginx/
    nginx.conf          # Configuração de roteamento
    ssl/                # Certificados SSL
.env.production.example  # Template de variáveis
docker-compose.prod.yml  # Compose para produção
```

## Variáveis Críticas

| Variável | Onde Usar | Descrição |
|----------|-----------|-----------|
| `JWT_SECRET` | Next.js + Java | **DEVEM SER IGUAIS** - valida tokens |
| `AUTH_SECRET` | Next.js | Sessões Better Auth |
| `API_SECRET` | Next.js + Java | Protege endpoint sync-user |
| `NEXT_PUBLIC_API_URL` | Next.js | URL pública da API: `https://dominio.com/api/v1` |

## Comandos Úteis

```bash
# Logs
docker compose -f docker-compose.prod.yml logs -f

# Restart
docker compose -f docker-compose.prod.yml restart

# Stop
docker compose -f docker-compose.prod.yml down

# Rebuild
docker compose -f docker-compose.prod.yml up -d --build
```
