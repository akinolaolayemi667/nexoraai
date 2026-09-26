import { Link, useLocation } from "react-router";
import { Construction } from "lucide-react";
import { findNavItem } from "@/data/navigation";
import { routes } from "@/lib/routes";
import { Card, EmptyState, buttonVariants } from "@/components/ui";
import { PageHeader } from "./page-header";

export function AppPagePlaceholder() {
  const { pathname } = useLocation();
  const item = findNavItem(pathname);
  const title = item?.label ?? "Page";
  const Icon = item?.icon ?? Construction;

  return (
    <>
      <title>{`${title} · NEXORA AI`}</title>
      <PageHeader title={title} description={item?.description} />
      <Card className="mt-6">
        <EmptyState
          icon={<Icon />}
          title={`${title} is under construction`}
          description="This module's route and layout are in place. The full screen ships in an upcoming phase."
          action={
            pathname !== routes.app.root && (
              <Link to={routes.app.root} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                Back to dashboard
              </Link>
            )
          }
          className="py-24"
        />
      </Card>
    </>
  );
}

export function MarketingPagePlaceholder({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-28 text-center">
      <title>{`${eyebrow} · NEXORA AI`}</title>
      <p className="text-[13px] font-medium text-primary">{eyebrow}</p>
      <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted">{description}</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to={routes.signup} className={buttonVariants({ size: "lg" })}>
          Start free trial
        </Link>
        <Link to={routes.app.root} className={buttonVariants({ variant: "secondary", size: "lg" })}>
          Open the app
        </Link>
      </div>
    </section>
  );
}

export function AuthPagePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <Card className="p-8">
      <title>{`${title} · NEXORA AI`}</title>
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-1.5 text-[13px] text-muted">{description}</p>
      <div className="mt-6 rounded-md border border-dashed border-border-strong bg-canvas px-4 py-6 text-center text-[13px] text-muted">
        Authentication form ships in an upcoming phase.
      </div>
      <Link to={routes.app.root} className={buttonVariants({ className: "mt-6 w-full" })}>
        Continue to app
      </Link>
    </Card>
  );
}
