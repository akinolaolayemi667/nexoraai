import { Modal } from "@/components/ui";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? "⌘" : "Ctrl";

const shortcuts = [
  { keys: [mod, "K"], label: "Search or jump to a page" },
  { keys: ["["], label: "Collapse or expand the sidebar" },
  { keys: ["?"], label: "Show keyboard shortcuts" },
  { keys: ["Esc"], label: "Close menus, panels and dialogs" },
];

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard shortcuts" size="sm">
      <ul className="-my-1 divide-y divide-border-subtle">
        {shortcuts.map((shortcut) => (
          <li key={shortcut.label} className="flex items-center justify-between gap-4 py-2.5">
            <span className="text-sm text-muted">{shortcut.label}</span>
            <span className="flex shrink-0 gap-1">
              {shortcut.keys.map((key) => (
                <kbd
                  key={key}
                  className="min-w-6 rounded-sm border border-border bg-canvas px-1.5 py-0.5 text-center font-mono text-2xs text-ink shadow-xs"
                >
                  {key}
                </kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
