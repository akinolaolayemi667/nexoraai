import { getTool } from "@/lib/data";
import { getSession } from "@/lib/session";

type ChatMessage = { role: "user" | "assistant"; content: string };

const encoder = new TextEncoder();

function demoReply(toolName: string, prompt: string) {
  return [
    `**${toolName} (demo mode)**\n\n`,
    `You asked: "${prompt.slice(0, 160)}"\n\n`,
    `Here's how I'd approach it:\n\n`,
    `1. Clarify the goal and the audience.\n`,
    `2. Draft a first version focused on the core outcome.\n`,
    `3. Refine for tone, accuracy, and clarity.\n\n`,
    `This is a simulated response. Add an \`OPENAI_API_KEY\` environment variable to get real AI output from ${toolName}.`,
  ].join("");
}

function streamDemo(text: string) {
  const words = text.split(/(\s+)/);
  return new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(word));
        await new Promise((r) => setTimeout(r, 18));
      }
      controller.close();
    },
  });
}

function streamOpenAI(body: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoder();
  let buffer = "";
  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const data = line.replace(/^data: /, "").trim();
          if (!data || data === "[DONE]") continue;
          try {
            const delta = JSON.parse(data).choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          } catch {
            // ignore partial or keep-alive lines
          }
        }
      },
    }),
  );
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { toolSlug, messages } = (await request.json()) as {
    toolSlug?: string;
    messages?: ChatMessage[];
  };
  const tool = getTool(toolSlug ?? "");
  if (!tool || !Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const history = messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));
  const lastPrompt = history.at(-1)?.content ?? "";

  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(streamDemo(demoReply(tool.name, lastPrompt)), { headers });
  }

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      stream: true,
      messages: [{ role: "system", content: tool.systemPrompt }, ...history],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    return Response.json(
      { error: "The AI provider returned an error. Please try again." },
      { status: 502 },
    );
  }

  return new Response(streamOpenAI(upstream.body), { headers });
}
