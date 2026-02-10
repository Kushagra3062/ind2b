import { Skeleton } from "@/components/ui/skeleton"

interface SectionSkeletonProps {
  type: "slider" | "carousel" | "grid" | "features"
  className?: string
}

export function SectionSkeleton({ type, className = "" }: SectionSkeletonProps) {
  switch (type) {
    case "slider":
      return (
        <div className={className}>
          <div className="relative w-full h-[400px] md:h-[500px] bg-gray-100">
            <Skeleton className="w-full h-full" />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="w-3 h-3 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      )

    case "carousel":
      return (
        <div className={className}>
          <div className="py-8 px-4">
            <div className="max-w-7xl mx-auto">
              <Skeleton className="h-8 w-48 mb-6 mx-auto" />
              <div className="flex space-x-4 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="w-32 h-20 flex-shrink-0" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )

    case "grid":
      return (
        <div className={className}>
          <div className="py-12 px-4">
            <div className="max-w-7xl mx-auto">
              <Skeleton className="h-10 w-64 mb-8 mx-auto" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="w-full h-48" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )

    case "features":
      return (
        <div className={className}>
          <div className="py-16 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <Skeleton className="h-10 w-64 mb-4 mx-auto" />
              <Skeleton className="h-6 w-96 mb-12 mx-auto" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="text-center space-y-4">
                    <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                    <Skeleton className="h-6 w-32 mx-auto" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )

    default:
      return <Skeleton className={`w-full h-64 ${className}`} />
  }
}
