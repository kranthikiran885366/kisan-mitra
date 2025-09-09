import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import mongoose from 'mongoose'

const schemeSchema = new mongoose.Schema({
  schemeId: String,
  title: String,
  eligibility: {
    landSize: { min: Number, max: Number },
    income: { min: Number, max: Number },
    age: { min: Number, max: Number },
    category: [String],
    state: [String],
    crops: [String]
  },
  amount: { min: Number, max: Number, unit: String }
})

const Scheme = mongoose.models.Scheme || mongoose.model('Scheme', schemeSchema)

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { schemeId, userProfile } = await request.json()
    const { landSize, income, age, category, state, crops } = userProfile

    const scheme = await Scheme.findOne({ $or: [{ _id: schemeId }, { schemeId }] })
    if (!scheme) {
      return NextResponse.json({ success: false, message: 'Scheme not found' }, { status: 404 })
    }

    const eligibility = scheme.eligibility
    let eligible = true
    let reasons: string[] = []
    let score = 100

    // Check eligibility criteria
    if (eligibility.landSize && landSize !== undefined) {
      if (landSize < eligibility.landSize.min || landSize > eligibility.landSize.max) {
        eligible = false
        reasons.push(`Land size should be between ${eligibility.landSize.min}-${eligibility.landSize.max} acres`)
        score -= 25
      }
    }

    if (eligibility.income && income !== undefined) {
      if (income < eligibility.income.min || income > eligibility.income.max) {
        eligible = false
        reasons.push(`Income should be between ₹${eligibility.income.min}-₹${eligibility.income.max}`)
        score -= 30
      }
    }

    if (eligibility.age && age !== undefined) {
      if (age < eligibility.age.min || age > eligibility.age.max) {
        eligible = false
        reasons.push(`Age should be between ${eligibility.age.min}-${eligibility.age.max} years`)
        score -= 20
      }
    }

    if (eligibility.category && category && !eligibility.category.includes('All')) {
      if (!eligibility.category.includes(category)) {
        eligible = false
        reasons.push(`Available for ${eligibility.category.join(', ')} categories only`)
        score -= 25
      }
    }

    if (eligibility.state && state && !eligibility.state.includes('All States')) {
      if (!eligibility.state.includes(state)) {
        eligible = false
        reasons.push(`Available in ${eligibility.state.join(', ')} only`)
        score -= 40
      }
    }

    // Calculate potential benefit
    let potentialBenefit = 0
    if (scheme.amount && landSize) {
      potentialBenefit = scheme.amount.unit === 'per acre' ? scheme.amount.max * landSize : scheme.amount.max
    }

    return NextResponse.json({
      success: true,
      data: {
        eligible,
        eligibilityScore: Math.max(0, score),
        reasons,
        potentialBenefit,
        scheme: { id: scheme._id, title: scheme.title, amount: scheme.amount }
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to check eligibility',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}