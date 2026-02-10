// This is a utility file to document which pages need dynamic exports
// All pages that use getCurrentUser or access cookies need this export

export const PAGES_REQUIRING_DYNAMIC_EXPORT = [
  // Seller pages
  "app/seller/light-onboarding/page.tsx",
  "app/seller/help/page.tsx",
  "app/seller/orders/page.tsx",
  "app/seller/products/page.tsx",
  "app/seller/profile/page.tsx",
  "app/seller/quotations/page.tsx",
  "app/seller/reviews/page.tsx",

  // Customer dashboard pages
  "app/dashboard/page.tsx",
  "app/dashboard/address/page.tsx",
  "app/dashboard/cart/page.tsx",
  "app/dashboard/orders/page.tsx",
  "app/dashboard/quotations/page.tsx",
  "app/dashboard/wishlist/page.tsx",
  "app/dashboard/password/page.tsx",

  // Public pages that check auth
  "app/categories/page.tsx",
  "app/cart/page.tsx",
  "app/checkout/page.tsx",
  "app/checkout/success/page.tsx",
  "app/contact-us/page.tsx",
  "app/feedback/page.tsx",
  "app/shipping-policy/page.tsx",

  // Debug pages
  "app/debug/razorpay/page.tsx",
  "app/debug/test-data/page.tsx",

  // Admin pages
  "app/admin/users/page.tsx",
]

// Add this export to the top of each page file:
// export const dynamic = 'force-dynamic'
