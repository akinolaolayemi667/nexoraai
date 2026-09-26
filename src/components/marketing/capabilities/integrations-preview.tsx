import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { integrations } from "@/data/marketing";
import { Progress } from "@/components/ui";
import { AppPanel, PanelHeader } from "./feature-layout";

const featured = ["Gmail", "Slack", "WhatsApp", "HubSpot", "Stripe", "Shopify", "Google Calendar", "QuickBooks"];
const apps = featured.map((name) => integrations.find((i) => i.name === name)!);

export function IntegrationsPreview() {
  const [connected, setConnected] = useState(() => new Set(["Gmail", "Slack", "Stripe"]));
  const [pending, setPending] = useState<string | null>(null);
  const timer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function toggle(name: string) {
    if (pending) return;
    if (connected.has(name)) {
      setConnected((set) => {
        const next = new Set(set);
        next.delete(name);
        return next;
      });
      return;
    }
    setPending(name);
    timer.current = window.setTimeout(() => {
      setConnected((set) => new Set(set).add(name));
      setPending(null);
    }, 700);
  }

  return (
    <AppPanel label="Interactive integrations preview" className="flex flex-col">
      <PanelHeader title="Connected apps">
        <span className="text-2xs text-muted">
          <span className="font-mono text-ink">{connected.size}</span> of {apps.length} connected
        </span>
      </PanelHeader>
      <div className="px-3.5 pt-3">
        <Progress value={connected.size} max={apps.length} size="sm" tone="success" />
      </div>
      <ul className="grid flex-1 grid-cols-1 gap-2 p-3.5 sm:grid-cols-2">
        {apps.map((app) => {
          const isOn = connected.has(app.name);
          const isPending = pending === app.name;
          return (
            <li
              key={app.name}
              className={cn(
                "flex items-center gap-2.5 rounded-md border bg-white px-2.5 py-2 transition-colors",
                isOn ? "border-success-border" : "border-border",
              )}
            >
              <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-md font-display text-sm font-bold", app.tint)}>
                {app.mark}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-ink">{app.name}</span>
                <span className="block truncate text-2xs text-muted">{app.category}</span>
              </span>
              <button
                type="button"
                onClick={() => toggle(app.name)}
                disabled={Boolean(pending) && !isPending}
                aria-pressed={isOn}
                aria-label={isOn ? `Disconnect ${app.name}` : `Connect ${app.name}`}
                className={cn(
                  "inline-flex h-6 shrink-0 items-center gap-1 rounded-sm px-2 text-2xs font-medium outline-none transition-colors focus-visible:shadow-focus disabled:opacity-50 [&_svg]:size-3",
                  isOn
                    ? "bg-success-soft text-success-text hover:bg-success-soft/70"
                    : "border border-border bg-white text-ink hover:border-border-strong hover:bg-canvas",
                )}
              >
                {isPending ? <Loader2 className="animate-spin" aria-hidden /> : isOn ? <Check aria-hidden /> : <Plus aria-hidden />}
                {isPending ? "Connecting" : isOn ? "Connected" : "Connect"}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="border-t border-border px-3.5 py-2.5 text-2xs text-muted">
        Plus 40+ more apps, a REST API and webhooks for anything custom.
      </p>
    </AppPanel>
  );
}
