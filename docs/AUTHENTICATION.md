# Arquitetura de Autenticação

## Visão Geral

Este projeto usa **Better Auth** no Next.js para autenticação OAuth (Google, GitHub, Microsoft) e comunicação segura com o backend Java via JWT.

## Fluxo de Autenticação

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Usuário   │         │   Next.js    │         │ Backend     │
│             │         │ (Better Auth)│         │   Java      │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │  1. Login OAuth       │                        │
       ├──────────────────────>│                        │
       │                       │                        │
       │  2. Redireciona       │                        │
       │     para provider     │                        │
       │<──────────────────────┤                        │
       │                       │                        │
       │  3. Callback OAuth    │                        │
       ├──────────────────────>│                        │
       │                       │                        │
       │                       │  4. Sincroniza usuário │
       │                       ├───────────────────────>│
       │                       │    (POST /auth/sync-user)
       │                       │                        │
       │                       │  5. Cria/atualiza user │
       │                       │<───────────────────────┤
       │                       │                        │
       │  6. Sessão criada     │                        │
       │<──────────────────────┤                        │
       │                       │                        │
       │  7. Requisição API    │                        │
       ├──────────────────────>│                        │
       │                       │                        │
       │                       │  8. Gera JWT           │
       │                       │  (GET /api/auth/token) │
       │                       │                        │
       │  9. JWT token         │                        │
       │<──────────────────────┤                        │
       │                       │                        │
       │  10. Chamada com JWT  │                        │
       │───────────────────────┼───────────────────────>│
       │       Authorization: Bearer <JWT>              │
       │                       │                        │
       │                       │  11. Valida JWT        │
       │                       │                        │
       │  12. Resposta         │                        │
       │<──────────────────────┼────────────────────────┤
       │                       │                        │
```

## Componentes

### 1. Frontend (Next.js)

#### Better Auth Configuration (`lib/auth.server.ts`)

- Configura OAuth providers (Google, GitHub, Microsoft)
- Usa JWT para sessões (sem banco de dados)
- Callback `onSignIn` notifica o backend quando um novo usuário faz login

#### Auth Client (`lib/auth.client.ts`)

- Exporta funções do Better Auth: `signIn`, `signUp`, `signOut`, `useSession`
- `getBackendToken()`: Obtém JWT para comunicação com backend
- `authenticatedFetch()`: Helper para fazer chamadas autenticadas ao backend
- Helpers: `authenticatedGet`, `authenticatedPost`, `authenticatedPut`, `authenticatedDelete`

#### API Routes

- `/api/auth/[...all]`: Rotas do Better Auth (OAuth callbacks, etc)
- `/api/auth/token`: Gera JWT assinado para comunicação com backend

### 2. Backend (Java/Spring Boot)

#### JwtValidator (`config/JwtValidator.java`)

- Valida tokens JWT gerados pelo Next.js
- Verifica assinatura, issuer e audience
- Extrai informações do usuário (userId, email)

#### JwtAuthenticationFilter (`filter/JwtAuthenticationFilter.java`)

- Intercepta todas as requisições
- Extrai e valida o token do header `Authorization: Bearer <token>`
- Adiciona autenticação ao contexto do Spring Security
- Adiciona `userId` e `userEmail` como atributos da request

#### AuthController (`controller/AuthController.java`)

- `POST /auth/sync-user`: Sincroniza usuário OAuth com o banco de dados
- `GET /auth/me`: Endpoint de teste para verificar autenticação

## Configuração

### Variáveis de Ambiente

#### Next.js (`apps/web/.env.local`)

```env
# URLs
NEXT_PUBLIC_API_URL=http://localhost:8080/api
BETTER_AUTH_URL=http://localhost:3000

