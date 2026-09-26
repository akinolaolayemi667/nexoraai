import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defaultStructuredData, pages, renderHead, renderRobots, renderSitemap, type PageKey, type PageMeta } from "./src/lib/seo";

const SEO_BLOCK = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/;

const seoBlock = (page: PageMeta, structuredData?: object) =>
  `<!-- seo:start -->\n${renderHead(page, structuredData)}\n    <!-- seo:end -->`;

/**
 * Crawlers and link-preview bots don't run JavaScript, so every public route gets its own
 * HTML file with the right head. Vercel serves them via `cleanUrls`; unknown paths fall
 * through to 404.html with a real 404 status.
 */
function seo(): Plugin {
  let outDir = "dist";
  return {
    name: "nexora-seo",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    transformIndexHtml(html, ctx) {
      const fonts = Object.keys(ctx.bundle ?? {}).filter((file) =>
        /(inter|plus-jakarta-sans)-latin-wght-normal-[\w-]+\.woff2$/.test(file),
      );
      return {
        html: html.replace("<!-- seo -->", seoBlock(pages.home, defaultStructuredData.home)),
        tags: fonts.map((file) => ({
          tag: "link",
          attrs: { rel: "preload", as: "font", type: "font/woff2", href: `/${file}`, crossorigin: "" },
          injectTo: "head" as const,
        })),
      };
    },
    async closeBundle() {
      if (this.meta.watchMode) return;
      const indexHtml = await readFile(resolve(outDir, "index.html"), "utf8");
      if (!SEO_BLOCK.test(indexHtml)) throw new Error("nexora-seo: SEO block missing from index.html");

      const routes: PageKey[] = ["features", "pricing", "signup", "login"];
      await Promise.all(
        routes.map((key) =>
          writeFile(
            resolve(outDir, `${pages[key].path.slice(1)}.html`),
            indexHtml.replace(SEO_BLOCK, seoBlock(pages[key], defaultStructuredData[key])),
          ),
        ),
      );

      const notFound: PageMeta = {
        path: "/404",
        title: "Page not found · NEXORA AI",
        description: "The page you're looking for doesn't exist or has been moved.",
        noindex: true,
      };
      await writeFile(
        resolve(outDir, "404.html"),
        indexHtml.replace(SEO_BLOCK, seoBlock(notFound).replace(/\n\s*<link rel="canonical"[^>]*>/, "")),
      );

      await writeFile(resolve(outDir, "sitemap.xml"), renderSitemap(new Date().toISOString().slice(0, 10)));
      await writeFile(resolve(outDir, "robots.txt"), renderRobots());
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seo()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5190,
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "react", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 3 },
            { name: "router", test: /node_modules[\\/]react-router/, priority: 2 },
            { name: "motion", test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/, priority: 2 },
            { name: "vendor", test: /node_modules/, priority: 1 },
          ],
        },
      },
    },
  },
});
