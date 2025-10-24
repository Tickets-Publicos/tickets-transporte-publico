// web/app/(public)/layout.tsx
"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LoginForm } from "@/components/auth/login-form";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [openLogin, setOpenLogin] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onLoginClick={() => setOpenLogin(true)} />

      <main className="container mx-auto px-4 py-8">{children}</main>

      <Sheet open={openLogin} onOpenChange={setOpenLogin}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Entrar</SheetTitle>
          </SheetHeader>
          <LoginForm />
        </SheetContent>
      </Sheet>
    </div>
  );
}
