import { NextResponse } from "next/server"

// Mock user storage
const mockUsers = new Map<string, any>()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      )
    }

    const user = mockUsers.get(userId)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to get profile" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { 
      userId, 
      name, 
      email, 
      mobile, 
      state, 
      district, 
      village, 
      farmSize, 
      farmingType, 
      primaryCrop, 
      profilePhoto 
    } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!name || !mobile) {
      return NextResponse.json(
        { success: false, error: "Name and mobile are required" },
        { status: 400 }
      )
    }

    // Validate farming type
    const validFarmingTypes = ["crops", "livestock", "fish", "vegetables", "fruits", "dairy", "poultry", "mixed"]
    if (farmingType && !validFarmingTypes.includes(farmingType)) {
      return NextResponse.json(
        { success: false, error: "Invalid farming type" },
        { status: 400 }
      )
    }

    // Get existing user or create new profile
    const existingUser = mockUsers.get(userId) || {}
    
    // Update user profile
    const updatedUser = {
      ...existingUser,
      userId,
      name,
      email,
      mobile,
      state,
      district,
      village,
      farmSize: farmSize ? parseFloat(farmSize) : null,
      farmingType,
      primaryCrop,
      profilePhoto,
      updatedAt: new Date().toISOString(),
      profileComplete: !!(name && mobile && farmingType && farmSize),
    }

    // Store updated user
    mockUsers.set(userId, updatedUser)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Profile updated successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update profile",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, userId, ...profileData } = body

    if (action === "upload-photo") {
      const { photoData } = body
      
      if (!userId || !photoData) {
        return NextResponse.json(
          { success: false, error: "User ID and photo data are required" },
          { status: 400 }
        )
      }

      // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
      // For now, we'll just return the base64 data
      const photoUrl = photoData // In production: upload and return URL

      // Update user profile with photo
      const existingUser = mockUsers.get(userId) || {}
      const updatedUser = {
        ...existingUser,
        userId,
        profilePhoto: photoUrl,
        updatedAt: new Date().toISOString(),
      }
      
      mockUsers.set(userId, updatedUser)

      return NextResponse.json({
        success: true,
        data: { profilePhoto: photoUrl },
        message: "Photo uploaded successfully",
        timestamp: new Date().toISOString(),
      })
    }

    if (action === "verify-profile") {
      if (!userId) {
        return NextResponse.json(
          { success: false, error: "User ID is required" },
          { status: 400 }
        )
      }

      const user = mockUsers.get(userId)
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        )
      }

      // Check if profile is complete
      const isComplete = !!(
        user.name && 
        user.mobile && 
        user.farmingType && 
        user.farmSize
      )

      if (!isComplete) {
        return NextResponse.json(
          { success: false, error: "Profile is incomplete" },
          { status: 400 }
        )
      }

      // Mark profile as verified
      const verifiedUser = {
        ...user,
        profileVerified: true,
        verifiedAt: new Date().toISOString(),
      }
      
      mockUsers.set(userId, verifiedUser)

      return NextResponse.json({
        success: true,
        data: verifiedUser,
        message: "Profile verified successfully",
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Profile action error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    )
  }
}