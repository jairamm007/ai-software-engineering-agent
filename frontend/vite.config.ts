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
    target: "es2022",
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "vendor-react";
            }
            if (id.includes("@tanstack/react-query")) {
              return "vendor-query";
            }
            if (id.includes("framer-motion") || id.includes("lucide-react")) {
              return "vendor-motion";
            }
            if (id.includes("react-markdown") || id.includes("remark-gfm") || id.includes("react-syntax-highlighter")) {
              return "vendor-markdown";
            }
            if (id.includes("reactflow") || id.includes("dagre")) {
              return "vendor-graph";
            }
            if (id.includes("jspdf") || id.includes("docx") || id.includes("html2canvas")) {
              return "vendor-docs";
            }
            if (id.includes("cmdk") || id.includes("sonner") || id.includes("react-resizable-panels")) {
              return "vendor-ui-extra";
            }
            if (id.includes("zod") || id.includes("axios") || id.includes("better-auth")) {
              return "vendor-utils";
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
