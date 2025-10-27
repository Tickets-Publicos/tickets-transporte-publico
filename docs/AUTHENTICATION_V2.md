# Nova Arquitetura de Autenticação

## 🎯 Visão Geral

A nova arquitetura implementa comunicação direta entre o cliente e o backend Java usando JWTs, com o Next.js atuando como servidor de autenticação.

**Princípio-chave**: O backend Java é a fonte da verdade. Next.js sempre envia dados do usuário para o Java, que decide se cria novo usuário ou atualiza existente (upsert).

## 🏗️ Arquitetura

```
┌─────────────┐
│   Cliente   │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Login OAuth
       ▼
┌─────────────┐
│  Next.js    │
│ Better Auth │
└──────┬──────┘
       │
       │ 2. Emite JWT
       ▼
┌─────────────┐
│   Cliente   │ ──────3. API Requests────► ┌─────────────┐
│ (com token) │                              │ Java Backend│
└─────────────┘ ◄────4. Responses────────── └─────────────┘
```

### Fluxo de Autenticação

1. **Login OAuth**: Usuário faz login via Google/GitHub no Next.js
2. **Better Auth**: Next.js cria sessão em memória
3. **Solicita JWT**: Cliente chama `/api/auth/token`
4. **Sincroniza Usuário**: Next.js sempre envia dados para o backend, que decide criar ou atualizar (upsert)
5. **Emite JWT**: Next.js gera JWT assinado válido por 7 dias
6. **Cliente Armazena**: Token fica em cache no cliente
7. **Requisições Diretas**: Cliente usa o JWT para chamar o backend Java diretamente
8. **Validação**: Backend valida JWT e autoriza requisições

## 📁 Arquivos Implementados

### Backend Java

#### `JwtAuthenticationFilter.java`
Filtro que intercepta TODAS as requisições HTTP e valida tokens JWT:

```java
// Extrai token do header Authorization: Bearer <token>
// Valida assinatura, issuer, audience
// Adiciona atributos do usuário (userId, email, role) à requisição
```

#### `FilterConfig.java`
Registra o filtro JWT para processar todas as URLs.

#### `JwtValidator.java` (já existia)
Valida e decodifica JWTs usando a mesma chave secreta do Next.js.

### Frontend Next.js

#### `/api/auth/token/route.ts`
Endpoint que gera JWTs para o cliente:

```typescript
GET /api/auth/token
Response: { token: "eyJhbGc..." }
```

- Verifica sessão Better Auth
- Sincroniza usuário no backend (sempre envia para upsert)
- Busca role do usuário
- Gera JWT válido por 7 dias

#### `lib/auth.server.ts`

Funções server-side:

- `generateBackendToken()`: Gera JWT com claims userId, email, name, role
- `syncUserToBackend()`: Sincroniza usuário no backend (sempre envia, backend decide criar ou atualizar)
- `getUserRole()`: Busca role do usuário no backend

#### `lib/auth.client.ts`
Funções client-side:

- `getBackendToken()`: Solicita JWT do servidor (com cache de 6 dias)
- `clearTokenCache()`: Limpa o cache do token

#### `hooks/use-backend-token.ts`
Hook React para obter o token:

```tsx
const { token, loading, error } = useBackendToken();
```

#### `hooks/use-authenticated-fetch.ts`
Hook para fazer requisições autenticadas:

```tsx
const { fetchWithAuth, loading, isReady } = useAuthenticatedFetch();

// GET
const users = await fetchWithAuth('/users');

// POST
const newUser = await fetchWithAuth('/users', {
  method: 'POST',
  body: JSON.stringify({ name: 'John' })
});
```

#### `hooks/use-auth.ts` (atualizado)
Agora limpa o cache do token no logout:

```tsx
const { user, isAuthenticated, signOut } = useAuth();
```

#### `middleware.ts` (simplificado)
Removida a lógica de sincronização - agora apenas passa as requisições adiante.

## 🚀 Como Usar

### 1. Em Componentes React

```tsx
"use client";

import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch";
import { useEffect, useState } from "react";

export function UsersListComponent() {
  const { fetchWithAuth, loading, isReady } = useAuthenticatedFetch();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (isReady) {
      fetchWithAuth('/users')
        .then(setUsers)
        .catch(console.error);
    }
  }, [isReady]);

  if (loading) return <div>Carregando...</div>;
  
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

### 2. Criar um Novo Report

```tsx
const { fetchWithAuth } = useAuthenticatedFetch();

