const jwt = require("jsonwebtoken")
const User = require("../models/User")

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "kisan-mitra-secret")

    // Check if user still exists and is active
    const user = await User.findById(decoded.userId).select("-password")

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found or inactive.",
      })
    }

    req.userId = decoded.userId
    req.userRole = decoded.role || user.role
    req.user = user

    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      })
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired.",
      })
    }

    console.error("Auth middleware error:", error)
    res.status(500).json({
      success: false,
      message: "Authentication failed.",
      error: error.message,
    })
  }
}

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication required.",
      })
    }

    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
        requiredRoles: roles,
        userRole: req.userRole,
      })
    }

    next()
  }
}

// Check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Account verification required. Please verify your mobile number.",
      requiresVerification: true,
    })
  }

  next()
}

// Check premium access
const requirePremium = (req, res, next) => {
  if (!req.user.hasPremiumAccess()) {
    return res.status(403).json({
      success: false,
      message: "Premium subscription required to access this feature.",
      requiresPremium: true,
      currentPlan: req.user.subscription.plan,
    })
  }

  next()
}

// Export middleware functions
module.exports = auth;

// Attach additional middleware functions to the main auth middleware
auth.authorize = authorize;
auth.requireVerification = requireVerification;
auth.requirePremium = requirePremium;
