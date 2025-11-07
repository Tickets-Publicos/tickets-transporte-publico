# API Java - Spring Boot

Versão da API em **Java com Spring Boot**, migrada da versão original em NestJS.

## 🚀 Quick Start

### Pré-requisitos

- **Java 21+** (configure `JAVA_HOME` apontando para o diretório do JDK)
- **Node.js 18+** (para scripts cross-platform)
- **PostgreSQL 16+**

> ⚠️ **Windows**: Certifique-se que `JAVA_HOME` aponta para o diretório do JDK (ex: `C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot`), **não** para o executável `java.exe`.

### Executar localmente

#### Configuração de Variáveis de Ambiente

O projeto agora suporta **arquivo `.env`** para configuração local. O Spring Boot carregará automaticamente as variáveis do arquivo `.env` localizado na raiz do monorepo.

**Passos:**

1. Copie o arquivo `.env.example` da raiz do projeto para `.env`:

```bash
# Na raiz do monorepo
cp .env.example .env
```

2. Edite o arquivo `.env` com suas configurações locais:

```bash
# Database (PostgreSQL)
POSTGRES_DB=tickets
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# API Java (Spring Boot)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/tickets
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_PROFILES_ACTIVE=dev
PORT=3000
```

3. Execute a aplicação normalmente - o `.env` será carregado automaticamente!

#### Opção 1: Com npm/pnpm (Cross-platform - Recomendado)

```bash
# Executar aplicação (funciona em Windows, Linux e macOS)
# As variáveis do .env serão carregadas automaticamente
pnpm dev
# ou
npm run dev
```

#### Opção 2: Diretamente com Maven

```bash
# Linux/macOS:
./mvnw spring-boot:run

# Windows (CMD):
mvnw.cmd spring-boot:run

# Windows (PowerShell):
.\mvnw.cmd spring-boot:run
```

### Executar com Docker

```bash
# Build da imagem
docker build -t tickets-api-java .

# Executar container
docker run -p 3000:3000 \
  -e DATABASE_URL="jdbc:postgresql://host.docker.internal:5432/tickets" \
  -e DB_USERNAME="tickets" \
  -e DB_PASSWORD="tickets123" \
  tickets-api-java
```

## 📚 Estrutura do Projeto

```
src/main/java/com/tickets/api/
├── TicketsApiApplication.java          # Classe principal
├── config/
│   └── WebConfig.java                  # Configuração CORS
├── controller/
│   ├── AppController.java              # / e /health
│   └── UserController.java             # /users/*
├── dto/
│   ├── common/
│   │   └── PageResponseDto.java
│   ├── report/
│   │   ├── CreateReportDto.java
│   │   └── ReportResponseDto.java
│   └── user/
│       ├── CreateUserDto.java
│       └── UserResponseDto.java
├── exception/
│   ├── ConflictException.java
│   ├── ErrorResponse.java
│   ├── GlobalExceptionHandler.java
│   └── ResourceNotFoundException.java
├── model/
│   ├── entity/
│   │   ├── Category.java
│   │   ├── Comment.java
│   │   ├── Location.java
│   │   ├── Report.java
│   │   ├── StatusHistory.java
│   │   └── User.java
│   └── enums/
│       ├── CategoryType.java
│       ├── ReportStatus.java
│       └── UserRole.java
├── repository/
│   ├── CategoryRepository.java
│   ├── CommentRepository.java
│   ├── LocationRepository.java
│   ├── ReportRepository.java
│   ├── StatusHistoryRepository.java
│   └── UserRepository.java
└── service/
    └── UserService.java
```

## 🔄 Comparação: NestJS vs Spring Boot

| Aspecto                    | NestJS              | Spring Boot                   |
| -------------------------- | ------------------- | ----------------------------- |
| **Linguagem**              | TypeScript          | Java                          |
| **Framework**              | NestJS (Node.js)    | Spring Boot                   |
| **ORM**                    | Prisma              | JPA/Hibernate                 |
| **Injeção de Dependência** | `@Injectable()`     | `@Service`, `@Autowired`      |
| **Controllers**            | `@Controller()`     | `@RestController`             |
| **Validação**              | `class-validator`   | `jakarta.validation`          |
| **Decorators**             | `@Get()`, `@Post()` | `@GetMapping`, `@PostMapping` |
| **Exception Handling**     | `@Catch()`          | `@ExceptionHandler`           |

### Equivalências de Código

#### NestJS (TypeScript)

```typescript
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    return user;
  }
}
```

#### Spring Boot (Java)

```java
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserResponseDto findById(String id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Usuário não encontrado"));

        return mapToDto(user);
    }
}
```

## 🛣️ Rotas da API

### Users

- `POST /users` - Criar usuário
- `GET /users` - Listar todos usuários
- `GET /users/{id}` - Buscar por ID
- `GET /users/email/{email}` - Buscar por email
- `PATCH /users/{id}` - Atualizar usuário
- `DELETE /users/{id}` - Deletar usuário

### Health Check

- `GET /` - Informações da API
- `GET /health` - Status de saúde

## 🔧 Configuração

