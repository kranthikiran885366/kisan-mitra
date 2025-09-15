const mongoose = require('mongoose')
const Product = require('../models/Product')
const User = require('../models/User')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/krishi-mitra'

const sampleProducts = [
  {
    name: "Hybrid Rice Seeds - Basmati 370",
    description: "High-yield hybrid basmati rice seeds with excellent grain quality and disease resistance. Perfect for kharif season cultivation.",
    category: "seeds",
    subcategory: "rice",
    brand: "AgriTech Seeds",
    price: { mrp: 850, selling: 750 },
    specifications: {
      weight: "1 kg",
      usage: "Kharif season",
      dosage: "25-30 kg per acre",
      variety: "Hybrid",
      maturity: "120-125 days"
    },
    stock: { quantity: 50, unit: "packets" },
    images: [{ url: "/placeholder.jpg", alt: "Rice Seeds", isPrimary: true }],
    shipping: { freeShipping: true, deliveryDays: 3 },
    negotiable: false,
    tags: ["hybrid", "basmati", "high-yield", "disease-resistant"],
    isActive: true,
    isVerified: true
  },
  {
    name: "NPK Fertilizer 19:19:19",
    description: "Balanced NPK fertilizer for all crops. Improves soil fertility and crop yield significantly.",
    category: "fertilizers",
    subcategory: "npk",
    brand: "FertMax",
    price: { mrp: 1200, selling: 1050 },
    specifications: {
      weight: "50 kg",
      composition: "N:P:K = 19:19:19",
      dosage: "100-150 kg per acre"
    },
    stock: { quantity: 25, unit: "bags" },
    images: [{ url: "/placeholder.jpg", alt: "NPK Fertilizer", isPrimary: true }],
    shipping: { freeShipping: false, shippingCost: 150, deliveryDays: 5 },
    negotiable: true,
    tags: ["npk", "balanced", "all-crops", "soil-fertility"],
    isActive: true,
    isVerified: true
  },
  {
    name: "Organic Neem Oil Pesticide",
    description: "100% organic neem oil for natural pest control. Safe for crops and environment.",
    category: "pesticides",
    subcategory: "organic",
    brand: "EcoFarm",
    price: { mrp: 450, selling: 380 },
    specifications: {
      weight: "1 ltr",
      material: "Pure neem oil",
      dosage: "2-3 ml per liter water"
    },
    stock: { quantity: 75, unit: "bottles" },
    images: [{ url: "/placeholder.jpg", alt: "Neem Oil", isPrimary: true }],
    shipping: { freeShipping: true, deliveryDays: 4 },
    negotiable: false,
    tags: ["organic", "neem", "natural", "pest-control"],
    isActive: true,
    isVerified: true
  },
  {
    name: "Hand Weeder Tool",
    description: "Ergonomic hand weeder for efficient weed removal. Durable steel construction.",
    category: "tools",
    subcategory: "hand-tools",
    brand: "FarmPro",
    price: { mrp: 350, selling: 280 },
    specifications: {
      weight: "500 gm",
      material: "Steel with wooden handle",
      dimensions: "30cm length"
    },
    stock: { quantity: 100, unit: "pieces" },
    images: [{ url: "/placeholder.jpg", alt: "Hand Weeder", isPrimary: true }],
    shipping: { freeShipping: false, shippingCost: 50, deliveryDays: 6 },
    negotiable: true,
    tags: ["hand-tool", "weeder", "steel", "ergonomic"],
    isActive: true,
    isVerified: true
  },
  {
    name: "Drip Irrigation Kit",
    description: "Complete drip irrigation system for water-efficient farming. Covers 1 acre.",
    category: "irrigation",
    subcategory: "drip-system",
    brand: "WaterSave",
    price: { mrp: 15000, selling: 12500 },
    specifications: {
      coverage: "1 acre",
      material: "HDPE pipes",
      warranty: "2 years"
    },
    stock: { quantity: 10, unit: "kits" },
    images: [{ url: "/placeholder.jpg", alt: "Drip Kit", isPrimary: true }],
    shipping: { freeShipping: true, deliveryDays: 7 },
    negotiable: true,
    tags: ["irrigation", "drip", "water-efficient", "complete-kit"],
    isActive: true,
    isVerified: true
  }
]

async function seedMarketplace() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find or create a sample seller
    let seller = await User.findOne({ role: 'farmer', name: 'Sample Seller' })
    if (!seller) {
      seller = new User({
        name: 'Sample Seller',
        mobile: '9876543219', // Changed to unique mobile number
        password: 'password123',
        role: 'farmer',
        village: 'Sample Village',
        district: 'Guntur',
        state: 'Andhra Pradesh',
        isVerified: true
      })
      await seller.save()
      console.log('Created sample seller')
    }

    // Clear existing products
    await Product.deleteMany({})
    console.log('Cleared existing products')

    // Add seller to products and create them
    const productsWithSeller = sampleProducts.map(product => ({
      ...product,
      seller: seller._id,
      location: {
        state: seller.state,
        district: seller.district
      },
      seoUrl: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }))

    const createdProducts = await Product.insertMany(productsWithSeller)
    console.log(`Created ${createdProducts.length} products`)

    console.log('Marketplace seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding marketplace:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  seedMarketplace()
}

module.exports = seedMarketplace