import { auth, generateBackendToken } from "@/lib/auth.server";
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
