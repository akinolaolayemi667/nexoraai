import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  ListTodo,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Trash2,
  UserX,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDate, formatRelative } from "@/lib/format";
import { routes } from "@/lib/routes";
import { useCrm } from "@/lib/crm/crm-context";
import {
  leadStatuses,
  ownerById,
  ownerIdFor,
  owners,
  scoreTier,
  scoreTiers,
  sourceLabel,
  statusMeta,
} from "@/lib/crm/constants";
import type { LeadStatus } from "@/lib/crm/types";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useNow } from "@/hooks/use-now";
import { useSetPageCrumb } from "@/hooks/use-page-crumb";
import {
  Avatar,
  Button,
  Card,
  ConfirmDialog,
  Dropdown,
  EmptyState,
  Tabs,
  buttonVariants,
  useToast,
} from "@/components/ui";
import { ScoreRing, StatusBadge } from "@/components/crm/crm-ui";
import { AddDealModal } from "@/components/crm/pipeline/add-deal-modal";
import { ConversationsTab } from "@/components/crm/profile/conversations-tab";
import { DealsTab } from "@/components/crm/profile/deals-tab";
import { ActivityTab, NotesTab, TasksTab } from "@/components/crm/profile/engagement-tabs";
import { OverviewTab, type ProfileTab } from "@/components/crm/profile/overview-tab";
import { useLeadData } from "@/components/crm/profile/use-lead-data";

const tabIds: ProfileTab[] = ["overview", "activity", "notes", "tasks", "conversations", "deals"];

const inlineSelect =
  "h-8 w-full cursor-pointer rounded-md border border-transparent bg-transparent px-2 -mx-2 text-sm text-ink outline-none transition-[border-color,background-color,box-shadow] hover:border-border hover:bg-white focus-visible:border-primary focus-visible:bg-white focus-visible:shadow-focus";

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-3 py-2">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="min-w-0 text-sm text-ink">{children}</dd>
    </div>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const { toast } = useToast();
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={`Copy ${label}`}
      className="shrink-0 text-subtle"
      onClick={() => {
        void navigator.clipboard?.writeText(value);
        toast({ title: `${label[0].toUpperCase()}${label.slice(1)} copied`, description: value });
      }}
    >
      <Copy />
    </Button>
  );
}

