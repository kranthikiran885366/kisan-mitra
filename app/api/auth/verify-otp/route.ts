import { NextResponse } from "next/server"

const otpStorage = new Map<string, { otp: string; expires: number; attempts: number }>()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { mobile, otp } = body

    if (!mobile || !otp) {
      return NextResponse.json(
        { success: false, error: "Mobile number and OTP are required" },
        { status: 400 }
      )
    }

    const storedData = otpStorage.get(mobile)
    
    if (!storedData) {
      return NextResponse.json(
        { success: false, error: "OTP not found or expired" },
        { status: 400 }
      )
    }

    if (Date.now() > storedData.expires) {
      otpStorage.delete(mobile)
      return NextResponse.json(
        { success: false, error: "OTP has expired" },
        { status: 400 }
      )
    }

    if (storedData.attempts >= 3) {
      otpStorage.delete(mobile)
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please request a new OTP" },
        { status: 400 }
      )
    }

    if (storedData.otp !== otp) {
      storedData.attempts++
      return NextResponse.json(
        { success: false, error: "Invalid OTP" },
        { status: 400 }
      )
    }

    otpStorage.delete(mobile)
    
    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      data: { mobile, verified: true }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to verify OTP" },
      { status: 500 }
    )
  }
}