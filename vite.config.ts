import { defineConfig } from 'vite'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  base: mode === 'gh-pages' ? '/jessys-pratchett-diagram/' : '/',
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'original.html'),
        contact: resolve(__dirname, 'force-graph.html'),
        // Fügen Sie hier jede weitere HTML-Datei hinzu
      },
    },
  }
}))