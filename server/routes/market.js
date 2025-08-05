const express = require("express")
const axios = require("axios")
const MarketPrice = require("../models/MarketPrice")
const User = require("../models/User")
const marketService = require("../services/marketService")
const auth = require("../middleware/auth")

const router = express.Router()

// Get current market prices
router.get("/prices", auth, async (req, res) => {
  try {
    const { crop, district, state, limit = 20, sortBy = 'date' } = req.query

    const user = await User.findById(req.userId)
    const targetDistrict = district || user?.district
    const targetState = state || user?.state

    const query = {
      date: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    }

    if (crop) query.cropName = new RegExp(crop, "i")
    if (targetDistrict) query["market.district"] = new RegExp(targetDistrict, "i")
    if (targetState) query["market.state"] = new RegExp(targetState, "i")

    const sortOptions = {
      date: { date: -1 },
      price: { "prices.modal": -1 },
      change: { "trend.percentage": -1 },
      arrivals: { arrivals: -1 }
    }

    let prices = await MarketPrice.find(query)
      .sort(sortOptions[sortBy] || { date: -1 })
      .limit(Number.parseInt(limit))

    // If no data found, update with fresh data
    if (prices.length === 0) {
      await marketService.updateMarketPrices()
      prices = await MarketPrice.find(query)
        .sort(sortOptions[sortBy] || { date: -1 })
        .limit(Number.parseInt(limit))
    }

    // Calculate trends for each crop
    const pricesWithTrends = await Promise.all(
      prices.map(async (price) => {
        const trend = await MarketPrice.calculateTrend(price.cropName, price.market.district, 7)
        return {
          ...price.toObject(),
          trend,
          priceAnalysis: analyzePriceLevel(price),
        }
      }),
    )

    res.json({
      success: true,
      data: {
        prices: pricesWithTrends,
        location: {
          district: targetDistrict,
          state: targetState,
        },
        lastUpdated: new Date(),
        totalRecords: prices.length,
        filters: { crop, district, state, sortBy }
      },
    })
  } catch (error) {
    console.error("Market prices error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get market prices",
      error: error.message,
    })
  }
})

// Get price trends and charts
router.get("/trends", auth, async (req, res) => {
  try {
    const { crop, days = 30, district } = req.query
    const user = await User.findById(req.userId)
    const targetDistrict = district || user?.district

    let trendData = {}

    if (crop) {
      // Get trend for specific crop
      const history = await MarketPrice.getPriceHistory(crop, targetDistrict, Number.parseInt(days))
      trendData[crop] = history.map((h) => ({
        date: h.date,
        price: h.prices.modal,
        arrivals: h.arrivals,
      }))
    } else {
      // Get trends for multiple crops
      const crops = ["Rice", "Wheat", "Cotton", "Sugarcane", "Maize", "Turmeric", "Chilli", "Onion"]
      for (const cropName of crops) {
        const history = await MarketPrice.getPriceHistory(cropName, targetDistrict, Number.parseInt(days))
        if (history.length > 0) {
          trendData[cropName] = history.map((h) => ({
            date: h.date,
            price: h.prices.modal,
            arrivals: h.arrivals,
          }))
        }
      }
    }

    res.json({
      success: true,
      data: {
        trends: trendData,
        period: `${days} days`,
        location: targetDistrict,
        analysis: generateTrendAnalysis(trendData),
      },
    })
  } catch (error) {
    console.error("Price trends error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get price trends",
      error: error.message,
    })
  }
})

// Get market analysis and insights
router.get("/analysis", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)

    // Get analytics from service
    const analytics = await marketService.getMarketAnalytics(user.district, user.state)

    const analysis = {
      summary: {
        totalCrops: analytics.length,
        totalMarkets: await MarketPrice.distinct("market.district").then((markets) => markets.length),
        lastUpdated: new Date(),
        averagePriceChange: analytics.length > 0 ? 
          (analytics.reduce((sum, item) => sum + (item.priceChangePercent || 0), 0) / analytics.length).toFixed(2) : 0,
      },
      topGainers: await MarketPrice.getTopMovers("gainers", 5),
      topLosers: await MarketPrice.getTopMovers("losers", 5),
      cropAnalytics: analytics,
      marketInsights: generateMarketInsights(user),
      recommendations: generateMarketRecommendations(user),
      seasonalAnalysis: getSeasonalMarketAnalysis(),
    }

    res.json({
      success: true,
      data: analysis,
    })
  } catch (error) {
    console.error("Market analysis error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get market analysis",
      error: error.message,
    })
  }
})

