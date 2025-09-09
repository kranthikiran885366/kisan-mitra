import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'

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
    income: { min: Number, max: Number },
    age: { min: Number, max: Number },
    category: [String],
    state: [String],
    crops: [String]
  },
  benefits: [String],
  documents: [String],
  applicationProcess: {
    online: Boolean,
    offline: Boolean,
    url: String,
    steps: [String]
  },
  status: String,
  featured: Boolean,
  applicationCount: Number,
  successRate: Number,
  tags: [String],
  contactInfo: {
    phone: String,
    email: String,
    address: String
  }
}, { timestamps: true })

const Scheme = mongoose.models.Scheme || mongoose.model('Scheme', schemeSchema)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const scheme = await Scheme.findOne({
      $or: [
        { _id: params.id },
        { schemeId: params.id }
      ]
    }).lean()

    if (!scheme) {
      return NextResponse.json({
        success: false,
        message: 'Scheme not found'
      }, { status: 404 })
    }

    // Calculate additional metrics
    const today = new Date()
    const deadline = new Date(scheme.deadline)
    const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    const enrichedScheme = {
      ...scheme,
      daysRemaining: Math.max(0, daysRemaining),
      isExpired: daysRemaining < 0,
      urgency: daysRemaining <= 7 ? 'high' : daysRemaining <= 30 ? 'medium' : 'low'
    }

    return NextResponse.json({
      success: true,
      data: enrichedScheme
    })

  } catch (error) {
    console.error('Error fetching scheme:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch scheme details',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const updateData = await request.json()
    
    const scheme = await Scheme.findByIdAndUpdate(
      params.id,
      { ...updateData, lastUpdated: new Date() },
      { new: true, runValidators: true }
    )

    if (!scheme) {
      return NextResponse.json({
        success: false,
        message: 'Scheme not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: scheme,
      message: 'Scheme updated successfully'
    })

  } catch (error) {
    console.error('Error updating scheme:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update scheme',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}