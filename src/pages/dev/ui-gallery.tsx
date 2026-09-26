import { useState, type ReactNode } from "react";
import {
  Archive,
  Copy,
  Download,
  Inbox,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useDisclosure } from "@/hooks/use-disclosure";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  ChartContainer,
  Drawer,
  Dropdown,
  EmptyState,
  Input,
  LoadingState,
  Modal,
  Select,
  Skeleton,
  Table,
  Tabs,
  Textarea,
  Tooltip,
  useToast,
  type Column,
} from "@/components/ui";

type SampleRow = { id: string; name: string; company: string; stage: string; value: number };

const sampleRows: SampleRow[] = [
  { id: "1", name: "Amara Okafor", company: "Brightline Logistics", stage: "Proposal", value: 48000 },
  { id: "2", name: "Daniel Reyes", company: "Northwind Health", stage: "Qualified", value: 12500 },
  { id: "3", name: "Sofia Lindqvist", company: "Helio Energy", stage: "Negotiation", value: 96000 },
  { id: "4", name: "Kenji Watanabe", company: "Stackfield", stage: "Won", value: 31000 },
];

const stageVariant = {
  Qualified: "neutral",
  Proposal: "primary",
  Negotiation: "warning",
  Won: "success",
} as const;

const columns: Column<SampleRow>[] = [
  {
    key: "name",
    header: "Contact",
    sortValue: (r) => r.name,
    cell: (r) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={r.name} size="sm" />
        <span className="font-medium">{r.name}</span>
      </div>
    ),
  },
  { key: "company", header: "Company", sortValue: (r) => r.company, cell: (r) => <span className="text-muted">{r.company}</span> },
  {
    key: "stage",
    header: "Stage",
    cell: (r) => (
      <Badge variant={stageVariant[r.stage as keyof typeof stageVariant]} dot>
        {r.stage}
      </Badge>
    ),
  },
  {
    key: "value",
    header: "Value",
    align: "right",
    sortValue: (r) => r.value,
    cell: (r) => <span className="text-metric">{formatCurrency(r.value)}</span>,
  },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border py-10">
      <h2 className="mb-5 text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function UiGalleryPage() {
  const modal = useDisclosure();
  const drawer = useDisclosure();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <title>UI Components · NEXORA AI</title>
      <h1 className="text-3xl font-bold">Design system</h1>
      <p className="mt-2 text-muted">Development-only preview of the NEXORA AI component library.</p>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button leftIcon={<Plus />}>New lead</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger" leftIcon={<Trash2 />}>Delete</Button>
          <Button variant="link">Link button</Button>
          <Button loading>Saving</Button>
          <Button size="sm" variant="secondary">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" variant="secondary" aria-label="More"><MoreHorizontal /></Button>
        </div>
      </Section>

      <Section title="Form controls">
        <div className="grid max-w-3xl gap-5 md:grid-cols-2">
          <Input label="Full name" placeholder="Jane Cooper" required />
          <Input label="Search" placeholder="Search contacts…" leftIcon={<Search />} />
          <Input label="Work email" defaultValue="jane@" error="Enter a valid email address." />
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
          <Textarea label="Notes" placeholder="Add context for your team…" containerClassName="md:col-span-2" />
        </div>
      </Section>

      <Section title="Badges & avatars">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Neutral</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="accent">AI generated</Badge>
          <Badge variant="success" dot>Active</Badge>
          <Badge variant="warning" dot>Pending</Badge>
          <Badge variant="danger" dot>Churn risk</Badge>
          <Badge size="md" variant="primary">Medium</Badge>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <Avatar name="Amara Okafor" size="xs" />
          <Avatar name="Daniel Reyes" size="sm" status="online" />
          <Avatar name="Sofia Lindqvist" size="md" status="away" />
          <Avatar name="Kenji Watanabe" size="lg" status="offline" />
          <Avatar name="Priya Shah" size="xl" />
          <AvatarGroup names={["Amara Okafor", "Daniel Reyes", "Sofia Lindqvist", "Kenji Watanabe", "Priya Shah", "Leo Grant"]} />
        </div>
      </Section>

      <Section title="Overlays">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={modal.open}>Open modal</Button>
          <Button variant="secondary" onClick={drawer.open}>Open drawer</Button>
          <Dropdown
            items={[
              { type: "label", label: "Actions" },
              { label: "Edit", icon: <Pencil />, shortcut: "E" },
              { label: "Duplicate", icon: <Copy />, shortcut: "D" },
              { label: "Archive", icon: <Archive /> },
              { type: "separator" },
              { label: "Delete", icon: <Trash2 />, danger: true },
            ]}
            trigger={({ open, ...props }) => (
              <Button variant="secondary" {...props}>
                Dropdown {open ? "▴" : "▾"}
              </Button>
            )}
          />
          <Tooltip content="Export as CSV">
            <Button variant="secondary" size="icon" aria-label="Export"><Download /></Button>
          </Tooltip>
          <Button
            variant="secondary"
            onClick={() => toast({ title: "Lead created", description: "Amara Okafor was added to your pipeline.", variant: "success" })}
          >
            Success toast
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast({ title: "Sync failed", description: "HubSpot returned an authentication error.", variant: "error", action: { label: "Retry", onClick: () => {} } })}
          >
            Error toast
          </Button>
        </div>
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
          <div className="grid gap-4">
            <Input label="Name" placeholder="Jane Cooper" />
            <Input label="Company" placeholder="Acme Inc." />
          </div>
        </Modal>
        <Drawer
          open={drawer.isOpen}
          onClose={drawer.close}
          title="Amara Okafor"
          description="Brightline Logistics · Proposal"
          footer={<Button onClick={drawer.close}>Done</Button>}
        >
          <p className="text-[13px] text-muted">Drawer content for record details.</p>
        </Drawer>
      </Section>

      <Section title="Tabs">
        <div className="grid gap-8 md:grid-cols-2">
          <Tabs
            items={[
              { value: "overview", label: "Overview", content: <p className="text-muted">Overview panel</p> },
              { value: "activity", label: "Activity", count: 12, content: <p className="text-muted">Activity panel</p> },
              { value: "notes", label: "Notes", count: 3, content: <p className="text-muted">Notes panel</p> },
            ]}
          />
          <Tabs
            variant="segmented"
            items={[
              { value: "7d", label: "7D" },
              { value: "30d", label: "30D" },
              { value: "90d", label: "90D" },
              { value: "12m", label: "12M" },
            ]}
            defaultValue="30d"
          />
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid gap-5 md:grid-cols-3">
          <Card>
            <CardHeader title="Pipeline value" description="Open deals this quarter" />
            <CardContent>
              <p className="text-metric text-2xl font-semibold">{formatCurrency(1284000)}</p>
            </CardContent>
            <CardFooter>
              <span className="text-xs text-muted">Updated 2 min ago</span>
            </CardFooter>
          </Card>
          <Card>
            <EmptyState icon={<Inbox />} title="No conversations" description="New messages will appear here." />
          </Card>
          <Card>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <LoadingState label="Syncing records…" className="py-6" />
          </Card>
        </div>
      </Section>

      <Section title="Table">
        <div className="mb-3 flex items-center gap-3">
          <Button size="sm" variant="secondary" onClick={() => setLoading((v) => !v)}>
            Toggle loading
          </Button>
          <span className="text-xs text-muted">{selected.size} selected</span>
        </div>
        <Card className="overflow-hidden">
          <Table
            columns={columns}
            rows={sampleRows}
            getRowId={(r) => r.id}
            selectable
            selectedIds={selected}
            onSelectionChange={setSelected}
            loading={loading}
          />
        </Card>
      </Section>

      <Section title="Chart container">
        <div className="grid gap-5 md:grid-cols-3">
          <ChartContainer
            title="Revenue"
            metric={formatCurrency(482300)}
            change={12.4}
            legend={[
              { label: "New business", color: "#2563EB" },
              { label: "Expansion", color: "#4F46E5" },
            ]}
            height={180}
            className="md:col-span-1"
          >
            <div className="flex h-full items-end gap-1.5">
              {[35, 48, 42, 60, 55, 72, 68, 80, 76, 90].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm bg-primary/80" style={{ height: `${h}%` }} />
              ))}
            </div>
          </ChartContainer>
          <ChartContainer title="Win rate" metric="28.6%" change={-2.1} height={180} loading />
          <ChartContainer title="Churn" metric="1.9%" height={180} isEmpty />
        </div>
      </Section>
    </div>
  );
}
