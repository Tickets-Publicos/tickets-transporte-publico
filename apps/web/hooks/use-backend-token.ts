"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth.client";
import { getBackendToken, clearTokenCache } from "@/lib/auth.client";

/**
 * Hook para obter o token JWT para comunicação com o backend
 */
export function useBackendToken() {
  const { data: session } = useSession();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchToken() {
      if (!session?.user) {
        setToken(null);
        setLoading(false);
        clearTokenCache();
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const backendToken = await getBackendToken();
        setToken(backendToken);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Erro ao obter token"));
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, [session?.user]);

  return { token, loading, error };
}
