import { connectProfileDB } from "@/lib/profileDb"
import { notFound } from "next/navigation"
import mongoose from "mongoose"
import ProductDescription from "./product-description"
import ProductReviews from "./product-reviews"
import ProductActions from "./product-actions"
import { Toaster } from "react-hot-toast"
import getReviewModel from "@/models/profile/review"
import RequestQuoteButton from "@/components/product/request-quote-button"
import SponsoredAdvertisement from "@/components/product/sponsored-advertisement"
import { extractProductId } from "@/lib/utils"
import { getDisplayPrice } from "@/lib/price-helper" // Import price helper

// Define the product interface
interface Product {
  model: string
  _id: string
  product_id: number
  title: string
  description?: string
  price: number
  final_price?: number // Added final_price field
  originalPrice: number
  discount?: number
  gst?: number
  stock: number
  SKU: string
  image_link?: string
  additional_images?: string[]
  category_name?: string
  seller_name?: string
  seller_id?: string
  emailId?: string
  location?: string
  rating?: number
  reviewCount?: number
  units?: string
}

// Define the review interface
interface Review {
  _id: string
  userId: string
  orderId: string
  product_id: string
  title: string
  rating: number
  review: string
  status: string
  isVerifiedPurchase: boolean
  createdAt: Date
  updatedAt: Date
}

// Function to calculate the final selling price with GST and discount
const calculateFinalPrice = (basePrice: number, gst = 0, discount = 0) => {
  // Step 1: Add GST to base price
  const gstAmount = (basePrice * gst) / 100
  const priceWithGST = basePrice + gstAmount

  // Step 2: Apply discount to price with GST
  const discountAmount = (priceWithGST * discount) / 100
  const finalPrice = priceWithGST - discountAmount

  return {
    basePrice,
    gstAmount,
    priceWithGST,
    discountAmount,
    finalPrice,
  }
}

// Fetch product reviews from MongoDB PROFILE_DB
async function getProductReviews(
  productId: string,
): Promise<{ reviews: Review[]; averageRating: number; totalReviews: number }> {
  let connection
  try {
    connection = await connectProfileDB()
    console.log(`Fetching reviews for product ID: ${productId}`)

    const ReviewModel = getReviewModel(connection)

    const reviews = await ReviewModel.find({
      product_id: productId,
      status: "approved",
    })
      .select("userId orderId product_id title rating review status isVerifiedPurchase createdAt updatedAt")
      .sort({ createdAt: -1 })
      .limit(50) // Limit initial reviews for faster page load
      .lean()
      .exec()

    const totalReviews = reviews.length
    let averageRating = 0

    if (totalReviews > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      averageRating = Math.round((totalRating / totalReviews) * 10) / 10
    }

    console.log(`Found ${totalReviews} reviews with average rating: ${averageRating}`)

    return {
      reviews: reviews.map((review) => ({
        _id: review._id.toString(),
        userId: review.userId,
        orderId: review.orderId,
        product_id: review.product_id,
        title: review.title,
        rating: review.rating,
        review: review.review,
        status: review.status,
        isVerifiedPurchase: review.isVerifiedPurchase,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      })),
      averageRating,
      totalReviews,
    }
  } catch (error) {
    console.error("Error fetching product reviews:", error)
    return { reviews: [], averageRating: 0, totalReviews: 0 }
  }
}

