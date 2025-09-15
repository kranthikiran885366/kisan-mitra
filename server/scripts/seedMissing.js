const mongoose = require('mongoose');
const Expert = require('../models/Expert');
const Consultation = require('../models/Consultation');
const Appointment = require('../models/Appointment');
const DiseaseDetection = require('../models/DiseaseDetection');
const Farmer = require('../models/Farmer');
const Alert = require('../models/Alert');
const Discussion = require('../models/Discussion');
const File = require('../models/File');
const Video = require('../models/Video');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan-mitra');

async function seedMissing() {
  try {
    // Experts
    await Expert.deleteMany({});
    await Expert.insertMany([
      { name: 'Dr. Ramesh', specialization: 'Soil Management', experience: 18 },
      { name: 'Dr. Anjali', specialization: 'Crop Diseases', experience: 12 }
    ]);
    // Consultations
    await Consultation.deleteMany({});
    await Consultation.insertMany([
      { topic: 'Rice Disease', status: 'completed', farmer: 'Test Farmer', expert: 'Dr. Anjali' },
      { topic: 'Soil Health', status: 'pending', farmer: 'Test Farmer', expert: 'Dr. Ramesh' }
    ]);
    // Appointments
    await Appointment.deleteMany({});
    await Appointment.insertMany([
      { date: new Date(), status: 'scheduled', farmer: 'Test Farmer', expert: 'Dr. Ramesh' }
    ]);
    // DiseaseDetections
    await DiseaseDetection.deleteMany({});
    await DiseaseDetection.insertMany([
      { crop: 'Wheat', disease: 'Rust', detectedAt: new Date() }
    ]);
    // Farmers
    await Farmer.deleteMany({});
    await Farmer.insertMany([
      { name: 'Test Farmer', village: 'Demo Village', crops: ['Rice', 'Wheat'] }
    ]);
    // Alerts
    await Alert.deleteMany({});
    await Alert.insertMany([
      { type: 'weather', message: 'Heavy rain expected tomorrow.' },
      { type: 'market', message: 'Wheat prices rising.' }
    ]);
    // Discussions
    await Discussion.deleteMany({});
    await Discussion.insertMany([
      { title: 'Best irrigation methods', content: 'Share your tips here.' }
    ]);
    // Files
    await File.deleteMany({});
    await File.insertMany([
      { filename: 'soil_report.pdf', url: '/files/soil_report.pdf' }
    ]);
    // Videos
    await Video.deleteMany({});
    await Video.insertMany([
      { title: 'Organic Farming Basics', url: '/videos/organic_farming.mp4' }
    ]);
    console.log('✅ Missing collections seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding missing collections:', error);
    process.exit(1);
  }
}

seedMissing();
