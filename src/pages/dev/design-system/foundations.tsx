import { DocBlock, DocSection, Specimen, Token } from "./doc";

type Swatch = { name: string; token: string; hex: string; usage?: string };

const colorGroups: { title: string; description: string; swatches: Swatch[] }[] = [
  {
    title: "Neutrals",
    description: "Surfaces, text and structure. Most of the interface lives here.",
    swatches: [
      { name: "White", token: "white", hex: "#FFFFFF", usage: "Primary surface" },
      { name: "Canvas", token: "canvas", hex: "#F8FAFC", usage: "App background, sidebar" },
      { name: "Sunken", token: "sunken", hex: "#F1F5F9", usage: "Wells, pressed states" },
      { name: "Border subtle", token: "border-subtle", hex: "#F1F5F9", usage: "Row dividers" },
      { name: "Border", token: "border", hex: "#E2E8F0", usage: "Default borders" },
      { name: "Border strong", token: "border-strong", hex: "#CBD5E1", usage: "Hover borders" },
      { name: "Subtle", token: "subtle", hex: "#94A3B8", usage: "Placeholder, icons" },
      { name: "Slate", token: "muted", hex: "#475569", usage: "Secondary text" },
      { name: "Graphite", token: "ink", hex: "#111827", usage: "Primary text" },
    ],
  },
  {
    title: "Brand",
    description: "Electric Blue drives primary actions and focus. Indigo is reserved for AI features.",
    swatches: [
      { name: "Soft Blue", token: "primary-soft", hex: "#DBEAFE" },
      { name: "Blue border", token: "primary-border", hex: "#BFDBFE" },
      { name: "Electric Blue", token: "primary", hex: "#2563EB", usage: "Primary actions" },
      { name: "Blue hover", token: "primary-hover", hex: "#1D4ED8" },
      { name: "Blue active", token: "primary-active", hex: "#1E40AF" },
      { name: "Soft Lavender", token: "accent-soft", hex: "#EEF2FF" },
      { name: "Indigo border", token: "accent-border", hex: "#C7D2FE" },
      { name: "Indigo", token: "accent", hex: "#4F46E5", usage: "AI features" },
      { name: "Indigo hover", token: "accent-hover", hex: "#4338CA" },
    ],
  },
  {
    title: "Status",
    description: "Each status ships a soft background, border, base, hover and an accessible text shade.",
    swatches: [
      { name: "Success soft", token: "success-soft", hex: "#F0FDF4" },
      { name: "Success", token: "success", hex: "#16A34A" },
      { name: "Success text", token: "success-text", hex: "#15803D", usage: "AA text on soft" },
      { name: "Warning soft", token: "warning-soft", hex: "#FFFBEB" },
      { name: "Warning", token: "warning", hex: "#F59E0B" },
      { name: "Warning text", token: "warning-text", hex: "#B45309" },
      { name: "Error soft", token: "danger-soft", hex: "#FEF2F2" },
      { name: "Error", token: "danger", hex: "#DC2626" },
      { name: "Error text", token: "danger-text", hex: "#B91C1C" },
    ],
  },
  {
    title: "Data visualisation",
    description: "An ordered categorical palette. Series pick colors in this order.",
    swatches: [
      { name: "Chart 1", token: "chart-1", hex: "#2563EB" },
      { name: "Chart 2", token: "chart-2", hex: "#4F46E5" },
      { name: "Chart 3", token: "chart-3", hex: "#0EA5E9" },
      { name: "Chart 4", token: "chart-4", hex: "#14B8A6" },
      { name: "Chart 5", token: "chart-5", hex: "#F59E0B" },
      { name: "Chart 6", token: "chart-6", hex: "#94A3B8" },
    ],
  },
];

const typeRoles = [
  { className: "type-display", label: "Display", spec: "Plus Jakarta · 48/56 · Bold", sample: "Run your business on AI" },
  { className: "type-h1", label: "Heading 1", spec: "Plus Jakarta · 30/38 · Semibold", sample: "Revenue overview" },
  { className: "type-h2", label: "Heading 2", spec: "Plus Jakarta · 24/32 · Semibold", sample: "Pipeline health" },
  { className: "type-h3", label: "Heading 3", spec: "Plus Jakarta · 17/26 · Semibold", sample: "Recent conversations" },
  { className: "type-h4", label: "Heading 4", spec: "Plus Jakarta · 15/24 · Semibold", sample: "Deal details" },
  { className: "type-body", label: "Body", spec: "Inter · 14/22 · Regular", sample: "NEXORA summarises every customer touchpoint so your team can act faster." },
  { className: "type-body-sm", label: "Body small", spec: "Inter · 13/20 · Regular", sample: "Last synced 2 minutes ago from HubSpot." },
  { className: "type-caption", label: "Caption", spec: "Inter · 12/16 · Regular", sample: "Updated by Olayemi · Sep 24" },
  { className: "type-overline", label: "Overline", spec: "Inter · 11/16 · Medium · Uppercase", sample: "Operations" },
  { className: "type-metric", label: "Metric", spec: "IBM Plex Mono · 24/32 · Semibold", sample: "$1,284,000" },
];