# JWT Secret (DEVE SER O MESMO NO BACKEND!)
AUTH_SECRET=your-super-secret-key-change-this-in-production-min-32-chars

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (opcional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Microsoft OAuth (opcional)
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

#### Backend Java (`.env` na raiz ou variáveis de ambiente)

```env
# JWT Secret (DEVE SER O MESMO DO NEXT.JS!)
JWT_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
```

## Segurança

### 1. JWT Assinatura

- Tokens são assinados com `AUTH_SECRET`/`JWT_SECRET`
- Backend valida a assinatura antes de aceitar o token
- Tokens expiram em 7 dias

### 2. Issuer e Audience

- JWT inclui `issuer: "tickets-frontend"` e `audience: "tickets-backend"`
- Backend verifica ambos os campos

### 3. Sincronização de Usuários

- Endpoint `/auth/sync-user` requer header `X-Auth-Secret`
- Apenas o Next.js pode sincronizar usuários

### 4. HTTPS em Produção

- **SEMPRE** use HTTPS em produção
- Configure `useSecureCookies: true` no Better Auth
- Cookies com flags `Secure` e `HttpOnly`

## Uso no Frontend

### Fazer Login

```typescript
import { signIn } from "@/lib/auth.client";

// Login com Google
await signIn.social({ provider: "google" });

// Login com GitHub
await signIn.social({ provider: "github" });

// Login com Microsoft
await signIn.social({ provider: "microsoft" });
```

### Verificar Sessão

```typescript
import { useSession } from "@/lib/auth.client";

function MyComponent() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Carregando...</div>;
  if (!session) return <div>Não autenticado</div>;

  return <div>Bem-vindo, {session.user.name}!</div>;
}
```

### Fazer Chamadas Autenticadas ao Backend

```typescript
import { authenticatedGet, authenticatedPost } from "@/lib/auth.client";

// GET
const reports = await authenticatedGet("/reports");

// POST
const newReport = await authenticatedPost("/reports", {
  title: "Problema no ônibus",
  description: "...",
});
```

## Uso no Backend

### Acessar Informações do Usuário

```java
@GetMapping("/my-reports")
public ResponseEntity<?> getMyReports(HttpServletRequest request) {
    String userId = (String) request.getAttribute("userId");
    String email = (String) request.getAttribute("userEmail");
    String userRole = (String) request.getAttribute("userRole");

    if (userId == null) {
        return ResponseEntity.status(401).body("Não autenticado");
    }

    // Buscar reports do usuário
    var reports = reportService.findByUserId(userId);
    return ResponseEntity.ok(reports);
}
```

### Controle de Acesso por Roles

#### Usando a Anotação `@RequireRole`

```java
import com.tickets.api.annotation.RequireRole;
import com.tickets.api.model.enums.UserRole;

@RestController
@RequestMapping("/admin")
public class AdminController {

    // Apenas administradores podem acessar
    @RequireRole({UserRole.ADMIN})
    @GetMapping("/users")
    public ResponseEntity<?> listAllUsers() {
        // ...
    }

    // Múltiplas roles (exemplo para futuras roles)
    @RequireRole({UserRole.ADMIN, UserRole.MODERATOR})
    @DeleteMapping("/reports/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable Long id) {
        // ...
    }
}
```

#### Verificação Manual de Role

```java
@GetMapping("/reports")
public ResponseEntity<?> getReports(HttpServletRequest request) {
    String userId = (String) request.getAttribute("userId");
    String userRole = (String) request.getAttribute("userRole");

    if (userId == null) {
        return ResponseEntity.status(401).body("Não autenticado");
    }

    if ("ADMIN".equals(userRole)) {
        // Admin vê todos os reports
        return ResponseEntity.ok(reportService.findAll());
    } else {
        // Usuário comum vê apenas seus reports
        return ResponseEntity.ok(reportService.findByUserId(userId));
    }
}
```

#### Roles Disponíveis

- `UserRole.PEDESTRIAN`: Usuário padrão (atribuído automaticamente no primeiro login)
- `UserRole.ADMIN`: Administrador do sistema

**Nota**: Para promover um usuário a admin, atualize diretamente no banco de dados:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'usuario@email.com';
```

## Testando

### 1. Teste de Autenticação

```bash
# 1. Faça login no frontend
# 2. Abra o DevTools e execute:
const token = await (await fetch("/api/auth/token")).json();
console.log(token.token);

# 3. Use o token para chamar o backend:
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/auth/me
```

### 2. Teste de Sincronização de Usuário

- Faça login com um novo usuário OAuth
- Verifique os logs do backend Java para ver a chamada ao `/auth/sync-user`
- Verifique se o usuário foi criado no banco de dados

## Próximos Passos

- [x] Implementar `UserService.syncOAuthUser()` no backend
- [x] Adicionar roles/permissões ao JWT
- [ ] Configurar refresh tokens
- [ ] Adicionar rate limiting
- [ ] Configurar CORS adequadamente
- [ ] Adicionar logs de auditoria
- [ ] Implementar logout no backend
- [ ] Adicionar testes unitários e de integração
