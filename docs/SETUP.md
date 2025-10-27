# Setup do Projeto Java API

## Requisitos

- **Java 25** (JDK)
- **Maven 3.9.11+** (incluído via Maven Wrapper)
- **PostgreSQL 16** rodando na porta `54323`

## Primeira vez configurando o projeto

### 1. Verificar versão do Java

```bash
java -version
```

Deve mostrar **Java 25** (ou superior).

### 2. Configurar JAVA_HOME

curl -s "https://get.sdkman.io" | bash && source "$HOME/.sdkman/bin/sdkman-init.sh" && sdk install java {candidate_id}

#### Windows (PowerShell)
```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-25.0.0.36-hotspot"
```

#### Linux/Mac
```bash
export JAVA_HOME=/path/to/jdk-25
```

### 3. Limpar cache do Maven (se houver problemas)

Se você encontrar erros relacionados ao Lombok ou `com.sun.tool.javac.TypeTag`:

```bash
# Windows
.\mvnw.ps1 clean
rm -r -fo $env:USERPROFILE\.m2\repository\org\projectlombok

# Linux/Mac
./mvnw clean
rm -rf ~/.m2/repository/org/projectlombok
```

### 4. Compilar o projeto

```bash
# Windows
.\mvnw.ps1 clean install

# Linux/Mac
./mvnw clean install
```

### 5. Rodar a aplicação

```bash
# Windows
.\mvnw.ps1 spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

Ou usando pnpm na raiz do monorepo:

```bash
pnpm --filter=java dev
```

## Problemas Comuns

### Erro: `com.sun.tool.javac.TypeTag`

**Causa**: Cache do Lombok incompatível ou versão errada.

**Solução**:
1. Deletar o cache do Lombok: `rm -rf ~/.m2/repository/org/projectlombok`
2. Limpar o projeto: `./mvnw clean`
3. Recompilar: `./mvnw install`

### Erro: `Port 8080 was already in use`

**Causa**: Outra instância do servidor está rodando.

**Solução**:

#### Windows
```powershell
# Encontrar o processo
netstat -ano | findstr :8080

# Matar o processo (substitua <PID>)
taskkill /PID <PID> /F
```

#### Linux/Mac
```bash
# Encontrar o processo
lsof -i :8080

# Matar o processo
kill -9 <PID>
```

### Erro: Cannot connect to database

**Causa**: PostgreSQL não está rodando ou configuração incorreta.

**Solução**:
1. Verificar se o PostgreSQL está rodando na porta `54323`
2. Verificar as variáveis no arquivo `.env` na raiz do projeto
3. Executar: `docker-compose -f docker-compose-dev.yml up -d` (se usando Docker)

## Estrutura do Projeto

```
apps/api-java/
├── src/
│   ├── main/
│   │   ├── java/com/tickets/api/
│   │   │   ├── config/         # Configurações (CORS, Security, etc)
│   │   │   ├── controller/     # REST Controllers
│   │   │   ├── dto/            # Data Transfer Objects
│   │   │   ├── model/          # Entities JPA
│   │   │   ├── repository/     # Spring Data Repositories
│   │   │   └── service/        # Business Logic
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/migration/   # Flyway migrations
│   └── test/                   # Testes
├── pom.xml                     # Configuração Maven
├── mvnw / mvnw.cmd            # Maven Wrapper
└── .mvn/                       # Configuração do Maven Wrapper
```

## Variáveis de Ambiente

As variáveis são carregadas automaticamente do arquivo `.env` na raiz do monorepo:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`
- `SERVER_PORT`

## Comandos Úteis

```bash
# Rodar testes
./mvnw test

# Gerar relatório de cobertura
./mvnw verify

# Executar migração do banco
./mvnw flyway:migrate

# Criar nova migração
./scripts/gen-migration.ps1 "nome_da_migracao"

# Build para produção
./mvnw clean package -DskipTests

# Rodar a aplicação em produção
java -jar target/api-java-1.0.0.jar
```

## Verificação de Saúde

Após iniciar a aplicação, acesse:

- **API**: http://localhost:8080
- **Health Check**: http://localhost:8080/actuator/health
- **Info**: http://localhost:8080/actuator/info
