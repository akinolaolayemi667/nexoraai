import { useState } from "react";
import { Link } from "react-router";
import { CreditCard, Lock, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  billingPlans,
  brandLabel,
  cardBrand,
  luhn,
  periodTotal,
  planById,
  planRank,
  seatPrice,
  type BillingCycle,
  type BillingState,
  type PaymentMethod,
  type PlanId,
} from "@/lib/billing/data";
import { Alert, Button, Input, Modal, Tabs } from "@/components/ui";
import { CardMark } from "./card-mark";

export type PlanChange = { plan: PlanId; cycle: BillingCycle; seats: number; dueToday: number };

const money = (n: number) => formatCurrency(Math.round(n * 100) / 100);

export function quoteChange(state: BillingState, plan: PlanId, cycle: BillingCycle, seats: number, now = Date.now()) {
  const span = state.periodEnd - state.periodStart;
  const remaining = Math.max(0, Math.min(1, (state.periodEnd - now) / span));
  const credit = periodTotal(state.plan, state.cycle, state.seats) * remaining;
  const next = periodTotal(plan, cycle, seats);
  const charge = cycle !== state.cycle ? next : next * remaining;
  return Math.round((charge - credit) * 100) / 100;
}

type PlanModalProps = {
  open: boolean;
  state: BillingState;
  initial: { plan: PlanId; cycle: BillingCycle } | null;
  seatsUsed: number;
  onClose: () => void;
  onConfirm: (change: PlanChange) => Promise<void>;
};

export function PlanModal({ open, state, initial, seatsUsed, onClose, onConfirm }: PlanModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Change plan" description="Preview the new price before you confirm. This is a demo — nothing is charged." size="lg">
      {open && initial && <PlanForm key={`${initial.plan}-${initial.cycle}`} state={state} initial={initial} seatsUsed={seatsUsed} onClose={onClose} onConfirm={onConfirm} />}
    </Modal>
  );
}

