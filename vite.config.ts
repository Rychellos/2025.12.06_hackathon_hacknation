import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8081,
    open: true,
  },
  base: "/2025.12.06_hackathon_hacknation/",
  build: {
    target: "esnext", //browsers can handle the latest ES features
    outDir: "docs",
  },
});
