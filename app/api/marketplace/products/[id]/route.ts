import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Product from "@/server/models/Product"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    const product = await Product.findById(params.id)
      .populate("seller", "name district state mobile rating isVerified")
      .populate("reviews.user", "name")
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      )
    }

    await Product.findByIdAndUpdate(params.id, { $inc: { views: 1 } })

    return NextResponse.json({
      success: true,
      data: {
        ...product.toObject(),
        id: product._id.toString(),
        seller: {
          ...product.seller.toObject(),
          location: `${product.seller.district}, ${product.seller.state}`,
          verified: product.seller.isVerified
        }
      }
    })
  } catch (error) {
    console.error("Product fetch error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { action, rating, comment, userId } = body

    const product = await Product.findById(params.id)
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      )
    }

    if (action === "add_review") {
      product.reviews.push({
        user: userId,
        rating,
        comment,
        verified: true
      })
      
      product.updateRatings()
      await product.save()
      
      return NextResponse.json({
        success: true,
        message: "Review added successfully"
      })
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Product update error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    )
  }
}