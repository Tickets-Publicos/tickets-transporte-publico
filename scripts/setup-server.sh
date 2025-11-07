#!/bin/bash

#################################################################
# Script de Configuração Inicial do Servidor de Produção
# Tickets Transporte Público
#
# Este script deve ser executado UMA VEZ no servidor de produção
# para preparar o ambiente antes do primeiro deploy.
#
# USO:
#   sudo bash setup-server.sh
#
#################################################################

set -euo pipefail

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() { echo -e "\n${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }

# Verifica se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    log_error "Este script deve ser executado como root (use sudo)"
    exit 1
fi

log "🚀 Iniciando configuração do servidor de produção"
log "=================================================="

# ==============================================================================
# 1. Atualizar Sistema
# ==============================================================================
log "[1/8] Atualizando sistema operacional..."
apt-get update -qq
apt-get upgrade -y -qq
log_success "Sistema atualizado"

# ==============================================================================
# 2. Instalar Dependências
# ==============================================================================
log "[2/8] Instalando dependências necessárias..."
apt-get install -y -qq \
    curl \
    wget \
    git \
    jq \
    ca-certificates \
    gnupg \
    lsb-release
log_success "Dependências instaladas"

# ==============================================================================
# 3. Instalar Docker
# ==============================================================================
log "[3/8] Verificando instalação do Docker..."
if ! command -v docker &> /dev/null; then
    log "Docker não encontrado. Instalando..."
    
    # Adicionar repositório oficial do Docker
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
        gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    systemctl enable docker
    systemctl start docker
    log_success "Docker instalado"
else
    log_success "Docker já instalado: $(docker --version)"
fi

# ==============================================================================
# 4. Criar Usuário de Deploy
# ==============================================================================
log "[4/8] Configurando usuário de deploy..."
DEPLOY_USER="cicdbot"
DEPLOY_HOME="/home/cicdbot"

if id "$DEPLOY_USER" &>/dev/null; then
    log_warning "Usuário $DEPLOY_USER já existe"
else
    useradd -m -s /bin/bash "$DEPLOY_USER"
    log_success "Usuário $DEPLOY_USER criado"
fi

# Adicionar ao grupo docker
usermod -aG docker "$DEPLOY_USER"
log_success "Usuário adicionado ao grupo docker"

# ==============================================================================
# 5. Criar Estrutura de Diretórios
# ==============================================================================
log "[5/8] Criando estrutura de diretórios..."
mkdir -p "$DEPLOY_HOME"
mkdir -p "$DEPLOY_HOME/docker/nginx/ssl"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_HOME"
log_success "Diretórios criados"

# ==============================================================================
# 6. Configurar SSH para o Usuário
# ==============================================================================
log "[6/8] Configurando SSH..."
DEPLOY_SSH_DIR="$DEPLOY_HOME/.ssh"

mkdir -p "$DEPLOY_SSH_DIR"
chmod 700 "$DEPLOY_SSH_DIR"

# Gerar chave SSH se não existir
if [ ! -f "$DEPLOY_SSH_DIR/id_ed25519" ]; then
    sudo -u "$DEPLOY_USER" ssh-keygen -t ed25519 -f "$DEPLOY_SSH_DIR/id_ed25519" -N "" -C "deploy-key"
    log_success "Chave SSH gerada"
else
    log_warning "Chave SSH já existe"
fi

# Configurar authorized_keys
touch "$DEPLOY_SSH_DIR/authorized_keys"
chmod 600 "$DEPLOY_SSH_DIR/authorized_keys"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_SSH_DIR"

log_success "SSH configurado"

# ==============================================================================
# 7. Configurar Firewall (UFW)
# ==============================================================================
log "[7/8] Configurando firewall..."
if command -v ufw &> /dev/null; then
    ufw --force enable
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    ufw reload
    log_success "Firewall configurado"
else
    log_warning "UFW não instalado, pulando configuração de firewall"
fi

# ==============================================================================
# 8. Configurar Limites de Sistema
# ==============================================================================
log "[8/8] Configurando limites de sistema..."

# Aumentar limites de arquivos abertos
cat >> /etc/security/limits.conf << 'EOF'

# Limites para usuário de deploy
cicdbot soft nofile 65536
cicdbot hard nofile 65536
EOF

# Configurar sysctl para Docker
cat >> /etc/sysctl.conf << 'EOF'

# Configurações para Docker
vm.max_map_count=262144
net.core.somaxconn=1024
EOF

sysctl -p > /dev/null 2>&1
log_success "Limites configurados"

# ==============================================================================
# Finalização
# ==============================================================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✓ Configuração Concluída!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
log "📋 Próximos Passos:"
echo ""
echo "1. Copie a chave SSH pública para adicionar no GitHub:"
echo -e "   ${YELLOW}sudo cat $DEPLOY_SSH_DIR/id_ed25519.pub${NC}"
echo ""
echo "2. Adicione a chave PRIVADA como secret no GitHub:"
echo -e "   ${YELLOW}sudo cat $DEPLOY_SSH_DIR/id_ed25519${NC}"
echo "   Secret name: DEPLOY_SSH_KEY"
echo ""
echo "3. Configure as outras secrets no GitHub:"
echo "   - DEPLOY_HOST: $(hostname -I | awk '{print $1}')"
echo "   - DEPLOY_USER: cicdbot"
echo "   - ENV_PRODUCTION: (conteúdo do .env de produção)"
echo ""
echo "4. Execute o primeiro deploy via GitHub Actions"
echo ""
echo -e "${BLUE}📚 Consulte docs/DEPLOY.md para mais informações${NC}"
echo ""

# Mostrar informações úteis
log "ℹ️  Informações do Sistema:"
echo "   OS: $(lsb_release -d | cut -f2)"
echo "   Docker: $(docker --version | cut -d' ' -f3 | tr -d ',')"
echo "   Docker Compose: $(docker compose version --short)"
echo "   IP: $(hostname -I | awk '{print $1}')"
echo "   Usuário de Deploy: $DEPLOY_USER"
echo "   Diretório de Deploy: $DEPLOY_HOME"
echo ""

log_success "Servidor pronto para receber deploys! 🎉"
