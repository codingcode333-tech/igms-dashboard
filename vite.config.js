import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react({
    babel: {
      plugins: ["@babel/plugin-syntax-import-attributes"]
    }
  })],
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  base: "/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@material-tailwind/react']
        }
      }
    }
  },
  server: {
    open: "/",
    port: 5001,
    host: "0.0.0.0"
  },
  preview: {
    open: "/",
    port: 5001,
    host: "0.0.0.0"
  }
});
