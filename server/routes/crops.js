const express = require("express");
const CropRecommendation = require("../models/CropRecommendation");
const User = require("../models/User"); // FIXED: Changed from Farmer to User
const auth = require("../middleware/auth");

const router = express.Router();

// Get personalized crop recommendations
router.get("/recommendations", auth, async (req, res) => {
  try {
    const { season, limit = 10 } = req.query;

    const user = await User.findById(req.userId); // FIXED: Changed from req.farmerId to req.userId
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Only farmers can get crop recommendations
    if (user.role !== "farmer") {
      return res.status(403).json({
        success: false,
        message: "Only farmers can access crop recommendations",
      });
    }

    // Determine current season if not provided
    let currentSeason = season;
    if (!currentSeason) {
      const month = new Date().getMonth() + 1;
      if (month >= 6 && month <= 10) currentSeason = "kharif";
      else if (month >= 11 || month <= 3) currentSeason = "rabi";
      else currentSeason = "zaid";
    }

    // Get crop recommendations based on user profile
    let recommendations = await CropRecommendation.find({
      season: currentSeason,
      suitableSoils: user.soilType,
      suitableStates: user.state,
      isActive: true,
    }).limit(Number.parseInt(limit));

    // If no specific recommendations, get general ones
    if (recommendations.length === 0) {
      recommendations = await CropRecommendation.find({
        season: currentSeason,
        isActive: true,
      }).limit(Number.parseInt(limit));
    }

    // Calculate recommendation scores
    const scoredRecommendations = recommendations.map((crop) => {
      const score = crop.calculateScore ? crop.calculateScore(user) : 75; // Fallback score
      return {
        ...crop.toObject(),
        recommendationScore: score,
        suitabilityReason: generateSuitabilityReason(crop, user),
        riskAssessment: calculateRiskAssessment(crop, user),
      };
    });

    // Sort by recommendation score
    scoredRecommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);

    res.json({
      success: true,
      data: {
        recommendations: scoredRecommendations,
        season: currentSeason,
        farmerProfile: {
          soilType: user.soilType,
          state: user.state,
          district: user.district,
          landSize: user.landSize,
          experience: user.experience,
          farmingType: user.farmingType,
        },
      },
    });
  } catch (error) {
    console.error("Crop recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get crop recommendations",
      error: error.message,
    });
  }
});

// Get crop details
router.get("/:cropId", auth, async (req, res) => {
  try {
    const crop = await CropRecommendation.findById(req.params.cropId);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    const user = await User.findById(req.userId); // FIXED: Changed from req.farmerId
    const score = crop.calculateScore ? crop.calculateScore(user) : 75; // Fallback score

    res.json({
      success: true,
      data: {
        ...crop.toObject(),
        recommendationScore: score,
        personalizedAdvice: generatePersonalizedAdvice(crop, user),
      },
    });
  } catch (error) {
    console.error("Get crop details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get crop details",
      error: error.message,
    });
  }
});

// Get farming calendar
router.get("/calendar/seasonal", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId); // FIXED: Changed from req.farmerId
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "farmer") {
      return res.status(403).json({
        success: false,
        message: "Only farmers can access farming calendar",
      });
    }

    const currentMonth = new Date().getMonth() + 1;
    const currentSeason = getCurrentSeason(currentMonth);

    // Get seasonal activities
    const activities = getSeasonalActivities(currentSeason, currentMonth, user);

    // Get recommended crops for current season
    const seasonalCrops = await CropRecommendation.find({
      season: currentSeason,
      suitableSoils: user.soilType,
      isActive: true,
    }).limit(5);

    const calendar = {
      currentSeason,
      currentMonth: new Date().toLocaleString("default", { month: "long" }),
      activities,
      recommendedCrops: seasonalCrops,
      upcomingTasks: generateUpcomingTasks(user),
      seasonalTips: getSeasonalTips(currentSeason, user.soilType),
    };

    res.json({
      success: true,
      data: calendar,
    });
  } catch (error) {
    console.error("Seasonal calendar error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get seasonal calendar",
      error: error.message,
    });
  }
});

