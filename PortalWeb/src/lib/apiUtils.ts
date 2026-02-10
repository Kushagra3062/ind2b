// Maximum allowed payload size (in bytes)
const MAX_PAYLOAD_SIZE = 1024 * 1024 // 1MB

export function validatePayloadSize(body: any): boolean {
  const size = new TextEncoder().encode(JSON.stringify(body)).length
  return size <= MAX_PAYLOAD_SIZE
}

// Sanitize input to prevent NoSQL injection
export function sanitizeInput(input: string): string {
  if (!input) return input

  // Remove MongoDB operators
  return input.replace(/\$[a-zA-Z0-9_]+/g, "")
}

// Validate pagination parameters
export function validatePagination(page?: number, limit?: number): { page: number; limit: number } {
  const validPage = page && page > 0 ? Math.floor(page) : 1
  const validLimit = limit && limit > 0 && limit <= 100 ? Math.floor(limit) : 20

  return { page: validPage, limit: validLimit }
}

// Create a timeout for database queries
export function createQueryTimeout<T>(promise: Promise<T>, timeoutMs = 5000): Promise<T> {
  let timeoutId: NodeJS.Timeout

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Database query timeout"))
    }, timeoutMs)
  })

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId)
  }) as Promise<T>
}
