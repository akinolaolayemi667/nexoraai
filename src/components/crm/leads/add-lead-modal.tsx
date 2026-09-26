import { useState, type FormEvent } from "react";
import { isEmail } from "@/lib/validation";
import { leadSources, leadStatuses, owners } from "@/lib/crm/constants";
import { useCrm, type NewLeadInput } from "@/lib/crm/crm-context";
import type { Lead } from "@/lib/crm/types";
import { Button, Input, Modal, Select } from "@/components/ui";

const empty = (ownerId: string): NewLeadInput => ({
  name: "",
  email: "",
  company: "",
  title: "",
  phone: "",
  source: "organic",
  status: "new",
  ownerId,
});

type Errors = Partial<Record<"name" | "email" | "company", string>>;

function validate(form: NewLeadInput, existing: Lead[]): Errors {
  const errors: Errors = {};
  if (form.name.trim().length < 2) errors.name = "Enter the contact's full name.";
  if (!form.email.trim()) errors.email = "Enter an email address.";
  else if (!isEmail(form.email)) errors.email = "Enter a valid email, like name@company.com.";
  else if (existing.some((l) => l.email.toLowerCase() === form.email.trim().toLowerCase()))
    errors.email = "A lead with this email already exists.";
  if (!form.company.trim()) errors.company = "Enter a company name.";
  return errors;
}

export function AddLeadModal({
  open,
  onClose,
  onCreated,
  defaultOwnerId,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (lead: Lead) => void;
  defaultOwnerId: string;
}) {
  const { state, actions } = useCrm();
  const [form, setForm] = useState(() => empty(defaultOwnerId));
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof NewLeadInput>(key: K, value: NewLeadInput[K]) {
    const next = { ...form, [key]: value };
    setForm(next);
    if (submitted) setErrors(validate(next, state.leads));
  }

  function close() {
    if (saving) return;
    onClose();
    window.setTimeout(() => {
      setForm(empty(defaultOwnerId));
      setErrors({});
      setSubmitted(false);
    }, 200);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    const found = validate(form, state.leads);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(`lead-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      const lead = actions.addLead({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        title: form.title.trim(),
        phone: form.phone.trim(),
      });
      setSaving(false);
      onCreated(lead);
      close();
    }, 450);
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add lead"
      description="New leads start with an AI score based on source and profile details."
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="add-lead-form" loading={saving} loadingText="Adding…">
            Add lead
          </Button>
        </>
      }
    >
      <form id="add-lead-form" noValidate onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Input
          id="lead-name"
          label="Full name"
          required
          autoFocus
          autoComplete="off"
          placeholder="Ada Lovelace"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          error={errors.name}
          containerClassName="sm:col-span-2"
        />
        <Input
          id="lead-email"
          label="Email"
          type="email"
          required
          autoComplete="off"
          placeholder="ada@company.com"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          error={errors.email}
        />
        <Input
          label="Phone"
          optional
          type="tel"
          placeholder="+1 (555) 010-2030"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
        <Input
          id="lead-company"
          label="Company"
          required
          placeholder="Analytical Engines Ltd"
          value={form.company}
          onChange={(e) => set("company", e.target.value)}
          error={errors.company}
        />
        <Input label="Job title" optional placeholder="Head of Operations" value={form.title} onChange={(e) => set("title", e.target.value)} />
        <Select
          label="Source"
          value={form.source}
          onChange={(e) => set("source", e.target.value as NewLeadInput["source"])}
          options={leadSources.map((s) => ({ value: s.id, label: s.label }))}
        />
        <Select
          label="Status"
          value={form.status}
          onChange={(e) => set("status", e.target.value as NewLeadInput["status"])}
          options={leadStatuses.map((s) => ({ value: s.id, label: s.label }))}
        />
        <Select
          label="Owner"
          value={form.ownerId}
          onChange={(e) => set("ownerId", e.target.value)}
          options={owners.map((o) => ({ value: o.id, label: o.name }))}
          containerClassName="sm:col-span-2"
        />
      </form>
    </Modal>
  );
}
