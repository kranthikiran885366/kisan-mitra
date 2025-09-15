const mongoose = require('mongoose');
const CommunityGroup = require('../models/CommunityGroup');
const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');
require('dotenv').config();

const sampleGroups = [
  {
    name: 'Rice Farmers Network',
    description: 'A community for rice farmers to share experiences, tips, and market information',
    category: 'crop_specific',
    subcategory: 'rice',
    privacy: 'public',
    location: { state: 'Andhra Pradesh', district: 'Guntur' },
    language: 'mixed',
    tags: ['rice', 'paddy', 'irrigation', 'harvest'],
    isActive: true,
    isVerified: true
  },
  {
    name: 'Organic Farming Community',
    description: 'Learn and share organic farming techniques and sustainable practices',
    category: 'technique_based',
    subcategory: 'organic',
    privacy: 'public',
    location: { state: 'Karnataka', district: 'Bangalore' },
    language: 'en',
    tags: ['organic', 'sustainable', 'natural', 'pesticide-free'],
    isActive: true,
    isVerified: true
  },
  {
    name: 'Punjab Wheat Growers',
    description: 'Connect with wheat farmers across Punjab for better farming practices',
    category: 'location_based',
    subcategory: 'wheat',
    privacy: 'public',
    location: { state: 'Punjab', district: 'Ludhiana' },
    language: 'hi',
    tags: ['wheat', 'punjab', 'mechanization', 'msp'],
    isActive: true
  },
  {
    name: 'Cotton Cultivation Experts',
    description: 'Expert-led discussions on cotton farming, pest management, and market trends',
    category: 'expert_led',
    subcategory: 'cotton',
    privacy: 'public',
    location: { state: 'Gujarat', district: 'Ahmedabad' },
    language: 'mixed',
    tags: ['cotton', 'bt-cotton', 'bollworm', 'ginning'],
    isActive: true,
    isVerified: true
  },
  {
    name: 'Vegetable Growers Association',
    description: 'Share knowledge about vegetable cultivation, greenhouse farming, and direct marketing',
    category: 'crop_specific',
    subcategory: 'vegetables',
    privacy: 'public',
    location: { state: 'Maharashtra', district: 'Pune' },
    language: 'mixed',
    tags: ['vegetables', 'greenhouse', 'hydroponics', 'market'],
    isActive: true
  }
];

