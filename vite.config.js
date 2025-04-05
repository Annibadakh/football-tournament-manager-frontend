import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env, // Make sure process.env is available
  },
  server: {
    host: '0.0.0.0', // Allows access from any device in the network
    port: 5173
  },
})
