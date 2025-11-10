#!/usr/bin/env bash
set -euo pipefail

# Instala Java 25 (duas estratégias):
# - se executado como root: adiciona repositório Adoptium e instala pacote temurin-25-jdk via apt
# - se executado como usuário comum: instala via SDKMAN para o usuário
#
# Uso:
#   sudo bash scripts/install-java.sh    # instala globalmente (requer root)
#   bash scripts/install-java.sh         # instala via SDKMAN para usuário atual
#

VERSION=${1:-25}

log() { echo -e "[install-java] $1"; }
err() { echo -e "[install-java] ERROR: $1" >&2; }

install_system_adoptium() {
  log "Instalando Java ${VERSION} via repositório Adoptium (sistema)..."

  apt-get update -y -qq
  apt-get install -y -qq wget gnupg lsb-release

  # importar chave (dearmour para apt-keyless)
  wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | \
    gpg --dearmour -o /usr/share/keyrings/adoptium-archive-keyring.gpg

  CODE_NAME=$(lsb_release -cs)
  echo "deb [signed-by=/usr/share/keyrings/adoptium-archive-keyring.gpg] https://packages.adoptium.net/artifactory/deb/ ${CODE_NAME} main" \
    | tee /etc/apt/sources.list.d/adoptium.list > /dev/null

  apt-get update -y -qq

  # Tentar instalar o pacote padrão temurin-<VERSION>-jdk
  PKG1="temurin-${VERSION}-jdk"
  PKG2="temurin-${VERSION}-jdk-headless"

  if apt-get install -y -qq ${PKG1}; then
    log "Pacote ${PKG1} instalado com sucesso."
    return 0
  fi

  log "Falha ao instalar ${PKG1}, tentando ${PKG2}..."
  if apt-get install -y -qq ${PKG2}; then
    log "Pacote ${PKG2} instalado com sucesso."
    return 0
  fi

  # fallback: buscar pacote disponível que contenha 'temurin-${VERSION}'
  MATCH=$(apt-cache search temurin | awk '{print $1}' | grep -E "temurin-${VERSION}" | head -n1 || true)
  if [ -n "$MATCH" ]; then
    log "Encontrado pacote alternativo: $MATCH — instalando..."
    apt-get install -y -qq "$MATCH"
    return 0
  fi

  err "Não foi possível instalar via apt/Adoptium. Verifique repositório e disponibilidade do pacote para '${VERSION}'."
  return 1
}

install_sdkman_user() {
  log "Instalando Java ${VERSION} via SDKMAN para o usuário $(whoami)..."

  # instalar sdkman se necessário
  if [ ! -s "$HOME/.sdkman/bin/sdkman-init.sh" ]; then
    log "SDKMAN não encontrado. Instalando SDKMAN..."
    curl -s "https://get.sdkman.io" | bash
    # inicializar neste shell
    # shellcheck source=/dev/null
    source "$HOME/.sdkman/bin/sdkman-init.sh"
  else
    # shellcheck source=/dev/null
    source "$HOME/.sdkman/bin/sdkman-init.sh"
    log "SDKMAN já presente."
  fi

  # Tentar detectar um identificador SDKMAN que contenha a versão desejada
  log "Procurando um identificador SDKMAN para Java ${VERSION}..."
  ID=$(sdk list java | sed -n '1,200p' | grep -E "\b${VERSION}([ .-]|$)" | awk '{print $NF}' | head -n1 || true)

  if [ -z "$ID" ]; then
    log "Identificador automático não encontrado. Mostrando opções para você escolher..."
    sdk list java | sed -n '1,200p' | grep -n "${VERSION}" || true
    echo
    echo "Escolha o IDENTIFICADOR visível (ex: temurin-25.0.2-tem) e cole abaixo, ou pressione ENTER para cancelar:" 
    read -r SELECTED
    if [ -z "$SELECTED" ]; then
      err "Instalação via SDKMAN cancelada (nenhum identificador selecionado)."
      return 1
    fi
    ID=$SELECTED
  else
    log "Identificador detectado: $ID"
  fi

  log "Instalando $ID via sdk..."
  if sdk install java "$ID"; then
    log "Java instalado via SDKMAN: $ID"
    sdk default java "$ID" || true
    return 0
  else
    err "Falha ao instalar $ID via SDKMAN."
    return 1
  fi
}

main() {
  if [ "$(id -u)" -eq 0 ]; then
    install_system_adoptium
  else
    install_sdkman_user
  fi

  log "Verificando instalação final..."
  if command -v java >/dev/null 2>&1; then
    java -version || true
    JAVAC_PATH=$(command -v javac || true)
    if [ -n "$JAVAC_PATH" ]; then
      javac -version || true
    fi
    log "Se necessário, exporte JAVA_HOME em seu shell:"
    echo "  export JAVA_HOME=\"\$(dirname \$(dirname \$(readlink -f \$(which java))))\""
    echo "  export PATH=\"\$JAVA_HOME/bin:\$PATH\""
  else
    err "Java não encontrado após tentativa de instalação."
    exit 1
  fi
}

main "$@"
