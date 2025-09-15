const mongoose = require("mongoose")
const CropRecommendation = require("../models/CropRecommendation")
const GovernmentScheme = require("../models/GovernmentScheme")
const FarmingIdea = require("../models/FarmingIdea")
const MarketPrice = require("../models/MarketPrice")
require("dotenv").config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/kisan-mitra")

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...")

    // Clear existing data
    await CropRecommendation.deleteMany({})
    await GovernmentScheme.deleteMany({})
    await FarmingIdea.deleteMany({})
    await MarketPrice.deleteMany({})

    // Seed crop recommendations
    await seedCropRecommendations()

    // Seed government schemes
    await seedGovernmentSchemes()

    // Seed farming ideas
    await seedFarmingIdeas()

    // Seed market prices
    await seedMarketPrices()

    console.log("✅ Database seeding completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Database seeding failed:", error)
    process.exit(1)
  }
}

async function seedCropRecommendations() {
  const crops = [
    {
      cropName: "Rice",
      localNames: { en: "Rice", hi: "चावल", te: "వరి" },
      category: "cereal",
      season: "kharif",
      duration: 120,
      suitableSoils: ["clay", "loamy", "alluvial"],
      climateRequirements: {
        temperature: { min: 20, max: 35, optimal: 25 },
        rainfall: { min: 1000, max: 2000, optimal: 1500 },
        humidity: { min: 70, max: 90 },
      },
      sowingTime: { start: "June", end: "July", optimal: "Mid-June" },
      harvestTime: { start: "October", end: "November" },
      expectedYield: { min: 30, max: 50, average: 40 },
      marketPrice: { min: 2000, max: 3000, average: 2500 },
      profitability: "high",
      suitableStates: ["Andhra Pradesh", "Telangana", "Tamil Nadu", "West Bengal"],
      marketDemand: "high",
      waterRequirement: "high",
      adaptabilityScore: 85,
      riskFactor: "medium",
    },
    {
      cropName: "Cotton",
      localNames: { en: "Cotton", hi: "कपास", te: "పత్తి" },
      category: "cash-crop",
      season: "kharif",
      duration: 180,
      suitableSoils: ["black", "red", "alluvial"],
      climateRequirements: {
        temperature: { min: 21, max: 35, optimal: 28 },
        rainfall: { min: 500, max: 1000, optimal: 750 },
        humidity: { min: 60, max: 80 },
      },
      sowingTime: { start: "May", end: "June", optimal: "Late May" },
      harvestTime: { start: "October", end: "January" },
      expectedYield: { min: 15, max: 25, average: 20 },
      marketPrice: { min: 5000, max: 7000, average: 6000 },
      profitability: "very-high",
      suitableStates: ["Andhra Pradesh", "Telangana", "Maharashtra", "Gujarat"],
      marketDemand: "very-high",
      waterRequirement: "medium",
      adaptabilityScore: 80,
      riskFactor: "medium",
    },
    // Add more crops...
  ]

  await CropRecommendation.insertMany(crops)
  console.log("✅ Crop recommendations seeded")
}

async function seedGovernmentSchemes() {
  const schemes = [
    {
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
      category: "financial_assistance",
      level: "central",
      coverage: "national",
      targetBeneficiaries: ["small_farmers", "marginal_farmers"],
      financialBenefit: {
        type: "fixed-amount",
        amount: 6000,
        frequency: "annual",
        installments: 3,
      },
      applicableStates: ["All States"],
      status: "active",
      priority: 1,
      featured: true,
    },
    // Add more schemes...
  ]

  await GovernmentScheme.insertMany(schemes)
  console.log("✅ Government schemes seeded")
}

async function seedFarmingIdeas() {
  const ideas = [
    {
      title: {
        en: "Vermicomposting for Organic Fertilizer",
        hi: "जैविक उर्वरक के लिए वर्मीकम्पोस्टिंग",
        te: "సేంద్రీయ ఎరువుల కోసం వర్మీకంపోస్టింగ్",
      },
      shortDescription: {
        en: "Create nutrient-rich organic fertilizer using earthworms",
        hi: "केंचुओं का उपयोग करके पोषक तत्वों से भरपूर जैविक उर्वरक बनाएं",
        te: "వానపాములను ఉపయోగించి పోషకాలతో కూడిన సేంద్రీయ ఎరువులను తయారు చేయండి",
      },
      detailedDescription: {
        en: "Vermicomposting is an eco-friendly method to convert organic waste into high-quality fertilizer using earthworms. This process creates nutrient-rich compost that improves soil health and crop yield.",
      },
      category: "organic-farming",
      difficulty: "beginner",
      implementationTime: { value: 2, unit: "months" },
      cost: { range: "low", estimatedAmount: { min: 2000, max: 5000 } },
      suitableFor: {
        landSize: ["small", "medium", "large"],
        soilTypes: ["any"],
        crops: ["All crops"],
      },
      isFeatured: true,
      rating: { average: 4.5, count: 150 },
    },
    // Add more ideas...
  ]

  await FarmingIdea.insertMany(ideas)
  console.log("✅ Farming ideas seeded")
}

async function seedMarketPrices() {
  const prices = []
  const crops = ["Rice", "Cotton", "Wheat", "Turmeric", "Maize"]
  const districts = ["Guntur", "Krishna", "Vijayawada", "Hyderabad"]

  // Generate prices for last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    crops.forEach((crop) => {
      districts.forEach((district) => {
        const basePrice = crop === "Turmeric" ? 8000 : crop === "Cotton" ? 5800 : 2500
        const variation = (Math.random() - 0.5) * 200
        const modalPrice = Math.round(basePrice + variation)

        prices.push({
          cropName: crop,
          variety: "Standard",
          market: {
            name: `${district} Market`,
            district: district,
            state: "Andhra Pradesh",
          },
          prices: {
            minimum: modalPrice - 100,
            maximum: modalPrice + 100,
            modal: modalPrice,
            average: modalPrice,
          },
          date: date,
          arrivals: Math.floor(Math.random() * 200) + 50,
          trend: {
            direction: Math.random() > 0.5 ? "up" : "down",
            percentage: Math.random() * 10,
          },
        })
      })
    })
  }

  await MarketPrice.insertMany(prices)
  console.log("✅ Market prices seeded")
}

// Run the seeding
seedDatabase()
