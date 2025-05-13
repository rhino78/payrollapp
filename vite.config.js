// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    watch: {
      usePolling: true, // 🔧 Enables polling for file changes (WSL, networked FS, etc.)
    },
    port: 5173, // Optional: set your preferred port
  },
});

