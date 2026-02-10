"use client"

import type React from "react"
import { useState } from "react"

interface AdditionalInfoProps {
  onSubmit: (notes: string) => void
  disabled?: boolean
  initialNotes?: string
}

const AdditionalInfo: React.FC<AdditionalInfoProps> = ({ onSubmit, disabled = false, initialNotes = "" }) => {
  const [notes, setNotes] = useState(initialNotes)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(notes)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-6 bg-white rounded-lg shadow-md border border-gray-200 ${disabled ? "opacity-70 pointer-events-none" : ""}`}
    >
     
      <p className="text-sm text-gray-600 mb-4">
        If you have any special instructions or notes for your order, please enter them below.
      </p>

      <div className="mb-4">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Order Notes (Optional)
        </label>
        <textarea
          id="notes"
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          placeholder="Special instructions for delivery or any other notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
        >
          Continue to Review
        </button>
      </div>
    </form>
  )
}

export default AdditionalInfo
