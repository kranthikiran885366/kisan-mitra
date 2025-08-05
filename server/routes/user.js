const express = require("express")
const Farmer = require("../models/Farmer")
const auth = require("../middleware/auth")

const router = express.Router()

// Get user dashboard data
router.get("/dashboard", auth, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.farmerId)
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      })
    }

    // Get dashboard statistics
    const dashboardData = {
      profile: {
        name: farmer.name,
        village: farmer.village,
        district: farmer.district,
        state: farmer.state,
        landSize: farmer.landSize,
        soilType: farmer.soilType,
        experience: farmer.experience,
        profileCompleteness: farmer.profileCompleteness,
      },
      farming: {
        currentCrops: farmer.currentCrops || [],
        cropHistory: farmer.cropHistory.slice(-5), // Last 5 seasons
        totalSeasons: farmer.cropHistory.length,
        averageYield: calculateAverageYield(farmer.cropHistory),
      },
      activity: {
        loginCount: farmer.loginCount,
        lastLogin: farmer.lastLogin,
        memberSince: farmer.createdAt,
        accountAge: Math.floor((new Date() - farmer.createdAt) / (1000 * 60 * 60 * 24)),
      },
      preferences: {
        language: farmer.preferredLanguage,
        voiceEnabled: farmer.voiceEnabled,
        notifications: farmer.notifications,
      },
    }

    res.json({
      success: true,
      data: dashboardData,
    })
  } catch (error) {
    console.error("Dashboard data error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get dashboard data",
      error: error.message,
    })
  }
})

// Get user statistics
router.get("/stats", auth, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.farmerId)
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      })
    }

    const stats = {
      farming: {
        totalLand: farmer.landSize.value,
        landUnit: farmer.landSize.unit,
        soilType: farmer.soilType,
        farmingType: farmer.farmingType,
        irrigationType: farmer.irrigationType,
        experience: farmer.experience,
      },
      crops: {
        totalSeasons: farmer.cropHistory.length,
        uniqueCrops: [...new Set(farmer.cropHistory.map((crop) => crop.cropName))].length,
        currentCrops: farmer.currentCrops?.length || 0,
        averageYield: calculateAverageYield(farmer.cropHistory),
        totalProfit: farmer.cropHistory.reduce((sum, crop) => sum + (crop.profit || 0), 0),
      },
      performance: {
        profileCompleteness: farmer.profileCompleteness,
        accountAge: Math.floor((new Date() - farmer.createdAt) / (1000 * 60 * 60 * 24)),
        loginFrequency: calculateLoginFrequency(farmer),
        lastActivity: farmer.lastLogin,
      },
    }

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("User stats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get user statistics",
      error: error.message,
    })
  }
})

// Get user notifications
router.get("/notifications", auth, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.farmerId)
    const notifications = []

    // Profile completion notifications
    if (farmer.profileCompleteness < 80) {
      notifications.push({
        id: "profile-incomplete",
        type: "info",
        title: "Complete Your Profile",
        message: `Your profile is ${farmer.profileCompleteness}% complete. Add more details for better recommendations.`,
        action: "Complete Profile",
        priority: "medium",
        createdAt: new Date(),
      })
    }

    // Crop-related notifications
    if (farmer.currentCrops && farmer.currentCrops.length > 0) {
      farmer.currentCrops.forEach((crop) => {
        if (crop.expectedHarvest && new Date(crop.expectedHarvest) - new Date() < 7 * 24 * 60 * 60 * 1000) {
          notifications.push({
            id: `harvest-${crop.cropName}`,
            type: "warning",
            title: "Harvest Time Approaching",
            message: `Your ${crop.cropName} is ready for harvest in less than a week.`,
            action: "View Crop Details",
            priority: "high",
            createdAt: new Date(),
          })
        }
      })
    }

    // Seasonal notifications
    const currentMonth = new Date().getMonth() + 1
    if (currentMonth === 5) {
      notifications.push({
        id: "monsoon-prep",
        type: "info",
        title: "Monsoon Preparation",
        message: "Monsoon season is approaching. Prepare your fields for kharif crops.",
        action: "View Crop Recommendations",
        priority: "medium",
        createdAt: new Date(),
      })
    }

    // Welcome notification for new users
    if (farmer.loginCount <= 3) {
      notifications.push({
        id: "welcome",
        type: "success",
        title: "Welcome to Kisan Mitra!",
        message: "Explore weather updates, crop recommendations, and market prices to boost your farming success.",
        action: "Take Tour",
        priority: "low",
        createdAt: farmer.createdAt,
      })
    }

    res.json({
      success: true,
      data: notifications.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }),
    })
  } catch (error) {
    console.error("Notifications error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get notifications",
      error: error.message,
    })
  }
})

// Update notification preferences
router.put("/notifications/preferences", auth, async (req, res) => {
  try {
    const { notifications } = req.body

    const farmer = await Farmer.findById(req.farmerId)
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      })
    }

    farmer.notifications = { ...farmer.notifications, ...notifications }
    await farmer.save()

    res.json({
      success: true,
      message: "Notification preferences updated successfully",
      data: farmer.notifications,
    })
  } catch (error) {
    console.error("Update notifications error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update notification preferences",
      error: error.message,
    })
  }
})

// Get user activity log
router.get("/activity", auth, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.farmerId)
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      })
    }

    // Mock activity log - in production, you'd track actual user activities
    const activities = [
      {
        id: "1",
        type: "login",
        description: "Logged into Kisan Mitra",
        timestamp: farmer.lastLogin,
        details: { device: "Mobile", location: farmer.district },
      },
      {
        id: "2",
        type: "profile_update",
        description: "Updated farming profile",
        timestamp: farmer.updatedAt,
        details: { fields: ["soilType", "landSize"] },
      },
      {
        id: "3",
        type: "crop_added",
        description: "Added crop to current season",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        details: { crop: farmer.currentCrops?.[0]?.cropName || "Rice" },
      },
    ]

    res.json({
      success: true,
      data: activities,
    })
  } catch (error) {
    console.error("Activity log error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get activity log",
      error: error.message,
    })
  }
})

// Helper functions
function calculateAverageYield(cropHistory) {
  if (!cropHistory || cropHistory.length === 0) return 0

  const totalYield = cropHistory.reduce((sum, crop) => sum + (crop.yield || 0), 0)
  return Math.round(totalYield / cropHistory.length)
}

function calculateLoginFrequency(farmer) {
  const accountAge = Math.floor((new Date() - farmer.createdAt) / (1000 * 60 * 60 * 24))
  if (accountAge === 0) return farmer.loginCount

  return Math.round((farmer.loginCount / accountAge) * 7) // Logins per week
}

module.exports = router
