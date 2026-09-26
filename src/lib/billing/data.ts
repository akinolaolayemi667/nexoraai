import { useLocalStorage } from "@/hooks/use-local-storage";
import { plans as marketingPlans } from "@/data/marketing";

export type PlanId = "starter" | "growth" | "scale" | "enterprise";
export type BillingCycle = "monthly" | "annual";
export type CardBrand = "visa" | "mastercard" | "amex" | "card";

export type PlanLimits = { users: number; aiCredits: number; contacts: number; runs: number; storageGb: number };

export type BillingPlan = {
  id: PlanId;
  name: string;
  description: string;
  monthly: number | null;
  annual: number | null;
  popular?: boolean;
  features: string[];
  limits: PlanLimits;
};

const limits: Record<PlanId, PlanLimits> = {
  starter: { users: 3, aiCredits: 500, contacts: 2_500, runs: 1_000, storageGb: 5 },
  growth: { users: 25, aiCredits: 2_000, contacts: 25_000, runs: 50_000, storageGb: 50 },
  scale: { users: 100, aiCredits: 10_000, contacts: 100_000, runs: 250_000, storageGb: 250 },
  enterprise: { users: Infinity, aiCredits: Infinity, contacts: Infinity, runs: Infinity, storageGb: Infinity },
};

export const billingPlans: BillingPlan[] = marketingPlans.map((p) => ({ ...p, id: p.id as PlanId, limits: limits[p.id as PlanId] }));
export const planById = Object.fromEntries(billingPlans.map((p) => [p.id, p])) as Record<PlanId, BillingPlan>;
export const planRank: Record<PlanId, number> = { starter: 0, growth: 1, scale: 2, enterprise: 3 };

export type Invoice = {
  id: string;
  number: string;
  date: number;
  periodStart: number;
  periodEnd: number;
  description: string;
  seats: number;
  amount: number;
  status: "paid" | "refunded" | "failed";
};

export type PaymentMethod = { brand: CardBrand; last4: string; expMonth: number; expYear: number; name: string };

export type BillingState = {
  version: number;
  plan: PlanId;
  cycle: BillingCycle;
  seats: number;
  cancelAtPeriodEnd: boolean;
  periodStart: number;
  periodEnd: number;
  paymentMethod: PaymentMethod;
  billingEmail: string;
  invoices: Invoice[];
};

export const BILLING_VERSION = 1;

export type Usage = { aiCredits: number; contacts: number; runs: number; storageGb: number };

/** Simulated consumption for the current period. */
export const usage: Usage = { aiCredits: 1_240, contacts: 8_412, runs: 18_240, storageGb: 3.2 };

export function seatPrice(plan: PlanId, cycle: BillingCycle) {
  const p = planById[plan];
  return (cycle === "annual" ? p.annual : p.monthly) ?? 0;
}

/** Amount charged per billing period (annual plans are billed yearly). */
export function periodTotal(plan: PlanId, cycle: BillingCycle, seats: number) {
  return seatPrice(plan, cycle) * seats * (cycle === "annual" ? 12 : 1);
}

const startOfMonth = (ts: number, offset = 0) => {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth() + offset, 1).getTime();
};

export function createBilling(email: string, now = Date.now()): BillingState {
  const periodStart = startOfMonth(now);
  const periodEnd = startOfMonth(now, 1);
  const history: [monthsAgo: number, seats: number][] = [
    [0, 15], [1, 15], [2, 15], [3, 12], [4, 12], [5, 12], [6, 12], [7, 10], [8, 10], [9, 10], [10, 10], [11, 10],
  ];
  const invoices: Invoice[] = history.map(([ago, seats], i) => {
    const start = startOfMonth(now, -ago);
    const d = new Date(start);
    return {
      id: `inv_${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`,
      number: `NX-${d.getFullYear()}-${String(1042 - i).padStart(4, "0")}`,
      date: start,
      periodStart: start,
      periodEnd: startOfMonth(now, -ago + 1),
      description: `Growth · ${seats} seats · Monthly`,
      seats,
      amount: seatPrice("growth", "monthly") * seats,
      status: "paid",
    };
  });
  invoices.splice(3, 0, {
    id: "inv_seat_adj",
    number: `NX-${new Date(startOfMonth(now, -3)).getFullYear()}-1039A`,
    date: startOfMonth(now, -3) + 17 * 86_400_000,
    periodStart: startOfMonth(now, -3) + 17 * 86_400_000,
    periodEnd: startOfMonth(now, -2),
    description: "Seat change · 12 → 15 seats (prorated)",
    seats: 3,
    amount: 107.23,
    status: "paid",
  });
  return {
    version: BILLING_VERSION,
    plan: "growth",
    cycle: "monthly",
    seats: 15,
    cancelAtPeriodEnd: false,
    periodStart,
    periodEnd,
    paymentMethod: { brand: "visa", last4: "4242", expMonth: 8, expYear: new Date(now).getFullYear() + 2, name: "" },
    billingEmail: email,
    invoices,
  };
}

export function useBilling(userId: string, email: string) {
  return useLocalStorage<BillingState>(`nexora:billing:v${BILLING_VERSION}:${userId}`, createBilling(email));
}

export function cardBrand(number: string): CardBrand {
  const n = number.replace(/\D/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  return "card";
}

export function luhn(number: string) {
  const digits = number.replace(/\D/g, "");
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return digits.length >= 12 && sum % 10 === 0;
}

export const brandLabel: Record<CardBrand, string> = { visa: "Visa", mastercard: "Mastercard", amex: "American Express", card: "Card" };
