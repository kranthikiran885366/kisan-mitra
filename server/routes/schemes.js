const express = require("express")
const GovernmentScheme = require("../models/GovernmentScheme")
const User = require("../models/User")
const auth = require("../middleware/auth")

const router = express.Router()

// Get all schemes with filtering
router.get("/", auth, async (req, res) => {
  try {
    const { category, state, targetGroup, status = "active", limit = 20, page = 1 } = req.query

    const query = { status }

    if (category) query.category = category
    if (state) query.applicableStates = { $in: [state, "All States"] }
    if (targetGroup) query.targetBeneficiaries = targetGroup

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    let schemes = await GovernmentScheme.find(query)
      .sort({ priority: -1, featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    // If no schemes found, return mock data
    if (schemes.length === 0) {
      schemes = getMockSchemes()
    }

    const total = await GovernmentScheme.countDocuments(query)

    res.json({
      success: true,
      data: {
        schemes,
        pagination: {
          current: Number.parseInt(page),
          total: Math.ceil(total / Number.parseInt(limit)),
          limit: Number.parseInt(limit),
          totalSchemes: total,
        },
      },
    })
  } catch (error) {
    console.error("Get schemes error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get schemes",
      error: error.message,
    })
  }
})

// Get personalized schemes for farmer
router.get("/personalized", auth, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.farmerId)
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      })
    }

    const query = { status: "active" }

    // Filter by farmer's state
    if (farmer.state) {
      query.$or = [
        { applicableStates: farmer.state },
        { applicableStates: "All States" },
        { applicableStates: { $size: 0 } },
      ]
    }

    let schemes = await GovernmentScheme.find(query).sort({ priority: -1, featured: -1 })

    // If no schemes found, use mock data
    if (schemes.length === 0) {
      schemes = getMockSchemes()
    }

    // Calculate eligibility and score for each scheme
    const personalizedSchemes = schemes.map((scheme) => {
      const eligibility = scheme.checkEligibility(farmer)
      return {
        ...scheme.toObject(),
        eligibility,
        personalizedAdvice: generatePersonalizedAdvice(scheme, farmer),
        applicationSteps: getSimplifiedApplicationSteps(scheme, farmer),
      }
    })

    // Sort by eligibility score and recommendation level
    personalizedSchemes.sort((a, b) => {
      const scoreA = a.eligibility.eligible ? a.eligibility.score : 0
      const scoreB = b.eligibility.eligible ? b.eligibility.score : 0
      return scoreB - scoreA
    })

    res.json({
      success: true,
      data: {
        schemes: personalizedSchemes,
        farmerProfile: {
          state: farmer.state,
          district: farmer.district,
          landSize: farmer.landSize,
          farmingType: farmer.farmingType,
          experience: farmer.experience,
        },
        summary: {
          totalSchemes: personalizedSchemes.length,
          eligible: personalizedSchemes.filter((s) => s.eligibility.eligible).length,
          highlyRecommended: personalizedSchemes.filter(
            (s) => s.eligibility.recommendationLevel === "highly-recommended",
          ).length,
        },
      },
    })
  } catch (error) {
    console.error("Personalized schemes error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get personalized schemes",
      error: error.message,
    })
  }
})

// Get scheme details
router.get("/:schemeId", auth, async (req, res) => {
  try {
    const scheme = await GovernmentScheme.findById(req.params.schemeId).populate("relatedSchemes")

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "Scheme not found",
      })
    }

    const farmer = await Farmer.findById(req.farmerId)
    const eligibility = scheme.checkEligibility(farmer)

    res.json({
      success: true,
      data: {
        ...scheme.toObject(),
        eligibility,
        applicationGuidance: getDetailedApplicationGuidance(scheme, farmer),
        requiredDocumentsChecklist: createDocumentsChecklist(scheme, farmer),
        timelineEstimate: calculateApplicationTimeline(scheme),
      },
    })
  } catch (error) {
    console.error("Get scheme details error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get scheme details",
      error: error.message,
    })
  }
})

