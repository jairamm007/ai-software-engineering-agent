import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5173,

    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/react-router")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/@tanstack/react-query")) {
            return "vendor-query";
          }
          if (id.includes("node_modules/framer-motion") || id.includes("node_modules/lucide-react") || id.includes("node_modules/clsx") || id.includes("node_modules/tailwind-merge")) {
            return "vendor-ui";
          }
          if (id.includes("node_modules/react-markdown") || id.includes("node_modules/remark-gfm") || id.includes("node_modules/react-syntax-highlighter")) {
            return "vendor-markdown";
          }
          if (id.includes("node_modules/reactflow") || id.includes("node_modules/dagre")) {
            return "vendor-graph";
          }
          if (id.includes("node_modules/jspdf") || id.includes("node_modules/docx")) {
            return "vendor-docs";
          }
        },
      },
    },
  },
});
