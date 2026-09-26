import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "nexora_session";
export const WORKSPACE_COOKIE = "nexora_workspace";

export type Session = {
  name: string;
  email: string;
  plan: "starter" | "pro" | "business";
  role: "user" | "creator";
};

const secret = process.env.SESSION_SECRET ?? "nexora-dev-secret-change-me";

function sign(payload: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function encodeSession(session: Session) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined): Session | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
  } catch {
    return null;
  }
}

export async function getSession() {
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}

export async function getWorkspace(): Promise<string[]> {
  const store = await cookies();
  const raw = store.get(WORKSPACE_COOKIE)?.value;
  if (!raw) return ["codepilot", "meetmind", "copycraft"];
  return raw.split(",").filter(Boolean);
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};
