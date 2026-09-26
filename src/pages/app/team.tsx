import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { Check, Clock, MailPlus, MoreHorizontal, PauseCircle, PlayCircle, Search, Send, ShieldCheck, Trash2, UserCog, UserPlus, Users, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { useUser } from "@/lib/auth/auth-context";
import { useNow } from "@/hooks/use-now";
import { useBilling } from "@/lib/billing/data";
import {
  lastActiveLabel,
  permissions,
  roleMeta,
  roles,
  seatsUsed,
  statusMeta,
  useTeam,
  type MemberStatus,
  type TeamMember,
  type TeamRole,
} from "@/lib/team/data";
import { Avatar, Badge, Button, ConfirmDialog, Dropdown, EmptyState, Input, Progress, Select, Tabs, useToast, type DropdownItem } from "@/components/ui";
import { InviteModal, RoleModal } from "@/components/team/member-modals";

type StatusFilter = "all" | MemberStatus;

function Stat({ label, value, icon, children }: { label: string; value: ReactNode; icon: ReactNode; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted sm:text-sm">{label}</p>
        <span className="flex size-7 items-center justify-center rounded-md bg-sunken text-muted [&_svg]:size-3.5">{icon}</span>
      </div>
      <p className="text-metric mt-2 text-2xl font-semibold text-ink">{value}</p>
      {children}
    </div>
  );
}

function RoleBadge({ role }: { role: TeamRole }) {
  const meta = roleMeta[role];
  return (
    <Badge variant={meta.variant} size="sm">
      {role === "owner" && <ShieldCheck className="size-3" aria-hidden />}
      {meta.label}
    </Badge>
  );
}

function StatusBadge({ status }: { status: MemberStatus }) {
  const meta = statusMeta[status];
  return (
    <Badge variant={meta.variant} size="sm" dot={status === "active"} appearance={status === "invited" ? "outline" : "soft"}>
      {meta.label}
    </Badge>
  );
}

export default function TeamPage() {
  const user = useUser();
  const now = useNow(60_000);
  const { toast } = useToast();
  const [state, setState] = useTeam(user);
  const members = useMemo(() => state.members.map((m) => (m.isYou ? { ...m, name: user.name, email: user.email } : m)), [state.members, user.name, user.email]);
  const setMembers = (fn: (m: TeamMember[]) => TeamMember[]) => setState((s) => ({ ...s, members: fn(s.members) }));

  const [status, setStatus] = useState<StatusFilter>("all");
  const [roleFilter, setRoleFilter] = useState<"all" | TeamRole>("all");
  const [query, setQuery] = useState("");
  const [inviting, setInviting] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState<TeamMember | null>(null);

  const [billing] = useBilling(user.id, user.email);
  const seatLimit = billing.seats;
  const used = seatsUsed(members);
  const seatsLeft = Math.max(0, seatLimit - used);
  const counts: Record<StatusFilter, number> = {
    all: members.length,
    active: members.filter((m) => m.status === "active").length,
    invited: members.filter((m) => m.status === "invited").length,
    suspended: members.filter((m) => m.status === "suspended").length,
  };
  const online = members.filter((m) => m.status === "active" && (m.isYou || now - m.lastActive < 5 * 60_000)).length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rank = (r: TeamRole) => roles.findIndex((x) => x.id === r);
    return members
      .filter((m) => (status === "all" || m.status === status) && (roleFilter === "all" || m.role === roleFilter))
      .filter((m) => !q || [m.name, m.email, m.title, m.department].some((v) => v.toLowerCase().includes(q)))
      .sort((a, b) => Number(Boolean(b.isYou)) - Number(Boolean(a.isYou)) || rank(a.role) - rank(b.role) || a.name.localeCompare(b.name));
  }, [members, status, roleFilter, query]);

  async function invite(emails: string[], role: TeamRole) {
    await new Promise((r) => setTimeout(r, 900));
    const at = Date.now();
    const added: TeamMember[] = emails.map((email, i) => {
      const local = email.split("@")[0].replace(/[._-]+/g, " ");
      const name = local.replace(/\b\w/g, (c) => c.toUpperCase());
      return { id: `mbr_${at.toString(36)}${i}`, name, email, title: "Invited", role, status: "invited", lastActive: at, joinedAt: at, department: "—" };
    });
    setMembers((m) => [...m, ...added]);
    toast({
      variant: "success",
      title: emails.length > 1 ? `${emails.length} invites sent` : "Invite sent",
      description: emails.length > 1 ? `They'll join as ${roleMeta[role].label}s.` : `${emails[0]} will join as ${roleMeta[role].label}.`,
    });
  }

  function saveRole(member: TeamMember, role: TeamRole) {
    const prev = member.role;
    setMembers((m) => m.map((x) => (x.id === member.id ? { ...x, role } : x)));
    setEditing(null);
    toast({
      variant: "success",
      title: "Role updated",
      description: `${member.name} is now ${/^[AEIOU]/.test(roleMeta[role].label) ? "an" : "a"} ${roleMeta[role].label}.`,
      action: { label: "Undo", onClick: () => setMembers((m) => m.map((x) => (x.id === member.id ? { ...x, role: prev } : x))) },
    });
  }

  function remove(member: TeamMember) {
    const index = members.findIndex((m) => m.id === member.id);
    setMembers((m) => m.filter((x) => x.id !== member.id));
    setRemoving(null);
    toast({
      variant: "success",
      title: member.status === "invited" ? "Invite revoked" : "Member removed",
      description: member.status === "invited" ? `${member.email} can no longer join.` : `${member.name} lost access. Their records stay in the workspace.`,
      action: {
        label: "Undo",
        onClick: () =>
          setMembers((m) => {
            const next = [...m];
            next.splice(index, 0, member);
            return next;
          }),
      },
    });
  }

  function setMemberStatus(member: TeamMember, next: MemberStatus) {
    if (next === "active" && seatsLeft === 0) {
      toast({ variant: "warning", title: "No seats left", description: "Add seats in Billing to reactivate this member." });
      return;
    }
    setMembers((m) => m.map((x) => (x.id === member.id ? { ...x, status: next } : x)));
    toast({ variant: "info", title: next === "suspended" ? "Member suspended" : "Member reactivated", description: next === "suspended" ? `${member.name} can't sign in. Their seat is freed.` : `${member.name} can sign in again.` });
  }

  function resend(member: TeamMember) {
    setMembers((m) => m.map((x) => (x.id === member.id ? { ...x, lastActive: Date.now() } : x)));
    toast({ variant: "success", title: "Invite resent", description: member.email });
  }

  function actionsFor(member: TeamMember): DropdownItem[] {
    const locked = member.role === "owner" || member.isYou;
    return [
      { label: "Edit role", icon: <UserCog />, disabled: locked, description: locked ? "Owners can't change their own role" : undefined, onSelect: () => setEditing(member) },
      ...(member.status === "invited" ? [{ label: "Resend invite", icon: <Send />, onSelect: () => resend(member) }] : []),
      ...(member.status === "active" && !locked ? [{ label: "Suspend access", icon: <PauseCircle />, onSelect: () => setMemberStatus(member, "suspended") }] : []),
      ...(member.status === "suspended" ? [{ label: "Reactivate", icon: <PlayCircle />, onSelect: () => setMemberStatus(member, "active") }] : []),
      { type: "separator" as const },
      { label: member.status === "invited" ? "Revoke invite" : "Remove member", icon: <Trash2 />, danger: true, disabled: locked, onSelect: () => setRemoving(member) },
    ];
  }

  const menu = (member: TeamMember) => (
    <Dropdown
      align="end"
      width="w-60"
      items={actionsFor(member)}
      trigger={({ open, ...props }) => (
        <button
          {...props}
          type="button"
          className={cn("flex size-8 items-center justify-center rounded-md text-muted outline-none hover:bg-sunken hover:text-ink focus-visible:shadow-focus", open && "bg-sunken text-ink")}
          aria-label={`Actions for ${member.name}`}
        >
          <MoreHorizontal className="size-4" />
        </button>
      )}
    />
  );

  const identity = (m: TeamMember) => (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={m.name} size="md" status={m.status === "active" && (m.isYou || now - m.lastActive < 5 * 60_000) ? "online" : undefined} />
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
          <span className="truncate">{m.name}</span>
          {m.isYou && (
            <Badge size="sm" variant="neutral">
              You
            </Badge>
          )}
        </p>
        <p className="truncate text-xs text-muted">{m.email}</p>
      </div>
    </div>
  );

  const hasFilters = status !== "all" || roleFilter !== "all" || query.trim() !== "";

  return (
    <>
      <title>Team · NEXORA AI</title>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Team</h1>
          <p className="mt-1 text-base text-muted">Manage who has access to {user.company} and what they can do.</p>
        </div>
        <Button leftIcon={<UserPlus />} onClick={() => setInviting(true)} className="w-full sm:w-auto">
          Invite member
        </Button>
      </header>

      <section aria-label="Team summary" className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Members" value={counts.active} icon={<Users />}>
          <p className="mt-1 text-xs text-muted">{counts.suspended ? `${counts.suspended} suspended` : "All active"}</p>
        </Stat>
        <Stat label="Online now" value={online} icon={<Clock />}>
          <p className="mt-1 text-xs text-muted">Active in the last 5 min</p>
        </Stat>
        <Stat label="Pending invites" value={counts.invited} icon={<MailPlus />}>
          <button type="button" onClick={() => setStatus("invited")} className="mt-1 text-xs font-medium text-primary hover:underline" disabled={!counts.invited}>
            {counts.invited ? "Review invites" : "None pending"}
          </button>
        </Stat>
        <Stat
          label="Seats used"
          value={
            <>
              {used}
              <span className="text-base font-normal text-subtle">/{seatLimit}</span>
            </>
          }
          icon={<ShieldCheck />}
        >
          <Progress value={used} max={seatLimit} tone="auto" className="mt-2" />
          <Link to={routes.app.billing} className="mt-1.5 inline-block text-xs font-medium text-primary hover:underline">
            Manage seats
          </Link>
        </Stat>
      </section>

      <section aria-labelledby="members-heading" className="mt-4 overflow-hidden rounded-lg border border-border bg-white shadow-xs">
        <h2 id="members-heading" className="sr-only">
          Team members
        </h2>
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="scrollbar-none -mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
            <Tabs
              variant="segmented"
              value={status}
              onValueChange={(v) => setStatus(v as StatusFilter)}
              items={(["all", "active", "invited", "suspended"] as StatusFilter[]).map((s) => ({ value: s, label: s === "all" ? "All" : statusMeta[s].label, count: counts[s] }))}
            />
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:flex sm:items-center">
            <Input size="sm" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search people" leftIcon={<Search />} aria-label="Search members" type="search" containerClassName="sm:w-56" />
            <Select
              size="sm"
              aria-label="Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as "all" | TeamRole)}
              options={[{ value: "all", label: "All roles" }, ...roles.map((r) => ({ value: r.id, label: r.label }))]}
              containerClassName="w-32 sm:w-36"
            />
          </div>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={<Users />}
            title="No one matches"
            description="Try a different name, role or status."
            action={
              hasFilters ? (
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<X />}
                  onClick={() => {
                    setStatus("all");
                    setRoleFilter("all");
                    setQuery("");
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
            className="py-14"
          />
        ) : (
          <>
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="border-b border-border bg-canvas text-xs font-medium text-muted">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Name
                  </th>
                  <th scope="col" className="hidden px-4 py-2.5 font-medium xl:table-cell">
                    Department
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Role
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Status
                  </th>
                  <th scope="col" className="hidden px-4 py-2.5 font-medium lg:table-cell">
                    Last active
                  </th>
                  <th scope="col" className="w-12 px-2 py-2.5">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((m) => (
                  <tr key={m.id} className={cn("transition-colors hover:bg-canvas/60", m.status === "suspended" && "text-muted")}>
                    <td className="max-w-0 px-4 py-3 lg:w-[38%]">{identity(m)}</td>
                    <td className="hidden px-4 py-3 text-muted xl:table-cell">
                      <p className="text-ink">{m.title}</p>
                      <p className="text-xs">{m.department}</p>
                    </td>
                    <td className="px-4 py-3">
                      {m.role === "owner" || m.isYou ? (
                        <RoleBadge role={m.role} />
                      ) : (
                        <button type="button" onClick={() => setEditing(m)} className="rounded-sm outline-none focus-visible:shadow-focus" aria-label={`${roleMeta[m.role].label}. Edit role for ${m.name}`}>
                          <RoleBadge role={m.role} />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={m.status} />
                      <p className="mt-1 text-2xs text-subtle lg:hidden">{lastActiveLabel(m, now)}</p>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-muted lg:table-cell">
                      <span className={cn(lastActiveLabel(m, now) === "Online now" && "font-medium text-success-text")}>{lastActiveLabel(m, now)}</span>
                    </td>
                    <td className="px-2 py-3 text-right">{menu(m)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="divide-y divide-border md:hidden">
              {visible.map((m) => (
                <li key={m.id} className="flex gap-2 px-3 py-3.5">
                  <div className="min-w-0 flex-1">
                    {identity(m)}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-11">
                      <RoleBadge role={m.role} />
                      <StatusBadge status={m.status} />
                      <span className="text-2xs text-subtle">· {lastActiveLabel(m, now)}</span>
                    </div>
                  </div>
                  <div className="-mr-1 shrink-0">{menu(m)}</div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section aria-labelledby="roles-heading" className="mt-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="roles-heading" className="type-h3">
              Roles & permissions
            </h2>
            <p className="mt-1 text-sm text-muted">What each role can do in {user.company}.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {roles.map((r) => {
            const count = members.filter((m) => m.role === r.id && m.status !== "suspended").length;
            return (
              <div key={r.id} className="rounded-lg border border-border bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <RoleBadge role={r.id} />
                  <span className="text-xs text-muted">
                    {count} {count === 1 ? "person" : "people"}
                  </span>
                </div>
                <p className="mt-2.5 text-sm text-muted">{r.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-white shadow-xs">
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <caption className="sr-only">Permissions by role</caption>
              <thead className="border-b border-border bg-canvas text-xs text-muted">
                <tr>
                  <th scope="col" className="sticky left-0 z-10 bg-canvas px-4 py-2.5 text-left font-medium">
                    Permission
                  </th>
                  {roles.map((r) => (
                    <th key={r.id} scope="col" className="w-24 px-2 py-2.5 text-center font-medium">
                      {r.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {permissions.map((p) => (
                  <tr key={p.label}>
                    <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-2.5 text-left font-normal text-ink shadow-[1px_0_0_var(--color-border)] md:shadow-none">
                      {p.label}
                    </th>
                    {roles.map((r) => (
                      <td key={r.id} className="px-2 py-2.5 text-center">
                        {p.roles.includes(r.id) ? (
                          <Check className="mx-auto size-4 text-success" aria-label="Allowed" />
                        ) : (
                          <span className="text-subtle" aria-label="Not allowed">
                            —
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <InviteModal open={inviting} onClose={() => setInviting(false)} seatsLeft={seatsLeft} existingEmails={members.map((m) => m.email)} onInvite={invite} />
      <RoleModal member={editing} onClose={() => setEditing(null)} onSave={saveRole} />
      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && remove(removing)}
        tone="danger"
        title={removing?.status === "invited" ? `Revoke invite for ${removing.email}?` : `Remove ${removing?.name}?`}
        description={
          removing?.status === "invited"
            ? "The invite link stops working immediately. You can invite them again later."
            : "They'll lose access right away and their seat is freed. Leads, deals and notes they own stay in the workspace."
        }
        confirmLabel={removing?.status === "invited" ? "Revoke invite" : "Remove member"}
      />
    </>
  );
}