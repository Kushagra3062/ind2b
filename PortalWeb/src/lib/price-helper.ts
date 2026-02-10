/**
 * Price Helper Utility
 * Provides functions to determine the correct price to display
 * Prioritizes final_price if it exists, falls back to price
 */

/**
 * Get the display price for a product
 * If final_price exists and is greater than 0, use it
 * Otherwise, use the regular price
 *
 * @param price - The base/regular price
 * @param finalPrice - The final price (optional, may be 0 or undefined)
 * @returns The appropriate price to display
 */
export function getDisplayPrice(price: number, finalPrice?: number | null): number {
  // If final_price exists and is greater than 0, use it
  if (finalPrice && finalPrice > 0) {
    return finalPrice
  }
  // Otherwise, use the regular price
  return price || 0
}

/**
 * Determine which price to use from product data
 * This is the main function to use throughout the app
 *
 * @param product - Product object containing price and final_price fields
 * @returns The price to display to customers
 */
export function getProductDisplayPrice(product: {
  price?: number
  final_price?: number
  finalPrice?: number
}): number {
  const regularPrice = product.price || 0

  // Check for final_price (with underscore, MongoDB convention)
  const finalPrice = product.final_price || product.finalPrice

  return getDisplayPrice(regularPrice, finalPrice)
}
