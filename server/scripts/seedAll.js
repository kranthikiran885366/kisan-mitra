const mongoose = require('mongoose')
const User = require('../models/User')
const Product = require('../models/Product')
const MarketPrice = require('../models/MarketPrice')
const CropListing = require('../models/CropListing')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/krishi-mitra'

async function seedAll() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      MarketPrice.deleteMany({}),
      CropListing.deleteMany({})
    ])
    console.log('Cleared existing data')

    // Create sample users
    const users = await User.insertMany([
      {
        name: 'Ravi Kumar',
        mobile: '9876543210',
        password: 'password123',
        role: 'farmer',
        village: 'Kondapur',
        district: 'Guntur',
        state: 'Andhra Pradesh',
        isVerified: true,
        rating: { average: 4.5, count: 25 }
      },
      {
        name: 'Agri Store Owner',
        mobile: '9876543211',
        password: 'password123',
        role: 'seller',
        village: 'Guntur',
        district: 'Guntur',
        state: 'Andhra Pradesh',
        isVerified: true,
        rating: { average: 4.7, count: 150 }
      },
      {
        name: 'Dr. Suresh Reddy',
        mobile: '9876543212',
        password: 'password123',
        role: 'agriculture_expert',
        village: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        isVerified: true,
        specialization: ['crop_disease', 'soil_management'],
        qualification: 'PhD Agriculture',
        rating: { average: 4.9, count: 200 }
      }
    ])

    const [farmer, seller, expert] = users
    console.log('Created sample users')

    // Create sample products
    const products = await Product.insertMany([
      {
        name: 'Hybrid Rice Seeds - Basmati 370',
        description: 'High-yield hybrid basmati rice seeds with excellent grain quality.',
        category: 'seeds',
        subcategory: 'rice',
        brand: 'AgriTech Seeds',
        price: { mrp: 850, selling: 750 },
        specifications: { weight: '1 kg', usage: 'Kharif season', dosage: '25-30 kg per acre' },
        seller: seller._id,
        stock: { quantity: 50, unit: 'packets' },
        images: [{ url: '/placeholder.jpg', alt: 'Rice Seeds', isPrimary: true }],
        shipping: { freeShipping: true, deliveryDays: 3 },
        location: { state: seller.state, district: seller.district },
        isActive: true,
        isVerified: true,
        tags: ['hybrid', 'basmati', 'high-yield']
      },
      {
        name: 'NPK Fertilizer 19:19:19',
        description: 'Balanced NPK fertilizer for all crops.',
        category: 'fertilizers',
        subcategory: 'npk',
        brand: 'FertMax',
        price: { mrp: 1200, selling: 1050 },
        specifications: { weight: '50 kg', composition: 'N:P:K = 19:19:19' },
        seller: seller._id,
        stock: { quantity: 25, unit: 'bags' },
        images: [{ url: '/placeholder.jpg', alt: 'NPK Fertilizer', isPrimary: true }],
        shipping: { freeShipping: false, shippingCost: 150, deliveryDays: 5 },
        location: { state: seller.state, district: seller.district },
        negotiable: true,
        isActive: true,
        isVerified: true,
        tags: ['npk', 'balanced', 'fertilizer']
      }
    ])
    console.log('Created sample products')

    // Create sample market prices
    const marketPrices = await MarketPrice.insertMany([
      {
        cropName: 'Rice',
        variety: 'Basmati',
        market: { name: 'Guntur Mandi', district: 'Guntur', state: 'Andhra Pradesh' },
        prices: { minimum: 2400, maximum: 2600, modal: 2500, average: 2500 },
        date: new Date(),
        arrivals: 150,
        quality: 'good',
        isVerified: true
      },
      {
        cropName: 'Wheat',
        variety: 'Durum',
        market: { name: 'Guntur Mandi', district: 'Guntur', state: 'Andhra Pradesh' },
        prices: { minimum: 2150, maximum: 2250, modal: 2200, average: 2200 },
        date: new Date(),
        arrivals: 200,
        quality: 'average',
        isVerified: true
      },
      {
        cropName: 'Cotton',
        variety: 'Medium Staple',
        market: { name: 'Guntur Mandi', district: 'Guntur', state: 'Andhra Pradesh' },
        prices: { minimum: 5600, maximum: 6000, modal: 5800, average: 5800 },
        date: new Date(),
        arrivals: 100,
        quality: 'good',
        isVerified: true
      }
    ])
    console.log('Created sample market prices')

    // Create sample crop listings
    const cropListings = await CropListing.insertMany([
      {
        farmer: farmer._id,
        cropName: 'Tomato',
        category: 'vegetables',
        variety: 'Cherry',
        quantity: { available: 500, unit: 'kg' },
        pricing: { basePrice: 40, negotiable: true, minPrice: 35 },
        quality: { grade: 'A', organic: true, harvestDate: new Date() },
        location: {
          farmAddress: 'Farm No. 123, Kondapur Village',
          village: farmer.village,
          district: farmer.district,
          state: farmer.state,
          pincode: '522001'
        },
        images: [{ url: '/placeholder.jpg', caption: 'Fresh Tomatoes', isPrimary: true }],
        availability: {
          readyForHarvest: true,
          availableFrom: new Date(),
          availableTill: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        },
        delivery: { farmPickup: true, homeDelivery: true, deliveryRadius: 50 },
        status: 'active'
      },
      {
        farmer: farmer._id,
        cropName: 'Rice',
        category: 'grains',
        variety: 'Basmati',
        quantity: { available: 20, unit: 'quintal' },
        pricing: { basePrice: 2400, negotiable: true, minPrice: 2200 },
        quality: { grade: 'A', organic: false, harvestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        location: {
          farmAddress: 'Farm No. 456, Kondapur Village',
          village: farmer.village,
          district: farmer.district,
          state: farmer.state,
          pincode: '522001'
        },
        images: [{ url: '/placeholder.jpg', caption: 'Basmati Rice', isPrimary: true }],
        availability: {
          readyForHarvest: true,
          availableFrom: new Date(),
          availableTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        delivery: { farmPickup: true, homeDelivery: false, deliveryRadius: 25 },
        status: 'active'
      }
    ])
    console.log('Created sample crop listings')

    console.log('✅ Database seeding completed successfully!')
    console.log(`Created:`)
    console.log(`- ${users.length} users`)
    console.log(`- ${products.length} products`)
    console.log(`- ${marketPrices.length} market prices`)
    console.log(`- ${cropListings.length} crop listings`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  seedAll()
}

module.exports = seedAll