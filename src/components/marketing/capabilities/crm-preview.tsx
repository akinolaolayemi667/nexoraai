import { useMemo, useState } from "react";
import { Mail, Phone, Search, UserCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCompact } from "@/lib/format";
import { Avatar, Badge, Button, Input, Tabs } from "@/components/ui";
import { AppPanel } from "./feature-layout";

type Stage = "lead" | "customer";
type Filter = "all" | Stage;

type Contact = {
  id: string;
  name: string;
  company: string;
  email: string;
  stage: Stage;
  score: number;
  value: number;
  owner: string;
  lastActivity: string;
  nextStep: string;
};

const initialContacts: Contact[] = [
  {
    id: "c1",
    name: "Daniel Reyes",
    company: "Northwind Health",
    email: "daniel@northwind.health",
    stage: "lead",
    score: 91,
    value: 36000,
    owner: "Priya Shah",
    lastActivity: "Viewed pricing page · 20m ago",
    nextStep: "Send the healthcare case study",
  },
  {
    id: "c2",
    name: "Amara Okafor",
    company: "Brightline Logistics",
    email: "amara@brightline.co",
    stage: "customer",
    score: 88,
    value: 48000,
    owner: "Olayemi Akinola",
    lastActivity: "Replied to renewal email · 2h ago",
    nextStep: "Renewal call on Thursday",
  },
  {
    id: "c3",
    name: "Chloe Martin",
    company: "Aurora Retail",
    email: "chloe@auroraretail.com",
    stage: "lead",
    score: 76,
    value: 22000,
    owner: "Olayemi Akinola",
    lastActivity: "Submitted demo form · 1h ago",
    nextStep: "Book a discovery call",
  },
  {
    id: "c4",
    name: "Sofia Lindqvist",
    company: "Helio Energy",
    email: "sofia@helio.energy",
    stage: "customer",
    score: 94,
    value: 96000,
    owner: "Leo Grant",
    lastActivity: "Added 12 seats · Yesterday",
    nextStep: "Share the expansion proposal",
  },
  {
    id: "c5",
    name: "Kenji Watanabe",
    company: "Kestrel Studio",
    email: "kenji@kestrel.studio",
    stage: "lead",
    score: 62,
    value: 18000,
    owner: "Priya Shah",
    lastActivity: "Downloaded ROI guide · 3d ago",
    nextStep: "Qualify budget and timeline",
  },
];

function scoreTone(score: number) {
  if (score >= 85) return "bg-success";
  if (score >= 70) return "bg-primary";
  return "bg-warning";
}

export function CrmPreview() {
  const [contacts, setContacts] = useState(initialContacts);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("c1");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter(
      (c) =>
        (filter === "all" || c.stage === filter) &&
        (!q || c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q)),
    );
  }, [contacts, filter, query]);

  const selected = contacts.find((c) => c.id === selectedId) ?? contacts[0];
  const count = (stage: Stage) => contacts.filter((c) => c.stage === stage).length;

  function convert(id: string) {
    setContacts((list) => list.map((c) => (c.id === id ? { ...c, stage: "customer", score: Math.max(c.score, 80) } : c)));
  }

  return (
    <AppPanel label="Interactive CRM preview" className="grid grid-cols-1 sm:grid-cols-[1fr_12rem]">
      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2.5">
          <Input
            size="sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search contacts"
            leftIcon={<Search />}
            containerClassName="min-w-40 flex-1"
            className="text-sm"
          />
          <Tabs
            variant="segmented"
            value={filter}
            onValueChange={(v) => setFilter(v as Filter)}
            items={[
              { value: "all", label: "All", count: contacts.length },
              { value: "lead", label: "Leads", count: count("lead") },
              { value: "customer", label: "Customers", count: count("customer") },
            ]}
          />
        </div>
        <ul className="flex min-h-64 flex-1 flex-col p-1.5">
          {visible.map((contact) => {
            const active = contact.id === selected.id;
            return (
              <li key={contact.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(contact.id)}
                  aria-pressed={active}
                  className={cn(
                    "grid w-full grid-cols-[1fr_auto] items-center gap-3 rounded-md px-2.5 py-2 text-left outline-none transition-colors focus-visible:shadow-focus sm:grid-cols-[1fr_4.5rem_4rem_auto]",
                    active ? "bg-primary-soft/60" : "hover:bg-canvas",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Avatar name={contact.name} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">{contact.name}</span>
                      <span className="block truncate text-xs text-muted">{contact.company}</span>
                    </span>
                  </span>
                  <Badge variant={contact.stage === "customer" ? "success" : "primary"} size="sm" className="justify-self-start">
                    {contact.stage === "customer" ? "Customer" : "Lead"}
                  </Badge>
                  <span className="hidden items-center gap-1.5 sm:flex" title={`Score ${contact.score}`}>
                    <span className="h-1 w-8 overflow-hidden rounded-full bg-sunken">
                      <span className={cn("block h-full rounded-full", scoreTone(contact.score))} style={{ width: `${contact.score}%` }} />
                    </span>
                    <span className="font-mono text-2xs text-muted">{contact.score}</span>
                  </span>
                  <Avatar name={contact.owner} size="xs" className="hidden sm:inline-flex" />
                </button>
              </li>
            );
          })}
          {visible.length === 0 && (
            <li className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
              <Search className="size-4 text-subtle" aria-hidden />
              <p className="text-sm font-medium text-ink">No contacts found</p>
              <p className="text-xs text-muted">Try a different name or company.</p>
            </li>
          )}
        </ul>
      </div>

      <aside className="hidden flex-col border-l border-border bg-canvas/50 p-4 sm:flex" aria-live="polite">
        <Avatar name={selected.name} size="lg" />
        <p className="mt-3 truncate text-sm font-semibold text-ink">{selected.name}</p>
        <p className="truncate text-xs text-muted">{selected.company}</p>
        <div className="mt-3 flex gap-1.5">
          <Button size="icon-xs" variant="secondary" aria-label={`Email ${selected.name}`}>
            <Mail />
          </Button>
          <Button size="icon-xs" variant="secondary" aria-label={`Call ${selected.name}`}>
            <Phone />
          </Button>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-md border border-border bg-white px-2.5 py-1.5">
            <dt className="text-2xs text-muted">Deal value</dt>
            <dd className="text-metric text-sm font-semibold text-ink">${formatCompact(selected.value)}</dd>
          </div>
          <div className="rounded-md border border-border bg-white px-2.5 py-1.5">
            <dt className="text-2xs text-muted">AI score</dt>
            <dd className="text-metric text-sm font-semibold text-ink">{selected.score}</dd>
          </div>
        </dl>
        <p className="mt-4 text-2xs font-medium uppercase tracking-wider text-subtle">Last activity</p>
        <p className="mt-1 text-xs text-ink">{selected.lastActivity}</p>
        <p className="mt-3 text-2xs font-medium uppercase tracking-wider text-subtle">Next step</p>
        <p className="mt-1 text-xs text-ink">{selected.nextStep}</p>
        <div className="mt-auto pt-4">
          {selected.stage === "lead" ? (
            <Button size="xs" className="w-full" leftIcon={<UserCheck />} onClick={() => convert(selected.id)}>
              Convert to customer
            </Button>
          ) : (
            <p className="flex items-center justify-center gap-1.5 rounded-md bg-success-soft py-1.5 text-xs font-medium text-success-text">
              <UserCheck className="size-3.5" aria-hidden />
              Active customer
            </p>
          )}
        </div>
      </aside>
    </AppPanel>
  );
}