### Configuração via .env (Recomendado)

O projeto usa o **dotenv-java** para carregar variáveis de ambiente do arquivo `.env` na raiz do monorepo.

**Arquivo `.env`:**

```bash
# Banco de Dados
POSTGRES_DB=tickets
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# API Java (Spring Boot)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/tickets
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_JPA_SHOW_SQL=false
SPRING_PROFILES_ACTIVE=dev

# Aplicação
PORT=3000
```

**Ordem de prioridade das variáveis:**

1. Variáveis de ambiente do sistema (maior prioridade)
2. Variáveis do arquivo `.env`
3. Valores padrão no `application.properties` (menor prioridade)

### application.properties

O arquivo `application.properties` usa a sintaxe `${VAR_NAME:default}` para ler variáveis de ambiente:

```properties
# Lê SPRING_DATASOURCE_URL do .env ou usa o padrão
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/tickets}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:postgres}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:postgres}

spring.jpa.hibernate.ddl-auto=${SPRING_JPA_HIBERNATE_DDL_AUTO:validate}
spring.jpa.show-sql=${SPRING_JPA_SHOW_SQL:false}

server.port=${PORT:3000}
```

## 🧪 Testes

```bash
# Executar todos os testes
mvn test

# Executar com cobertura
mvn test jacoco:report
```

## 📦 Build para Produção

```bash
# Build JAR
mvn clean package

# JAR gerado em: target/api-java-1.0.0.jar

# Executar JAR
java -jar target/api-java-1.0.0.jar
```

## 🐳 Docker

### Build da imagem

```bash
docker build -t ghcr.io/vinicius-cappatti/tickets-api-java:latest .
```

### Push para GHCR

```bash
docker push ghcr.io/vinicius-cappatti/tickets-api-java:latest
```

## 📊 Diferenças Principais

### 1. **Tipos Estáticos vs Dinâmicos**

- **Java**: Tipagem estática forte, compilação necessária
- **TypeScript**: Tipagem estática opcional, transpilação para JS

### 2. **ORM**

- **Prisma** (NestJS): Schema próprio, type-safe, migrations automáticas
- **JPA/Hibernate** (Spring): Annotations nas entidades, mais verboso

### 3. **Gestão de Dependências**

- **npm/pnpm** (NestJS): package.json, node_modules
- **Maven** (Spring): pom.xml, repositório local .m2

### 4. **Performance**

- **NestJS**: Single-threaded event loop, excelente para I/O
- **Spring Boot**: Multi-threaded, melhor para CPU-intensive

### 5. **Ecossistema**

- **NestJS**: Moderno, comunidade crescente, flexível
- **Spring Boot**: Maduro, enterprise-ready, padrão de mercado

## ⚡ Vantagens de cada abordagem

### NestJS

- ✅ Desenvolvimento mais rápido
- ✅ Menos verboso
- ✅ Melhor para microservices leves
- ✅ TypeScript nativo

### Spring Boot

- ✅ Mais robusto para aplicações enterprise
- ✅ Melhor para processamento pesado
- ✅ Suporte corporativo extenso
- ✅ Ferramentas maduras de monitoring

## 🤝 Contribuindo

Para adicionar mais módulos (Reports, Categories, Locations), siga o padrão:

1. Criar Entity em `model/entity/`
2. Criar Repository em `repository/`
3. Criar DTOs em `dto/<modulo>/`
4. Criar Service em `service/`
5. Criar Controller em `controller/`

## �️ Compatibilidade Cross-Platform

Este projeto usa o pacote `run-script-os` para garantir que os scripts npm funcionem em **Windows, Linux e macOS**:

```json
{
  "scripts": {
    "dev": "run-script-os",
    "dev:win32": "mvnw.cmd spring-boot:run",
    "dev:darwin:linux": "./mvnw spring-boot:run"
  }
}
```

**Como funciona:**

- No **Windows**, executa `mvnw.cmd`
- No **Linux/macOS**, executa `./mvnw`
- Detecta automaticamente o sistema operacional
- Nenhuma configuração adicional necessária

**Comandos disponíveis:**

- `pnpm dev` / `npm run dev` - Inicia servidor de desenvolvimento
- `pnpm build` / `npm run build` - Compila o projeto
- `pnpm test` / `npm run test` - Executa testes
- `pnpm test:full` / `npm run test:full` - Testes completos com verificação

## �📝 Notas de Migração

- ✅ **Suporte a arquivo .env** para configuração local
- ✅ **Entidades JPA** equivalentes ao schema Prisma
- ✅ **Repositories** com métodos automáticos do Spring Data
- ✅ **Services** com mesma lógica de negócio
- ✅ **Controllers** com mesmas rotas HTTP
- ✅ **Exception Handling** global
- ✅ **Scripts cross-platform** (Windows, Linux, macOS)
- ⏳ **Reports, Categories, Locations** - a implementar
- ⏳ **Autenticação JWT** - a implementar
- ⏳ **Testes unitários** - a implementar

## 📞 Contato

Para dúvidas sobre a migração, consulte a documentação original em `/apps/api/`.
