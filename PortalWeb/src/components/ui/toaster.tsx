"use client"

import { useToast } from "./use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-0 right-0 flex flex-col items-end p-4 space-y-4">
      {toasts.map((toast) => (
        <div key={toast.id} className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
          <h3 className="font-semibold">{toast.title}</h3>
          {toast.description && <p className="text-sm text-gray-500">{toast.description}</p>}
        </div>
      ))}
    </div>
  )
}
