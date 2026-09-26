import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getPlan } from "@/lib/data";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  if (await getSession()) redirect("/dashboard");
  const { plan } = await searchParams;
  const selected = typeof plan === "string" ? getPlan(plan) : undefined;

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Create your account</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-400">
        {selected
          ? `You're signing up for the ${selected.name} plan.`
          : "Start free — no credit card required."}
      </p>
      <AuthForm mode="signup" plan={selected?.id} />
    </>
  );
}
