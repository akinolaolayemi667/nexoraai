// Imported by vite.config.ts as well as the app, so this module must stay free of
// path aliases, React and browser globals.

export const SITE = {
  name: "NEXORA AI",
  url: "https://nexoraainexo.vercel.app",
  locale: "en_US",
  twitter: "@nexoraai",
  themeColor: "#FFFFFF",
  image: {
    path: "/og-image.png",
    width: 1200,
    height: 630,
    alt: "NEXORA AI — CRM, pipeline, automation and AI insights in one workspace.",
  },
} as const;

export type PageMeta = {
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
  /** Included in sitemap.xml. */
  priority?: number;
  changefreq?: "daily" | "weekly" | "monthly";
};

export const pages = {
  home: {
    path: "/",
    title: "NEXORA AI — AI-Powered Operations. One Intelligent Workspace.",
    description:
      "Manage leads, automate workflows, understand your customers and move your business forward from one intelligent platform. CRM, pipeline, automation and analytics with AI built in.",
    priority: 1,
    changefreq: "weekly",
  },
  features: {
    path: "/features",
    title: "Features — CRM, Automation, AI & Analytics · NEXORA AI",
    description:
      "Explore NEXORA AI: a practical CRM, a visual pipeline, a no-code automation builder, an AI assistant and real-time analytics built on one data model.",
    priority: 0.8,
    changefreq: "monthly",
  },
  pricing: {
    path: "/pricing",
    title: "Pricing — Starter, Growth, Scale & Enterprise · NEXORA AI",
    description:
      "Simple pricing that scales with your team. Start with a 14-day free trial of Growth, no credit card required. Compare Starter, Growth, Scale and Enterprise plans.",
    priority: 0.9,
    changefreq: "monthly",
  },
  signup: {
    path: "/signup",
    title: "Start your free trial · NEXORA AI",
    description: "Create your NEXORA AI workspace in under a minute. 14-day free trial of Growth, no credit card required.",
    priority: 0.6,
    changefreq: "monthly",
  },
  login: {
    path: "/login",
    title: "Log in · NEXORA AI",
    description: "Log in to your NEXORA AI workspace.",
    noindex: true,
  },
} satisfies Record<string, PageMeta>;

export type PageKey = keyof typeof pages;

export const absoluteUrl = (path: string) => new URL(path, SITE.url).toString();

export type MetaTag = { attr: "name" | "property"; key: string; content: string };

export function metaTags(page: PageMeta): MetaTag[] {
  const url = absoluteUrl(page.path);
  const image = absoluteUrl(SITE.image.path);
  const tags: [MetaTag["attr"], string, string][] = [
    ["name", "description", page.description],
    ["name", "robots", page.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"],
    ["property", "og:type", "website"],
    ["property", "og:site_name", SITE.name],
    ["property", "og:locale", SITE.locale],
    ["property", "og:title", page.title],
    ["property", "og:description", page.description],
    ["property", "og:url", url],
    ["property", "og:image", image],
    ["property", "og:image:width", String(SITE.image.width)],
    ["property", "og:image:height", String(SITE.image.height)],
    ["property", "og:image:alt", SITE.image.alt],
    ["name", "twitter:card", "summary_large_image"],
    ["name", "twitter:site", SITE.twitter],
    ["name", "twitter:title", page.title],
    ["name", "twitter:description", page.description],
    ["name", "twitter:image", image],
    ["name", "twitter:image:alt", SITE.image.alt],
  ];
  return tags.map(([attr, key, content]) => ({ attr, key, content }));
}

export const organizationSchema = {
  "@type": "Organization",
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  url: SITE.url,
  logo: absoluteUrl("/icon-512.png"),
};

export const websiteSchema = {
  "@type": "WebSite",
  "@id": `${SITE.url}/#website`,
  name: SITE.name,
  url: SITE.url,
  publisher: { "@id": `${SITE.url}/#organization` },
};

export const softwareSchema = {
  "@type": "SoftwareApplication",
  "@id": `${SITE.url}/#software`,
  name: SITE.name,
  url: SITE.url,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: pages.home.description,
  image: absoluteUrl(SITE.image.path),
  publisher: { "@id": `${SITE.url}/#organization` },
};

export const graph = (...nodes: object[]) => ({ "@context": "https://schema.org", "@graph": nodes });

export const breadcrumbSchema = (page: PageMeta, name: string) => ({
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
    { "@type": "ListItem", position: 2, name, item: absoluteUrl(page.path) },
  ],
});

export const defaultStructuredData: Partial<Record<PageKey, object>> = {
  home: graph(organizationSchema, websiteSchema, softwareSchema),
  features: graph(organizationSchema, breadcrumbSchema(pages.features, "Features")),
};

const escapeAttr = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeText = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const serializeJsonLd = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

/** Static head markup for the prerendered HTML of a page. */
export function renderHead(page: PageMeta, structuredData?: object) {
  const lines = [
    `<title>${escapeText(page.title)}</title>`,
    ...metaTags(page).map((t) => `<meta ${t.attr}="${t.key}" content="${escapeAttr(t.content)}" />`),
    `<link rel="canonical" href="${absoluteUrl(page.path)}" />`,
  ];
  if (structuredData) {
    lines.push(`<script type="application/ld+json" id="structured-data">${serializeJsonLd(structuredData)}</script>`);
  }
  return lines.map((line) => `    ${line}`).join("\n");
}

export function renderSitemap(lastmod: string) {
  const urls = Object.values(pages as Record<string, PageMeta>)
    .filter((page) => !page.noindex)
    .map(
      (page) =>
        `  <url>\n    <loc>${absoluteUrl(page.path)}</loc>\n    <lastmod>${lastmod}</lastmod>\n` +
        (page.changefreq ? `    <changefreq>${page.changefreq}</changefreq>\n` : "") +
        (page.priority !== undefined ? `    <priority>${page.priority.toFixed(1)}</priority>\n` : "") +
        "  </url>",
    );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

export function renderRobots() {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /app",
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    "",
  ].join("\n");
}
