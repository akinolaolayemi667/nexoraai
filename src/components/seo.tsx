import { useEffect } from "react";
import { absoluteUrl, defaultStructuredData, metaTags, pages, serializeJsonLd, type PageKey } from "@/lib/seo";

const STRUCTURED_DATA_ID = "structured-data";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.append(el);
  }
  el.content = content;
}

function setCanonical(href: string | null) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.append(el);
  }
  el.href = href;
}

function setStructuredData(data: object | undefined) {
  let el = document.getElementById(STRUCTURED_DATA_ID);
  if (!data) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("script");
    el.id = STRUCTURED_DATA_ID;
    el.setAttribute("type", "application/ld+json");
    document.head.append(el);
  }
  el.textContent = serializeJsonLd(data);
}

/**
 * Page title plus description, canonical, Open Graph, Twitter and JSON-LD tags.
 * Updates the tags prerendered into the HTML instead of appending duplicates.
 */
export function Seo({ page, title, structuredData }: { page: PageKey; title?: string; structuredData?: object }) {
  const meta = pages[page];
  const data = structuredData ?? defaultStructuredData[page];

  useEffect(() => {
    for (const tag of metaTags(meta)) upsertMeta(tag.attr, tag.key, tag.content);
    setCanonical(absoluteUrl(meta.path));
    setStructuredData(data);
  }, [meta, data]);

  return <title>{title ?? meta.title}</title>;
}

/** Private screens (the app, 404s) should never be indexed or inherit a marketing canonical. */
export function useNoIndex() {
  useEffect(() => {
    upsertMeta("name", "robots", "noindex, nofollow");
    setCanonical(null);
    setStructuredData(undefined);
  }, []);
}
