import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/format";
import { transitions } from "@/lib/motion";
import type { AiAction, AiMessage } from "@/lib/ai/types";
import { Avatar, Button } from "@/components/ui";
import { MessageBlock } from "./message-blocks";
import { RichText } from "./rich-text";

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AssistantMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white shadow-sm [&_svg]:size-3.5",
        className,
      )}
      aria-hidden
    >
      <Sparkles />
    </span>
  );
}

const enter = { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: transitions.spring };

type MessageRowProps = {
  message: AiMessage;
  userName: string;
  now: number;
  /** Characters revealed while the reply streams in; undefined once complete. */
  visible?: number;
  onAction: (message: AiMessage, action: AiAction) => void;
  busy: boolean;
};

export function MessageRow({ message, userName, now, visible, onAction, busy }: MessageRowProps) {
  const streaming = visible !== undefined;

  if (message.role === "user") {
    return (
      <motion.div {...enter} className="flex justify-end gap-3">
        <div className="flex max-w-[85%] flex-col items-end gap-1.5 sm:max-w-[75%]">
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1.5">
              {message.attachments.map((file) => (
                <span key={file.id} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2 py-1 text-xs text-ink">
                  <FileText className="size-3.5 text-muted" />
                  <span className="max-w-40 truncate">{file.name}</span>
                  <span className="text-subtle">{formatBytes(file.size)}</span>
                </span>
              ))}
            </div>
          )}
          {message.content && (
            <div className="rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm leading-relaxed text-white shadow-xs whitespace-pre-wrap">
              {message.content}
            </div>
          )}
          <span className="text-2xs text-subtle">{formatTime(message.at)}</span>
        </div>
        <Avatar name={userName} size="sm" className="hidden rounded-full sm:flex" />
      </motion.div>
    );
  }

  const content = streaming ? message.content.slice(0, visible) : message.content;
  const done = new Set(message.completedActions);

  return (
    <motion.div {...enter} className="flex gap-3">
      <AssistantMark className="mt-0.5" />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-ink">Nexora AI</span>
          <span className="text-2xs text-subtle">{formatTime(message.at)}</span>
        </div>
        {content && <RichText text={content} cursor={streaming} />}
        {message.stopped && <p className="text-xs italic text-subtle">Response stopped</p>}
        {!streaming && message.blocks?.map((block, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ ...transitions.spring, delay: i * 0.05 }}>
            <MessageBlock block={block} now={now} />
          </motion.div>
        ))}
        {!streaming && message.actions && message.actions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08 }}
            className="flex flex-wrap gap-2 pt-0.5"
          >
            {message.actions.map((action) => {
              const completed = done.has(action.id);
              return (
                <Button
                  key={action.id}
                  size="sm"
                  variant={completed ? "secondary" : action.primary ? "primary" : "secondary"}
                  disabled={completed || (busy && action.kind !== "navigate")}
                  leftIcon={completed ? <Check className="text-success" /> : undefined}
                  onClick={() => onAction(message, action)}
                >
                  {completed && action.kind === "followups" ? "Follow-ups created" : action.label}
                </Button>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

const thinkingSteps = ["Reading your workspace", "Checking leads and deals", "Preparing an answer"];

export function TypingIndicator() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setStep((s) => Math.min(s + 1, thinkingSteps.length - 1)), 550);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <motion.div {...enter} className="flex gap-3" role="status" aria-live="polite">
      <AssistantMark className="mt-0.5" />
      <div className="space-y-1.5">
        <span className="text-sm font-semibold text-ink">Nexora AI</span>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded-2xl rounded-tl-md bg-sunken px-3 py-2.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="size-1.5 rounded-full bg-muted"
                animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
              />
            ))}
          </span>
          <span className="text-xs text-muted">{thinkingSteps[step]}…</span>
        </div>
      </div>
    </motion.div>
  );
}