async function createReport(data) {
  try {
    const newReport = await fetchWithAuth('/reports', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    console.log('Report criado:', newReport);
  } catch (error) {
    console.error('Erro:', error);
  }
}
```

### 3. Requisições com Diferentes Métodos

```tsx
// GET
const users = await fetchWithAuth('/users');

// POST
const created = await fetchWithAuth('/users', {
  method: 'POST',
  body: JSON.stringify({ name: 'João', email: 'joao@example.com' })
});

// PUT
const updated = await fetchWithAuth('/users/123', {
  method: 'PUT',
  body: JSON.stringify({ name: 'João Silva' })
});

// DELETE
await fetchWithAuth('/users/123', { method: 'DELETE' });
```

## 🔒 Segurança

### JWT Claims

O token inclui:
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "PEDESTRIAN",
  "iat": 1234567890,
  "exp": 1234567890,
  "iss": "tickets-frontend",
  "aud": "tickets-backend"
}
```

### Validação no Backend

O filtro `JwtAuthenticationFilter` valida:
- ✅ Assinatura usando JWT_SECRET
- ✅ Issuer = "tickets-frontend"
- ✅ Audience = "tickets-backend"
- ✅ Expiração (7 dias)

### Atributos da Requisição

Após validação, o filtro adiciona à requisição:
```java
request.getAttribute("userId")     // String
request.getAttribute("userEmail")  // String
request.getAttribute("userRole")   // String
```

## 📊 Benefícios da Nova Arquitetura

### ✅ Vantagens

1. **Backend é a fonte da verdade**: Java decide sobre criação/atualização de usuários
2. **Upsert automático**: Não precisa verificar se usuário existe antes de sincronizar
3. **Performance**: Cliente faz requisições diretas ao backend Java (sem proxy pelo Next.js)
4. **Escalabilidade**: Backend Java pode escalar independentemente
5. **Segurança**: JWT assinado e validado com claims específicos
6. **Cache**: Token válido por 7 dias, reduz chamadas ao Next.js
7. **Simplicidade**: Next.js apenas envia dados, Java decide o que fazer
8. **Consistência**: Lógica de negócio centralizada no backend

### 🔄 Fluxo de Upsert no Backend

Quando o Next.js envia dados do usuário para `POST /auth/sync-user`:

#### Primeiro Login (Usuário Novo)
```java
// UserService.syncOAuthUser()
User user = userRepository.findByEmail(email).orElse(null);

if (user == null) {
  // ✨ Cria novo usuário
  user = User.builder()
    .email(email)
    .name(name)
    .role(UserRole.PEDESTRIAN)  // Role padrão
    .build();
}

return userRepository.save(user);
```

#### Login Subsequente (Atualiza Dados)
```java
// UserService.syncOAuthUser()
User user = userRepository.findByEmail(email).orElse(null);

if (user != null) {
  // ✏️ Atualiza nome (pode ter mudado no OAuth provider)
  user.setName(name);
}

return userRepository.save(user);
```

**Resultado**: Backend sempre tem dados atualizados, sem duplicação de usuários.

### 🎯 Casos de Uso

- ✅ APIs RESTful do backend Java
- ✅ Upload de arquivos direto para Java
- ✅ WebSocket autenticado
- ✅ Requisições em paralelo
- ✅ Requisições de longa duração

## 🧪 Testando

1. **Faça login** via Google OAuth
2. **Abra o DevTools** (F12) → Network tab
3. **Navegue para o dashboard**
4. **Observe**: Verá chamada para `/api/auth/token` retornando JWT
5. **Veja requisições** para `localhost:8080` com header `Authorization: Bearer eyJhbGc...`

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
AUTH_SECRET=your-secret-key-change-in-production-min-32-chars
JWT_SECRET=your-secret-key-change-in-production-min-32-chars

NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**Importante**: `AUTH_SECRET` e `JWT_SECRET` devem ser iguais!

## 🐛 Troubleshooting

### Token não é gerado

- Verifique se está logado (Better Auth session)
- Veja logs no servidor Next.js

### 401 Unauthorized no backend

- Verifique se JWT_SECRET é igual no Next.js e Java
- Veja logs do `JwtAuthenticationFilter`
- Confirme que header `Authorization: Bearer <token>` está presente

### Token expirado

- Token expira em 7 dias
- Cache expira em 6 dias
- Faça logout e login novamente

## 📝 TODO

- [ ] Implementar refresh token
- [ ] Adicionar rate limiting
- [ ] Implementar revogação de tokens
- [ ] Adicionar métricas de uso
- [ ] Criar testes unitários para JwtAuthenticationFilter