// Get scheme categories
router.get("/meta/categories", auth, async (req, res) => {
  try {
    const categories = await GovernmentScheme.distinct("category")

    const categoryInfo = {
      "direct-benefit-transfer": {
        name: "Direct Benefit Transfer",
        icon: "credit-card",
        color: "green",
        description: "Direct cash transfers to farmers",
      },
      "crop-insurance": {
        name: "Crop Insurance",
        icon: "shield",
        color: "blue",
        description: "Protection against crop losses",
      },
      "loan-subsidy": {
        name: "Loan Subsidy",
        icon: "percent",
        color: "purple",
        description: "Subsidized loans for farming",
      },
      "equipment-subsidy": {
        name: "Equipment Subsidy",
        icon: "tool",
        color: "orange",
        description: "Subsidies on farm equipment",
      },
      "seed-subsidy": {
        name: "Seed Subsidy",
        icon: "seed",
        color: "green",
        description: "Quality seeds at subsidized rates",
      },
      "fertilizer-subsidy": {
        name: "Fertilizer Subsidy",
        icon: "flask",
        color: "yellow",
        description: "Fertilizers at reduced prices",
      },
      "training-program": {
        name: "Training Programs",
        icon: "book",
        color: "indigo",
        description: "Skill development for farmers",
      },
      "market-support": {
        name: "Market Support",
        icon: "trending-up",
        color: "emerald",
        description: "Market linkage and price support",
      },
      "irrigation-support": {
        name: "Irrigation Support",
        icon: "droplets",
        color: "cyan",
        description: "Water management and irrigation",
      },
      "organic-farming": {
        name: "Organic Farming",
        icon: "leaf",
        color: "lime",
        description: "Support for organic agriculture",
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

// Get featured schemes
router.get("/featured/list", auth, async (req, res) => {
  try {
    const featuredSchemes = await GovernmentScheme.getFeatured(6)

    if (featuredSchemes.length === 0) {
      return res.json({
        success: true,
        data: getMockSchemes().slice(0, 3),
      })
    }

    res.json({
      success: true,
      data: featuredSchemes,
    })
  } catch (error) {
    console.error("Featured schemes error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get featured schemes",
      error: error.message,
    })
  }
})

// Get urgent schemes (ending soon)
router.get("/urgent/list", auth, async (req, res) => {
  try {
    const urgentSchemes = await GovernmentScheme.getUrgent(30)

    res.json({
      success: true,
      data: urgentSchemes,
    })
  } catch (error) {
    console.error("Urgent schemes error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get urgent schemes",
      error: error.message,
    })
  }
})

// Check eligibility for specific scheme
router.post("/:schemeId/check-eligibility", auth, async (req, res) => {
  try {
    const scheme = await GovernmentScheme.findById(req.params.schemeId)
    const farmer = await Farmer.findById(req.farmerId)

    if (!scheme || !farmer) {
      return res.status(404).json({
        success: false,
        message: "Scheme or farmer not found",
      })
    }

    const eligibility = scheme.checkEligibility(farmer)

    res.json({
      success: true,
      data: eligibility,
    })
  } catch (error) {
    console.error("Check eligibility error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to check eligibility",
      error: error.message,
    })
  }
})

// Helper functions
function getMockSchemes() {
  return [
    {
      _id: "1",
      name: {
        en: "PM-KISAN Scheme",
        hi: "पीएम-किसान योजना",
        te: "పిఎం-కిసాన్ పథకం",
      },
      shortName: "PM-KISAN",
      description: {
        en: "Direct income support to farmers - ₹6000 per year in three installments",
        hi: "किसानों को प्रत्यक्ष आय सहायता - ₹6000 प्रति वर्ष तीन किस्तों में",
        te: "రైతులకు ప్రత్యక్ష ఆదాయ మద్దతు - సంవత్సరానికి ₹6000 మూడు వాయిదాలలో",
      },
      category: "direct-benefit-transfer",
      launchedBy: "central",
      targetBeneficiaries: ["small-farmers", "marginal-farmers"],
      eligibility: {
        en: ["Small and marginal farmers", "Land ownership required", "Aadhaar card mandatory"],
        hi: ["छोटे और सीमांत किसान", "भूमि स्वामित्व आवश्यक", "आधार कार्ड अनिवार्य"],
        te: ["చిన్న మరియు సామాన్య రైతులు", "భూమి యాజమాన్యం అవసరం", "ఆధార్ కార్డ్ తప్పనిసరి"],
      },
      financialBenefit: {
        type: "fixed-amount",
        amount: 6000,
        frequency: "annual",
        installments: 3,
      },
      requiredDocuments: [
        { name: "Aadhaar Card", mandatory: true },
        { name: "Bank Account Details", mandatory: true },
        { name: "Land Records", mandatory: true },
      ],
      applicationMode: ["online", "csc"],
      applicableStates: ["All States"],
      status: "active",
      priority: 1,
      featured: true,
      contactInfo: {
        website: "https://pmkisan.gov.in",
        helplineNumber: "155261",
      },
    },
    {
      _id: "2",
      name: {
        en: "Pradhan Mantri Fasal Bima Yojana",
        hi: "प्रधानमंत्री फसल बीमा योजना",
        te: "ప్రధానమంత్రి ఫసల్ బీమా యోజన",
      },
      shortName: "PMFBY",
      description: {
        en: "Crop insurance scheme providing coverage against crop loss due to natural calamities",
        hi: "प्राकृतिक आपदाओं के कारण फसल हानि के विरुद्ध कवरेज प्रदान करने वाली फसल बीमा योजना",
        te: "ప్రకృతి వైపరీత్యాల వల్ల పంట నష్టానికి వ్యతిరేకంగా కవరేజ్ అందించే పంట బీమా పథకం",
      },
      category: "crop-insurance",
      launchedBy: "central",
      targetBeneficiaries: ["all-farmers"],
      financialBenefit: {
        type: "insurance",
        maxAmount: 200000,
        frequency: "seasonal",
      },
      applicableStates: ["All States"],
      status: "active",
      priority: 2,
      featured: true,
    },
    {
      _id: "3",
      name: {
        en: "Kisan Credit Card",
        hi: "किसान क्रेडिट कार्ड",
        te: "కిసాన్ క్రెడిట్ కార్డ్",
      },
      shortName: "KCC",
      description: {
        en: "Credit facility for agricultural and allied activities at subsidized interest rates",
        hi: "सब्सिडी वाली ब्याज दरों पर कृषि और संबद्ध गतिविधियों के लिए ऋण सुविधा",
        te: "రాయితీ వడ్డీ రేట్లలో వ్యవసాయ మరియు అనుబంధ కార్యకలాపాలకు రుణ సౌకర్యం",
      },
      category: "loan-subsidy",
      launchedBy: "central",
      targetBeneficiaries: ["all-farmers"],
      financialBenefit: {
        type: "loan",
        maxAmount: 300000,
        frequency: "one-time",
      },
      applicableStates: ["All States"],
      status: "active",
      priority: 3,
    },
  ]
}

function generatePersonalizedAdvice(scheme, farmer) {
  const advice = []

  // Land size based advice
  if (scheme.landCriteria && scheme.landCriteria.maxLand) {
    if (farmer.landSize.value <= scheme.landCriteria.maxLand) {
      advice.push(`Your land size (${farmer.landSize.value} ${farmer.landSize.unit}) qualifies for this scheme`)
    }
  }

  // Experience based advice
  if (farmer.experience && farmer.experience < 5) {
    advice.push("As a new farmer, this scheme can provide valuable support for your farming journey")
  }

  // State specific advice
  if (scheme.applicableStates.includes(farmer.state) || scheme.applicableStates.includes("All States")) {
    advice.push(`This scheme is available in ${farmer.state}`)
  }

  // Category specific advice
  if (scheme.category === "direct-benefit-transfer") {
    advice.push("Direct cash benefit will be transferred to your bank account")
  } else if (scheme.category === "crop-insurance") {
    advice.push("Protect your crops against weather risks and natural disasters")
  } else if (scheme.category === "loan-subsidy") {
    advice.push("Get access to credit at lower interest rates for farming activities")
  }

  return advice
}

function getSimplifiedApplicationSteps(scheme, farmer) {
  const steps = []

  // Document preparation
  steps.push({
    step: 1,
    title: "Prepare Documents",
    description: "Gather all required documents",
    documents: scheme.requiredDocuments?.map((doc) => doc.name) || [],
    estimated_time: "1-2 days",
  })

  // Application submission
  if (scheme.applicationMode?.includes("online")) {
    steps.push({
      step: 2,
      title: "Online Application",
      description: `Visit ${scheme.contactInfo?.website || "official website"} and fill the application form`,
      estimated_time: "30 minutes",
    })
  } else {
    steps.push({
      step: 2,
      title: "Visit Office",
      description: "Visit nearest agriculture office or CSC center",
      estimated_time: "2-3 hours",
    })
  }

  // Verification
  steps.push({
    step: 3,
    title: "Document Verification",
    description: "Officials will verify your documents and eligibility",
    estimated_time: "7-15 days",
  })

  // Approval
  steps.push({
    step: 4,
    title: "Approval & Benefit",
    description: "Once approved, benefits will be processed as per scheme guidelines",
    estimated_time: "15-30 days",
  })

  return steps
}

function getDetailedApplicationGuidance(scheme, farmer) {
  return {
    beforeApplying: [
      "Ensure you meet all eligibility criteria",
      "Gather all required documents",
      "Have your bank account details ready",
      "Check application deadlines",
    ],
    duringApplication: [
      "Fill all details accurately",
      "Upload clear document copies",
      "Double-check all information",
      "Keep application reference number safe",
    ],
    afterApplication: [
      "Track application status regularly",
      "Respond to any queries promptly",
      "Keep all receipts and communications",
      "Contact helpline if needed",
    ],
    commonMistakes: [
      "Incomplete or incorrect information",
      "Poor quality document uploads",
      "Missing mandatory documents",
      "Not following up on application status",
    ],
  }
}

function createDocumentsChecklist(scheme, farmer) {
  const checklist = []

  if (scheme.requiredDocuments) {
    scheme.requiredDocuments.forEach((doc) => {
      checklist.push({
        document: doc.name,
        mandatory: doc.mandatory,
        status: "pending", // This would be updated based on farmer's uploaded documents
        alternatives: doc.alternatives || [],
        tips: getDocumentTips(doc.name),
      })
    })
  }

  return checklist
}

function getDocumentTips(documentName) {
  const tips = {
    "Aadhaar Card": ["Ensure Aadhaar is linked to mobile number", "Keep both original and photocopy"],
    "Bank Account Details": ["Account should be active", "Preferably in farmer's name"],
    "Land Records": ["Get latest revenue records", "Ensure name matches with Aadhaar"],
    "Income Certificate": ["Should be issued within last 3 years", "Get from tehsildar office"],
    "Caste Certificate": ["Required for reserved category benefits", "Should be valid and recent"],
  }

  return tips[documentName] || ["Ensure document is clear and valid"]
}

function calculateApplicationTimeline(scheme) {
  let totalDays = 0

  // Document preparation: 1-3 days
  totalDays += 2

  // Application submission: 1 day
  totalDays += 1

  // Processing time based on scheme type
  if (scheme.category === "direct-benefit-transfer") {
    totalDays += 15 // Usually faster
  } else if (scheme.category === "loan-subsidy") {
    totalDays += 30 // Requires more verification
  } else {
    totalDays += 21 // Average processing time
  }

  return {
    estimated_days: totalDays,
    phases: [
      { phase: "Document Preparation", days: 2 },
      { phase: "Application Submission", days: 1 },
      { phase: "Verification & Processing", days: totalDays - 3 },
    ],
    factors_affecting_timeline: [
      "Completeness of application",
      "Document verification time",
      "Scheme-specific processing requirements",
      "Peak application periods",
    ],
  }
}

module.exports = router
