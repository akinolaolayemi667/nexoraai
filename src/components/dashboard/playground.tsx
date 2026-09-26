"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, RotateCcw, Send } from "lucide-react";

type PlaygroundTool = {
  slug: string;
  name: string;
  tagline: string;
  samplePrompts: string[];
  gradient: string;
  initials: string;
};

type Message = { role: "user" | "assistant"; content: string };

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-cyan-200">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export function Playground({
  tools,
  initialSlug,
}: {
  tools: PlaygroundTool[];
  initialSlug?: string;
}) {
  const [slug, setSlug] = useState(initialSlug ?? tools[0]?.slug);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tool = tools.find((t) => t.slug === slug);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send(prompt: string) {
    const content = prompt.trim();
    if (!content || loading || !tool) return;
    const history: Message[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolSlug: tool.slug, messages: history }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: reply }]);
      }
    } catch (e) {
      setMessages(history);
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function switchTool(next: string) {
    setSlug(next);
    setMessages([]);
    setError(null);
  }

  if (!tool) {
    return <div className="card p-12 text-center text-zinc-400">Add a tool to your workspace to get started.</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-4">
      <div className="card h-fit p-3 xl:col-span-1">
        <p className="px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Tools
        </p>
        <div className="flex gap-1 overflow-x-auto xl:flex-col">
          {tools.map((t) => (
            <button
              key={t.slug}
              onClick={() => switchTool(t.slug)}
              className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-sm transition ${
                t.slug === slug ? "bg-violet-500/15 text-white" : "text-zinc-400 hover:bg-white/5"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-[10px] font-bold text-white ${t.gradient}`}
              >
                {t.initials}
              </span>
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="card flex h-[calc(100vh-15rem)] min-h-[480px] flex-col xl:col-span-3">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div>
            <div className="font-semibold text-white">{tool.name}</div>
            <div className="text-xs text-zinc-500">{tool.tagline}</div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" /> New chat
            </button>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br font-bold text-white ${tool.gradient}`}
              >
                {tool.initials}
              </span>
              <p className="mt-4 text-zinc-300">How can {tool.name} help you today?</p>
              <div className="mt-6 grid w-full max-w-xl gap-2">
                {tool.samplePrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-zinc-300 transition hover:border-violet-400/40 hover:bg-white/10"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white"
                    : "bg-white/5 text-zinc-300"
                }`}
              >
                {m.content ? (
                  renderInline(m.content)
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                )}
              </div>
            </div>
          ))}
          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-3 border-t border-white/5 p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${tool.name}…`}
            className="input"
            aria-label="Message"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary px-4"
            aria-label="Send message"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
