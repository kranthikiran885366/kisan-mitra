const mongoose = require('mongoose');
const User = require('../models/User');
const Expert = require('../models/Expert');
const Consultation = require('../models/Consultation');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan-mitra');

async function seedConsultations() {
  try {
    console.log('🌾 Seeding Consultation Data...\n');

    // Clear existing consultations
    await Consultation.deleteMany({});
    console.log('✅ Cleared existing consultation data');

    // Get experts and farmers
    const experts = await Expert.find().populate('user');
    const farmers = await User.find({ role: 'farmer' });

    if (experts.length === 0 || farmers.length === 0) {
      throw new Error('No experts or farmers found. Please run seedExperts.js and seedCommunity.js first.');
    }

    const consultations = [];
    
    // Sample consultation types and their probabilities
    const consultationTypes = [
      { type: 'crop_disease', prob: 0.3 },
      { type: 'soil_management', prob: 0.2 },
      { type: 'pest_control', prob: 0.2 },
      { type: 'irrigation', prob: 0.15 },
      { type: 'fertilizer', prob: 0.1 },
      { type: 'general', prob: 0.05 }
    ];

    // Sample crops and their common issues
    const crops = [
      {
        name: 'Rice',
        varieties: ['IR64', 'Samba Mahsuri', 'MTU 7029'],
        issues: ['Blast disease', 'Brown spot', 'Bacterial blight', 'Stem borer']
      },
      {
        name: 'Cotton',
        varieties: ['Bt Cotton', 'DCH-32', 'MCU-5'],
        issues: ['Bollworm', 'White fly', 'Leaf curl virus', 'Wilt']
      },
      {
        name: 'Wheat',
        varieties: ['HD 2967', 'PBW 343', 'WH 542'],
        issues: ['Yellow rust', 'Powdery mildew', 'Loose smut', 'Aphids']
      }
    ];

    // Generate 50 consultations
    for (let i = 0; i < 50; i++) {
      // Random farmer and expert
      const farmer = farmers[Math.floor(Math.random() * farmers.length)];
      const expert = experts[Math.floor(Math.random() * experts.length)];
      
      // Random consultation type based on probability
      const rand = Math.random();
      let cumProb = 0;
      const type = consultationTypes.find(t => {
        cumProb += t.prob;
        return rand <= cumProb;
      }).type;

      // Random crop and its details
      const crop = crops[Math.floor(Math.random() * crops.length)];
      const variety = crop.varieties[Math.floor(Math.random() * crop.varieties.length)];
      const issue = crop.issues[Math.floor(Math.random() * crop.issues.length)];

      // Random dates within last 30 days
      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      // Consultation status based on creation date
      const daysSinceCreation = (Date.now() - createdAt.getTime()) / (24 * 60 * 60 * 1000);
      let status = 'open';
      if (daysSinceCreation > 20) status = 'closed';
      else if (daysSinceCreation > 15) status = 'resolved';
      else if (daysSinceCreation > 10) status = 'in_progress';
      else if (daysSinceCreation > 5) status = 'assigned';

      // Create consultation
      const consultation = new Consultation({
        farmer: farmer._id,
        expert: expert.user._id,
        type,
        priority: Math.random() < 0.2 ? 'urgent' : Math.random() < 0.5 ? 'high' : 'medium',
        subject: `${issue} in ${crop.name}`,
        description: `I've noticed ${issue.toLowerCase()} in my ${crop.name} crop (${variety} variety). The affected area is showing [symptoms]. Please advise on treatment.`,
        cropDetails: {
          cropName: crop.name,
          variety,
          stage: ['seedling', 'vegetative', 'flowering', 'maturity'][Math.floor(Math.random() * 4)],
          area: Math.floor(Math.random() * 10) + 1,
          sowingDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          currentIssues: [issue]
        },
        location: {
          district: farmer.district,
          state: farmer.state,
          village: farmer.village
        },
        status,
        isUrgent: status === 'urgent',
        estimatedResolutionTime: Math.floor(Math.random() * 48) + 24
      });

      // Add some messages if consultation is not new
      if (status !== 'open') {
        const messages = [
          {
            sender: farmer._id,
            message: `I've noticed ${issue.toLowerCase()} in my crop. Need urgent advice.`,
            messageType: 'text',
            timestamp: new Date(createdAt.getTime() + 1000)
          },
          {
            sender: expert.user._id,
            message: `Could you please share some photos of the affected area? Also, when did you first notice this issue?`,
            messageType: 'text',
            timestamp: new Date(createdAt.getTime() + 4 * 60 * 60 * 1000)
          },
          {
            sender: farmer._id,
            message: `I first noticed it 3 days ago. The affected area is spreading quickly.`,
            messageType: 'text',
            timestamp: new Date(createdAt.getTime() + 5 * 60 * 60 * 1000)
          }
        ];

        consultation.messages = messages;

        // Add recommendations for in_progress/resolved/closed consultations
        if (['in_progress', 'resolved', 'closed'].includes(status)) {
          consultation.recommendations = [{
            category: 'treatment',
            title: `Treatment plan for ${issue}`,
            description: 'Based on the symptoms, here is the recommended treatment plan...',
            priority: 'high',
            actionRequired: true,
            timeline: {
              immediate: true,
              withinDays: 3
            },
            products: [{
              name: 'Organic Pesticide',
              dosage: '5ml per liter',
              applicationMethod: 'Foliar spray',
              safetyPrecautions: ['Wear protective gear', 'Apply in evening']
            }]
          }];
        }

        // Add rating for closed consultations
        if (status === 'closed') {
          consultation.rating = {
            score: Math.floor(Math.random() * 2) + 4,
            feedback: 'Very helpful advice. The treatment worked well.',
            ratedAt: new Date(createdAt.getTime() + 15 * 24 * 60 * 60 * 1000),
            aspects: {
              expertise: 5,
              communication: 4,
              timeliness: 4,
              helpfulness: 5
            }
          };
        }
      }

      await consultation.save();
      consultations.push(consultation);
    }

    console.log(`✅ Created ${consultations.length} consultations\n`);
    
    console.log('📊 Consultation Summary:');
    console.log('─'.repeat(50));
    
    // Status distribution
    const statusStats = {};
    consultations.forEach(c => {
      statusStats[c.status] = (statusStats[c.status] || 0) + 1;
    });
    
    console.log('\n📈 Consultations by Status:');
    Object.entries(statusStats).forEach(([status, count]) => {
      console.log(`${status.padEnd(20)}: ${count}`);
    });

    // Type distribution
    const typeStats = {};
    consultations.forEach(c => {
      typeStats[c.type] = (typeStats[c.type] || 0) + 1;
    });
    
    console.log('\n🔍 Consultations by Type:');
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`${type.padEnd(20)}: ${count}`);
    });

    // Calculate average resolution time for resolved consultations
    const resolvedConsultations = consultations.filter(c => ['resolved', 'closed'].includes(c.status));
    const avgResolutionTime = resolvedConsultations.reduce((acc, curr) => acc + curr.estimatedResolutionTime, 0) / resolvedConsultations.length;
    
    console.log('\n⏱️  Average Resolution Time:', Math.round(avgResolutionTime), 'hours');

    console.log('\n🎉 Consultation seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding consultation data:', error);
    process.exit(1);
  }
}

seedConsultations();