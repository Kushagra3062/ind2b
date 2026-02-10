export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column - Image Skeleton */}
        <div className="lg:col-span-4">
          <div className="bg-gray-200 rounded-lg h-[400px] w-full mb-4"></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-200 rounded-md h-12"></div>
            <div className="bg-gray-200 rounded-md h-12"></div>
          </div>
        </div>

        {/* Center Column - Details Skeleton */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gray-200 rounded h-8 w-3/4"></div>
          <div className="bg-gray-200 rounded h-6 w-1/2"></div>
          <div className="bg-gray-200 rounded h-10 w-1/3"></div>
          <div className="bg-gray-200 rounded h-6 w-1/4"></div>
          <div className="space-y-2">
            <div className="bg-gray-200 rounded h-4 w-full"></div>
            <div className="bg-gray-200 rounded h-4 w-full"></div>
            <div className="bg-gray-200 rounded h-4 w-3/4"></div>
          </div>
          <div className="bg-gray-200 rounded-lg h-48 w-full"></div>
        </div>

        {/* Right Column - Sidebar Skeleton */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-gray-200 rounded-lg h-64"></div>
          <div className="bg-gray-200 rounded-lg h-48"></div>
        </div>
      </div>
    </div>
  )
}
