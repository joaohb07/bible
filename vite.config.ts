import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

function spaFallback404() {
  return {
    name: "spa-fallback-404",
    closeBundle() {
      const outDir = resolve(__dirname, "dist");
      copyFileSync(resolve(outDir, "index.html"), resolve(outDir, "404.html"));
    },
  };
}

export default defineConfig({
  base: "/bible/",
  plugins: [react(), spaFallback404()],
});
