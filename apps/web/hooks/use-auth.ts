// web/hooks/use-auth.ts
"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, subscribeToAuth, type User } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());

  useEffect(() => {
    // Sincroniza com o estado atual
    setUser(getCurrentUser());

    // Inscreve para mudanças
    const unsubscribe = subscribeToAuth((newUser) => {
      setUser(newUser);
    });

    return unsubscribe;
  }, []);

  return user;
}