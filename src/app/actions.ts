"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTool } from "@/lib/data";
import {
  SESSION_COOKIE,
  WORKSPACE_COOKIE,
  cookieOptions,
  encodeSession,
  getSession,
  getWorkspace,
  type Session,
} from "@/lib/session";

export type AuthState = { error?: string } | undefined;

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  return { email };
}

async function startSession(session: Session, next: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSession(session), cookieOptions);
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
}

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const result = readCredentials(formData);
  if ("error" in result) return result;
  const name = result.email.split("@")[0].replace(/[._-]+/g, " ");
  await startSession(
    {
      name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
      email: result.email,
      plan: "pro",
      role: "creator",
    },
    String(formData.get("next") ?? "/dashboard"),
  );
}

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Please enter your name." };
  const result = readCredentials(formData);
  if ("error" in result) return result;
  const requested = String(formData.get("plan") ?? "");
  const plan = requested === "pro" || requested === "business" ? requested : "starter";
  await startSession({ name, email: result.email, plan, role: "user" }, "/dashboard");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/");
}

export async function toggleWorkspaceTool(slug: string) {
  if (!getTool(slug)) return;
  const session = await getSession();
  if (!session) redirect(`/login?next=/marketplace/${slug}`);
  const current = await getWorkspace();
  const next = current.includes(slug)
    ? current.filter((s) => s !== slug)
    : [...current, slug];
  const store = await cookies();
  store.set(WORKSPACE_COOKIE, next.join(","), cookieOptions);
  revalidatePath("/dashboard", "layout");
  revalidatePath(`/marketplace/${slug}`);
}

export async function changePlan(formData: FormData) {
  const plan = String(formData.get("plan")) as Session["plan"];
  if (!["starter", "pro", "business"].includes(plan)) return;
  const session = await getSession();
  if (!session) redirect("/signup");
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSession({ ...session, plan }), cookieOptions);
  revalidatePath("/dashboard", "layout");
}

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const name = String(formData.get("name") ?? "").trim() || session.name;
  const role = formData.get("creator") === "on" ? "creator" : "user";
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSession({ ...session, name, role }), cookieOptions);
  revalidatePath("/dashboard", "layout");
}
