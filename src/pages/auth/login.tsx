import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, KeyRound, Mail, MailCheck } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { AuthError, DEMO_CREDENTIALS } from "@/lib/auth/mock-auth";
import { fadeUp, motionStates } from "@/lib/motion";
import { routes } from "@/lib/routes";
import { isEmail } from "@/lib/validation";
import { useForm } from "@/hooks/use-form";
import { AuthDivider, AuthHeader, GoogleButton, PasswordInput } from "@/components/auth/auth-ui";
import { Alert, Button, Checkbox, Input } from "@/components/ui";

type Status = "idle" | "submitting" | "success";

const SUCCESS_REDIRECT_MS = 700;

function safeRedirect(value: string | null) {
  return value && value.startsWith(routes.app.root) ? value : routes.app.root;
}

function validateEmail(email: string) {
  if (!email.trim()) return "Enter your email address.";
  if (!isEmail(email)) return "Enter a valid email address, like name@company.com.";
  return undefined;
}

function SignInView({ initialEmail, onForgot }: { initialEmail: string; onForgot: (email: string) => void }) {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const redirectParam = params.get("redirect");
  const redirect = safeRedirect(redirectParam);

  const [status, setStatus] = useState<Status>("idle");
  const [google, setGoogle] = useState<Status>("idle");
  const [remember, setRemember] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const redirectTimer = useRef<number>(undefined);
  const signedOut = (location.state as { signedOut?: boolean } | null)?.signedOut;

  const form = useForm({ email: initialEmail, password: "" }, (values) => {
    const errors: { email?: string; password?: string } = {};
    const emailError = validateEmail(values.email);
    if (emailError) errors.email = emailError;
    if (!values.password) errors.password = "Enter your password.";
    return errors;
  });

  useEffect(() => () => window.clearTimeout(redirectTimer.current), []);

  const busy = status !== "idle" || google !== "idle";

  function finish() {
    redirectTimer.current = window.setTimeout(() => navigate(redirect, { replace: true }), SUCCESS_REDIRECT_MS);
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    setStatus("submitting");
    try {
      await signIn({ email: values.email, password: values.password, remember });
      setStatus("success");
      finish();
    } catch (error) {
      setStatus("idle");
      setFormError(error instanceof AuthError ? error.message : "Something went wrong. Please try again.");
      form.setValue("password", "");
      requestAnimationFrame(() => passwordRef.current?.focus());
    }
  });

  async function onGoogle() {
    setFormError(null);
    setGoogle("submitting");
    await signInWithGoogle(remember);
    setGoogle("success");
    finish();
  }

  function fillDemo() {
    form.setValues({ email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password });
    setFormError(null);
  }

  return (
    <motion.div variants={fadeUp} {...motionStates}>
      <AuthHeader title="Welcome back" description="Sign in to your NEXORA workspace." />

      <div className="mb-5 flex flex-col gap-3 empty:hidden">
        {formError && (
          <Alert
            tone="error"
            title="We couldn't sign you in"
            description={`${formError} Check your details or reset your password.`}
            onDismiss={() => setFormError(null)}
          />
        )}
        {!formError && signedOut && status === "idle" && (
          <Alert tone="success" title="You've been signed out" description="See you soon. Sign in again any time." />
        )}
        {!formError && !signedOut && redirectParam && status === "idle" && (
          <Alert tone="info" title="Sign in to continue" description="You need to be signed in to open your workspace." />
        )}
      </div>

      <form onSubmit={onSubmit} noValidate>
        <fieldset disabled={busy} className="flex flex-col gap-4">
          <Input
            {...form.register("email")}
            type="email"
            label="Email"
            placeholder="name@company.com"
            autoComplete="email"
            leftIcon={<Mail />}
            size="lg"
            success={form.isValidField("email")}
          />
          <PasswordInput
            {...form.register("password")}
            ref={passwordRef}
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            leftIcon={<KeyRound />}
            size="lg"
          />
          <div className="flex items-center justify-between gap-3">
            <Checkbox
              label={<span className="text-sm font-normal text-ink">Remember me</span>}
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <Button variant="link" onClick={() => onForgot(form.values.email)}>
              Forgot password?
            </Button>
          </div>
          <Button
            type="submit"
            size="lg"
            className="mt-1 w-full"
            loading={status === "submitting"}
            loadingText="Signing in…"
            success={status === "success"}
            successText="Signed in. Opening workspace…"
          >
            Log In
          </Button>
        </fieldset>
      </form>

      <AuthDivider />
      <GoogleButton
        loading={google === "submitting"}
        success={google === "success"}
        disabled={status !== "idle"}
        onClick={onGoogle}
      />

      <div className="mt-6 flex items-center justify-between gap-3 rounded-md border border-dashed border-border-strong bg-canvas px-3.5 py-2.5">
        <p className="min-w-0 text-xs text-muted">
          <span className="block font-medium text-ink">Demo workspace</span>
          <span className="font-mono">{DEMO_CREDENTIALS.email}</span> · <span className="font-mono">{DEMO_CREDENTIALS.password}</span>
        </p>
        <Button size="xs" variant="secondary" onClick={fillDemo} disabled={busy}>
          Use demo
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        New to NEXORA?{" "}
        <Link
          to={redirectParam ? `${routes.signup}?redirect=${encodeURIComponent(redirectParam)}` : routes.signup}
          className="rounded-xs font-medium text-primary outline-none hover:text-primary-hover focus-visible:shadow-focus"
        >
          Create your workspace
        </Link>
      </p>
    </motion.div>
  );
}