// Fetch product data from MongoDB PROFILE_DB
async function getProductById(id: string): Promise<Product | null> {
  let connection
  try {
    connection = await connectProfileDB()
    console.log(`Connected to PROFILE_DB, fetching product with ID: ${id}`)

    const ProductModel =
      connection.models.Product ||
      connection.model(
        "Product",
        new mongoose.Schema({
          product_id: Number,
          title: String,
          description: String,
          price: Number,
          final_price: Number,
          originalPrice: Number,
          discount: Number,
          gst: Number,
          stock: Number,
          SKU: String,
          image_link: String,
          additional_images: [String],
          category_name: String,
          seller_name: String,
          seller_id: String,
          emailId: String,
          location: String,
          rating: Number,
          reviewCount: Number,
          units: String,
        }),
      )

    if (!ProductModel) {
      console.error("Product model not found in PROFILE_DB connection")
      return null
    }

    const productId = Number.parseInt(id, 10)
    console.log(`Searching for product with product_id: ${productId}`)

    let productDoc = null

    if (!isNaN(productId)) {
      productDoc = await ProductModel.findOne({ product_id: productId })
        .select(
          "product_id title description price final_price originalPrice discount gst stock SKU image_link additional_images category_name seller_name seller_id emailId location rating reviewCount units",
        )
        .lean()
        .exec()
    }

    if (!productDoc) {
      console.log(`Product not found by product_id: ${productId}, trying _id`)
      if (mongoose.Types.ObjectId.isValid(id)) {
        productDoc = await ProductModel.findById(id)
          .select(
            "product_id title description price final_price originalPrice discount gst stock SKU image_link additional_images category_name seller_name seller_id emailId location rating reviewCount units",
          )
          .lean()
          .exec()
      }
    }

    if (!productDoc) {
      console.log(`No product found with ID: ${id}`)
      return null
    }

    const doc = Array.isArray(productDoc) ? productDoc[0] : productDoc

    if (!doc) {
      return null
    }

    const product: Product = {
      _id: doc._id ? doc._id.toString() : "",
      product_id: doc.product_id || 0,
      title: doc.title || "Untitled Product",
      description: doc.description || "",
      price: doc.price || 0,
      final_price: doc.final_price,
      originalPrice: doc.originalPrice || doc.price,
      discount: doc.discount || 0,
      gst: doc.gst || 0,
      stock: doc.stock || 0,
      SKU: doc.SKU || "",
      image_link: doc.image_link,
      additional_images: doc.additional_images || [],
      category_name: doc.category_name,
      seller_name: doc.seller_name,
      seller_id: doc.seller_id || doc.emailId || doc.product_id?.toString(),
      emailId: doc.emailId,
      location: doc.location,
      rating: doc.rating,
      reviewCount: doc.reviewCount || 0,
      units: doc.units || "units",
      model: "",
    }

    console.log(`Product found: ${product.title}`)
    return product
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

// Product detail page component - Now a proper server component with ISR
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    // Extract the ID parameter - must await params in Next.js 15
    const { id } = await params

    if (!id) {
      console.error("No ID parameter provided")
      return notFound()
    }

    const productId = extractProductId(id)

    const [product, reviewData] = await Promise.all([getProductById(productId), getProductReviews(productId)])

    // If product not found, show 404 page
    if (!product) {
      console.log(`Product not found, returning 404`)
      return notFound()
    }

    const displayPrice = getDisplayPrice(product.price, product.final_price)

    // Calculate the final price with GST and discount using display price
    const priceCalculation = calculateFinalPrice(displayPrice, product.gst, product.discount)

    // Collect all available product images
    const productImages: string[] = []

    // Add main image if available
    if (product.image_link) {
      productImages.push(product.image_link)
    }

    // Add additional images if available
    if (product.additional_images && product.additional_images.length > 0) {
      productImages.push(...product.additional_images)
    }

    // If no images are available, add a single placeholder
    if (productImages.length === 0) {
      productImages.push("/placeholder.svg?height=600&width=600")
    }

    // Default description if none provided
    const defaultDesc =
      "Kirloskar is a well-known brand which provides a highly efficient collection of water pumps which is lightweight, easy to handle, and also ups compatible. This powerful high flow rate pump is designed and manufactured to deal with large volumes. It can be used for domestic purposes in bungalows, hotels, farmhouses, etc. Also, it is widely.."

    const description = product.description || defaultDesc

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Toast container for notifications */}
        <Toaster />

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column - Product Image (4 columns) */}
          <div className="lg:col-span-4">
            <div className="sticky top-[80px] z-10">
              <div className="relative">
                {/* Warranty Badge */}
                <div className="absolute top-4 left-4 z-20">
                  <div className="bg-black text-white px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    WARRANTY 6 MONTHS GUARANTEE
                  </div>
                </div>

                {/* Product Actions Component */}
                <ProductActions
                  productId={productId}
                  title={product.title}
                  price={priceCalculation.finalPrice}
                  imageUrl={productImages[0] || "/placeholder.svg"}
                  discount={product.discount}
                  sellerId={Number(product.seller_id) || Number(product.product_id) || 0}
                  stock={product.stock}
                  units={product.units}
                  productImages={productImages}
                />
              </div>
            </div>
          </div>

          {/* Center Column - Product Details (5 columns) */}
          <div className="lg:col-span-5">
            {/* Product Title */}
            <h1 className="text-2xl font-bold mb-3 leading-tight">{product.title}</h1>

            {/* Ratings */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`h-4 w-4 ${star <= Math.floor(reviewData.averageRating) ? "text-yellow-400" : "text-gray-300"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {reviewData.totalReviews} Ratings & {reviewData.totalReviews} Reviews
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-green-600">₹{priceCalculation.finalPrice.toFixed(2)}</span>
              {product.discount && product.discount > 0 && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    ₹{priceCalculation.priceWithGST.toFixed(2)}
                  </span>
                  <span className="text-lg text-green-500 font-semibold">{product.discount}% off</span>
                </>
              )}
            </div>

            {/* Availability */}
            <p className="text-gray-600 mb-6">
              Available: <span className="font-semibold">{product.stock} pcs</span>
            </p>

            {/* About This Product */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">About This Product</h3>
              <ProductDescription description={description} />
            </div>

            {/* Product Specifications */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Product Specifications</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 bg-gray-50 font-medium w-1/3">Brand</td>
                      <td className="py-3 px-4">{product.seller_name || "circulx_seller_profile_1"}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 bg-gray-50 font-medium">Model</td>
                      <td className="py-3 px-4">Standard Model</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 bg-gray-50 font-medium">SKU</td>
                      <td className="py-3 px-4">{product.SKU || "SKU-ABC-123"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 bg-gray-50 font-medium">Category</td>
                      <td className="py-3 px-4">{product.category_name || "Power Tools"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Need a Better Price section */}
            <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
              <h3 className="text-xl font-semibold mb-3 text-orange-800">Need a Better Price?</h3>
              <p className="text-orange-700 mb-4 leading-relaxed">
                Request a custom quotation from the seller and get the best deal for your requirements.
              </p>
              <RequestQuoteButton
                productId={productId}
                productTitle={product.title}
                sellerId={product.seller_id || product.emailId || product.product_id?.toString() || ""}
                currentPrice={priceCalculation.finalPrice}
              />
            </div>
          </div>

          {/* Right Column - Features & Seller Info (3 columns) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Features Card */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">Free 1 Year Warranty</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 010 2H4a1 1 0 01-1-1v-6a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 100-2h5a1 1 0 011 1v5a1 1 0 01-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">Free Shipping & Fast Delivery</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M9 9a1 1 0 000 2v3a1 1 0 01-1 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">100% Money-back guarantee</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">24/7 Customer support</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">Secure payment method</span>
                </li>
              </ul>
            </div>

            {/* Seller Info Card */}
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  C
                </div>
                <div>
                  <h3 className="font-semibold">{product.seller_name || "circulx_seller_profile_1"}</h3>
                  <p className="text-sm text-gray-600">{product.location || "Delhi"}</p>
                  <p className="text-xs text-gray-500">GST: Not provided</p>
                </div>
              </div>

              {/* Seller Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="h-4 w-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600">0/5 (0 reviews)</span>
              </div>

              {/* Seller Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  TrustSEAL Verified
                </span>
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Leading Supplier
                </span>
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  Verified Exporter
                </span>
                <span className="inline-flex items-center px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
                  Manufacturer
                </span>
              </div>

              {/* Contact Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  View Mobile Number
                </button>
                <button className="border border-teal-500 text-teal-600 hover:bg-teal-50 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Contact Supplier
                </button>
              </div>

              {/* Response Rate */}
              <p className="text-center text-sm text-gray-600">86% Response Rate</p>
            </div>

            {/* Sponsored Advertisement */}
            <SponsoredAdvertisement
              imageUrl="/sell.png"
              linkUrl="https://example.com/business-tools"
              altText="Business Advertisement"
              title="Sponsored"
            />
          </div>
        </div>

        {/* Product Reviews Section */}
        <div className="mt-12">
          <ProductReviews
            reviews={reviewData.reviews}
            averageRating={reviewData.averageRating}
            totalReviews={reviewData.totalReviews}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error rendering product page:", error)
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">Something went wrong</h1>
        <p className="mt-4">We're having trouble loading this product. Please try again later.</p>
      </div>
    )
  }
}

export const revalidate = 300 // Revalidate every 5 minutes

export const dynamicParams = true

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await getProductById(id)

    if (!product) {
      return {
        title: "Product Not Found",
      }
    }

    return {
      title: product.title,
      description: product.description?.slice(0, 160) || `Buy ${product.title} at best price`,
      openGraph: {
        title: product.title,
        description: product.description?.slice(0, 160),
        images: [product.image_link || "/placeholder.svg"],
      },
    }
  } catch (error) {
    return {
      title: "Product",
    }
  }
}
