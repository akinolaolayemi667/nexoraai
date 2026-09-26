import { useState, type KeyboardEvent } from "react";
import { Link } from "react-router";
import { Check, Mail, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { assignableRoles, permissions, roleMeta, type TeamMember, type TeamRole } from "@/lib/team/data";
import { Alert, Avatar, Button, Modal, Textarea } from "@/components/ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function RolePicker({ value, onChange, name }: { value: TeamRole; onChange: (role: TeamRole) => void; name: string }) {
  return (
    <div role="radiogroup" aria-label="Role" className="grid gap-2">
      {assignableRoles.map((r) => {
        const selected = r.id === value;
        return (
          <label
            key={r.id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
              selected ? "border-primary bg-primary-soft/40 ring-1 ring-primary" : "border-border hover:border-border-strong hover:bg-canvas",
            )}
          >
            <input type="radio" name={name} value={r.id} checked={selected} onChange={() => onChange(r.id)} className="mt-0.5 size-4 accent-primary" />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink">{r.label}</span>
              <span className="block text-xs text-muted">{r.description}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

function PermissionSummary({ role }: { role: TeamRole }) {
  return (
    <ul className="grid gap-1.5 sm:grid-cols-2">
      {permissions.map((p) => {
        const allowed = p.roles.includes(role);
        return (
          <li key={p.label} className={cn("flex items-start gap-2 text-xs", allowed ? "text-ink" : "text-subtle line-through decoration-border-strong")}>
            {allowed ? <Check className="mt-0.5 size-3.5 shrink-0 text-success" aria-label="Allowed" /> : <X className="mt-0.5 size-3.5 shrink-0" aria-label="Not allowed" />}
            {p.label}
          </li>
        );
      })}
    </ul>
  );
}

type InviteModalProps = {
  open: boolean;
  onClose: () => void;
  seatsLeft: number;
  existingEmails: string[];
  onInvite: (emails: string[], role: TeamRole, message: string) => Promise<void>;
};

export function InviteModal({ open, onClose, seatsLeft, existingEmails, onInvite }: InviteModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Invite members" description="They'll get an email to join your workspace." size="md">
      {open && <InviteForm onClose={onClose} seatsLeft={seatsLeft} existingEmails={existingEmails} onInvite={onInvite} />}
    </Modal>
  );
}

function InviteForm({ onClose, seatsLeft, existingEmails, onInvite }: Omit<InviteModalProps, "open">) {
  const [emails, setEmails] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [role, setRole] = useState<TeamRole>("member");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const taken = new Set(existingEmails.map((e) => e.toLowerCase()));

  function commit(raw: string) {
    const parts = raw.split(/[\s,;]+/).map((p) => p.trim().toLowerCase()).filter(Boolean);
    if (parts.length === 0) return true;
    const invalid = parts.find((p) => !EMAIL_RE.test(p));
    if (invalid) {
      setError(`"${invalid}" isn't a valid email address.`);
      return false;
    }
    const dupe = parts.find((p) => taken.has(p));
    if (dupe) {
      setError(`${dupe} is already on the team.`);
      return false;
    }
    setEmails((prev) => [...new Set([...prev, ...parts])]);
    setText("");
    setError(null);
    return true;
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (["Enter", ",", " ", "Tab"].includes(e.key) && text.trim()) {
      if (e.key !== "Tab") e.preventDefault();
      commit(text);
    } else if (e.key === "Backspace" && !text && emails.length) {
      setEmails((prev) => prev.slice(0, -1));
    }
  }

  const overSeats = emails.length > seatsLeft;

  async function submit() {
    if (text.trim() && !commit(text)) return;
    const pending = text.trim() ? [...new Set([...emails, ...text.split(/[\s,;]+/).map((p) => p.trim().toLowerCase()).filter(Boolean)])] : emails;
    if (pending.length === 0) {
      setError("Add at least one email address.");
      return;
    }
    if (pending.length > seatsLeft) return;
    setSending(true);
    await onInvite(pending, role, message.trim());
    setSending(false);
    onClose();
  }

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="invite-emails" className="mb-1.5 block text-sm font-medium text-ink">
          Email addresses
        </label>
        <div
          className={cn(
            "flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border bg-white px-2 py-1.5 transition-shadow focus-within:border-primary focus-within:shadow-focus",
            error ? "border-danger" : "border-border-strong",
          )}
          onClick={() => document.getElementById("invite-emails")?.focus()}
        >
          {emails.map((email) => (
            <span key={email} className="inline-flex max-w-full items-center gap-1 rounded-sm bg-primary-soft py-0.5 pl-2 pr-1 text-xs font-medium text-primary-active">
              <span className="truncate">{email}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEmails((prev) => prev.filter((x) => x !== email));
                }}
                className="rounded-xs p-0.5 hover:bg-primary/10"
                aria-label={`Remove ${email}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          <input
            id="invite-emails"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError(null);
            }}
            onKeyDown={onKeyDown}
            onBlur={() => text.trim() && commit(text)}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text");
              if (/[\s,;]/.test(pasted)) {
                e.preventDefault();
                commit(text + pasted);
              }
            }}
            placeholder={emails.length ? "Add another…" : "name@company.com, another@company.com"}
            className="min-w-40 flex-1 bg-transparent px-1 py-0.5 text-sm text-ink outline-none placeholder:text-subtle"
            aria-invalid={Boolean(error) || undefined}
            aria-describedby="invite-emails-hint"
            type="email"
            autoComplete="off"
            data-autofocus
          />
        </div>
        <p id="invite-emails-hint" className={cn("mt-1.5 text-xs", error ? "text-danger" : "text-muted")}>
          {error ?? `Separate multiple addresses with commas. ${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} available.`}
        </p>
      </div>

      {overSeats && (
        <Alert
          tone="warning"
          title={`You're inviting ${emails.length} people but only ${seatsLeft} seat${seatsLeft === 1 ? " is" : "s are"} left`}
          description={
            <>
              Remove some addresses or{" "}
              <Link to={routes.app.billing} className="font-medium underline">
                add seats in Billing
              </Link>
              .
            </>
          }
        />
      )}

      <div>
        <p className="mb-1.5 text-sm font-medium text-ink">Role</p>
        <RolePicker value={role} onChange={setRole} name="invite-role" />
      </div>

      <Textarea label="Personal message" optional rows={2} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Welcome aboard! Here's where we run sales." maxLength={280} />

      <div className="sticky -bottom-5 -mx-6 -mb-5 flex flex-col-reverse gap-2 border-t border-border bg-canvas px-6 py-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={sending}>
          Cancel
        </Button>
        <Button leftIcon={<Mail />} onClick={submit} loading={sending} loadingText="Sending…" disabled={overSeats}>
          {emails.length > 1 ? `Send ${emails.length} invites` : "Send invite"}
        </Button>
      </div>
    </div>
  );
}

type RoleModalProps = {
  member: TeamMember | null;
  onClose: () => void;
  onSave: (member: TeamMember, role: TeamRole) => void;
};

export function RoleModal({ member, onClose, onSave }: RoleModalProps) {
  return (
    <Modal open={Boolean(member)} onClose={onClose} title="Edit role" description={member ? `Change what ${member.name.split(" ")[0]} can see and do.` : undefined} size="md">
      {member && <RoleForm key={member.id} member={member} onClose={onClose} onSave={onSave} />}
    </Modal>
  );
}

function RoleForm({ member, onClose, onSave }: { member: TeamMember; onClose: () => void; onSave: (member: TeamMember, role: TeamRole) => void }) {
  const [role, setRole] = useState<TeamRole>(member.role === "owner" ? "admin" : member.role);
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-md border border-border bg-canvas p-3">
        <Avatar name={member.name} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{member.name}</p>
          <p className="truncate text-xs text-muted">{member.email}</p>
        </div>
        <span className="shrink-0 text-xs text-muted">
          Now: <span className="font-medium text-ink">{roleMeta[member.role].label}</span>
        </span>
      </div>
      <RolePicker value={role} onChange={setRole} name="edit-role" />
      <div>
        <p className="type-overline mb-2">{roleMeta[role].label} permissions</p>
        <PermissionSummary role={role} />
      </div>
      <div className="sticky -bottom-5 -mx-6 -mb-5 flex flex-col-reverse gap-2 border-t border-border bg-canvas px-6 py-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => onSave(member, role)} disabled={role === member.role}>
          Save role
        </Button>
      </div>
    </div>
  );
}