const samplePosts = [
  {
    title: 'Best time for rice transplantation in Kharif season?',
    content: 'I am planning to transplant rice seedlings next week. The monsoon has been good this year. What would be the ideal time for transplantation in Guntur district? Also, what spacing should I maintain between plants?',
    type: 'question',
    category: 'crops',
    tags: ['rice', 'transplantation', 'kharif', 'spacing'],
    location: { state: 'Andhra Pradesh', district: 'Guntur' },
    priority: 'medium',
    language: 'en'
  },
  {
    title: 'Organic pest control methods that actually work',
    content: 'After 5 years of organic farming, here are the most effective natural pest control methods I have used: 1) Neem oil spray (5ml per liter) 2) Companion planting with marigold 3) Installing yellow sticky traps 4) Encouraging beneficial insects like ladybugs. These methods have reduced my pest damage by 80%.',
    type: 'tip',
    category: 'crops',
    tags: ['organic', 'pest-control', 'neem', 'companion-planting'],
    location: { state: 'Karnataka', district: 'Mysore' },
    priority: 'high',
    language: 'en'
  },
  {
    title: 'Cotton crop showing yellowing leaves - need urgent help',
    content: 'My cotton crop is 45 days old and showing yellowing of leaves from bottom. The plants are also stunted. I have been following proper irrigation schedule. Could this be a nutrient deficiency or disease? Please help urgently as I am worried about crop loss.',
    type: 'problem',
    category: 'crops',
    tags: ['cotton', 'yellowing', 'disease', 'urgent'],
    location: { state: 'Gujarat', district: 'Bharuch' },
    priority: 'urgent',
    language: 'en'
  },
  {
    title: 'Successful drip irrigation setup - 40% water savings!',
    content: 'I installed drip irrigation system last season and the results are amazing! Water usage reduced by 40%, crop yield increased by 25%, and labor cost for irrigation reduced significantly. Initial investment was ₹45,000 for 2 acres but recovered in one season. Happy to share details with anyone interested.',
    type: 'success_story',
    category: 'equipment',
    tags: ['drip-irrigation', 'water-saving', 'yield-increase', 'roi'],
    location: { state: 'Rajasthan', district: 'Jaipur' },
    priority: 'medium',
    language: 'en'
  },
  {
    title: 'Weather forecast shows heavy rain - what precautions for wheat?',
    content: 'Weather department has predicted heavy rainfall for next 3 days. My wheat crop is at flowering stage. What precautions should I take to prevent lodging and fungal diseases? Should I apply any preventive fungicide spray?',
    type: 'question',
    category: 'weather',
    tags: ['wheat', 'heavy-rain', 'lodging', 'fungicide'],
    location: { state: 'Haryana', district: 'Karnal' },
    priority: 'high',
    language: 'en'
  },
  {
    title: 'Government subsidy for solar pump - application process',
    content: 'I want to install a solar water pump for irrigation. I heard there is government subsidy available. Can someone guide me about the application process, required documents, and subsidy amount? Which department should I contact?',
    type: 'question',
    category: 'government',
    tags: ['solar-pump', 'subsidy', 'government', 'irrigation'],
    location: { state: 'Madhya Pradesh', district: 'Indore' },
    priority: 'medium',
    language: 'en'
  },
  {
    title: 'Tomato prices crashed in local market - alternative selling options?',
    content: 'Tomato prices have fallen to ₹8 per kg in our local market due to oversupply. My production cost is ₹12 per kg. Are there any alternative markets or processing units where I can sell at better prices? Any suggestions for value addition?',
    type: 'problem',
    category: 'market',
    tags: ['tomato', 'price-crash', 'alternative-market', 'value-addition'],
    location: { state: 'Tamil Nadu', district: 'Coimbatore' },
    priority: 'high',
    language: 'en'
  },
  {
    title: 'Integrated farming model - crops + dairy + fishery',
    content: 'I have successfully implemented an integrated farming model on my 5-acre farm. Combination of crop cultivation (2 acres), dairy farming (10 cows), and fish farming (1 acre pond). This diversification has increased my annual income by 150% and reduced risks. The waste from one activity becomes input for another.',
    type: 'experience',
    category: 'general',
    tags: ['integrated-farming', 'diversification', 'dairy', 'fishery'],
    location: { state: 'West Bengal', district: 'Nadia' },
    priority: 'medium',
    language: 'en'
  }
];

