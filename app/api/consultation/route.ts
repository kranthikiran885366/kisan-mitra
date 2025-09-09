import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Consultation from "@/server/models/Consultation"

export async function GET(request: Request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const farmerId = searchParams.get("farmerId")
    const expertId = searchParams.get("expertId")
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    let query = {}
    
    if (farmerId) {
      query.farmer = farmerId
    }
    if (expertId) {
      query.expert = expertId
    }
    if (status) {
      query.status = status
    }
    if (type) {
      query.type = type
    }

    const skip = (page - 1) * limit

    const [consultations, total] = await Promise.all([
      Consultation.find(query)
        .populate("farmer", "name mobile district state")
        .populate("expert", "name qualification specialization rating")
        .populate("messages.sender", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Consultation.countDocuments(query)
    ])

    return NextResponse.json({
      success: true,
      data: {
        consultations: consultations.map(consultation => ({
          ...consultation,
          id: consultation._id.toString()
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
    console.error("Consultation fetch error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch consultations" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const {
      farmerId, type, priority, subject, description, cropDetails,
      location, attachments
    } = body

    const consultation = new Consultation({
      farmer: farmerId,
      type,
      priority: priority || "medium",
      subject,
      description,
      cropDetails,
      location,
      attachments: attachments || [],
      isUrgent: priority === "urgent"
    })

    await consultation.save()
    await consultation.autoAssignExpert()
    await consultation.populate([
      { path: "farmer", select: "name mobile district state" },
      { path: "expert", select: "name qualification specialization" }
    ])

    return NextResponse.json({
      success: true,
      data: {
        ...consultation.toObject(),
        id: consultation._id.toString()
      },
      message: "Consultation created successfully"
    })
  } catch (error) {
    console.error("Consultation creation error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create consultation" },
      { status: 500 }
    )
  }
}