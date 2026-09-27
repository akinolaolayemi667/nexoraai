import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Paperclip, SendHorizontal, Square, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Attachment } from "@/lib/ai/types";
import { Button, Tooltip, useToast } from "@/components/ui";
import { formatBytes } from "./chat-message";

const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;

export type ChatInputHandle = { focus: () => void; setValue: (value: string) => void };

type ChatInputProps = {
  busy: boolean;
  onSend: (text: string, attachments: Attachment[]) => void;
  onStop: () => void;
  placeholder?: string;
};

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(function ChatInput({ busy, onSend, onStop, placeholder }, ref) {
  const { toast } = useToast();
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    setValue: (next) => {
      setValue(next);
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(next.length, next.length);
      });
    },
  }));

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value]);

  const canSend = !busy && (value.trim().length > 0 || files.length > 0);

  const submit = () => {
    if (!canSend) return;
    onSend(value.trim(), files);
    setValue("");
    setFiles([]);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    const tooBig = picked.filter((f) => f.size > MAX_BYTES);
    const accepted = picked
      .filter((f) => f.size <= MAX_BYTES)
      .slice(0, Math.max(0, MAX_FILES - files.length))
      .map((f) => ({ id: `${f.name}-${f.size}-${f.lastModified}`, name: f.name, size: f.size, type: f.type }));
    if (tooBig.length) toast({ title: "File too large", description: `${tooBig[0].name} is over 10 MB.`, variant: "error" });
    else if (picked.length > accepted.length) toast({ title: `Up to ${MAX_FILES} files per message`, variant: "warning" });
    setFiles((current) => [...current, ...accepted.filter((a) => !current.some((c) => c.id === a.id))]);
    textareaRef.current?.focus();
  };

  return (
    <div>
      <div
        className={cn(
          "glass-ai rounded-2xl transition-[box-shadow] duration-200",
          "focus-within:shadow-glow-ai",
        )}
      >
        <AnimatePresence initial={false}>
          {files.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-1.5 px-3 pt-3">
                {files.map((file) => (
                  <span key={file.id} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-canvas py-1 pl-2 pr-1 text-xs text-ink">
                    <FileText className="size-3.5 text-muted" />
                    <span className="max-w-40 truncate">{file.name}</span>
                    <span className="text-subtle">{formatBytes(file.size)}</span>
                    <button
                      type="button"
                      onClick={() => setFiles((list) => list.filter((f) => f.id !== file.id))}
                      className="rounded p-0.5 text-subtle transition-colors hover:bg-sunken hover:text-ink"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <label htmlFor="ai-chat-input" className="sr-only">
          Message Nexora AI
        </label>
        <textarea
          id="ai-chat-input"
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder ?? "Ask about your leads, pipeline or customers…"}
          className="scrollbar-thin block max-h-[180px] w-full resize-none bg-transparent px-4 pb-1 pt-3 text-sm leading-relaxed text-ink outline-none placeholder:text-subtle"
        />
        <div className="flex items-center justify-between gap-2 px-2 pb-2">
          <input ref={fileRef} type="file" multiple className="hidden" onChange={onPick} tabIndex={-1} />
          <Tooltip content="Attach files">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => fileRef.current?.click()}
              disabled={files.length >= MAX_FILES}
              aria-label="Attach files"
            >
              <Paperclip />
            </Button>
          </Tooltip>
          <div className="flex items-center gap-2">
            <span className="hidden text-2xs text-subtle sm:inline">
              <kbd className="font-sans">Enter</kbd> to send · <kbd className="font-sans">Shift + Enter</kbd> for a new line
            </span>
            {busy ? (
              <Button variant="secondary" size="icon-sm" onClick={onStop} aria-label="Stop generating">
                <Square className="fill-current" />
              </Button>
            ) : (
              <Button size="icon-sm" onClick={submit} disabled={!canSend} aria-label="Send message">
                <SendHorizontal />
              </Button>
            )}
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-2xs text-subtle">
        Demo mode: replies are simulated from your workspace data. No AI model is connected.
      </p>
    </div>
  );
});