async function seedCommunity() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan-mitra', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🌾 Seeding Community Data...\n');

    // Clear existing data
    await CommunityGroup.deleteMany({});
    await CommunityPost.deleteMany({});
    console.log('✅ Cleared existing community data');

    // Create sample users if they don't exist
    const sampleUsers = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@farmer.com',
        mobile: '9876543220',
        role: 'farmer',
        state: 'Andhra Pradesh',
        district: 'Guntur',
        village: 'Amaravati',
        primaryCrop: 'Rice',
        experience: 15
      },
      {
        name: 'Dr. Priya Sharma',
        email: 'priya@expert.com',
        mobile: '9876543221',
        role: 'expert',
        state: 'Karnataka',
        district: 'Bangalore',
        village: 'Whitefield',
        expertise: ['Organic Farming', 'Pest Management'],
        experience: 20
      },
      {
        name: 'Suresh Patel',
        email: 'suresh@farmer.com',
        mobile: '9876543222',
        role: 'farmer',
        state: 'Gujarat',
        district: 'Bharuch',
        village: 'Ankleshwar',
        primaryCrop: 'Cotton',
        experience: 10
      },
      {
        name: 'Meera Singh',
        email: 'meera@farmer.com',
        mobile: '9876543223',
        role: 'farmer',
        state: 'Punjab',
        district: 'Ludhiana',
        village: 'Raikot',
        primaryCrop: 'Wheat',
        experience: 12
      }
    ];

    const users = [];
    for (const userData of sampleUsers) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = new User({
          ...userData,
          password: 'hashedpassword123' // In real app, this would be properly hashed
        });
        await user.save();
      }
      users.push(user);
    }

    console.log(`✅ Created/found ${users.length} sample users`);

    // Create community groups
    const createdGroups = [];
    for (let i = 0; i < sampleGroups.length; i++) {
      const groupData = {
        ...sampleGroups[i],
        createdBy: users[i % users.length]._id,
        members: [{
          user: users[i % users.length]._id,
          role: 'admin',
          joinedAt: new Date(),
          isActive: true,
          lastSeen: new Date(),
          messageCount: 0,
          reputation: 100
        }],
        stats: {
          totalMessages: Math.floor(Math.random() * 100) + 10,
          activeMembers: Math.floor(Math.random() * 20) + 5,
          dailyMessages: Math.floor(Math.random() * 10) + 1,
          weeklyMessages: Math.floor(Math.random() * 50) + 10,
          lastActivity: new Date()
        }
      };

      // Add random members to groups
      const additionalMembers = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < additionalMembers; j++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        if (!groupData.members.find(m => m.user.toString() === randomUser._id.toString())) {
          groupData.members.push({
            user: randomUser._id,
            role: 'member',
            joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            isActive: true,
            lastSeen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
            messageCount: Math.floor(Math.random() * 20),
            reputation: Math.floor(Math.random() * 50) + 10
          });
        }
      }

      const group = new CommunityGroup(groupData);
      await group.save();
      createdGroups.push(group);
    }

    console.log(`✅ Created ${createdGroups.length} community groups`);

    // Create community posts
    const createdPosts = [];
    for (let i = 0; i < samplePosts.length; i++) {
      const postData = {
        ...samplePosts[i],
        author: users[i % users.length]._id,
        group: i < createdGroups.length ? createdGroups[i]._id : null,
        views: Math.floor(Math.random() * 100) + 10,
        shares: Math.floor(Math.random() * 20),
        reactions: [],
        comments: []
      };

      // Add random reactions
      const reactionCount = Math.floor(Math.random() * 15) + 1;
      for (let j = 0; j < reactionCount; j++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const reactionTypes = ['like', 'helpful', 'thanks', 'love'];
        const randomType = reactionTypes[Math.floor(Math.random() * reactionTypes.length)];
        
        if (!postData.reactions.find(r => r.user.toString() === randomUser._id.toString())) {
          postData.reactions.push({
            user: randomUser._id,
            type: randomType,
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
          });
        }
      }

      // Add random comments
      const commentCount = Math.floor(Math.random() * 8) + 1;
      const sampleComments = [
        'Great question! I faced similar issue last season.',
        'Thanks for sharing this valuable information.',
        'Have you tried consulting with local agricultural officer?',
        'This is very helpful. I will try this method.',
        'Similar problem in our area too. Looking for solutions.',
        'Excellent tip! This saved my crop last year.',
        'Can you share more details about the process?',
        'Government schemes are really helpful for small farmers.'
      ];

      for (let j = 0; j < commentCount; j++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
        
        postData.comments.push({
          author: randomUser._id,
          content: randomComment,
          reactions: [],
          isAnswer: j === 0 && postData.type === 'question' && Math.random() > 0.7,
          createdAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000)
        });
      }

      // Mark as resolved if it's a question with an answer
      if (postData.type === 'question' && postData.comments.some(c => c.isAnswer)) {
        postData.isResolved = true;
      }

      const post = new CommunityPost(postData);
      await post.save();
      createdPosts.push(post);
    }

    console.log(`✅ Created ${createdPosts.length} community posts`);

    // Display summary
    console.log('\n📊 Community Data Summary:');
    console.log('─'.repeat(50));
    
    const groupsByCategory = await CommunityGroup.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n🏘️  Groups by Category:');
    groupsByCategory.forEach(item => {
      console.log(`${item._id.padEnd(20)}: ${item.count}`);
    });

    const postsByType = await CommunityPost.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📝 Posts by Type:');
    postsByType.forEach(item => {
      console.log(`${item._id.padEnd(20)}: ${item.count}`);
    });

    const postsByCategory = await CommunityPost.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📂 Posts by Category:');
    postsByCategory.forEach(item => {
      console.log(`${item._id.padEnd(20)}: ${item.count}`);
    });

    console.log('\n🎉 Community seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding community data:', error);
    process.exit(1);
  }
}

seedCommunity();