import { LazySection } from "@/components/layout/lazy-section"
import { SectionSkeleton } from "@/components/layout/section-skeleton"
import { LazySimpleSlider } from "@/components/home/lazy-simple-slider"
import { LazyProductGrid } from "@/components/layout/lazy-product-grid"
import { LazyFeatureCard } from "@/components/layout/lazy-feature-card"
import { LazyPromotionSection } from "@/components/layout/lazy-promotion-section"
import PromotionalBanner from "@/components/layout/promotional-banner"
import CategoryGrid from "@/components/categories/category-grid"
import DeliveryPoster from "@/components/layout/delivery-poster"
import IdlePopup from "@/components/layout/idle-popup"
import AdvertisementPreloader from "@/components/layout/advertisement-preloader"
import SingleAdvertisement from "@/components/layout/single-advertisement"
import SellerSignupOffer from "@/components/home/seller-signup-offer"
import { ErrorBoundary } from "@/components/error-boundary"

export const revalidate = 1200 // 20 minutes in seconds

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Load immediately with highest priority - NO lazy loading for critical content */}
      <ErrorBoundary>
        <LazySimpleSlider />
      </ErrorBoundary>

      <ErrorBoundary>
        <IdlePopup />
      </ErrorBoundary>

      <ErrorBoundary>
        <AdvertisementPreloader />
      </ErrorBoundary>

      <ErrorBoundary>
        <SellerSignupOffer />
      </ErrorBoundary>

      {/* Brand Carousel - Reduced delay and optimized threshold 
      <LazySection delay={50} threshold={0.1} rootMargin="50px" fallback={<SectionSkeleton type="carousel" />}>
        <LazyBrandCarousel />
      </LazySection> */}

      {/* Category Grid - Optimized loading parameters */}
      <ErrorBoundary>
        <LazySection delay={75} threshold={0.1} rootMargin="75px" fallback={<SectionSkeleton type="grid" />}>
          <CategoryGrid />
        </LazySection>
      </ErrorBoundary>

      {/* Delivery Poster - Reduced delay */}
      <ErrorBoundary>
        <LazySection delay={100} threshold={0.2} rootMargin="100px" fallback={<SectionSkeleton type="features" />}>
          <DeliveryPoster />
        </LazySection>
      </ErrorBoundary>

      {/* Product Grid - Optimized for faster loading */}
      <ErrorBoundary>
        <LazySection delay={150} threshold={0.1} rootMargin="150px" fallback={<SectionSkeleton type="grid" />}>
          <LazyProductGrid />
        </LazySection>
      </ErrorBoundary>

      {/* Promotional Banner - Reduced delay */}
      <ErrorBoundary>
        <LazySection delay={125} threshold={0.2} rootMargin="100px" fallback={<SectionSkeleton type="features" />}>
          <PromotionalBanner />
        </LazySection>
      </ErrorBoundary>

      {/* Promotion Section - Optimized loading */}
      <ErrorBoundary>
        <LazySection delay={175} threshold={0.2} rootMargin="125px" fallback={<SectionSkeleton type="features" />}>
          <LazyPromotionSection />
        </LazySection>
      </ErrorBoundary>

      {/* Features Section - Load last with minimal delay */}
      <ErrorBoundary>
        <LazySection delay={100} threshold={0.2} rootMargin="100px" fallback={<SectionSkeleton type="features" />}>
          <LazyFeatureCard />
        </LazySection>
      </ErrorBoundary>

      <ErrorBoundary>
        <div className="container mx-auto px-4 py-6">
          <SingleAdvertisement position="bottomofhomepage" className="max-w-6xl mx-auto" />
        </div>
      </ErrorBoundary>
    </main>
  )
}
