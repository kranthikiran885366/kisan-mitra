const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");
const whatsappService = require("../services/whatsappService");

const router = express.Router();

// Register user
router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("mobile")
      .matches(/^[6-9]\d{9}$/)
      .withMessage("Please enter a valid mobile number"),
    body("email").optional().isEmail().withMessage("Please enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").isIn(["farmer", "agri_doctor", "agriculture_expert"]).withMessage("Invalid role"),
    body("village").trim().isLength({ min: 2 }).withMessage("Village name is required"),
    body("district").trim().isLength({ min: 2 }).withMessage("District name is required"),
    body("state").trim().isLength({ min: 2 }).withMessage("State name is required"),
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        name,
        mobile,
        email,
        password,
        role,
        village,
        district,
        state,
        pincode,
        aadhaar,
        landSize,
        soilType,
        irrigationType,
        farmingType,
        preferredLanguage,
        experience,
        education,
        qualification,
        specialization,
        coordinates,
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ mobile }, ...(email ? [{ email }] : []), ...(aadhaar ? [{ aadhaar }] : [])],
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this mobile number, email, or Aadhaar",
        });
      }

      // Create user data object
      const userData = {
        name,
        mobile,
        email,
        password,
        role,
        village,
        district,
        state,
        pincode,
        aadhaar,
        preferredLanguage: preferredLanguage || "en",
        education,
        coordinates,
      };

      // Add role-specific fields
      if (role === "farmer") {
        if (landSize) userData.landSize = landSize;
        if (soilType) userData.soilType = soilType;
        if (irrigationType) userData.irrigationType = irrigationType;
        if (farmingType) userData.farmingType = farmingType;
        if (experience) userData.experience = experience;
      } else if (role === "agri_doctor" || role === "agriculture_expert") {
        if (qualification) userData.qualification = qualification;
        if (experience) userData.experience = experience;
        if (specialization) userData.specialization = specialization;
      }

      // Create new user
      const user = new User(userData);
      await user.save();

      // Generate OTP for mobile verification
      const otp = user.generateOTP();
      await user.save();

      // Send OTP via WhatsApp/SMS
      try {
        await whatsappService.sendOTP(mobile, otp, preferredLanguage || "en");
      } catch (error) {
        console.error("Failed to send OTP:", error);
        // Continue with registration even if OTP sending fails
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || "kisan-mitra-secret", {
        expiresIn: "30d",
      });

      // Add welcome points
      user.addPoints(100); // Welcome bonus
      await user.save();

      res.status(201).json({
        success: true,
        message: "User registered successfully. Please verify your mobile number.",
        token,
        user,
        otp: process.env.NODE_ENV === "development" ? otp : undefined,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
        error: error.message,
      });
    }
  },
);

// Login user
router.post(
  "/login",
  [
    body("mobile")
      .optional()
      .matches(/^[6-9]\d{9}$/)
      .withMessage("Please enter a valid mobile number"),
    body("email").optional().isEmail().withMessage("Please enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { mobile, email, password } = req.body;

      if (!mobile && !email) {
        return res.status(400).json({
          success: false,
          message: "Please provide mobile number or email",
        });
      }

      // Find user by mobile or email
      const user = await User.findOne({
        $or: [{ mobile }, ...(email ? [{ email }] : [])],
        isActive: true,
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Update login statistics
      user.lastLogin = new Date();
      user.lastSeen = new Date();
      user.loginCount += 1;

      // Add login points (daily bonus)
      const today = new Date().toDateString();
      const lastLoginDate = user.lastLogin ? user.lastLogin.toDateString() : null;

      if (lastLoginDate !== today) {
        user.addPoints(10); // Daily login bonus
      }

      await user.save();

      // Generate JWT token
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || "kisan-mitra-secret", {
        expiresIn: "30d",
      });

      res.json({
        success: true,
        message: "Login successful",
        token,
        user,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
        error: error.message,
      });
    }
  },
);

// Verify OTP - FIXED: Added proper middleware and validation
router.post(
  "/verify-otp",
  [
    body("mobile")
      .matches(/^[6-9]\d{9}$/)
      .withMessage("Please enter a valid mobile number"),
    body("otp")
      .isLength({ min: 4, max: 6 })
      .withMessage("OTP must be 4-6 digits"),
  ],
  auth, // Add auth middleware here
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { otp } = req.body;

      if (!otp) {
        return res.status(400).json({
          success: false,
          message: "OTP is required",
        });
      }

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.verifyOTP(otp)) {
        user.isVerified = true;
        user.verificationOTP = undefined;

        // Add verification bonus points
        user.addPoints(50);

        await user.save();

        res.json({
          success: true,
          message: "Mobile number verified successfully",
          user,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Invalid or expired OTP",
        });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({
        success: false,
        message: "OTP verification failed",
        error: error.message,
      });
    }
  }
);

