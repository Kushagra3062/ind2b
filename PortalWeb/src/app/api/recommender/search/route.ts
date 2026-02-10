import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")
  
  // Base URL of the Python backend
  const BACKEND_URL = "http://127.0.0.1:8000"

  try {
    let url = `${BACKEND_URL}/search?q=${encodeURIComponent(q || "")}`

    // Simple routing based on query params or path logic if extended
    // For now we map everything to /search or /recommend based on valid params
    // But since the chatbot calls /api/recommender/search, we stick to that mapping
    
    // Future expansion: if we add /recommend/user logic
    // const userId = searchParams.get("userId")
    // if (userId) url = `${BACKEND_URL}/recommend/user/${userId}`

    const res = await fetch(url)
    
    if (!res.ok) {
        return NextResponse.json({ error: "Backend error" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Recommender Proxy Error:", error)
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 })
  }
}
