const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const DiseaseDetection = require('../models/DiseaseDetection');
const File = require('../models/File');
const Video = require('../models/Video');
const Expert = require('../models/Expert');
const User = require('../models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan-mitra');

async function seedRemainingData() {
  try {
    console.log('🌾 Seeding Remaining Data...\n');

    // Get existing experts and farmers
    const experts = await Expert.find().populate('user');
    const farmers = await User.find({ role: 'farmer' });

    // Clear existing data
    await Appointment.deleteMany({});
    await DiseaseDetection.deleteMany({});
    await File.deleteMany({});
    await Video.deleteMany({});

    console.log('✅ Cleared existing data');

    // Seed Appointments
    const appointments = [];
    const appointmentTypes = ['video', 'in_person', 'phone'];
    const appointmentStatuses = ['scheduled', 'completed', 'cancelled'];
    
    for (let i = 0; i < 20; i++) {
      const farmer = farmers[Math.floor(Math.random() * farmers.length)];
      const expert = experts[Math.floor(Math.random() * experts.length)];
      const type = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)];
      const status = appointmentStatuses[Math.floor(Math.random() * appointmentStatuses.length)];
      const date = new Date(Date.now() + (Math.random() * 14 - 7) * 24 * 60 * 60 * 1000);

      const appointment = new Appointment({
        farmer: farmer._id,
        expert: expert.user._id,
        date,
        type,
        status,
        duration: 30,
        topic: 'Crop Consultation',
        notes: 'Discussion about current crop issues and solutions.',
        location: status === 'in_person' ? {
          address: 'Agricultural Extension Center',
          district: farmer.district,
          state: farmer.state
        } : undefined,
        meetingLink: type === 'video' ? 'https://meet.example.com/abc123' : undefined
      });

      await appointment.save();
      appointments.push(appointment);
    }

    console.log(`✅ Created ${appointments.length} appointments`);

    // Seed Disease Detections
    const diseaseDetections = [];
    const crops = ['Rice', 'Wheat', 'Cotton', 'Tomato'];
    const diseases = [
      { name: 'Blast', severity: 'high', confidence: 0.92 },
      { name: 'Blight', severity: 'medium', confidence: 0.85 },
      { name: 'Rust', severity: 'low', confidence: 0.78 },
      { name: 'Leaf Spot', severity: 'medium', confidence: 0.88 }
    ];

    for (let i = 0; i < 30; i++) {
      const farmer = farmers[Math.floor(Math.random() * farmers.length)];
      const crop = crops[Math.floor(Math.random() * crops.length)];
      const disease = diseases[Math.floor(Math.random() * diseases.length)];

      const detection = new DiseaseDetection({
        farmer: farmer._id,
        crop,
        diseaseName: disease.name,
        severity: disease.severity,
        confidence: disease.confidence,
        detectedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        imageUrl: '/sample/disease-detection.jpg',
        symptoms: ['Leaf yellowing', 'Spots on leaves', 'Wilting'],
        recommendedActions: [
          'Apply fungicide',
          'Improve drainage',
          'Monitor affected plants'
        ],
        status: Math.random() > 0.5 ? 'resolved' : 'pending',
        notes: 'Early detection allows for effective treatment.'
      });

      await detection.save();
      diseaseDetections.push(detection);
    }

    console.log(`✅ Created ${diseaseDetections.length} disease detections`);

    // Seed Files
    const files = [];
    const fileCategories = ['guide', 'report', 'certificate', 'document'];
    const fileTypes = [
      { ext: 'pdf', mime: 'application/pdf' },
      { ext: 'doc', mime: 'application/msword' },
      { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    ];

    for (let i = 0; i < 15; i++) {
      const category = fileCategories[Math.floor(Math.random() * fileCategories.length)];
      const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];

      const file = new File({
        name: `Sample_${category}_${i + 1}.${fileType.ext}`,
        path: `/uploads/files/${category}/${Date.now()}_${i}.${fileType.ext}`,
        size: Math.floor(Math.random() * 5000000),
        mimeType: fileType.mime,
        category,
        uploadedBy: farmers[Math.floor(Math.random() * farmers.length)]._id,
        description: `Sample ${category} file for agricultural purposes`,
        tags: ['agriculture', category, fileType.ext],
        isPublic: Math.random() > 0.3,
        downloads: Math.floor(Math.random() * 100)
      });

      await file.save();
      files.push(file);
    }

    console.log(`✅ Created ${files.length} files`);

    // Seed Videos
    const videos = [];
    const videoCategories = [
      'training',
      'demonstration',
      'expert_talk',
      'success_story'
    ];

    for (let i = 0; i < 10; i++) {
      const category = videoCategories[Math.floor(Math.random() * videoCategories.length)];
      
      const video = new Video({
        title: `Agricultural ${category.replace('_', ' ')} video ${i + 1}`,
        description: `Detailed ${category.replace('_', ' ')} about modern farming techniques`,
        url: `https://example.com/videos/${category}/${i + 1}`,
        thumbnail: `https://example.com/thumbnails/${category}/${i + 1}.jpg`,
        duration: Math.floor(Math.random() * 900) + 300, // 5-20 minutes
        category,
        uploadedBy: experts[Math.floor(Math.random() * experts.length)].user._id,
        language: ['English', 'Hindi', 'Telugu'][Math.floor(Math.random() * 3)],
        tags: ['farming', category, 'education'],
        views: Math.floor(Math.random() * 1000),
        likes: Math.floor(Math.random() * 100),
        isPublic: true
      });

      await video.save();
      videos.push(video);
    }

    console.log(`✅ Created ${videos.length} videos`);

    // Print Summary
    console.log('\n📊 Data Summary:');
    console.log('─'.repeat(50));

    // Appointment Status Distribution
    const appointmentStats = {};
    appointments.forEach(a => {
      appointmentStats[a.status] = (appointmentStats[a.status] || 0) + 1;
    });
    
    console.log('\n📅 Appointments by Status:');
    Object.entries(appointmentStats).forEach(([status, count]) => {
      console.log(`${status.padEnd(20)}: ${count}`);
    });

    // Disease Detection Statistics
    const diseaseStats = {};
    diseaseDetections.forEach(d => {
      diseaseStats[d.diseaseName] = (diseaseStats[d.diseaseName] || 0) + 1;
    });

    console.log('\n🔬 Disease Detections by Type:');
    Object.entries(diseaseStats).forEach(([disease, count]) => {
      console.log(`${disease.padEnd(20)}: ${count}`);
    });

    // File Categories
    const fileStats = {};
    files.forEach(f => {
      fileStats[f.category] = (fileStats[f.category] || 0) + 1;
    });

    console.log('\n📁 Files by Category:');
    Object.entries(fileStats).forEach(([category, count]) => {
      console.log(`${category.padEnd(20)}: ${count}`);
    });

    // Video Categories
    const videoStats = {};
    videos.forEach(v => {
      videoStats[v.category] = (videoStats[v.category] || 0) + 1;
    });

    console.log('\n🎥 Videos by Category:');
    Object.entries(videoStats).forEach(([category, count]) => {
      console.log(`${category.padEnd(20)}: ${count}`);
    });

    console.log('\n🎉 All remaining data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding remaining data:', error);
    process.exit(1);
  }
}

seedRemainingData();