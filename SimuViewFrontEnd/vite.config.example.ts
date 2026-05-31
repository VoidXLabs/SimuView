import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// This is an example configuration file. 
// Copy this file to 'vite.config.ts' and adjust the proxy settings as needed.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      proxy: {
        // Main Backend API Proxy
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, '')
        },
        // Voice/TTS/ASR Backend API Proxy
        '/tts-api': {
          target: env.VITE_VOICE_API_BASE_URL || 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/tts-api/, ''),
        }
      }
    },

    optimizeDeps: {
      exclude: ['@met4citizen/talkinghead'],
    },

    assetsInclude: ['**/*.svg', '**/*.csv', '**/*.glb', '**/*.gltf'],
  }
})
