import { Link } from "react-router";
import { routes } from "@/lib/routes";
import { buttonVariants } from "@/components/ui";
import { Logo } from "@/components/layout/logo";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <title>Page not found · NEXORA AI</title>
      <Logo />
      <p className="text-metric mt-10 text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-sm text-[13px] text-muted">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-6 flex gap-2">
        <Link to={routes.home} className={buttonVariants({ variant: "secondary" })}>
          Go home
        </Link>
        <Link to={routes.app.root} className={buttonVariants()}>
          Open dashboard
        </Link>
      </div>
    </div>
  );
}
