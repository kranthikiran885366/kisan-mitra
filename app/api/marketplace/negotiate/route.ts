import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Negotiation from "@/server/models/Negotiation"
import Product from "@/server/models/Product"

export async function GET(request: Request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const userId = searchParams.get("userId")
    const role = searchParams.get("role") // buyer or seller

    let query = {}
    
    if (productId) {
      query.product = productId
    }
    
    if (userId && role) {
      query[role] = userId
    }

    const negotiations = await Negotiation.find(query)
      .populate("product", "name price images")
      .populate("buyer", "name mobile")
      .populate("seller", "name mobile")
      .populate("messages.sender", "name")
      .sort({ createdAt: -1 })

    // Check and update expired negotiations
    for (const negotiation of negotiations) {
      await negotiation.checkExpiry()
    }

    return NextResponse.json({
      success: true,
      data: negotiations.map(neg => ({
        ...neg.toObject(),
        id: neg._id.toString()
      }))
    })
  } catch (error) {
    console.error("Negotiations fetch error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch negotiations" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    
    const { productId, proposedPrice, message, buyerId, quantity = 1 } = await request.json()
    
    const product = await Product.findById(productId).populate("seller")
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      )
    }

    if (!product.negotiable) {
      return NextResponse.json(
        { success: false, message: "This product is not negotiable" },
        { status: 400 }
      )
    }

    // Check if there's already an active negotiation
    const existingNegotiation = await Negotiation.findOne({
      product: productId,
      buyer: buyerId,
      status: { $in: ["pending", "counter"] }
    })

    if (existingNegotiation) {
      return NextResponse.json(
        { success: false, message: "You already have an active negotiation for this product" },
        { status: 400 }
      )
    }

    const negotiation = new Negotiation({
      product: productId,
      buyer: buyerId,
      seller: product.seller._id,
      originalPrice: product.price.selling,
      proposedPrice,
      quantity,
      messages: [{
        sender: buyerId,
        message
      }]
    })

    await negotiation.save()
    await negotiation.populate([
      { path: "product", select: "name price images" },
      { path: "buyer", select: "name mobile" },
      { path: "seller", select: "name mobile" }
    ])

    return NextResponse.json({
      success: true,
      data: {
        ...negotiation.toObject(),
        id: negotiation._id.toString()
      },
      message: "Negotiation started successfully"
    })
  } catch (error) {
    console.error("Negotiation creation error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to start negotiation" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect()
    
    const { negotiationId, action, message, counterPrice, userId } = await request.json()
    
    const negotiation = await Negotiation.findById(negotiationId)
      .populate("product", "name price")
      .populate("buyer", "name")
      .populate("seller", "name")
    
    if (!negotiation) {
      return NextResponse.json(
        { success: false, message: "Negotiation not found" },
        { status: 404 }
      )
    }

    // Check if user is authorized to perform this action
    const isBuyer = negotiation.buyer._id.toString() === userId
    const isSeller = negotiation.seller._id.toString() === userId
    
    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      )
    }

    let result
    switch (action) {
      case "accept":
        if (!isSeller) {
          return NextResponse.json(
            { success: false, message: "Only seller can accept negotiations" },
            { status: 403 }
          )
        }
        result = await negotiation.accept()
        break
        
      case "reject":
        if (!isSeller) {
          return NextResponse.json(
            { success: false, message: "Only seller can reject negotiations" },
            { status: 403 }
          )
        }
        result = await negotiation.reject()
        break
        
      case "counter":
        if (!counterPrice) {
          return NextResponse.json(
            { success: false, message: "Counter price is required" },
            { status: 400 }
          )
        }
        result = await negotiation.counterOffer(userId, counterPrice, message)
        break
        
      case "message":
        if (!message) {
          return NextResponse.json(
            { success: false, message: "Message is required" },
            { status: 400 }
          )
        }
        result = await negotiation.addMessage(userId, message)
        break
        
      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        )
    }

    await result.populate([
      { path: "product", select: "name price images" },
      { path: "buyer", select: "name mobile" },
      { path: "seller", select: "name mobile" },
      { path: "messages.sender", select: "name" }
    ])

    return NextResponse.json({
      success: true,
      data: {
        ...result.toObject(),
        id: result._id.toString()
      },
      message: `Negotiation ${action}ed successfully`
    })
  } catch (error) {
    console.error("Negotiation update error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update negotiation" },
      { status: 500 }
    )
  }
}