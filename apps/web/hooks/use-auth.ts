// web/hooks/use-auth.ts
"use client";

import { useSession, signOut as betterAuthSignOut, clearTokenCache } from "@/lib/auth.client";
import { usersApi } from "@/lib/api/users";
import { useEffect, useState } from "react";
import type { User } from "@/lib/api/types";

export function useAuth() {
  const { data: session, isPending } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user) {
        console.log("[useAuth] No session, user set to null");
        setUser(null);
        setIsLoading(false);
        return;
      }

      console.log("[useAuth] Session found:", session.user.email);

      try {
        // Busca os dados completos do usuário do backend (incluindo role)
        console.log("[useAuth] Fetching user from backend...");
        const backendUser = await usersApi.findByEmail(session.user.email);
        console.log("[useAuth] Backend user loaded:", backendUser);
        setUser(backendUser);
      } catch (error) {
        console.error("[useAuth] Error loading user data:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isPending) {
      console.log("[useAuth] Not pending, loading user data...");
      loadUserData();
    } else {
      console.log("[useAuth] Session pending...");
    }
  }, [session, isPending]);

  // Função de logout que limpa o cache do token
  const signOut = async () => {
    clearTokenCache();
    await betterAuthSignOut();
  };

  return {
    user,
    isLoading: isPending || isLoading,
    isAuthenticated: !!user,
    signOut,
  };
}