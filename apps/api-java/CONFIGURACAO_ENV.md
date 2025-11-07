# Configuração de Variáveis de Ambiente (.env)

Este documento explica como a API Java Spring Boot carrega e utiliza variáveis de ambiente do arquivo `.env`.

## 🔧 Como Funciona

### 1. Biblioteca Dotenv-Java

O projeto utiliza a biblioteca [`dotenv-java`](https://github.com/cdimascio/dotenv-java) para carregar variáveis do arquivo `.env` antes do Spring Boot inicializar.

**Dependência no `pom.xml`:**

```xml
<dependency>
    <groupId>io.github.cdimascio</groupId>
    <artifactId>dotenv-java</artifactId>
    <version>3.0.0</version>
</dependency>
```

### 2. Classe de Configuração

A classe `DotenvConfig.java` implementa `ApplicationContextInitializer` e é executada **antes** do Spring Boot inicializar completamente:

```java
public class DotenvConfig implements ApplicationContextInitializer<ConfigurableApplicationContext> {
    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        // Carrega o arquivo .env
        // Adiciona as variáveis ao environment do Spring
    }
}
```

**Características:**

- ✅ Procura o arquivo `.env` recursivamente até 3 níveis acima (suporta estrutura de monorepo)
- ✅ Carrega variáveis e adiciona ao environment do Spring
- ✅ Define as variáveis como propriedades do sistema (`System.setProperty`)
- ✅ Não causa erro se o arquivo `.env` não existir

### 3. Registro do Inicializador

O arquivo `META-INF/spring.factories` registra o inicializador para ser executado automaticamente:

```properties
org.springframework.context.ApplicationContextInitializer=\
com.tickets.api.config.DotenvConfig
```

### 4. Ordem de Busca do Arquivo .env

O sistema procura o arquivo `.env` na seguinte ordem:

1. **Diretório atual** (onde o comando é executado)
2. **1 nível acima** (ex: `apps/` se você estiver em `apps/api-java/`)
3. **2 níveis acima** (ex: raiz do monorepo)
4. **3 níveis acima**

Isso permite que o arquivo `.env` esteja na **raiz do monorepo** e seja compartilhado entre projetos.

## 📋 Ordem de Prioridade

As variáveis são lidas na seguinte ordem de prioridade (maior para menor):

1. **Variáveis de ambiente do sistema** (definidas no SO ou Docker)
2. **Variáveis do arquivo `.env`**
3. **Valores padrão no `application.properties`**

### Exemplo

Se você tiver:

**`.env`:**

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/tickets
PORT=3000
```

**`application.properties`:**

```properties
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/default}
server.port=${PORT:8080}
```

**Resultado:**

- `spring.datasource.url` = `jdbc:postgresql://localhost:5432/tickets` (do .env)
- `server.port` = `3000` (do .env)

Se você definir `PORT=4000` como variável de ambiente do sistema, o valor será `4000` (maior prioridade).

## 🚀 Uso

### Desenvolvimento Local

1. **Crie o arquivo `.env`** na raiz do monorepo:

```bash
cp .env.example .env
```

2. **Edite o arquivo `.env`** com suas configurações:

```bash
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/tickets
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres

# Application
PORT=3000
SPRING_PROFILES_ACTIVE=dev
```

3. **Execute a aplicação**:

```bash
pnpm dev
# ou
./mvnw spring-boot:run
```

### Docker / Produção

Em ambientes Docker ou produção, você pode usar **variáveis de ambiente do sistema** em vez do arquivo `.env`:

```bash
docker run -p 3000:3000 \
  -e SPRING_DATASOURCE_URL="jdbc:postgresql://postgres:5432/tickets" \
  -e SPRING_DATASOURCE_USERNAME="postgres" \
  -e SPRING_DATASOURCE_PASSWORD="secret" \
  tickets-api-java
```

## 📝 Variáveis Disponíveis

### Banco de Dados

- `SPRING_DATASOURCE_URL` - URL de conexão do PostgreSQL
- `SPRING_DATASOURCE_USERNAME` - Usuário do banco
- `SPRING_DATASOURCE_PASSWORD` - Senha do banco

### JPA/Hibernate

- `SPRING_JPA_HIBERNATE_DDL_AUTO` - Estratégia de geração de schema (`validate`, `update`, `create`, `create-drop`)
- `SPRING_JPA_SHOW_SQL` - Mostrar SQL no console (`true`, `false`)

### Aplicação

- `PORT` - Porta do servidor (padrão: `3000`)
- `SPRING_PROFILES_ACTIVE` - Perfil ativo (`dev`, `prod`, `test`)

### Flyway

- `SPRING_FLYWAY_ENABLED` - Habilitar migrações Flyway (`true`, `false`)

### Logging (opcional)

- `LOGGING_LEVEL_ROOT` - Nível de log geral (`INFO`, `DEBUG`, `WARN`, `ERROR`)
- `LOGGING_LEVEL_COM_TICKETS_API` - Nível de log da aplicação

## 🔍 Debug

Para verificar se o arquivo `.env` está sendo carregado, observe os logs no console ao iniciar a aplicação:

```
Carregando variáveis do arquivo: C:\Users\...\tickets-transporte-publico\.env
Variáveis de ambiente carregadas com sucesso do .env
```

Ou, se o arquivo não for encontrado:

```
Arquivo .env não encontrado. Usando variáveis de ambiente do sistema.
```

## ⚠️ Segurança

- ❌ **NUNCA** faça commit do arquivo `.env` com credenciais reais
- ✅ O arquivo `.env` está no `.gitignore`
- ✅ Use `.env.example` como template sem dados sensíveis
- ✅ Em produção, use secrets managers (AWS Secrets Manager, Azure Key Vault, etc.)

## 🧪 Testes

Para testes, você pode:

1. **Criar um `.env.test`** específico para testes
2. **Definir variáveis no teste**:

```java
@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class MyTest {
    // ...
}
```

## 📚 Referências

- [dotenv-java no GitHub](https://github.com/cdimascio/dotenv-java)
- [Spring Boot External Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- [ApplicationContextInitializer](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/ApplicationContextInitializer.html)
