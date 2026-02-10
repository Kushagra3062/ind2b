#!/bin/bash

# This script adds the dynamic export to all pages that need it

echo "Fixing build errors by adding dynamic exports..."

# List of server component pages that need the export
PAGES=(
  "app/categories/page.tsx"
  "app/cart/page.tsx"
  "app/checkout/page.tsx"
  "app/checkout/success/page.tsx"
  "app/contact-us/page.tsx"
  "app/feedback/page.tsx"
  "app/shipping-policy/page.tsx"
  "app/dashboard/page.tsx"
  "app/dashboard/address/page.tsx"
  "app/dashboard/cart/page.tsx"
  "app/dashboard/orders/page.tsx"
  "app/dashboard/quotations/page.tsx"
  "app/dashboard/wishlist/page.tsx"
  "app/dashboard/password/page.tsx"
  "app/debug/razorpay/page.tsx"
  "app/debug/test-data/page.tsx"
)

for page in "${PAGES[@]}"; do
  if [ -f "$page" ]; then
    # Check if file already has the export
    if ! grep -q "export const dynamic" "$page"; then
      # Check if it's a client component
      if ! grep -q "\"use client\"" "$page"; then
        echo "Adding dynamic export to: $page"
        # Add the export after imports (before the first export default)
        sed -i '0,/^export default/s/^export default/export const dynamic = "force-dynamic"\n\nexport default/' "$page"
      else
        echo "Skipping client component: $page"
      fi
    else
      echo "Already has dynamic export: $page"
    fi
  else
    echo "File not found: $page"
  fi
done

echo "Done!"
