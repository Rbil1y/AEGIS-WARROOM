import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    headers: {
      // W3C WebMCP Section 4.2 requires origin-keyed agent clusters
      'Origin-Agent-Cluster': '?1',
      // Permissions policy gating 'tools' feature for WebMCP
      'Permissions-Policy': 'tools=(self)'
    }
  }
});
