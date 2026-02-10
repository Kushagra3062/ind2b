import { readFileSync, writeFileSync, existsSync } from "fs"
import { resolve } from "path"

// List of all pages that need the dynamic export
const PAGES_TO_UPDATE = [
  // Seller pages
  "app/seller/help/page.tsx",
  "app/seller/light-onboarding/page.tsx",
  "app/seller/orders/page.tsx",
  "app/seller/products/page.tsx",
  "app/seller/profile/page.tsx",
  "app/seller/quotations/page.tsx",
  "app/seller/reviews/page.tsx",

  // Dashboard pages
  "app/dashboard/page.tsx",
  "app/dashboard/address/page.tsx",
  "app/dashboard/cart/page.tsx",
  "app/dashboard/orders/page.tsx",
  "app/dashboard/quotations/page.tsx",
  "app/dashboard/wishlist/page.tsx",
  "app/dashboard/password/page.tsx",

  // Public pages
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
]

function addDynamicExport(filePath: string) {
  const fullPath = resolve(process.cwd(), filePath)

  if (!existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`)
    return
  }

  let content = readFileSync(fullPath, "utf-8")

  // Check if already has dynamic export
  if (content.includes("export const dynamic")) {
    console.log(`✓ Already has dynamic export: ${filePath}`)
    return
  }

  // Find the position to insert the export
  // Insert after imports, before the first export default or function
  const lines = content.split("\n")
  let insertIndex = 0
  let foundImports = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip empty lines and comments at the beginning
    if (line === "" || line.startsWith("//") || line.startsWith("/*")) {
      continue
    }

    // Found an import, note it
    if (line.startsWith("import ")) {
      foundImports = true
      insertIndex = i + 1
      continue
    }

    // If we've passed imports and found the first export/function, insert before it
    if (foundImports && (line.startsWith("export ") || line.startsWith("function ") || line.startsWith("const "))) {
      break
    }

    // Still looking for where to insert
    if (!line.startsWith("import ")) {
      insertIndex = i
      break
    }
  }

  // Insert the dynamic export
  lines.splice(insertIndex, 0, "", 'export const dynamic = "force-dynamic"')
  content = lines.join("\n")

  writeFileSync(fullPath, content, "utf-8")
  console.log(`✓ Added dynamic export to: ${filePath}`)
}

// Run the script
console.log("Adding dynamic exports to pages...\n")
PAGES_TO_UPDATE.forEach(addDynamicExport)
console.log("\n✅ Done!")
