import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import CropGuidance from "@/server/models/CropGuidance"

export async function GET(request: Request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const farmerId = searchParams.get("farmerId")
    const cropName = searchParams.get("cropName")
    const growthStage = searchParams.get("growthStage")
    const district = searchParams.get("district")

    let query = {}
    
    if (farmerId) {
      query.farmer = farmerId
    }
    if (cropName) {
      query.cropName = { $regex: cropName, $options: "i" }
    }
    if (growthStage) {
      query.growthStage = growthStage
    }
    if (district) {
      query["location.district"] = { $regex: district, $options: "i" }
    }

    const guidances = await CropGuidance.find(query)
      .populate("farmer", "name mobile district state")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    return NextResponse.json({
      success: true,
      data: guidances.map(guidance => ({
        ...guidance,
        id: guidance._id.toString()
      }))
    })
  } catch (error) {
    console.error("Crop guidance fetch error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch crop guidance" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const {
      farmerId, cropName, variety, location, growthStage,
      healthStatus, images, soilType
    } = body

    const guidance = new CropGuidance({
      farmer: farmerId,
      cropName,
      variety,
      location: {
        ...location,
        soilType
      },
      growthStage,
      healthStatus: healthStatus || { overall: "good", issues: [] },
      images: images || []
    })

    await guidance.generateCareRecommendations()
    await guidance.generateLocalizedAdvice()

    if (images && images.length > 0) {
      const mockAnalysis = {
        confidence: 85,
        diseaseDetected: Math.random() > 0.7 ? "Leaf Spot" : null,
        pestDetected: Math.random() > 0.8 ? "Aphids" : null
      }
      await guidance.processAIAnalysis(mockAnalysis)
    }

    await guidance.save()

    return NextResponse.json({
      success: true,
      data: {
        ...guidance.toObject(),
        id: guidance._id.toString()
      },
      message: "Crop guidance created successfully"
    })
  } catch (error) {
    console.error("Crop guidance creation error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create crop guidance" },
      { status: 500 }
    )
  }
}