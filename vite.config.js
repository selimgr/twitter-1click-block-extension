import { defineConfig } from 'vite'
import { resolve } from 'path'
import * as fs from 'fs'
import manifest from './manifest.json'
import pkg from './package.json'

const outDir = resolve(__dirname, 'dist')

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      {
        name: 'make-manifest',
        writeBundle (options, bundle) {
          if (!fs.existsSync(outDir)) fs.mkdirSync(outDir)
          const manifestPath = resolve(outDir, 'manifest.json')
          const m = { ...manifest }
          const keys = Object.keys(bundle)
          const js = keys.filter((key) => key.endsWith('.js') && bundle[key].isEntry)
          const css = keys.filter((key) => key.endsWith('.css') && key.includes('main'))
          m.content_scripts[0].js = js
          m.content_scripts[0].css = css

          m.name = pkg.displayName
          m.author = pkg.author
          m.version = pkg.version
          m.description = pkg.description
          m.version = pkg.version

          fs.writeFileSync(manifestPath, JSON.stringify(m, null, 2))
        }
      }
    ],
    build: {
      minify: true,
      target: 'es2015',
      outDir,
      rollupOptions: {
        input: {
          content: resolve(__dirname, 'src/entries/contentScript/primary/main.js')
        }
      }
    },
    resolve: {
      alias: {
        '~': resolve(__dirname, './src')
      }
    }
  }
})
