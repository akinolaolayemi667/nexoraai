import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, MessageSquare, Star, Users } from "lucide-react";
import { ToolCard, ToolIcon } from "@/components/tool-card";
import { WorkspaceButton } from "@/components/workspace-button";
import { formatNumber, formatPrice, getTool, tools } from "@/lib/data";
import { getSession, getWorkspace } from "@/lib/session";

export async function generateMetadata({
  params,
}: PageProps<"/marketplace/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  return tool
    ? { title: tool.name, description: tool.tagline }
    : { title: "Tool not found" };
}

export default async function ToolPage({ params }: PageProps<"/marketplace/[slug]">) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  const [session, workspace] = await Promise.all([getSession(), getWorkspace()]);
  const related = tools
    .filter((t) => t.category === tool.category && t.slug !== tool.slug)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to marketplace
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-start gap-5">
            <ToolIcon tool={tool} size="lg" />
            <div>
              <h1 className="text-3xl font-bold text-white">{tool.name}</h1>
              <p className="mt-1 text-zinc-400">{tool.tagline}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {tool.rating} ({formatNumber(tool.reviewCount)} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> {formatNumber(tool.users)} users
                </span>
                <span className="rounded-md bg-white/5 px-2 py-0.5">{tool.category}</span>
                <span>by {tool.creator}</span>
              </div>
            </div>
          </div>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-white">About</h2>
            <p className="mt-3 leading-relaxed text-zinc-300">{tool.description}</p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-white">Features</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {tool.features.map((f) => (
                <li key={f} className="card flex items-center gap-3 p-4 text-sm text-zinc-200">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" /> {f}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-white">Try asking</h2>
            <div className="mt-4 space-y-3">
              {tool.samplePrompts.map((p) => (
                <div key={p} className="card flex items-center gap-3 p-4 text-sm text-zinc-300">
                  <MessageSquare className="h-4 w-4 shrink-0 text-violet-300" /> {p}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-white">Reviews</h2>
            <div className="mt-4 space-y-3">
              {tool.reviews.map((r) => (
                <div key={r.author} className="card p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{r.author}</span>
                    <span className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < r.rating ? "fill-amber-400 text-amber-400" : "text-zinc-600"
                          }`}
                        />
                      ))}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">{r.comment}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <div className="text-3xl font-bold text-white">{formatPrice(tool.price)}</div>
            <p className="mt-1 text-sm text-zinc-400">
              {tool.price === 0
                ? "Included with every NexoraAI plan."
                : "Billed monthly. Cancel anytime."}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {session ? (
                <>
                  <WorkspaceButton slug={tool.slug} added={workspace.includes(tool.slug)} />
                  <Link
                    href={`/dashboard/playground?tool=${tool.slug}`}
                    className="btn-secondary"
                  >
                    Open in playground
                  </Link>
                </>
              ) : (
                <>
                  <Link href={`/signup`} className="btn-primary">
                    Sign up to use {tool.name}
                  </Link>
                  <Link
                    href={`/login?next=/marketplace/${tool.slug}`}
                    className="btn-secondary"
                  >
                    I already have an account
                  </Link>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold text-white">More {tool.category} tools</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
