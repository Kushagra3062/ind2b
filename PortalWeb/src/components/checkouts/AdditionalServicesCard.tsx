"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Warehouse, Truck } from "lucide-react"

interface AdditionalServicesProps {
  onSubmit: (warehouseNeeded: boolean, logisticsNeeded: boolean) => void
  disabled?: boolean
  initialValues?: {
    warehouseNeeded: boolean
    logisticsNeeded: boolean
  }
}

const AdditionalServicesCard: React.FC<AdditionalServicesProps> = ({ onSubmit, disabled = false, initialValues }) => {
  const [warehouseNeeded, setWarehouseNeeded] = useState(initialValues?.warehouseNeeded || false)
  const [logisticsNeeded, setLogisticsNeeded] = useState(initialValues?.logisticsNeeded || false)

  // Update state when initialValues change
  useEffect(() => {
    if (initialValues) {
      setWarehouseNeeded(initialValues.warehouseNeeded)
      setLogisticsNeeded(initialValues.logisticsNeeded)
    }
  }, [initialValues])

  const handleSubmit = () => {
    onSubmit(warehouseNeeded, logisticsNeeded)
  }

  return (
    <div
      className={`p-6 bg-white rounded-lg shadow-md border border-gray-200 ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      

      {/* Show current selections at the top if any are selected */}
      {(warehouseNeeded || logisticsNeeded) && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
          <h3 className="text-sm font-medium text-orange-800 mb-2">Your Current Selections:</h3>
          <ul className="text-sm text-gray-700">
            {warehouseNeeded && (
              <li className="flex items-center">
                <Warehouse className="w-4 h-4 mr-2 text-orange-500" />
                Warehouse Service: <span className="font-medium ml-1">Selected</span>
              </li>
            )}
            {logisticsNeeded && (
              <li className="flex items-center mt-1">
                <Truck className="w-4 h-4 mr-2 text-orange-500" />
                Logistics Service: <span className="font-medium ml-1">Selected</span>
              </li>
            )}
            {!warehouseNeeded && !logisticsNeeded && <li>No additional services selected</li>}
          </ul>
        </div>
      )}

      <p className="text-gray-600 mb-6">
        Select any additional services you may need for your products. These services are optional but can help you
        manage your inventory and shipping more efficiently.
      </p>

      <div className="space-y-6">
        {/* Warehouse Service */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="warehouse"
              type="checkbox"
              checked={warehouseNeeded}
              onChange={(e) => setWarehouseNeeded(e.target.checked)}
              className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-orange-300"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="warehouse" className="font-medium text-gray-900 flex items-center">
              <Warehouse className="w-5 h-5 mr-2 text-orange-500" />
              Warehouse Service
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Store your products in our secure warehouses. We'll handle inventory management and order fulfillment.
            </p>
          </div>
        </div>

        {/* Logistics Service */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="logistics"
              type="checkbox"
              checked={logisticsNeeded}
              onChange={(e) => setLogisticsNeeded(e.target.checked)}
              className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-orange-300"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="logistics" className="font-medium text-gray-900 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-orange-500" />
              Logistics Service
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Let us handle the shipping and delivery of your products. We'll ensure they reach your customers safely
              and on time.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSubmit}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default AdditionalServicesCard
