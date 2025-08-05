import { NextResponse } from "next/server"

interface ApplicationData {
  schemeId: string
  userId: string
  personalInfo: {
    name: string
    phone: string
    email?: string
    aadhaar: string
  }
  farmingInfo: {
    landSize: number
    landUnit: string
    farmingType: string
    primaryCrop: string
    state: string
    district: string
    village: string
  }
  documents: {
    [key: string]: string // In real implementation, these would be file URLs
  }
}

// Mock applications storage
const mockApplications: any[] = []

export async function POST(request: Request) {
  try {
    const body: ApplicationData = await request.json()
    
    // Validate required fields
    if (!body.schemeId || !body.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "schemeId and userId are required"
        },
        { status: 400 }
      )
    }

    // Validate personal info
    if (!body.personalInfo?.name || !body.personalInfo?.phone || !body.personalInfo?.aadhaar) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing personal information",
          message: "Name, phone, and Aadhaar are required"
        },
        { status: 400 }
      )
    }

    // Validate farming info
    if (!body.farmingInfo?.state || !body.farmingInfo?.district) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing farming information",
          message: "State and district are required"
        },
        { status: 400 }
      )
    }

    // Generate application ID
    const applicationId = `APP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create application record
    const application = {
      id: applicationId,
      ...body,
      status: "submitted",
      submittedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      trackingNumber: `TRK${Date.now()}`,
      estimatedProcessingTime: "15-30 days"
    }

    // Store application (in real implementation, this would go to database)
    mockApplications.push(application)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Determine next steps based on scheme
    let nextSteps = [
      "Document verification will be completed within 7 days",
      "Field verification may be conducted if required",
      "Final approval and benefit disbursal"
    ]

    if (body.schemeId === "pm-kisan") {
      nextSteps = [
        "Aadhaar verification in progress",
        "Land records verification with revenue department",
        "Bank account validation",
        "First installment will be credited after approval"
      ]
    } else if (body.schemeId === "crop-insurance") {
      nextSteps = [
        "Premium calculation based on crop and area",
        "Policy document generation",
        "Coverage activation for current season",
        "SMS/Email confirmation will be sent"
      ]
    }

    return NextResponse.json({
      success: true,
      data: {
        applicationId,
        trackingNumber: application.trackingNumber,
        status: "submitted",
        message: "Application submitted successfully",
        estimatedProcessingTime: application.estimatedProcessingTime,
        nextSteps,
        submittedAt: application.submittedAt,
        contactInfo: {
          helpline: "1800-XXX-XXXX",
          email: "support@schemes.gov.in",
          website: "https://schemes.gov.in/track"
        }
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error submitting application:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit application",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve user applications
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "10")
    const page = parseInt(searchParams.get("page") || "1")

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing userId parameter"
        },
        { status: 400 }
      )
    }

    // Filter applications by user
    let userApplications = mockApplications.filter(app => app.userId === userId)

    // Filter by status if provided
    if (status) {
      userApplications = userApplications.filter(app => app.status === status)
    }

    // Sort by submission date (newest first)
    userApplications.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedApplications = userApplications.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: {
        applications: paginatedApplications,
        pagination: {
          current: page,
          total: Math.ceil(userApplications.length / limit),
          limit: limit,
          totalApplications: userApplications.length
        }
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch applications",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}