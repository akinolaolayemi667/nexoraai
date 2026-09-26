import { useNavigate } from "react-router";
import { ChevronsUpDown, Plus, Settings, UserPlus } from "lucide-react";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { Dropdown, useToast } from "@/components/ui";

export type Workspace = {
  id: string;
  name: string;
  plan: string;
  members: number;
  tone: "ink" | "accent";
};

export function WorkspaceMark({ workspace, className }: { workspace: Workspace; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md font-display text-2xs font-bold text-white",
        workspace.tone === "ink" ? "bg-ink" : "bg-accent",
        className,
      )}
      aria-hidden
    >
      {workspace.name.charAt(0).toUpperCase()}
    </span>
  );
}

export function WorkspaceSwitcher({
  workspaces,
  current,
  onSwitch,
  variant = "compact",
  onNavigate,
}: {
  workspaces: Workspace[];
  current: Workspace;
  onSwitch: (id: string) => void;
  variant?: "compact" | "block";
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const block = variant === "block";

  function go(to: string) {
    navigate(to);
    onNavigate?.();
  }

  return (
    <Dropdown
      align={block ? "start" : "end"}
      width={block ? "w-full" : "w-64"}
      className={block ? "flex w-full" : "min-w-0"}
      items={[
        { type: "label", label: "Workspaces" },
        ...workspaces.map((workspace) => ({
          label: workspace.name,
          description: `${workspace.plan} · ${workspace.members} members`,
          selected: workspace.id === current.id,
          onSelect: () => {
            if (workspace.id === current.id) return;
            onSwitch(workspace.id);
            toast({ variant: "success", title: `Switched to ${workspace.name}` });
          },
        })),
        { type: "separator" },
        { label: "Workspace settings", icon: <Settings />, onSelect: () => go(routes.app.settings) },
        { label: "Invite teammates", icon: <UserPlus />, onSelect: () => go(routes.app.team) },
        {
          label: "Create workspace",
          icon: <Plus />,
          onSelect: () =>
            toast({ title: "New workspaces are coming soon", description: "You can run up to 3 workspaces on the Growth plan." }),
        },
      ]}
      trigger={({ open, ...props }) => (
        <button
          type="button"
          {...props}
          aria-label={`Workspace: ${current.name}. Switch workspace`}
          className={cn(
            "flex min-w-0 items-center gap-2 rounded-md text-left outline-none transition-colors duration-150 focus-visible:shadow-focus",
            block
              ? "w-full border border-border bg-white p-2 shadow-xs hover:border-border-strong"
              : "h-8 max-w-48 px-1.5 hover:bg-canvas active:bg-sunken",
            open && (block ? "border-border-strong" : "bg-canvas"),
          )}
        >
          <WorkspaceMark workspace={current} className={block ? "size-8 text-xs" : undefined} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink">{current.name}</span>
            {block && <span className="block truncate text-xs text-muted">{current.plan} plan</span>}
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-subtle" aria-hidden />
        </button>
      )}
    />
  );
}
