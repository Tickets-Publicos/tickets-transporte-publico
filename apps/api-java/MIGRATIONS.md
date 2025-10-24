# Guia de Migrations com Flyway

Este documento explica como gerar e executar migrations no projeto usando **Flyway** e **Hibernate JPA**.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Gerando Migrations](#gerando-migrations)
- [Executando Migrations](#executando-migrations)
- [Comandos Úteis](#comandos-úteis)
- [Fluxo de Trabalho Recomendado](#fluxo-de-trabalho-recomendado)
- [Troubleshooting](#troubleshooting)

---

## Visão Geral

O projeto utiliza:

- **Flyway** para versionamento e aplicação de migrations
- **Hibernate JPA** para geração automática do schema DDL
- **PostgreSQL 17** como banco de dados
- **Scripts PowerShell** para automatizar a geração de migrations

As migrations são armazenadas em: `src/main/resources/db/migration/`

---

## Pré-requisitos

Antes de trabalhar com migrations, certifique-se de que:

1. **Docker está rodando** com o container PostgreSQL ativo:

   ```powershell
   docker ps
   # Deve mostrar o container 'tickets-postgres' rodando
   ```

2. **Variáveis de ambiente configuradas** no arquivo `.env` na raiz do projeto:

   ```env
   SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/tickets
   SPRING_DATASOURCE_USERNAME=postgres
   SPRING_DATASOURCE_PASSWORD=postgres
   ```

3. **Dependencies instaladas**:
   ```powershell
   pnpm install
   ```

---

## Gerando Migrations

### Comando Principal

Para gerar uma nova migration baseada nas suas entidades JPA:

```powershell
# Na raiz do projeto
pnpm migrate:gen

# Ou especificando um nome customizado
cd apps/api-java
powershell -ExecutionPolicy Bypass -File ./scripts/gen-migration.ps1 -migrationName "add_user_table"
```

### O que acontece internamente?

1. O script carrega as variáveis do arquivo `.env`
2. Executa `SchemaExporter.java` que:
   - Usa Hibernate para gerar DDL a partir das entidades JPA
   - Salva o output em `src/main/resources/db/changelog/jpa_create.sql`
3. Calcula automaticamente o próximo número de versão (ex: V1, V2, V3...)
4. Cria o arquivo final em `src/main/resources/db/migration/V{n}__{nome}.sql`
5. Adiciona um cabeçalho com timestamp e informações úteis

### Exemplo de Output

```
Loading env from C:\...\tickets-transporte-publico\.env
Generating migration from JPA entities using Hibernate...
Exporting JPA schema DDL...
Starting SchemaExporter (background job)...
✔ JPA schema exported successfully
Creating migration SQL: V2__add_user_table.sql...
✔ Migration generated: C:\...\db\migration\V2__add_user_table.sql
```

---

## Executando Migrations

### Aplicar todas as migrations pendentes

```powershell
# Via pnpm (na raiz do projeto)
cd apps/api-java
./mvnw.ps1 `
  -Dflyway.url=jdbc:postgresql://localhost:5432/tickets `
  -Dflyway.user=postgres `
  -Dflyway.password=postgres `
  flyway:migrate
```

> Nota: Se o wrapper do Maven (mvnw) não conseguir baixar dependências por falta de internet, use um Maven local instalado (mvn) ou rode via Docker/CI.

**Output esperado:**

```
[INFO] Migrating schema "public" to version "2 - add user table"
[INFO] Successfully applied 1 migration to schema "public", now at version v2
```

### Validar migrations

Verifica se as migrations aplicadas no banco correspondem aos arquivos locais:

```powershell
./mvnw.ps1 `
  -Dflyway.url=jdbc:postgresql://localhost:5432/tickets `
  -Dflyway.user=postgres `
  -Dflyway.password=postgres `
  flyway:validate
```

### Verificar status das migrations

Mostra quais migrations foram aplicadas e quais estão pendentes:

```powershell
./mvnw.ps1 `
  -Dflyway.url=jdbc:postgresql://localhost:5432/tickets `
  -Dflyway.user=postgres `
  -Dflyway.password=postgres `
  flyway:info
```

**Output exemplo:**

```
+-----------+---------+------------------+------+---------------------+---------+
| Category  | Version | Description      | Type | Installed On        | State   |
+-----------+---------+------------------+------+---------------------+---------+
| Versioned | 1       | baseline         | SQL  | 2025-10-22 22:54:33 | Success |
| Versioned | 2       | add user table   | SQL  |                     | Pending |
+-----------+---------+------------------+------+---------------------+---------+
```

### Limpar o banco (⚠️ CUIDADO - apenas em DEV!)

```powershell
# Flyway clean está desabilitado por segurança
# Use Docker para recriar o banco:
docker exec -i tickets-postgres psql -U postgres -c "DROP DATABASE IF EXISTS tickets;"
docker exec -i tickets-postgres psql -U postgres -c "CREATE DATABASE tickets;"

# Depois aplique as migrations novamente
./mvnw.ps1 -Dflyway.url=jdbc:postgresql://localhost:5432/tickets -Dflyway.user=postgres -Dflyway.password=postgres flyway:migrate
```

---

## Comandos Úteis

### Verificar conexão com o banco

```powershell
docker exec -i tickets-postgres psql -U postgres -c "\l"
```

### Conectar ao PostgreSQL via CLI

```powershell
docker exec -it tickets-postgres psql -U postgres -d tickets
```

Dentro do psql:

```sql
-- Listar tabelas
\dt

-- Ver estrutura de uma tabela
\d users

-- Ver histórico de migrations do Flyway
SELECT * FROM flyway_schema_history ORDER BY installed_rank;

-- Sair
\q
```

### Reparar histórico do Flyway (se necessário)

Se você alterou uma migration já aplicada (não recomendado!):

```powershell
./mvnw.ps1 `
  -Dflyway.url=jdbc:postgresql://localhost:5432/tickets `
  -Dflyway.user=postgres `
  -Dflyway.password=postgres `
  flyway:repair
```

---

## Fluxo de Trabalho Recomendado

### 1. Criar/Modificar Entidades JPA

Edite suas classes em `src/main/java/com/tickets/api/model/entity/`:

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String email;

    // ... outros campos
}
```

### 2. Gerar a Migration

```powershell
pnpm migrate:gen
```

### 3. Revisar o Arquivo Gerado

Abra `src/main/resources/db/migration/V{n}__{nome}.sql` e:

- Verifique se o DDL está correto
- Adicione dados iniciais se necessário (seeds)
- Ajuste constraints ou índices conforme necessário

#### Seeds iniciais

Este repositório inclui uma migration de seed para locais padrão de São Paulo:

- `V2__seed_default_locations.sql`: insere pontos de ônibus (BusStop), estações de metrô (MetroStation) e estações de trem (Location base) como dados iniciais.

Caso queira alterar os locais padrão, edite essa migration antes de aplicá-la no ambiente. Para ambientes já migrados, crie uma nova migration de seed incremental (ex.: `V3__seed_more_locations.sql`).

### 4. Aplicar a Migration

```powershell
cd apps/api-java
./mvnw.ps1 -Dflyway.url=jdbc:postgresql://localhost:5432/tickets -Dflyway.user=postgres -Dflyway.password=postgres flyway:migrate
```

### 5. Validar

```powershell
./mvnw.ps1 -Dflyway.url=jdbc:postgresql://localhost:5432/tickets -Dflyway.user=postgres -Dflyway.password=postgres flyway:validate
```

### 6. Testar a Aplicação

```powershell
pnpm dev
```

Certifique-se de que a aplicação inicia sem erros e as entidades JPA estão mapeadas corretamente.

---

## Troubleshooting

### ❌ Erro: "Writing to script was requested, but no script file was specified"

**Causa:** As propriedades JPA de geração de schema não estão configuradas.

**Solução:** Verifique se `SchemaExporter.java` está configurando todas as propriedades necessárias:

```java
System.setProperty("spring.jpa.properties.jakarta.persistence.schema-generation.scripts.create-target",
    "src/main/resources/db/changelog/jpa_create.sql");
```

### ❌ Erro: "Validate failed: Migration checksum mismatch"

**Causa:** Você alterou uma migration que já foi aplicada no banco.

**Solução 1 (DEV):** Recriar o banco do zero:

```powershell
docker exec -i tickets-postgres psql -U postgres -c "DROP DATABASE tickets;"
docker exec -i tickets-postgres psql -U postgres -c "CREATE DATABASE tickets;"
./mvnw.ps1 -Dflyway.url=jdbc:postgresql://localhost:5432/tickets -Dflyway.user=postgres -Dflyway.password=postgres flyway:migrate
```

**Solução 2:** Usar `flyway:repair` (apenas se souber o que está fazendo):

```powershell
./mvnw.ps1 -Dflyway.url=jdbc:postgresql://localhost:5432/tickets -Dflyway.user=postgres -Dflyway.password=postgres flyway:repair
```

### ❌ Erro: "No such container: tickets-postgres"

**Causa:** Container PostgreSQL não está rodando.

**Solução:**

```powershell
# Verificar containers
docker ps -a

# Iniciar o container
docker start tickets-postgres

# Ou recriar via docker-compose
docker-compose -f docker-compose-dev.yml up -d postgres
```

### ❌ Erro: "Connection refused" ao conectar no PostgreSQL

**Causa:** PostgreSQL não está aceitando conexões.

**Solução:**

```powershell
# Verificar logs do container
docker logs tickets-postgres

# Verificar se a porta está exposta
docker ps

# Tentar reiniciar o container
docker restart tickets-postgres
```

### ❌ Migrations não são detectadas pelo Flyway

**Causa:** Arquivos estão no diretório errado ou não seguem o padrão de nomenclatura.

**Solução:** Verifique:

1. Arquivos devem estar em `src/main/resources/db/migration/`
2. Nomenclatura: `V{número}__{descrição}.sql` (dois underscores!)
3. Exemplos válidos:
   - ✅ `V1__baseline.sql`
   - ✅ `V2__add_user_fields.sql`
   - ✅ `V10__create_indexes.sql`
   - ❌ `v1_baseline.sql` (V minúsculo)
   - ❌ `V1_baseline.sql` (um underscore só)

### ⚠️ Flyway clean está desabilitado

**Causa:** Configuração de segurança em `application.properties`.

**Solução:** Use Docker para recriar o banco (veja seção "Limpar o banco" acima).

---

## Boas Práticas

1. **Nunca altere migrations já aplicadas em produção**
   - Crie uma nova migration para fazer mudanças incrementais

2. **Sempre revise o DDL gerado**
   - O Hibernate pode gerar código não otimizado
   - Ajuste índices, constraints e tipos de dados conforme necessário

3. **Use nomes descritivos**
   - ✅ `V2__add_user_email_verification.sql`
   - ❌ `V2__changes.sql`

4. **Teste as migrations em ambiente local antes de commitar**

   ```powershell
   # Limpar banco
   docker exec -i tickets-postgres psql -U postgres -c "DROP DATABASE tickets; CREATE DATABASE tickets;"

   # Aplicar todas as migrations do zero
   ./mvnw.ps1 -Dflyway.url=jdbc:postgresql://localhost:5432/tickets -Dflyway.user=postgres -Dflyway.password=postgres flyway:migrate

   # Testar aplicação
   pnpm dev
   ```

5. **Mantenha migrations reversíveis quando possível**
   - Documente como reverter mudanças complexas
   - Considere criar migrations de rollback separadas se necessário

6. **Commit migrations junto com o código das entidades**
   - Isso garante que o código e o schema estão sempre sincronizados

---

## Referências

- [Flyway Documentation](https://flywaydb.org/documentation/)
- [Flyway Maven Plugin](https://flywaydb.org/documentation/usage/maven/)
- [Hibernate Schema Generation](https://docs.jboss.org/hibernate/orm/6.3/userguide/html_single/Hibernate_User_Guide.html#schema-generation)
- [Spring Boot Database Migration](https://docs.spring.io/spring-boot/reference/howto/data-initialization.html)

---

**Última atualização:** 22 de outubro de 2025
