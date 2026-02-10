"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { SectionSkeleton } from "@/components/layout/section-skeleton"

const FeatureCard = dynamic(() => import("@/components/layout/features-section"), {
  loading: () => <SectionSkeleton type="features" />,
  ssr: false,
})

export function LazyFeatureCard() {
  return (
    <Suspense fallback={<SectionSkeleton type="features" />}>
      <FeatureCard />
    </Suspense>
  )
}
