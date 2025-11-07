// web/components/layout/header.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import { useAuth } from "@/hooks/use-auth";
import { MapPin, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onLoginClick: () => void;
}

export function Header({ onLoginClick }: HeaderProps) {
  const { user, isAuthenticated, signOut } = useAuth();
  const router = useRouter();
  
  // A role agora vem direto do Better Auth Admin plugin na sessão
  const isAdmin = user?.role === "ADMIN";
  
  console.log("Header - isAuthenticated:", isAuthenticated, "isAdmin:", isAdmin, "role:", user?.role);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
          <MapPin className="h-6 w-6 text-primary" aria-hidden="true" />
          <div>
            <h1 className="text-lg font-bold">Acessibilidade SP</h1>
            <p className="text-xs text-muted-foreground">Sistema de Reportes</p>
          </div>
        </div>

        <nav className="flex items-center space-x-4">
          {isAuthenticated && user ? (
            <>
              {isAdmin && (
                <Link href="/admin/reports">
                  <Button variant="outline" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <UserMenu user={user} onSignOut={signOut} />
            </>
          ) : (
            <Button onClick={onLoginClick} variant="default">
              Entrar
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