// Resend OTP
router.post("/resend-otp", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is already verified",
      });
    }

    const otp = user.generateOTP();
    await user.save();

    // Send OTP via WhatsApp/SMS
    try {
      await whatsappService.sendOTP(user.mobile, otp, user.preferredLanguage);
    } catch (error) {
      console.error("Failed to send OTP:", error);
    }

    res.json({
      success: true,
      message: "OTP sent successfully",
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
      error: error.message,
    });
  }
});

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate("communityGroups.groupId", "name category memberCount")
      .populate("following", "name role profilePicture")
      .populate("bookmarkedSchemes", "name category")
      .select("-password -verificationOTP");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update last seen
    user.lastSeen = new Date();
    await user.save();

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user data",
      error: error.message,
    });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Define allowed updates based on role
    const commonUpdates = [
      "name",
      "email",
      "village",
      "district",
      "state",
      "pincode",
      "preferredLanguage",
      "voiceEnabled",
      "theme",
      "notifications",
      "education",
      "coordinates",
      "whatsappNumber",
      "socialMedia",
      "privacy",
    ];

    const farmerUpdates = [
      ...commonUpdates,
      "landSize",
      "soilType",
      "irrigationType",
      "farmingType",
      "experience",
      "annualIncome",
      "familyMembers",
      "dependents",
      "farmEquipment",
      "preferredCrops",
      "bankDetails",
      "kccDetails",
    ];

    const expertUpdates = [...commonUpdates, "qualification", "experience", "specialization", "license"];

    let allowedUpdates = commonUpdates;
    if (user.role === "farmer") {
      allowedUpdates = farmerUpdates;
    } else if (["agri_doctor", "agriculture_expert"].includes(user.role)) {
      allowedUpdates = expertUpdates;
    }

    // Update allowed fields
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        if (typeof req.body[key] === "object" && req.body[key] !== null && !Array.isArray(req.body[key])) {
          user[key] = { ...user[key], ...req.body[key] };
        } else {
          user[key] = req.body[key];
        }
      }
    });

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
});

// Add crop to history
router.post("/crop-history", auth, async (req, res) => {
  try {
    const {
      year,
      season,
      cropName,
      variety,
      area,
      cropYield,
      profit,
      loss,
      challenges,
      fertilizers,
      pesticides,
      notes,
    } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "farmer") {
      return res.status(403).json({
        success: false,
        message: "Only farmers can add crop history",
      });
    }

    // Check if crop history for this year and season already exists
    const existingIndex = user.cropHistory.findIndex(
      (crop) => crop.year === year && crop.season === season && crop.cropName === cropName,
    );

    const cropData = {
      year,
      season,
      cropName,
      variety,
      area,
      yield: cropYield,
      profit,
      loss,
      challenges: challenges || [],
      fertilizers: fertilizers || [],
      pesticides: pesticides || [],
      notes,
    };

    if (existingIndex !== -1) {
      user.cropHistory[existingIndex] = cropData;
    } else {
      user.cropHistory.push(cropData);
    }

    // Add points for adding crop history
    user.addPoints(25);

    await user.save();

    res.json({
      success: true,
      message: "Crop history updated successfully",
      cropHistory: user.cropHistory,
    });
  } catch (error) {
    console.error("Crop history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update crop history",
      error: error.message,
    });
  }
});

// Update current crops
router.put("/current-crops", auth, async (req, res) => {
  try {
    const { currentCrops } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "farmer") {
      return res.status(403).json({
        success: false,
        message: "Only farmers can update current crops",
      });
    }

    user.currentCrops = currentCrops;
    await user.save();

    res.json({
      success: true,
      message: "Current crops updated successfully",
      currentCrops: user.currentCrops,
    });
  } catch (error) {
    console.error("Current crops error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update current crops",
      error: error.message,
    });
  }
});

// Change password
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
});

// Follow/Unfollow user
router.post("/follow/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.userId);
    const targetUser = await User.findById(userId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (userId === req.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const isFollowing = currentUser.following.includes(userId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter((id) => id.toString() !== userId);
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== req.userId);
    } else {
      // Follow
      currentUser.following.push(userId);
      targetUser.followers.push(req.userId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      success: true,
      message: isFollowing ? "User unfollowed successfully" : "User followed successfully",
      isFollowing: !isFollowing,
    });
  } catch (error) {
    console.error("Follow/Unfollow error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to follow/unfollow user",
      error: error.message,
    });
  }
});

// Get user's followers
router.get("/followers", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate(
      "followers",
      "name role profilePicture village district state",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      followers: user.followers,
    });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get followers",
      error: error.message,
    });
  }
});

// Get user's following
router.get("/following", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate(
      "following",
      "name role profilePicture village district state",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      following: user.following,
    });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get following",
      error: error.message,
    });
  }
});

// Logout (invalidate token on client side)
router.post("/logout", auth, async (req, res) => {
  try {
    // Update last seen
    const user = await User.findById(req.userId);
    if (user) {
      user.lastSeen = new Date();
      await user.save();
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
});

// Export the router
module.exports = router;