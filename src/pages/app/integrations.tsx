import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { BellRing, Check, Search, Settings2, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";
import { useUser } from "@/lib/auth/auth-context";
import {
  categories,
  categoryLabel,
  defaultIntegrationState,
  integrationById,
  integrations,
  statusOf,
  type Integration,
  type IntegrationCategory,
  type IntegrationState,
  type IntegrationStatus,
} from "@/lib/integrations/catalog";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useNow } from "@/hooks/use-now";
import { Button, EmptyState, Input, Select, useToast } from "@/components/ui";
import { IntegrationLogo } from "@/components/integrations/integration-logo";
import { IntegrationModal, StatusBadge } from "@/components/integrations/integration-modal";

type CategoryFilter = "all" | IntegrationCategory;
type StatusFilter = "all" | IntegrationStatus;

type CardProps = {
  integration: Integration;
  status: IntegrationStatus;
  lastSync: number | undefined;
  connecting: boolean;
  notified: boolean;
  now: number;
  onOpen: () => void;
  onConnect: () => void;
  onNotify: () => void;
};

function IntegrationCard({ integration, status, lastSync, connecting, notified, now, onOpen, onConnect, onNotify }: CardProps) {
  return (
    <li className="flex">
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onOpen();
          }
        }}
        aria-label={`${integration.name}, ${categoryLabel[integration.category]}, ${status === "coming_soon" ? "coming soon" : status}. View details`}
        className="glass-card glass-hover group flex w-full cursor-pointer flex-col rounded-2xl p-5 outline-none focus-visible:border-primary focus-visible:shadow-focus"
      >
        <div className="flex items-start justify-between gap-3">
          <IntegrationLogo id={integration.id} name={integration.name} />
          <StatusBadge status={status} />
        </div>
        <div className="mt-4 min-w-0">
          <h3 className="flex items-center gap-1.5 text-base font-semibold text-ink">
            {integration.name}
            {integration.popular && status !== "connected" && (
              <span className="inline-flex items-center gap-0.5 rounded-sm bg-accent-soft px-1 text-2xs font-medium text-accent">
                <Sparkles className="size-2.5" aria-hidden />
                Popular
              </span>
            )}
          </h3>
          <p className="text-xs text-muted">{categoryLabel[integration.category]}</p>
        </div>
        <p className="mb-4 mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted">{integration.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border-subtle pt-4">
          <span className="min-w-0 truncate text-xs text-subtle">
            {status === "connected" && lastSync !== undefined ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-success" aria-hidden />
                Synced {formatRelative(lastSync, now).toLowerCase()}
              </span>
            ) : status === "coming_soon" ? (
              integration.eta?.replace("Planned for ", "Expected ")
            ) : (
              integration.teams
            )}
          </span>
          {status === "connected" ? (
            <Button
              variant="secondary"
              size="xs"
              leftIcon={<Settings2 />}
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
            >
              Manage
            </Button>
          ) : status === "coming_soon" ? (
            <Button
              variant={notified ? "ghost" : "secondary"}
              size="xs"
              leftIcon={notified ? <Check /> : <BellRing />}
              onClick={(e) => {
                e.stopPropagation();
                onNotify();
              }}
              aria-pressed={notified}
            >
              {notified ? "Notified" : "Notify me"}
            </Button>
          ) : (
            <Button
              size="xs"
              loading={connecting}
              loadingText="Connecting…"
              onClick={(e) => {
                e.stopPropagation();
                onConnect();
              }}
            >
              Connect
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

export default function IntegrationsPage() {
  const user = useUser();
  const { toast } = useToast();
  const now = useNow(30_000);
  const [state, setState] = useLocalStorage<IntegrationState>(`nexora:integrations:v1:${user.id}`, defaultIntegrationState(Date.now()));
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [connecting, setConnecting] = useState<Record<string, boolean>>({});
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const timers = useRef<number[]>([]);

  const rawCategory = params.get("category") as CategoryFilter | null;
  const category: CategoryFilter = rawCategory && (rawCategory === "all" || categories.some((c) => c.id === rawCategory)) ? rawCategory : "all";
  const openId = params.get("integration");
  const openIntegration = openId ? (integrationById(openId) ?? null) : null;

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const setParam = (key: string, value: string | null) =>
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (value) p.set(key, value);
        else p.delete(key);
        return p;
      },
      { replace: key === "category" },
    );

  const statusFor = (i: Integration) => statusOf(i, state);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return integrations.filter((i) => {
      if (category !== "all" && i.category !== category) return false;
      if (statusFilter !== "all" && statusOf(i, state) !== statusFilter) return false;
      if (!q) return true;
      return [i.name, i.description, categoryLabel[i.category], i.developer].some((v) => v.toLowerCase().includes(q));
    });
  }, [query, category, statusFilter, state]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: integrations.length };
    integrations.forEach((i) => (counts[i.category] = (counts[i.category] ?? 0) + 1));
    return counts;
  }, []);

  const summary = useMemo(() => {
    const s = { connected: 0, available: 0, coming_soon: 0 };
    integrations.forEach((i) => (s[statusOf(i, state)] += 1));
    return s;
  }, [state]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const connect = (integration: Integration, apiKey?: string) => {
    if (connecting[integration.id]) return;
    setConnecting((c) => ({ ...c, [integration.id]: true }));
    later(
      () => {
        const at = Date.now();
        setState((s) => ({
          ...s,
          connections: {
            ...s.connections,
            [integration.id]: {
              connectedAt: at,
              lastSync: at,
              account: apiKey ? `${integration.account} · key ••••${apiKey.slice(-4)}` : integration.account,
              options: Object.fromEntries(integration.syncs.map((o) => [o.id, o.defaultOn])),
            },
          },
        }));
        setConnecting((c) => ({ ...c, [integration.id]: false }));
        toast({
          variant: "success",
          title: `${integration.name} connected`,
          description: integration.syncs.length ? "The first sync is running in the background. Simulated in demo mode." : "Simulated in demo mode.",
          action: openId === integration.id ? undefined : { label: "Manage", onClick: () => setParam("integration", integration.id) },
        });
      },
      integration.auth === "oauth" ? 1600 : 1100,
    );
  };

  const disconnect = (integration: Integration) => {
    const previous = state.connections[integration.id];
    setState((s) => {
      const connections = { ...s.connections };
      delete connections[integration.id];
      return { ...s, connections };
    });
    toast({
      variant: "info",
      title: `${integration.name} disconnected`,
      description: "Syncing has stopped. Existing data in Nexora is kept.",
      action: previous
        ? { label: "Undo", onClick: () => setState((s) => ({ ...s, connections: { ...s.connections, [integration.id]: previous } })) }
        : undefined,
    });
  };

  const toggleNotify = (integration: Integration) => {
    const on = !state.notify.includes(integration.id);
    setState((s) => ({ ...s, notify: on ? [...s.notify, integration.id] : s.notify.filter((id) => id !== integration.id) }));
    toast(
      on
        ? { variant: "success", title: "We'll let you know", description: `You'll get an email at ${user.email} when ${integration.name} is available.` }
        : { variant: "info", title: "Notification removed", description: `You won't be emailed about ${integration.name}.` },
    );
  };

  const syncNow = (integration: Integration) => {
    setSyncing((s) => ({ ...s, [integration.id]: true }));
    later(() => {
      setState((s) => {
        const connection = s.connections[integration.id];
        if (!connection) return s;
        return { ...s, connections: { ...s.connections, [integration.id]: { ...connection, lastSync: Date.now() } } };
      });
      setSyncing((s) => ({ ...s, [integration.id]: false }));
      toast({ variant: "success", title: `${integration.name} is up to date`, description: "Sync finished just now." });
    }, 1400);
  };

  const toggleOption = (integration: Integration, optionId: string, value: boolean) =>
    setState((s) => {
      const connection = s.connections[integration.id];
      if (!connection) return s;
      return { ...s, connections: { ...s.connections, [integration.id]: { ...connection, options: { ...connection.options, [optionId]: value } } } };
    });

  const grouped = category === "all" && !query.trim() && statusFilter === "all";
  const clear = () => {
    setQuery("");
    setStatusFilter("all");
    setParam("category", null);
  };

  const renderCard = (integration: Integration) => (
    <IntegrationCard
      key={integration.id}
      integration={integration}
      status={statusFor(integration)}
      lastSync={state.connections[integration.id]?.lastSync}
      connecting={Boolean(connecting[integration.id])}
      notified={state.notify.includes(integration.id)}
      now={now}
      onOpen={() => setParam("integration", integration.id)}
      onConnect={() => (integration.auth === "apikey" ? setParam("integration", integration.id) : connect(integration))}
      onNotify={() => toggleNotify(integration)}
    />
  );

  const grid = "grid gap-4 sm:grid-cols-2 xl:grid-cols-3";

  return (
    <>
      <title>Integrations · NEXORA AI</title>

      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-2xl">
          <p className="text-xs font-medium text-subtle">Integrations marketplace</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Connect Your Business Stack.</h1>
          <p className="mt-1 text-base text-muted">Sync your CRM, messaging, payments and calendars with Nexora in a few clicks.</p>
        </div>
        <dl className="glass-card grid shrink-0 grid-cols-3 divide-x divide-hairline overflow-hidden rounded-2xl">
          {[
            { label: "Connected", value: summary.connected, filter: "connected" as const, dot: "bg-success" },
            { label: "Available", value: summary.available, filter: "available" as const, dot: "bg-primary" },
            { label: "Coming Soon", value: summary.coming_soon, filter: "coming_soon" as const, dot: "bg-subtle" },
          ].map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setStatusFilter(statusFilter === s.filter ? "all" : s.filter)}
              aria-pressed={statusFilter === s.filter}
              className={cn(
                "px-4 py-2.5 text-left outline-none transition-colors first:rounded-l-lg last:rounded-r-lg focus-visible:shadow-focus sm:px-5",
                statusFilter === s.filter ? "bg-primary-soft/40" : "hover:bg-canvas",
              )}
            >
              <dt className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted">
                <span className={cn("size-1.5 rounded-full", s.dot)} aria-hidden />
                {s.label}
              </dt>
              <dd className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-ink">{s.value}</dd>
            </button>
          ))}
        </dl>
      </header>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search integrations..."
          leftIcon={<Search />}
          aria-label="Search integrations"
          containerClassName="sm:max-w-sm sm:flex-1"
          type="search"
        />
        <Select
          aria-label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          options={[
            { value: "all", label: "All statuses" },
            { value: "connected", label: "Connected" },
            { value: "available", label: "Available" },
            { value: "coming_soon", label: "Coming Soon" },
          ]}
          containerClassName="sm:w-44"
        />
      </div>

      <nav aria-label="Categories" className="scrollbar-none -mx-4 mt-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex gap-2">
          {(["all", ...categories.map((c) => c.id)] as CategoryFilter[]).map((id) => {
            const active = category === id;
            return (
              <li key={id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setParam("category", id === "all" ? null : id)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-medium outline-none transition-colors focus-visible:shadow-focus",
                    active ? "border-ink bg-ink text-white" : "border-border bg-white text-muted hover:border-border-strong hover:text-ink",
                  )}
                >
                  {id === "all" ? "All" : categoryLabel[id]}
                  <span className={cn("font-mono text-2xs tabular-nums", active ? "text-white/70" : "text-subtle")}>{categoryCounts[id]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState
            bordered
            icon={<Search />}
            title="No integrations found"
            description={query ? `Nothing matches “${query}”. Try another name or category.` : "No integrations match these filters."}
            action={
              <Button variant="secondary" size="sm" onClick={clear}>
                Clear filters
              </Button>
            }
          />
        ) : grouped ? (
          <div className="space-y-10">
            {categories.map((c) => {
              const items = filtered.filter((i) => i.category === c.id);
              return (
                <section key={c.id} aria-labelledby={`cat-${c.id}`}>
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                      <h2 id={`cat-${c.id}`} className="type-h3">
                        {c.label}
                      </h2>
                      <p className="mt-0.5 text-sm text-muted">{c.description}</p>
                    </div>
                    <button type="button" onClick={() => setParam("category", c.id)} className="shrink-0 text-sm font-medium text-primary hover:underline">
                      View {items.length}
                    </button>
                  </div>
                  <ul className={grid}>{items.map(renderCard)}</ul>
                </section>
              );
            })}
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted">
              {filtered.length} {filtered.length === 1 ? "integration" : "integrations"}
              {category !== "all" && ` in ${categoryLabel[category]}`}
            </p>
            <ul className={grid}>{filtered.map(renderCard)}</ul>
          </>
        )}
      </div>

      <IntegrationModal
        integration={openIntegration}
        status={openIntegration ? statusFor(openIntegration) : "available"}
        connection={openIntegration ? state.connections[openIntegration.id] : undefined}
        connecting={openIntegration ? Boolean(connecting[openIntegration.id]) : false}
        syncing={openIntegration ? Boolean(syncing[openIntegration.id]) : false}
        notified={openIntegration ? state.notify.includes(openIntegration.id) : false}
        now={now}
        onClose={() => setParam("integration", null)}
        onConnect={(apiKey) => openIntegration && connect(openIntegration, apiKey)}
        onDisconnect={() => {
          if (!openIntegration) return;
          disconnect(openIntegration);
          setParam("integration", null);
        }}
        onToggleOption={(optionId, value) => openIntegration && toggleOption(openIntegration, optionId, value)}
        onSync={() => openIntegration && syncNow(openIntegration)}
        onNotify={() => openIntegration && toggleNotify(openIntegration)}
      />
    </>
  );
}
