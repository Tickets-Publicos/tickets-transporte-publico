import { createAuthClient } from "better-auth/react";
import { customSessionClient } from "better-auth/client/plugins";
import type { auth } from "./auth.server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

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

// Helper para fazer chamadas autenticadas ao backend Java
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getBackendToken();
  
  if (!token) {
    throw new Error("Não autenticado");
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401) {
    // Token expirado ou inválido, redireciona para login
    throw new Error("Sessão expirada");
  }

  return response;
}

// Helper para fazer requisições GET autenticadas
export async function authenticatedGet<T>(endpoint: string): Promise<T> {
  const response = await authenticatedFetch(endpoint);
  
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  
  return response.json();
}

// Helper para fazer requisições POST autenticadas
export async function authenticatedPost<T>(
  endpoint: string,
  data?: unknown
): Promise<T> {
  const response = await authenticatedFetch(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  
  return response.json();
}

// Helper para fazer requisições PUT autenticadas
export async function authenticatedPut<T>(
  endpoint: string,
  data?: unknown
): Promise<T> {
  const response = await authenticatedFetch(endpoint, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  
  return response.json();
}

// Helper para fazer requisições DELETE autenticadas
export async function authenticatedDelete<T>(endpoint: string): Promise<T> {
  const response = await authenticatedFetch(endpoint, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  
  return response.json();
}
