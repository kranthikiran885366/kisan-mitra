import { NextResponse } from "next/server"

// Mock scheme data - same as in main schemes route
const mockSchemesData = {
  schemes: [
    {
      id: "pm-kisan",
      title: "PM-KISAN Scheme",
      titleHi: "पीएम-किसान योजना",
      titleTe: "పిఎం-కిసాన్ పథకం",
      description: "Direct income support to farmers providing ₹6000 per year in three equal installments",
      descriptionHi: "किसानों को प्रत्यक्ष आय सहायता - ₹6000 प्रति वर्ष तीन समान किस्तों में",
      descriptionTe: "రైతులకు ప్రత్యక్ష ఆదాయ మద్దతు - సంవత్సరానికి ₹6000 మూడు సమాన వాయిదాలలో",
      amount: "₹6,000/year",
      deadline: "2024-12-31",
      status: "featured",
      category: "financial",
      level: "central",
      eligibility: "Small and marginal farmers",
      documents: ["Aadhaar Card", "Bank Account", "Land Records", "Passport Photo"],
      applicationLink: "https://pmkisan.gov.in",
      benefits: "Direct cash transfer to bank account, No middleman involvement, Quick processing, Timely payments",
      howToApply: "Visit official website, Fill online form, Upload documents, Submit application, Track status"
    },
    {
      id: "crop-insurance",
      title: "Pradhan Mantri Fasal Bima Yojana",
      titleHi: "प्रधानमंत्री फसल बीमा योजना",
      titleTe: "ప్రధానమంత్రి ఫసల్ బీమా యోజన",
      description: "Comprehensive crop insurance scheme providing coverage against crop loss due to natural calamities, pests & diseases",
      descriptionHi: "प्राकृतिक आपदाओं, कीटों और बीमारियों के कारण फसल हानि के विरुद्ध व्यापक फसल बीमा योजना",
      descriptionTe: "ప్రకృతి వైపరీత్యాలు, కీటకాలు మరియు వ్యాధుల వల్ల పంట నష్టానికి వ్యతిరేకంగా సమగ్ర పంట బీమా పథకం",
      amount: "Up to ₹2,00,000 coverage",
      deadline: "2024-07-15",
      status: "new",
      category: "insurance",
      level: "central",
      eligibility: "All farmers (owner/tenant)",
      documents: ["Aadhaar Card", "Bank Account", "Land Records", "Sowing Certificate", "Revenue Records"],
      applicationLink: "https://pmfby.gov.in",
      benefits: "Low premium rates, Quick claim settlement, Coverage for all stages of crop cycle",
      howToApply: "Register on PMFBY portal, Select crop and area, Pay premium, Get policy document"
    }
  ]
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get("language") || "en"
    
    // Find scheme by ID
    const scheme = mockSchemesData.schemes.find(s => s.id === params.id)
    
    if (!scheme) {
      return NextResponse.json(
        {
          success: false,
          error: "Scheme not found",
          message: `No scheme found with ID: ${params.id}`
        },
        { status: 404 }
      )
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      data: scheme,
      language: language,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching scheme details:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}