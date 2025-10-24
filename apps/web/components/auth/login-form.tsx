"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !name) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha seu nome e email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn(email, name);

      if (result.success) {
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo(a), ${result.user?.name}!`,
        });
        onSuccess();
      } else {
        toast({
          title: "Erro no login",
          description: result.error || "Ocorreu um erro inesperado.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Acesso ao Sistema</CardTitle>
        <CardDescription>
          Entre com seu nome e email para reportar problemas de acessibilidade
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              type="text"
              placeholder="Digite seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              aria-describedby="name-description"
            />
            <p id="name-description" className="text-sm text-muted-foreground">
              Seu nome será usado para identificar seus reportes
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-describedby="email-description"
            />
            <p id="email-description" className="text-sm text-muted-foreground">
              Usaremos seu email para atualizações sobre seus reportes
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            aria-describedby="submit-description"
          >
            {isLoading ? "Entrando..." : "Entrar no Sistema"}
          </Button>
          <p
            id="submit-description"
            className="text-xs text-muted-foreground text-center"
          >
            Ao entrar, você concorda em ajudar a melhorar a acessibilidade do
            transporte público
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
