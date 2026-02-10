import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names into a single string, merging Tailwind classes properly
 * @param inputs - Class names to combine
 * @returns Combined class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a readable string
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Format a number with thousands separators
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num)
}

/**
 * Format currency value
 * @param amount - Amount to format
 * @param currency - Currency code (default: INR)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Truncate text to a specific length
 * @param text - Text to truncate
 * @param length - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, length = 100): string {
  if (text.length <= length) return text
  return text.slice(0, length) + "..."
}

/**
 * Generate a random ID
 * @param length - Length of the ID
 * @returns Random ID string
 */
export function generateId(length = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, length + 2)
}

/**
 * Generate a URL-friendly slug from a string
 * @param text - Text to convert to slug
 * @returns URL-friendly slug
 */
export function generateSlug(text: string): string {
  if (!text || typeof text !== "string") {
    return ""
  }
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .substring(0, 60) // Limit length to 60 characters
}

/**
 * Generate SEO-friendly product URL
 * @param productId - Product ID
 * @param title - Product title (optional, will use product ID if not provided)
 * @returns SEO-friendly URL path
 */
export function generateProductUrl(productId: number | string, title?: string): string {
  if (!title || typeof title !== "string") {
    return `/products/${productId}`
  }
  const slug = generateSlug(title)
  return slug ? `/products/${productId}-${slug}` : `/products/${productId}`
}

/**
 * Extract product ID from URL slug (handles both formats: "123" and "123-product-name")
 * @param idParam - URL parameter containing ID or ID-slug
 * @returns Product ID as string
 */
export function extractProductId(idParam: string): string {
  // If the param contains a hyphen, extract just the ID part
  const firstHyphenIndex = idParam.indexOf("-")
  if (firstHyphenIndex > 0) {
    return idParam.substring(0, firstHyphenIndex)
  }
  // Otherwise return the whole param (backwards compatibility)
  return idParam
}

/**
 * Debounce a function
 * @param fn - Function to debounce
 * @param ms - Debounce delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, ms = 300): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), ms)
  }
}
