import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Component tagger import removed

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://lcdrsupwwitlvrvfrgsl.supabase.co/functions/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [
    react(),
    // Removed componentTagger reference
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));