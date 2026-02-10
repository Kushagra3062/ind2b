"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapPin, Package, Truck } from "lucide-react"

interface OrderDetailProps {
  orderId: string
}

export default function OrderDetail({ orderId }: OrderDetailProps) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Order ID: ORD-{orderId}</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="text-red-500 hover:text-red-600">
            Reject
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600">Approve</Button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Seller Details */}
        <Card>
          <CardHeader>
            <CardTitle>Seller Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="grid grid-cols-2">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm font-medium">ABC Industry Pvt Ltd</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm text-muted-foreground">Phone Number</span>
              <span className="text-sm font-medium">+91-2543525243</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm text-muted-foreground">Email Id</span>
              <span className="text-sm font-medium">abc.example.com</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm text-muted-foreground">Order Placed Date</span>
              <span className="text-sm font-medium">10th Dec 2024 02:00PM</span>
            </div>
          </CardContent>
        </Card>

        {/* Buyer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Buyer Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="grid grid-cols-2">
              <span className="text-sm text-muted-foreground">Company Name</span>
              <span className="text-sm font-medium">ABC Industry Pvt Ltd</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm font-medium">John Doe</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm text-muted-foreground">Email Id</span>
              <span className="text-sm font-medium">abc.example.com</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm text-muted-foreground">Phone Number</span>
              <span className="text-sm font-medium">+91-0288283832</span>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="grid grid-cols-2">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm font-medium">₹32,992</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm text-muted-foreground">Discount</span>
              <span className="text-sm font-medium">₹499</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm text-muted-foreground">Shipping</span>
              <span className="text-sm font-medium">₹242</span>
            </div>
            <div className="grid grid-cols-2 pt-2 border-t">
              <span className="text-sm font-medium">Total</span>
              <span className="text-sm font-medium">₹33,242</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Added Products Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Aluminum Sheets", sku: "SKU-123-MET", qty: 102, price: 423, total: 14295 },
                  { name: "Glass Panels", sku: "SKU-123-MET", qty: 102, price: 423, total: 14295 },
                  { name: "Paper Package", sku: "SKU-123-MET", qty: 102, price: 423, total: 14295 },
                  { name: "Aluminium Sheets", sku: "SKU-123-MET", qty: 102, price: 423, total: 14295 },
                ].map((product, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.qty}</TableCell>
                    <TableCell>₹{product.price}</TableCell>
                    <TableCell>₹{product.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-start gap-2">
              <Truck className="w-5 h-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Carrier Name:</p>
                <p className="text-muted-foreground">Ekart Logistics Pvt Ltd</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Package className="w-5 h-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Estimated Delivery Date:</p>
                <p className="text-muted-foreground">24th Dec 2024</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Package className="w-5 h-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Tracking ID:</p>
                <p className="text-muted-foreground">27278653</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Address:</p>
                <p className="text-muted-foreground">
                  Santacruz Mansions, 2nd Floor
                  <br />
                  Santacruz (E)
                  <br />
                  Mumbai - 400055
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-8 pb-6">
              <div className="absolute left-0 top-2 h-full w-0.5 bg-muted" />
              {[
                { date: "8th Dec 2024", status: "Order Placed", done: true },
                { date: "10th Dec 2024", status: "Payment Confirmed", done: true },
                { date: "12th Dec 2024", status: "Processing", done: true },
                { date: "15th Dec 2024", status: "Dispatched", done: false },
                { date: "17th Dec 2024", status: "Delivered", done: false },
              ].map((step, i) => (
                <div key={i} className="mb-8 last:mb-0">
                  <div className="absolute left-0 transform -translate-x-1/2">
                    <div className={`w-3 h-3 rounded-full ${step.done ? "bg-primary" : "bg-muted"}`} />
                  </div>
                  <p className="font-medium">{step.date}</p>
                  <p className="text-sm text-muted-foreground">{step.status}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
