import path from 'path';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'vite';

const typescriptPlugin = typescript({
  exclude: [
    "./src/**/*.stories.tsx",
    "./src/**/*.test.ts",
    "./src/**/*.test.tsx",
    "node_modules/**/*",
    "vite.config.ts",
  ]
});

export default defineConfig({
  build: {
    outDir: 'lib',
    minify: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'react-webcomponent',
      fileName: format => `index.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
      },
      plugins: [typescriptPlugin]
    }
  },
})