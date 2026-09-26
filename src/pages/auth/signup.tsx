import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Check, KeyRound, Loader2, Mail, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth/auth-context";
import { AuthError } from "@/lib/auth/mock-auth";
import { fadeUp, motionStates } from "@/lib/motion";
import { routes } from "@/lib/routes";
import { isEmail, passwordStrength } from "@/lib/validation";
import { useForm } from "@/hooks/use-form";
import { Seo } from "@/components/seo";
import { AuthDivider, AuthHeader, GoogleButton, PasswordInput, PasswordStrength } from "@/components/auth/auth-ui";
import { Alert, Button, Input } from "@/components/ui";

type Values = { name: string; email: string; company: string; password: string };

const setupSteps = ["Creating your workspace", "Setting up your pipeline", "Preparing your AI assistant"];
const STEP_MS = 650;

function validate(values: Values) {
  const errors: Partial<Values> = {};
  if (values.name.trim().length < 2) errors.name = "Enter your full name.";
  if (!values.email.trim()) errors.email = "Enter your email address.";
  else if (!isEmail(values.email)) errors.email = "Enter a valid email address, like name@example.com.";
  if (values.company.trim().length < 2) errors.company = "Enter your company name.";
  if (!values.password) errors.password = "Create a password.";
  else if (!passwordStrength(values.password).meetsRequirements) {
    errors.password = "Use 8+ characters with upper and lowercase letters and a number.";
  }
  return errors;
}

function SetupProgress({ name, company, redirect }: { name: string; company: string; redirect: string }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step > setupSteps.length) return;
    const timer = window.setTimeout(() => {
      if (step === setupSteps.length) navigate(redirect, { replace: true });
      else setStep((s) => s + 1);
    }, STEP_MS);
    return () => window.clearTimeout(timer);
  }, [step, navigate, redirect]);

  return (
    <motion.div variants={fadeUp} {...motionStates} role="status" aria-live="polite">
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="flex size-12 items-center justify-center rounded-xl bg-success text-white shadow-md"
      >
        <Check className="size-6" strokeWidth={3} aria-hidden />
      </motion.span>
      <AuthHeader
        title={`Welcome to NEXORA, ${name.trim().split(/\s+/)[0]}.`}
        description={
          <>
            Your account is ready. We're setting up <span className="font-medium text-ink">{company.trim()}</span> now.
          </>
        }
      />
      <ol className="flex flex-col gap-3 rounded-lg border border-border bg-canvas p-4">
        {setupSteps.map((label, i) => {
          const done = step > i;
          const active = step === i;
          return (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full transition-colors",
                  done ? "bg-success text-white" : active ? "bg-primary-soft text-primary" : "bg-sunken text-subtle",
                )}
              >
                {done ? (
                  <Check className="size-3" strokeWidth={3} aria-hidden />
                ) : active ? (
                  <Loader2 className="size-3 animate-spin" aria-hidden />
                ) : null}
              </span>
              <span className={done || active ? "text-ink" : "text-muted"}>{label}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs text-muted">You'll be redirected to your dashboard automatically.</p>
    </motion.div>
  );
}

export default function SignupPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectParam = params.get("redirect");
  const redirect = redirectParam?.startsWith(routes.app.root) ? redirectParam : routes.app.root;

  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [google, setGoogle] = useState<"idle" | "submitting" | "success">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const redirectTimer = useRef<number>(undefined);
  const form = useForm<Values>({ name: "", email: "", company: "", password: "" }, validate);
  const busy = status !== "idle" || google !== "idle";

  useEffect(() => () => window.clearTimeout(redirectTimer.current), []);

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    setStatus("submitting");
    try {
      await signUp(values);
      setStatus("success");
    } catch (error) {
      setStatus("idle");
      if (error instanceof AuthError && error.code === "email_taken") {
        form.setServerError("email", error.message);
        setFormError("email_taken");
      } else {
        setFormError("Something went wrong while creating your workspace. Please try again.");
      }
    }
  });

  async function onGoogle() {
    setFormError(null);
    setGoogle("submitting");
    await signInWithGoogle(true);
    setGoogle("success");
    redirectTimer.current = window.setTimeout(() => navigate(redirect, { replace: true }), 700);
  }

  const passwordField = form.register("password");
  const loginHref = redirectParam ? `${routes.login}?redirect=${encodeURIComponent(redirectParam)}` : routes.login;

  return (
    <>
      <Seo page="signup" />
      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <SetupProgress key="success" name={form.values.name} company={form.values.company} redirect={redirect} />
        ) : (
          <motion.div key="form" variants={fadeUp} {...motionStates}>
            <AuthHeader
              title="Create your workspace"
              description="Start building your intelligent business system."
            />

            {formError && (
              <Alert
                tone="error"
                className="mb-5"
                title={formError === "email_taken" ? "That email is already registered" : "We couldn't create your workspace"}
                description={
                  formError === "email_taken" ? (
                    <>
                      Sign in to your existing workspace, or use a different email.{" "}
                      <Link to={loginHref} className="font-medium text-primary hover:text-primary-hover">
                        Log in instead
                      </Link>
                    </>
                  ) : (
                    formError
                  )
                }
                onDismiss={() => setFormError(null)}
              />
            )}

            <form onSubmit={onSubmit} noValidate>
              <fieldset disabled={busy} className="flex flex-col gap-4">
                <Input
                  {...form.register("name")}
                  label="Full Name"
                  placeholder="Ada Lovelace"
                  autoComplete="name"
                  leftIcon={<User />}
                  size="lg"
                  success={form.isValidField("name")}
                />
                <Input
                  {...form.register("email")}
                  type="email"
                  label="Email"
                  placeholder="ada@example.com"
                  hint="Work or personal email both work."
                  autoComplete="email"
                  leftIcon={<Mail />}
                  size="lg"
                  success={form.isValidField("email")}
                />
                <Input
                  {...form.register("company")}
                  label="Company"
                  placeholder="Acme Inc."
                  autoComplete="organization"
                  leftIcon={<Building2 />}
                  size="lg"
                  success={form.isValidField("company")}
                />
                <div>
                  <PasswordInput
                    {...passwordField}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => {
                      setPasswordFocused(false);
                      passwordField.onBlur();
                    }}
                    label="Password"
                    placeholder="Create a password"
                    autoComplete="new-password"
                    leftIcon={<KeyRound />}
                    size="lg"
                  />
                  {(passwordFocused || form.values.password) && <PasswordStrength value={form.values.password} />}
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="mt-1 w-full"
                  loading={status === "submitting"}
                  loadingText="Creating workspace…"
                >
                  Create workspace
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

            <p className="mt-5 text-center text-xs text-subtle">
              By creating a workspace you agree to our Terms of Service and Privacy Policy.
            </p>
            <p className="mt-4 text-center text-sm text-muted">
              Already have an account?{" "}
              <Link
                to={loginHref}
                className="rounded-xs font-medium text-primary outline-none hover:text-primary-hover focus-visible:shadow-focus"
              >
                Log in
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
