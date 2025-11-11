# 🎫 Sistema de Tickets de Transporte Público

Sistema para reportar e gerenciar problemas de transporte público, desenvolvido com NestJS, Next.js e PostgreSQL.

## 📚 Índice

- [Deploy e CI/CD](#-deploy-e-cicd)
- [Desenvolvimento Local](#-desenvolvimento-local)
- [Documentação Técnica](#-documentação-técnica)
- [Contribuindo](#-contribuindo)

---

## 🚀 Deploy e CI/CD

### Deploy Automático com GitHub Actions

Este projeto utiliza **GitHub Actions** para CI/CD com deploy em produção via SSH.

**O que acontece automaticamente:**

- ✅ **Pull Requests**: Roda testes e valida o código
- ✅ **Push na `main`**: Testa, builda e publica imagens Docker
- ✅ **Deploy Manual**: Workflow disparável para deploy em produção

**Características do Sistema de Deploy:**

- 🔄 **Zero Downtime**: Rolling updates com réplicas
- 📝 **Logging Completo**: Todas operações registradas em `deploy.log`
- 🐳 **Docker Compose**: Orquestração simplificada
- 🔒 **Seguro**: Variáveis de ambiente via GitHub Secrets
- 📊 **Health Checks**: Verificação automática de saúde dos serviços

### 📖 Documentação de Deploy

**[docs/DEPLOY.md](./docs/DEPLOY.md)** - Guia completo:

- Quick start e configuração inicial
- Processo de deploy com zero downtime
- Comandos úteis e troubleshooting
- Segurança e boas práticas

### 🚀 Quick Start - Deploy em Produção

**1. Setup do Servidor (Uma Única Vez)**

```bash
# No servidor de produção
sudo bash setup-server.sh
```

Este script irá:

- ✅ Instalar Docker e dependências
- ✅ Criar usuário `cicdbot`
- ✅ Configurar SSH e firewall
- ✅ Preparar estrutura de diretórios

**2. Configurar Secrets no GitHub**

Acesse: `Settings > Secrets and variables > Actions`

| Secret           | Descrição                     |
| ---------------- | ----------------------------- |
| `DEPLOY_SSH_KEY` | Chave privada SSH do servidor |
| `DEPLOY_HOST`    | IP ou hostname do servidor    |
| `DEPLOY_USER`    | `cicdbot`                     |
| `ENV_PRODUCTION` | Conteúdo completo do `.env`   |

**3. Executar Deploy**

1. Acesse: `Actions > CI/CD Pipeline`
2. Clique: `Run workflow`
3. Marque: ☑️ **Deploy to production**
4. Clique: `Run workflow`

### 🛠️ Scripts Disponíveis

| Script                    | Descrição                             |
| ------------------------- | ------------------------------------- |
| `scripts/setup-server.sh` | Setup inicial do servidor de produção |
| `scripts/deploy.sh`       | Script de deploy (executado na VM)    |

### Arquivos Importantes de Deploy

- `.github/workflows/ci-cd.yml` - Pipeline completo de CI/CD
- `docker-compose.prod.yml` - Configuração de produção
- `.env.production.example` - Exemplo de variáveis de ambiente
- `scripts/setup-server.sh` - Setup automatizado do servidor
- `scripts/deploy.sh` - Script de deploy na VM

---

## 💻 Desenvolvimento Local

### Pré-requisitos

- Node.js 22+
- pnpm 10.17.1+
- Docker e Docker Compose
- Git

### Instalação

```bash
# Clonar repositório
git clone https://github.com/vinicius-cappatti/tickets-transporte-publico.git
cd tickets-transporte-publico

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar containers de desenvolvimento
docker-compose up -d

# Executar migrations
docker exec tickets-api npx prisma migrate dev

# Acessar aplicação
# API: http://localhost:3000
# Web: http://localhost:3001
```

### Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia todos os apps em modo dev
pnpm dev:api          # Inicia apenas a API
pnpm dev:web          # Inicia apenas o Web

# Build
pnpm build            # Build de todos os apps
pnpm build:api        # Build apenas da API
pnpm build:web        # Build apenas do Web

# Testes
pnpm test             # Roda todos os testes
pnpm test:api         # Testa apenas a API
pnpm lint             # Roda linting
pnpm check-types      # Verifica tipos TypeScript

# Docker
docker-compose up -d           # Desenvolvimento
docker-compose -f docker-compose.prod.yml up -d  # Produção
```

---

## 📖 Documentação Técnica

### Estrutura do Projeto

```text
tickets-transporte-publico/
├── apps/
│   ├── api/          # Backend NestJS
│   └── web/          # Frontend Next.js
├── packages/         # Shared packages
├── docker/           # Dockerfiles
├── nginx/            # Nginx config
├── scripts/          # Scripts de automação
├── wiki/             # Documentação técnica e diagramas
└── .github/          # GitHub Actions workflows
```

### Tecnologias Principais

- **Backend**: NestJS, Prisma, PostgreSQL
- **Frontend**: Next.js 15, React, Tailwind CSS, shadcn/ui
- **Infraestrutura**: Docker, Nginx, AWS EC2
- **CI/CD**: GitHub Actions
- **Monorepo**: Turborepo, pnpm workspaces

### Diagramas e Documentação

A documentação técnica completa, incluindo diagramas UML e design do sistema, está disponível na pasta `wiki/`.

---

## 🤝 Contribuindo

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para guidelines de contribuição.

### Fluxo de Trabalho

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

**Pull Requests** disparam automaticamente:

- Testes e validações
- Comentário automático com status do build
- Review automatizado

---

## 📝 Documentação LaTeX e PlantUML

## Como gerar e inserir diagramas PlantUML em LaTeX (TikZ)

### Pré-requisitos

- Java instalado (necessário para rodar o PlantUML)
- Compilador LaTeX com suporte a TikZ e XeLaTeX:
  ```bash
  sudo apt-get update && sudo apt-get install -y texlive-latex-base texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended texlive-lang-portuguese texlive-xetex
  ```
- O arquivo `plantuml.jar` está em `wiki/bin/plantuml.jar`
- Os arquivos `.puml` dos diagramas estão em `wiki/uml/`

### Gerando diagramas em LaTeX (TikZ)

Para cada diagrama `.puml` que deseja inserir no LaTeX, execute:

```bash
cd wiki
java -jar bin/plantuml.jar -tlatex:nopreamble uml/NOME_DO_DIAGRAMA.puml
```

Isso irá gerar um arquivo `NOME_DO_DIAGRAMA.tex` na mesma pasta do `.puml`.

### Exemplo de inclusão no arquivo LaTeX principal

No preâmbulo do seu arquivo `.tex`, adicione:

```latex
\usepackage{tikz}
```

E para inserir o diagrama no local desejado:

```latex
\begin{figure}[H]
\centering
\input{wiki/uml/NOME_DO_DIAGRAMA.tex}
\caption{Legenda do diagrama}
\end{figure}
```

### Observações

- Sempre gere novamente o `.tex` se alterar o `.puml`.
- O comando `-tlatex:nopreamble` gera apenas o ambiente TikZ, pronto para ser incluído em qualquer documento LaTeX.
- O compilador recomendado é o `pdflatex`.

## Usando LaTeX Workshop (Visual Studio Code)

A extensão "LaTeX Workshop" para Visual Studio Code facilita editar, compilar e visualizar documentos LaTeX diretamente no editor. Abaixo estão instruções básicas de instalação, requisitos e configuração em português (pt-BR).

### Requisitos

- A única exigência é uma distribuição LaTeX compatível disponível no PATH do sistema. Exemplo recomendado: TeX Live.
- Alternativas possíveis:
  - TinyTeX — uma distribuição leve baseada em TeX Live.
  - MiKTeX — distribuição leve com instalação automática de pacotes. Observação: para que o MiKTeX funcione corretamente com LaTeX Workshop, pode ser necessário ter o Perl instalado no sistema.

Ferramentas úteis (opcionais):

- ChkTeX — linter para projetos LaTeX.
- latexindent.pl — ferramenta de formatação (requer Perl e alguns módulos Perl; ver documentação oficial).

Saiba mais sobre distribuições e dependências consultando a documentação oficial da extensão.

### Instalação de distribuições LaTeX (exemplos práticos)

Abaixo descrevemos maneiras simples e padronizadas de instalar distribuições LaTeX em Windows e Linux, incluindo MiKTeX e TinyTeX, além de uma referência ao TeX Live.

#### Windows — MiKTeX (recomendado para Windows)

1. Baixe o instalador do MiKTeX em: [https://miktex.org/download](https://miktex.org/download)
2. Execute o instalador e siga as instruções. Marque a opção para instalar pacotes automaticamente quando solicitado (opcional, mas conveniente).
3. Verifique se o diretório `miktex/bin` foi adicionado ao PATH (normalmente o instalador faz isso). No prompt do Windows, verifique:

```bash
where pdflatex
```

Se não for encontrado, adicione o diretório de binários do MiKTeX ao PATH via as configurações do sistema (Painel de Controle → Sistema → Configurações Avançadas → Variáveis de Ambiente).

Observação: MiKTeX pode requerer Perl para algumas ferramentas opcionais; instale o Strawberry Perl se necessário: [https://strawberryperl.com/](https://strawberryperl.com/)

Alternativas via gerenciadores de pacotes no Windows

- Chocolatey (PowerShell como Administrador):

```powershell
choco install miktex
```

- winget (Windows Package Manager):

```powershell
winget install MiKTeX.MiKTeX
```

#### Linux — TinyTeX (leve) e TeX Live (completo)

TinyTeX (recomendado quando quiser uma instalação leve baseada em TeX Live)

1. Instale o TinyTeX via R (recomendado) ou via script do projeto:

Usando R (recomendado quando R está disponível):

```r
# no R
install.packages('tinytex')
tinytex::install_tinytex()
```

Usando o instalador shell:

```bash
# instala TinyTeX via script (user-local)
curl -sL "https://yihui.org/tinytex/install-bin-unix.sh" | sh
```

1. Após a instalação, confirme que `pdflatex` está disponível:

```bash
which pdflatex
```

Se necessário, adicione o diretório de binários do TinyTeX ao PATH (o instalador normalmente adiciona em ~/.TinyTeX/bin/\*).

TeX Live (completo)

1. Em distribuições Debian/Ubuntu, instale via apt (modo simples):

```bash
sudo apt-get update && sudo apt-get install -y texlive-full
```

Alternativa para instalar TeX Live via install-tl (mais atual):

```bash
# Baixe o instalador interativo
wget http://mirror.ctan.org/systems/texlive/tlnet/install-tl-unx.tar.gz
tar -xzf install-tl-unx.tar.gz
cd install-tl-*
sudo ./install-tl
```

Esse instalador permite selecionar componentes e atualizar a distribuição. Após instalar via install-tl, adicione o diretório de binários ao PATH (ex.: `/usr/local/texlive/YYYY/bin/x86_64-linux`).

Observação: `texlive-full` é grande; em servidores com espaço limitado, prefira conjuntos menores (por exemplo `texlive-latex-recommended`, `texlive-latex-extra`, `texlive-fonts-recommended`).

2. Verifique a instalação e o PATH:

```bash
which pdflatex
pdflatex --version
```

### Dicas sobre PATH e VS Code

- Após instalar qualquer distribuição, confirme que `pdflatex`, `latexmk` (se usado) e outros binários estão acessíveis no PATH do terminal que abre o VS Code.
- Se usar Remote - SSH ou Remote - Containers, certifique-se de que o PATH esteja definido em `~/.profile` ou `~/.bash_profile` para que o VS Code remoto herde-o.
- Como alternativa, defina `env` nas receitas do LaTeX Workshop para apontar diretamente para os executáveis.

### Instalação

1. No VS Code, instale a extensão "LaTeX Workshop" pela Visual Studio Code Marketplace ou pressione Ctrl/Cmd + P e execute:

```
ext install latex-workshop
```

2. Reinicie o VS Code se necessário.

### Configurando a variável PATH

Após instalar o TeX Live (ou outra distribuição), adicione o diretório de binários da distribuição ao PATH do sistema (exceto no Windows, onde o instalador normalmente já ajusta o PATH). Se o VS Code não localizar os executáveis LaTeX, isso indica que a variável PATH do sistema não está configurada corretamente.

- Em macOS/Linux, adicione algo como (exemplo para TeX Live):

```
export PATH=/usr/local/texlive/2024/bin/x86_64-linux:$PATH
```

- Em sessões remotas (Remote - SSH / Containers) pode ser necessário editar `~/.profile` ou `~/.bash_profile` em vez de `~/.bashrc` para que o VS Code receba a variável PATH.

Observações importantes:

- Sempre reinicie o VS Code (e, quando necessário, o sistema) após alterar o PATH.
- Se não for possível ajustar o PATH do sistema, você pode sobrescrever o PATH dentro das receitas do LaTeX Workshop usando a propriedade `env` nas configurações da extensão.

### Configurações básicas

Você pode alterar as configurações pelo menu Preferences > Settings do VS Code ou editando diretamente o arquivo `settings.json`. Para configurações por projeto, crie/edite `.vscode/settings.json` na raiz do workspace.

Exemplos úteis de configuração (adicione ao `settings.json` do workspace):

```
{
  "latex-workshop.view.pdf.viewer": "tab",
  "latex-workshop.latex.autoBuild.run": "onSave",
  "latex-workshop.synctex.afterBuild.enabled": true
}
```

Consulte a documentação oficial para detalhes sobre `tools`, `recipes` e outras opções avançadas.

### Uso

- Abra um arquivo `.tex` no VS Code. Use a barra lateral TeX (TeX sidebar) para acessar recursos da extensão: construir (build), visualizar PDF, navegar pela estrutura do documento, visualizar erros e warnings.
- Para associar um atalho ao painel TeX, vincule uma tecla ao comando `latex-workshop.actions` nas configurações de keybindings.

Funcionalidades principais:

- Construção (build) e visualização de PDF com sincronização source ↔︎ PDF.
- Exibição de erros e avisos no painel Problems.
- Navegação por ambientes e seleção rápida de ambientes.
- Outline do documento e mecanismo de folding (personalizável via `latex-workshop.view.outline.sections`).
- Navegação e inserção de citações (browser de citações e intellisense para BibTeX).

Se preferir acessar ações comuns pelo menu de contexto (botão direito), ative:

```
"latex-workshop.showContextMenu": true
```

### Idiomas suportados

Além de LaTeX clássico, a extensão oferece suporte a LaTeX-Expl3 (LaTeX3). Também há suporte para Sweave, knitr e Weave.jl (.rnw / .jnw). Veja a documentação da extensão para instruções de build específicas para esses formatos.

### Usando Docker

LaTeX Workshop funciona bem com a extensão Remote - Containers do VS Code. Também existe suporte experimental a Docker interno da extensão.

Para usar o modo Docker experimental, configure:

```
"latex-workshop.docker.enabled": true,
"latex-workshop.docker.image.latex": "<nome-da-imagem>",
"latex-workshop.docker.path": "/usr/bin/docker"
```

Você precisa escolher uma imagem Docker adequada que contenha uma distribuição LaTeX. Alguns usuários preferem imagens baseadas em TeX Live.

### Links e documentação

- Documentação oficial da extensão LaTeX Workshop: [https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop](https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop)
- Documentação do projeto (GitHub): [https://github.com/James-Yu/LaTeX-Workshop](https://github.com/James-Yu/LaTeX-Workshop)

```bash
ext install latex-workshop
```

Se preferir, instale a extensão pelo Marketplace do VS Code.

```json
"latex-workshop.showContextMenu": true
```

### Scripts de instalação fornecidos

Incluí dois scripts utilitários em `scripts/` para facilitar a instalação de uma distribuição LaTeX:

- `scripts/install-latex.ps1` — PowerShell para Windows. Tenta usar `winget` ou `choco` para instalar MiKTeX. Execute em PowerShell como Administrador:

```powershell
.\scripts\install-latex.ps1
```

- `scripts/install-latex.sh` — Bash para Linux. Pode instalar TinyTeX (padrão) ou TeX Live via apt:

```bash
# TinyTeX (padrão)
./scripts/install-latex.sh --tinytex

# TeX Live (completo)
./scripts/install-latex.sh --texlive
```

Após a instalação, confirme com:

```bash
pdflatex --version
```