const typeScale = [
  ["text-2xs", "11px", "16px"],
  ["text-xs", "12px", "16px"],
  ["text-sm", "13px", "20px"],
  ["text-base", "14px", "22px"],
  ["text-md", "15px", "24px"],
  ["text-lg", "17px", "26px"],
  ["text-xl", "20px", "28px"],
  ["text-2xl", "24px", "32px"],
  ["text-3xl", "30px", "38px"],
  ["text-4xl", "36px", "44px"],
  ["text-5xl", "48px", "56px"],
  ["text-6xl", "60px", "68px"],
] as const;

const spacing = [
  ["0.5", 2],
  ["1", 4],
  ["1.5", 6],
  ["2", 8],
  ["3", 12],
  ["4", 16],
  ["5", 20],
  ["6", 24],
  ["8", 32],
  ["10", 40],
  ["12", 48],
  ["16", 64],
] as const;

const layoutTokens = [
  ["w-sidebar", "240px", "Expanded sidebar"],
  ["w-sidebar-collapsed", "60px", "Collapsed sidebar"],
  ["h-topbar", "56px", "App top bar"],
  ["max-w-content", "1400px", "Max page content width"],
] as const;

const radii = [
  ["rounded-xs", "2px", "Keyboard hints, tiny chips"],
  ["rounded-sm", "4px", "Badges, checkboxes, tags"],
  ["rounded-md", "6px", "Buttons, inputs, menu items"],
  ["rounded-lg", "8px", "Cards, tables, popovers"],
  ["rounded-xl", "10px", "Modals, command menu"],
  ["rounded-2xl", "12px", "Large marketing surfaces"],
] as const;

const shadows = [
  ["shadow-xs", "Buttons, inputs, selected tabs"],
  ["shadow-sm", "Cards at rest"],
  ["shadow-md", "Hovered interactive cards"],
  ["shadow-lg", "Dropdowns, tooltips, toasts"],
  ["shadow-xl", "Modals, drawers, command menu"],
  ["shadow-focus", "Focus ring for all controls"],
  ["shadow-focus-danger", "Focus ring for destructive / invalid"],
  ["shadow-focus-success", "Focus ring for confirmed / valid"],
] as const;

function ColorSwatch({ swatch }: { swatch: Swatch }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="h-14 border-b border-border" style={{ backgroundColor: `var(--color-${swatch.token})` }} />
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium text-ink">{swatch.name}</p>
        <p className="mt-0.5 font-mono text-2xs text-muted">{swatch.token}</p>
        <p className="font-mono text-2xs text-subtle">{swatch.hex}</p>
        {swatch.usage && <p className="mt-1 text-2xs text-subtle">{swatch.usage}</p>}
      </div>
    </div>
  );
}

