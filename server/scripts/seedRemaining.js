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

    if (!experts.length || !farmers.length) {
      throw new Error('No experts or farmers found. Please seed users and experts first.');
    }

    // Clear existing data
    await Appointment.deleteMany({});
    await DiseaseDetection.deleteMany({});
    await File.deleteMany({});
    await Video.deleteMany({});

    console.log('✅ Cleared existing data');

    // Seed Appointments
    const appointments = [];
    const meetingTypes = ['video', 'chat', 'in_person'];
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    const paymentStatuses = ['pending', 'completed', 'refunded'];
    
    function generateAppointmentTime(availabilitySlots) {
      const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const slot = availabilitySlots[Math.floor(Math.random() * availabilitySlots.length)];
      
      // Get next occurrence of this weekday
      const now = new Date();
      const today = now.getDay();
      const targetDay = weekDays.indexOf(slot.day);
      let daysToAdd = (targetDay - today + 7) % 7;  // Ensure positive number
      if (daysToAdd === 0) daysToAdd = 7;  // If same day, schedule for next week
      
      const appointmentDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
      
      // Parse start time
      const [hours, minutes] = slot.startTime.split(':').map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);
      
      return appointmentDate;
    }
    
    for (let i = 0; i < 20; i++) {
      const farmer = farmers[Math.floor(Math.random() * farmers.length)];
      const expert = experts[Math.floor(Math.random() * experts.length)];
      const meetingType = meetingTypes[Math.floor(Math.random() * meetingTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const duration = [30, 45, 60][Math.floor(Math.random() * 3)];
      const amount = duration * 100; // ₹100 per minute

      // Get available slots
      const availableSlots = expert.availability.filter(slot => slot.isAvailable);
      if (!availableSlots.length) continue;

      // Generate appointment time
      const appointmentDate = generateAppointmentTime(availableSlots);

      const appointment = new Appointment({
        user: farmer._id,
        expert: expert._id,
        dateTime: appointmentDate,
        duration,
        status,
        meetingType,
        meetingLink: meetingType === 'video' ? 'https://meet.example.com/abc123' : undefined,
        description: 'Consultation regarding crop health and management',
        amount,
        paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        notes: [{
          content: 'Initial consultation notes',
          addedBy: expert.user._id,
          isPrivate: false
        }],
        reminderSent: Math.random() > 0.5,
        rating: status === 'completed' ? Math.floor(Math.random() * 5) + 1 : undefined,
        review: status === 'completed' ? 'Very helpful consultation session' : undefined
      });

      await appointment.save();
      appointments.push(appointment);
    }

    console.log(`✅ Created ${appointments.length} appointments`);

    // Seed Disease Detections
    const diseaseDetections = [];
    const cropTypes = ['Rice', 'Wheat', 'Cotton', 'Tomato'];
    const detectionResults = [
      {
        name: 'Blast Disease',
        confidence: 92,
        severity: 'high',
        crop: 'Rice',
        description: 'Common fungal disease affecting rice crops',
        symptoms: ['Leaf lesions', 'White to gray-green lesions'],
        treatments: {
          organic: ['Use resistant varieties', 'Crop rotation'],
          chemical: ['Apply fungicides', 'Use copper-based sprays'],
          cultural: ['Proper spacing', 'Field sanitation']
        },
        prevention: ['Use disease-free seeds', 'Maintain field hygiene'],
        weatherImpact: 'High humidity increases disease spread'
      },
      {
        name: 'Leaf Blight',
        confidence: 85,
        severity: 'medium',
        crop: 'Wheat',
        description: 'Bacterial disease affecting wheat crops',
        symptoms: ['Yellow-brown lesions', 'Wilting leaves'],
        treatments: {
          organic: ['Use compost tea', 'Apply neem oil'],
          chemical: ['Apply bactericides', 'Use copper oxychloride'],
          cultural: ['Remove infected plants', 'Improve drainage']
        },
        prevention: ['Use resistant cultivars', 'Proper irrigation'],
        weatherImpact: 'Wet conditions favor disease development'
      }
    ];

    for (let i = 0; i < 30; i++) {
      const farmer = farmers[Math.floor(Math.random() * farmers.length)];
      const cropType = cropTypes[Math.floor(Math.random() * cropTypes.length)];
      const detectionResult = detectionResults[Math.floor(Math.random() * detectionResults.length)];

      const detection = new DiseaseDetection({
        farmer: farmer._id,
        imagePath: '/uploads/diseases/sample.jpg',
        imageUrl: 'https://example.com/disease-images/sample.jpg',
        cropType,
        location: {
          latitude: 17.3850 + (Math.random() - 0.5) * 2,
          longitude: 78.4867 + (Math.random() - 0.5) * 2,
          address: 'Sample Farm Location, Telangana'
        },
        detectionResult,
        status: Math.random() > 0.3 ? 'completed' : 'processing',
        processingTime: Math.floor(Math.random() * 5000),
        notes: 'Sample detection notes',
        consultationRequested: Math.random() > 0.7
      });

      await detection.save();
      diseaseDetections.push(detection);
    }

    console.log(`✅ Created ${diseaseDetections.length} disease detections`);

    // Seed Files
    const files = [];
    const filetypes = [
      { ext: 'pdf', mime: 'application/pdf', prefix: 'doc' },
      { ext: 'jpg', mime: 'image/jpeg', prefix: 'img' },
      { ext: 'mp4', mime: 'video/mp4', prefix: 'vid' }
    ];

    for (let i = 0; i < 15; i++) {
      const filetype = filetypes[Math.floor(Math.random() * filetypes.length)];
      const filename = `${filetype.prefix}_${Date.now()}_${i}.${filetype.ext}`;

      const file = new File({
        filename,
        originalName: `original_${filename}`,
        path: `/uploads/files/${filename}`,
        size: Math.floor(Math.random() * 5000000),
        mimetype: filetype.mime,
        extension: filetype.ext,
        encoding: 'utf8',
        md5: '123e4567e89b12d3a456426655440000',
        sha256: '987f6543e21b12d3a456426655440000',
        isPublic: Math.random() > 0.3,
        createdBy: farmers[Math.floor(Math.random() * farmers.length)]._id,
        tags: ['agriculture', 'documentation'],
        description: 'Sample agricultural document',
        status: 'ready'
      });

      await file.save();
      files.push(file);
    }

    console.log(`✅ Created ${files.length} files`);

    // Seed Videos
    const videos = [];
    const videoCategories = [
      'crop_cultivation',
      'pest_management',
      'disease_control',
      'organic_farming'
    ];

    for (let i = 0; i < 10; i++) {
      const expert = experts[Math.floor(Math.random() * experts.length)];
      const category = videoCategories[Math.floor(Math.random() * videoCategories.length)];

      const video = new Video({
        title: `Agricultural Guide: ${category.replace('_', ' ')} techniques - Part ${i + 1}`,
        description: `Comprehensive guide about ${category.replace('_', ' ')} for farmers`,
        videoUrl: `https://example.com/videos/${category}/${i + 1}.mp4`,
        thumbnailUrl: `https://example.com/thumbnails/${category}/${i + 1}.jpg`,
        duration: Math.floor(Math.random() * 900) + 300, // 5-20 minutes
        fileSize: Math.floor(Math.random() * 100000000),
        quality: ['720p', '1080p'][Math.floor(Math.random() * 2)],
        category,
        targetAudience: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
        farmingType: ['organic', 'conventional'],
        applicableRegions: [
          {
            state: 'Telangana',
            districts: ['Hyderabad', 'Rangareddy']
          }
        ],
        seasons: ['kharif', 'rabi'],
        crops: ['Rice', 'Wheat', 'Cotton'],
        createdBy: expert.user._id,
        creatorType: 'agriculture_expert',
        language: ['en', 'hi', 'te'][Math.floor(Math.random() * 3)],
        status: 'published',
        publishedAt: new Date(),
        tags: ['farming', 'education', category],
        difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
        timeRequired: '30 minutes',
        costEstimate: {
          min: 1000,
          max: 5000,
          currency: 'INR'
        },
        analytics: {
          watchTime: Math.floor(Math.random() * 100000),
          averageWatchTime: Math.floor(Math.random() * 500),
          completionRate: Math.random() * 100,
          deviceStats: {
            mobile: Math.floor(Math.random() * 1000),
            desktop: Math.floor(Math.random() * 500),
            tablet: Math.floor(Math.random() * 200)
          }
        }
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

    // Disease Detection Status Distribution
    const detectionStats = {};
    diseaseDetections.forEach(d => {
      detectionStats[d.status] = (detectionStats[d.status] || 0) + 1;
    });

    console.log('\n🔬 Disease Detections by Status:');
    Object.entries(detectionStats).forEach(([status, count]) => {
      console.log(`${status.padEnd(20)}: ${count}`);
    });

    // File Types Distribution
    const fileStats = {};
    files.forEach(f => {
      fileStats[f.extension] = (fileStats[f.extension] || 0) + 1;
    });

    console.log('\n📁 Files by Type:');
    Object.entries(fileStats).forEach(([type, count]) => {
      console.log(`${type.padEnd(20)}: ${count}`);
    });

    // Video Categories Distribution
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