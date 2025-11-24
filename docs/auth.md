# 🔐 Autenticação

Sistema de autenticação híbrida do projeto Tickets Transporte Público.

## Visão Geral

O projeto utiliza uma **arquitetura híbrida** onde:

- **Next.js (Frontend)**: Gerencia sessões e cookies via **Better Auth**
- **Java (Backend)**: Valida credenciais e persiste usuários no PostgreSQL

## Fluxos de Autenticação

### 1. Email e Senha (Híbrido)

Next.js atua como proxy inteligente, delegando validação ao Java.

**Login:**
1. Frontend envia credenciais
2. Hook `before.signInEmail` intercepta e chama Java (`/auth/login`)
3. Se aprovado, injeta token mágico (`__VERIFIED_BY_JAVA__`)
4. Better Auth cria a sessão

**Registro:**
1. Hook `before.signUpEmail` intercepta
2. Chama Java (`/auth/register`)
3. Java cria usuário no PostgreSQL

### 2. OAuth Social (Google, GitHub, Microsoft)

Better Auth gerencia o handshake com o provedor OAuth.

**Fluxo:**
1. Better Auth completa login com provedor
2. Callback `onSignIn` é acionado
3. Chama Java (`/auth/sync-user`) para sincronizar usuário
4. Java retorna ID e Role corretos
5. Sessão local é atualizada

## Configuração OAuth

### Variáveis de Ambiente

Adicione ao `.env`:

```env
# JWT Secret (DEVE SER O MESMO EM JAVA E NEXT.JS!)
AUTH_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
JWT_SECRET=your-super-secret-key-change-this-in-production-min-32-chars

# Better Auth
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# GitHub OAuth (opcional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Microsoft OAuth (opcional)
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
```

### Configurar Provedores OAuth

#### Google

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Crie **OAuth client ID** (Web application)
3. Adicione URL de callback: `http://localhost:3000/api/auth/callback/google`
4. Copie Client ID e Secret para o `.env`

#### GitHub

1. Acesse: https://github.com/settings/developers
2. Clique em **New OAuth App**
3. Callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copie Client ID e Secret para o `.env`

#### Microsoft

1. Acesse: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps
2. Clique em **New registration**
3. Redirect URI: `http://localhost:3000/api/auth/callback/microsoft`
4. Crie um Client Secret em "Certificates & secrets"
5. Copie Application ID e Secret Value para o `.env`

## Segurança

- **JWT Assinatura**: Tokens assinados com `AUTH_SECRET`/`JWT_SECRET`
- **Issuer/Audience**: Verificação de origem do token
- **Endpoint Sync**: Requer header `X-Auth-Secret`
- **HTTPS**: Obrigatório em produção com cookies `Secure` e `HttpOnly`

## Uso no Frontend

```typescript
import { signIn, useSession } from "@/lib/auth.client";

// Login OAuth
await signIn.social({ provider: "google" });

// Verificar sessão
const { data: session } = useSession();

// Chamadas autenticadas ao backend
import { authenticatedGet } from "@/lib/auth.client";
const reports = await authenticatedGet("/reports");
```

## Uso no Backend

```java
@GetMapping("/my-reports")
public ResponseEntity<?> getMyReports(HttpServletRequest request) {
    String userId = (String) request.getAttribute("userId");
    String email = (String) request.getAttribute("userEmail");
    
    if (userId == null) {
        return ResponseEntity.status(401).body("Não autenticado");
    }
    
    return ResponseEntity.ok(reportService.findByUserId(userId));
}
```

### Controle de Acesso (Roles)

```java
import com.tickets.api.annotation.RequireRole;
import com.tickets.api.model.enums.UserRole;

@RequireRole({UserRole.ADMIN})
@GetMapping("/admin/users")
public ResponseEntity<?> listAllUsers() {
    // Apenas administradores
}
```

**Roles disponíveis:**
- `PEDESTRIAN`: Usuário padrão
- `ADMIN`: Administrador do sistema

## Arquitetura

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Usuário   │         │   Next.js    │         │ Backend     │
│             │         │ (Better Auth)│         │   Java      │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │  1. Login OAuth       │                        │
       ├──────────────────────>│                        │
       │                       │                        │
       │                       │  2. Sincroniza usuário │
       │                       ├───────────────────────>│
       │                       │                        │
       │                       │  3. Retorna user data  │
       │                       │<───────────────────────┤
       │                       │                        │
       │  4. Sessão criada     │                        │
       │<──────────────────────┤                        │
```

## Componentes

**Frontend:**
- `lib/auth.server.ts`: Configuração Better Auth
- `/api/auth/[...all]`: Rotas OAuth
- `/api/auth/token`: Gera JWT para comunicação com backend

**Backend:**
- `JwtValidator.java`: Valida tokens JWT
- `JwtAuthenticationFilter.java`: Intercepta requisições
- `AuthController.java`: Endpoints de autenticação

## Referências

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Microsoft OAuth](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
