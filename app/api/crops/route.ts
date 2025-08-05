import { NextResponse } from "next/server"

// Mock crop recommendation data
const mockCropData = {
  recommendations: [
    {
      crop: "Rice",
      variety: "Basmati 1121",
      season: "Kharif",
      suitability: 95,
      reasons: [
        "Optimal temperature range (25-30°C)",
        "Good rainfall expected",
        "High market demand",
        "Suitable soil type",
      ],
      expectedYield: "40-45 quintals/hectare",
      marketPrice: "₹2500/quintal",
      profitability: "High",
      sowingTime: "June-July",
      harvestTime: "November-December",
      waterRequirement: "High",
      fertilizers: ["Urea", "DAP", "Potash"],
      diseases: ["Blast", "Brown Spot", "Sheath Blight"],
      preventiveMeasures: ["Use certified seeds", "Proper water management", "Timely application of fertilizers"],
    },
    {
      crop: "Cotton",
      variety: "Bt Cotton",
      season: "Kharif",
      suitability: 88,
      reasons: [
        "High market prices",
        "Suitable climate conditions",
        "Good export demand",
        "Pest resistant variety available",
      ],
      expectedYield: "15-20 quintals/hectare",
      marketPrice: "₹5800/quintal",
      profitability: "Very High",
      sowingTime: "May-June",
      harvestTime: "October-January",
      waterRequirement: "Medium",
      fertilizers: ["Urea", "DAP", "Zinc Sulphate"],
      diseases: ["Bollworm", "Whitefly", "Aphids"],
      preventiveMeasures: ["Use Bt cotton seeds", "Integrated pest management", "Regular monitoring"],
    },
    {
      crop: "Sugarcane",
      variety: "Co-86032",
      season: "Annual",
      suitability: 82,
      reasons: [
        "Long growing season",
        "Assured market through sugar mills",
        "Good water availability",
        "Government support price",
      ],
      expectedYield: "80-100 tonnes/hectare",
      marketPrice: "₹350/quintal",
      profitability: "Medium",
      sowingTime: "February-March",
      harvestTime: "December-March",
      waterRequirement: "Very High",
      fertilizers: ["Urea", "DAP", "Potash", "Micronutrients"],
      diseases: ["Red Rot", "Smut", "Wilt"],
      preventiveMeasures: ["Use disease-free setts", "Proper drainage", "Crop rotation"],
    },
  ],
  currentCrops: [
    {
      crop: "Rice",
      area: "2 hectares",
      stage: "Flowering",
      health: "Good",
      expectedHarvest: "November 2024",
      issues: [],
    },
  ],
  seasonalCalendar: {
    kharif: {
      season: "Kharif (Monsoon)",
      months: "June - October",
      crops: ["Rice", "Cotton", "Sugarcane", "Maize", "Pulses"],
    },
    rabi: {
      season: "Rabi (Winter)",
      months: "November - April",
      crops: ["Wheat", "Barley", "Gram", "Mustard", "Peas"],
    },
    zaid: {
      season: "Zaid (Summer)",
      months: "April - June",
      crops: ["Fodder", "Watermelon", "Cucumber", "Fodder Maize"],
    },
  },
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get("location")
  const season = searchParams.get("season")
  const soilType = searchParams.get("soilType")

  let data = mockCropData

  // Filter recommendations based on parameters
  if (season) {
    data = {
      ...mockCropData,
      recommendations: mockCropData.recommendations.filter((rec) =>
        rec.season.toLowerCase().includes(season.toLowerCase()),
      ),
    }
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600))

  return NextResponse.json({
    success: true,
    data: data,
    filters: { location, season, soilType },
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { cropType, area, soilType, previousCrop } = body

  // Generate personalized recommendations based on input
  const personalizedRecommendations = mockCropData.recommendations.map((rec) => ({
    ...rec,
    suitability: Math.max(60, rec.suitability - Math.random() * 20),
    customAdvice: `Based on your ${soilType} soil and ${area} hectare farm size, this crop is suitable for your conditions.`,
  }))

  return NextResponse.json({
    success: true,
    data: {
      ...mockCropData,
      recommendations: personalizedRecommendations,
    },
    input: { cropType, area, soilType, previousCrop },
    timestamp: new Date().toISOString(),
  })
}