export function FoundationsSection() {
  return (
    <DocSection
      id="foundations"
      eyebrow="Foundations"
      title="Design tokens"
      description="Every visual decision in NEXORA is a token defined once in globals.css with Tailwind v4's @theme. Components never hard-code colors, sizes or shadows."
    >
      <DocBlock id="colors" title="Color" description="Light, calm surfaces with a single confident accent. Use status colors for meaning, never decoration.">
        <div className="flex flex-col gap-8">
          {colorGroups.map((group) => (
            <div key={group.title}>
              <div className="mb-3 flex items-baseline gap-3">
                <h4 className="type-h4">{group.title}</h4>
                <p className="type-caption">{group.description}</p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3">
                {group.swatches.map((swatch) => (
                  <ColorSwatch key={swatch.token} swatch={swatch} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </DocBlock>

      <DocBlock
        id="typography"
        title="Typography"
        description="Plus Jakarta Sans for headings, Inter for interface text and IBM Plex Mono for numbers. The base size is 14px for dense, readable product UI."
      >
        <Specimen className="divide-y divide-border-subtle p-0">
          {typeRoles.map((role) => (
            <div key={role.className} className="grid grid-cols-1 gap-2 px-6 py-5 md:grid-cols-[200px_1fr] md:items-baseline">
              <div>
                <p className="text-sm font-medium text-ink">{role.label}</p>
                <p className="mt-0.5 font-mono text-2xs text-subtle">
                  .{role.className} · {role.spec}
                </p>
              </div>
              <p className={role.className}>{role.sample}</p>
            </div>
          ))}
        </Specimen>
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Specimen label="Size scale">
            <div className="flex flex-col gap-3">
              {typeScale.map(([name, size, lineHeight]) => (
                <div key={name} className="flex items-baseline gap-4">
                  <span className="w-36 shrink-0 font-mono text-2xs text-subtle">
                    {name} · {size}/{lineHeight}
                  </span>
                  <span className={`${name} min-w-0 truncate text-ink`}>The quick brown fox</span>
                </div>
              ))}
            </div>
          </Specimen>
          <Specimen label="Families">
            <div className="flex flex-col gap-5">
              <div>
                <p className="font-display text-2xl font-semibold">Plus Jakarta Sans</p>
                <p className="type-caption mt-1">Headings · 500–800</p>
              </div>
              <div>
                <p className="font-sans text-2xl font-medium">Inter</p>
                <p className="type-caption mt-1">Interface · 400–600</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-medium">IBM Plex Mono</p>
                <p className="type-caption mt-1">Metrics & code · 400–600 · tabular</p>
              </div>
            </div>
          </Specimen>
        </div>
      </DocBlock>

      <DocBlock id="spacing" title="Spacing" description="A 4px base grid. Layout dimensions are named tokens so shells stay consistent.">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Specimen>
            <div className="flex flex-col gap-2.5">
              {spacing.map(([name, px]) => (
                <div key={name} className="flex items-center gap-4">
                  <span className="w-20 shrink-0 font-mono text-2xs text-subtle">
                    {name} · {px}px
                  </span>
                  <span className="h-3 rounded-xs bg-primary/80" style={{ width: px * 3 }} />
                </div>
              ))}
            </div>
          </Specimen>
          <Specimen label="Layout tokens" className="p-0">
            <ul className="divide-y divide-border-subtle">
              {layoutTokens.map(([token, value, usage]) => (
                <li key={token} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <Token>{token}</Token>
                    <p className="mt-1 text-xs text-muted">{usage}</p>
                  </div>
                  <span className="text-metric text-sm text-ink">{value}</span>
                </li>
              ))}
            </ul>
          </Specimen>
        </div>
      </DocBlock>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <DocBlock id="radius" title="Radius" description="Restrained corners: nothing larger than 12px in the product.">
          <div className="grid grid-cols-3 gap-3">
            {radii.map(([token, value, usage]) => (
              <div key={token} className="flex flex-col gap-2">
                <div className={`${token} h-16 border border-border-strong bg-canvas`} />
                <div>
                  <p className="font-mono text-2xs text-ink">
                    {token} · {value}
                  </p>
                  <p className="text-2xs text-subtle">{usage}</p>
                </div>
              </div>
            ))}
          </div>
        </DocBlock>

        <DocBlock id="borders" title="Borders" description="1px hairlines in three strengths. Borders define structure before shadows do.">
          <div className="flex flex-col gap-3">
            {[
              ["border-border-subtle", "Row dividers, inner separators"],
              ["border-border", "Cards, inputs, tables"],
              ["border-border-strong", "Hover, dashed drop zones"],
              ["border-primary", "Focus, selection"],
              ["border-danger", "Invalid fields"],
            ].map(([token, usage]) => (
              <div key={token} className={`flex items-center justify-between rounded-md border bg-white px-4 py-3 ${token}`}>
                <Token>{token}</Token>
                <span className="text-xs text-muted">{usage}</span>
              </div>
            ))}
          </div>
        </DocBlock>
      </div>

      <DocBlock id="shadows" title="Elevation" description="Soft, low-contrast shadows. Elevation communicates layering, not decoration.">
        <div className="grid grid-cols-2 gap-5 rounded-lg bg-canvas p-6 sm:grid-cols-4">
          {shadows.map(([token, usage]) => (
            <div key={token} className={`${token} rounded-lg border border-border bg-white p-4`}>
              <p className="font-mono text-2xs text-ink">{token}</p>
              <p className="mt-1 text-2xs text-subtle">{usage}</p>
            </div>
          ))}
        </div>
      </DocBlock>
    </DocSection>
  );
}
