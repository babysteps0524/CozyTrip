import { defineConfig } from "vite";

import UnoCSS from "unocss/vite";

import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [UnoCSS(), react()],

  build: {
    outDir: "dist",

    emptyOutDir: true,

    manifest: true,

    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",

        chunkFileNames: "assets/[name]-[hash].js",

        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },

  server: {
    host: "localhost",

    port: 5173,

    strictPort: true,

    open: true,
  },

  preview: {
    host: "localhost",

    port: 4173,

    strictPort: true,

    open: true,
  },
});
