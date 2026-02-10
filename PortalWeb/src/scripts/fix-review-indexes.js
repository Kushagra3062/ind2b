// MongoDB script to fix review collection indexes
// Run this in MongoDB shell or MongoDB Compass

// Connect to your database
const db = db.getSiblingDB("test") // Replace 'test' with your actual database name

console.log("Starting review collection cleanup and index fix...")

// Get the reviews collection
const reviewsCollection = db.reviews

// Step 1: Drop all existing indexes except _id
console.log("Step 1: Dropping all existing indexes...")
try {
  reviewsCollection.dropIndexes()
  console.log("✅ All indexes dropped successfully")
} catch (error) {
  console.log("⚠️ Error dropping indexes (might be expected):", error.message)
}

// Step 2: Remove problematic documents
console.log("Step 2: Cleaning up problematic documents...")

// Remove documents with null or missing product_id
const deleteResult1 = reviewsCollection.deleteMany({ product_id: null })
console.log(`✅ Deleted ${deleteResult1.deletedCount} documents with null product_id`)

const deleteResult2 = reviewsCollection.deleteMany({ product_id: { $exists: false } })
console.log(`✅ Deleted ${deleteResult2.deletedCount} documents with missing product_id`)

// Remove documents with null or missing productId (old field name)
const deleteResult3 = reviewsCollection.deleteMany({ productId: null })
console.log(`✅ Deleted ${deleteResult3.deletedCount} documents with null productId`)

const deleteResult4 = reviewsCollection.deleteMany({ productId: { $exists: false } })
console.log(`✅ Deleted ${deleteResult4.deletedCount} documents with missing productId`)

// Remove documents with empty string product_id
const deleteResult5 = reviewsCollection.deleteMany({ product_id: "" })
console.log(`✅ Deleted ${deleteResult5.deletedCount} documents with empty product_id`)

// Step 3: Create the correct indexes
console.log("Step 3: Creating new indexes...")

try {
  // Main unique index: one review per user per product per order
  reviewsCollection.createIndex(
    { userId: 1, product_id: 1, orderId: 1 },
    { unique: true, name: "userId_1_product_id_1_orderId_1" },
  )
  console.log("✅ Created unique index: userId_1_product_id_1_orderId_1")
} catch (error) {
  console.log("⚠️ Error creating unique index:", error.message)
}

try {
  // Supporting indexes for queries
  reviewsCollection.createIndex({ product_id: 1, status: 1 })
  console.log("✅ Created index: product_id_1_status_1")
} catch (error) {
  console.log("⚠️ Error creating product_id status index:", error.message)
}

try {
  reviewsCollection.createIndex({ userId: 1, status: 1 })
  console.log("✅ Created index: userId_1_status_1")
} catch (error) {
  console.log("⚠️ Error creating userId status index:", error.message)
}

try {
  reviewsCollection.createIndex({ orderId: 1, status: 1 })
  console.log("✅ Created index: orderId_1_status_1")
} catch (error) {
  console.log("⚠️ Error creating orderId status index:", error.message)
}

try {
  reviewsCollection.createIndex({ createdAt: -1 })
  console.log("✅ Created index: createdAt_-1")
} catch (error) {
  console.log("⚠️ Error creating createdAt index:", error.message)
}

// Step 4: Verify the final state
console.log("Step 4: Verification...")
console.log("Final indexes:")
reviewsCollection.getIndexes().forEach((index) => {
  console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`)
})

const totalDocuments = reviewsCollection.countDocuments()
console.log(`Total documents in reviews collection: ${totalDocuments}`)

console.log("🎉 Review collection cleanup and index fix completed successfully!")
