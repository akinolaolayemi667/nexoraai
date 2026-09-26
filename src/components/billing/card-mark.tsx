import { CreditCard } from "lucide-react";
import { cn } from "@/lib/cn";
import type { CardBrand } from "@/lib/billing/data";

export function CardMark({ brand, className }: { brand: CardBrand; className?: string }) {
  if (brand === "visa") {
    return (
      <svg viewBox="0 0 48 16" className={cn("h-4 w-auto", className)} role="img" aria-label="Visa">
        <text x="0" y="14" fontFamily="Arial, sans-serif" fontSize="17" fontStyle="italic" fontWeight="800" fill="#1a1f71" letterSpacing="-0.5">
          VISA
        </text>
      </svg>
    );
  }
  if (brand === "mastercard") {
    return (
      <svg viewBox="0 0 32 20" className={cn("h-4 w-auto", className)} role="img" aria-label="Mastercard">
        <circle cx="11" cy="10" r="9" fill="#eb001b" />
        <circle cx="21" cy="10" r="9" fill="#f79e1b" />
        <path d="M16 2.5a9 9 0 0 1 0 15 9 9 0 0 1 0-15Z" fill="#ff5f00" />
      </svg>
    );
  }
  if (brand === "amex") {
    return (
      <svg viewBox="0 0 40 16" className={cn("h-4 w-auto", className)} role="img" aria-label="American Express">
        <rect width="40" height="16" rx="2" fill="#2e77bc" />
        <text x="20" y="11.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="800" fill="#fff">
          AMEX
        </text>
      </svg>
    );
  }
  return <CreditCard className={cn("size-4 text-muted", className)} aria-label="Card" />;
}
