"use client"

import { Button } from "@/components/ui/button"

interface UserManagementButtonsProps {
  userId: string
  currentType: "admin" | "seller" | "customer"
  onUpdateUserType: (userId: string, newType: "admin" | "seller" | "customer") => void
}

export function UserManagementButtons({ userId, currentType, onUpdateUserType }: UserManagementButtonsProps) {
  return (
    <div className="flex space-x-2">
      <Button
        onClick={() => onUpdateUserType(userId, "admin")}
        disabled={currentType === "admin"}
        variant="outline"
        size="sm"
      >
        Make Admin
      </Button>
      <Button
        onClick={() => onUpdateUserType(userId, "seller")}
        disabled={currentType === "seller"}
        variant="outline"
        size="sm"
      >
        Make Seller
      </Button>
      <Button
        onClick={() => onUpdateUserType(userId, "customer")}
        disabled={currentType === "customer"}
        variant="outline"
        size="sm"
      >
        Make Customer
      </Button>
    </div>
  )
}
