import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import CropDiagnosis from "@/server/models/CropDiagnosis"

export async function GET(request: Request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const farmerId = searchParams.get("farmerId")
    const status = searchParams.get("status")
    const cropName = searchParams.get("cropName")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    let query = {}
    
    if (farmerId) {
      query.farmer = farmerId
    }
    if (status) {
      query.status = status
    }
    if (cropName) {
      query.cropName = { $regex: cropName, $options: "i" }
    }

    const skip = (page - 1) * limit

    const [diagnoses, total] = await Promise.all([
      CropDiagnosis.find(query)
        .populate("farmer", "name mobile district state")
        .populate("expertReview.expert", "name qualification")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CropDiagnosis.countDocuments(query)
    ])

    return NextResponse.json({
      success: true,
      data: {
        diagnoses: diagnoses.map(diagnosis => ({
          ...diagnosis,
          id: diagnosis._id.toString()
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error("Crop diagnosis fetch error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch diagnoses" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const {
      farmerId, cropName, images, symptoms, location, weatherContext
    } = body

    const diagnosis = new CropDiagnosis({
      farmer: farmerId,
      cropName,
      images: images.map(img => ({
        url: img.url,
        type: img.type || "leaf"
      })),
      symptoms,
      location,
      weatherContext
    })

    await diagnosis.save()
    await diagnosis.processAIDiagnosis()
    await diagnosis.populate("farmer", "name mobile district state")

    return NextResponse.json({
      success: true,
      data: {
        ...diagnosis.toObject(),
        id: diagnosis._id.toString()
      },
      message: "Crop diagnosis created and processed successfully"
    })
  } catch (error) {
    console.error("Crop diagnosis creation error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create diagnosis" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { diagnosisId, action, ...updateData } = body

    const diagnosis = await CropDiagnosis.findById(diagnosisId)
    if (!diagnosis) {
      return NextResponse.json(
        { success: false, message: "Diagnosis not found" },
        { status: 404 }
      )
    }

    if (action === "add_followup") {
      const { status, notes, images, treatmentApplied } = updateData
      
      await diagnosis.addFollowUp(status, notes, images, treatmentApplied)
      
      return NextResponse.json({
        success: true,
        message: "Follow-up added successfully"
      })
    }

    if (action === "reprocess") {
      await diagnosis.processAIDiagnosis()
      await diagnosis.save()
      
      return NextResponse.json({
        success: true,
        data: {
          aiDiagnosis: diagnosis.aiDiagnosis,
          treatment: diagnosis.treatment
        },
        message: "Diagnosis reprocessed successfully"
      })
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Crop diagnosis update error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update diagnosis" },
      { status: 500 }
    )
  }
}