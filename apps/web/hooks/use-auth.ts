// web/hooks/use-auth.ts
"use client";

import { useSession, signOut as betterAuthSignOut, clearTokenCache } from "@/lib/auth.client";
import type { User } from "@/lib/api/types";
import { UserRole } from "@/lib/api/types";

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

  // Converte a sessão do Better Auth (que já tem TODOS os dados do backend)
  // para o tipo User esperado pelos componentes
  // O role vem do onSignIn callback que retorna os dados do backend
  const user: User | null = session?.user ? {
    id: session.user.id, // ID do backend Java!
    email: session.user.email,
    name: session.user.name,
    role: ((session.user as BetterAuthUser).role || "PEDESTRIAN") as UserRole,
    createdAt: session.user.createdAt.toISOString(),
    updatedAt: session.user.updatedAt.toISOString(),
  } : null;

  // Função de logout que limpa o cache do token
  const signOut = async () => {
    clearTokenCache();
    await betterAuthSignOut();
  };

  return {
    user,
    isLoading: isPending,
    isAuthenticated: !!user,
    signOut,
  };
}