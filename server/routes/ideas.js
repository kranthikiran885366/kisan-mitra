const express = require("express")
const FarmingIdea = require("../models/FarmingIdea")
const Farmer = require("../models/Farmer")
const auth = require("../middleware/auth")

const router = express.Router()

// Get personalized farming ideas
router.get("/personalized", auth, async (req, res) => {
  try {
    const { limit = 10, category, difficulty } = req.query

    const farmer = await Farmer.findById(req.farmerId)
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      })
    }

    let ideas = await FarmingIdea.getPersonalizedIdeas(farmer, Number.parseInt(limit))

    // Apply additional filters if provided
    if (category) {
      ideas = ideas.filter((idea) => idea.category === category)
    }
    if (difficulty) {
      ideas = ideas.filter((idea) => idea.difficulty === difficulty)
    }

    // If no personalized ideas found, get general ideas
    if (ideas.length === 0) {
      ideas = await FarmingIdea.find({ isActive: true })
        .sort({ isFeatured: -1, "rating.average": -1 })
        .limit(Number.parseInt(limit))
    }

    // Add implementation scores
    const ideasWithScores = ideas.map((idea) => ({
      ...idea.toObject(),
      implementationScore: idea.getImplementationScore(farmer),
      personalizedTips: generatePersonalizedTips(idea, farmer),
    }))

    res.json({
      success: true,
      data: {
        ideas: ideasWithScores,
        farmerProfile: {
          soilType: farmer.soilType,
          landSize: farmer.landSize,
          experience: farmer.experience,
          farmingType: farmer.farmingType,
        },
      },
    })
  } catch (error) {
    console.error("Personalized ideas error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get personalized ideas",
      error: error.message,
    })
  }
})

// Get ideas by category
router.get("/category/:category", auth, async (req, res) => {
  try {
    const { category } = req.params
    const { limit = 20 } = req.query

    const ideas = await FarmingIdea.getByCategory(category, Number.parseInt(limit))

    res.json({
      success: true,
      data: ideas,
    })
  } catch (error) {
    console.error("Ideas by category error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get ideas by category",
      error: error.message,
    })
  }
})

// Get trending ideas
router.get("/trending", auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const trendingIdeas = await FarmingIdea.getTrending(30, Number.parseInt(limit))

    res.json({
      success: true,
      data: trendingIdeas,
    })
  } catch (error) {
    console.error("Trending ideas error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get trending ideas",
      error: error.message,
    })
  }
})

// Get idea details
router.get("/:ideaId", auth, async (req, res) => {
  try {
    const idea = await FarmingIdea.findById(req.params.ideaId).populate("relatedIdeas")

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: "Idea not found",
      })
    }

    // Increment view count
    await idea.incrementView()

    const farmer = await Farmer.findById(req.farmerId)
    const implementationScore = idea.getImplementationScore(farmer)

    res.json({
      success: true,
      data: {
        ...idea.toObject(),
        implementationScore,
        implementationPlan: generateImplementationPlan(idea, farmer),
        costBreakdown: generateCostBreakdown(idea, farmer),
      },
    })
  } catch (error) {
    console.error("Get idea details error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get idea details",
      error: error.message,
    })
  }
})

// Get idea categories
router.get("/meta/categories", auth, async (req, res) => {
  try {
    const categories = await FarmingIdea.distinct("category")

    const categoryInfo = {
      "organic-farming": {
        name: "Organic Farming",
        icon: "leaf",
        color: "green",
        description: "Chemical-free farming methods",
      },
      "natural-fertilizers": {
        name: "Natural Fertilizers",
        icon: "flask",
        color: "emerald",
        description: "Homemade and organic fertilizers",
      },
      "pest-control": {
        name: "Pest Control",
        icon: "bug",
        color: "red",
        description: "Natural pest management techniques",
      },
      "irrigation-techniques": {
        name: "Irrigation Techniques",
        icon: "droplets",
        color: "blue",
        description: "Water-efficient irrigation methods",
      },
      "soil-management": {
        name: "Soil Management",
        icon: "mountain",
        color: "amber",
        description: "Soil health improvement techniques",
      },
      "crop-rotation": {
        name: "Crop Rotation",
        icon: "refresh-cw",
        color: "purple",
        description: "Sustainable cropping patterns",
      },
      intercropping: {
        name: "Intercropping",
        icon: "grid",
        color: "orange",
        description: "Multiple crops in same field",
      },
      "water-conservation": {
        name: "Water Conservation",
        icon: "save",
        color: "cyan",
        description: "Water saving techniques",
      },
      "post-harvest": {
        name: "Post Harvest",
        icon: "package",
        color: "yellow",
        description: "Storage and processing methods",
      },
      "value-addition": {
        name: "Value Addition",
        icon: "trending-up",
        color: "indigo",
        description: "Adding value to farm produce",
      },
      marketing: {
        name: "Marketing",
        icon: "megaphone",
        color: "pink",
        description: "Direct marketing strategies",
      },
      technology: {
        name: "Technology",
        icon: "smartphone",
        color: "slate",
        description: "Modern farming technologies",
      },
    }

    const result = categories.map((cat) => ({
      value: cat,
      ...categoryInfo[cat],
    }))

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get categories",
      error: error.message,
    })
  }
})

// Like an idea
router.post("/:ideaId/like", auth, async (req, res) => {
  try {
    const idea = await FarmingIdea.findById(req.params.ideaId)

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: "Idea not found",
      })
    }

    await idea.incrementLike()

    res.json({
      success: true,
      message: "Idea liked successfully",
      likes: idea.popularity.likes,
    })
  } catch (error) {
    console.error("Like idea error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to like idea",
      error: error.message,
    })
  }
})

