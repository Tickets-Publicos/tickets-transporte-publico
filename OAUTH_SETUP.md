# 🔐 Configuração OAuth - Better Auth

## 📋 Pré-requisitos

Adicione as seguintes variáveis ao seu arquivo `.env` na raiz do projeto:

```bash
# Better Auth Configuration
AUTH_SECRET=sua-chave-secreta-minimo-32-caracteres-alterar-em-producao
BETTER_AUTH_URL=http://localhost:3000

# OAuth Providers (Configure pelo menos um)
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret

GITHUB_CLIENT_ID=seu-github-client-id
GITHUB_CLIENT_SECRET=seu-github-client-secret

MICROSOFT_CLIENT_ID=seu-microsoft-client-id
MICROSOFT_CLIENT_SECRET=seu-microsoft-client-secret
```

---

## 🔧 Como Configurar cada Provider

### 1️⃣ Google OAuth

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Crie um novo projeto ou selecione um existente
3. Vá em **"Credentials"** → **"Create Credentials"** → **"OAuth client ID"**
4. Configure a tela de consentimento se solicitado
5. Tipo de aplicação: **Web application**
6. Adicione as URLs de redirecionamento:
   ```
   http://localhost:3000/api/auth/callback/google
   http://localhost:3000
   ```
7. Copie o **Client ID** e **Client Secret**
8. Cole no `.env`:
   ```bash
   GOOGLE_CLIENT_ID=seu-client-id-aqui
   GOOGLE_CLIENT_SECRET=seu-client-secret-aqui
   ```

---

### 2️⃣ GitHub OAuth

1. Acesse: https://github.com/settings/developers
2. Clique em **"New OAuth App"**
3. Preencha:
   - **Application name**: Tickets Transporte Público
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Clique em **"Register application"**
5. Copie o **Client ID**
6. Clique em **"Generate a new client secret"** e copie
7. Cole no `.env`:
   ```bash
   GITHUB_CLIENT_ID=seu-client-id-aqui
   GITHUB_CLIENT_SECRET=seu-client-secret-aqui
   ```

---

### 3️⃣ Microsoft OAuth

1. Acesse: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps
2. Clique em **"New registration"**
3. Preencha:
   - **Name**: Tickets Transporte Público
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: Web → `http://localhost:3000/api/auth/callback/microsoft`
4. Clique em **"Register"**
5. Copie o **Application (client) ID**
6. Vá em **"Certificates & secrets"** → **"New client secret"**
7. Adicione uma descrição e validade, clique em **"Add"**
8. Copie o **Value** (não o Secret ID!)
9. Cole no `.env`:
   ```bash
   MICROSOFT_CLIENT_ID=seu-client-id-aqui
   MICROSOFT_CLIENT_SECRET=seu-client-secret-aqui
   ```

---

## 🔑 Gerar AUTH_SECRET

Use um dos comandos abaixo para gerar uma chave secreta segura:

**Node.js:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**PowerShell:**

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**OpenSSL:**

```bash
openssl rand -base64 32
```

Cole o resultado no `.env`:

```bash
AUTH_SECRET=sua-chave-gerada-aqui
```

---

## ✅ Verificação

Após configurar pelo menos um provider:

1. Reinicie o servidor Next.js:

   ```bash
   pnpm dev
   ```

2. Acesse: http://localhost:3000

3. Clique em **"Entrar"** e teste o login com o provider configurado

4. Você deve ser redirecionado para autenticação e retornar logado

---

## 🔴 Solução de Problemas

### Erro: "Provider not found"

- ✅ Verifique se as variáveis estão no `.env` correto (raiz do projeto)
- ✅ Reinicie o servidor Next.js após adicionar variáveis
- ✅ Verifique se não há espaços extras nas variáveis

### Erro: "Invalid client"

- ✅ Verifique se copiou Client ID e Secret corretamente
- ✅ Confirme as URLs de callback nos consoles dos providers
- ✅ Aguarde alguns minutos após criar as credenciais

### Erro: "Redirect URI mismatch"

- ✅ Verifique se a URL de callback está exatamente como configurada
- ✅ Para Google: `http://localhost:3000/api/auth/callback/google`
- ✅ Para GitHub: `http://localhost:3000/api/auth/callback/github`
- ✅ Para Microsoft: `http://localhost:3000/api/auth/callback/microsoft`

---

## 📦 Configuração Mínima (Apenas Google)

Se quiser testar rapidamente com apenas Google:

```bash
# .env (configuração mínima)
AUTH_SECRET=sua-chave-secreta-minimo-32-caracteres
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
```

Os botões de GitHub e Microsoft aparecerão desabilitados automaticamente se não configurados.

---

## 🚀 Produção

Para deploy em produção:

1. Adicione as mesmas variáveis no seu serviço de hosting (Vercel, Railway, etc.)
2. Atualize `BETTER_AUTH_URL` para sua URL de produção:
   ```bash
   BETTER_AUTH_URL=https://seu-dominio.com
   ```
3. Adicione as URLs de callback de produção nos consoles dos providers:
   ```
   https://seu-dominio.com/api/auth/callback/google
   https://seu-dominio.com/api/auth/callback/github
   https://seu-dominio.com/api/auth/callback/microsoft
   ```

---

## 📚 Documentação Oficial

- Better Auth: https://www.better-auth.com/docs
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- GitHub OAuth: https://docs.github.com/en/developers/apps/building-oauth-apps
- Microsoft OAuth: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow
