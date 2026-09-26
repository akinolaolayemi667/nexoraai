import { createContext, useContext } from "react";
import type { AuthUser, SignInInput, SignUpInput } from "./mock-auth";

export type AuthContextValue = {
  user: AuthUser | null;
  signedOut: boolean;
  signIn: (input: SignInInput) => Promise<AuthUser>;
  signUp: (input: SignUpInput) => Promise<AuthUser>;
  signInWithGoogle: (remember?: boolean) => Promise<AuthUser>;
  requestPasswordReset: (email: string) => Promise<void>;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

export function useUser() {
  const { user } = useAuth();
  if (!user) throw new Error("useUser must be used on an authenticated route");
  return user;
}
