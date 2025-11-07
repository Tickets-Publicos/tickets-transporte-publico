"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";

export default function PrivateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();

  const handleLoginClick = useCallback(() => {
    // Para logar, redirecionamos para a home (pública) onde o login está disponível
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <Header onLoginClick={handleLoginClick} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
