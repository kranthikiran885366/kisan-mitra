import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Order from "@/server/models/Order"
import Cart from "@/server/models/Cart"
import Product from "@/server/models/Product"

export async function GET(request: Request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "default_user"
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    let query = { buyer: userId }
    if (status) {
      query.status = status
    }

    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate({
          path: "items.product",
          select: "name images"
        })
        .populate({
          path: "items.seller",
          select: "name"
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query)
    ])

    return NextResponse.json({
      success: true,
      data: orders.map(order => ({
        ...order.toObject(),
        id: order._id.toString()
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    
    const orderData = await request.json()
    const { items, shippingAddress, payment, userId = "default_user" } = orderData

    // Validate stock availability
    for (const item of items) {
      const product = await Product.findById(item.productId || item.product)
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product ${item.name} not found` },
          { status: 404 }
        )
      }
      
      if (!product.isInStock(item.quantity)) {
        return NextResponse.json(
          { success: false, message: `Insufficient stock for ${product.name}` },
          { status: 400 }
        )
      }
    }

    // Calculate totals
    let subtotal = 0
    const orderItems = []
    
    for (const item of items) {
      const product = await Product.findById(item.productId || item.product)
      const itemTotal = product.price.selling * item.quantity
      subtotal += itemTotal
      
      orderItems.push({
        product: product._id,
        seller: product.seller,
        quantity: item.quantity,
        price: product.price.selling,
        status: "pending"
      })
      
      // Reduce stock
      product.reduceStock(item.quantity)
      await product.save()
    }

    const shipping = subtotal > 500 ? 0 : 50
    const total = subtotal + shipping

    // Create order
    const order = new Order({
      buyer: userId,
      items: orderItems,
      shippingAddress,
      payment: {
        ...payment,
        amount: total
      },
      pricing: {
        subtotal,
        shipping,
        total
      },
      status: "pending"
    })

    await order.save()

    // Clear cart after successful order
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [], totalAmount: 0, totalItems: 0 } }
    )

    await order.populate([
      {
        path: "items.product",
        select: "name images"
      },
      {
        path: "items.seller",
        select: "name"
      }
    ])

    return NextResponse.json({
      success: true,
      data: {
        ...order.toObject(),
        id: order._id.toString()
      },
      message: "Order placed successfully"
    })
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to place order" },
      { status: 500 }
    )
  }
}