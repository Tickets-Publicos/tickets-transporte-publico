import { betterAuth } from "better-auth";
import jwt from "jsonwebtoken";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const JWT_SECRET = process.env.AUTH_SECRET || "your-secret-key-change-in-production";

interface UserInfo {
  id: string;
  email: string;
  name: string;
  image?: string;
  provider?: string;
  providerId?: string;
}

interface SessionInfo {
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
}

// Função para buscar a role do usuário no backend
async function getUserRole(email: string): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/users/by-email/${encodeURIComponent(email)}`, {
      headers: {
        "X-Auth-Secret": JWT_SECRET,
      },
    });
    
    if (!response.ok) {
      return "PEDESTRIAN"; // Role padrão
    }
    
    const user = await response.json();
    return user.role || "PEDESTRIAN";
  } catch (error) {
    console.error("Error fetching user role:", error);
    return "PEDESTRIAN"; // Role padrão em caso de erro
  }
}

export const auth = betterAuth({
  secret: JWT_SECRET,
  
  // Configuração de sessão baseada em JWT (sem banco de dados)
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // 1 dia
  },
  
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ],
  
  // OAuth Providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      enabled: !!process.env.GOOGLE_CLIENT_ID,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      enabled: !!process.env.GITHUB_CLIENT_ID,
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      enabled: !!process.env.MICROSOFT_CLIENT_ID,
    },
  },
  
  // Callback após autenticação bem-sucedida
  callbacks: {
    async onSignIn(user: UserInfo) {
      // Notifica o backend Java para criar/atualizar o usuário
      try {
        await notifyBackendNewUser(user);
      } catch (error) {
        console.error("Error notifying backend about new user:", error);
        // Não bloqueia o login se o backend falhar
      }
    },
  },
});

export type Session = typeof auth.$Infer.Session;

// Função para notificar o backend Java sobre novo usuário
async function notifyBackendNewUser(user: UserInfo) {
  try {
    const response = await fetch(`${API_URL}/auth/sync-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Token assinado pelo Next.js que o backend pode validar
        "X-Auth-Secret": JWT_SECRET,
      },
      body: JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        provider: user.provider,
        providerId: user.providerId,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error notifying backend:", error);
    throw error;
  }
}

// Função para gerar um JWT que o backend Java pode validar
export async function generateBackendToken(session: SessionInfo) {
  // Busca a role do usuário no backend
  const role = await getUserRole(session.user.email);
  
  return jwt.sign(
    {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: role,
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
