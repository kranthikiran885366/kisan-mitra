const mongoose = require('mongoose');
const User = require('./models/User');

const seedUsers = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/krishi-mitra');
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});

    const users = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        mobile: '9876543210',
        password: 'password123',
        role: 'farmer',
        state: 'Punjab',
        district: 'Ludhiana',
        village: 'Khanna',
        farmDetails: {
          totalArea: 10,
          primaryCrops: ['rice', 'wheat'],
          farmingType: 'traditional'
        },
        isActive: true
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        mobile: '9876543211',
        password: 'password123',
        role: 'farmer',
        state: 'Haryana',
        district: 'Karnal',
        village: 'Assandh',
        farmDetails: {
          totalArea: 15,
          primaryCrops: ['wheat', 'mustard'],
          farmingType: 'organic'
        },
        isActive: true
      },
      {
        name: 'Dr. Suresh Patel',
        email: 'suresh@example.com',
        mobile: '9876543212',
        password: 'password123',
        role: 'agriculture_expert',
        state: 'Maharashtra',
        district: 'Nashik',
        village: 'Nashik City',
        specialization: ['crop_diseases', 'soil_management'],
        rating: {
          average: 4.8,
          count: 150
        },
        isActive: true
      },
      {
        name: 'Amit Singh',
        email: 'amit@example.com',
        mobile: '9876543213',
        password: 'password123',
        role: 'farmer',
        state: 'Uttar Pradesh',
        district: 'Meerut',
        village: 'Sardhana',
        farmDetails: {
          totalArea: 8,
          primaryCrops: ['tomato', 'onion'],
          farmingType: 'modern'
        },
        isActive: true
      },
      {
        name: 'Sunita Devi',
        email: 'sunita@example.com',
        mobile: '9876543214',
        password: 'password123',
        role: 'farmer',
        state: 'Bihar',
        district: 'Patna',
        village: 'Danapur',
        farmDetails: {
          totalArea: 5,
          primaryCrops: ['rice', 'vegetables'],
          farmingType: 'traditional'
        },
        isActive: true
      }
    ];

    await User.insertMany(users);
    console.log('Users seeded successfully!');
    console.log(`- ${users.length} users created`);

  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;