function PlanForm({ state, initial, seatsUsed, onClose, onConfirm }: Omit<PlanModalProps, "open" | "initial"> & { initial: { plan: PlanId; cycle: BillingCycle } }) {
  const [plan, setPlan] = useState<PlanId>(initial.plan);
  const [cycle, setCycle] = useState<BillingCycle>(initial.cycle);
  const [seats, setSeats] = useState(Math.max(state.seats, seatsUsed));
  const [saving, setSaving] = useState(false);

  const selected = planById[plan];
  const maxSeats = Number.isFinite(selected.limits.users) ? selected.limits.users : 500;
  const tooMany = seatsUsed > selected.limits.users;
  const seatCount = Math.min(seats, maxSeats);
  const unchanged = plan === state.plan && cycle === state.cycle && seatCount === state.seats;
  const dueToday = quoteChange(state, plan, cycle, seatCount);
  const total = periodTotal(plan, cycle, seatCount);
  const currentTotal = periodTotal(state.plan, state.cycle, state.seats);
  const selectable = billingPlans.filter((p) => p.id !== "enterprise");

  async function confirm() {
    setSaving(true);
    await onConfirm({ plan, cycle, seats: seatCount, dueToday });
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">Billing cycle</p>
        <div className="flex items-center gap-2">
          <Tabs
            variant="segmented"
            value={cycle}
            onValueChange={(v) => setCycle(v as BillingCycle)}
            items={[
              { value: "monthly", label: "Monthly" },
              { value: "annual", label: "Annual" },
            ]}
          />
          <span className="hidden text-xs font-medium text-success-text sm:inline">Save up to 17%</span>
        </div>
      </div>

      <div role="radiogroup" aria-label="Plan" className="grid gap-2 sm:grid-cols-3">
        {selectable.map((p) => {
          const active = p.id === plan;
          const blocked = seatsUsed > p.limits.users;
          return (
            <label
              key={p.id}
              className={cn(
                "relative flex cursor-pointer flex-col rounded-lg border p-3.5 transition-colors",
                active ? "border-primary bg-primary-soft/40 ring-1 ring-primary" : "border-border hover:border-border-strong hover:bg-canvas",
              )}
            >
              <input type="radio" name="plan" value={p.id} checked={active} onChange={() => setPlan(p.id)} className="sr-only" />
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-ink">{p.name}</span>
                {p.id === state.plan && <span className="rounded-sm bg-sunken px-1.5 py-0.5 text-2xs font-medium text-muted">Current</span>}
              </span>
              <span className="mt-2 flex items-baseline gap-1">
                <span className="text-metric text-xl font-semibold text-ink">${seatPrice(p.id, cycle)}</span>
                <span className="text-xs text-muted">/ seat / mo</span>
              </span>
              <span className={cn("mt-1 text-xs", blocked ? "text-danger" : "text-muted")}>Up to {p.limits.users} users</span>
            </label>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3.5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">Seats</p>
          <p className="text-xs text-muted">
            {seatsUsed} in use · you can't go below that
          </p>
        </div>
        <div className="flex items-center rounded-md border border-border-strong">
          <button type="button" onClick={() => setSeats((s) => Math.max(seatsUsed, s - 1))} disabled={seatCount <= seatsUsed} className="flex size-9 items-center justify-center text-muted hover:text-ink disabled:opacity-40" aria-label="Remove a seat">
            <Minus className="size-4" />
          </button>
          <input
            value={seatCount}
            onChange={(e) => {
              const n = Number(e.target.value.replace(/\D/g, ""));
              if (!Number.isNaN(n)) setSeats(Math.max(seatsUsed, Math.min(maxSeats, n)));
            }}
            inputMode="numeric"
            aria-label="Number of seats"
            className="text-metric h-9 w-12 border-x border-border-strong bg-transparent text-center text-sm font-semibold text-ink outline-none"
          />
          <button type="button" onClick={() => setSeats((s) => Math.min(maxSeats, s + 1))} disabled={seatCount >= maxSeats} className="flex size-9 items-center justify-center text-muted hover:text-ink disabled:opacity-40" aria-label="Add a seat">
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {tooMany ? (
        <Alert
          tone="error"
          title={`${selected.name} includes up to ${selected.limits.users} users`}
          description={
            <>
              {seatsUsed} people are using seats right now.{" "}
              <Link to={routes.app.team} className="font-medium underline">
                Remove or suspend members
              </Link>{" "}
              first.
            </>
          }
        />
      ) : (
        <dl className="divide-y divide-border rounded-lg border border-border bg-canvas text-sm">
          <div className="flex items-center justify-between gap-4 px-4 py-2.5">
            <dt className="text-muted">Current</dt>
            <dd className="text-right text-ink">
              {planById[state.plan].name} · {state.seats} seats · {money(currentTotal)}/{state.cycle === "annual" ? "yr" : "mo"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-2.5">
            <dt className="text-muted">New</dt>
            <dd className="text-right font-medium text-ink">
              {selected.name} · {seatCount} seats · {money(total)}/{cycle === "annual" ? "yr" : "mo"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="font-medium text-ink">{dueToday >= 0 ? "Due today (prorated)" : "Credit to next invoice"}</dt>
            <dd className="text-metric text-lg font-semibold text-ink">{money(Math.abs(unchanged ? 0 : dueToday))}</dd>
          </div>
        </dl>
      )}

      <p className="flex items-center gap-1.5 text-xs text-subtle">
        <Lock className="size-3" aria-hidden />
        Demo billing. No payment is taken and no invoice is emailed.
      </p>

      <div className="sticky -bottom-5 -mx-6 -mb-5 flex flex-col-reverse gap-2 border-t border-border bg-canvas px-6 py-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={confirm} disabled={unchanged || tooMany} loading={saving} loadingText="Updating…">
          {unchanged ? "No changes" : planRank[plan] < planRank[state.plan] ? `Downgrade to ${selected.name}` : plan !== state.plan ? `Upgrade to ${selected.name}` : "Confirm change"}
        </Button>
      </div>
    </div>
  );
}

type PaymentModalProps = { open: boolean; current: PaymentMethod; onClose: () => void; onSave: (method: PaymentMethod) => Promise<void> };

export function PaymentModal({ open, current, onClose, onSave }: PaymentModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Update payment method" description={`Replaces ${brandLabel[current.brand]} ending ${current.last4}.`} size="md">
      {open && <PaymentForm onClose={onClose} onSave={onSave} />}
    </Modal>
  );
}

function formatCardNumber(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 19);
  if (cardBrand(digits) === "amex") return digits.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function PaymentForm({ onClose, onSave }: Omit<PaymentModalProps, "open" | "current">) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const brand = cardBrand(number);
  const [mm, yy] = expiry.split("/").map((v) => Number(v));
  const now = new Date();
  const expYear = 2000 + (yy || 0);
  const errors = {
    name: name.trim().length < 2 ? "Enter the name on the card" : null,
    number: !luhn(number) ? "Enter a valid card number — try 4242 4242 4242 4242" : null,
    expiry: !mm || mm > 12 || !yy || expYear < now.getFullYear() || (expYear === now.getFullYear() && mm < now.getMonth() + 1) ? "Use a future date as MM/YY" : null,
    cvc: !new RegExp(`^\\d{${brand === "amex" ? 4 : 3}}$`).test(cvc) ? `${brand === "amex" ? "4" : "3"} digits` : null,
  };
  const valid = !Object.values(errors).some(Boolean);

  async function submit() {
    setTouched(true);
    if (!valid) return;
    setSaving(true);
    await onSave({ brand, last4: number.replace(/\D/g, "").slice(-4), expMonth: mm, expYear, name: name.trim() });
    setSaving(false);
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      noValidate
    >
      <Alert tone="warning" title="Frontend demo" description="Don't enter a real card. Use a test number like 4242 4242 4242 4242 — nothing leaves your browser." />
      <Input label="Name on card" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" error={touched ? errors.name : undefined} data-autofocus />
      <Input
        label="Card number"
        value={number}
        onChange={(e) => setNumber(formatCardNumber(e.target.value))}
        inputMode="numeric"
        autoComplete="off"
        placeholder="4242 4242 4242 4242"
        leftIcon={brand === "card" ? <CreditCard /> : <CardMark brand={brand} className="h-3.5 w-auto" />}
        error={touched ? errors.number : undefined}
      />
      <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2">
        <Input
          label="Expiry"
          value={expiry}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(0, 4);
            setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
          }}
          inputMode="numeric"
          autoComplete="off"
          placeholder="MM/YY"
          error={touched ? errors.expiry : undefined}
        />
        <Input label="CVC" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" autoComplete="off" placeholder={brand === "amex" ? "1234" : "123"} error={touched ? errors.cvc : undefined} />
      </div>
      <div className="sticky -bottom-5 -mx-6 -mb-5 flex flex-col-reverse gap-2 border-t border-border bg-canvas px-6 py-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving} loadingText="Saving…" leftIcon={<Lock />}>
          Save card
        </Button>
      </div>
    </form>
  );
}

export function renewalText(state: BillingState) {
  return `${state.cancelAtPeriodEnd ? "Ends" : "Renews"} ${formatDate(state.periodEnd)}`;
}
