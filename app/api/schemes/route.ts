import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'

// Scheme model
const schemeSchema = new mongoose.Schema({
  schemeId: String,
  title: String,
  titleHi: String,
  titleTe: String,
  description: String,
  descriptionHi: String,
  descriptionTe: String,
  category: String,
  level: String,
  ministry: String,
  deadline: Date,
  amount: {
    min: Number,
    max: Number,
    unit: String,
    description: String
  },
  eligibility: {
    landSize: { min: Number, max: Number },
    category: [String],
    state: [String]
  },
  benefits: [String],
  documents: [String],
  applicationProcess: {
    online: Boolean,
    url: String,
    steps: [String]
  },
  status: String,
  featured: Boolean,
  applicationCount: Number,
  successRate: Number,
  tags: [String]
}, { timestamps: true })

const Scheme = mongoose.models.Scheme || mongoose.model('Scheme', schemeSchema)

const mockSchemes = [
  {
    id: '1',
    title: 'PM-KISAN Samman Nidhi',
    titleHi: 'पीएम-किसान सम्मान निधि',
    titleTe: 'పిఎం-కిసాన్ సమ్మాన్ నిధి',
    description: 'Direct income support of ₹6,000 per year to small and marginal farmers',
    descriptionHi: 'छोटे और सीमांत किसानों को प्रति वर्ष ₹6,000 की प्रत्यक्ष आय सहायता',
    descriptionTe: 'చిన్న మరియు సరిహద్దు రైతులకు సంవత్సరానికి ₹6,000 ప్రత్యక్ష ఆదాయ మద్దతు',
    amount: '₹6,000/year',
    deadline: '2024-12-31',
    status: 'active',
    category: 'financial',
    level: 'central',
    eligibility: 'Small & Marginal Farmers',
    documents: ['Aadhaar Card', 'Bank Account', 'Land Records', 'Mobile Number'],
    applicationLink: 'https://pmkisan.gov.in/',
    benefits: 'Direct cash transfer in 3 installments'
  },
  {
    id: '2',
    title: 'Pradhan Mantri Fasal Bima Yojana',
    titleHi: 'प्रधानमंत्री फसल बीमा योजना',
    titleTe: 'ప్రధానమంత్రి ఫసల్ బీమా యోజన',
    description: 'Crop insurance scheme providing financial support against crop loss',
    descriptionHi: 'फसल हानि के विरुद्ध वित्तीय सहायता प्रदान करने वाली फसल बीमा योजना',
    descriptionTe: 'పంట నష్టానికి వ్యతిరేకంగా ఆర్థిక మద్దతు అందించే పంట బీమా పథకం',
    amount: 'Up to ₹2 Lakh',
    deadline: '2024-11-30',
    status: 'featured',
    category: 'insurance',
    level: 'central',
    eligibility: 'All Farmers',
    documents: ['Aadhaar Card', 'Bank Account', 'Land Records', 'Sowing Certificate'],
    applicationLink: 'https://pmfby.gov.in/',
    benefits: 'Comprehensive risk cover for crops'
  },
  {
    id: '3',
    title: 'Kisan Credit Card',
    titleHi: 'किसान क्रेडिट कार्ड',
    titleTe: 'కిసాన్ క్రెడిట్ కార్డ్',
    description: 'Credit facility for farmers to meet agricultural expenses',
    descriptionHi: 'कृषि व्यय को पूरा करने के लिए किसानों के लिए ऋण सुविधा',
    descriptionTe: 'వ్యవసాయ ఖర్చులను తీర్చడానికి రైతులకు రుణ సౌకర్యం',
    amount: 'Up to ₹3 Lakh',
    deadline: '2024-12-15',
    status: 'active',
    category: 'credit',
    level: 'central',
    eligibility: 'Farmers with Land Records',
    documents: ['Aadhaar Card', 'PAN Card', 'Land Records', 'Income Certificate'],
    applicationLink: 'https://www.nabard.org/kcc.aspx',
    benefits: 'Low interest rate, flexible repayment'
  },
  {
    id: '4',
    title: 'Soil Health Card Scheme',
    titleHi: 'मृदा स्वास्थ्य कार्ड योजना',
    titleTe: 'మట్టి ఆరోగ్య కార్డ్ పథకం',
    description: 'Free soil testing and nutrient management recommendations',
    descriptionHi: 'मुफ्त मिट्टी परीक्षण और पोषक तत्व प्रबंधन सिफारिशें',
    descriptionTe: 'ఉచిత మట్టి పరీక్ష మరియు పోషక నిర్వహణ సిఫార్సులు',
    amount: 'Free Service',
    deadline: '2024-10-31',
    status: 'new',
    category: 'technical',
    level: 'central',
    eligibility: 'All Farmers',
    documents: ['Aadhaar Card', 'Land Records'],
    applicationLink: 'https://soilhealth.dac.gov.in/',
    benefits: 'Improved soil fertility and crop yield'
  },
  {
    id: '5',
    title: 'Rythu Bandhu Scheme',
    titleHi: 'रायथु बंधु योजना',
    titleTe: 'రైతు బంధు పథకం',
    description: 'Telangana state investment support scheme for farmers',
    descriptionHi: 'किसानों के लिए तेलंगाना राज्य निवेश सहायता योजना',
    descriptionTe: 'రైతులకు తెలంగాణ రాష్ట్र పెట్టుబడి మద్दతు పథకం',
    amount: '₹10,000/acre',
    deadline: '2024-11-15',
    status: 'active',
    category: 'financial',
    level: 'state',
    eligibility: 'Telangana Farmers',
    documents: ['Aadhaar Card', 'Land Records', 'Bank Account', 'Residence Proof'],
    applicationLink: 'https://rythubandhu.telangana.gov.in/',
    benefits: 'Direct investment support per acre'
  },
  {
    id: '6',
    title: 'Organic Farming Promotion',
    titleHi: 'जैविक खेती प्रोत्साहन',
    titleTe: 'సేంద్రీయ వ్యవసాయ ప్రోత్సాహం',
    description: 'Financial assistance for organic farming practices and certification',
    descriptionHi: 'जैविक खेती प्रथाओं और प्रमाणन के लिए वित्तीय सहायता',
    descriptionTe: 'సేంద్రీయ వ్యవసాయ పద్ధతులు మరియు ధృవీకరణకు ఆర్థిక సహాయం',
    amount: '₹50,000/hectare',
    deadline: '2024-12-20',
    status: 'featured',
    category: 'technical',
    level: 'central',
    eligibility: 'Progressive Farmers',
    documents: ['Aadhaar Card', 'Land Records', 'Training Certificate'],
    applicationLink: 'https://pgsindia-ncof.gov.in/',
    benefits: 'Premium prices for organic produce'
  }
]

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const search = searchParams.get('search')
    const state = searchParams.get('state')
    const status = searchParams.get('status') || 'active'
    const featured = searchParams.get('featured')
    const sortBy = searchParams.get('sortBy') || 'deadline'
    const language = searchParams.get('language') || 'en'
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    // Build filter object
    const filter: any = {}
    
    if (category && category !== 'all') filter.category = category
    if (level && level !== 'all') filter.level = level
    if (status && status !== 'all') filter.status = status
    if (featured === 'true') filter.featured = true
    if (state) filter['eligibility.state'] = { $in: [state, 'All States'] }

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { titleHi: { $regex: search, $options: 'i' } },
        { titleTe: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    // Sort options
    let sortOptions: any = {}
    switch (sortBy) {
      case 'deadline':
        sortOptions = { deadline: 1 }
        break
      case 'newest':
        sortOptions = { createdAt: -1 }
        break
      case 'popular':
        sortOptions = { applicationCount: -1 }
        break
      case 'amount':
        sortOptions = { 'amount.max': -1 }
        break
      default:
        sortOptions = { deadline: 1 }
    }

    // Try database first, fallback to mock data
    let schemes, totalSchemes
    try {
      const skip = (page - 1) * limit
      schemes = await Scheme.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean()
      
      totalSchemes = await Scheme.countDocuments(filter)
      
      // If no schemes in database, use mock data
      if (schemes.length === 0) {
        throw new Error('No schemes in database, using mock data')
      }
    } catch (dbError) {
      console.log('Using mock data:', dbError.message)
      
      // Fallback to mock data with filtering
      let filteredSchemes = [...mockSchemes]
      
      if (category && category !== 'all') {
        filteredSchemes = filteredSchemes.filter(scheme => scheme.category === category)
      }
      
      if (level && level !== 'all') {
        filteredSchemes = filteredSchemes.filter(scheme => scheme.level === level)
      }
      
      if (search) {
        const searchLower = search.toLowerCase()
        filteredSchemes = filteredSchemes.filter(scheme => 
          scheme.title.toLowerCase().includes(searchLower) ||
          scheme.description.toLowerCase().includes(searchLower) ||
          (scheme.titleHi && scheme.titleHi.includes(search)) ||
          (scheme.titleTe && scheme.titleTe.includes(search))
        )
      }
      
      totalSchemes = filteredSchemes.length
      const startIndex = (page - 1) * limit
      schemes = filteredSchemes.slice(startIndex, startIndex + limit)
    }

    // Get categories and levels for filters
    const categories = [
      { id: 'financial', name: 'Financial Assistance' },
      { id: 'insurance', name: 'Insurance' },
      { id: 'technical', name: 'Technical Support' },
      { id: 'credit', name: 'Credit Facilities' },
      { id: 'subsidy', name: 'Subsidy' },
      { id: 'training', name: 'Training' }
    ]
    
    const levels = [
      { id: 'central', name: 'Central Government' },
      { id: 'state', name: 'State Government' },
      { id: 'district', name: 'District Level' }
    ]

    const response = {
      schemes,
      categories,
      levels,
      pagination: {
        current: page,
        total: Math.ceil(totalSchemes / limit),
        limit,
        totalSchemes
      },
      filters: {
        category,
        level,
        search,
        state,
        status,
        featured
      },
      meta: {
        activeSchemes: schemes.filter((s: any) => s.status === 'active').length,
        featuredSchemes: schemes.filter((s: any) => s.featured).length,
        totalAmount: schemes.reduce((sum: number, s: any) => sum + (s.amount?.max || 0), 0)
      }
    }

    return NextResponse.json({
      success: true,
      data: response,
      message: 'Schemes fetched successfully'
    })

  } catch (error) {
    console.error('Error in schemes API:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch schemes',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}