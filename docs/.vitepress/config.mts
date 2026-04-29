import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";
import { base, siteConfig } from "../../site.config.mjs";
import { createContentNavigation } from "../../scripts/content/navigation.mjs";
import { createZipAssetsPlugin } from "../../scripts/assets/vite-plugin.mjs";
import { createContentStructurePlugin } from "../../scripts/content/vite-plugin.mjs";
import { createExcalidrawExportPlugin } from "../../scripts/excalidraw/vite-plugin.mjs";

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { nav, sidebar, rewrites, linkAliases } = createContentNavigation({ docsRoot });

export default defineConfig({
  title: siteConfig.title,
  description: siteConfig.description,
  lang: "de-CH",
  base,
  cleanUrls: true,
  rewrites,
  lastUpdated: true,
  appearance: false,
  head: [
    ["meta", { name: "theme-color", content: "#165f68" }],
    ["meta", { name: "apple-mobile-web-app-title", content: siteConfig.title }]
  ],
  vite: {
    plugins: [
      createContentStructurePlugin({ docsRoot, linkAliases, base }),
      createExcalidrawExportPlugin({ docsRoot }),
      createZipAssetsPlugin({ docsRoot, base })
    ]
  },
  themeConfig: {
    logo: "/logo.png",
    search: {
      provider: "local"
    },
    nav,
    sidebar,
    outline: {
      level: [2, 3],
      label: "Auf dieser Seite"
    },
    footer: {
      message: "Markdown-first Unterrichtsmaterialien mit einer gemeinsamen VitePress-Basis.",
      copyright: "Pflege den Base Path in site.config.mjs."
    }
  }
});
