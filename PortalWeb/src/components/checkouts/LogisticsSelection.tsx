"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"

interface LogisticsOption {
  id: string
  name: string
  logo: string
  provider: string
  charge: number
}

interface LogisticsSelectionProps {
  onLogisticsSelect: (logisticsId: string | null) => void
  disabled?: boolean
  initialLogistics?: string | null
}

const logisticsOptions: LogisticsOption[] = [
  {
    id: "bluedart1",
    name: "Blue Dart",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Blue Dart",
    charge: 6000,
  },
  {
    id: "delhivery1",
    name: "Delhivery",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Delhivery",
    charge: 6000,
  },
  {
    id: "fedex1",
    name: "FedEx",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "FedEx",
    charge: 6000,
  },
  {
    id: "ekart1",
    name: "Ekart",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Ekart",
    charge: 6000,
  },
  {
    id: "ecomexpress1",
    name: "Ecom Express",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Ecom Express",
    charge: 6000,
  },
  {
    id: "dhl1",
    name: "DHL",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "DHL",
    charge: 6000,
  },
  {
    id: "shadowfax1",
    name: "Shadowfax",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Shadowfax",
    charge: 6000,
  },
  {
    id: "gati1",
    name: "GATI",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "GATI",
    charge: 6000,
  },
  {
    id: "safeexpress1",
    name: "Safeexpress",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Safeexpress",
    charge: 6000,
  },
  {
    id: "fmlogistic1",
    name: "FM Logistic",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "FM Logistic",
    charge: 6000,
  },
  {
    id: "dtdc1",
    name: "DTDC",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "DTDC",
    charge: 6000,
  },
  {
    id: "xpressbees1",
    name: "Xpressbees",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Xpressbees",
    charge: 6000,
  },
]

const LogisticsSelection: React.FC<LogisticsSelectionProps> = ({
  onLogisticsSelect,
  disabled = false,
  initialLogistics = null,
}) => {
  const [selectedLogistics, setSelectedLogistics] = useState<string | null>(initialLogistics)

  // Update selected logistics when initialLogistics changes
  useEffect(() => {
    if (initialLogistics) {
      setSelectedLogistics(initialLogistics)
    }
  }, [initialLogistics])

  const handleLogisticsSelect = (logisticsId: string) => {
    setSelectedLogistics(logisticsId)
  }

  // Find the selected logistics option
  const selectedOption = logisticsOptions.find((option) => option.id === selectedLogistics)

  return (
    <div
      className={`p-6 bg-white rounded-lg shadow-md border border-gray-200 ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Choose a Logistic Partner</h2>
        <div className="border-b-2 border-blue-500 w-64 mx-auto mb-4"></div>
      </div>

      {selectedLogistics && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h3 className="font-medium text-orange-800 mb-2">Selected Logistics Partner</h3>
          <div className="flex items-center">
            {selectedOption && (
              <>
                <div className="w-12 h-12 mr-4 flex items-center justify-center">
                  <Image
                    src={selectedOption.logo || "/placeholder.svg"}
                    alt={selectedOption.name}
                    width={48}
                    height={48}
                  />
                </div>
                <div>
                  <p className="font-medium">{selectedOption.provider}</p>
                  <p className="text-sm text-orange-600">₹{selectedOption.charge.toFixed(2)}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Demo Banner */}
      <div className="bg-yellow-400 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Get a Free Demo</h3>
        </div>
        <div className="flex-shrink-0">
          <Image
            src="/placeholder.svg?height=80&width=120"
            alt="Logistics truck"
            width={120}
            height={80}
            className="rounded-lg"
          />
        </div>
        <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
          Request Demo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {logisticsOptions.map((logistics) => (
          <div
            key={logistics.id}
            className={`border-2 rounded-lg p-4 flex flex-col items-center transition-all ${
              selectedLogistics === logistics.id
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 hover:border-orange-300"
            }`}
          >
            <div className="w-16 h-16 mb-3 flex items-center justify-center">
              <Image src={logistics.logo || "/placeholder.svg"} alt={logistics.name} width={60} height={60} />
            </div>
            <h3 className="text-sm font-medium mb-1">{logistics.provider}</h3>
            <p className="text-orange-600 font-medium text-sm mb-1">₹{logistics.charge.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mb-3">For 500 products</p>
            <button
              onClick={() => handleLogisticsSelect(logistics.id)}
              className={`px-4 py-1 rounded text-sm font-medium ${
                selectedLogistics === logistics.id
                  ? "bg-orange-500 text-white"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
            >
              {selectedLogistics === logistics.id ? "Selected" : "Select"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => onLogisticsSelect(selectedLogistics)}
          disabled={!selectedLogistics}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  )
}

export default LogisticsSelection
