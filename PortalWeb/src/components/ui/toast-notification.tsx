"use client"

import { useEffect, useState } from "react"
import { useToast, type Toast as ToastType } from "./use-toast"
import { X } from "lucide-react"

export function ToastNotification() {
  const { toasts, dismiss } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 w-full max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  )
}

function Toast({ toast, onDismiss }: { toast: ToastType; onDismiss: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transform transition-all duration-300 ease-in-out">
      <div className="p-4 flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{toast.title}</h3>
          {toast.description && <p className="mt-1 text-sm text-gray-500">{toast.description}</p>}
        </div>
        <button onClick={onDismiss} className="text-gray-400 hover:text-gray-500 focus:outline-none">
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
