"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { login, signup } from "@/app/actions";

export function AuthForm({
  mode,
  next,
  plan,
}: {
  mode: "login" | "signup";
  next?: string;
  plan?: string;
}) {
  const [state, action, pending] = useActionState(mode === "login" ? login : signup, undefined);
  const isSignup = mode === "signup";

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      {plan && <input type="hidden" name="plan" value={plan} />}
      {isSignup && (
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm text-zinc-300">
            Full name
          </label>
          <input id="name" name="name" required className="input" placeholder="Ada Lovelace" />
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-zinc-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input"
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm text-zinc-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={isSignup ? "new-password" : "current-password"}
          className="input"
          placeholder="At least 6 characters"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full py-3">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSignup ? "Create account" : "Log in"}
      </button>

      <p className="text-center text-sm text-zinc-400">
        {isSignup ? "Already have an account? " : "New to NexoraAI? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-medium text-violet-300 hover:text-violet-200"
        >
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
