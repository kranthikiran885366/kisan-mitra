const express = require("express")
const Farmer = require("../models/Farmer")

const router = express.Router()

// Send OTP for login (alternative to password)
router.post("/send-login-otp", async (req, res) => {
  try {
    const { mobile } = req.body

    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid mobile number",
      })
    }

    const farmer = await Farmer.findOne({ mobile })
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "No account found with this mobile number",
      })
    }

    const otp = farmer.generateOTP()
    await farmer.save()

    // In production, integrate with SMS service like Twilio, MSG91, etc.
    console.log(`Login OTP for ${mobile}: ${otp}`)

    res.json({
      success: true,
      message: "OTP sent successfully",
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    })
  } catch (error) {
    console.error("Send login OTP error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    })
  }
})

// Verify OTP and login
router.post("/verify-login-otp", async (req, res) => {
  try {
    const { mobile, otp } = req.body

    const farmer = await Farmer.findOne({ mobile })
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      })
    }

    if (farmer.verifyOTP(otp)) {
      // Clear OTP
      farmer.verificationOTP = undefined
      farmer.lastLogin = new Date()
      farmer.loginCount += 1
      await farmer.save()

      // Generate JWT token
      const jwt = require("jsonwebtoken")
      const token = jwt.sign({ farmerId: farmer._id }, process.env.JWT_SECRET || "kisan-mitra-secret", {
        expiresIn: "30d",
      })

      res.json({
        success: true,
        message: "Login successful",
        token,
        farmer,
      })
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      })
    }
  } catch (error) {
    console.error("Verify login OTP error:", error)
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: error.message,
    })
  }
})

module.exports = router
