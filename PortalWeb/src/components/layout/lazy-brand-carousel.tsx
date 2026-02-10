"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { SectionSkeleton } from "@/components/layout/section-skeleton"

const BrandCarousel = dynamic(
  () => import("@/components/layout/brand-carousel").then((mod) => ({ default: mod.BrandCarousel })),
  {
    loading: () => <SectionSkeleton type="carousel" />,
    ssr: false,
  },
)

export function LazyBrandCarousel() {
  return (
    <Suspense fallback={<SectionSkeleton type="carousel" />}>
      <BrandCarousel />
    </Suspense>
  )
}
