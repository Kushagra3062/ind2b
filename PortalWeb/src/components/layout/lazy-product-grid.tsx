"use client"

import dynamic from "next/dynamic"
import { SectionSkeleton } from "./section-skeleton"

// Dynamically import ProductGrid with optimized loading
const ProductGrid = dynamic(() => import("./product-grid"), {
  ssr: false,
  loading: () => <SectionSkeleton type="grid" />,
})

export function LazyProductGrid() {
  return <ProductGrid />
}
