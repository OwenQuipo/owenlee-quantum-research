import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: "website",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "website/index.html"),
        qubitCircuitBuilder: resolve(
          __dirname,
          "website/projects/qubit-circuit-builder/index.html"
        ),
      },
    },
  },
});
