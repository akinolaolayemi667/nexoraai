import { useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight, DollarSign, Percent, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { dealStages, owners, stageMeta } from "@/lib/crm/constants";
import { useCrm } from "@/lib/crm/crm-context";
import type { Deal, DealStage } from "@/lib/crm/types";
import { formatCurrency, formatDate, formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";
import { Avatar, Button, ConfirmDialog, Drawer, Input, Select, useToast } from "@/components/ui";

type Draft = { name: string; value: string; probability: string; ownerId: string; expectedClose: string };

const toDraft = (deal: Deal): Draft => ({
  name: deal.name,
  value: String(deal.value),
  probability: String(deal.probability),
  ownerId: deal.ownerId,
  expectedClose: deal.expectedClose,
});

export function DealDrawer({
  deal,
  now,
  onClose,
  onMove,
}: {
  deal: Deal | undefined;
  now: number;
  onClose: () => void;
  onMove: (id: string, stage: DealStage) => void;
}) {
  const { state, actions } = useCrm();
  const { toast } = useToast();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [base, setBase] = useState<Deal | undefined>();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lastDeal, setLastDeal] = useState(deal);

  if (deal && deal !== lastDeal) setLastDeal(deal);
  const shown = deal ?? lastDeal;

  // Keep unsaved edits when the deal changes underneath (e.g. a stage move), but take the new probability.
  if (shown && shown !== base) {
    const edited = base?.id === shown.id && draft !== null && JSON.stringify(draft) !== JSON.stringify(toDraft(base));
    setBase(shown);
    if (!edited) setDraft(toDraft(shown));
    else if (base && shown.probability !== base.probability) setDraft({ ...draft!, probability: String(shown.probability) });
  }

  if (!shown || !draft) return <Drawer open={false} onClose={onClose} title="" />;

  const contact = state.leads.find((l) => l.id === shown.contactId);
  const value = Number(draft.value.replace(/[$,\s]/g, ""));
  const probability = Number(draft.probability);
  const errors = {
    name: draft.name.trim().length < 2 ? "Enter a deal name." : undefined,
    value: !Number.isFinite(value) || value <= 0 ? "Enter a value above 0." : undefined,
    probability: !Number.isInteger(probability) || probability < 0 || probability > 100 ? "0 to 100." : undefined,
  };
  const valid = !errors.name && !errors.value && !errors.probability;
  const dirty = JSON.stringify(draft) !== JSON.stringify(toDraft(shown));

  function save() {
    if (!shown || !draft || !valid) return;
    actions.updateDeal(shown.id, {
      name: draft.name.trim(),
      value: Math.round(value),
      probability,
      ownerId: draft.ownerId,
      expectedClose: draft.expectedClose,
    });
    toast({ variant: "success", title: "Deal updated" });
    onClose();
  }

  return (
    <>
      <Drawer
        open={Boolean(deal)}
        onClose={onClose}
        size="md"
        title={shown.company}
        description={shown.name}
        footer={
          <>
            <Button variant="ghost" size="sm" leftIcon={<Trash2 />} onClick={() => setConfirmDelete(true)} className="mr-auto text-danger-text hover:bg-danger-soft hover:text-danger-text">
              Delete
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={save} disabled={!dirty || !valid}>
              Save changes
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted">Value</p>
              <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-ink">{formatCurrency(shown.value)}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted">Weighted</p>
              <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-ink">
                {formatCurrency(Math.round((shown.value * shown.probability) / 100))}
              </p>
            </div>
          </div>

          <section>
            <h3 className="type-overline mb-2">Stage</h3>
            <div className="flex flex-wrap gap-1.5">
              {dealStages.map((stage) => {
                const active = stage.id === shown.stage;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => !active && onMove(shown.id, stage.id)}
                    className={cn(
                      "inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium outline-none transition-colors duration-150 focus-visible:shadow-focus",
                      active ? "border-ink bg-ink text-white" : "border-border bg-white text-ink hover:bg-canvas",
                    )}
                  >
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: stage.color }} aria-hidden />
                    {stage.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted">
              Moving stages sets probability to the stage default ({stageMeta[shown.stage].probability}% for {stageMeta[shown.stage].label}).
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Deal name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              error={errors.name}
              containerClassName="sm:col-span-2"
            />
            <Input
              label="Value"
              inputMode="decimal"
              leftIcon={<DollarSign />}
              value={draft.value}
              onChange={(e) => setDraft({ ...draft, value: e.target.value })}
              error={errors.value}
            />
            <Input
              label="Probability"
              inputMode="numeric"
              rightSlot={<Percent className="size-3.5" />}
              value={draft.probability}
              onChange={(e) => setDraft({ ...draft, probability: e.target.value.replace(/[^\d]/g, "").slice(0, 3) })}
              error={errors.probability}
            />
            <Select
              label="Owner"
              value={draft.ownerId}
              onChange={(e) => setDraft({ ...draft, ownerId: e.target.value })}
              options={owners.map((o) => ({ value: o.id, label: o.name }))}
            />
            <Input
              label="Expected close"
              type="date"
              value={draft.expectedClose}
              onChange={(e) => setDraft({ ...draft, expectedClose: e.target.value })}
            />
          </section>

          <section>
            <h3 className="type-overline mb-2">Contact</h3>
            {contact ? (
              <Link
                to={routes.app.lead(contact.id)}
                className="group flex items-center gap-3 rounded-lg border border-border p-3 outline-none transition-colors hover:bg-canvas focus-visible:shadow-focus"
              >
                <Avatar name={contact.name} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{contact.name}</span>
                  <span className="block truncate text-xs text-muted">
                    {contact.title ? `${contact.title} · ` : ""}
                    {contact.email}
                  </span>
                </span>
                <ArrowUpRight className="size-4 text-subtle transition-colors group-hover:text-ink" aria-hidden />
              </Link>
            ) : (
              <p className="rounded-lg border border-dashed border-border-strong bg-canvas p-3 text-sm text-muted">No contact linked.</p>
            )}
          </section>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted">Created</dt>
              <dd className="mt-0.5 font-mono text-xs tabular-nums text-ink">{formatDate(shown.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Last activity</dt>
              <dd className="mt-0.5 font-mono text-xs tabular-nums text-ink">{formatRelative(shown.lastActivityAt, now)}</dd>
            </div>
          </dl>
        </div>
      </Drawer>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          actions.deleteDeal(shown.id);
          setConfirmDelete(false);
          onClose();
          toast({ title: `${shown.company} deal deleted` });
        }}
        tone="danger"
        title="Delete this deal?"
        description={`${shown.name} (${formatCurrency(shown.value)}) will be removed from the pipeline.`}
        confirmLabel="Delete deal"
      />
    </>
  );
}
