// web/lib/auth.ts
import { usersApi } from "./api/users";
import type { User } from "./api/types";

const STORAGE_KEY = "current_user";

// Event system para notificar mudanças de autenticação
type AuthListener = (user: User | null) => void;
const authListeners = new Set<AuthListener>();

export type { User };

export function subscribeToAuth(listener: AuthListener): () => void {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

function notifyAuthChange(user: User | null): void {
  authListeners.forEach(listener => listener(user));
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  notifyAuthChange(user);
}

export function clearCurrentUser(): void {
  localStorage.removeItem(STORAGE_KEY);
  notifyAuthChange(null);
}

export function initializeAuth(): void {
  const user = getCurrentUser();
  if (user && !user.id) {
    clearCurrentUser();
  }
}

export async function loginOrRegister(
  email: string,
  name: string
): Promise<User> {
  try {
    const existingUser = await usersApi.findByEmail(email);
    setCurrentUser(existingUser);
    return existingUser;
  } catch (error: unknown) {
    const isApiError = (e: unknown): e is { status?: number } =>
      typeof e === "object" &&
      e !== null &&
      "status" in e &&
      typeof e.status === "number";

    if (isApiError(error) && error.status === 404) {
      const newUser = await usersApi.create({ email, name });
      setCurrentUser(newUser);
      return newUser;
    }
    throw error;
  }
}

export async function signIn(
  email: string,
  name: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const user = await loginOrRegister(email, name);
    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("Error signing in:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Ocorreu um erro inesperado",
    };
  }
}

export function signOut(): void {
  clearCurrentUser();
}