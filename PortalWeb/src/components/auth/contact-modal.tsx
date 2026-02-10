"use client"

import { X, Phone, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  type: "support" | "customer-care"
}

export function ContactModal({ isOpen, onClose, type }: ContactModalProps) {
  if (!isOpen) return null

  const title = type === "support" ? "Support" : "Customer Care"
  const description =
    type === "support"
      ? "Need help with technical issues or account problems?"
      : "Have questions about our products or services?"

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#1a0b2e] to-[#16213e] rounded-2xl shadow-2xl w-full max-w-md mx-auto border border-purple-500/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div>
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            <p className="text-gray-300 text-sm mt-1">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contact Information */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Phone className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Phone Support</h3>
                <p className="text-gray-300 text-sm">Call us for immediate help</p>
              </div>
            </div>
            <div
              className="bg-black/20 rounded-lg p-4 border border-gray-600/30 cursor-pointer hover:bg-black/30 transition-colors"
              onClick={() => {
                navigator.clipboard.writeText("+91 80826 22781")
                // You can add a toast notification here if needed
              }}
            >
              <p className="text-white text-center font-mono text-2xl font-bold tracking-wider">+91 80826 22781</p>
              <p className="text-gray-400 text-center text-xs mt-1">Tap to copy or call manually</p>
            </div>
          </div>
          

          {/* Additional Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-gray-300">
              <MessageCircle className="w-4 h-4 text-purple-400" />
              <span className="text-sm">Immediate assistance available</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <Phone className="w-4 h-4 text-green-400" />
              <span className="text-sm">Available Monday - Friday, 9 AM - 6 PM</span>
            </div>
          </div>

          {/* Action Buttons */}
          
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-200 text-xs text-center">
              💡 For faster support, please have your account details ready when you call.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
