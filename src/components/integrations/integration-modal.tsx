import { useState } from "react";
import { BellRing, Check, ExternalLink, KeyRound, RefreshCw, ShieldCheck, Unplug } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDate, formatRelative } from "@/lib/format";
import { categoryLabel, type Connection, type Integration, type IntegrationStatus } from "@/lib/integrations/catalog";
import { Alert, Badge, Button, Checkbox, Input, Modal, Spinner } from "@/components/ui";
import { IntegrationLogo } from "./integration-logo";

export function StatusBadge({ status }: { status: IntegrationStatus }) {
  if (status === "connected")
    return (
      <Badge variant="success" dot>
        Connected
      </Badge>
    );
  if (status === "coming_soon") return <Badge variant="neutral">Coming Soon</Badge>;
  return (
    <Badge variant="primary" appearance="outline">
      Available
    </Badge>
  );
}

type IntegrationModalProps = {
  integration: Integration | null;
  status: IntegrationStatus;
  connection: Connection | undefined;
  connecting: boolean;
  syncing: boolean;
  notified: boolean;
  now: number;
  onClose: () => void;
  onConnect: (apiKey?: string) => void;
  onDisconnect: () => void;
  onToggleOption: (optionId: string, value: boolean) => void;
  onSync: () => void;
  onNotify: () => void;
};

export function IntegrationModal(props: IntegrationModalProps) {
  const { integration, onClose } = props;
  return (
    <Modal
      open={integration !== null}
      onClose={onClose}
      size="lg"
      title={
        integration && (
          <span className="flex items-center gap-3">
            <IntegrationLogo id={integration.id} name={integration.name} size="md" />
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                {integration.name}
                <StatusBadge status={props.status} />
              </span>
              <span className="mt-0.5 block text-sm font-normal text-muted">
                {categoryLabel[integration.category]} · by {integration.developer}
              </span>
            </span>
          </span>
        )
      }
    >
      {integration && <Body key={integration.id} {...props} integration={integration} />}
    </Modal>
  );
}

