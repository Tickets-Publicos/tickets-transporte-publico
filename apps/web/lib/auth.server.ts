import { betterAuth, type BetterAuthOptions } from "better-auth";
import { customSession } from "better-auth/plugins";
import { createAuthMiddleware, APIError } from "better-auth/api";
import jwt from "jsonwebtoken";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://api:8080";
const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || "your-super-secret-key-change-this-in-production-min-32-chars";

interface UserInfo {
  id: string;
  email: string;
  name: string;
  image?: string;
  provider?: string;
  providerId?: string;
  role?: string;
}

interface SessionInfo {
  user: {
    id: string;
    email: string;
    name: string;
    role?: string | null;
  };
  session?: {
    token: string;
    expiresAt: Date;
  };
}

// Configuração base do Better Auth
const options = {
  secret: JWT_SECRET,

  // Configuração de sessão baseada em cookies (sem banco de dados)
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // 1 dia
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // Cache de 5 minutos no cookie
    }
  },

  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://web:3000",
  ],

  // OAuth Providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    },
  },

  // Email & Password Provider (Delegado para o Backend Java)
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    password: {
      verify: async ({ password, hash }: { password: string; hash: string }) => {
        // Se a senha for o token mágico injetado pelo hook 'before.signInEmail',
        // significa que a autenticação já foi realizada com sucesso no Java.
        if (password === "__VERIFIED_BY_JAVA__") {
          console.log("[Auth] Magic token detected. Skipping local verification.");
          return true;
        }

        // Fallback: Se por algum motivo o hook falhar ou não for chamado,
        // tentamos verificar normalmente (o que provavelmente falhará sem DB).
        console.log("[Auth] Standard verification triggered (should be skipped).");
        return false; 
      },
    },
  },
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...options,
  plugins: [
    // Plugin customSession para adicionar role à sessão
    customSession(async ({ user, session }) => {
      // Busca o usuário do backend para garantir que temos o ID e role corretos
      try {
        const backendUser = await notifyBackendNewUser({
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image || undefined,
        });
        console.log("[customSession] Backend user:", backendUser);
        console.log("[customSession] Original user:", user);

        return {
          user: {
            ...user,
            id: backendUser.id, // USA O ID DO BACKEND!
            role: backendUser.role || "PEDESTRIAN",
          },
          session,
        };
      } catch (error) {
        console.error("[customSession] Error syncing with backend:", error);
        // Em caso de erro, retorna o usuário sem modificações
        return {
          user: {
            ...user,
            role: "PEDESTRIAN",
          },
          session
        };
      }
    }, options), // Passa options para inferência de tipos correta
  ],
  // Callback após autenticação bem-sucedida
  callbacks: {
    async onSignIn(user: UserInfo) {
      console.log("[Auth] onSignIn callback triggered for user:", {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
      });

      // Notifica o backend Java para criar/atualizar o usuário
      // O backend retorna o usuário COM TODOS OS DADOS (ID, ROLE, etc)
      try {
        console.log("[Auth] Calling notifyBackendNewUser...");
        const backendUser = await notifyBackendNewUser(user);
        console.log("[Auth] SUCCESS - User synced successfully:", backendUser);

        // IMPORTANTE: Retorna o ID do backend Java, não o do Better Auth
        // Isso garante que o usuário terá o mesmo ID em todo o sistema
        return {
          user: {
            id: backendUser.id, // USA O ID DO BACKEND JAVA!
            email: backendUser.email,
            name: backendUser.name,
            image: user.image,
            role: backendUser.role || "PEDESTRIAN",
            createdAt: new Date(backendUser.createdAt),
            updatedAt: new Date(backendUser.updatedAt),
          },
        };
      } catch (error) {
        console.error("[Auth] ERROR - Error notifying backend about new user:", error);
        // Se falhar, não permite o login
        throw error;
      }
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const path = ctx.path; 
      
      console.log("[Auth Hook] DEBUG: Hook triggered via createAuthMiddleware.");
      console.log("[Auth Hook] DEBUG: Path:", path);

      // Intercepta Registro
      if (path?.includes("/sign-up/email")) {
        console.log("[Auth Hook] Intercepting signUpEmail...");
        const body = ctx.body as any;
        const { email, password, name } = body;

        try {
          console.log("[Auth Hook] Registering user in Java Backend:", email);
          const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("[Auth Hook] Java Registration Failed:", errorText);
            
            let message = errorText;
            try {
                const json = JSON.parse(errorText);
                if (json.message) message = json.message;
                else if (json.error) message = json.error;
            } catch (e) {}
            
            return new Response(JSON.stringify({ message }), { 
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
          }

          const javaUser = await response.json();
          console.log("[Auth Hook] Java Registration Success:", javaUser.id);
        } catch (error) {
          console.error("[Auth Hook] Error in signUpEmail hook:", error);
          return new Response(JSON.stringify({ message: "Internal Server Error during registration" }), { 
              status: 500,
              headers: { "Content-Type": "application/json" }
          });
        }
      }

      // Intercepta Login
      if (path?.includes("/sign-in/email")) {
        console.log("[Auth Hook] Intercepting signInEmail...");
        const body = ctx.body as any;
        const { email, password } = body;

        try {
          console.log("[Auth Hook] Verifying credentials with Java Backend:", email);
          const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("[Auth Hook] Java Login Failed:", errorText);
            
            let message = "Invalid email or password";
            try {
                const json = JSON.parse(errorText);
                if (json.message) message = json.message;
                else if (json.error) message = json.error;
            } catch (e) {}

            return new Response(JSON.stringify({ message }), { 
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
          }

          const javaUser = await response.json();
          console.log("[Auth Hook] Java Login Success:", javaUser.id);

          // SEGREDO: Injetamos um token mágico na senha.
          body.password = "__VERIFIED_BY_JAVA__";
          
        } catch (error) {
          console.error("[Auth Hook] Error in signInEmail hook:", error);
          return new Response(JSON.stringify({ message: "Internal Server Error during login" }), { 
              status: 500,
              headers: { "Content-Type": "application/json" }
          });
        }
      }
    }),
  },
});

