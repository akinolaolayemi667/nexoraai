import { useState } from "react";
import { Check, FileText, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar, AvatarGroup } from "@/components/ui";
import { AppPanel, PanelHeader } from "./feature-layout";

type Department = "Sales" | "Marketing" | "Success" | "Ops";

const members: { name: string; role: string; department: Department; status: "online" | "away" | "offline" }[] = [
  { name: "Olayemi Akinola", role: "Head of Revenue", department: "Sales", status: "online" },
  { name: "Priya Shah", role: "Account Executive", department: "Sales", status: "online" },
  { name: "Maya Chen", role: "Growth Marketer", department: "Marketing", status: "away" },
  { name: "Leo Grant", role: "Customer Success Lead", department: "Success", status: "online" },
  { name: "Tomás Rivera", role: "Support Specialist", department: "Success", status: "offline" },
  { name: "Ada Nwosu", role: "RevOps Manager", department: "Ops", status: "online" },
];

const departments: ("All" | Department)[] = ["All", "Sales", "Marketing", "Success", "Ops"];

export function TeamPreview() {
  const [department, setDepartment] = useState<(typeof departments)[number]>("All");
  const [collaborators, setCollaborators] = useState(["Olayemi Akinola", "Maya Chen"]);

  const visible = members.filter((m) => department === "All" || m.department === department);
  const teams = new Set(members.filter((m) => collaborators.includes(m.name)).map((m) => m.department));

  function toggle(name: string) {
    setCollaborators((list) => (list.includes(name) ? list.filter((n) => n !== name) : [...list, name]));
  }

  return (
    <AppPanel label="Interactive team collaboration preview" className="flex flex-col">
      <PanelHeader title="Team" />
      <div className="m-3 flex items-center gap-3 rounded-md border border-border bg-canvas/60 p-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white text-primary ring-1 ring-border">
          <FileText className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-ink">Q4 launch plan</p>
          <p className="text-2xs text-muted" aria-live="polite">
            {collaborators.length} collaborators across {teams.size} {teams.size === 1 ? "team" : "teams"}
          </p>
        </div>
        <AvatarGroup names={collaborators} size="sm" max={3} />
      </div>
      <div className="flex gap-1 overflow-x-auto px-3 pb-2 scrollbar-thin" role="group" aria-label="Filter by department">
        {departments.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDepartment(d)}
            aria-pressed={department === d}
            className={cn(
              "h-6 shrink-0 rounded-sm px-2 text-2xs font-medium outline-none transition-colors focus-visible:shadow-focus",
              department === d ? "bg-ink text-white" : "text-muted hover:bg-sunken hover:text-ink",
            )}
          >
            {d}
          </button>
        ))}
      </div>
      <ul className="flex min-h-56 flex-col px-1.5 pb-1.5">
        {visible.map((member) => {
          const added = collaborators.includes(member.name);
          return (
            <li key={member.name} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-canvas">
              <Avatar name={member.name} size="sm" status={member.status} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-ink">{member.name}</span>
                <span className="block truncate text-2xs text-muted">
                  {member.role} · {member.department}
                </span>
              </span>
              <button
                type="button"
                onClick={() => toggle(member.name)}
                aria-pressed={added}
                aria-label={added ? `Remove ${member.name} from Q4 launch plan` : `Add ${member.name} to Q4 launch plan`}
                className={cn(
                  "inline-flex size-6 shrink-0 items-center justify-center rounded-sm outline-none transition-colors focus-visible:shadow-focus [&_svg]:size-3.5",
                  added ? "bg-primary text-white hover:bg-primary-hover" : "border border-border text-muted hover:border-border-strong hover:text-ink",
                )}
              >
                {added ? <Check aria-hidden /> : <Plus aria-hidden />}
              </button>
            </li>
          );
        })}
      </ul>
    </AppPanel>
  );
}
