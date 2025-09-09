const mongoose = require('mongoose')
const Scheme = require('../models/Scheme')
require('dotenv').config()

const realSchemes = [
  {
    schemeId: 'PM-KISAN-2024',
    title: 'PM-KISAN Samman Nidhi Yojana',
    titleHi: 'पीएम-किसान सम्मान निधि योजना',
    titleTe: 'పిఎం-కిసాన్ సమ్మాన్ నిధి యోజన',
    description: 'Direct income support scheme providing ₹6,000 per year to small and marginal farmers',
    descriptionHi: 'छोटे और सीमांत किसानों को प्रति वर्ष ₹6,000 की प्रत्यक्ष आय सहायता योजना',
    descriptionTe: 'చిన్న మరియు సరిహద్దు రైతులకు సంవత्సరానికి ₹6,000 ప్రత్యక్ష ఆదాయ మద్దతు పథకం',
    category: 'financial',
    level: 'central',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    department: 'Department of Agriculture & Cooperation',
    launchDate: new Date('2019-02-24'),
    deadline: new Date('2024-12-31'),
    amount: {
      min: 6000,
      max: 6000,
      unit: 'per year',
      description: '₹2,000 in three installments'
    },
    eligibility: {
      landSize: { min: 0, max: 2 },
      category: ['All'],
      state: ['All States'],
      crops: ['All Crops']
    },
    benefits: [
      'Direct cash transfer of ₹6,000 per year',
      'Three equal installments of ₹2,000 each',
      'Direct bank transfer',
      'No intermediaries'
    ],
    documents: [
      'Aadhaar Card',
      'Bank Account Details',
      'Land Ownership Documents',
      'Mobile Number'
    ],
    applicationProcess: {
      online: true,
      offline: true,
      url: 'https://pmkisan.gov.in/',
      steps: [
        'Visit PM-KISAN portal',
        'Click on Farmer Registration',
        'Enter Aadhaar number',
        'Fill personal and bank details',
        'Upload documents',
        'Submit application'
      ]
    },
    status: 'active',
    featured: true,
    applicationCount: 12000000,
    successRate: 85,
    tags: ['income support', 'direct transfer', 'small farmers'],
    contactInfo: {
      phone: '155261',
      email: 'pmkisan-ict@gov.in',
      address: 'Krishi Bhawan, New Delhi'
    }
  },
  {
    schemeId: 'PMFBY-2024',
    title: 'Pradhan Mantri Fasal Bima Yojana',
    titleHi: 'प्रधानमंत्री फसल बीमा योजना',
    titleTe: 'ప్రధానమంత్రి ఫసల్ బీమా యోజన',
    description: 'Comprehensive crop insurance scheme providing financial support against crop loss due to natural calamities',
    category: 'insurance',
    level: 'central',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    launchDate: new Date('2016-04-13'),
    deadline: new Date('2024-11-30'),
    amount: {
      min: 50000,
      max: 200000,
      unit: 'per hectare',
      description: 'Sum insured based on scale of finance'
    },
    eligibility: {
      landSize: { min: 0, max: 1000 },
      category: ['All'],
      state: ['All States'],
      crops: ['Kharif', 'Rabi', 'Annual Commercial', 'Annual Horticultural']
    },
    benefits: [
      'Comprehensive risk cover',
      'Low premium rates',
      'Quick settlement of claims',
      'Use of technology for yield estimation'
    ],
    documents: [
      'Aadhaar Card',
      'Bank Account Details',
      'Land Records',
      'Sowing Certificate',
      'Loan Sanction Letter (if applicable)'
    ],
    applicationProcess: {
      online: true,
      offline: true,
      url: 'https://pmfby.gov.in/',
      steps: [
        'Visit nearest bank or CSC',
        'Fill application form',
        'Submit required documents',
        'Pay premium amount',
        'Get policy document'
      ]
    },
    status: 'active',
    featured: true,
    applicationCount: 5500000,
    successRate: 78,
    tags: ['crop insurance', 'risk cover', 'natural calamities']
  },
  {
    schemeId: 'KCC-2024',
    title: 'Kisan Credit Card Scheme',
    titleHi: 'किसान क्रेडिट कार्ड योजना',
    titleTe: 'కిసాన్ క్రెడిట్ కార్డ్ పథకం',
    description: 'Credit facility to farmers for meeting short term credit requirements for cultivation and other needs',
    category: 'credit',
    level: 'central',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    launchDate: new Date('1998-08-01'),
    deadline: new Date('2024-12-31'),
    amount: {
      min: 25000,
      max: 300000,
      unit: 'credit limit',
      description: 'Based on cropping pattern and scale of finance'
    },
    eligibility: {
      landSize: { min: 0.1, max: 1000 },
      age: { min: 18, max: 75 },
      category: ['All'],
      state: ['All States']
    },
    benefits: [
      'Flexible credit facility',
      'Lower interest rates',
      'No collateral for loans up to ₹1.6 lakh',
      'Accident insurance cover',
      'Crop insurance eligibility'
    ],
    documents: [
      'Application Form',
      'Identity Proof',
      'Address Proof',
      'Land Documents',
      'Income Certificate'
    ],
    applicationProcess: {
      online: true,
      offline: true,
      url: 'https://www.nabard.org/kcc.aspx',
      steps: [
        'Visit nearest bank branch',
        'Fill KCC application form',
        'Submit documents',
        'Bank verification',
        'Credit limit sanctioned',
        'KCC issued'
      ]
    },
    status: 'active',
    applicationCount: 7000000,
    successRate: 82,
    tags: ['credit', 'flexible loan', 'low interest']
  },
  {
    schemeId: 'SHC-2024',
    title: 'Soil Health Card Scheme',
    titleHi: 'मृदा स्वास्थ्य कार्ड योजना',
    titleTe: 'మట్టి ఆరోగ్య కార్డ్ పథకం',
    description: 'Scheme to issue soil health cards to farmers with crop-wise recommendations of nutrients and fertilizers',
    category: 'technical',
    level: 'central',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    launchDate: new Date('2015-02-19'),
    deadline: new Date('2024-10-31'),
    amount: {
      min: 0,
      max: 0,
      unit: 'free service',
      description: 'Free soil testing and recommendations'
    },
    eligibility: {
      landSize: { min: 0.1, max: 1000 },
      category: ['All'],
      state: ['All States']
    },
    benefits: [
      'Free soil testing',
      'Nutrient status of soil',
      'Fertilizer recommendations',
      'Improved soil fertility',
      'Better crop yield'
    ],
    documents: [
      'Aadhaar Card',
      'Land Records',
      'Soil Sample'
    ],
    applicationProcess: {
      online: true,
      offline: true,
      url: 'https://soilhealth.dac.gov.in/',
      steps: [
        'Collect soil sample',
        'Visit soil testing lab',
        'Submit sample with documents',
        'Get soil health card',
        'Follow recommendations'
      ]
    },
    status: 'active',
    applicationCount: 22000000,
    successRate: 95,
    tags: ['soil testing', 'fertilizer recommendation', 'free service']
  },
  {
    schemeId: 'RYTHU-BANDHU-2024',
    title: 'Rythu Bandhu Scheme',
    titleHi: 'रायथु बंधु योजना',
    titleTe: 'రైతు బంధు పథకం',
    description: 'Telangana state investment support scheme providing financial assistance to farmers for agricultural inputs',
    category: 'financial',
    level: 'state',
    ministry: 'Government of Telangana',
    department: 'Agriculture Department',
    launchDate: new Date('2018-05-10'),
    deadline: new Date('2024-11-15'),
    amount: {
      min: 10000,
      max: 10000,
      unit: 'per acre per season',
      description: '₹5,000 per acre for Kharif and ₹5,000 for Rabi'
    },
    eligibility: {
      landSize: { min: 0.1, max: 1000 },
      state: ['Telangana'],
      category: ['All']
    },
    benefits: [
      'Direct investment support',
      '₹10,000 per acre per year',
      'Two seasons coverage',
      'Direct bank transfer'
    ],
    documents: [
      'Aadhaar Card',
      'Land Records (Pahani)',
      'Bank Account Details',
      'Residence Proof'
    ],
    applicationProcess: {
      online: true,
      offline: true,
      url: 'https://rythubandhu.telangana.gov.in/',
      steps: [
        'Visit village revenue office',
        'Verify land records',
        'Update Aadhaar and bank details',
        'Get beneficiary list verification',
        'Receive payment'
      ]
    },
    status: 'active',
    featured: true,
    applicationCount: 5800000,
    successRate: 92,
    tags: ['investment support', 'telangana', 'direct transfer'],
    contactInfo: {
      phone: '040-23450999',
      email: 'rythubandhu@telangana.gov.in'
    }
  },
  {
    schemeId: 'ORGANIC-FARMING-2024',
    title: 'National Programme for Organic Production',
    titleHi: 'जैविक उत्पादन के लिए राष्ट्रीय कार्यक्रम',
    titleTe: 'సేంద్రీయ ఉత్పత్తి కోసం జాతీయ కార్యక్రమం',
    description: 'Scheme to promote organic farming practices and provide certification support to farmers',
    category: 'technical',
    level: 'central',
    ministry: 'Ministry of Commerce & Industry',
    launchDate: new Date('2001-04-01'),
    deadline: new Date('2024-12-20'),
    amount: {
      min: 20000,
      max: 50000,
      unit: 'per hectare',
      description: 'Financial assistance for organic inputs and certification'
    },
    eligibility: {
      landSize: { min: 0.5, max: 100 },
      category: ['All'],
      state: ['All States']
    },
    benefits: [
      'Organic certification support',
      'Premium prices for organic produce',
      'Reduced input costs',
      'Environmental sustainability',
      'Export opportunities'
    ],
    documents: [
      'Land Records',
      'Aadhaar Card',
      'Bank Account Details',
      'Organic Farming Training Certificate'
    ],
    applicationProcess: {
      online: true,
      offline: true,
      url: 'https://pgsindia-ncof.gov.in/',
      steps: [
        'Get organic farming training',
        'Apply for group certification',
        'Follow organic practices',
        'Internal inspection',
        'Third party certification',
        'Get organic certificate'
      ]
    },
    status: 'active',
    applicationCount: 850000,
    successRate: 75,
    tags: ['organic farming', 'certification', 'premium prices']
  }
]

async function seedSchemes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan-mitra')
    console.log('Connected to MongoDB')

    // Clear existing schemes
    await Scheme.deleteMany({})
    console.log('Cleared existing schemes')

    // Insert new schemes
    const insertedSchemes = await Scheme.insertMany(realSchemes)
    console.log(`Inserted ${insertedSchemes.length} schemes`)

    // Update some schemes to expired status for testing
    await Scheme.updateMany(
      { deadline: { $lt: new Date() } },
      { status: 'expired' }
    )

    console.log('Scheme seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding schemes:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  seedSchemes()
}

module.exports = { seedSchemes, realSchemes }