// Get nearby markets
router.get("/nearby", auth, async (req, res) => {
  try {
    const { radius = 50 } = req.query
    const user = await User.findById(req.userId)

    // Get markets in the same state
    const nearbyMarkets = await MarketPrice.aggregate([
      {
        $match: {
          "market.state": user.state,
          date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            name: "$market.name",
            district: "$market.district",
            state: "$market.state"
          },
          crops: { $addToSet: "$cropName" },
          avgPrice: { $avg: "$prices.modal" },
          totalArrivals: { $sum: "$arrivals" },
          lastUpdate: { $max: "$date" }
        }
      },
      {
        $project: {
          name: "$_id.name",
          district: "$_id.district",
          state: "$_id.state",
          crops: 1,
          avgPrice: { $round: ["$avgPrice", 0] },
          totalArrivals: 1,
          lastUpdate: 1,
          distance: {
            $cond: {
              if: { $eq: ["$_id.district", user.district] },
              then: Math.floor(Math.random() * 20) + 5,
              else: Math.floor(Math.random() * 80) + 20
            }
          }
        }
      },
      {
        $sort: { distance: 1 }
      },
      {
        $limit: 10
      }
    ])

    res.json({
      success: true,
      data: {
        markets: nearbyMarkets,
        searchRadius: radius,
        farmerLocation: {
          district: user.district,
          state: user.state,
        },
      },
    })
  } catch (error) {
    console.error("Nearby markets error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get nearby markets",
      error: error.message,
    })
  }
})

// Get price alerts and notifications
router.get("/alerts", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    
    // Get user's crops for alerts
    const userCrops = user.primaryCrop ? [user.primaryCrop] : ['Rice', 'Wheat', 'Cotton']
    
    const alerts = await marketService.getPriceAlerts(req.userId, userCrops)
    
    // Add seasonal alerts
    const seasonalAlerts = getSeasonalMarketAlerts()
    alerts.push(...seasonalAlerts)

    res.json({
      success: true,
      data: alerts,
    })
  } catch (error) {
    console.error("Market alerts error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get market alerts",
      error: error.message,
    })
  }
})

// Get market forecast
router.get("/forecast", auth, async (req, res) => {
  try {
    const { crop, days = 7 } = req.query
    const user = await User.findById(req.userId)
    
    if (!crop) {
      return res.status(400).json({
        success: false,
        message: "Crop parameter is required"
      })
    }

    const forecast = await marketService.getMarketForecast(crop, user.district, parseInt(days))
    
    res.json({
      success: true,
      data: forecast
    })
  } catch (error) {
    console.error("Market forecast error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get market forecast",
      error: error.message,
    })
  }
})

// Update market prices (admin/cron)
router.post("/update", auth, async (req, res) => {
  try {
    const result = await marketService.updateMarketPrices()
    
    res.json({
      success: true,
      message: "Market prices updated successfully",
      data: result
    })
  } catch (error) {
    console.error("Market update error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update market prices",
      error: error.message,
    })
  }
})

// Get market statistics
router.get("/stats", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    
    const stats = await MarketPrice.aggregate([
      {
        $match: {
          "market.state": user.state,
          date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          avgPrice: { $avg: "$prices.modal" },
          maxPrice: { $max: "$prices.modal" },
          minPrice: { $min: "$prices.modal" },
          totalArrivals: { $sum: "$arrivals" },
          uniqueCrops: { $addToSet: "$cropName" },
          uniqueMarkets: { $addToSet: "$market.name" }
        }
      },
      {
        $project: {
          totalRecords: 1,
          avgPrice: { $round: ["$avgPrice", 0] },
          maxPrice: 1,
          minPrice: 1,
          totalArrivals: 1,
          totalCrops: { $size: "$uniqueCrops" },
          totalMarkets: { $size: "$uniqueMarkets" }
        }
      }
    ])

    res.json({
      success: true,
      data: stats[0] || {
        totalRecords: 0,
        avgPrice: 0,
        maxPrice: 0,
        minPrice: 0,
        totalArrivals: 0,
        totalCrops: 0,
        totalMarkets: 0
      }
    })
  } catch (error) {
    console.error("Market stats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get market statistics",
      error: error.message,
    })
  }
})

