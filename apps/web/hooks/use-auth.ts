// web/hooks/use-auth.ts
"use client";

import { useSession, signOut as betterAuthSignOut } from "@/lib/auth.client";
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
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        // Busca os dados completos do usuário do backend (incluindo role)
        const backendUser = await usersApi.findByEmail(session.user.email);
        setUser(backendUser);
      } catch (error) {
        console.error("Error loading user data:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isPending) {
      loadUserData();
    }
  }, [session, isPending]);

  return {
    user,
    isLoading: isPending || isLoading,
    isAuthenticated: !!user,
    signOut: betterAuthSignOut,
  };
}