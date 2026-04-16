import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  window.scrollTo = vi.fn()
  window.scrollY = 0
  window.requestAnimationFrame = (callback) => setTimeout(callback, 0)
  window.cancelAnimationFrame = (id) => clearTimeout(id)
  window.requestIdleCallback =
    window.requestIdleCallback ||
    ((callback) =>
      setTimeout(
        () =>
          callback({
            didTimeout: false,
            timeRemaining: () => 50,
          }),
        0,
      ))
  window.cancelIdleCallback = window.cancelIdleCallback || ((id) => clearTimeout(id))

  if (!window.HTMLElement.prototype.scrollBy) {
    window.HTMLElement.prototype.scrollBy = vi.fn()
  }
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
