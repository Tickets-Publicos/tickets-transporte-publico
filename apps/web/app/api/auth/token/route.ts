import { auth, generateBackendToken, syncUserToBackend } from "@/lib/auth.server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Obtém a sessão atual do Better Auth
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Sincroniza o usuário no backend se ainda não existir
    await syncUserToBackend({
      ...session.user,
      image: session.user.image || undefined,
      role: session.user.role || "PEDESTRIAN",
    });

    // Gera um JWT que o backend Java pode validar
    const token = await generateBackendToken(session);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating backend token:", error);
    return NextResponse.json(
      { error: "Erro ao gerar token" },
      { status: 500 }
    );
  }
}