// Mark idea as implemented
router.post("/:ideaId/implement", auth, async (req, res) => {
  try {
    const { feedback, results, images } = req.body

    const idea = await FarmingIdea.findById(req.params.ideaId)
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: "Idea not found",
      })
    }

    await idea.incrementImplementation()

    // In a full implementation, you would save the farmer's implementation details
    // For now, we'll just acknowledge the implementation

    res.json({
      success: true,
      message: "Implementation recorded successfully",
      data: {
        implementationCount: idea.popularity.implementations,
        feedback: "Thank you for implementing this idea!",
      },
    })
  } catch (error) {
    console.error("Implement idea error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to record implementation",
      error: error.message,
    })
  }
})

// Search ideas
router.get("/search/query", auth, async (req, res) => {
  try {
    const { q, category, difficulty, cost, limit = 20 } = req.query

    const query = { isActive: true }

    // Text search
    if (q) {
      query.$or = [
        { "title.en": { $regex: q, $options: "i" } },
        { "shortDescription.en": { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ]
    }

    // Category filter
    if (category) query.category = category

    // Difficulty filter
    if (difficulty) query.difficulty = difficulty

    // Cost filter
    if (cost) query["cost.range"] = cost

    const ideas = await FarmingIdea.find(query)
      .sort({ "rating.average": -1, "popularity.views": -1 })
      .limit(Number.parseInt(limit))

    res.json({
      success: true,
      data: {
        ideas,
        searchQuery: q,
        filters: { category, difficulty, cost },
        totalResults: ideas.length,
      },
    })
  } catch (error) {
    console.error("Search ideas error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to search ideas",
      error: error.message,
    })
  }
})

// Helper functions
function generatePersonalizedTips(idea, farmer) {
  const tips = []

  // Soil-specific tips
  if (idea.suitableFor.soilTypes.includes(farmer.soilType)) {
    tips.push(`Perfect for your ${farmer.soilType} soil type`)
  }

  // Land size tips
  const landCategory = farmer.landSize.value <= 5 ? "small" : farmer.landSize.value <= 20 ? "medium" : "large"
  if (idea.suitableFor.landSize.includes(landCategory)) {
    tips.push(`Suitable for your ${landCategory} farm size`)
  }

  // Experience-based tips
  const experienceLevel = farmer.getExperienceLevel()
  if (experienceLevel === "beginner" && idea.difficulty === "beginner") {
    tips.push("Great starting point for new farmers")
  } else if (experienceLevel === "expert" && idea.difficulty === "advanced") {
    tips.push("Advanced technique matching your expertise")
  }

  // Farming type tips
  if (farmer.farmingType === "organic" && idea.category === "organic-farming") {
    tips.push("Aligns with your organic farming approach")
  }

  return tips
}

function generateImplementationPlan(idea, farmer) {
  const plan = {
    phases: [],
    timeline: idea.implementationTime,
    prerequisites: [],
    resources: [],
  }

  // Generate phases based on idea steps
  if (idea.steps && idea.steps.length > 0) {
    idea.steps.forEach((step, index) => {
      plan.phases.push({
        phase: index + 1,
        title: step.title.en,
        description: step.description.en,
        duration: step.duration,
        tips: step.tips,
        warnings: step.warnings,
      })
    })
  }

  // Prerequisites based on farmer profile
  if (idea.difficulty === "advanced" && farmer.getExperienceLevel() === "beginner") {
    plan.prerequisites.push("Consider getting training or consulting an expert")
  }

  if (idea.cost.range === "high" && farmer.landSize.value < 5) {
    plan.prerequisites.push("Evaluate financial feasibility for your farm size")
  }

  // Resources needed
  if (idea.materials && idea.materials.length > 0) {
    plan.resources = idea.materials.map((material) => ({
      name: material.name,
      quantity: material.quantity,
      estimatedCost: material.cost,
      availability: material.localAvailability,
      alternatives: material.alternatives,
    }))
  }

  return plan
}

function generateCostBreakdown(idea, farmer) {
  const breakdown = {
    materials: 0,
    labor: 0,
    equipment: 0,
    miscellaneous: 0,
    total: 0,
  }

  if (idea.materials && idea.materials.length > 0) {
    breakdown.materials = idea.materials.reduce((sum, material) => sum + (material.cost || 0), 0)
  }

  // Estimate other costs based on idea complexity and farmer's land size
  const landMultiplier = farmer.landSize.value / 5 // Base calculation for 5 acres

  if (idea.difficulty === "advanced") {
    breakdown.labor = breakdown.materials * 0.3 * landMultiplier
    breakdown.equipment = breakdown.materials * 0.2 * landMultiplier
  } else if (idea.difficulty === "intermediate") {
    breakdown.labor = breakdown.materials * 0.2 * landMultiplier
    breakdown.equipment = breakdown.materials * 0.1 * landMultiplier
  } else {
    breakdown.labor = breakdown.materials * 0.1 * landMultiplier
    breakdown.equipment = breakdown.materials * 0.05 * landMultiplier
  }

  breakdown.miscellaneous = (breakdown.materials + breakdown.labor + breakdown.equipment) * 0.1
  breakdown.total = breakdown.materials + breakdown.labor + breakdown.equipment + breakdown.miscellaneous

  return {
    ...breakdown,
    currency: "INR",
    note: "Costs are estimated and may vary based on location and market conditions",
    savings: idea.expectedResults?.costReduction
      ? `Potential savings: ${idea.expectedResults.costReduction.percentage}% - ${idea.expectedResults.costReduction.description}`
      : null,
  }
}

module.exports = router
