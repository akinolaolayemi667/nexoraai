import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { useSearchParams } from "react-router";
import { LayoutGroup, motion } from "framer-motion";
import { CircleDollarSign, Plus, Scale, Search, Trophy, UserRound, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useUser } from "@/lib/auth/auth-context";
import { useCrm } from "@/lib/crm/crm-context";
import { dealStages, isOpenStage, ownerIdFor, owners, stageMeta } from "@/lib/crm/constants";
import type { Deal, DealStage, Lead } from "@/lib/crm/types";
import { useNow } from "@/hooks/use-now";
import { AnimatedNumber, Button, Card, Input, useToast } from "@/components/ui";
import { FilterMenu } from "@/components/crm/filter-menu";
import { AddDealModal } from "@/components/crm/pipeline/add-deal-modal";
import { DealCard } from "@/components/crm/pipeline/deal-card";
import { DealDrawer } from "@/components/crm/pipeline/deal-drawer";

const WON_WINDOW = 30 * 24 * 3600_000;

type DropTarget = { stage: DealStage; beforeId: string | null };

function SummaryCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  detail: React.ReactNode;
  tone: "primary" | "accent" | "success";
}) {
  return (
    <Card padding="md" className="flex w-[72%] max-w-64 shrink-0 snap-start items-start gap-4 sm:w-auto sm:max-w-none">
      <span
        className={cn(
          "hidden size-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset sm:flex [&_svg]:size-5",
          tone === "primary" && "bg-primary-soft/60 text-primary ring-primary-border",
          tone === "accent" && "bg-accent-soft text-accent ring-accent-border",
          tone === "success" && "bg-success-soft text-success-text ring-success-border",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted">{label}</p>
        <AnimatedNumber value={value} format={(v) => formatCurrency(Math.round(v))} className="type-metric mt-1 block" />
        <p className="mt-1 text-xs text-muted">{detail}</p>
      </div>
    </Card>
  );
}

export default function PipelinePage() {
  const user = useUser();
  const now = useNow();
  const { toast } = useToast();
  const { state, actions } = useCrm();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState("");
  const [ownerIds, setOwnerIds] = useState<string[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [drop, setDrop] = useState<DropTarget | null>(null);
  const [addStage, setAddStage] = useState<DealStage | null>(null);
  const [highlight, setHighlight] = useState<string | null>(() => params.get("deal") ?? params.get("stage"));
  const boardRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState<DealStage>(dealStages[0].id);
  const stageNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = stageNavRef.current;
    const chip = nav?.querySelector<HTMLElement>(`[data-chip="${activeStage}"]`);
    if (!nav || !chip) return;
    nav.scrollTo({ left: chip.offsetLeft - (nav.clientWidth - chip.offsetWidth) / 2, behavior: "smooth" });
  }, [activeStage]);

  function onBoardScroll() {
    const board = boardRef.current;
    if (!board) return;
    const left = board.getBoundingClientRect().left;
    let best: DealStage = dealStages[0].id;
    let bestDistance = Infinity;
    for (const el of board.querySelectorAll<HTMLElement>("[data-stage]")) {
      const distance = Math.abs(el.getBoundingClientRect().left - left);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = el.dataset.stage as DealStage;
      }
    }
    setActiveStage(best);
  }

  function jumpToStage(stage: DealStage) {
    const board = boardRef.current;
    const column = board?.querySelector<HTMLElement>(`[data-stage="${stage}"]`);
    if (!board || !column) return;
    const padding = parseFloat(getComputedStyle(board).paddingLeft) || 0;
    board.scrollTo({ left: column.offsetLeft - padding, behavior: "smooth" });
  }
  const dragRef = useRef<string | null>(null);

  const openDealId = params.get("deal");
  const openDeal = state.deals.find((d) => d.id === openDealId);

  const contacts = useMemo(() => new Map<string, Lead>(state.leads.map((l) => [l.id, l])), [state.leads]);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return state.deals.filter((deal) => {
      if (ownerIds.length > 0 && !ownerIds.includes(deal.ownerId)) return false;
      if (!needle) return true;
      const contact = deal.contactId ? contacts.get(deal.contactId) : undefined;
      return [deal.company, deal.name, contact?.name ?? ""].some((f) => f.toLowerCase().includes(needle));
    });
  }, [state.deals, ownerIds, q, contacts]);

  const byStage = useMemo(() => {
    const map = Object.fromEntries(dealStages.map((s) => [s.id, [] as Deal[]])) as Record<DealStage, Deal[]>;
    visible.forEach((deal) => map[deal.stage].push(deal));
    return map;
  }, [visible]);

  const summary = useMemo(() => {
    const open = visible.filter((d) => isOpenStage(d.stage));
    const total = open.reduce((sum, d) => sum + d.value, 0);
    const weighted = open.reduce((sum, d) => sum + (d.value * d.probability) / 100, 0);
    const won = visible.filter((d) => d.stage === "won" && (d.closedAt ?? d.lastActivityAt) >= now - WON_WINDOW);
    const lost = visible.filter((d) => d.stage === "lost" && (d.closedAt ?? d.lastActivityAt) >= now - WON_WINDOW);
    return {
      total,
      weighted,
      openCount: open.length,
      wonValue: won.reduce((sum, d) => sum + d.value, 0),
      wonCount: won.length,
      winRate: won.length + lost.length > 0 ? Math.round((won.length / (won.length + lost.length)) * 100) : 0,
    };
  }, [visible, now]);

  // Deep links from the dashboard (?stage=) and contact profiles (?deal=) scroll the target into view.
  useEffect(() => {
    if (!highlight) return;
    const el =
      boardRef.current?.querySelector<HTMLElement>(`[data-deal-id="${highlight}"]`) ??
      boardRef.current?.querySelector<HTMLElement>(`[data-stage="${highlight}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    const timer = window.setTimeout(() => setHighlight(null), 2200);
    return () => window.clearTimeout(timer);
  }, [highlight]);

  const setOpenDeal = useCallback(
    (id: string | null) =>
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.delete("stage");
          if (id) next.set("deal", id);
          else next.delete("deal");
          return next;
        },
        { replace: true },
      ),
    [setParams],
  );

  const move = useCallback(
    (id: string, stage: DealStage, beforeId: string | null = null) => {
      const deal = state.deals.find((d) => d.id === id);
      if (!deal) return;
      if (deal.stage === stage) {
        actions.moveDeal(id, stage, beforeId);
        return;
      }
      const sameStage = state.deals.filter((d) => d.stage === deal.stage);
      const previousNext = sameStage[sameStage.indexOf(deal) + 1]?.id ?? null;
      actions.moveDeal(id, stage, beforeId);
      const undo = {
        label: "Undo",
        onClick: () => {
          actions.moveDeal(id, deal.stage, previousNext);
          actions.updateDeal(id, { probability: deal.probability });
        },
      };
      if (stage === "won") {
        toast({ variant: "success", title: `${deal.company} won`, description: `${formatCurrency(deal.value)} added to won this month.`, action: undo });
      } else {
        toast({
          title: `Moved to ${stageMeta[stage].label}`,
          description: `${deal.company} · probability ${stageMeta[stage].probability}%`,
          action: undo,
        });
      }
    },
    [state.deals, actions, toast],
  );

  const onCardMove = useCallback((id: string, stage: DealStage) => move(id, stage), [move]);

  const onDragStart = useCallback((id: string, event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    dragRef.current = id;
    // Let the browser snapshot the card before it's dimmed.
    requestAnimationFrame(() => setDragId(id));
  }, []);

  const onDragEnd = useCallback(() => {
    dragRef.current = null;
    setDragId(null);
    setDrop(null);
  }, []);

  function targetFor(stage: DealStage, event: DragEvent<HTMLElement>): DropTarget {
    const cards = [...event.currentTarget.querySelectorAll<HTMLElement>("[data-deal-id]")].filter(
      (el) => el.dataset.dealId !== dragRef.current,
    );
    const next = cards.find((el) => {
      const rect = el.getBoundingClientRect();
      return event.clientY < rect.top + rect.height / 2;
    });
    return { stage, beforeId: next?.dataset.dealId ?? null };
  }

  function onColumnDragOver(stage: DealStage, event: DragEvent<HTMLElement>) {
    if (!dragRef.current) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const target = targetFor(stage, event);
    if (target.stage !== drop?.stage || target.beforeId !== drop?.beforeId) setDrop(target);
  }

  function onColumnDragLeave(stage: DealStage, event: DragEvent<HTMLElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setDrop((current) => (current?.stage === stage ? null : current));
  }

  function onColumnDrop(stage: DealStage, event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const id = dragRef.current ?? event.dataTransfer.getData("text/plain");
    if (id) move(id, stage, targetFor(stage, event).beforeId);
    onDragEnd();
  }

  const filtered = q.trim() !== "" || ownerIds.length > 0;

  return (
    <>
      <title>Pipeline · NEXORA AI</title>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Sales pipeline</h1>
          <p className="mt-1 text-base text-muted">Drag deals between stages to keep your forecast up to date.</p>
        </div>
        <Button leftIcon={<Plus />} onClick={() => setAddStage("new")} className="shrink-0">
          Add deal
        </Button>
      </header>

      <div className="scrollbar-none -mx-4 mt-5 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 sm:mx-0 sm:mt-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0">
        <SummaryCard
          icon={<CircleDollarSign />}
          label="Total Pipeline"
          value={summary.total}
          tone="primary"
          detail={
            <>
              <span className="font-mono tabular-nums text-ink">{summary.openCount}</span> open deals
            </>
          }
        />
        <SummaryCard
          icon={<Scale />}
          label="Weighted Pipeline"
          value={summary.weighted}
          tone="accent"
          detail={
            <>
              <span className="font-mono tabular-nums text-ink">
                {summary.total > 0 ? Math.round((summary.weighted / summary.total) * 100) : 0}%
              </span>{" "}
              of total, by probability
            </>
          }
        />
        <SummaryCard
          icon={<Trophy />}
          label="Won This Month"
          value={summary.wonValue}
          tone="success"
          detail={
            <>
              <span className="font-mono tabular-nums text-ink">{summary.wonCount}</span> deals ·{" "}
              <span className="font-mono tabular-nums text-ink">{summary.winRate}%</span> win rate
            </>
          }
        />
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          size="sm"
          type="search"
          aria-label="Search deals"
          placeholder="Search company, deal or contact"
          leftIcon={<Search />}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          rightSlot={
            q ? (
              <button type="button" onClick={() => setQ("")} className="rounded-xs text-subtle hover:text-ink" aria-label="Clear search">
                <X className="size-3.5" />
              </button>
            ) : undefined
          }
          containerClassName="w-full sm:w-72"
          className="[&::-webkit-search-cancel-button]:hidden"
        />
        <div className="flex items-center gap-2">
          <FilterMenu
            label="Owner"
            icon={<UserRound />}
            options={owners.map((o) => ({ value: o.id, label: o.name }))}
            selected={ownerIds}
            onChange={setOwnerIds}
          />
          {filtered && (
            <Button variant="ghost" size="sm" onClick={() => { setQ(""); setOwnerIds([]); }}>
              Clear
            </Button>
          )}
        </div>
        <p className="text-xs text-muted sm:ml-auto">
          <span className="font-mono tabular-nums text-ink">{formatNumber(visible.length)}</span> deals
          <span className="lg:hidden"> · tap ⋯ on a card to move it</span>
        </p>
      </div>

      <nav
        ref={stageNavRef}
        aria-label="Jump to stage"
        className="scrollbar-none relative -mx-4 mt-4 flex gap-1.5 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:hidden"
      >
        {dealStages.map((stage) => {
          const active = activeStage === stage.id;
          return (
            <button
              key={stage.id}
              type="button"
              data-chip={stage.id}
              onClick={() => jumpToStage(stage.id)}
              aria-current={active ? "true" : undefined}
              className={cn(
                "flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:shadow-focus focus-visible:outline-none",
                active ? "border-ink bg-ink text-white" : "border-border bg-canvas text-muted hover:text-ink",
              )}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: stage.color }} aria-hidden />
              {stage.label}
              <span className={cn("font-mono tabular-nums", active ? "text-white/70" : "text-subtle")}>
                {byStage[stage.id].length}
              </span>
            </button>
          );
        })}
      </nav>

      <LayoutGroup>
        <motion.div
          ref={boardRef}
          layoutScroll
          onScroll={onBoardScroll}
          className="scrollbar-thin relative -mx-4 mt-3 flex scroll-px-4 snap-x snap-mandatory sm:scroll-px-6 lg:mt-4 gap-3 overflow-x-auto px-4 pb-6 sm:-mx-6 sm:px-6 lg:-mx-8 lg:snap-none lg:px-8"
        >
          {dealStages.map((stage) => {
            const deals = byStage[stage.id];
            const total = deals.reduce((sum, d) => sum + d.value, 0);
            const isTarget = drop?.stage === stage.id;
            const others = deals.filter((d) => d.id !== dragId);
            return (
              <section
                key={stage.id}
                data-stage={stage.id}
                aria-label={`${stage.label}: ${deals.length} deals, ${formatCurrency(total)}`}
                className={cn(
                  "flex w-[82vw] max-w-72 shrink-0 snap-start flex-col rounded-xl border bg-canvas transition-[border-color,box-shadow,background-color] duration-150 sm:w-72",
                  isTarget ? "border-primary-border bg-primary-soft/20 shadow-focus" : "border-border",
                  highlight === stage.id && "border-primary shadow-focus",
                )}
              >
                <header className="flex items-center gap-2 px-3 pb-2 pt-3">
                  <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: stage.color }} aria-hidden />
                  <h2 className="truncate text-sm font-semibold text-ink">{stage.label}</h2>
                  <span className="rounded-sm bg-white px-1.5 font-mono text-2xs tabular-nums text-muted ring-1 ring-inset ring-border">
                    {deals.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="ml-auto text-subtle"
                    aria-label={`Add deal to ${stage.label}`}
                    onClick={() => setAddStage(stage.id)}
                  >
                    <Plus />
                  </Button>
                </header>
                <p className="px-3 pb-2 font-mono text-xs tabular-nums text-muted">{formatCurrency(total)}</p>
                <div className="mx-3 h-0.5 rounded-full" style={{ backgroundColor: stage.color, opacity: 0.35 }} aria-hidden />

                <div
                  className="flex min-h-40 flex-1 flex-col gap-2 p-2 pt-3"
                  onDragOver={(e) => onColumnDragOver(stage.id, e)}
                  onDragLeave={(e) => onColumnDragLeave(stage.id, e)}
                  onDrop={(e) => onColumnDrop(stage.id, e)}
                >
                  {deals.map((deal, index) => (
                    <div key={deal.id} className="relative">
                      {isTarget && drop.beforeId === deal.id && <DropLine />}
                      <DealCard
                        deal={deal}
                        contact={deal.contactId ? contacts.get(deal.contactId) : undefined}
                        now={now}
                        dragging={dragId === deal.id}
                        highlighted={highlight === deal.id || openDealId === deal.id}
                        menuSide={deals.length > 2 && index >= deals.length - 2 ? "top" : "bottom"}
                        onOpen={setOpenDeal}
                        onMove={onCardMove}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                      />
                    </div>
                  ))}
                  {isTarget && drop.beforeId === null && others.length > 0 && <div className="relative h-0"><DropLine /></div>}
                  {deals.length === 0 && (
                    <div
                      className={cn(
                        "flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed px-3 py-8 text-center text-xs transition-colors",
                        isTarget ? "border-primary bg-white text-primary" : "border-border-strong text-subtle",
                      )}
                    >
                      {isTarget ? "Drop to move here" : filtered ? "No matching deals" : "No deals yet"}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </motion.div>
      </LayoutGroup>

      <AddDealModal
        open={addStage !== null}
        onClose={() => setAddStage(null)}
        defaults={{ stage: addStage ?? "new" }}
        defaultOwnerId={ownerIdFor(user.name)}
        onCreated={(deal) => {
          setQ("");
          setOwnerIds([]);
          setHighlight(deal.id);
          toast({ variant: "success", title: "Deal added", description: `${deal.company} · ${formatCurrency(deal.value)} in ${stageMeta[deal.stage].label}` });
        }}
      />

      <DealDrawer deal={openDeal} now={now} onClose={() => setOpenDeal(null)} onMove={onCardMove} />
    </>
  );
}

function DropLine() {
  return (
    <span className="pointer-events-none absolute -top-[5px] left-0 right-0 z-10 flex items-center" aria-hidden>
      <span className="size-2 rounded-full border-2 border-primary bg-white" />
      <span className="h-0.5 flex-1 rounded-full bg-primary" />
    </span>
  );
}
