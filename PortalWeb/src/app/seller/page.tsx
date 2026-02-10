"use client"
import { useSearchParams } from "next/navigation"
import DashboardContent from "./dashboard-content"
import ProfilePage from "./profile/page"

// Main dashboard page component
export default function SellerDashboard() {
  const searchParams = useSearchParams()
  const showDashboard = searchParams.get("view") === "dashboard" || !searchParams.get("view")

  // By default, show the Dashboard content
  // Only show Profile if explicitly requested via ?view=profile
  return <div className="w-full max-w-7xl mx-auto">{showDashboard ? <DashboardContent /> : <ProfilePage />}</div>
}
