const express = require('express')
const Scheme = require('../models/Scheme')
const auth = require('../middleware/auth')
const router = express.Router()

// Get all schemes with filters and pagination
router.get('/', async (req, res) => {
  try {
    const {
      category,
      level,
      search,
      state,
      status = 'active',
      featured,
      page = 1,
      limit = 20,
      sortBy = 'deadline'
    } = req.query

    // Build filter object
    const filter = {}
    
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
    let sortOptions = {}
    switch (sortBy) {
      case 'deadline':
        sortOptions = { deadline: 1 }
        break
      case 'newest':
        sortOptions = { launchDate: -1 }
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

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    // Execute query
    const schemes = await Scheme.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean()

    const totalSchemes = await Scheme.countDocuments(filter)
    const totalPages = Math.ceil(totalSchemes / parseInt(limit))

    // Get categories for filters
    const categories = await Scheme.distinct('category')
    const levels = await Scheme.distinct('level')

    res.json({
      success: true,
      data: {
        schemes,
        pagination: {
          current: parseInt(page),
          total: totalPages,
          limit: parseInt(limit),
          totalSchemes
        },
        filters: {
          categories: categories.map(cat => ({
            id: cat,
            name: cat.charAt(0).toUpperCase() + cat.slice(1)
          })),
          levels: levels.map(level => ({
            id: level,
            name: level.charAt(0).toUpperCase() + level.slice(1)
          }))
        }
      }
    })
  } catch (error) {
    console.error('Error fetching schemes:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schemes',
      error: error.message
    })
  }
})

// Get scheme by ID
router.get('/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findOne({
      $or: [
        { _id: req.params.id },
        { schemeId: req.params.id }
      ]
    })

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      })
    }

    res.json({
      success: true,
      data: scheme
    })
  } catch (error) {
    console.error('Error fetching scheme:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheme',
      error: error.message
    })
  }
})

// Get featured schemes
router.get('/featured/list', async (req, res) => {
  try {
    const { limit = 6 } = req.query
    
    const schemes = await Scheme.find({ 
      featured: true, 
      status: 'active',
      deadline: { $gte: new Date() }
    })
    .sort({ applicationCount: -1 })
    .limit(parseInt(limit))
    .lean()

    res.json({
      success: true,
      data: schemes
    })
  } catch (error) {
    console.error('Error fetching featured schemes:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured schemes',
      error: error.message
    })
  }
})

// Check eligibility for a scheme
router.post('/:id/eligibility', auth, async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id)
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      })
    }

    const { landSize, income, age, category, state, district } = req.body
    const eligibility = scheme.eligibility
    
    let eligible = true
    let reasons = []

    // Check land size
    if (eligibility.landSize && landSize) {
      if (landSize < eligibility.landSize.min || landSize > eligibility.landSize.max) {
        eligible = false
        reasons.push(`Land size should be between ${eligibility.landSize.min} and ${eligibility.landSize.max} acres`)
      }
    }

    // Check income
    if (eligibility.income && income) {
      if (income < eligibility.income.min || income > eligibility.income.max) {
        eligible = false
        reasons.push(`Annual income should be between ₹${eligibility.income.min} and ₹${eligibility.income.max}`)
      }
    }

    // Check age
    if (eligibility.age && age) {
      if (age < eligibility.age.min || age > eligibility.age.max) {
        eligible = false
        reasons.push(`Age should be between ${eligibility.age.min} and ${eligibility.age.max} years`)
      }
    }

    // Check category
    if (eligibility.category && category && !eligibility.category.includes('All')) {
      if (!eligibility.category.includes(category)) {
        eligible = false
        reasons.push(`This scheme is for ${eligibility.category.join(', ')} categories only`)
      }
    }

    // Check state
    if (eligibility.state && state && !eligibility.state.includes('All States')) {
      if (!eligibility.state.includes(state)) {
        eligible = false
        reasons.push(`This scheme is available in ${eligibility.state.join(', ')} only`)
      }
    }

    res.json({
      success: true,
      data: {
        eligible,
        reasons,
        scheme: {
          id: scheme._id,
          title: scheme.title,
          amount: scheme.amount
        }
      }
    })
  } catch (error) {
    console.error('Error checking eligibility:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to check eligibility',
      error: error.message
    })
  }
})

// Get personalized scheme recommendations
router.post('/personalized', auth, async (req, res) => {
  try {
    const { landSize, crops, state, district, category, income } = req.body
    
    const filter = {
      status: 'active',
      deadline: { $gte: new Date() }
    }

    // Add personalization filters
    if (state) {
      filter.$or = [
        { 'eligibility.state': state },
        { 'eligibility.state': 'All States' }
      ]
    }

    if (landSize) {
      filter.$and = [
        { 'eligibility.landSize.min': { $lte: landSize } },
        { 'eligibility.landSize.max': { $gte: landSize } }
      ]
    }

    if (crops && crops.length > 0) {
      filter['eligibility.crops'] = { $in: [...crops, 'All Crops'] }
    }

    const schemes = await Scheme.find(filter)
      .sort({ featured: -1, successRate: -1 })
      .limit(10)
      .lean()

    res.json({
      success: true,
      data: schemes
    })
  } catch (error) {
    console.error('Error getting personalized schemes:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get personalized schemes',
      error: error.message
    })
  }
})

// Get scheme statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id)
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      })
    }

    // Calculate days remaining
    const today = new Date()
    const deadline = new Date(scheme.deadline)
    const daysRemaining = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))

    const stats = {
      applicationCount: scheme.applicationCount,
      successRate: scheme.successRate,
      daysRemaining: Math.max(0, daysRemaining),
      status: scheme.status,
      featured: scheme.featured,
      lastUpdated: scheme.lastUpdated
    }

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching scheme stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheme statistics',
      error: error.message
    })
  }
})

// Search schemes with advanced filters
router.get('/search/advanced', async (req, res) => {
  try {
    const {
      q,
      category,
      level,
      minAmount,
      maxAmount,
      state,
      deadline,
      page = 1,
      limit = 20
    } = req.query

    const filter = { status: 'active' }
    
    if (q) {
      filter.$text = { $search: q }
    }
    
    if (category) filter.category = category
    if (level) filter.level = level
    if (state) filter['eligibility.state'] = { $in: [state, 'All States'] }
    
    if (minAmount || maxAmount) {
      filter['amount.min'] = {}
      if (minAmount) filter['amount.min'].$gte = parseInt(minAmount)
      if (maxAmount) filter['amount.max'] = { $lte: parseInt(maxAmount) }
    }
    
    if (deadline) {
      filter.deadline = { $gte: new Date(deadline) }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const schemes = await Scheme.find(filter)
      .sort({ score: { $meta: 'textScore' }, featured: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean()

    const total = await Scheme.countDocuments(filter)

    res.json({
      success: true,
      data: {
        schemes,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          totalSchemes: total
        }
      }
    })
  } catch (error) {
    console.error('Error in advanced search:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to search schemes',
      error: error.message
    })
  }
})

module.exports = router