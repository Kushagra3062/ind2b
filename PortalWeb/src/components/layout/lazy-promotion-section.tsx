import { lazy } from "react"

const PromotionSection = lazy(() => import("./promotion-section"))

export function LazyPromotionSection() {
  return <PromotionSection />
}
