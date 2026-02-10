import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import { getCurrentUser } from "@/actions/auth"
import mongoose from "mongoose"

// GET - Fetch all addresses for current user
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("Connecting to database...")
    const connection = await connectProfileDB()

    console.log("Fetching addresses for user:", user.id)
    const BuyerAddress = connection.models.BuyerAddress

    if (!BuyerAddress) {
      console.error("BuyerAddress model not found")
      return NextResponse.json({ error: "Model not found" }, { status: 500 })
    }

    const addresses = await BuyerAddress.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .lean()
      .maxTimeMS(5000) // 5 second timeout
      .exec()

    console.log("Found addresses:", addresses.length)

    return NextResponse.json({
      success: true,
      addresses: addresses.map((addr: any) => ({
        ...addr,
        _id: addr._id.toString(),
      })),
    })
  } catch (error) {
    console.error("Error fetching addresses:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch addresses",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST - Create new address
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, companyName, address, country, state, city, zipCode, email, phoneNumber, isDefault } =
      body

    // Validate required fields
    if (!firstName || !lastName || !address || !country || !state || !city || !zipCode || !email || !phoneNumber) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    console.log("Connecting to database...")
    const connection = await connectProfileDB()

    const BuyerAddress = connection.models.BuyerAddress

    if (!BuyerAddress) {
      console.error("BuyerAddress model not found")
      return NextResponse.json({ error: "Model not found" }, { status: 500 })
    }

    console.log("Creating new address for user:", user.id)

    // Create new address data
    const newAddressData = {
      userId: user.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      companyName: companyName?.trim() || "",
      address: address.trim(),
      country: country.trim(),
      state: state.trim(),
      city: city.trim(),
      zipCode: zipCode.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      isDefault: isDefault || false,
    }

    // If this is set as default, first create the address, then update others
    console.log("Saving address data:", newAddressData)
    const newAddress = new BuyerAddress(newAddressData)
    const savedAddress = await newAddress.save()

    // After successful save, if this is default, update other addresses
    if (isDefault) {
      console.log("Updating other addresses to not default...")
      try {
        await BuyerAddress.updateMany(
          {
            userId: user.id,
            _id: { $ne: savedAddress._id },
          },
          { isDefault: false },
        ).maxTimeMS(5000) // 5 second timeout
      } catch (updateError) {
        console.warn("Failed to update other addresses, but main address was saved:", updateError)
        // Don't fail the entire operation if this update fails
      }
    }

    console.log("Address saved successfully:", savedAddress._id)

    return NextResponse.json({
      success: true,
      message: "Address saved successfully",
      address: {
        ...savedAddress.toObject(),
        _id: savedAddress._id.toString(),
      },
    })
  } catch (error) {
    console.error("Error saving address:", error)

    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        {
          error: "Invalid data provided",
          details: Object.values(error.errors)
            .map((e) => e.message)
            .join(", "),
        },
        { status: 400 },
      )
    }

    if (error instanceof mongoose.Error.MongooseServerSelectionError) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 503 })
    }

    return NextResponse.json(
      {
        error: "Failed to save address",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// PUT - Update existing address
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const {
      _id,
      firstName,
      lastName,
      companyName,
      address,
      country,
      state,
      city,
      zipCode,
      email,
      phoneNumber,
      isDefault,
    } = body

    // Validate required fields
    if (
      !_id ||
      !firstName ||
      !lastName ||
      !address ||
      !country ||
      !state ||
      !city ||
      !zipCode ||
      !email ||
      !phoneNumber
    ) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return NextResponse.json({ error: "Invalid address ID format" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    console.log("Connecting to database...")
    const connection = await connectProfileDB()

    const BuyerAddress = connection.models.BuyerAddress

    if (!BuyerAddress) {
      console.error("BuyerAddress model not found")
      return NextResponse.json({ error: "Model not found" }, { status: 500 })
    }

    console.log("Updating address:", _id, "for user:", user.id)

    // Update address data
    const updateData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      companyName: companyName?.trim() || "",
      address: address.trim(),
      country: country.trim(),
      state: state.trim(),
      city: city.trim(),
      zipCode: zipCode.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      isDefault: isDefault || false,
    }

    console.log("Updating address data:", updateData)
    const updatedAddress = await BuyerAddress.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(_id),
        userId: user.id,
      },
      updateData,
      { new: true, runValidators: true },
    ).maxTimeMS(5000) // 5 second timeout

    if (!updatedAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    // After successful update, if this is set as default, update other addresses
    if (isDefault) {
      console.log("Updating other addresses to not default...")
      try {
        await BuyerAddress.updateMany(
          {
            userId: user.id,
            _id: { $ne: updatedAddress._id },
          },
          { isDefault: false },
        ).maxTimeMS(5000) // 5 second timeout
      } catch (updateError) {
        console.warn("Failed to update other addresses, but main address was updated:", updateError)
        // Don't fail the entire operation if this update fails
      }
    }

    console.log("Address updated successfully:", updatedAddress._id)

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      address: {
        ...updatedAddress.toObject(),
        _id: updatedAddress._id.toString(),
      },
    })
  } catch (error) {
    console.error("Error updating address:", error)

    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        {
          error: "Invalid data provided",
          details: Object.values(error.errors)
            .map((e) => e.message)
            .join(", "),
        },
        { status: 400 },
      )
    }

    if (error instanceof mongoose.Error.MongooseServerSelectionError) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 503 })
    }

    return NextResponse.json(
      {
        error: "Failed to update address",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// DELETE - Delete address
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const addressId = searchParams.get("id")

    if (!addressId) {
      return NextResponse.json({ error: "Address ID is required" }, { status: 400 })
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return NextResponse.json({ error: "Invalid address ID format" }, { status: 400 })
    }

    console.log("Connecting to database...")
    const connection = await connectProfileDB()

    const BuyerAddress = connection.models.BuyerAddress

    if (!BuyerAddress) {
      console.error("BuyerAddress model not found")
      return NextResponse.json({ error: "Model not found" }, { status: 500 })
    }

    console.log("Deleting address:", addressId, "for user:", user.id)

    // First, check if the address to be deleted is the default address
    const addressToDelete = await BuyerAddress.findOne({
      _id: new mongoose.Types.ObjectId(addressId),
      userId: user.id,
    }).maxTimeMS(5000)

    if (!addressToDelete) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    const wasDefault = addressToDelete.isDefault

    // Delete the address
    const deletedAddress = await BuyerAddress.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(addressId),
      userId: user.id,
    }).maxTimeMS(5000) // 5 second timeout

    if (!deletedAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    console.log("Address deleted successfully")

    // If the deleted address was default, make another address default
    if (wasDefault) {
      console.log("Deleted address was default, finding another address to make default...")
      try {
        const remainingAddress = await BuyerAddress.findOne({
          userId: user.id,
        })
          .sort({ createdAt: -1 }) // Get the most recent address
          .maxTimeMS(5000)

        if (remainingAddress) {
          await BuyerAddress.findByIdAndUpdate(remainingAddress._id, { isDefault: true }, { new: true }).maxTimeMS(5000)
          console.log("Made address default:", remainingAddress._id)
        } else {
          console.log("No remaining addresses to make default")
        }
      } catch (updateError) {
        console.warn("Failed to update remaining address to default:", updateError)
        // Don't fail the entire operation if this update fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json(
      {
        error: "Failed to delete address",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
