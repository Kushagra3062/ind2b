"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, X } from "lucide-react"

interface OnboardingCompletionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OnboardingCompletionModal({ isOpen, onClose }: OnboardingCompletionModalProps) {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleCompleteOnboarding = async () => {
    setIsRedirecting(true)
    // Close the modal first
    onClose()
    // Then redirect
    router.push("/seller/profile")
  }

  const handleDismiss = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal={true}>
      <DialogContent 
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Complete Your Profile
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You've completed the basic setup! To access all seller features and start selling, 
            please complete your full profile with detailed business information.
          </p>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>What's next?</strong> Complete your business details, contact information, 
              bank details, and upload required documents.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleCompleteOnboarding} 
              disabled={isRedirecting}
              className="flex-1"
            >
              {isRedirecting ? "Redirecting..." : "Complete Profile"}
            </Button>
            <Button variant="outline" onClick={handleDismiss}>
              Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}