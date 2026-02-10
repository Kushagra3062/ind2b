"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface User {
  id: string
  sno: number
  name: string
  email: string
  role: string
}

interface UserTableProps {
  users: User[]
}

export function UserTable({ users }: UserTableProps) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)
  const { toast } = useToast()

  const [nameFilter, setNameFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState<"" | "admin" | "seller" | "customer">("")

  // For pagination
  const itemsPerPage = 8
  const [currentPage, setCurrentPage] = useState(1)

  const filteredUsers = users.filter((user) => {
    const matchesName =
      user.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
      user.email.toLowerCase().includes(nameFilter.toLowerCase())
    const matchesRole = roleFilter === "" || user.role === roleFilter
    return matchesName && matchesRole
  })

  const totalUsers = filteredUsers.length
  const totalPages = Math.ceil(totalUsers / itemsPerPage)

  // Calculate visible users based on current page
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalUsers)
  const visibleUsers = filteredUsers.slice(startIndex, endIndex)

  const tableRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentPage(1)
  }, [nameFilter, roleFilter])

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: "admin" | "seller" | "customer") => {
    try {
      setUpdating(userId)

      const response = await fetch("/api/admin/users/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role: newRole }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user role")
      }

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
      })
    } finally {
      setUpdating(null)
    }
  }

  // Set up scroll event listener for detecting scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return

      const { scrollTop, scrollHeight, clientHeight } = tableRef.current
      const scrollPercentage = scrollTop / (scrollHeight - clientHeight)

      // Only update page if we've scrolled significantly
      if (scrollPercentage > 0.7 && currentPage < totalPages) {
        setCurrentPage((prev) => prev + 1)
      } else if (scrollPercentage < 0.3 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1)
      }
    }

    const tableElement = tableRef.current
    if (tableElement) {
      tableElement.addEventListener("scroll", handleScroll)
    }

    return () => {
      if (tableElement) {
        tableElement.removeEventListener("scroll", handleScroll)
      }
    }
  }, [currentPage, totalPages])

  // Handle pagination button clicks
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)

      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)

      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }

  return (
    <div ref={containerRef} className="w-full flex flex-col">
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <h3 className="text-sm font-semibold mb-4">Filter Users</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Search by Name or Email</label>
            <Input
              placeholder="Enter name or email..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Role filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Filter by Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as "" | "admin" | "seller" | "customer")}
              className="w-full px-3 py-2 border rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="seller">Seller</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          Showing {totalUsers === 0 ? 0 : startIndex + 1}-{endIndex} of {totalUsers} users
        </div>
      </div>

      <div
        ref={tableRef}
        className="w-full overflow-auto max-h-[600px] border rounded-md"
        style={{ scrollBehavior: "smooth" }}
      >
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow className="bg-slate-50">
              <TableHead className="w-[80px] font-medium">S.No</TableHead>
              <TableHead className="font-medium">Name</TableHead>
              <TableHead className="font-medium">Current Role</TableHead>
              <TableHead className="w-[100px] text-center font-medium">Admin</TableHead>
              <TableHead className="w-[100px] text-center font-medium">Seller</TableHead>
              <TableHead className="w-[100px] text-center font-medium">Customer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No users found matching the filters
                </TableCell>
              </TableRow>
            ) : (
              visibleUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.sno}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={user.role === "admin"}
                        disabled={updating === user.id}
                        onCheckedChange={(checked) => {
                          if (checked) handleRoleChange(user.id, "admin")
                        }}
                        className="border-emerald-600 data-[state=checked]:bg-emerald-600"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={user.role === "seller"}
                        disabled={updating === user.id}
                        onCheckedChange={(checked) => {
                          if (checked) handleRoleChange(user.id, "seller")
                        }}
                        className="border-emerald-600 data-[state=checked]:bg-emerald-600"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={user.role === "customer"}
                        disabled={updating === user.id}
                        onCheckedChange={(checked) => {
                          if (checked) handleRoleChange(user.id, "customer")
                        }}
                        className="border-emerald-600 data-[state=checked]:bg-emerald-600"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button onClick={goToPrevPage} disabled={currentPage === 1} variant="outline" size="sm">
          Previous
        </Button>
        <div className="text-sm">
          Page {currentPage} of {totalPages}
        </div>
        <Button onClick={goToNextPage} disabled={currentPage === totalPages} variant="outline" size="sm">
          Next
        </Button>
      </div>
    </div>
  )
}
