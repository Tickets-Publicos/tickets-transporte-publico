// web/hooks/use-auth.ts
"use client";

import { useSession, signOut as betterAuthSignOut, clearTokenCache } from "@/lib/auth.client";
import type { User } from "@/lib/api/types";
import { UserRole } from "@/lib/api/types";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Tipo do usuário do Better Auth incluindo o role customizado
interface BetterAuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  role?: string;
}

export function useAuth() {
  const { data: session, isPending } = useSession();
  const [localUser, setLocalUser] = useState<User | null>(null);
  const router = useRouter();

  // Verifica localStorage para autenticação com email/senha
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      const userId = localStorage.getItem("user_id");
      const userEmail = localStorage.getItem("user_email");
      const userName = localStorage.getItem("user_name");
      const userRole = localStorage.getItem("user_role");

      if (token && userId && userEmail && userName && userRole) {
        setLocalUser({
          id: userId,
          email: userEmail,
          name: userName,
          role: userRole as UserRole,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        setLocalUser(null);
      }
    }
  }, []);

  // Converte a sessão do Better Auth (que já tem TODOS os dados do backend)
  // para o tipo User esperado pelos componentes
  // O role vem do onSignIn callback que retorna os dados do backend
  const oauthUser: User | null = session?.user ? {
    id: session.user.id, // ID do backend Java!
    email: session.user.email,
    name: session.user.name,
    role: ((session.user as BetterAuthUser).role || "PEDESTRIAN") as UserRole,
    createdAt: session.user.createdAt.toISOString(),
    updatedAt: session.user.updatedAt.toISOString(),
  } : null;

  // Prioriza OAuth sobre localStorage
  const user = oauthUser || localUser;

  // Função de logout que limpa o cache do token e localStorage
  const signOut = async () => {
    // Limpa localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_role");
    }
    setLocalUser(null);
    
    // Limpa Better Auth
    clearTokenCache();
    await betterAuthSignOut();
    
    // Redireciona para home
    router.push("/");
    router.refresh();
  };

  return {
    user,
    isLoading: isPending && !localUser,
    isAuthenticated: !!user,
    signOut,
  };
}