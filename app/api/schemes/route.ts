import { NextResponse } from "next/server"

// Mock government schemes data with comprehensive information
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
      benefits: "Direct cash transfer to bank account, No middleman involvement, Quick processing",
      howToApply: "Visit official website, Fill online form, Upload documents, Submit application"
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
    },
    {
      id: "soil-health",
      title: "Soil Health Card Scheme",
      titleHi: "मृदा स्वास्थ्य कार्ड योजना",
      titleTe: "మట్టి ఆరోగ్య కార్డ్ పథకం",
      description: "Free soil testing and nutrient-based fertilizer recommendations to improve soil health and crop productivity",
      descriptionHi: "मिट्टी के स्वास्थ्य और फसल उत्पादकता में सुधार के लिए मुफ्त मिट्टी परीक्षण और पोषक तत्व आधारित उर्वरक सिफारिशें",
      descriptionTe: "మట్టి ఆరోగ్యం మరియు పంట ఉత్పాదకతను మెరుగుపరచడానికి ఉచిత మట్టి పరీక్ష మరియు పోషక మూలకాల ఆధారిత ఎరువుల సిఫార్సులు",
      amount: "Free Service",
      deadline: "2024-09-30",
      status: "active",
      category: "technical",
      level: "central",
      eligibility: "All farmers",
      documents: ["Aadhaar Card", "Land Records", "Mobile Number"],
      applicationLink: "https://soilhealth.dac.gov.in",
      benefits: "Free soil testing, Customized fertilizer recommendations, Improved crop yield",
      howToApply: "Contact local agriculture office, Provide soil samples, Receive soil health card"
    },
    {
      id: "kisan-credit",
      title: "Kisan Credit Card (KCC)",
      titleHi: "किसान क्रेडिट कार्ड",
      titleTe: "కిసాన్ క్రెడిట్ కార్డ్",
      description: "Credit facility for agricultural and allied activities at subsidized interest rates with flexible repayment",
      descriptionHi: "लचीली चुकौती के साथ सब्सिडी वाली ब्याज दरों पर कृषि और संबद्ध गतिविधियों के लिए ऋण सुविधा",
      descriptionTe: "సరళమైన తిరిగి చెల్లింపుతో రాయితీ వడ్డీ రేట్లలో వ్యవసాయ మరియు అనుబంధ కార్యకలాపాలకు రుణ సౌకర్యం",
      amount: "Up to ₹3,00,000",
      deadline: "2024-08-31",
      status: "active",
      category: "credit",
      level: "central",
      eligibility: "Farmers with land ownership/tenancy",
      documents: ["Aadhaar Card", "PAN Card", "Land Records", "Bank Account", "Income Certificate"],
      applicationLink: "https://kcc.gov.in",
      benefits: "Low interest rates, No collateral for loans up to ₹1.6L, Flexible repayment",
      howToApply: "Visit nearest bank branch, Fill KCC application form, Submit documents, Get card after approval"
    },
    {
      id: "organic-farming",
      title: "Paramparagat Krishi Vikas Yojana",
      titleHi: "परंपरागत कृषि विकास योजना",
      titleTe: "పరంపరాగత కృషి వికాస్ యోజన",
      description: "Promotion of organic farming through cluster approach and certification support",
      descriptionHi: "क्लस्टर दृष्टिकोण और प्रमाणन सहायता के माध्यम से जैविक खेती को बढ़ावा",
      descriptionTe: "క్లస్టర్ విధానం మరియు ధృవీకరణ మద్దతు ద్వారా సేంద్రీయ వ్యవసాయాన్ని ప్రోత్సహించడం",
      amount: "₹50,000/hectare",
      deadline: "2024-10-15",
      status: "active",
      category: "technical",
      level: "central",
      eligibility: "Farmers interested in organic farming",
      documents: ["Aadhaar Card", "Land Records", "Bank Account", "Group Formation Certificate"],
      applicationLink: "https://pgsindia-ncof.gov.in",
      benefits: "Financial assistance for organic inputs, Certification support, Premium prices for organic produce",
      howToApply: "Form farmer groups, Register with implementing agency, Submit cluster plan, Get approval"
    },
    {
      id: "drip-irrigation",
      title: "Micro Irrigation Scheme",
      titleHi: "सूक्ष्म सिंचाई योजना",
      titleTe: "మైక్రో ఇరిగేషన్ పథకం",
      description: "Subsidy for drip and sprinkler irrigation systems to promote water-efficient farming",
      descriptionHi: "जल-कुशल खेती को बढ़ावा देने के लिए ड्रिप और स्प्रिंकलर सिंचाई प्रणालियों के लिए सब्सिडी",
      descriptionTe: "నీటి-సమర్థవంతమైన వ్యవసాయాన్ని ప్రోత్సహించడానికి డ్రిప్ మరియు స్ప్రింక్లర్ నీటిపారుదల వ్యవస్థలకు రాయితీ",
      amount: "55% subsidy (90% for SC/ST)",
      deadline: "2024-11-30",
      status: "featured",
      category: "technical",
      level: "central",
      eligibility: "All categories of farmers",
      documents: ["Aadhaar Card", "Land Records", "Bank Account", "Water Source Certificate", "Quotation"],
      applicationLink: "https://pmksy.gov.in",
      benefits: "Water saving up to 50%, Increased crop yield, Reduced labor cost",
      howToApply: "Apply through agriculture department, Get technical approval, Install system, Claim subsidy"
    }
  ],
  categories: [
    { id: "financial", name: "Financial Support", nameHi: "वित्तीय सहायता", nameTe: "ఆర్థిక మద్దతు" },
    { id: "insurance", name: "Insurance", nameHi: "बीमा", nameTe: "బీమా" },
    { id: "technical", name: "Technical Support", nameHi: "तकनीकी सहायता", nameTe: "సాంకేతిక మద్దతు" },
    { id: "credit", name: "Credit Facilities", nameHi: "ऋण सुविधाएं", nameTe: "రుణ సౌకర్యాలు" },
  ],
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const level = searchParams.get("level")
  const search = searchParams.get("search")
  const language = searchParams.get("language") || "en"
  const limit = parseInt(searchParams.get("limit") || "20")
  const page = parseInt(searchParams.get("page") || "1")

  let filteredSchemes = [...mockSchemesData.schemes]

  // Filter by category
  if (category && category !== "all") {
    filteredSchemes = filteredSchemes.filter((scheme) => scheme.category === category)
  }

  // Filter by level
  if (level && level !== "all") {
    filteredSchemes = filteredSchemes.filter((scheme) => scheme.level === level)
  }

  // Search filter
  if (search) {
    const searchLower = search.toLowerCase()
    filteredSchemes = filteredSchemes.filter((scheme) => {
      const title = scheme.title.toLowerCase()
      const description = scheme.description.toLowerCase()
      const titleHi = scheme.titleHi?.toLowerCase() || ""
      const titleTe = scheme.titleTe?.toLowerCase() || ""
      const descriptionHi = scheme.descriptionHi?.toLowerCase() || ""
      const descriptionTe = scheme.descriptionTe?.toLowerCase() || ""
      
      return title.includes(searchLower) || 
             description.includes(searchLower) ||
             titleHi.includes(searchLower) ||
             titleTe.includes(searchLower) ||
             descriptionHi.includes(searchLower) ||
             descriptionTe.includes(searchLower)
    })
  }

  // Pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedSchemes = filteredSchemes.slice(startIndex, endIndex)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return NextResponse.json({
    success: true,
    data: {
      schemes: paginatedSchemes,
      categories: mockSchemesData.categories,
      pagination: {
        current: page,
        total: Math.ceil(filteredSchemes.length / limit),
        limit: limit,
        totalSchemes: filteredSchemes.length
      },
      filters: {
        category,
        level,
        search
      }
    },
    language: language,
    timestamp: new Date().toISOString(),
  })
}

// POST endpoint for scheme applications
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { schemeId, userId, applicationData } = body

    // Simulate application processing
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock application response
    const applicationId = `APP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return NextResponse.json({
      success: true,
      data: {
        applicationId,
        status: "submitted",
        message: "Application submitted successfully",
        estimatedProcessingTime: "15-30 days",
        nextSteps: [
          "Document verification will be done within 7 days",
          "Field verification if required",
          "Final approval and benefit disbursal"
        ]
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit application",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}