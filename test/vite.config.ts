import path from 'path';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'vite';
import { dependencies } from './package.json';

const vendors = Object.keys(dependencies)

const typescriptPlugin = typescript({
  exclude: [
    "./src/**/*.stories.tsx",
    "./src/**/*.test.ts",
    "./src/**/*.test.tsx",
    "./cypress/**/*",
    "node_modules/**/*",
    "vite.config.ts",
    "cypress.config.ts",
  ]
});

export default defineConfig({
  define: {
    'process.env': {
      NODE_ENV: 'production'
    }
  },
  build: {
    outDir: 'public/lib',
    minify: true,
    lib: {
      entry: {
        Select: path.resolve(__dirname, './src/Select/register.ts'),
      },
      // name: 'select-test',
      fileName: (format, name) => `${name}.js`,
      formats: ['es']
    },
    rollupOptions: {
      plugins: [typescriptPlugin],
      output: {
        inlineDynamicImports: false,
        manualChunks: {
          vendors,
          ...vendors.reduce((chunks, name) => {
              if (!vendors.includes(name)) {
                chunks[name] = [name]
              }
              return chunks
            }, {})
        }
      }
    }
  },
})