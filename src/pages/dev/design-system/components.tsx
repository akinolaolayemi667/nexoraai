import { useState } from "react";
import {
  Archive,
  ArrowRight,
  AtSign,
  Copy,
  Download,
  Filter,
  Inbox,
  Kanban,
  LayoutDashboard,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useDisclosure } from "@/hooks/use-disclosure";
import {
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Checkbox,
  ConfirmDialog,
  Drawer,
  Dropdown,
  EmptyState,
  Input,
  LoadingState,
  MetricCard,
  Modal,
  Pagination,
  Progress,
  Select,
  SidebarItem,
  SidebarPanel,
  SidebarSection,
  Skeleton,
  Sparkline,
  Spinner,
  Table,
  Tabs,
  Textarea,
  Tooltip,
  useToast,
  type Column,
} from "@/components/ui";
import { DocBlock, DocSection, Specimen, StateCell } from "./doc";

type Deal = { id: string; name: string; company: string; stage: string; value: number; owner: string };

const deals: Deal[] = [
  { id: "1", name: "Amara Okafor", company: "Brightline Logistics", stage: "Proposal", value: 48000, owner: "Olayemi Akinola" },
  { id: "2", name: "Daniel Reyes", company: "Northwind Health", stage: "Qualified", value: 12500, owner: "Priya Shah" },
  { id: "3", name: "Sofia Lindqvist", company: "Helio Energy", stage: "Negotiation", value: 96000, owner: "Leo Grant" },
  { id: "4", name: "Kenji Watanabe", company: "Stackfield", stage: "Won", value: 31000, owner: "Olayemi Akinola" },
  { id: "5", name: "Chloé Martin", company: "Aurora Retail", stage: "Lost", value: 22000, owner: "Priya Shah" },
];

const stageTone = {
  Qualified: "neutral",
  Proposal: "primary",
  Negotiation: "warning",
  Won: "success",
  Lost: "danger",
} as const;

const dealColumns: Column<Deal>[] = [
  {
    key: "name",
    header: "Contact",
    sortValue: (r) => r.name,
    cell: (r) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={r.name} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-medium">{r.name}</p>
          <p className="truncate text-xs text-muted">{r.company}</p>
        </div>
      </div>
    ),
  },
  {
    key: "stage",
    header: "Stage",
    sortValue: (r) => r.stage,
    cell: (r) => (
      <Badge variant={stageTone[r.stage as keyof typeof stageTone]} dot>
        {r.stage}
      </Badge>
    ),
  },
  { key: "owner", header: "Owner", cell: (r) => <span className="text-muted">{r.owner}</span> },
  {
    key: "value",
    header: "Value",
    align: "right",
    sortValue: (r) => r.value,
    cell: (r) => <span className="text-metric">{formatCurrency(r.value)}</span>,
  },
];

