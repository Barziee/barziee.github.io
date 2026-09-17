// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// barziee.github.io is a GitHub *user* site, so it is served from the domain
// root — base stays "/". (A project site would need base: "/<repo>/".)
export default defineConfig({
  site: "https://barziee.github.io",
  base: "/",
  trailingSlash: "never",
  build: {
    // Emit index.html rather than about/index.html for cleaner Pages URLs.
    format: "file",
    inlineStylesheets: "auto",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
