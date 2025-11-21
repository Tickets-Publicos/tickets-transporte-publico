import { createAuthClient } from "better-auth/react";
import { customSessionClient } from "better-auth/client/plugins";
import type { auth } from "./auth.server";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
  plugins: [
    customSessionClient<typeof auth>(),
  ],
});

// Exporta os métodos do Better Auth
export const { signIn, signUp, signOut, useSession } = authClient;

// Cache do token em memória
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// Helper para obter o token JWT da sessão atual (com cache)
export async function getBackendToken(): Promise<string | null> {
  try {
    // Verifica se há um token em cache válido
    if (cachedToken && Date.now() < tokenExpiry) {
      return cachedToken;
    }

    // Solicita um token JWT ao servidor Next.js que pode ser validado pelo backend Java
    const response = await fetch("/api/auth/token", {
      credentials: "include",
    });
    
    if (!response.ok) {
      cachedToken = null;
      return null;
    }
    
    const data = await response.json();
    
    // Armazena em cache por 6 dias (token expira em 7)
    cachedToken = data.token;
    tokenExpiry = Date.now() + (6 * 24 * 60 * 60 * 1000);
    
    return data.token;
  } catch (error) {
    console.error("Error getting backend token:", error);
    cachedToken = null;
    return null;
  }
}

// Limpa o cache do token
export function clearTokenCache() {
  cachedToken = null;
  tokenExpiry = 0;
}

