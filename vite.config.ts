import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['node-vibrant']
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  define: {
    // This allows process.env.API_KEY to be used directly in the code
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});