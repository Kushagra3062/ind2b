import Image from "next/image"
import type { ProductDetails } from "../../../types/review"

interface ProductDetailsProps {
  product: ProductDetails
}

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6 p-4 sm:p-6 bg-card rounded-lg border">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {product.name} (SKU: {product.sku})
        </h2>
        <div className="space-y-2">
          <div className="flex gap-2">
            <span className="text-sm font-medium">Category:</span>
            <span className="text-sm text-muted-foreground">{product.category}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-sm font-medium">Price Per Unit:</span>
            <span className="text-sm text-muted-foreground">${product.pricePerUnit}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-sm font-medium">Available Stock:</span>
            <span className="text-sm text-muted-foreground">{product.availableStock}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{product.description}</p>
      </div>
      <div className="relative h-[200px] md:h-[300px]">
        <Image src={product.imageUrl || "/placeholder.svg"} alt={product.name} fill className="object-contain" />
      </div>
    </div>
  )
}