function ButtonsBlock() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function save() {
    setSaving(true);
    setSaved(false);
    window.setTimeout(() => {
      setSaving(false);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    }, 1200);
  }

  return (
    <DocBlock
      id="buttons"
      title="Buttons"
      description="Six variants, four sizes and matching icon sizes. Hover darkens, press nudges 1px and darkens further, focus adds a 3px ring."
    >
      <div className="flex flex-col gap-5">
        <Specimen label="Variants">
          <div className="flex flex-wrap items-center gap-3">
            <Button leftIcon={<Plus />}>New lead</Button>
            <Button variant="secondary" leftIcon={<Filter />}>Filter</Button>
            <Button variant="ghost">Cancel</Button>
            <Button variant="danger" leftIcon={<Trash2 />}>Delete</Button>
            <Button variant="success">Mark as won</Button>
            <Button variant="link" rightIcon={<ArrowRight />}>View report</Button>
          </div>
        </Specimen>
        <Specimen label="States">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-8">
            <StateCell label="Default"><Button>Save</Button></StateCell>
            <StateCell label="Hover" hint="Point at it"><Button>Save</Button></StateCell>
            <StateCell label="Active" hint="Press it"><Button>Save</Button></StateCell>
            <StateCell label="Focus" hint="Tab to it"><Button>Save</Button></StateCell>
            <StateCell label="Disabled"><Button disabled>Save</Button></StateCell>
            <StateCell label="Loading"><Button loading loadingText="Saving">Save</Button></StateCell>
            <StateCell label="Error"><Button variant="danger">Retry</Button></StateCell>
            <StateCell label="Success"><Button success successText="Saved">Save</Button></StateCell>
          </div>
          <div className="mt-6 flex items-center gap-3 border-t border-border-subtle pt-5">
            <Button onClick={save} loading={saving} loadingText="Saving" success={saved} successText="Saved">
              Save changes
            </Button>
            <p className="type-caption">Click to run the full default → loading → success cycle.</p>
          </div>
        </Specimen>
        <Specimen label="Sizes">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xs">Extra small</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <span className="mx-2 h-6 w-px bg-border" />
            <Button size="icon-xs" variant="secondary" aria-label="More"><MoreHorizontal /></Button>
            <Button size="icon-sm" variant="secondary" aria-label="More"><MoreHorizontal /></Button>
            <Button size="icon" variant="secondary" aria-label="More"><MoreHorizontal /></Button>
            <Button size="icon-lg" variant="secondary" aria-label="More"><MoreHorizontal /></Button>
          </div>
        </Specimen>
      </div>
    </DocBlock>
  );
}

function InputsBlock() {
  const [agree, setAgree] = useState(true);
  return (
    <DocBlock
      id="inputs"
      title="Inputs"
      description="Text fields, selects and textareas share one field shell: label, control, and a hint, error or success message linked with aria-describedby."
    >
      <div className="flex flex-col gap-5">
        <Specimen label="States">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <Input label="Default" placeholder="Jane Cooper" hint="As it appears on invoices." />
            <Input label="Focus" placeholder="Click or tab here" hint="Blue border + soft ring." />
            <Input label="Disabled" defaultValue="Nexora HQ" disabled />
            <Input label="Loading" defaultValue="nexora-hq" loading hint="Checking availability…" />
            <Input label="Error" type="email" defaultValue="jane@" error="Enter a valid email address." />
            <Input label="Success" defaultValue="nexora-hq" success="Workspace URL is available." />
            <Input label="Required" placeholder="Company name" required />
            <Input label="Optional" placeholder="+1 (555) 000-0000" optional />
          </div>
        </Specimen>
        <Specimen label="Composition">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Input label="Search" placeholder="Search contacts…" leftIcon={<Search />} />
            <Input label="Email" placeholder="you@company.com" leftIcon={<AtSign />} rightSlot={<Mail className="size-4 text-subtle" />} />
            <Select
              label="Lifecycle stage"
              placeholder="Choose a stage"
              defaultValue=""
              options={[
                { value: "lead", label: "Lead" },
                { value: "mql", label: "Marketing qualified" },
                { value: "customer", label: "Customer" },
              ]}
              hint="Used for reporting and automations."
            />
            <Select label="Select · error" defaultValue="" placeholder="Choose owner" options={[{ value: "o", label: "Olayemi" }]} error="An owner is required." />
            <Select label="Select · disabled" defaultValue="usd" options={[{ value: "usd", label: "USD — US Dollar" }]} disabled />
            <Input label="Sizes" size="sm" placeholder="Small (32px)" />
            <Textarea label="Notes" placeholder="Add context for your team…" hint="Markdown supported." containerClassName="md:col-span-2" />
            <Textarea label="Textarea · error" defaultValue="Hi" error="Write at least 20 characters." />
          </div>
        </Specimen>
        <Specimen label="Selection controls">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Checkbox label="Email notifications" description="Daily digest of pipeline changes." checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <Checkbox label="Indeterminate" description="Some rows selected." indeterminate readOnly />
            <Checkbox label="Unchecked" description="Opt in to beta features." />
            <Checkbox label="Disabled" description="Managed by your admin." disabled checked readOnly />
          </div>
        </Specimen>
      </div>
    </DocBlock>
  );
}

