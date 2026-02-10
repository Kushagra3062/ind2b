import CategoryProductsPage from "@/components/categories/category-products-page"

interface CategoryPageProps {
  params: Promise<{
    category: string
  }>
  searchParams: Promise<{
    subcategory?: string
    sortBy?: string
    sortOrder?: string
    page?: string
  }>
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params
  const search = await searchParams

  const decodedCategory = decodeURIComponent(category)

  return (
    <div className="min-h-screen">
      <CategoryProductsPage
        category={decodedCategory}
        subcategory={search.subcategory}
        sortBy={search.sortBy}
        sortOrder={search.sortOrder}
        page={search.page}
      />
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)

  return {
    title: `${decodedCategory} Products - Shop Now`,
    description: `Browse our wide selection of ${decodedCategory} products. Find the best deals and quality items.`,
  }
}
