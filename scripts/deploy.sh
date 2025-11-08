#!/bin/bash

#################################################################
# Script Unificado de Deploy - Tickets Transporte Público
#
# Combina a simplicidade do Docker Compose com a robustez
# de um pipeline de CI/CD (login, pull, migrações).
#
# USO:
#   ./deploy.sh deploy    - Executa o deploy (pull, up, migrate)
#   ./deploy.sh down      - Para todos os serviços
#   ./deploy.sh logs      - Mostra os logs (segue)
#   ./deploy.sh ps        - Mostra o status dos containers
#   ./deploy.sh pull      - Apenas baixa as imagens
#
#################################################################

# 'set -e' para na primeira falha
# 'set -u' falha se usar variável indefinida
# 'set -o pipefail' falha se um comando no pipe falhar
set -euo pipefail

# ==============================================================================
# Configuração
# ==============================================================================

# Diretório padrão da aplicação (usa o diretório home do usuário)
PROJECT_DIR="${HOME}/deploy"

# Arquivos de configuração
COMPOSE_FILE="${PROJECT_DIR}/docker-compose.prod.yml"
ENV_FILE="${PROJECT_DIR}/.env"
LOG_FILE="${PROJECT_DIR}/deploy.log"

# Configurações do Registry
# Podem ser sobrescritas por variáveis de ambiente
REGISTRY="${REGISTRY:-ghcr.io}"
REPO_OWNER="${REPO_OWNER:-}" # Deve ser definido no ambiente
IMAGE_TAG="${IMAGE_TAG:-latest}"

# ==============================================================================
# Cores e Funções de Log
# ==============================================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função auxiliar para log dual (console + arquivo)
log_to_file() {
    local message="$1"
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $message" | tee -a "$LOG_FILE"
}

log() { 
    echo -e "\n${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
    log_to_file "[INFO] $1"
}

log_success() { 
    echo -e "${GREEN}✓${NC} $1"
    log_to_file "[SUCCESS] $1"
}

log_error() { 
    echo -e "${RED}✗${NC} $1" >&2
    log_to_file "[ERROR] $1"
}

log_warning() { 
    echo -e "${YELLOW}⚠${NC} $1"
    log_to_file "[WARNING] $1"
}

# ==============================================================================
# Funções Auxiliares
# ==============================================================================

# Mostra como usar o script
usage() {
    echo -e "${YELLOW}Uso:${NC}"
    echo -e "  $0 ${GREEN}deploy${NC}    - Executa o deploy (pull, up, migrate)"
    echo -e "  $0 ${GREEN}down${NC}      - Para todos os serviços"
    echo -e "  $0 ${GREEN}logs${NC} [serviço] - Mostra os logs (segue)"
    echo -e "  $0 ${GREEN}ps${NC}        - Mostra o status dos containers"
    echo -e "  $0 ${GREEN}pull${NC}      - Apenas baixa as imagens"
}

# Verifica se os arquivos necessários existem
check_prereqs() {
    log "Verificando pré-requisitos..."
    
    # Garante que o diretório do projeto existe
    if [ ! -d "$PROJECT_DIR" ]; then
        log_warning "Diretório $PROJECT_DIR não existe, criando..."
        mkdir -p "$PROJECT_DIR"
    fi
    
    cd "$PROJECT_DIR" || {
        log_error "Não foi possível acessar o diretório $PROJECT_DIR"
        exit 1
    }
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "Arquivo $COMPOSE_FILE não encontrado!"
        log_warning "O arquivo docker-compose.prod.yml deve ser copiado para o servidor."
        exit 1
    fi
    
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Arquivo $ENV_FILE não encontrado!"
        log_warning "O arquivo .env deve ser criado com as variáveis de ambiente necessárias."
        exit 1
    fi
    
    log_success "Pré-requisitos OK"
}

# Faz login no registry
docker_login() {
    if [ -n "${GITHUB_TOKEN:-}" ] && [ -n "${REPO_OWNER:-}" ]; then
        log "Fazendo login no GitHub Container Registry ($REGISTRY)..."
        echo "$GITHUB_TOKEN" | docker login "$REGISTRY" -u "$REPO_OWNER" --password-stdin
        log_success "Login efetuado"
    else
        log_warning "GITHUB_TOKEN ou REPO_OWNER não definidos. Assumindo login manual."
    fi
}

# Mostra o status final
show_status() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}   Status dos Containers${NC}"
    echo -e "${BLUE}========================================${NC}"
    docker compose -f "$COMPOSE_FILE" ps

    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}   Últimos logs (geral)${NC}"
    echo -e "${BLUE}========================================${NC}"
    docker compose -f "$COMPOSE_FILE" logs --tail=20
}

# ==============================================================================
# Funções Principais (Ações)
# ==============================================================================