function Body({
  integration,
  status,
  connection,
  connecting,
  syncing,
  notified,
  now,
  onClose,
  onConnect,
  onDisconnect,
  onToggleOption,
  onSync,
  onNotify,
}: IntegrationModalProps & { integration: Integration }) {
  const [apiKey, setApiKey] = useState("");
  const [keyTouched, setKeyTouched] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const keyError = integration.auth === "apikey" && apiKey.trim().length < 16 ? "Paste the full API key (at least 16 characters)." : undefined;

  const connect = () => {
    if (integration.auth === "apikey") {
      setKeyTouched(true);
      if (keyError) return;
      onConnect(apiKey.trim());
      return;
    }
    onConnect();
  };

  const details = [
    { label: "Category", value: categoryLabel[integration.category] },
    { label: "Setup", value: integration.auth === "oauth" ? "Sign in with OAuth" : "API key" },
    { label: "Used by", value: integration.teams },
    { label: "Pricing", value: "Included in every plan" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-ink">{integration.about}</p>

      {status === "coming_soon" && (
        <Alert
          tone="info"
          title={integration.eta ?? "In development"}
          description={notified ? "We'll email you as soon as it's ready to connect." : "Get an email as soon as this integration is ready to connect."}
        />
      )}

      {status === "connected" && connection && (
        <section className="rounded-lg border border-success-border bg-success-soft/40 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{connection.account}</p>
              <p className="mt-0.5 text-xs text-muted">
                Connected {formatDate(connection.connectedAt)} ·{" "}
                <span className="inline-flex items-center gap-1">
                  <span className={cn("size-1.5 rounded-full", syncing ? "animate-pulse bg-primary" : "bg-success")} aria-hidden />
                  {syncing ? "Syncing now…" : `Last synced ${formatRelative(connection.lastSync, now).toLowerCase()}`}
                </span>
              </p>
            </div>
            <Button variant="secondary" size="xs" leftIcon={<RefreshCw className={cn(syncing && "animate-spin")} />} onClick={onSync} disabled={syncing}>
              Sync now
            </Button>
          </div>
          {integration.syncs.length > 0 && (
            <div className="mt-4 space-y-3 border-t border-success-border/70 pt-4">
              <p className="type-overline text-subtle">What syncs</p>
              {integration.syncs.map((option) => (
                <Checkbox
                  key={option.id}
                  checked={connection.options[option.id] ?? option.defaultOn}
                  onChange={(e) => onToggleOption(option.id, e.target.checked)}
                  label={option.label}
                  description={option.description}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {status === "available" && integration.auth === "apikey" && (
        <section className="rounded-lg border border-border bg-canvas p-4">
          <Input
            label="API key"
            type="password"
            autoComplete="off"
            leftIcon={<KeyRound />}
            placeholder={`Paste your ${integration.name} API key`}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onBlur={() => setKeyTouched(true)}
            error={keyTouched ? keyError : undefined}
            hint={keyTouched && keyError ? undefined : `Find it in ${integration.name} under Settings → API keys. It's encrypted at rest.`}
            disabled={connecting}
          />
        </section>
      )}

      <div className="grid gap-6 sm:grid-cols-[1fr_12rem]">
        <div className="space-y-6">
          <section>
            <h3 className="type-overline text-subtle">{status === "coming_soon" ? "Planned features" : "What you can do"}</h3>
            <ul className="mt-2.5 space-y-2">
              {integration.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-ink">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <Check className="size-2.5" strokeWidth={3} aria-hidden />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="type-overline text-subtle">Permissions requested</h3>
            <ul className="mt-2.5 space-y-2">
              {integration.permissions.map((permission) => (
                <li key={permission} className="flex items-start gap-2 text-sm text-muted">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-subtle" aria-hidden />
                  {permission}
                </li>
              ))}
            </ul>
          </section>
        </div>
        <dl className="h-fit space-y-3 rounded-lg border border-border p-4 text-sm">
          {details.map((d) => (
            <div key={d.label}>
              <dt className="text-xs text-muted">{d.label}</dt>
              <dd className="mt-0.5 font-medium text-ink">{d.value}</dd>
            </div>
          ))}
          <div>
            <dt className="text-xs text-muted">Documentation</dt>
            <dd className="mt-0.5">
              <a
                href={`https://${integration.docs}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                title="Documentation is not available in demo mode"
              >
                Setup guide
                <ExternalLink className="size-3" aria-hidden />
              </a>
            </dd>
          </div>
        </dl>
      </div>

      <div className="sticky -bottom-5 -mx-6 -mb-5 flex flex-wrap items-center gap-2 border-t border-border bg-canvas px-6 py-3">
        {status === "connected" &&
          (confirmDisconnect ? (
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-ink">Disconnect {integration.name}? Syncing stops immediately.</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setConfirmDisconnect(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={onDisconnect}>
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" leftIcon={<Unplug />} className="-ml-2 text-danger-text hover:bg-danger-soft" onClick={() => setConfirmDisconnect(true)}>
                Disconnect
              </Button>
              <Button variant="secondary" size="sm" className="ml-auto" onClick={onClose}>
                Done
              </Button>
            </>
          ))}

        {status === "available" && (
          <>
            {connecting && (
              <span className="flex items-center gap-2 text-sm text-muted">
                <Spinner className="size-4" />
                {integration.auth === "oauth" ? `Waiting for ${integration.name} authorization…` : "Verifying key…"}
              </span>
            )}
            <div className="ml-auto flex gap-2">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" onClick={connect} loading={connecting} loadingText="Connecting…">
                Connect {integration.name}
              </Button>
            </div>
          </>
        )}

        {status === "coming_soon" && (
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" variant={notified ? "secondary" : "primary"} leftIcon={notified ? <Check /> : <BellRing />} onClick={onNotify}>
              {notified ? "You'll be notified" : "Notify me"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