function ResetView({ initialEmail, onBack }: { initialEmail: string; onBack: (email: string) => void }) {
  const { requestPasswordReset } = useAuth();
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const form = useForm({ email: initialEmail }, (values) => {
    const error = validateEmail(values.email);
    return error ? { email: error } : {};
  });

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setStatus("submitting");
    await requestPasswordReset(email);
    setStatus("sent");
  });

  return (
    <motion.div variants={fadeUp} {...motionStates}>
      <button
        type="button"
        onClick={() => onBack(form.values.email)}
        className="mb-6 flex items-center gap-1.5 rounded-sm text-sm font-medium text-muted outline-none transition-colors hover:text-ink focus-visible:shadow-focus"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to sign in
      </button>

      {status === "sent" ? (
        <div role="status">
          <span className="mb-5 flex size-11 items-center justify-center rounded-lg bg-success-soft text-success">
            <MailCheck className="size-5" aria-hidden />
          </span>
          <AuthHeader
            title="Check your inbox"
            description={
              <>
                If an account exists for <span className="font-medium text-ink">{form.values.email.trim()}</span>, a
                password reset link is on its way. It expires in 30 minutes.
              </>
            }
          />
          <div className="flex flex-col gap-2">
            <Button size="lg" className="w-full" onClick={() => onBack(form.values.email)}>
              Back to sign in
            </Button>
            <Button size="lg" variant="ghost" className="w-full" onClick={() => setStatus("idle")}>
              Use a different email
            </Button>
          </div>
        </div>
      ) : (
        <>
          <AuthHeader
            title="Reset your password"
            description="Enter the email you use for NEXORA and we'll send you a link to choose a new password."
          />
          <form onSubmit={onSubmit} noValidate>
            <fieldset disabled={status === "submitting"} className="flex flex-col gap-4">
              <Input
                {...form.register("email")}
                type="email"
                label="Email"
                placeholder="name@company.com"
                autoComplete="email"
                leftIcon={<Mail />}
                size="lg"
                autoFocus
                success={form.isValidField("email")}
              />
              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={status === "submitting"}
                loadingText="Sending link…"
              >
                Send reset link
              </Button>
            </fieldset>
          </form>
        </>
      )}
    </motion.div>
  );
}

export default function LoginPage() {
  const [view, setView] = useState<{ name: "signin" | "reset"; email: string }>({ name: "signin", email: "" });

  return (
    <>
      <title>{view.name === "reset" ? "Reset password · NEXORA AI" : "Log in · NEXORA AI"}</title>
      <AnimatePresence mode="wait" initial={false}>
        {view.name === "signin" ? (
          <SignInView key="signin" initialEmail={view.email} onForgot={(email) => setView({ name: "reset", email })} />
        ) : (
          <ResetView key="reset" initialEmail={view.email} onBack={(email) => setView({ name: "signin", email })} />
        )}
      </AnimatePresence>
    </>
  );
}
