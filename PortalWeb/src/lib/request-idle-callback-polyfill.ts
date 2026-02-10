/**
 * Polyfill for requestIdleCallback - not supported in Safari/iOS
 * Provides a fallback using setTimeout for browsers that don't support it
 */

type RequestIdleCallbackHandle = number
type RequestIdleCallbackOptions = {
  timeout?: number
}
type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean
  timeRemaining: () => number
}

declare global {
  interface Window {
    requestIdleCallback?: (
      callback: (deadline: RequestIdleCallbackDeadline) => void,
      options?: RequestIdleCallbackOptions,
    ) => RequestIdleCallbackHandle
    cancelIdleCallback?: (handle: RequestIdleCallbackHandle) => void
  }
}

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Polyfill requestIdleCallback for Safari and other browsers that don't support it
export const requestIdleCallback =
  isBrowser && window.requestIdleCallback
    ? window.requestIdleCallback.bind(window)
    : (callback: (deadline: RequestIdleCallbackDeadline) => void): RequestIdleCallbackHandle => {
        const start = Date.now()
        return setTimeout(() => {
          try {
            callback({
              didTimeout: false,
              timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
            })
          } catch (error) {
            console.error("[v0] Error in requestIdleCallback:", error)
          }
        }, 1) as unknown as RequestIdleCallbackHandle
      }

export const cancelIdleCallback =
  isBrowser && window.cancelIdleCallback
    ? window.cancelIdleCallback.bind(window)
    : (handle: RequestIdleCallbackHandle): void => {
        clearTimeout(handle as unknown as NodeJS.Timeout)
      }
