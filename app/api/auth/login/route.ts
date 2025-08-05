import { NextResponse } from "next/server"

// Mock user database
const mockUsers = [
  {
    id: "1",
    name: "Ravi Kumar",
    phone: "+919876543210",
    email: "ravi@example.com",
    password: "password123", // In production, this would be hashed
    state: "Andhra Pradesh",
    district: "Guntur",
    farmSize: "5",
    primaryCrop: "Rice",
    language: "en",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "राम प्रसाद",
    phone: "+919876543211",
    email: "ram@example.com",
    password: "password123",
    state: "Uttar Pradesh",
    district: "Lucknow",
    farmSize: "3",
    primaryCrop: "Wheat",
    language: "hi",
    createdAt: "2024-01-02",
  },
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, email, password } = body

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Find user by phone or email
    const user = mockUsers.find((u) => (phone && u.phone === phone) || (email && u.email === email))

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      )
    }

    // Check password (in production, compare hashed passwords)
    if (user.password !== password) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid password",
        },
        { status: 401 },
      )
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token: `mock_token_${user.id}`, // In production, generate JWT
      },
      message: "Login successful",
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