// Disease detection simulation
router.post("/disease-detection", auth, async (req, res) => {
  try {
    const { imageBase64, cropType, symptoms } = req.body;

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock disease detection results
    const diseases = [
      {
        name: "Late Blight",
        confidence: 92,
        severity: "high",
        symptoms: ["Dark brown spots on leaves", "White fuzzy growth on undersides", "Yellowing of leaves"],
        organicTreatments: [
          "Copper sulfate spray (2g per liter)",
          "Neem oil treatment (5ml per liter)",
          "Baking soda spray (1 tsp per liter)",
        ],
        chemicalTreatments: [
          "Mancozeb fungicide (2g per liter)",
          "Chlorothalonil spray (2ml per liter)",
          "Metalaxyl + Mancozeb (2g per liter)",
        ],
        preventiveMeasures: [
          "Improve air circulation between plants",
          "Avoid overhead watering",
          "Remove infected plant debris",
          "Crop rotation with non-host plants",
        ],
        estimatedLoss: "20-40% if untreated",
        treatmentCost: "₹500-800 per acre",
      },
      {
        name: "Powdery Mildew",
        confidence: 88,
        severity: "medium",
        symptoms: ["White powdery coating on leaves", "Yellowing of leaves", "Stunted growth"],
        organicTreatments: [
          "Milk spray solution (1:10 ratio)",
          "Baking soda spray (1 tsp per liter)",
          "Neem oil (5ml per liter)",
        ],
        chemicalTreatments: [
          "Myclobutanil fungicide (1ml per liter)",
          "Trifloxystrobin spray (0.5ml per liter)",
          "Sulfur dust application",
        ],
        preventiveMeasures: [
          "Reduce humidity around plants",
          "Proper plant spacing",
          "Avoid nitrogen over-fertilization",
        ],
        estimatedLoss: "10-25% if untreated",
        treatmentCost: "₹300-500 per acre",
      },
    ];

    const detectedDisease = diseases[Math.floor(Math.random() * diseases.length)];

    res.json({
      success: true,
      data: {
        detected: true,
        disease: detectedDisease,
        analysisTime: "2.3 seconds",
        recommendations: [
          "Apply recommended treatment immediately",
          "Monitor other plants for similar symptoms",
          "Improve field sanitation practices",
          "Consider consulting local agricultural expert",
        ],
        followUpActions: [
          "Re-examine plants after 7 days",
          "Document treatment effectiveness",
          "Share results with extension officer",
        ],
      },
    });
  } catch (error) {
    console.error("Disease detection error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to detect disease",
      error: error.message,
    });
  }
});

// Get crop categories
router.get("/meta/categories", auth, async (req, res) => {
  try {
    const categories = await CropRecommendation.distinct("category");

    const categoryInfo = {
      cereal: { name: "Cereals", icon: "wheat", color: "amber" },
      pulse: { name: "Pulses", icon: "circle", color: "green" },
      oilseed: { name: "Oilseeds", icon: "droplet", color: "yellow" },
      "cash-crop": { name: "Cash Crops", icon: "dollar-sign", color: "emerald" },
      vegetable: { name: "Vegetables", icon: "carrot", color: "orange" },
      fruit: { name: "Fruits", icon: "apple", color: "red" },
      spice: { name: "Spices", icon: "pepper", color: "purple" },
      fodder: { name: "Fodder", icon: "grass", color: "lime" },
    };

    const result = categories.map((cat) => ({
      value: cat,
      ...categoryInfo[cat],
    }));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get categories",
      error: error.message,
    });
  }
});

// Helper functions
function generateSuitabilityReason(crop, user) {
  const reasons = [];

  if (crop.suitableSoils && crop.suitableSoils.includes(user.soilType)) {
    reasons.push(`Perfect for ${user.soilType} soil`);
  }

  if (crop.suitableStates && crop.suitableStates.includes(user.state)) {
    reasons.push(`Recommended for ${user.state}`);
  }

  if (crop.marketDemand === "high" || crop.marketDemand === "very-high") {
    reasons.push("High market demand");
  }

  if (crop.profitability === "high" || crop.profitability === "very-high") {
    reasons.push("High profitability potential");
  }

  if (crop.waterRequirement === "low" && user.irrigationType === "rainfed") {
    reasons.push("Suitable for rainfed conditions");
  }

  return reasons.length > 0 ? reasons.join(", ") : "General recommendation based on season";
}

