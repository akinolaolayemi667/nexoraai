"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Palette,
  Settings,
  Store,
  Wrench,
} from "lucide-react";
import { Logo } from "../logo";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/tools", label: "My tools", icon: Wrench },
  { href: "/dashboard/playground", label: "Playground", icon: MessageSquare },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/dashboard/creator", label: "Creator studio", icon: Palette },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 bg-black/20 p-5 lg:flex">
      <Logo href="/dashboard" />
      <nav className="mt-10 flex flex-col gap-1">
        {nav.map((item) => {
          const active =
            item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-violet-500/15 font-medium text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className={`h-4 w-4 ${active ? "text-violet-300" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-white/5 px-4 py-2 lg:hidden">
      {nav.map((item) => {
        const active =
          item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${
              active ? "bg-violet-500/15 text-white" : "text-zinc-400"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
