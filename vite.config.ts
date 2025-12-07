import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8081,
    open: true,
  },
  build: {
    target: "esnext", //browsers can handle the latest ES features
  },
});
