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
                Back to overview
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
      <p className="text-sm font-medium text-primary">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-5 max-w-xl text-lg text-muted">{description}</p>
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