export type Session = typeof auth.$Infer.Session;

// Função para notificar o backend Java sobre novo usuário
async function notifyBackendNewUser(user: UserInfo) {

  try {
    const url = `${API_URL}/auth/sync-user`;
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      provider: user.provider,
      providerId: user.providerId,
    };

    console.log("[Auth] Sending POST to:", url);
    console.log("[Auth] Payload:", payload);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Token assinado pelo Next.js que o backend pode validar
        "X-Auth-Secret": JWT_SECRET,
      },
      body: JSON.stringify(payload),
    });

    console.log("[Auth] Backend response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Auth] ERROR - Backend error response:", errorText);
      throw new Error(`Backend responded with ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log("[Auth] SUCCESS - Backend response body:", result);
    return result;
  } catch (error) {
    console.error("[Auth] ERROR - Error in notifyBackendNewUser:", error);
    throw error;
  }
}

// Função para gerar um JWT que o backend Java pode validar
export async function generateBackendToken(session: SessionInfo) {
  return jwt.sign(
    {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role || "PEDESTRIAN",
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
      issuer: "tickets-frontend",
      audience: "tickets-backend",
    }
  );
}

// Função exportada para sincronizar usuário no backend
// O backend Java decide se cria ou atualiza o usuário
export async function syncUserToBackend(user: UserInfo): Promise<void> {
  try {
    console.log("[Auth] Sincronizando usuário com backend:", user.email);
    await notifyBackendNewUser(user);
  } catch (error) {
    console.error("[Auth] Erro ao sincronizar usuário:", error);
    // Não lança erro para não bloquear a geração do token
  }
}
