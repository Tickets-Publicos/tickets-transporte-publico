"use client";

import { useBackendToken } from "@/hooks/use-backend-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Hook para fazer requisições autenticadas ao backend Java
 * 
 * Exemplo de uso:
 * ```tsx
 * const { fetchWithAuth } = useAuthenticatedFetch();
 * 
 * // GET
 * const users = await fetchWithAuth('/users');
 * 
 * // POST
 * const newUser = await fetchWithAuth('/users', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'John' })
 * });
 * ```
 */
export function useAuthenticatedFetch() {
  const { token, loading } = useBackendToken();

  async function fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!token) {
      throw new Error("Não autenticado");
    }

    const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Sessão expirada");
      }
      throw new Error(`Request failed: ${response.status}`);
    }

    // Se não houver conteúdo, retorna null
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return null as T;
    }

    return response.json();
  }

  return {
    fetchWithAuth,
    loading,
    isReady: !!token,
  };
}
