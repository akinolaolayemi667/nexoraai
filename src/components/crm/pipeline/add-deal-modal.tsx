import { useMemo, useState, type FormEvent } from "react";
import { DollarSign, Percent } from "lucide-react";
import { dealStages, owners, stageMeta } from "@/lib/crm/constants";
import { useCrm, type NewDealInput } from "@/lib/crm/crm-context";
import { isoDate } from "@/lib/crm/seed";
import type { Deal, DealStage } from "@/lib/crm/types";
import { formatCurrency } from "@/lib/format";
import { Button, Input, Modal, Select } from "@/components/ui";

type Form = {
  name: string;
  company: string;
  contactId: string;
  value: string;
  stage: DealStage;
  probability: string;
  ownerId: string;
  expectedClose: string;
};

type Errors = Partial<Record<"name" | "company" | "value" | "probability" | "expectedClose", string>>;

export type DealDefaults = Partial<Pick<Form, "company" | "contactId" | "stage" | "ownerId">>;

function initial(defaults: DealDefaults, ownerId: string): Form {
  const stage = defaults.stage ?? "new";
  return {
    name: "",
    company: defaults.company ?? "",
    contactId: defaults.contactId ?? "",
    value: "",
    stage,
    probability: String(stageMeta[stage].probability),
    ownerId: defaults.ownerId ?? ownerId,
    expectedClose: isoDate(Date.now() + 30 * 24 * 3600_000),
  };
}

function validate(form: Form): Errors {
  const errors: Errors = {};
  const value = Number(form.value.replace(/[$,\s]/g, ""));
  const probability = Number(form.probability);
  if (form.name.trim().length < 2) errors.name = "Give the deal a short name, like “Website automation”.";
  if (!form.company.trim()) errors.company = "Enter the company this deal is with.";
  if (!form.value.trim()) errors.value = "Enter the deal value.";
  else if (!Number.isFinite(value) || value <= 0) errors.value = "Value must be a number greater than 0.";
  else if (value > 10_000_000) errors.value = "Value must be under $10,000,000.";
  if (form.probability === "" || !Number.isInteger(probability) || probability < 0 || probability > 100)
    errors.probability = "Use a whole number from 0 to 100.";
  if (!form.expectedClose) errors.expectedClose = "Pick an expected close date.";
  return errors;
}

export function AddDealModal({
  open,
  onClose,
  onCreated,
  defaults = {},
  defaultOwnerId,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (deal: Deal) => void;
  defaults?: DealDefaults;
  defaultOwnerId: string;
}) {
  const { state, actions } = useCrm();
  const [form, setForm] = useState(() => initial(defaults, defaultOwnerId));
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [probabilityTouched, setProbabilityTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setForm(initial(defaults, defaultOwnerId));
      setErrors({});
      setSubmitted(false);
      setProbabilityTouched(false);
    }
  }

  const contacts = useMemo(
    () => [...state.leads].sort((a, b) => a.name.localeCompare(b.name)).map((l) => ({ value: l.id, label: `${l.name} — ${l.company}` })),
    [state.leads],
  );

  function update(patch: Partial<Form>) {
    const next = { ...form, ...patch };
    setForm(next);
    if (submitted) setErrors(validate(next));
  }

  function close() {
    if (saving) return;
    onClose();
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    const found = validate(form);
    setErrors(found);
    const firstError = Object.keys(found)[0];
    if (firstError) {
      document.getElementById(`deal-${firstError}`)?.focus();
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      const input: NewDealInput = {
        name: form.name.trim(),
        company: form.company.trim(),
        contactId: form.contactId || null,
        value: Math.round(Number(form.value.replace(/[$,\s]/g, ""))),
        probability: Number(form.probability),
        stage: form.stage,
        ownerId: form.ownerId,
        expectedClose: form.expectedClose,
      };
      const deal = actions.addDeal(input);
      setSaving(false);
      onCreated(deal);
      onClose();
    }, 450);
  }

  const parsedValue = Number(form.value.replace(/[$,\s]/g, ""));
  const weighted = Number.isFinite(parsedValue) && parsedValue > 0 ? (parsedValue * Number(form.probability || 0)) / 100 : 0;

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add deal"
      description="Track a new opportunity in your pipeline."
      footer={
        <>
          {weighted > 0 && (
            <p className="mr-auto text-xs text-muted">
              Weighted <span className="font-mono tabular-nums text-ink">{formatCurrency(Math.round(weighted))}</span>
            </p>
          )}
          <Button variant="secondary" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="add-deal-form" loading={saving} loadingText="Adding…">
            Add deal
          </Button>
        </>
      }
    >
      <form id="add-deal-form" noValidate onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Input
          id="deal-name"
          label="Deal name"
          required
          autoFocus
          autoComplete="off"
          placeholder="Website automation"
          value={form.name}
          onChange={(e) => update({ name: e.target.value })}
          error={errors.name}
          containerClassName="sm:col-span-2"
        />
        <Select
          label="Contact"
          optional
          value={form.contactId}
          onChange={(e) => {
            const lead = state.leads.find((l) => l.id === e.target.value);
            update({ contactId: e.target.value, company: lead && !form.company.trim() ? lead.company : form.company });
          }}
          options={[{ value: "", label: "No contact" }, ...contacts]}
        />
        <Input
          id="deal-company"
          label="Company"
          required
          placeholder="Acme Corp"
          value={form.company}
          onChange={(e) => update({ company: e.target.value })}
          error={errors.company}
        />
        <Input
          id="deal-value"
          label="Value"
          required
          inputMode="decimal"
          placeholder="12,500"
          leftIcon={<DollarSign />}
          value={form.value}
          onChange={(e) => update({ value: e.target.value })}
          error={errors.value}
        />
        <Select
          label="Stage"
          value={form.stage}
          onChange={(e) => {
            const stage = e.target.value as DealStage;
            update({ stage, probability: probabilityTouched ? form.probability : String(stageMeta[stage].probability) });
          }}
          options={dealStages.map((s) => ({ value: s.id, label: s.label }))}
        />
        <Input
          id="deal-probability"
          label="Probability"
          inputMode="numeric"
          rightSlot={<Percent className="size-3.5" />}
          value={form.probability}
          onChange={(e) => {
            setProbabilityTouched(true);
            update({ probability: e.target.value.replace(/[^\d]/g, "").slice(0, 3) });
          }}
          error={errors.probability}
          hint={!errors.probability && !probabilityTouched ? "Set from the stage. Edit to override." : undefined}
        />
        <Select
          label="Owner"
          value={form.ownerId}
          onChange={(e) => update({ ownerId: e.target.value })}
          options={owners.map((o) => ({ value: o.id, label: o.name }))}
        />
        <Input
          id="deal-expectedClose"
          label="Expected close"
          type="date"
          value={form.expectedClose}
          onChange={(e) => update({ expectedClose: e.target.value })}
          error={errors.expectedClose}
          containerClassName="sm:col-span-2"
        />
      </form>
    </Modal>
  );
}
