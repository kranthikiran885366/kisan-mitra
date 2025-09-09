import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Product from "@/server/models/Product"
import User from "@/server/models/User"

export async function GET(request: Request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const location = searchParams.get("location")

    let query = { isActive: true }
    
    if (category && category !== "all") {
      query.category = category
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
        { brand: { $regex: search, $options: "i" } }
      ]
    }
    
    if (minPrice || maxPrice) {
      query["price.selling"] = {}
      if (minPrice) query["price.selling"].$gte = parseInt(minPrice)
      if (maxPrice) query["price.selling"].$lte = parseInt(maxPrice)
    }
    
    if (location) {
      query.$or = [
        { "location.state": { $regex: location, $options: "i" } },
        { "location.district": { $regex: location, $options: "i" } }
      ]
    }

    const skip = (page - 1) * limit
    const sortObj = {}
    sortObj[sortBy] = sortOrder

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("seller", "name district state mobile rating")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ])

    const productIds = products.map(p => p._id)
    await Product.updateMany(
      { _id: { $in: productIds } },
      { $inc: { views: 1 } }
    )

    return NextResponse.json({
      success: true,
      data: {
        products: products.map(product => ({
          ...product,
          id: product._id.toString(),
          seller: {
            ...product.seller,
            location: `${product.seller.district}, ${product.seller.state}`
          }
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
    console.error("Products fetch error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { 
      name, description, category, subcategory, brand, 
      price, specifications, stock, images, shipping, 
      negotiable, tags, location, sellerId 
    } = body

    const seller = await User.findById(sellerId)
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      )
    }

    const product = new Product({
      name,
      description,
      category,
      subcategory,
      brand,
      price,
      specifications,
      stock,
      images: images || [{ url: "/placeholder.jpg", alt: name, isPrimary: true }],
      shipping,
      negotiable: negotiable || false,
      tags: tags || [],
      location: location || { 
        state: seller.state, 
        district: seller.district 
      },
      seller: sellerId,
      seoUrl: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    })

    await product.save()
    await product.populate("seller", "name district state")

    return NextResponse.json({
      success: true,
      data: {
        ...product.toObject(),
        id: product._id.toString()
      },
      message: "Product added successfully"
    })
  } catch (error) {
    console.error("Product creation error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 }
    )
  }
}