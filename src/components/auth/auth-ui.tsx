import { useState, type KeyboardEvent, type ReactNode } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { passwordRules, passwordStrength } from "@/lib/validation";
import { Button, Input, type InputProps } from "@/components/ui";

export function AuthHeader({ title, description }: { title: ReactNode; description: ReactNode }) {
  return (
    <div className="mb-7">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </div>
  );
}

export function AuthDivider({ children = "or" }: { children?: ReactNode }) {
  return (
    <div className="my-5 flex items-center gap-3 text-2xs font-medium uppercase tracking-wider text-subtle">
      <span className="h-px flex-1 bg-border" />
      {children}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.56 10.56 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export function GoogleButton({
  loading,
  success,
  disabled,
  onClick,
}: {
  loading: boolean;
  success: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="secondary"
      size="lg"
      className="w-full"
      leftIcon={<GoogleMark />}
      loading={loading}
      loadingText="Connecting to Google…"
      success={success}
      successText="Signed in with Google"
      disabled={disabled}
      onClick={onClick}
    >
      Continue with Google
    </Button>
  );
}

export function PasswordInput({ hint, ...props }: Omit<InputProps, "type" | "rightSlot">) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  function onKey(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(event.getModifierState("CapsLock"));
  }

  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      onKeyUp={onKey}
      onKeyDown={onKey}
      hint={capsLock ? "Caps Lock is on" : hint}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          disabled={props.disabled}
          className="-mr-1 flex size-7 items-center justify-center rounded-sm text-subtle outline-none transition-colors hover:bg-sunken hover:text-ink focus-visible:shadow-focus disabled:pointer-events-none [&_svg]:size-4"
        >
          {visible ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
        </button>
      }
    />
  );
}

const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["bg-danger", "bg-danger", "bg-warning", "bg-primary", "bg-success"];

export function PasswordStrength({ value }: { value: string }) {
  const { score } = passwordStrength(value);

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="grid flex-1 grid-cols-4 gap-1" aria-hidden>
          {[1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className={cn("h-1 rounded-full transition-colors duration-200", score >= step ? strengthColors[score] : "bg-sunken")}
            />
          ))}
        </div>
        <span className="w-14 text-right text-2xs font-medium text-muted">{value ? strengthLabels[score] : ""}</span>
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
        {passwordRules.map((rule) => {
          const met = rule.test(value);
          return (
            <li
              key={rule.id}
              className={cn("flex items-center gap-1.5 text-2xs transition-colors", met ? "text-success-text" : "text-muted")}
            >
              <span
                className={cn(
                  "flex size-3.5 items-center justify-center rounded-full transition-colors",
                  met ? "bg-success text-white" : "bg-sunken",
                )}
              >
                {met && <Check className="size-2.5" strokeWidth={3} aria-hidden />}
              </span>
              {rule.label}
              {!rule.required && <span className="text-subtle">(optional)</span>}
              <span className="sr-only">{met ? "met" : "not met"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
