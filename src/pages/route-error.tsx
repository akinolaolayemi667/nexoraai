import { isRouteErrorResponse, useRouteError } from "react-router";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";

export default function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "An unexpected error occurred.";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-white text-danger shadow-xs">
        <AlertTriangle className="size-5" />
      </div>
      <h1 className="mt-5 text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 max-w-md font-mono text-xs text-muted">{message}</p>
      <Button className="mt-6" onClick={() => window.location.reload()}>
        Reload page
      </Button>
    </div>
  );
}
