"use client"

import { lazy, Suspense } from "react"

const FeaturedCategories = lazy(() => import("./featured-categories"))

function FeaturedCategoriesSkeleton() {
  return (
    <section className="w-full px-4 py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="h-8 bg-gray-200 rounded w-80 mx-auto animate-pulse mb-4" />
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="aspect-[4/3] bg-gray-200 rounded-lg animate-pulse" />
            ))}
        </div>
      </div>
    </section>
  )
}

export default function LazyFeaturedCategories() {
  return (
    <Suspense fallback={<FeaturedCategoriesSkeleton />}>
      <FeaturedCategories />
    </Suspense>
  )
}
