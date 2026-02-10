import ProductTable from "@/components/seller/products/product-table"

export default function ProductPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-semibold mb-6">Product Management</h1>
      <ProductTable />
    </div>
  )
}
