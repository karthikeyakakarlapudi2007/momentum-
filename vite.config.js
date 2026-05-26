import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Expose both VITE_* and REACT_APP_* env vars to the client.
  envPrefix: ['VITE_', 'REACT_APP_'],
})
