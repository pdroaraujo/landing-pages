import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Celular com navegador mais antigo (iPhone com iOS < 16.4, Android com
    // Chrome desatualizado) não roda o JS moderno e fica com tela branca.
    // O plugin gera uma segunda versão com polyfills que só esses aparelhos
    // baixam (via <script nomodule>); os navegadores novos nem tocam nela.
    legacy({
      targets: ['defaults', 'iOS >= 12', 'Safari >= 12', 'Chrome >= 70', 'Android >= 7'],
      modernPolyfills: true,
    }),
  ],
})
