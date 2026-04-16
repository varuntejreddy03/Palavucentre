import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup-vitest.js'],
    css: true,
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    include: [
      'src/**/*.test.{js,jsx}',
      'backend/**/*.test.{js,jsx}',
    ],
  },
})
