import { event } from "./gtag"

// E-commerce events
export const trackPurchase = (transactionId: string, value: number, currency = "USD", items?: any[]) => {
  event({
    action: "purchase",
    category: "ecommerce",
    label: transactionId,
    value: value,
  })

  // Enhanced ecommerce tracking
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items || [],
    })
  }
}

export const trackAddToCart = (itemId: string, itemName: string, value: number, currency = "USD") => {
  event({
    action: "add_to_cart",
    category: "ecommerce",
    label: `${itemId} - ${itemName}`,
    value: value,
  })

  // Enhanced ecommerce tracking
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "add_to_cart", {
      currency: currency,
      value: value,
      items: [
        {
          item_id: itemId,
          item_name: itemName,
          quantity: 1,
          price: value,
        },
      ],
    })
  }
}

export const trackRemoveFromCart = (itemId: string, itemName: string, value?: number, currency = "USD") => {
  event({
    action: "remove_from_cart",
    category: "ecommerce",
    label: `${itemId} - ${itemName}`,
    value: value,
  })

  // Enhanced ecommerce tracking
  if (typeof window !== "undefined" && window.gtag && value) {
    window.gtag("event", "remove_from_cart", {
      currency: currency,
      value: value,
      items: [
        {
          item_id: itemId,
          item_name: itemName,
          quantity: 1,
          price: value,
        },
      ],
    })
  }
}

export const trackViewItem = (itemId: string, itemName: string, category: string, value?: number, currency = "USD") => {
  event({
    action: "view_item",
    category: "ecommerce",
    label: `${itemId} - ${itemName} - ${category}`,
    value: value,
  })

  // Enhanced ecommerce tracking
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "view_item", {
      currency: currency,
      value: value || 0,
      items: [
        {
          item_id: itemId,
          item_name: itemName,
          item_category: category,
          quantity: 1,
          price: value || 0,
        },
      ],
    })
  }
}

export const trackBeginCheckout = (value: number, currency = "USD", itemCount?: number) => {
  event({
    action: "begin_checkout",
    category: "ecommerce",
    value: value,
  })

  // Enhanced ecommerce tracking
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "begin_checkout", {
      currency: currency,
      value: value,
      num_items: itemCount,
    })
  }
}

// User engagement events
export const trackSearch = (searchTerm: string) => {
  event({
    action: "search",
    category: "engagement",
    label: searchTerm,
  })

  // Enhanced search tracking
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "search", {
      search_term: searchTerm,
    })
  }
}

export const trackSignUp = (method = "email") => {
  event({
    action: "sign_up",
    category: "engagement",
    label: method,
  })

  // Enhanced signup tracking
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "sign_up", {
      method: method,
    })
  }
}

export const trackLogin = (method = "email") => {
  event({
    action: "login",
    category: "engagement",
    label: method,
  })

  // Enhanced login tracking
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "login", {
      method: method,
    })
  }
}

export const trackShare = (contentType: string, itemId: string, method?: string) => {
  event({
    action: "share",
    category: "engagement",
    label: `${contentType} - ${itemId}`,
  })

  // Enhanced share tracking
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "share", {
      method: method || "unknown",
      content_type: contentType,
      item_id: itemId,
    })
  }
}

// Navigation events
export const trackCategoryView = (categoryName: string) => {
  event({
    action: "view_category",
    category: "navigation",
    label: categoryName,
  })

  // Custom event for category views
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "view_item_list", {
      item_list_name: categoryName,
      item_list_id: categoryName.toLowerCase().replace(/\s+/g, "_"),
    })
  }
}

export const trackBrandView = (brandName: string) => {
  event({
    action: "view_brand",
    category: "navigation",
    label: brandName,
  })

  // Custom event for brand views
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "view_item_list", {
      item_list_name: `Brand: ${brandName}`,
      item_list_id: `brand_${brandName.toLowerCase().replace(/\s+/g, "_")}`,
    })
  }
}

// Contact and feedback events
export const trackContactForm = (formType: string) => {
  event({
    action: "contact_form_submit",
    category: "engagement",
    label: formType,
  })
}

export const trackNewsletterSignup = () => {
  event({
    action: "newsletter_signup",
    category: "engagement",
    label: "footer_newsletter",
  })
}

// Error tracking
export const trackError = (errorType: string, errorMessage: string) => {
  event({
    action: "error",
    category: "technical",
    label: `${errorType}: ${errorMessage}`,
  })
}
