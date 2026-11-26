import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const rootDir = typeof import.meta.dirname === 'string' ? import.meta.dirname : __dirname;

  // Pre-build hook: clean dist directory
  const distDir = path.resolve(rootDir, 'dist');
  if (fs.existsSync(distDir)) {
    try {
      fs.rmSync(distDir, { recursive: true, force: true });
    } catch {
      // Ignore removal errors
    }
  }

  return {
    publicDir: false as const,
    define: {
      'process.env.VITE_CONFIG_NATIVE_IGNORE_WARNING': JSON.stringify('true'),
    },
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const targetDist = path.resolve(rootDir, 'dist');
          const srcAssets = path.resolve(rootDir, 'src/assets');
          const distAssets = path.resolve(targetDist, 'src/assets');
          if (fs.existsSync(targetDist) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
          const publicAssets = path.resolve(rootDir, 'public/assets');
          const distPublicAssets = path.resolve(targetDist, 'assets');
          if (fs.existsSync(targetDist) && fs.existsSync(publicAssets)) {
            fs.cpSync(publicAssets, distPublicAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
