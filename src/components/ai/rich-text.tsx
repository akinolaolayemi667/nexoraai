import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/cn";

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** Renders the small markdown subset the assistant uses: paragraphs, `- ` bullets and **bold**. */
export function RichText({ text, className, cursor }: { text: string; className?: string; cursor?: boolean }) {
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className={cn("space-y-3 text-sm leading-relaxed text-ink/90", className)}>
      {paragraphs.map((para, i) => {
        const last = i === paragraphs.length - 1;
        const caret = last && cursor ? <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] animate-pulse bg-primary" aria-hidden /> : null;
        const lines = para.split("\n");
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5 marker:text-subtle">
              {lines.map((l, j) => (
                <li key={j}>
                  {inline(l.slice(2))}
                  {j === lines.length - 1 && caret}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="whitespace-pre-line">
            {inline(para)}
            {caret}
          </p>
        );
      })}
    </div>
  );
}
