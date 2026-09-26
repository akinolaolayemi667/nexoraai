import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <Logo />
      <h1 className="mt-10 text-6xl font-bold text-gradient">404</h1>
      <p className="mt-4 text-zinc-400">We couldn&apos;t find the page you were looking for.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-primary">Go home</Link>
        <Link href="/marketplace" className="btn-secondary">Browse marketplace</Link>
      </div>
    </main>
  );
}