function calculateRiskAssessment(crop, user) {
  let riskScore = 0;
  const risks = [];

  // Market risk
  if (crop.marketDemand === "low") {
    riskScore += 20;
    risks.push("Low market demand");
  }

  // Climate risk
  if (crop.waterRequirement === "high" && user.irrigationType === "rainfed") {
    riskScore += 25;
    risks.push("High water requirement with rainfed farming");
  }

  // Experience risk
  const experienceLevel = getExperienceLevel(user.experience);
  if (experienceLevel === "beginner" && crop.riskFactor === "high") {
    riskScore += 20;
    risks.push("Complex crop for beginner farmers");
  }

  // Investment risk
  if (crop.investmentRequired && crop.investmentRequired.total > 50000) {
    riskScore += 15;
    risks.push("High initial investment required");
  }

  let riskLevel = "low";
  if (riskScore > 40) riskLevel = "high";
  else if (riskScore > 20) riskLevel = "medium";

  return {
    level: riskLevel,
    score: riskScore,
    factors: risks,
  };
}

function generatePersonalizedAdvice(crop, user) {
  const advice = [];

  // Soil-specific advice
  if (crop.suitableSoils && crop.suitableSoils.includes(user.soilType)) {
    advice.push(`Your ${user.soilType} soil is ideal for ${crop.cropName}`);
  }

  // Experience-based advice
  const experienceLevel = getExperienceLevel(user.experience);
  if (experienceLevel === "beginner") {
    advice.push("Start with a small area to gain experience");
    advice.push("Consult local agricultural extension officer");
  }

  // Land size advice
  if (user.landSize && user.landSize.value < 2) {
    advice.push("Consider intensive farming methods for better returns");
  }

  // Irrigation advice
  if (user.irrigationType === "rainfed" && crop.waterRequirement === "high") {
    advice.push("Consider installing drip irrigation for better water management");
  }

  return advice;
}

function getExperienceLevel(experience) {
  if (!experience || experience < 3) return "beginner";
  if (experience < 10) return "intermediate";
  return "experienced";
}

function getCurrentSeason(month) {
  if (month >= 6 && month <= 10) return "kharif";
  if (month >= 11 || month <= 3) return "rabi";
  return "zaid";
}

function getSeasonalActivities(season, month, user) {
  const activities = {
    kharif: [
      "Prepare fields for monsoon crops",
      "Check and repair irrigation systems",
      "Procure quality seeds and fertilizers",
      "Plan crop layout and spacing",
      "Apply pre-monsoon fertilizers",
      "Sow rice, cotton, sugarcane, maize",
      "Monitor weather forecasts",
      "Prepare for pest management",
    ],
    rabi: [
      "Harvest kharif crops",
      "Prepare fields for winter crops",
      "Apply organic manure",
      "Sow wheat, barley, gram, mustard",
      "Plan irrigation schedule",
      "Apply winter fertilizers",
      "Monitor for winter pests",
      "Prepare storage facilities",
    ],
    zaid: [
      "Harvest rabi crops",
      "Prepare for summer crops",
      "Focus on water conservation",
      "Sow fodder crops and vegetables",
      "Install shade nets if needed",
      "Plan drip irrigation",
      "Prepare for monsoon season",
      "Maintain farm equipment",
    ],
  };

  return activities[season] || [];
}

function generateUpcomingTasks(user) {
  const tasks = [];
  const currentMonth = new Date().getMonth() + 1;

  // Generate tasks based on current crops and season
  if (user.currentCrops && user.currentCrops.length > 0) {
    user.currentCrops.forEach((crop) => {
      if (crop.stage === "flowering") {
        tasks.push({
          task: `Monitor ${crop.cropName} for pest attacks`,
          priority: "high",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        });
      }
      if (crop.expectedHarvest && new Date(crop.expectedHarvest) - new Date() < 30 * 24 * 60 * 60 * 1000) {
        tasks.push({
          task: `Prepare for ${crop.cropName} harvest`,
          priority: "medium",
          dueDate: new Date(crop.expectedHarvest),
        });
      }
    });
  }

  // Seasonal tasks
  if (currentMonth === 5) {
    tasks.push({
      task: "Prepare fields for monsoon sowing",
      priority: "high",
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    });
  }

  return tasks;
}

function getSeasonalTips(season, soilType) {
  const tips = {
    kharif: [
      "Ensure proper drainage to prevent waterlogging",
      "Monitor for fungal diseases due to high humidity",
      "Use certified seeds for better germination",
      "Apply organic matter to improve soil health",
    ],
    rabi: [
      "Protect crops from cold waves",
      "Ensure adequate irrigation during dry spells",
      "Apply phosphorus-rich fertilizers for root development",
      "Monitor for aphid and other winter pests",
    ],
    zaid: [
      "Provide shade to protect from extreme heat",
      "Use mulching to conserve soil moisture",
      "Increase irrigation frequency",
      "Harvest early morning to avoid heat stress",
    ],
  };

  return tips[season] || [];
}

module.exports = router;