export default function ContactProfilePage() {
  const { leadId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const now = useNow();
  const { toast } = useToast();
  const { actions, actor } = useCrm();
  const { lead, deals, openDeals, notes, tasks, openTasks, timeline, threads } = useLeadData(leadId);
  const addDeal = useDisclosure();
  const [confirmDelete, setConfirmDelete] = useState(false);
  useSetPageCrumb(lead?.name);

  const fromContacts = pathname.startsWith(routes.app.contacts);
  const backHref = fromContacts ? routes.app.contacts : routes.app.leads;
  const backLabel = fromContacts ? "Contacts" : "Leads";
  const requestedTab = params.get("tab") as ProfileTab | null;
  const tab: ProfileTab = requestedTab && tabIds.includes(requestedTab) ? requestedTab : "overview";

  function setTab(next: ProfileTab) {
    setParams(
      (current) => {
        const updated = new URLSearchParams(current);
        if (next === "overview") updated.delete("tab");
        else updated.set("tab", next);
        return updated;
      },
      { replace: true },
    );
  }

  if (!lead) {
    return (
      <>
        <title>Contact not found · NEXORA AI</title>
        <Card className="mt-2">
          <EmptyState
            icon={<UserX />}
            title="Contact not found"
            description="This contact may have been deleted, or the link is out of date."
            action={
              <Link to={backHref} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                <ArrowLeft />
                Back to {backLabel.toLowerCase()}
              </Link>
            }
          />
        </Card>
      </>
    );
  }

  const tier = scoreTiers.find((t) => t.id === scoreTier(lead.score))!;

  function setStatus(status: LeadStatus) {
    if (!lead || status === lead.status) return;
    actions.updateLeads([lead.id], { status });
    toast({ variant: "success", title: `Status changed to ${statusMeta[status].label}` });
  }

  function setOwner(ownerId: string) {
    if (!lead || ownerId === lead.ownerId) return;
    actions.updateLeads([lead.id], { ownerId });
    toast({ variant: "success", title: `Assigned to ${ownerById(ownerId).name}` });
  }

  const tabs: { value: ProfileTab; label: string; count?: number }[] = [
    { value: "overview", label: "Overview" },
    { value: "activity", label: "Activity", count: timeline.length },
    { value: "notes", label: "Notes", count: notes.length },
    { value: "tasks", label: "Tasks", count: openTasks.length },
    { value: "conversations", label: "Conversations", count: threads.length },
    { value: "deals", label: "Deals", count: deals.length },
  ];

  return (
    <>
      <title>{`${lead.name} · NEXORA AI`}</title>

      <Link
        to={backHref}
        className="inline-flex items-center gap-1.5 rounded-xs text-sm text-muted outline-none transition-colors hover:text-ink focus-visible:shadow-focus"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {backLabel}
      </Link>

      <Card className="mt-3 p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <Avatar name={lead.name} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="truncate font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">{lead.name}</h1>
              <StatusBadge status={lead.status} />
            </div>
            <p className="mt-0.5 truncate text-sm text-muted">
              {lead.title ? `${lead.title} at ` : ""}
              <span className="text-ink">{lead.company}</span>
            </p>
            <p className="mt-1 text-xs text-subtle">
              {lead.location && <>{lead.location} · </>}Last activity{" "}
              <span className="font-mono tabular-nums">{formatRelative(lead.lastActivityAt, now).toLowerCase()}</span>
            </p>
          </div>
          <div className="hidden shrink-0 items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="type-overline">Lead score</p>
              <p className="text-sm font-medium text-ink">{tier.label}</p>
            </div>
            <ScoreRing score={lead.score} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border-subtle pt-4">
          <Button size="sm" leftIcon={<Mail />} onClick={() => setTab("conversations")} className="flex-1 sm:flex-none">
            Email
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Phone />}
            disabled={!lead.phone}
            className="flex-1 sm:flex-none"
            onClick={() => {
              actions.logActivity(lead.id, "call", "Outbound call", `Called ${lead.phone}`);
              toast({ title: `Calling ${lead.name.split(" ")[0]}…`, description: "Logged to the activity timeline." });
              if (window.matchMedia("(pointer: coarse)").matches) window.location.href = `tel:${lead.phone.replace(/[^\d+]/g, "")}`;
            }}
          >
            Call
          </Button>
          <Button variant="secondary" size="sm" leftIcon={<Plus />} onClick={addDeal.open} className="flex-1 sm:flex-none">
            Add deal
          </Button>
          <Dropdown
            align="end"
            width="w-52"
            items={[
              { label: "Add task", icon: <ListTodo />, onSelect: () => setTab("tasks") },
              {
                label: "Copy email",
                icon: <Copy />,
                onSelect: () => {
                  void navigator.clipboard?.writeText(lead.email);
                  toast({ title: "Email copied", description: lead.email });
                },
              },
              {
                label: `Visit ${lead.website}`,
                icon: <ExternalLink />,
                onSelect: () => window.open(`https://${lead.website}`, "_blank", "noopener"),
              },
              { type: "separator" },
              { label: "Delete contact", icon: <Trash2 />, danger: true, onSelect: () => setConfirmDelete(true) },
            ]}
            trigger={({ open, ...props }) => (
              <Button {...props} variant="secondary" size="icon-sm" aria-label="More actions" className={cn(open && "bg-canvas")}>
                <MoreHorizontal />
              </Button>
            )}
          />
        </div>
      </Card>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <Card className="p-4 sm:p-5 lg:sticky lg:top-[calc(var(--spacing-topbar)+1.5rem)]">
          <h2 className="type-h4">Details</h2>
          <dl className="mt-2 divide-y divide-border-subtle">
            <DetailRow label="Contact">
              <span className="block truncate font-medium">{lead.name}</span>
              {lead.title && <span className="block truncate text-xs text-muted">{lead.title}</span>}
            </DetailRow>
            <DetailRow label="Company">
              <span className="block truncate">{lead.company}</span>
              <a
                href={`https://${lead.website}`}
                target="_blank"
                rel="noreferrer"
                className="block truncate text-xs text-primary hover:underline"
              >
                {lead.website}
              </a>
            </DetailRow>
            <DetailRow label="Email">
              <span className="flex items-center gap-1">
                <a href={`mailto:${lead.email}`} className="min-w-0 truncate text-primary hover:underline">
                  {lead.email}
                </a>
                <CopyButton value={lead.email} label="email" />
              </span>
            </DetailRow>
            <DetailRow label="Phone">
              {lead.phone ? (
                <span className="flex items-center gap-1">
                  <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="min-w-0 truncate font-mono text-xs tabular-nums hover:underline">
                    {lead.phone}
                  </a>
                  <CopyButton value={lead.phone} label="phone" />
                </span>
              ) : (
                <span className="text-muted">—</span>
              )}
            </DetailRow>
            <DetailRow label="Owner">
              <span className="flex items-center gap-2">
                <Avatar name={ownerById(lead.ownerId).name} size="xs" />
                <select aria-label="Owner" value={lead.ownerId} onChange={(e) => setOwner(e.target.value)} className={inlineSelect}>
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </span>
            </DetailRow>
            <DetailRow label="Status">
              <span className="flex items-center gap-2">
                <span className={cn("ml-1.5 size-2 shrink-0 rounded-full", statusMeta[lead.status].dot)} aria-hidden />
                <select
                  aria-label="Status"
                  value={lead.status}
                  onChange={(e) => setStatus(e.target.value as LeadStatus)}
                  className={inlineSelect}
                >
                  {leadStatuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </span>
            </DetailRow>
            <DetailRow label="Lead score">
              <span className="flex items-center gap-2.5">
                <ScoreRing score={lead.score} size={36} />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{tier.label}</span>
                  <button
                    type="button"
                    onClick={() => setTab("overview")}
                    className="block rounded-xs text-xs text-primary outline-none hover:underline focus-visible:shadow-focus"
                  >
                    See breakdown
                  </button>
                </span>
              </span>
            </DetailRow>
            <DetailRow label="Source">{sourceLabel[lead.source]}</DetailRow>
            <DetailRow label="Created">
              <span className="font-mono text-xs tabular-nums">{formatDate(lead.createdAt)}</span>
            </DetailRow>
          </dl>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <div className="scrollbar-none overflow-x-auto px-4 sm:px-5">
            <Tabs value={tab} onValueChange={(v) => setTab(v as ProfileTab)} items={tabs} className="min-w-max" />
          </div>
          <div role="tabpanel" aria-label={tabs.find((t) => t.value === tab)?.label} className="p-4 sm:p-5">
            {tab === "overview" && (
              <OverviewTab
                lead={lead}
                openDeals={openDeals}
                openTasks={openTasks}
                timeline={timeline}
                now={now}
                onTab={setTab}
                onAddDeal={addDeal.open}
              />
            )}
            {tab === "activity" && <ActivityTab lead={lead} timeline={timeline} now={now} />}
            {tab === "notes" && <NotesTab lead={lead} notes={notes} now={now} />}
            {tab === "tasks" && <TasksTab lead={lead} tasks={tasks} now={now} />}
            {tab === "conversations" && <ConversationsTab lead={lead} threads={threads} now={now} />}
            {tab === "deals" && <DealsTab deals={deals} now={now} onAddDeal={addDeal.open} />}
          </div>
        </Card>
      </div>

      <AddDealModal
        open={addDeal.isOpen}
        onClose={addDeal.close}
        defaults={{ company: lead.company, contactId: lead.id, ownerId: lead.ownerId }}
        defaultOwnerId={ownerIdFor(actor)}
        onCreated={(deal) => {
          setTab("deals");
          toast({
            variant: "success",
            title: "Deal created",
            description: `${deal.name} added to the pipeline.`,
            action: { label: "View pipeline", onClick: () => navigate(`${routes.app.pipeline}?deal=${deal.id}`) },
          });
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          actions.deleteLeads([lead.id]);
          toast({ title: `${lead.name} deleted` });
          navigate(backHref, { replace: true });
        }}
        tone="danger"
        title={`Delete ${lead.name}?`}
        description="Their notes, tasks and activity will be removed. Deals stay in the pipeline without a contact."
        confirmLabel="Delete contact"
      />
    </>
  );
}
