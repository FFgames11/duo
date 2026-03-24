import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    hmr: {
      host: "127.0.0.1",
      protocol: "ws",
      port: 5173,
      clientPort: 5173,
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
});
