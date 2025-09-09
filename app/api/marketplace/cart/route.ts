import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Cart from "@/server/models/Cart"
import Product from "@/server/models/Product"
import { getServerSession } from "next-auth/next"

export async function GET(request: Request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "default_user"

    let cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        select: "name price images seller stock",
        populate: {
          path: "seller",
          select: "name"
        }
      })

    if (!cart) {
      cart = new Cart({ user: userId, items: [] })
      await cart.save()
    }

    cart.calculateTotal()
    await cart.save()

    return NextResponse.json({
      success: true,
      data: {
        items: cart.items.map(item => ({
          id: item._id.toString(),
          productId: item.product._id.toString(),
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          image: item.product.images[0]?.url || "/placeholder.jpg",
          seller: item.product.seller.name,
          addedAt: item.addedAt
        })),
        totalAmount: cart.totalAmount,
        totalItems: cart.totalItems
      }
    })
  } catch (error) {
    console.error("Cart fetch error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch cart" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    
    const { productId, quantity = 1, userId = "default_user" } = await request.json()
    
    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      )
    }

    if (!product.isInStock(quantity)) {
      return NextResponse.json(
        { success: false, message: "Insufficient stock" },
        { status: 400 }
      )
    }

    let cart = await Cart.findOne({ user: userId })
    if (!cart) {
      cart = new Cart({ user: userId, items: [] })
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    )

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price.selling
      })
    }

    cart.calculateTotal()
    await cart.save()
    
    await cart.populate({
      path: "items.product",
      select: "name price images seller",
      populate: {
        path: "seller",
        select: "name"
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        items: cart.items.map(item => ({
          id: item._id.toString(),
          productId: item.product._id.toString(),
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          image: item.product.images[0]?.url || "/placeholder.jpg",
          seller: item.product.seller.name
        })),
        totalAmount: cart.totalAmount,
        totalItems: cart.totalItems
      },
      message: "Item added to cart"
    })
  } catch (error) {
    console.error("Add to cart error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to add item to cart" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect()
    
    const { productId, quantity, userId = "default_user" } = await request.json()
    
    const cart = await Cart.findOne({ user: userId })
    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      )
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    )

    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Item not found in cart" },
        { status: 404 }
      )
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1)
    } else {
      const product = await Product.findById(productId)
      if (!product.isInStock(quantity)) {
        return NextResponse.json(
          { success: false, message: "Insufficient stock" },
          { status: 400 }
        )
      }
      cart.items[itemIndex].quantity = quantity
    }

    cart.calculateTotal()
    await cart.save()
    
    await cart.populate({
      path: "items.product",
      select: "name price images seller",
      populate: {
        path: "seller",
        select: "name"
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        items: cart.items.map(item => ({
          id: item._id.toString(),
          productId: item.product._id.toString(),
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          image: item.product.images[0]?.url || "/placeholder.jpg",
          seller: item.product.seller.name
        })),
        totalAmount: cart.totalAmount,
        totalItems: cart.totalItems
      },
      message: "Cart updated"
    })
  } catch (error) {
    console.error("Cart update error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update cart" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const userId = searchParams.get("userId") || "default_user"
    
    const cart = await Cart.findOne({ user: userId })
    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      )
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    )
    
    cart.calculateTotal()
    await cart.save()
    
    await cart.populate({
      path: "items.product",
      select: "name price images seller",
      populate: {
        path: "seller",
        select: "name"
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        items: cart.items.map(item => ({
          id: item._id.toString(),
          productId: item.product._id.toString(),
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          image: item.product.images[0]?.url || "/placeholder.jpg",
          seller: item.product.seller.name
        })),
        totalAmount: cart.totalAmount,
        totalItems: cart.totalItems
      },
      message: "Item removed from cart"
    })
  } catch (error) {
    console.error("Cart delete error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to remove item from cart" },
      { status: 500 }
    )
  }
}