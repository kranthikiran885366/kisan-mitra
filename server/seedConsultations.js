const mongoose = require('mongoose');
const Consultation = require('./models/Consultation');
const User = require('./models/User');

const seedConsultations = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/krishi-mitra');
    console.log('Connected to MongoDB');

    // Clear existing consultations
    await Consultation.deleteMany({});

    // Get users
    const farmers = await User.find({ role: 'farmer' }).limit(3);
    const experts = await User.find({ role: { $in: ['agriculture_expert', 'agri_doctor'] } }).limit(2);

    if (farmers.length === 0 || experts.length === 0) {
      console.log('No farmers or experts found. Please run user seeding first.');
      return;
    }

    const consultations = [
      {
        farmer: farmers[0]._id,
        expert: experts[0]._id,
        type: 'crop_disease',
        priority: 'high',
        subject: 'Yellow spots on rice leaves',
        description: 'I noticed yellow spots appearing on my rice crop leaves. The weather has been humid lately and I\'m worried about disease spread. The affected area is about 2 acres.',
        cropDetails: {
          cropName: 'Rice',
          variety: 'Basmati',
          stage: 'vegetative',
          area: 2,
          sowingDate: new Date('2024-01-15'),
          currentIssues: ['yellow spots', 'leaf discoloration']
        },
        location: {
          state: 'Punjab',
          district: 'Ludhiana',
          village: 'Khanna'
        },
        status: 'resolved',
        messages: [
          {
            sender: farmers[0]._id,
            message: 'Hello doctor, I need urgent help with my rice crop.',
            messageType: 'text'
          },
          {
            sender: experts[0]._id,
            message: 'Hello! I can see the images you uploaded. This looks like bacterial leaf blight.',
            messageType: 'diagnosis'
          }
        ],
        diagnosis: {
          condition: 'Bacterial Leaf Blight',
          severity: 'moderate',
          causes: ['High humidity', 'Poor drainage', 'Infected seeds'],
          symptoms: ['Yellow spots on leaves', 'Water-soaked lesions', 'Leaf wilting'],
          treatment: 'Apply copper-based bactericide spray early morning. Improve field drainage.',
          confidence: 85
        },
        recommendations: [
          {
            category: 'treatment',
            title: 'Copper Oxychloride Spray',
            description: 'Apply copper oxychloride 50% WP @ 3g/liter water. Spray during early morning or evening.',
            priority: 'high',
            actionRequired: true,
            timeline: {
              immediate: true,
              withinDays: 2
            },
            cost: {
              estimated: 1500,
              currency: 'INR',
              breakdown: [
                { item: 'Copper Oxychloride', quantity: 2, unitPrice: 400, total: 800 },
                { item: 'Spraying cost', quantity: 1, unitPrice: 700, total: 700 }
              ]
            },
            products: [
              {
                name: 'Copper Oxychloride 50% WP',
                brand: 'Tata Rallis',
                dosage: '3g/liter',
                applicationMethod: 'Foliar spray',
                safetyPrecautions: ['Wear protective gear', 'Avoid spraying during windy conditions']
              }
            ],
            expectedOutcome: 'Disease control within 7-10 days',
            isImplemented: true,
            implementedAt: new Date('2024-01-20'),
            effectiveness: {
              rating: 4,
              feedback: 'Treatment worked well, disease is under control',
              ratedAt: new Date('2024-01-25')
            }
          },
          {
            category: 'irrigation',
            title: 'Improve Field Drainage',
            description: 'Create proper drainage channels to prevent water stagnation which promotes bacterial growth.',
            priority: 'medium',
            actionRequired: true,
            cost: {
              estimated: 3000,
              currency: 'INR'
            },
            expectedOutcome: 'Reduced disease incidence in future crops'
          }
        ],
        resolution: {
          summary: 'Bacterial leaf blight successfully treated with copper-based spray. Farmer implemented drainage improvements.',
          outcome: 'successful',
          followUpRequired: true,
          followUpDate: new Date('2024-02-15'),
          resolvedAt: new Date('2024-01-25'),
          resolvedBy: experts[0]._id,
          implementationStatus: 'completed'
        },
        rating: {
          score: 5,
          feedback: 'Excellent advice! The treatment worked perfectly and my crop is healthy now.',
          ratedAt: new Date('2024-01-26'),
          aspects: {
            expertise: 5,
            communication: 5,
            timeliness: 4,
            helpfulness: 5
          }
        },
        analytics: {
          viewCount: 15,
          responseTime: 45,
          satisfactionScore: 4.75
        },
        tags: ['rice', 'bacterial-disease', 'leaf-blight'],
        estimatedResolutionTime: 24,
        actualResolutionTime: 18
      },
      {
        farmer: farmers[1]._id,
        expert: experts[0]._id,
        type: 'market_advisory',
        priority: 'medium',
        subject: 'Best time to sell wheat crop',
        description: 'My wheat crop is ready for harvest. I want to know the best time to sell for maximum profit. Current market rate is ₹2050/quintal.',
        cropDetails: {
          cropName: 'Wheat',
          variety: 'HD-2967',
          stage: 'maturity',
          area: 5,
          expectedHarvest: new Date('2024-04-15')
        },
        location: {
          state: 'Haryana',
          district: 'Karnal',
          village: 'Assandh'
        },
        status: 'in_progress',
        messages: [
          {
            sender: farmers[1]._id,
            message: 'I need advice on when to sell my wheat for best prices.',
            messageType: 'text'
          },
          {
            sender: experts[0]._id,
            message: 'Based on market analysis, I recommend waiting for 2-3 weeks after harvest.',
            messageType: 'recommendation'
          }
        ],
        marketInsights: {
          currentPrice: 2050,
          priceRange: {
            min: 2000,
            max: 2200
          },
          trend: 'rising',
          bestSellingTime: 'May 1st week',
          demandForecast: 'High demand expected due to export orders',
          qualityFactors: ['Moisture content below 12%', 'No foreign matter', 'Good grain size']
        },
        recommendations: [
          {
            category: 'market_timing',
            title: 'Optimal Selling Strategy',
            description: 'Wait for 2-3 weeks post harvest. Prices expected to rise to ₹2150-2200 range.',
            priority: 'medium',
            cost: {
              estimated: 500,
              currency: 'INR'
            },
            expectedOutcome: 'Additional ₹100-150 per quintal profit'
          }
        ],
        analytics: {
          viewCount: 8,
          responseTime: 120,
          satisfactionScore: 0
        },
        tags: ['wheat', 'market-price', 'selling-strategy'],
        estimatedResolutionTime: 48
      },
      {
        farmer: farmers[2]._id,
        type: 'soil_management',
        priority: 'low',
        subject: 'Soil pH management for tomato cultivation',
        description: 'Planning to grow tomatoes next season. My soil pH is 8.2 which seems high. Need advice on soil preparation.',
        cropDetails: {
          cropName: 'Tomato',
          variety: 'Hybrid',
          area: 1,
          sowingDate: new Date('2024-06-01')
        },
        location: {
          state: 'Uttar Pradesh',
          district: 'Meerut',
          village: 'Sardhana'
        },
        status: 'open',
        messages: [
          {
            sender: farmers[2]._id,
            message: 'Need help with soil pH correction for tomato farming.',
            messageType: 'text'
          }
        ],
        analytics: {
          viewCount: 3,
          responseTime: 0,
          satisfactionScore: 0
        },
        tags: ['tomato', 'soil-ph', 'soil-preparation'],
        estimatedResolutionTime: 72
      }
    ];

    const savedConsultations = await Consultation.insertMany(consultations);

    // Auto-assign experts for open consultations
    for (const consultation of savedConsultations) {
      if (consultation.status === 'open') {
        await consultation.autoAssignExpert();
      }
    }

    console.log('Consultations seeded successfully!');
    console.log(`- ${savedConsultations.length} consultations created`);
    console.log('- Includes resolved, in-progress, and open consultations');
    console.log('- Complete with recommendations, diagnosis, and market insights');

  } catch (error) {
    console.error('Error seeding consultations:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedConsultations();
}

module.exports = seedConsultations;