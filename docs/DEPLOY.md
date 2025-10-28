# 🚀 Guia Completo de Deploy

Sistema de deploy automatizado com GitHub Actions, Docker Compose e Rolling Updates (zero downtime).

## 📋 Índice

- [Quick Start](#-quick-start)
- [Configuração Inicial](#-configuração-inicial)
- [Deploy](#-deploy)
- [Comandos Úteis](#-comandos-úteis)
- [Troubleshooting](#-troubleshooting)

---

## ⚡ Quick Start

### 1. Setup do Servidor (uma vez)

```bash
# No servidor de produção
sudo bash setup-server.sh
```

### 2. Configurar Secrets no GitHub

`Settings > Secrets and variables > Actions`

| Secret           | Valor                                                       |
| ---------------- | ----------------------------------------------------------- |
| `DEPLOY_SSH_KEY` | Chave privada SSH (`/home/cicdbot/.ssh/id_ed25519`)         |
| `DEPLOY_HOST`    | IP ou hostname do servidor                                  |
| `DEPLOY_USER`    | `cicdbot`                                                   |
| `ENV_PRODUCTION` | Conteúdo completo do `.env` (ver `.env.production.example`) |

### 3. Fazer Deploy

1. `Actions > CI/CD Pipeline > Run workflow`
2. Marcar ☑️ **Deploy to production**
3. `Run workflow`

---

## 🔧 Configuração Inicial

### Pré-requisitos no Servidor

- Ubuntu 20.04+ (ou similar)
- Docker 20.10+
- Docker Compose 2.0+
- Usuário `cicdbot` com permissões Docker

### Setup Automatizado do Servidor

O script `setup-server.sh` faz:

- ✅ Instala Docker e dependências
- ✅ Cria usuário `cicdbot`
- ✅ Configura SSH e firewall
- ✅ Prepara estrutura `/home/cicdbot`

```bash
# Executar como root
sudo bash setup-server.sh
```

Após execução, copie a chave SSH:

```bash
# Chave PRIVADA (para GitHub Secret)
sudo cat /home/cicdbot/.ssh/id_ed25519

# Chave PÚBLICA (informativo)
sudo cat /home/cicdbot/.ssh/id_ed25519.pub
```

### Preparar arquivo .env

1. Copie `.env.production.example`
2. Preencha todos os valores `CHANGE_ME_*`
3. Adicione conteúdo completo como secret `ENV_PRODUCTION` no GitHub

**Variáveis essenciais:**

```env
POSTGRES_USER=tickets_prod
POSTGRES_PASSWORD=senha_forte_aqui
DATABASE_URL=postgresql://tickets_prod:senha@postgres:5432/tickets_production
JWT_SECRET=chave_jwt_min_64_chars
NEXT_PUBLIC_API_URL=https://seu-dominio.com/api
REGISTRY=ghcr.io
REPO_OWNER=seu-usuario-github-lowercase
```

---

## 🚀 Deploy

### Como Funciona

**Fluxo:**

```
GitHub Actions → SSH → Copiar arquivos → Criar .env → Executar deploy.sh
                                                        ↓
                                           Login GHCR → Pull imagens
                                                        ↓
                                           Escalar réplicas (2x)
                                                        ↓
                                           Rolling update
                                                        ↓
                                           Health checks → Cleanup
```

**Características:**

- 🔄 **Zero Downtime**: Réplicas mantém serviço durante atualização
- 📝 **Logs**: Tudo registrado em `/home/cicdbot/deploy.log`
- 🏥 **Health Checks**: Aguarda serviços ficarem saudáveis
- 🔒 **Seguro**: `.env` criado da secret, nunca commitado

### Rolling Update (Zero Downtime)

```
Estado Inicial:
web_1 (v1.0)  ← rodando

Deploy:
1. Escala para 2: web_1 (v1.0), web_2 (v1.0)
2. Pull v2.0
3. Atualiza: web_1 fica (v1.0), sobe web_3 (v2.0)
4. Health check v2.0 OK
5. Derruba v1.0, sobe web_4 (v2.0)

Estado Final:
web_4 (v2.0)  ← atualizado

✅ Sempre há pelo menos 1 instância respondendo!
```

### Estrutura no Servidor

```
/home/cicdbot/
├── deploy.sh                # Script de deploy (copiado)
├── deploy.log               # Log de operações
├── docker-compose.prod.yml  # Config produção (copiado)
└── .env                     # Variáveis (criado da secret)
```

---

## 💻 Comandos Úteis

### No Servidor

```bash
# Conectar
ssh cicdbot@SEU_SERVIDOR

# Navegar
cd /home/cicdbot

# Deploy completo
./deploy.sh deploy

# Ver status
./deploy.sh ps
docker compose -f docker-compose.prod.yml ps

# Ver logs
./deploy.sh logs
./deploy.sh logs web
tail -f deploy.log

# Parar tudo
./deploy.sh down

# Apenas pull
./deploy.sh pull
```

### Docker Compose

```bash
cd /home/cicdbot

# Logs em tempo real
docker compose -f docker-compose.prod.yml logs -f --tail=50

# Restart serviço específico
docker compose -f docker-compose.prod.yml restart web

# Recriar serviço
docker compose -f docker-compose.prod.yml up -d --force-recreate web

# Escalar
docker compose -f docker-compose.prod.yml up -d --scale web=3

# Recursos
docker compose -f docker-compose.prod.yml stats

# Executar comando
docker compose -f docker-compose.prod.yml exec web sh
docker compose -f docker-compose.prod.yml exec postgres psql -U tickets_prod
```

### Monitoramento

```bash
# Health checks
docker compose -f docker-compose.prod.yml ps --format json | \
  jq -r '.[] | "\(.Service): \(.Health)"'

# Uso de recursos
docker stats --no-stream

# Espaço em disco
docker system df
df -h

# Logs de erro
grep -i error deploy.log
docker compose -f docker-compose.prod.yml logs | grep ERROR
```

### Backup e Restore

```bash
# Backup banco
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U tickets_prod tickets_production > backup_$(date +%Y%m%d).sql

# Restore banco
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U tickets_prod tickets_production < backup.sql

# Backup completo
tar -czf backup_$(date +%Y%m%d).tar.gz \
  docker-compose.prod.yml .env deploy.log
```

### Limpeza

```bash
# Limpar containers parados
docker container prune -f

# Limpar imagens não usadas
docker image prune -f

# Limpeza completa (cuidado!)
docker system prune -af

# Ver espaço usado
docker system df
```

---

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs SERVICO

# Recriar
docker compose -f docker-compose.prod.yml up -d --force-recreate SERVICO

# Verificar .env
cat .env | grep VARIAVEL
```

### Banco não conecta

```bash
# Status
docker compose -f docker-compose.prod.yml ps postgres

# Logs
docker compose -f docker-compose.prod.yml logs postgres

# Conectar
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U tickets_prod -d tickets_production

# Variáveis
docker compose -f docker-compose.prod.yml exec postgres env | grep POSTGRES
```

### Deploy falha

```bash
# Ver log
tail -100 deploy.log

# Docker rodando?
sudo systemctl status docker

# Espaço em disco?
df -h

# Memória?
free -h

# Containers falhados
docker ps -a --filter "status=exited"
```

### Imagens não baixam

```bash
# Login manual
echo "TOKEN" | docker login ghcr.io -u USUARIO --password-stdin

# Pull manual
docker compose -f docker-compose.prod.yml pull

# Limpar cache
docker system prune -f
docker compose -f docker-compose.prod.yml pull
```

### Sem espaço em disco

```bash
# Ver uso
df -h
docker system df

# Limpeza
docker system prune -af --volumes
sudo journalctl --vacuum-time=7d

# Logs grandes
find /var/lib/docker/containers -name "*.log" -exec ls -lh {} \;
```

### Permissões

```bash
# Corrigir diretório
sudo chown -R cicdbot:cicdbot /home/cicdbot

# Corrigir script
chmod +x /home/cicdbot/deploy.sh

# Corrigir .env
chmod 600 /home/cicdbot/.env

# Verificar grupos
groups cicdbot

# Adicionar ao docker
sudo usermod -aG docker cicdbot
# Depois: logout e login
```

### SSH não conecta

```bash
# Testar conexão
ssh -v cicdbot@SERVIDOR

# Testar porta
nc -zv SERVIDOR 22

# Ver logs SSH
sudo tail -f /var/log/auth.log

# Permissões SSH
ls -la /home/cicdbot/.ssh  # .ssh = 700, authorized_keys = 600
```

### Firewall

```bash
# Status
sudo ufw status

# Abrir porta
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Logs
sudo tail -f /var/log/ufw.log
```

---

## 📊 Melhorias Implementadas

### Antes vs Depois

| Aspecto        | Antes              | Depois                 |
| -------------- | ------------------ | ---------------------- |
| Diretório      | Relativo ao script | Fixo: `/home/cicdbot`  |
| Logging        | Console apenas     | Console + `deploy.log` |
| Downtime       | Possível           | Zero (réplicas)        |
| .env           | Manual no servidor | Criado da secret       |
| Verificação    | Nenhuma            | Health checks          |
| Cópia arquivos | curl no SSH        | SCP direto             |

### O que o deploy.sh faz

```bash
1. Verifica pré-requisitos (.env, compose file)
2. Login no GHCR
3. Pull das novas imagens
4. Escala serviços para 2 réplicas (exceto postgres)
5. Rolling update (--force-recreate)
6. Aguarda health checks (30 tentativas)
7. Limpeza (imagens antigas, containers órfãos)
8. Log de tudo em deploy.log
```

### O que o GitHub Actions faz

```yaml
1. Testes Node.js + Java
2. Build Web + API
3. Build Docker images → Push GHCR
4. Deploy (se workflow_dispatch com deploy=true):
   - Setup SSH
   - Copia deploy.sh, docker-compose.prod.yml
   - Cria .env com ENV_PRODUCTION
   - chmod +x deploy.sh
   - Executa ./deploy.sh deploy
   - Verifica status final
```

---

## 🔒 Segurança

### Checklist

- [ ] Chave SSH privada apenas como secret no GitHub
- [ ] `.env` com permissões 600
- [ ] Senhas fortes (postgres, JWT)
- [ ] Firewall: apenas 22, 80, 443
- [ ] SSL/TLS no Nginx
- [ ] Usuário `cicdbot` sem sudo desnecessário
- [ ] Imagens do GHCR privadas ou públicas conforme necessário

### Rotação de Secrets

```bash
# Gerar novo JWT
openssl rand -base64 64

# Gerar senha forte
openssl rand -base64 32

# Atualizar no GitHub Secret ENV_PRODUCTION
# Fazer novo deploy
```

---

## 🎓 Dicas

### Aliases úteis

Adicione ao `~/.bashrc`:

```bash
alias dc='docker compose -f /home/cicdbot/docker-compose.prod.yml'
alias dps='dc ps'
alias dlogs='dc logs -f --tail=100'
alias dstats='dc stats'

# Uso:
# dps
# dlogs web
```

### Monitorar deploy em tempo real

```bash
# Terminal 1: Status dos containers
watch -n 2 'docker compose -f /home/cicdbot/docker-compose.prod.yml ps'

# Terminal 2: Logs do deploy
tail -f /home/cicdbot/deploy.log
```

### Rollback rápido

```bash
# Se tiver problema, volte para versão anterior
# Opção 1: Alterar tag no .env
nano /home/cicdbot/.env
# Mudar IMAGE_TAG=latest para IMAGE_TAG=sha-abc123
./deploy.sh deploy

# Opção 2: Fazer novo deploy da versão anterior pelo GitHub
```

### Primeiro deploy

No primeiro deploy não há containers antigos, então:

- Não há rolling update (não há o que substituir)
- Containers serão criados do zero
- A partir do 2º deploy, o rolling update funciona perfeitamente

---

## 📞 Suporte

- 📖 Este documento: `docs/DEPLOY.md`
- 📝 Exemplo .env: `.env.production.example`
- ⚙️ Workflow: `.github/workflows/ci-cd.yml`
- 🔧 Script: `scripts/deploy.sh`
- 🚀 Setup: `scripts/setup-server.sh`

**Problemas?** Abra uma issue no GitHub com:

- Descrição do erro
- Logs relevantes (sem dados sensíveis)
- Passos para reproduzir
