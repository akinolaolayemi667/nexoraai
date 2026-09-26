import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { routes } from "@/lib/routes";
import { AuthContext, useAuth, type AuthContextValue } from "@/lib/auth/auth-context";
import * as auth from "@/lib/auth/mock-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(auth.readSession);
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === auth.SESSION_KEY || event.key === null) setSession(auth.readSession());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      signedOut,
      async signIn(input) {
        const next = await auth.signIn(input);
        setSession(next);
        setSignedOut(false);
        return next.user;
      },
      async signUp(input) {
        const next = await auth.signUp(input);
        setSession(next);
        setSignedOut(false);
        return next.user;
      },
      async signInWithGoogle(remember) {
        const next = await auth.signInWithGoogle(remember);
        setSession(next);
        setSignedOut(false);
        return next.user;
      },
      async requestPasswordReset(email) {
        await auth.requestPasswordReset(email);
      },
      signOut() {
        auth.clearSession();
        setSession(null);
        setSignedOut(true);
      },
    }),
    [session, signedOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, signedOut } = useAuth();
  const location = useLocation();

  if (!user) {
    if (signedOut) return <Navigate to={routes.login} state={{ signedOut: true }} replace />;
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${routes.login}?redirect=${redirect}`} replace />;
  }
  return children;
}
