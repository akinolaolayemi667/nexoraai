export type AuthUser = {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  provider: "password" | "google";
};

export type Session = {
  user: AuthUser;
  remember: boolean;
  createdAt: number;
};

export type AuthErrorCode = "invalid_credentials" | "email_taken";

export class AuthError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export const SESSION_KEY = "nexora:session";
const ACCOUNTS_KEY = "nexora:mock-accounts";

export const DEMO_CREDENTIALS = { email: "demo@nexora.ai", password: "Nexora2026!" } as const;

const demoUser: AuthUser = {
  id: "usr_demo",
  name: "James Carter",
  email: DEMO_CREDENTIALS.email,
  company: "Nexora HQ",
  role: "Owner",
  provider: "password",
};

type StoredAccount = { user: AuthUser; passwordHash: string };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeEmail = (email: string) => email.trim().toLowerCase();

async function hash(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function readJson<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function readAccounts() {
  return readJson<StoredAccount[]>(localStorage, ACCOUNTS_KEY) ?? [];
}

function writeAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function readSession(): Session | null {
  return readJson<Session>(localStorage, SESSION_KEY) ?? readJson<Session>(sessionStorage, SESSION_KEY);
}

function startSession(user: AuthUser, remember: boolean): Session {
  const session: Session = { user, remember, createdAt: Date.now() };
  clearSession();
  (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function updateSessionUser(patch: Partial<Pick<AuthUser, "name" | "company">>): Session | null {
  const current = readSession();
  if (!current) return null;
  const next: Session = { ...current, user: { ...current.user, ...patch } };
  (localStorage.getItem(SESSION_KEY) ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(next));
  const accounts = readAccounts();
  const index = accounts.findIndex((a) => a.user.id === next.user.id);
  if (index >= 0) {
    accounts[index] = { ...accounts[index], user: next.user };
    writeAccounts(accounts);
  }
  return next;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export type SignInInput = { email: string; password: string; remember: boolean };

export async function signIn({ email, password, remember }: SignInInput) {
  await wait(900);
  const normalized = normalizeEmail(email);
  const passwordHash = await hash(password);

  let user: AuthUser | undefined;
  if (normalized === DEMO_CREDENTIALS.email && passwordHash === (await hash(DEMO_CREDENTIALS.password))) {
    user = demoUser;
  } else {
    user = readAccounts().find((a) => a.user.email === normalized && a.passwordHash === passwordHash)?.user;
  }

  if (!user) throw new AuthError("invalid_credentials", "The email or password you entered is incorrect.");
  return startSession(user, remember);
}

export type SignUpInput = { name: string; email: string; company: string; password: string };

export async function signUp({ name, email, company, password }: SignUpInput) {
  await wait(1100);
  const normalized = normalizeEmail(email);
  const accounts = readAccounts();

  if (normalized === DEMO_CREDENTIALS.email || accounts.some((a) => a.user.email === normalized)) {
    throw new AuthError("email_taken", "An account with this email already exists.");
  }

  const user: AuthUser = {
    id: `usr_${crypto.randomUUID().slice(0, 8)}`,
    name: name.trim(),
    email: normalized,
    company: company.trim(),
    role: "Owner",
    provider: "password",
  };
  writeAccounts([...accounts, { user, passwordHash: await hash(password) }]);
  return startSession(user, true);
}

export async function signInWithGoogle(remember = true) {
  await wait(1200);
  return startSession({ ...demoUser, id: "usr_google", provider: "google" }, remember);
}

export async function requestPasswordReset(email: string) {
  await wait(900);
  return { email: normalizeEmail(email) };
}
