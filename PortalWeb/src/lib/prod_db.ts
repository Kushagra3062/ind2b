import mongoose from "mongoose"

const MONGODB_URI = process.env.PROD_DB || process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// Define the type for the cached connection
interface Cached {
  conn: mongoose.Mongoose | null
  promise: Promise<mongoose.Mongoose> | null
}

// Define the global mongoose with proper typing
declare global {
  var mongoose:
    | {
        conn: mongoose.Mongoose | null
        promise: Promise<mongoose.Mongoose> | null
      }
    | undefined
}

// Initialize the cached connection
const cached: Cached = (global.mongoose || { conn: null, promise: null }) as Cached

// Update the global mongoose object if it doesn't exist
if (!global.mongoose) {
  global.mongoose = cached
}

export async function connectDB() {
  if (cached.conn) {
    console.log("Using existing MongoDB connection")
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    console.log("Creating new MongoDB connection")
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log("MongoDB connected successfully")
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error("MongoDB connection error:", e)
    throw e
  }

  return cached.conn
}
