import { Suspense } from "react"
import { UserTable } from "@/components/admin/user-table"
import { getCurrentUser } from "@/actions/auth"
import { connectDB1 } from "@/lib/db"
import { getUserModel } from "@/models/user"

export const dynamic = "force-dynamic"

// Fetch users directly from the database using connectDB1
async function getUsers() {
  try {
    // Use connectDB1 to ensure we're using the same database as login/signup
    await connectDB1()

    // Get the User model with the correct connection
    const UserModel = await getUserModel()

    // Fetch all users from the correct database
    const users = await UserModel.find({}).select("-password").sort({ createdAt: -1 })

    return users.map((user, index) => ({
      id: user._id.toString(),
      sno: index + 1,
      name: user.name,
      email: user.email,
      role: user.type,
    }))
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export default async function UsersPage() {
  const currentUser = await getCurrentUser()

  /*if (!currentUser) {
    return redirect("/login")
  }

  if (currentUser.type !== "admin") {
    return redirect("/")
  }*/

  const users = await getUsers()

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">User Management</h1>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <Suspense fallback={<div>Loading users...</div>}>
          <UserTable users={users} />
        </Suspense>
      </div>
    </div>
  )
}
