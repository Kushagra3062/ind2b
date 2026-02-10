
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")
  const history = searchParams.get("history")
  
  const BACKEND_URL = "http://127.0.0.1:8000"

  try {
    let url = `${BACKEND_URL}/smart-search?q=${encodeURIComponent(q || "")}`
    if (history) {
        url += `&history=${encodeURIComponent(history)}`
    }

    const res = await fetch(url)
    
    if (!res.ok) {
        return NextResponse.json({ error: "Backend error" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Smart Recommender Proxy Error:", error)
    return NextResponse.json({ error: "Failed to fetch smart recommendations" }, { status: 500 })
  }
}
