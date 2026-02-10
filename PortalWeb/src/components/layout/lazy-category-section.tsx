"use client"

import { lazy, Suspense } from "react"

const CategorySection = lazy(() => import("./category-section"))

function CategorySectionSkeleton() {
  return (
    <section className="w-full px-4 py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto animate-pulse mb-2" />
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="flex flex-col items-center p-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-gray-200 rounded-full animate-pulse mb-3" />
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            ))}
        </div>
        <div className="text-center mt-8 sm:mt-12">
          <div className="h-12 bg-gray-200 rounded-lg w-48 mx-auto animate-pulse" />
        </div>
      </div>
    </section>
  )
}

export default function LazyCategorySection() {
  return (
    <Suspense fallback={<CategorySectionSkeleton />}>
      <CategorySection />
    </Suspense>
  )
}