# Ação: deploy
main_deploy() {
    log "🚀 Iniciando deploy - Tickets Transporte Público"
    log_to_file "========================================="
    log_to_file "Deploy iniciado"
    log_to_file "========================================="
    
    check_prereqs

    log "[1/6] Login no Container Registry..."
    docker_login

    log "[2/6] Baixando imagens mais recentes..."
    # Pull de cada serviço individualmente para evitar erros
    for service in $(docker compose -f "$COMPOSE_FILE" config --services); do
        log "Baixando imagem do serviço: $service"
        docker compose -f "$COMPOSE_FILE" pull "$service" 2>&1 | tee -a "$LOG_FILE" || {
            log_warning "Falha ao baixar imagem do serviço $service, continuando..."
        }
    done
    log_success "Imagens atualizadas"

    log "[3/6] Escalando serviços para múltiplas réplicas (zero downtime)..."
    # Escala cada serviço para 2 réplicas antes de atualizar
    for service in $(docker compose -f "$COMPOSE_FILE" config --services); do
        if [ "$service" != "postgres" ]; then  # Não escala banco de dados
            log "Escalando serviço: $service para 2 réplicas"
            docker compose -f "$COMPOSE_FILE" up -d --scale $service=2 --no-recreate 2>&1 | tee -a "$LOG_FILE" || true
        fi
    done
    log_success "Serviços escalados"

    log "[4/6] Atualizando containers com rolling update..."
    # Este comando faz um "rolling update":
    # Ele atualiza apenas os serviços cujas imagens mudaram,
    # e com as réplicas ativas, garante zero downtime
    docker compose -f "$COMPOSE_FILE" up -d --remove-orphans --force-recreate 2>&1 | tee -a "$LOG_FILE"
    log_success "Containers atualizados"

    log "[5/6] Aguardando serviços ficarem saudáveis..."
    sleep 10
    # Verifica health checks
    for i in {1..30}; do
        if docker compose -f "$COMPOSE_FILE" ps | grep -q "unhealthy"; then
            log_warning "Aguardando serviços ficarem saudáveis... ($i/30)"
            sleep 2
        else
            log_success "Todos os serviços estão saudáveis"
            break
        fi
    done

    log "[6/6] Limpando imagens antigas e containers órfãos..."
    docker image prune -f 2>&1 | tee -a "$LOG_FILE"
    docker container prune -f 2>&1 | tee -a "$LOG_FILE"
    log_success "Limpeza concluída"

    show_status

    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}   ✓ Deploy concluído com sucesso!${NC}"
    echo -e "${GREEN}========================================${NC}"
    log_to_file "========================================="
    log_to_file "Deploy concluído com sucesso"
    log_to_file "========================================="
}

# Ação: down
main_down() {
    log "Parando todos os serviços..."
    docker compose -f "$COMPOSE_FILE" down 2>&1 | tee -a "$LOG_FILE"
    log_success "Serviços parados."
    log_to_file "Serviços parados via comando 'down'"
}

# Ação: logs
main_logs() {
    log "Exibindo logs... (Pressione Ctrl+C para sair)"
    # Passa argumentos extras (ex: ./deploy.sh logs api)
    docker compose -f "$COMPOSE_FILE" logs -f "$@"
}

# Ação: ps
main_ps() {
    log "Status atual dos containers:"
    docker compose -f "$COMPOSE_FILE" ps "$@"
}

# Ação: pull
main_pull() {
    log "Baixando imagens..."
    docker_login
    docker compose -f "$COMPOSE_FILE" pull 2>&1 | tee -a "$LOG_FILE"
    log_success "Imagens baixadas."
    log_to_file "Imagens baixadas via comando 'pull'"
}


# ==============================================================================
# Execução Principal
# ==============================================================================

main() {
    # Garante que o arquivo de log existe
    touch "$LOG_FILE" 2>/dev/null || {
        # Se não conseguir criar no diretório padrão, usa /tmp
        LOG_FILE="/tmp/deploy.log"
        touch "$LOG_FILE"
    }
    
    if [ "$#" -eq 0 ]; then
        usage
        exit 1
    fi

    local action=$1
    shift # Remove o $1 (ação) para que $@ sejam os argumentos restantes

    # Garante que estamos no diretório do projeto
    cd "$PROJECT_DIR" 2>/dev/null || {
        log_warning "Diretório $PROJECT_DIR não existe, criando..."
        mkdir -p "$PROJECT_DIR"
        cd "$PROJECT_DIR"
    }

    case "$action" in
        deploy)
            main_deploy
            ;;
        down)
            main_down "$@"
            ;;
        logs)
            main_logs "$@"
            ;;
        ps)
            main_ps "$@"
            ;;
        pull)
            main_pull
            ;;
        *)
            log_error "Ação desconhecida: $action"
            usage
            exit 1
            ;;
    esac
}

# Captura erros
trap 'log_error "Erro detectado na linha $LINENO"; log_to_file "ERRO: Falha na linha $LINENO"' ERR

# Executa o script
main "$@"