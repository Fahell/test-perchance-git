import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.js'),
      name: 'PerchanceRPG',
      fileName: 'main',
      formats: ['es']
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    },
    rollupOptions: {
      // Three.js deve continuar externo (carregado via CDN)
      external: ['three'],
      output: {
        globals: {
          three: 'THREE'
        },
        // Nome do arquivo bundle
        entryFileNames: 'main.bundle.js',
        // Inline todos os dynamic imports em um único arquivo
        inlineDynamicImports: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
