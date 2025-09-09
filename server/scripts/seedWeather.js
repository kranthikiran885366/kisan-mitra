const mongoose = require('mongoose')
const WeatherAlert = require('../models/WeatherAlert')
const CropGuidance = require('../models/CropGuidance')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/krishi-mitra'

async function seedWeather() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    await Promise.all([
      WeatherAlert.deleteMany({}),
      CropGuidance.deleteMany({})
    ])
    console.log('Cleared existing weather and guidance data')

    // Create sample weather alerts
    const weatherAlerts = await WeatherAlert.insertMany([
      {
        location: {
          district: 'Guntur',
          state: 'Andhra Pradesh',
          coordinates: { latitude: 16.3067, longitude: 80.4365 }
        },
        weather: {
          temperature: 28,
          humidity: 75,
          rainfall: 12,
          windSpeed: 15,
          condition: 'rainy',
          pressure: 1013,
          uvIndex: 6
        },
        forecast: [
          {
            date: new Date(),
            temperature: { min: 22, max: 30 },
            humidity: 75,
            rainfall: 12,
            condition: 'rainy'
          },
          {
            date: new Date(Date.now() + 24 * 60 * 60 * 1000),
            temperature: { min: 24, max: 32 },
            humidity: 65,
            rainfall: 5,
            condition: 'cloudy'
          }
        ],
        isActive: true
      },
      {
        location: {
          district: 'Hyderabad',
          state: 'Telangana',
          coordinates: { latitude: 17.3850, longitude: 78.4867 }
        },
        weather: {
          temperature: 32,
          humidity: 45,
          rainfall: 0,
          windSpeed: 8,
          condition: 'sunny',
          pressure: 1015,
          uvIndex: 8
        },
        forecast: [
          {
            date: new Date(),
            temperature: { min: 25, max: 35 },
            humidity: 45,
            rainfall: 0,
            condition: 'sunny'
          }
        ],
        isActive: true
      }
    ])

    // Generate crop alerts and risks for weather data
    for (const weather of weatherAlerts) {
      await weather.generateCropAlerts()
      await weather.calculateRisks()
      await weather.save()
    }

    // Create sample crop guidance
    const cropGuidances = await CropGuidance.insertMany([
      {
        farmer: new mongoose.Types.ObjectId(),
        cropName: 'Rice',
        variety: 'Basmati',
        location: {
          district: 'Guntur',
          state: 'Andhra Pradesh',
          soilType: 'clay',
          climateZone: 'tropical'
        },
        growthStage: 'flowering',
        healthStatus: {
          overall: 'good',
          issues: []
        },
        images: [
          {
            url: '/placeholder.jpg',
            type: 'plant',
            uploadedAt: new Date()
          }
        ],
        isActive: true
      },
      {
        farmer: new mongoose.Types.ObjectId(),
        cropName: 'Tomato',
        variety: 'Cherry',
        location: {
          district: 'Hyderabad',
          state: 'Telangana',
          soilType: 'sandy',
          climateZone: 'semi-arid'
        },
        growthStage: 'vegetative',
        healthStatus: {
          overall: 'fair',
          issues: [
            {
              type: 'pest',
              severity: 'moderate',
              description: 'Aphid infestation detected',
              identifiedAt: new Date()
            }
          ]
        },
        images: [
          {
            url: '/placeholder.jpg',
            type: 'leaf',
            uploadedAt: new Date()
          }
        ],
        isActive: true
      }
    ])

    // Generate recommendations and advice for crop guidance
    for (const guidance of cropGuidances) {
      await guidance.generateCareRecommendations()
      await guidance.generateLocalizedAdvice()
      await guidance.save()
    }

    console.log('✅ Weather and guidance seeding completed successfully!')
    console.log(`Created:`)
    console.log(`- ${weatherAlerts.length} weather alerts`)
    console.log(`- ${cropGuidances.length} crop guidances`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding weather data:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  seedWeather()
}

module.exports = seedWeather