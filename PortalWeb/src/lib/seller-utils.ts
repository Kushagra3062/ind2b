// Client-side utilities only - safe for browser import

// Function to fetch seller email from the client side
export async function fetchSellerEmail(): Promise<string | null> {
  try {
    const response = await fetch("/api/seller/profile/email")
    if (!response.ok) {
      throw new Error("Failed to fetch seller email")
    }

    const data = await response.json()
    return data.email || null
  } catch (error) {
    console.error("Error fetching seller email:", error)
    return null
  }
}
