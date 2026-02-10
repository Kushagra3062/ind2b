import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin/analytics/reports">
          <Button className="bg-orange-500 hover:bg-orange-600">Create New Report</Button>
        </Link>
      </div>
    </div>
  )
}
