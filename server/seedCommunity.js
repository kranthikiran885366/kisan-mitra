const mongoose = require('mongoose');
const CommunityPost = require('./models/Community');
const { Conversation, Message } = require('./models/Message');
const { ForumCategory, ForumTopic } = require('./models/Forum');
const User = require('./models/User');

const seedCommunityData = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/krishi-mitra');
    console.log('Connected to MongoDB');

    // Clear existing data
    await CommunityPost.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await ForumCategory.deleteMany({});
    await ForumTopic.deleteMany({});

    // Create sample users if they don't exist
    const users = await User.find().limit(5);
    if (users.length === 0) {
      console.log('No users found. Please run user seeding first.');
      return;
    }

    // Seed Forum Categories
    const categories = await ForumCategory.insertMany([
      {
        name: 'Crop Management',
        description: 'Discuss crop cultivation, varieties, and management practices',
        icon: '🌾',
        color: 'bg-green-100',
        postCount: 0
      },
      {
        name: 'Pest & Disease Control',
        description: 'Share solutions for pest and disease management',
        icon: '🐛',
        color: 'bg-red-100',
        postCount: 0
      },
      {
        name: 'Irrigation & Water Management',
        description: 'Water conservation and irrigation techniques',
        icon: '💧',
        color: 'bg-blue-100',
        postCount: 0
      },
      {
        name: 'Soil Health',
        description: 'Soil testing, fertilizers, and soil improvement',
        icon: '🌱',
        color: 'bg-yellow-100',
        postCount: 0
      },
      {
        name: 'Market & Pricing',
        description: 'Market trends, pricing, and selling strategies',
        icon: '📈',
        color: 'bg-purple-100',
        postCount: 0
      },
      {
        name: 'Technology & Innovation',
        description: 'Modern farming techniques and agricultural technology',
        icon: '🚜',
        color: 'bg-indigo-100',
        postCount: 0
      }
    ]);

    // Seed Community Posts
    const communityPosts = [
      {
        author: users[0]._id,
        content: 'Just harvested my organic rice crop! Used natural fertilizers and got 20% better yield than last year. Happy to share my experience with fellow farmers.',
        category: 'success-story',
        tags: ['organic', 'rice', 'fertilizer'],
        location: { state: 'Punjab', district: 'Ludhiana' },
        likes: [{ user: users[1]._id }, { user: users[2]._id }],
        comments: [{
          author: users[1]._id,
          content: 'Congratulations! Can you share which organic fertilizers you used?'
        }]
      },
      {
        author: users[1]._id,
        content: 'Need help with wheat crop disease. Noticed yellow spots on leaves. Weather has been humid lately. Any suggestions for treatment?',
        category: 'problem',
        tags: ['wheat', 'disease', 'treatment'],
        location: { state: 'Haryana', district: 'Karnal' },
        likes: [{ user: users[0]._id }],
        comments: [{
          author: users[2]._id,
          content: 'Looks like yellow rust. Try copper-based fungicide spray early morning.'
        }]
      },
      {
        author: users[2]._id,
        content: 'Drip irrigation has transformed my farming! Water usage reduced by 40% and crop quality improved significantly. Initial investment was worth it.',
        category: 'tips',
        tags: ['irrigation', 'water-saving', 'technology'],
        location: { state: 'Maharashtra', district: 'Nashik' },
        likes: [{ user: users[0]._id }, { user: users[1]._id }, { user: users[3]._id }]
      },
      {
        author: users[3]._id,
        content: 'What is the best time to plant tomatoes in North India? Also looking for disease-resistant varieties. Please share your experiences.',
        category: 'question',
        tags: ['tomato', 'planting', 'varieties'],
        location: { state: 'Uttar Pradesh', district: 'Meerut' },
        comments: [{
          author: users[0]._id,
          content: 'October-November is ideal for tomato planting in North India. Try Pusa Ruby variety.'
        }]
      }
    ];

    await CommunityPost.insertMany(communityPosts);

    // Seed Forum Topics
    const forumTopics = [
      {
        title: 'Best practices for organic farming certification',
        content: 'I want to get organic certification for my farm. What are the requirements and process? How long does it take and what are the costs involved?',
        author: users[0]._id,
        category: categories[0]._id,
        tags: ['organic', 'certification', 'process'],
        views: 45,
        replies: [{
          author: users[1]._id,
          content: 'You need to follow organic standards for 3 years before certification. Contact your local certification agency for detailed requirements.'
        }]
      },
      {
        title: 'Integrated Pest Management for cotton crop',
        content: 'Looking for IPM strategies for cotton cultivation. Want to reduce chemical pesticide usage while maintaining yield quality.',
        author: users[1]._id,
        category: categories[1]._id,
        tags: ['IPM', 'cotton', 'pesticide'],
        views: 32,
        isPinned: true
      },
      {
        title: 'Soil testing frequency and parameters',
        content: 'How often should we test soil? Which parameters are most important to monitor for different crops?',
        author: users[2]._id,
        category: categories[3]._id,
        tags: ['soil-testing', 'parameters', 'monitoring'],
        views: 28,
        replies: [{
          author: users[3]._id,
          content: 'Test soil annually before sowing season. Key parameters: pH, NPK, organic matter, micronutrients.'
        }]
      }
    ];

    await ForumTopic.insertMany(forumTopics);

    // Seed Conversations and Messages
    const conversations = [
      {
        participants: [users[0]._id, users[1]._id],
        type: 'farmer-farmer',
        lastMessage: {
          content: 'Thanks for the organic farming tips!',
          sender: users[1]._id
        }
      },
      {
        participants: [users[2]._id, users[3]._id],
        type: 'buyer-seller',
        relatedItem: {
          itemType: 'product',
          itemId: new mongoose.Types.ObjectId()
        },
        lastMessage: {
          content: 'Is the fertilizer still available?',
          sender: users[3]._id
        }
      }
    ];

    const savedConversations = await Conversation.insertMany(conversations);

    const messages = [
      {
        conversation: savedConversations[0]._id,
        sender: users[0]._id,
        content: 'Hello! I saw your post about organic farming. I have been practicing it for 5 years now.'
      },
      {
        conversation: savedConversations[0]._id,
        sender: users[1]._id,
        content: 'That\'s great! I\'m just starting. Can you share some beginner tips?'
      },
      {
        conversation: savedConversations[0]._id,
        sender: users[0]._id,
        content: 'Sure! Start with composting and avoid chemical fertilizers completely for the first year.'
      },
      {
        conversation: savedConversations[0]._id,
        sender: users[1]._id,
        content: 'Thanks for the organic farming tips!'
      },
      {
        conversation: savedConversations[1]._id,
        sender: users[3]._id,
        content: 'Hi, I\'m interested in buying organic fertilizer from your listing.'
      },
      {
        conversation: savedConversations[1]._id,
        sender: users[2]._id,
        content: 'Hello! Yes, we have premium organic fertilizer available. What quantity do you need?'
      },
      {
        conversation: savedConversations[1]._id,
        sender: users[3]._id,
        content: 'Is the fertilizer still available?'
      }
    ];

    await Message.insertMany(messages);

    // Update category post counts
    for (const category of categories) {
      const topicCount = await ForumTopic.countDocuments({ category: category._id });
      await ForumCategory.findByIdAndUpdate(category._id, { postCount: topicCount });
    }

    console.log('Community data seeded successfully!');
    console.log(`- ${categories.length} forum categories created`);
    console.log(`- ${communityPosts.length} community posts created`);
    console.log(`- ${forumTopics.length} forum topics created`);
    console.log(`- ${savedConversations.length} conversations created`);
    console.log(`- ${messages.length} messages created`);

  } catch (error) {
    console.error('Error seeding community data:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedCommunityData();
}

module.exports = seedCommunityData;