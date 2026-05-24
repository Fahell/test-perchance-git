import { defineConfig } from 'vite';
import { resolve } from 'path';
import { transformWithEsbuild } from 'vite';

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
  },
  // Configuração para desenvolvimento (HMR)
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  // Plugin para transformar arquivos .js como JSX durante o build
  plugins: [
    {
      name: 'load-js-files-as-jsx',
      async transform(code, id) {
        // Aplica apenas a arquivos .js na pasta src/
        if (!id.match(/src\/.*\.js$/)) return null;
        
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic'
        });
      }
    }
  ]
});
