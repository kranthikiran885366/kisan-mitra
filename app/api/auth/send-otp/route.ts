import { NextResponse } from "next/server"

const otpStorage = new Map<string, { otp: string; expires: number; attempts: number }>()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { mobile } = body

    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { success: false, error: "Invalid mobile number" },
        { status: 400 }
      )
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = Date.now() + 5 * 60 * 1000
    
    otpStorage.set(mobile, { otp, expires, attempts: 0 })
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log(`OTP for ${mobile}: ${otp}`)
    
    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      data: { mobile, expiresIn: 300 }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to send OTP" },
      { status: 500 }
    )
  }
}