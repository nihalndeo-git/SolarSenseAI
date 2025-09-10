import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cesium() // The Cesium plugin should handle its own paths
  ],
  server: {
    open: true, // Automatically open the browser
  },
});