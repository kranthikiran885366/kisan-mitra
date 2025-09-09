import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import CropListing from "@/server/models/CropListing"
import User from "@/server/models/User"

export async function GET(request: Request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const farmerId = searchParams.get("farmerId")
    const category = searchParams.get("category")
    const district = searchParams.get("district")
    const state = searchParams.get("state")
    const status = searchParams.get("status") || "active"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    let query = { status }
    
    if (farmerId) {
      query.farmer = farmerId
    }
    if (category && category !== "all") {
      query.category = category
    }
    if (district) {
      query["location.district"] = { $regex: district, $options: "i" }
    }
    if (state) {
      query["location.state"] = { $regex: state, $options: "i" }
    }

    const skip = (page - 1) * limit

    const [listings, total] = await Promise.all([
      CropListing.find(query)
        .populate("farmer", "name mobile district state rating")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CropListing.countDocuments(query)
    ])

    return NextResponse.json({
      success: true,
      data: {
        listings: listings.map(listing => ({
          ...listing,
          id: listing._id.toString(),
          remainingQuantity: listing.quantity.available - listing.quantity.sold
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error("Crop listings fetch error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch crop listings" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const {
      farmerId, cropName, category, variety, quantity, pricing,
      quality, location, images, availability, delivery
    } = body

    const farmer = await User.findById(farmerId)
    if (!farmer) {
      return NextResponse.json(
        { success: false, message: "Farmer not found" },
        { status: 404 }
      )
    }

    if (pricing.negotiable && !pricing.minPrice) {
      pricing.minPrice = Math.floor(pricing.basePrice * 0.8)
    }

    const cropListing = new CropListing({
      farmer: farmerId,
      cropName,
      category,
      variety,
      quantity: {
        available: quantity.available,
        unit: quantity.unit
      },
      pricing,
      quality: {
        ...quality,
        harvestDate: new Date(quality.harvestDate)
      },
      location,
      images: images || [],
      availability: {
        readyForHarvest: availability.readyForHarvest,
        availableFrom: new Date(availability.availableFrom),
        availableTill: new Date(availability.availableTill)
      },
      delivery: delivery || {
        farmPickup: true,
        homeDelivery: false,
        deliveryRadius: 50
      }
    })

    await cropListing.save()
    await cropListing.populate("farmer", "name mobile district state")

    return NextResponse.json({
      success: true,
      data: {
        ...cropListing.toObject(),
        id: cropListing._id.toString()
      },
      message: "Crop listing created successfully"
    })
  } catch (error) {
    console.error("Crop listing creation error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create crop listing" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { listingId, action, ...updateData } = body

    const listing = await CropListing.findById(listingId)
    if (!listing) {
      return NextResponse.json(
        { success: false, message: "Listing not found" },
        { status: 404 }
      )
    }

    if (action === "add_order") {
      const { buyerId, quantity, price, notes } = updateData
      
      try {
        await listing.addOrder(buyerId, quantity, price, notes)
        
        return NextResponse.json({
          success: true,
          message: "Order placed successfully",
          data: {
            orderId: listing.orders[listing.orders.length - 1]._id,
            status: "pending"
          }
        })
      } catch (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        )
      }
    }

    if (action === "update_order") {
      const { orderId, status, deliveryDate } = updateData
      
      try {
        await listing.updateOrderStatus(orderId, status, deliveryDate)
        
        let message = "Order status updated successfully"
        if (status === "accepted") {
          message = "Order accepted! Delivery will be arranged soon."
        } else if (status === "rejected") {
          message = "Order rejected. Please contact farmer directly."
        } else if (status === "completed") {
          message = "Order completed successfully!"
        }
        
        return NextResponse.json({
          success: true,
          message,
          data: { orderId, status, deliveryDate }
        })
      } catch (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        )
      }
    }

    Object.assign(listing, updateData)
    await listing.save()

    return NextResponse.json({
      success: true,
      data: {
        ...listing.toObject(),
        id: listing._id.toString()
      },
      message: "Listing updated successfully"
    })
  } catch (error) {
    console.error("Crop listing update error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update listing" },
      { status: 500 }
    )
  }
}