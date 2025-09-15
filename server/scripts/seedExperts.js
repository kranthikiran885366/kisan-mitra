const mongoose = require('mongoose');
const User = require('../models/User');
const Expert = require('../models/Expert');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan-mitra');

const expertUsers = [
  {
    name: 'Dr. Ramesh Kumar',
    email: 'dr.ramesh@agriexpert.com',
    mobile: '9876543301',
    password: 'hashedpassword123',
    role: 'expert',
    state: 'Karnataka',
    district: 'Bangalore',
    village: 'Whitefield',
    isVerified: true
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'dr.priya@agriexpert.com',
    mobile: '9876543302',
    password: 'hashedpassword123',
    role: 'expert',
    state: 'Maharashtra',
    district: 'Pune',
    village: 'Hinjewadi',
    isVerified: true
  },
  {
    name: 'Dr. Suresh Reddy',
    email: 'dr.suresh@agriexpert.com',
    mobile: '9876543303',
    password: 'hashedpassword123',
    role: 'expert',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    village: 'Mangalagiri',
    isVerified: true
  }
];

const expertDetails = [
  {
    specialization: ['soil_management', 'organic_farming'],
    experience: 15,
    hourlyRate: 1500,
    bio: 'Ph.D. in Soil Science with 15 years of experience in sustainable agriculture. Specialized in organic farming and soil health management. Published research in leading agricultural journals.',
    languages: ['english', 'kannada', 'hindi'],
    availability: [
      { day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'friday', startTime: '09:00', endTime: '17:00', isAvailable: true }
    ],
    education: [
      {
        degree: 'Ph.D. in Soil Science',
        institution: 'Indian Agricultural Research Institute',
        year: 2008
      },
      {
        degree: 'M.Sc. Agriculture',
        institution: 'University of Agricultural Sciences, Bangalore',
        year: 2005
      }
    ],
    certifications: [
      {
        name: 'Certified Organic Farming Specialist',
        issuingOrganization: 'ICAR',
        issueDate: new Date('2020-01-15'),
        credentialId: 'ICAR/OF/2020/1234'
      }
    ],
    consultationMethods: {
      video: true,
      chat: true,
      inPerson: true
    },
    responseTime: 4,
    isVerified: true,
    status: 'active'
  },
  {
    specialization: ['crop_diseases', 'pest_control'],
    experience: 12,
    hourlyRate: 1200,
    bio: 'Expert in plant pathology and integrated pest management. Extensive experience in diagnosing and treating crop diseases. Conducted numerous farmer training programs.',
    languages: ['english', 'marathi', 'hindi'],
    availability: [
      { day: 'monday', startTime: '10:00', endTime: '18:00', isAvailable: true },
      { day: 'tuesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
      { day: 'wednesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
      { day: 'thursday', startTime: '10:00', endTime: '18:00', isAvailable: true },
      { day: 'saturday', startTime: '10:00', endTime: '14:00', isAvailable: true }
    ],
    education: [
      {
        degree: 'Ph.D. in Plant Pathology',
        institution: 'Tamil Nadu Agricultural University',
        year: 2011
      }
    ],
    certifications: [
      {
        name: 'Advanced Plant Protection Specialist',
        issuingOrganization: 'IARI',
        issueDate: new Date('2019-06-20'),
        credentialId: 'IARI/PPS/2019/789'
      }
    ],
    consultationMethods: {
      video: true,
      chat: true,
      inPerson: false
    },
    responseTime: 6,
    isVerified: true,
    status: 'active'
  },
  {
    specialization: ['irrigation', 'water_management', 'crop_planning'],
    experience: 10,
    hourlyRate: 1000,
    bio: 'Agricultural engineer specializing in irrigation systems and water management. Expert in designing efficient irrigation solutions for various crop types.',
    languages: ['english', 'telugu', 'hindi'],
    availability: [
      { day: 'monday', startTime: '08:00', endTime: '16:00', isAvailable: true },
      { day: 'tuesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
      { day: 'thursday', startTime: '08:00', endTime: '16:00', isAvailable: true },
      { day: 'friday', startTime: '08:00', endTime: '16:00', isAvailable: true }
    ],
    education: [
      {
        degree: 'M.Tech in Agricultural Engineering',
        institution: 'Acharya N.G. Ranga Agricultural University',
        year: 2013
      }
    ],
    certifications: [
      {
        name: 'Certified Irrigation Design Expert',
        issuingOrganization: 'Indian Society of Agricultural Engineers',
        issueDate: new Date('2018-03-10'),
        credentialId: 'ISAE/IDE/2018/456'
      }
    ],
    consultationMethods: {
      video: true,
      chat: true,
      inPerson: true
    },
    responseTime: 12,
    isVerified: true,
    status: 'active'
  }
];

async function seedExperts() {
  try {
    console.log('🌾 Seeding Expert Data...\n');

    // Clear existing experts
    await Expert.deleteMany({});
    console.log('✅ Cleared existing expert data');

    const experts = [];
    for (let i = 0; i < expertUsers.length; i++) {
      // Create or find user
      let user = await User.findOne({ email: expertUsers[i].email });
      if (!user) {
        user = new User(expertUsers[i]);
        await user.save();
      }

      // Create expert profile
      const expert = new Expert({
        ...expertDetails[i],
        user: user._id
      });
      await expert.save();
      experts.push(expert);
    }

    console.log(`✅ Created ${experts.length} expert profiles\n`);
    
    console.log('📊 Expert Data Summary:');
    console.log('─'.repeat(50));
    
    const specializationStats = {};
    experts.forEach(expert => {
      expert.specialization.forEach(spec => {
        specializationStats[spec] = (specializationStats[spec] || 0) + 1;
      });
    });
    
    console.log('\n👨‍🔬 Experts by Specialization:');
    Object.entries(specializationStats).forEach(([spec, count]) => {
      console.log(`${spec.padEnd(20)}: ${count}`);
    });

    console.log('\n🌟 Experience Range:');
    const minExp = Math.min(...experts.map(e => e.experience));
    const maxExp = Math.max(...experts.map(e => e.experience));
    console.log(`${minExp} to ${maxExp} years`);

    console.log('\n💰 Hourly Rate Range:');
    const minRate = Math.min(...experts.map(e => e.hourlyRate));
    const maxRate = Math.max(...experts.map(e => e.hourlyRate));
    console.log(`₹${minRate} to ₹${maxRate}`);

    console.log('\n🎉 Expert seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding expert data:', error);
    process.exit(1);
  }
}

seedExperts();