function BadgesBlock() {
  const [tags, setTags] = useState(["Enterprise", "EMEA", "Inbound"]);
  const tones = ["neutral", "primary", "accent", "success", "warning", "danger"] as const;
  return (
    <DocBlock id="badges" title="Badges & avatars" description="Six tones × three appearances. Badges use a 4px radius so they read as labels, not buttons.">
      <Specimen>
        <div className="flex flex-col gap-4">
          {(["soft", "outline", "solid"] as const).map((appearance) => (
            <div key={appearance} className="flex flex-wrap items-center gap-2">
              <span className="type-overline w-16">{appearance}</span>
              {tones.map((tone) => (
                <Badge key={tone} variant={tone} appearance={appearance} dot={appearance !== "solid"}>
                  {tone[0].toUpperCase() + tone.slice(1)}
                </Badge>
              ))}
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-2">
            <span className="type-overline w-16">Extras</span>
            <Badge variant="accent" icon={<Sparkles />}>AI generated</Badge>
            <Badge size="md" variant="primary">Medium size</Badge>
            {tags.map((tag) => (
              <Badge key={tag} appearance="outline" onRemove={() => setTags((t) => t.filter((x) => x !== tag))}>
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 border-t border-border-subtle pt-4">
            <span className="type-overline w-16">Avatars</span>
            <Avatar name="Amara Okafor" size="xs" />
            <Avatar name="Daniel Reyes" size="sm" status="online" />
            <Avatar name="Sofia Lindqvist" size="md" status="away" />
            <Avatar name="Kenji Watanabe" size="lg" status="offline" />
            <Avatar name="Priya Shah" size="xl" />
            <AvatarGroup names={["Amara Okafor", "Daniel Reyes", "Sofia Lindqvist", "Kenji Watanabe", "Priya Shah", "Leo Grant"]} />
          </div>
        </div>
      </Specimen>
    </DocBlock>
  );
}

function CardsBlock() {
  const [plan, setPlan] = useState("growth");
  return (
    <DocBlock id="cards" title="Cards" description="Cards are flat by default: a 1px border and a whisper of shadow. Interactive cards lift on hover and show a ring when selected.">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Revenue"
            value={formatCurrency(482300)}
            change={12.4}
            icon={<LayoutDashboard />}
            chart={<Sparkline data={[18, 22, 20, 26, 24, 30, 29, 34, 38, 36, 42, 48]} className="h-9 w-full" />}
          />
          <MetricCard
            label="Open deals"
            value="128"
            change={-3.2}
            icon={<Kanban />}
            chart={<Sparkline data={[40, 38, 41, 37, 35, 36, 33, 34, 31, 30]} color="var(--color-chart-2)" className="h-9 w-full" />}
          />
          <MetricCard label="Churn rate" value="1.9%" change={-0.4} invertTrend icon={<Users />} changeLabel="lower is better" />
          <MetricCard label="Loading" value="—" loading />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Card>
            <CardHeader title="Pipeline value" description="Open deals this quarter" action={<Button size="icon-sm" variant="ghost" aria-label="More"><MoreHorizontal /></Button>} />
            <CardContent>
              <p className="type-metric">{formatCurrency(1284000)}</p>
              <Progress className="mt-4" value={68} label="Quarterly target" showValue />
            </CardContent>
            <CardFooter>
              <span className="type-caption">Updated 2 min ago</span>
            </CardFooter>
          </Card>
          <Card>
            <EmptyState icon={<Inbox />} title="No conversations" description="New messages will appear here." size="sm" action={<Button size="sm" variant="secondary">Connect inbox</Button>} />
          </Card>
          <Card padding="md" className="space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <LoadingState label="Syncing records…" className="py-4" />
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3" role="radiogroup" aria-label="Plan">
          {[
            { id: "starter", name: "Starter", price: "$29", note: "For small teams" },
            { id: "growth", name: "Growth", price: "$79", note: "Most popular" },
            { id: "scale", name: "Scale", price: "$199", note: "Contact sales", disabled: true },
          ].map((p) => (
            <Card
              key={p.id}
              interactive
              padding="md"
              selected={plan === p.id}
              disabled={p.disabled}
              onClick={() => setPlan(p.id)}
            >
              <div className="flex items-center justify-between">
                <p className="type-h4">{p.name}</p>
                {plan === p.id && <Badge variant="primary">Selected</Badge>}
                {p.disabled && <Badge>Unavailable</Badge>}
              </div>
              <p className="mt-2 type-metric">{p.price}<span className="text-sm font-normal text-muted">/mo</span></p>
              <p className="type-caption mt-1">{p.note}</p>
            </Card>
          ))}
        </div>
      </div>
    </DocBlock>
  );
}

function FeedbackBlock() {
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(false);
  return (
    <DocBlock id="feedback" title="Feedback" description="Alerts for inline context, toasts for transient results, progress for long-running work.">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Alert tone="info" title="AI summaries are in beta" description="Summaries are generated from the last 90 days of activity." />
          <Alert tone="success" title="HubSpot connected" description="4,218 contacts imported successfully." />
          <Alert tone="warning" title="You're at 92% of your seat limit" action={<Button size="xs" variant="secondary">Upgrade</Button>} />
          {!dismissed && (
            <Alert tone="error" title="Stripe sync failed" description="The API key was revoked. Reconnect to resume billing sync." onDismiss={() => setDismissed(true)} />
          )}
        </div>
        <Specimen className="flex flex-col gap-5">
          <Progress value={32} label="Import contacts" showValue />
          <Progress value={74} tone="accent" label="AI enrichment" showValue />
          <Progress value={100} tone="success" label="Data sync" showValue />
          <Progress value={92} tone="auto" label="Seat usage (auto tone)" showValue />
          <div className="flex items-center gap-3 border-t border-border-subtle pt-5">
            <Spinner />
            <Button size="sm" variant="secondary" onClick={() => toast({ title: "Lead created", description: "Amara Okafor was added to your pipeline.", variant: "success" })}>Success toast</Button>
            <Button size="sm" variant="secondary" onClick={() => toast({ title: "Sync failed", description: "HubSpot returned an authentication error.", variant: "error", action: { label: "Retry", onClick: () => {} } })}>Error toast</Button>
            <Button size="sm" variant="ghost" onClick={() => toast({ title: "Export started", description: "We'll email you when it's ready." })}>Info toast</Button>
          </div>
        </Specimen>
      </div>
    </DocBlock>
  );
}

function TablesBlock() {
  const [selected, setSelected] = useState<Set<string>>(new Set(["2"]));
  const [state, setState] = useState<"data" | "loading" | "empty" | "error">("data");
  const [active, setActive] = useState<string | undefined>("3");
  const [page, setPage] = useState(3);
  return (
    <DocBlock
      id="tables"
      title="Tables"
      description="Sortable headers, row selection, keyboard-focusable rows (Tab + Enter), and dedicated loading, empty and error states."
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          variant="segmented"
          value={state}
          onValueChange={(v) => setState(v as typeof state)}
          items={[
            { value: "data", label: "Data" },
            { value: "loading", label: "Loading" },
            { value: "empty", label: "Empty" },
            { value: "error", label: "Error" },
          ]}
        />
        <span className="type-caption">{selected.size} selected · click a row to make it active</span>
      </div>
      <Card className="overflow-hidden">
        <Table
          columns={dealColumns}
          rows={state === "empty" ? [] : deals}
          getRowId={(r) => r.id}
          selectable
          selectedIds={selected}
          onSelectionChange={setSelected}
          onRowClick={(r) => setActive(r.id)}
          activeRowId={active}
          isRowDisabled={(r) => r.stage === "Lost"}
          loading={state === "loading"}
          error={state === "error" ? "The CRM service timed out. Your data is safe." : undefined}
          onRetry={() => setState("data")}
          empty={
            <EmptyState
              icon={<Target />}
              title="No deals match your filters"
              description="Try clearing filters or create a new deal."
              action={<Button size="sm" leftIcon={<Plus />}>New deal</Button>}
              size="sm"
            />
          }
        />
        <div className="border-t border-border px-4 py-3">
          <Pagination page={page} pageCount={12} onPageChange={setPage} pageSize={25} total={287} />
        </div>
      </Card>
    </DocBlock>
  );
}

function OverlaysBlock() {
  const modal = useDisclosure();
  const drawer = useDisclosure();
  const confirm = useDisclosure();
  const [deleting, setDeleting] = useState(false);
  const [view, setView] = useState("board");
  return (
    <DocBlock id="overlays" title="Modals, drawers & dropdowns" description="All overlays trap focus, close on Escape, lock page scroll and return focus to the trigger.">
      <Specimen>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={modal.open}>Open modal</Button>
          <Button variant="secondary" onClick={drawer.open}>Open drawer</Button>
          <Button variant="danger" leftIcon={<Trash2 />} onClick={confirm.open}>Delete deal</Button>
          <Dropdown
            items={[
              { type: "label", label: "Actions" },
              { label: "Edit", icon: <Pencil />, shortcut: "E" },
              { label: "Duplicate", icon: <Copy />, shortcut: "D" },
              { label: "Archive", icon: <Archive />, description: "Hide from active views" },
              { label: "Export", icon: <Download />, disabled: true },
              { type: "separator" },
              { label: "Delete", icon: <Trash2 />, danger: true },
            ]}
            trigger={({ open, ...props }) => (
              <Button variant="secondary" data-state={open ? "open" : "closed"} rightIcon={<MoreHorizontal />} {...props}>
                Actions
              </Button>
            )}
          />
          <Dropdown
            selectable
            items={[
              { type: "label", label: "View" },
              ...["board", "list", "calendar"].map((v) => ({
                label: v[0].toUpperCase() + v.slice(1),
                selected: view === v,
                onSelect: () => setView(v),
              })),
            ]}
            trigger={({ open, ...props }) => (
              <Button variant="secondary" data-state={open ? "open" : "closed"} {...props}>
                View: {view}
              </Button>
            )}
          />
          <Tooltip content="Export as CSV" shortcut="⇧E">
            <Button variant="secondary" size="icon" aria-label="Export"><Download /></Button>
          </Tooltip>
          <Tooltip content="Settings" side="right">
            <Button variant="ghost" size="icon" aria-label="Settings"><Settings /></Button>
          </Tooltip>
        </div>
      </Specimen>
      <Modal
        open={modal.isOpen}
        onClose={modal.close}
        title="Create lead"
        description="Add a new lead to your workspace."
        footer={
          <>
            <Button variant="secondary" onClick={modal.close}>Cancel</Button>
            <Button onClick={modal.close}>Create lead</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          <Input label="Name" placeholder="Jane Cooper" required />
          <Input label="Company" placeholder="Acme Inc." optional />
          <Select label="Source" defaultValue="web" options={[{ value: "web", label: "Website" }, { value: "ref", label: "Referral" }]} />
        </div>
      </Modal>
      <Drawer
        open={drawer.isOpen}
        onClose={drawer.close}
        title="Amara Okafor"
        description="Brightline Logistics · Proposal"
        footer={<Button onClick={drawer.close}>Done</Button>}
      >
        <div className="flex flex-col gap-4">
          <Progress value={60} label="Deal probability" showValue />
          <Textarea label="Notes" placeholder="Add a note…" />
        </div>
      </Drawer>
      <ConfirmDialog
        open={confirm.isOpen}
        onClose={confirm.close}
        tone="danger"
        title="Delete this deal?"
        description="Brightline Logistics · $48,000 will be permanently removed along with its activity history."
        confirmLabel="Delete deal"
        loading={deleting}
        onConfirm={() => {
          setDeleting(true);
          window.setTimeout(() => {
            setDeleting(false);
            confirm.close();
          }, 1000);
        }}
      />
    </DocBlock>
  );
}

function NavigationBlock() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <DocBlock
      id="navigation"
      title="Navigation & sidebar"
      description="Sidebar items show default, hover, active (white chip + blue icon), focus and disabled states. Collapsed items reveal labels in tooltips. Press [ in the app to toggle."
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[auto_1fr]">
        <div className="flex h-[26rem] overflow-hidden rounded-lg border border-border">
          <SidebarPanel collapsed={collapsed} className={collapsed ? "items-center px-2 py-3" : "px-3 py-3"}>
            <div className="scrollbar-thin flex flex-1 flex-col gap-5 overflow-y-auto">
              <SidebarSection collapsed={collapsed}>
                <SidebarItem to="/ui" end label="Dashboard" icon={LayoutDashboard} collapsed={collapsed} />
                <SidebarItem to="/app/ai" label="AI Assistant" icon={Sparkles} collapsed={collapsed} />
              </SidebarSection>
              <SidebarSection label="CRM" collapsed={collapsed}>
                <SidebarItem to="/app/leads" label="Leads" icon={Target} badge={12} collapsed={collapsed} />
                <SidebarItem to="/app/contacts" label="Contacts" icon={Users} collapsed={collapsed} />
                <SidebarItem to="/app/pipeline" label="Pipeline" icon={Kanban} collapsed={collapsed} />
                <SidebarItem to="/app/conversations" label="Inbox (disabled)" icon={Mail} disabled collapsed={collapsed} />
              </SidebarSection>
            </div>
            <div className="border-t border-border pt-3">
              <Button size={collapsed ? "icon-sm" : "sm"} variant="ghost" className={collapsed ? "" : "w-full justify-start"} onClick={() => setCollapsed((v) => !v)} aria-label={collapsed ? "Expand" : "Collapse"}>
                {collapsed ? "»" : "« Collapse"}
              </Button>
            </div>
          </SidebarPanel>
          <div className="hidden w-64 bg-white p-5 sm:block">
            <p className="type-caption">Page content</p>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <Specimen label="Breadcrumbs">
            <Breadcrumbs items={[{ label: "Nexora HQ", to: "/ui" }, { label: "CRM", to: "/ui" }, { label: "Brightline Logistics" }]} />
          </Specimen>
          <Specimen label="Tabs">
            <div className="flex flex-col gap-6">
              <Tabs
                items={[
                  { value: "overview", label: "Overview", content: <p className="type-body-sm">Overview panel</p> },
                  { value: "activity", label: "Activity", count: 12, content: <p className="type-body-sm">Activity panel</p> },
                  { value: "notes", label: "Notes", count: 3, content: <p className="type-body-sm">Notes panel</p> },
                  { value: "files", label: "Files", disabled: true },
                ]}
              />
              <Tabs
                variant="segmented"
                defaultValue="30d"
                items={[
                  { value: "7d", label: "7D" },
                  { value: "30d", label: "30D" },
                  { value: "90d", label: "90D" },
                  { value: "12m", label: "12M" },
                ]}
              />
            </div>
          </Specimen>
          <Specimen label="Pagination">
            <Pagination page={1} pageCount={5} onPageChange={() => {}} />
          </Specimen>
        </div>
      </div>
    </DocBlock>
  );
}

export function ComponentsSection() {
  return (
    <DocSection
      id="components"
      eyebrow="Components"
      title="Component library"
      description="Every interactive component implements the same eight states: default, hover, active, focus, disabled, loading, error and success."
    >
      <ButtonsBlock />
      <InputsBlock />
      <BadgesBlock />
      <CardsBlock />
      <FeedbackBlock />
      <TablesBlock />
      <OverlaysBlock />
      <NavigationBlock />
    </DocSection>
  );
}
