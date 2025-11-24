# 🧪 Testes

Documentação completa dos testes do projeto.

## Visão Geral

- **API Java**: 13 arquivos de teste (JUnit + Mockito)
- **Frontend (Web)**: 1 arquivo de teste (Jest + React Testing Library)

## API Java - Testes Unitários

### Controllers (6 arquivos)

#### 1. `AuthControllerTest.java`
- ✅ `syncUser_withValidSecret_shouldReturn200`
- ✅ `syncUser_withInvalidSecret_shouldReturn403`
- ✅ `syncUser_withMissingSecret_shouldReturn400`
- ✅ `syncUser_withServiceException_shouldReturn500`
- ✅ `getCurrentUser_withValidAttributes_shouldReturn200`
- ✅ `getCurrentUser_withoutUserId_shouldReturn401`
- ✅ `getCurrentUser_withoutUserEmail_shouldReturn401`
- ✅ `getCurrentUser_withoutAttributes_shouldReturn401`
- ✅ `login_withValidCredentials_shouldReturn200`

#### 2. `CategoryControllerTest.java`
- Testes de listagem e gerenciamento de categorias

#### 3. `LocationControllerTest.java`
- Testes de CRUD de localizações

#### 4. `ReportControllerTest.java`
- Testes de criação e gerenciamento de relatórios

#### 5. `StatsControllerTest.java`
- Testes de estatísticas

#### 6. `UserControllerTest.java`
- Testes de gerenciamento de usuários

### Services (7 arquivos)

#### 1. `CategoryServiceTest.java`
- Lógica de negócio de categorias

#### 2. `LocationServiceTest.java`
- Lógica de negócio de localizações

#### 3. `PasswordServiceTest.java`
- Testes de hash e validação de senhas (BCrypt)

#### 4. `ReportServiceTest.java`
- Lógica de negócio de relatórios

#### 5. `StatsServiceTest.java`
- Cálculos de estatísticas

#### 6. `UserServiceEmailPasswordTest.java`
- Autenticação com email/senha

### 7. `UserServiceTest.java`
- Serviços gerais de usuário

## Frontend (Next.js) - Testes

#### `components/layout/header.test.tsx`
- Testes do componente Header
- Renderização, navegação, estado de autenticação

## Executar Testes

### API Java

```bash
# Todos os testes
cd apps/api-java
./mvnw test

# Via pnpm (raiz)
pnpm --filter=java test

# Com relatório de cob ertura
./mvnw verify
# Relatório em: target/site/jacoco/index.html
```

### Frontend

```bash
# Todos os testes
cd apps/web
pnpm test
```

## Cobertura de Código

O projeto usa **JaCoCo** para cobertura de código Java.

```bash
# Gerar relatório
cd apps/api-java
./mvnw clean verify

# Abrir relatório
# Windows
start target/site/jacoco/index.html

# Linux/Mac
open target/site/jacoco/index.html
```

## Estrutura dos Testes

### Java (JUnit + Mockito)

```java
@ExtendWith(MockitoExtension.class)
class AuthControllerTest {
    private MockMvc mockMvc;
    
    @Mock
    private UserService userService;
    
    @InjectMocks
    private AuthController authController;
    
    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }
    
    @Test
    void login_withValidCredentials_shouldReturn200() throws Exception {
        // Arrange
        LoginRequest request = new LoginRequest();
        when(userService.authenticateWithEmailPassword(...)).thenReturn(...);
        
        // Act & Assert
        mockMvc.perform(post("/auth/login")...)
                .andExpect(status().isOk());
    }
}
```

### Next.js (Jest + RTL)

```typescript
import { render, screen } from '@testing-library/react';
import Header from './header';

describe('Header', () => {
  it('renders navigation links', () => {
    render(<Header />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
```

## CI/CD

Os testes são executados automaticamente no GitHub Actions em todo PR e push para `main`.

Ver: `.github/workflows/ci-cd.yml`

## Adicionar Novos Testes

### Java

1. Criar arquivo `*Test.java` em `src/test/java/`
2. Seguir padrão `@ExtendWith(MockitoExtension.class)`
3. Usar `@Mock` e `@InjectMocks`
4. Nomear métodos: `methodName_condition_expectedResult`

### TypeScript

1. Criar arquivo `*.test.tsx` junto ao componente
2. Importar `@testing-library/react`
3. Usar `describe` e `it`/`test`

## Roadmap

- [ ] Aumentar cobertura de testes no frontend
- [ ] Adicionar testes E2E (Playwright)
- [ ] Testes de integração entre Java e Next.js
- [ ] Testes de performance/carga
