import { NextResponse } from "next/server"

// Mock user database (in production, this would be a real database)
const mockUsers = [
  {
    id: "1",
    name: "Ravi Kumar",
    phone: "+919876543210",
    email: "ravi@example.com",
    password: "password123",
    state: "Andhra Pradesh",
    district: "Guntur",
    farmSize: "5",
    primaryCrop: "Rice",
    language: "en",
    createdAt: "2024-01-01",
  },
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, email, password, state, district, farmSize, primaryCrop, language = "en" } = body

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.phone === phone || u.email === email)

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User already exists with this phone or email",
        },
        { status: 409 },
      )
    }

    // Create new user
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      name,
      phone,
      email,
      password, // In production, hash the password
      state,
      district,
      farmSize,
      primaryCrop,
      language,
      createdAt: new Date().toISOString(),
    }

    // Add to mock database
    mockUsers.push(newUser)

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token: `mock_token_${newUser.id}`, // In production, generate JWT
      },
      message: "Account created successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
