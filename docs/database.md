# 🗄️ Banco de Dados e Migrations

Guia completo de gerenciamento do banco de dados com Flyway.

## Tecnologias

- **PostgreSQL 16**
- **Flyway** para versionamento e migrations
- **Hibernate JPA** para mapeamento objeto-relacional
- **Docker** para ambiente de desenvolvimento

## Quick Start

### Executar Migrations

```bash
cd apps/api-java
./mvnw flyway:migrate \
  -Dflyway.url=jdbc:postgresql://localhost:54323/tickets \
  -Dflyway.user=postgres \
  -Dflyway.password=postgres
```

### Gerar Nova Migration

```bash
# Na raiz do projeto
pnpm migrate:gen

# Com nome customizado
cd apps/api-java
powershell -File ./scripts/gen-migration -migrationName "add_user_table"
```

## Como Funciona

### 1. Estrutura

Migrations ficam em: `apps/api-java/src/main/resources/db/migration/`

Nomenclatura: `V{número}__{descrição}.sql`

Exemplos:
- ✅ `V1__baseline.sql`
- ✅ `V2__add_user_fields.sql`
- ❌ `v1_baseline.sql` (V minúsculo)
- ❌ `V1_baseline.sql` (um underscore)

### 2. Geração Automática

O script `gen-migration.ps1`:
1. Carrega variáveis do `.env`
2. Executa `SchemaExporter.java` que usa Hibernate para gerar DDL
3. Calcula próximo número de versão
4. Cria arquivo em `db/migration/`

### 3. Aplicação

Flyway mantém histórico na tabela `flyway_schema_history` e aplica apenas migrations pendentes.

## Comandos

```bash
# Verificar status
./mvnw flyway:info

# Validar migrations
./mvnw flyway:validate

# Reparar histórico (se necessário)
./mvnw flyway:repair
```

## Seeds Iniciais

O projeto inclui migrations de seed:

- **V2__seed_default_locations.sql**: Locais de SP (pontos de ônibus, metrô, trem)
- **V3__seed_default_categories.sql**: Categorias padrão

## Fluxo de Trabalho

1. **Modificar Entidade JPA**

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    private String id;
    
    @Column(nullable = false, unique = true)
    private String email;
}
```

2. **Gerar Migration**

```bash
pnpm migrate:gen
```

3. **Revisar SQL Gerado**

Abra `src/main/resources/db/migration/V{n}__.sql` e ajuste se necessário.

4. **Aplicar**

```bash
./mvnw flyway:migrate
```

5. **Testar**

```bash
pnpm dev
```

## Troubleshooting

### Checksum mismatch

Migration já aplicada foi alterada.

**Solução (DEV):**

```bash
docker exec -i tickets-postgres psql -U postgres -c "DROP DATABASE tickets; CREATE DATABASE tickets;"
./mvnw flyway:migrate
```

### Container não encontrado

```bash
docker ps -a
docker start tickets-postgres
```

### Migrations não detectadas

Verifique:
- Arquivos em `src/main/resources/db/migration/`
- Nomenclatura: `V{número}__{descrição}.sql` (dois underscores!)

## PostgreSQL via Docker

```bash
# Conectar ao banco
docker exec -it tickets-postgres psql -U postgres -d tickets

# Comandos úteis no psql
\dt                # Listar tabelas
\d users          # Ver estrutura da tabela
SELECT * FROM flyway_schema_history;  # Ver histórico migrations
\q                # Sair
```

## Boas Práticas

1. **Nunca altere migrations aplicadas em produção**
2. **Sempre revise o DDL gerado** pelo Hibernate
3. **Use nomes descritivos** nas migrations
4. **Teste localmente** antes de commitar
5. **Commit migrations junto com código** das entidades

## Referências

- [Flyway Documentation](https://flywaydb.org/documentation/)
- [Hibernate Schema Generation](https://docs.jboss.org/hibernate/orm/)
- [Spring Boot Database Migration](https://docs.spring.io/spring-boot/reference/howto/data-initialization.html)
