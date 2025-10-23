# Configuração de Variáveis de Ambiente

Este projeto usa um **arquivo `.env` centralizado** na raiz do monorepo. Todas as variáveis definidas neste arquivo são automaticamente compartilhadas com todos os workspaces (api-java, web, etc.).

## 📁 Estrutura

```
tickets-transporte-publico/
├── .env                    # ✅ Arquivo de configuração centralizado
├── .env.example            # 📋 Template com todas as variáveis disponíveis
├── apps/
│   ├── api-java/          # Usa as variáveis do .env da raiz
│   └── web/               # Usa as variáveis do .env da raiz
└── ...
```

## 🚀 Como usar

### 1. Primeira configuração

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
# Ajuste as variáveis conforme necessário (senhas, URLs, etc.)
```

### 2. Executar o projeto

```bash
# Todas as variáveis do .env são automaticamente carregadas
pnpm dev
```

## 🔧 Como funciona

### Para o Next.js (apps/web)
- O Next.js **automaticamente** carrega o arquivo `.env` da raiz do projeto
- Variáveis com prefixo `NEXT_PUBLIC_` ficam disponíveis no lado do cliente
- Outras variáveis ficam disponíveis apenas no servidor

### Para o Spring Boot (apps/api-java)
- O script `mvnw.ps1` carrega automaticamente as variáveis do `.env` da raiz
- As variáveis são passadas para o Maven que as disponibiliza para o Spring Boot
- O Spring Boot lê automaticamente variáveis de ambiente

### Turbo (Turborepo)
- O arquivo `turbo.json` declara as variáveis em `globalEnv`
- Isso garante que o cache do Turbo seja invalidado quando as variáveis mudam
- As variáveis são propagadas para todos os workspaces

## 📝 Variáveis Importantes

### Database
```env
POSTGRES_DB=tickets
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tickets
```

### Spring Boot
```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/tickets
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080
```

### Next.js
```env
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## 🔒 Segurança

- ⚠️ **NUNCA** faça commit do arquivo `.env` (já está no .gitignore)
- ✅ Mantenha o `.env.example` atualizado como template
- 🔐 Use valores diferentes em produção
- 🚫 Não compartilhe senhas ou secrets em commits

## 🐛 Troubleshooting

### Variável não está sendo reconhecida

1. Verifique se a variável está no arquivo `.env` da raiz
2. Confira se não há erros de sintaxe (sem espaços antes do `=`)
3. Para o Spring Boot, certifique-se que a variável está no formato correto (`SPRING_DATASOURCE_URL`, não `spring.datasource.url`)
4. Para o Next.js no cliente, use o prefixo `NEXT_PUBLIC_`

### Variável mudou mas não está sendo aplicada

```bash
# Reinicie o servidor de desenvolvimento
# Ctrl+C para parar
pnpm dev
```

### Verificar se as variáveis estão sendo carregadas

```bash
# No PowerShell
echo $env:SPRING_DATASOURCE_URL

# No bash/zsh
echo $SPRING_DATASOURCE_URL
```

## 📚 Referências

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Spring Boot Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- [Turborepo Environment Variables](https://turbo.build/repo/docs/core-concepts/caching#environment-variables)