// Helper functions
function analyzePriceLevel(price) {
  const modal = price.prices.modal
  const min = price.prices.minimum
  const max = price.prices.maximum
  const range = max - min
  const position = range > 0 ? (modal - min) / range : 0.5

  let level = "average"
  if (position > 0.7) level = "high"
  else if (position < 0.3) level = "low"

  return {
    level,
    position: Math.round(position * 100),
    volatility: Math.round((range / modal) * 100),
    recommendation: getRecommendationByPriceLevel(level),
  }
}

function getRecommendationByPriceLevel(level) {
  const recommendations = {
    high: "Good time to sell - prices are at higher end",
    average: "Monitor market - prices are stable",
    low: "Consider holding - prices may improve",
  }
  return recommendations[level]
}

function generateTrendAnalysis(trendData) {
  const analysis = []

  Object.entries(trendData).forEach(([crop, data]) => {
    if (data.length >= 2) {
      const latest = data[data.length - 1].price
      const earliest = data[0].price
      const change = ((latest - earliest) / earliest) * 100

      analysis.push({
        crop,
        trend: change > 2 ? "increasing" : change < -2 ? "decreasing" : "stable",
        change: change.toFixed(2),
        recommendation: change > 5 ? "Consider selling" : change < -5 ? "Good buying opportunity" : "Monitor closely",
      })
    }
  })

  return analysis
}

function generateMarketInsights(user) {
  const insights = []
  const currentMonth = new Date().getMonth() + 1

  // Seasonal insights
  if (currentMonth >= 10 && currentMonth <= 12) {
    insights.push("Harvest season: Expect increased supply and potential price pressure")
  }

  // Regional insights
  if (user.state === "Andhra Pradesh") {
    insights.push("Andhra Pradesh is a major rice and cotton producing state - good market access")
  } else if (user.state === "Punjab") {
    insights.push("Punjab wheat and rice markets are well-established with good infrastructure")
  }

  // General market insights
  insights.push("Cotton prices showing strong upward trend due to export demand")
  insights.push("Rice market stable with adequate supply from recent harvest")
  insights.push("Turmeric prices expected to rise due to festival season demand")

  return insights
}

function generateMarketRecommendations(user) {
  const recommendations = []
  const currentMonth = new Date().getMonth() + 1

  // Seasonal recommendations
  if (currentMonth >= 4 && currentMonth <= 6) {
    recommendations.push({
      type: "planning",
      message: "Plan your kharif crops based on current market trends and expected monsoon",
      priority: "medium",
    })
  }

  if (currentMonth >= 10 && currentMonth <= 12) {
    recommendations.push({
      type: "selling",
      message: "Harvest season - consider staggered selling to get better prices",
      priority: "high",
    })
  }

  // General recommendations
  recommendations.push({
    type: "storage",
    message: "Consider proper storage facilities to sell when prices are favorable",
    priority: "medium",
  })

  return recommendations
}

function getSeasonalMarketAnalysis() {
  const currentMonth = new Date().getMonth() + 1
  let season = "kharif"

  if (currentMonth >= 11 || currentMonth <= 3) season = "rabi"
  else if (currentMonth >= 4 && currentMonth <= 6) season = "zaid"

  const analysis = {
    kharif: {
      trends: "Monsoon crops showing mixed trends",
      outlook: "Rice and cotton expected to perform well",
      risks: "Weather dependency high",
    },
    rabi: {
      trends: "Winter crops showing stable prices",
      outlook: "Wheat and gram demand steady",
      risks: "Cold wave impact possible",
    },
    zaid: {
      trends: "Summer crops limited but profitable",
      outlook: "Fodder crops in high demand",
      risks: "Water availability crucial",
    },
  }

  return analysis[season]
}

function getSeasonalMarketAlerts() {
  const alerts = []
  const currentMonth = new Date().getMonth() + 1

  if (currentMonth >= 10 && currentMonth <= 12) {
    alerts.push({
      type: "seasonal",
      message: "Harvest season: Prices may drop due to increased supply",
      recommendation: "Consider staggered selling or storage options",
      urgency: "medium",
    })
  }

  if (currentMonth >= 3 && currentMonth <= 5) {
    alerts.push({
      type: "seasonal",
      message: "Pre-monsoon period: Good time to sell stored produce",
      recommendation: "Clear old stock before new harvest",
      urgency: "high",
    })
  }

  return alerts
}

module.exports = router