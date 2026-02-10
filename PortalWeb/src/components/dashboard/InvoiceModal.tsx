"use client"

import { useRef, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { Download, X } from 'lucide-react'
import Image from "next/image"
import type { Order } from "./OrdersPage"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface InvoiceModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

export function InvoiceModal({ order, isOpen, onClose }: InvoiceModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!order || !invoiceRef.current) return

    setIsDownloading(true)

    try {
      const element = invoiceRef.current
      
      const parentContainer = element.parentElement
      if (parentContainer) {
        parentContainer.style.maxHeight = 'none'
        parentContainer.style.height = 'auto'
        parentContainer.style.overflow = 'visible'
      }
      
      // Wait for layout to update
      await new Promise(resolve => setTimeout(resolve, 100))

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowHeight: element.scrollHeight, // Capture full scrollable height
      })

      // Restore original styles
      if (parentContainer) {
        parentContainer.style.maxHeight = ''
        parentContainer.style.height = ''
        parentContainer.style.overflow = ''
      }

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= 297

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= 297
      }

      const downloadTime = format(new Date(), "dd MMM yyyy, hh:mm a")
      pdf.setFontSize(8)
      pdf.setTextColor(128, 128, 128)
      pdf.text(`Downloaded on: ${downloadTime}`, 10, pdf.internal.pageSize.getHeight() - 5)

      const invoiceNumber = `INV-${order.id.substring(0, 8).toUpperCase()}`
      pdf.save(`${invoiceNumber}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("There was an error generating the PDF. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  if (!order) return null

  const invoiceDate = new Date(order.date)
  const invoiceNumber = `INV-${order.id.substring(0, 8).toUpperCase()}`
  const dueDate = new Date(invoiceDate)
  dueDate.setDate(dueDate.getDate() + 15) // Due date is 15 days after invoice date

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">Invoice #{invoiceNumber}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-y-auto p-6" ref={invoiceRef} id="invoice-content">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">INVOICE</h1>
              <p className="text-gray-600 mt-1">#{invoiceNumber}</p>
            </div>
            <div className="text-right">
              <div className="h-28 w-32 relative mb-1">
                <Image 
                  src="/ind2b.webp" 
                  alt="Company Logo" 
                  fill
                  priority
                  className="object-contain" 
                />
              </div>
              <p className="text-sm text-gray-600">IND2B</p>
              <p className="text-sm text-gray-600">product.circ@i10ai.com</p>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">BILL TO</h3>
              {order.shippingDetails && (
                <div className="text-sm">
                  <p className="font-medium">
                    {order.shippingDetails.firstName} {order.shippingDetails.lastName}
                  </p>
                  <p>{order.shippingDetails.email}</p>
                  <p>{order.shippingDetails.address}</p>
                  <p>
                    {order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.zipCode}
                  </p>
                  <p>{order.shippingDetails.country}</p>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">INVOICE DATE</h3>
                <p className="text-sm">{format(invoiceDate, "MMMM d, yyyy")}</p>
              </div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">DUE DATE</h3>
                <p className="text-sm">{format(dueDate, "MMMM d, yyyy")}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-1">STATUS</h3>
                <p className="text-sm font-medium text-green-600">{order.status || "Paid"}</p>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <div className="bg-gray-100 rounded-t-md p-3 grid grid-cols-12 gap-2 text-sm font-medium text-gray-600">
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            <div className="border-x border-b rounded-b-md overflow-hidden">
              {order.items.map((item, index) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-12 gap-2 p-3 text-sm ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <div className="col-span-6 flex items-center gap-3">
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="col-span-2 text-right">INR {item.price.toFixed(2)}</div>
                  <div className="col-span-2 text-right">{item.quantity}</div>
                  <div className="col-span-2 text-right font-medium">INR {(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-full max-w-xs">
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-medium">INR {order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Tax</span>
                <span className="text-sm font-medium">INR {order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Shipping</span>
                <span className="text-sm font-medium">INR {order.shipping || 0}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between py-2">
                <span className="font-medium">Total</span>
                <span className="font-bold text-emerald-900">INR {(order.subtotal + order.tax + (order.shipping || 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">PAYMENT INFORMATION</h3>
            <div className="text-sm">
              <p>
                <span className="font-medium">Method:</span> {order.paymentMethod}
              </p>
              <p>
                <span className="font-medium">Order ID:</span> {order.id}
              </p>
              <p>
                <span className="font-medium">Date:</span> {format(invoiceDate, "MMMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">NOTES</h3>
            <p className="text-sm text-gray-600">
              Thank you for your business! If you have any questions about this invoice, please contact our customer
              support team at product.circ@i10ai.com.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 mt-12">
            <p>This is a computer-generated invoice and does not require a signature.</p>
            <p className="mt-1">© {new Date().getFullYear()} IND2B. All rights reserved.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t flex justify-end gap-2 sticky bottom-0 bg-white">
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="gap-1 bg-emerald-900 hover:bg-emerald-800"
          >
            {isDownloading ? (
              <span className="flex items-center gap-1">
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Invoice
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
