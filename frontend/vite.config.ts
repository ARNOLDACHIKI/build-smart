import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

function manualChunks(id: string) {
  if (!id.includes("node_modules")) {
    return undefined;
  }

  const nodeModulesPath = id.split("node_modules/").pop();

  if (!nodeModulesPath) {
    return "vendor";
  }

  const pathSegments = nodeModulesPath.split("/");
  const packageName = pathSegments[0]?.startsWith("@")
    ? `${pathSegments[0]}/${pathSegments[1]}`
    : pathSegments[0];

  if (!packageName) {
    return "vendor";
  }

  return `vendor-${packageName.replace(/^@/, "").replace(/\//g, "-")}`;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_PROXY_TARGET || "http://localhost:3000",
        changeOrigin: true,
      },
      "/health": {
        target: process.env.VITE_BACKEND_PROXY_TARGET || "http://localhost:3000",
        changeOrigin: true,
      },
      "/uploads": {
        target: process.env.VITE_BACKEND_PROXY_TARGET || "http://localhost:3000",
        changeOrigin: true,
      },
    },
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
