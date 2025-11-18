# Autenticação com Email e Senha

## Visão Geral

O sistema agora suporta dois métodos de autenticação:
1. **OAuth** (Google, GitHub, Microsoft) - Existente
2. **Email e Senha** - Novo (adicionado nesta PR)

Ambos os métodos funcionam lado a lado sem interferência.

## Registro de Novo Usuário (Email/Senha)

### Frontend
```typescript
POST /api/v1/auth/register
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senhaSegura123"
}
```

### Backend
1. Valida dados de entrada (email válido, senha ≥ 8 caracteres)
2. Verifica se email já existe
3. Gera salt aleatório (16 bytes)
4. Cria hash BCrypt da senha + salt
5. Salva usuário com passwordHash e passwordSalt
6. Retorna JWT token válido por 7 dias

### Resposta
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": "uuid-do-usuario",
  "email": "joao@exemplo.com",
  "name": "João Silva",
  "role": "PEDESTRIAN"
}
```

## Login com Email/Senha

### Frontend
```typescript
POST /api/v1/auth/login
{
  "email": "joao@exemplo.com",
  "password": "senhaSegura123"
}
```

### Backend
1. Busca usuário por email
2. Verifica se usuário tem senha cadastrada (não é OAuth-only)
3. Verifica senha usando BCrypt com salt do usuário
4. Retorna JWT token válido por 7 dias

### Resposta
Mesma estrutura do registro.

## Segurança

### Hash de Senha
- **Algoritmo**: BCrypt
- **Força**: 12 rounds
- **Salt**: 16 bytes aleatórios por usuário
- **Processo**: `BCrypt(senha + salt)`

### Armazenamento
```sql
users (
  id VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255), -- Nullable para usuários OAuth
  password_salt VARCHAR(255), -- Nullable para usuários OAuth
  ...
)
```

### Token JWT
- **Emissor**: "tickets-frontend"
- **Audiência**: "tickets-backend"
- **Expiração**: 7 dias
- **Conteúdo**: userId, email, name, role

## Frontend - Fluxo de Autenticação

### LocalStorage
Após login/registro bem-sucedido:
```javascript
localStorage.setItem("auth_token", token);
localStorage.setItem("user_id", userId);
localStorage.setItem("user_email", email);
localStorage.setItem("user_name", name);
localStorage.setItem("user_role", role);
```

### Hook useAuth
O hook `useAuth()` verifica:
1. Primeiro: sessão OAuth (Better Auth)
2. Segundo: token no localStorage
3. Retorna o primeiro disponível

### Logout
```javascript
// Limpa localStorage
localStorage.removeItem("auth_token");
localStorage.removeItem("user_id");
localStorage.removeItem("user_email");
localStorage.removeItem("user_name");
localStorage.removeItem("user_role");

// Limpa Better Auth (se OAuth)
await betterAuthSignOut();
```

## Chamadas à API

### Com Token Email/Senha
O token é incluído automaticamente nas requisições:

```javascript
const token = localStorage.getItem("auth_token");
const response = await fetch(`${API_URL}/endpoint`, {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
});
```

### Com Token OAuth
Funciona da mesma forma, usando o token gerado pelo Better Auth.

## UI do Login

A interface possui duas abas:

### Aba "Entrar"
- Campo: Email
- Campo: Senha
- Botão: Entrar
- Separador: "Ou continue com"
- Botões OAuth: Google, GitHub, Microsoft

### Aba "Criar Conta"
- Campo: Nome Completo
- Campo: Email
- Campo: Senha (mín. 8 caracteres)
- Botão: Criar Conta
- Separador: "Ou continue com"
- Botões OAuth: Google, GitHub, Microsoft

## Compatibilidade

### Usuários Existentes (OAuth)
- Podem continuar usando OAuth normalmente
- passwordHash e passwordSalt são NULL
- Tentativa de login com email/senha retorna erro apropriado

### Novos Usuários
- Podem escolher OAuth ou Email/Senha
- Não podem misturar métodos (um email = um método)

## Validações

### Backend (Spring Validation)
```java
@NotBlank(message = "Nome é obrigatório")
@Size(min = 2, max = 100)
String name;

@NotBlank(message = "Email é obrigatório")
@Email(message = "Email deve ser válido")
String email;

@NotBlank(message = "Senha é obrigatória")
@Size(min = 8, max = 100)
String password;
```

### Frontend (HTML5 + React)
- `type="email"`: Valida formato de email
- `minLength={8}`: Valida tamanho mínimo da senha
- `required`: Campos obrigatórios

## Mensagens de Erro

### Email já cadastrado
```json
{
  "error": "Email já cadastrado"
}
```

### Email ou senha inválidos
```json
{
  "error": "Email ou senha inválidos"
}
```

### Campos inválidos
```json
{
  "error": "Senha deve ter entre 8 e 100 caracteres"
}
```

## Testes

### PasswordServiceTest (6 testes)
- ✅ Geração de salt único
- ✅ Hash de senha
- ✅ Verificação de senha correta
- ✅ Rejeição de senha incorreta
- ✅ Salts diferentes = hashes diferentes
- ✅ Senhas diferentes = hashes diferentes

### UserServiceEmailPasswordTest (6 testes)
- ✅ Registro com sucesso
- ✅ Erro se email já existe
- ✅ Login com sucesso
- ✅ Erro se usuário não existe
- ✅ Erro se senha incorreta
- ✅ Erro se usuário OAuth tenta login com senha

## Variáveis de Ambiente

### Backend (.env ou application.properties)
```properties
JWT_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
```

### Frontend (.env)
```env
JWT_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**IMPORTANTE**: JWT_SECRET deve ser o mesmo no frontend e backend para validação de tokens.
