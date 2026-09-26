import type { ReactNode } from "react";
import { Bell, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { appNavigation, currentUser } from "@/data/navigation";
import { Avatar } from "@/components/ui";
import { LogoMark } from "@/components/layout/logo";

function PreviewSidebar() {
  return (
    <div className="hidden w-52 shrink-0 flex-col border-r border-border bg-canvas px-3 lg:flex" aria-hidden>
      <div className="flex h-12 items-center gap-2 px-1.5">
        <LogoMark className="size-6" />
        <span className="font-display text-sm font-bold tracking-tight text-ink">
          NEXORA<span className="ml-1 font-semibold text-primary">AI</span>
        </span>
      </div>
      <div className="flex flex-col gap-2.5 py-3">
        {appNavigation.map((section, index) => (
          <div key={section.id} className="flex flex-col gap-0.5">
            {index > 0 && <div className="mx-2.5 mb-2 h-px bg-border" />}
            {section.items.map((item) => {
              const active = item.href === appNavigation[0].items[0].href;
              return (
                <div
                  key={item.href}
                  className={cn(
                    "flex h-7 items-center gap-2.5 rounded-md px-2.5 text-xs font-medium",
                    active ? "bg-white text-ink shadow-xs ring-1 ring-border" : "text-muted",
                  )}
                >
                  <item.icon className={cn("size-3.5", active ? "text-primary" : "text-subtle")} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="rounded-sm bg-sunken px-1 font-mono text-[0.625rem] text-muted">{item.badge}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewTopbar() {
  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-white px-4 sm:px-5" aria-hidden>
      <div className="flex min-w-0 items-center gap-1 text-xs">
        <span className="text-muted">{currentUser.workspace}</span>
        <ChevronRight className="size-3 text-subtle" />
        <span className="font-medium text-ink">Overview</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="hidden h-7 w-52 items-center gap-2 rounded-md border border-border bg-canvas px-2 text-xs text-subtle md:flex">
          <Search className="size-3" />
          <span className="flex-1">Search or jump to…</span>
          <kbd className="rounded-xs border border-border bg-white px-1 font-mono text-[0.625rem] text-muted">Ctrl K</kbd>
        </div>
        <span className="relative flex size-7 items-center justify-center text-muted">
          <Bell className="size-3.5" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary ring-2 ring-white" />
        </span>
        <Avatar name={currentUser.name} size="xs" status="online" />
      </div>
    </div>
  );
}

export function PreviewShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex overflow-hidden rounded-xl border border-border bg-white text-left shadow-xl">
      <PreviewSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <PreviewTopbar />
        <div className="min-w-0 flex-1 bg-white p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}
