const mongoose = require('mongoose');
const AIConversation = require('../models/AIConversation');
const AIKnowledgeBase = require('../models/AIKnowledgeBase');
const aiService = require('../services/aiService');
const User = require('../models/User');
require('dotenv').config();

async function testAIAssistant() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan-mitra', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🤖 Testing AI Assistant Functionality...\n');

    // Create a test user
    const testUser = await User.findOneAndUpdate(
      { email: 'test@farmer.com' },
      {
        name: 'Test Farmer',
        email: 'test@farmer.com',
        mobile: '9999999999',
        role: 'farmer',
        soilType: 'loamy',
        state: 'Punjab',
        district: 'Ludhiana',
        preferredLanguage: 'en'
      },
      { upsert: true, new: true }
    );

    console.log('✅ Test user created:', testUser.name);

    // Test AI Service responses
    const testQueries = [
      'Hello, I need help with farming',
      'What is the best time to plant rice?',
      'How to control pests in tomato plants?',
      'What government schemes are available?',
      'How to test soil health?'
    ];

    console.log('\n🧠 Testing AI Service Responses:\n');

    for (const query of testQueries) {
      console.log(`Query: "${query}"`);
      const response = await aiService.processMessage(query, testUser._id, { language: 'en' });
      console.log(`Response: ${response.text.substring(0, 100)}...`);
      console.log(`Intent: ${response.intent}, Confidence: ${response.confidence}\n`);
    }

    // Test conversation creation
    console.log('💬 Testing Conversation Management:\n');

    const sessionId = 'test-session-' + Date.now();
    const conversation = await AIConversation.createNewConversation(
      testUser._id,
      sessionId,
      { preferences: { language: 'en' } }
    );

    console.log('✅ Conversation created:', conversation._id);

    // Add test messages
    await conversation.addMessage('Hello', 'user');
    await conversation.addMessage('Hello! How can I help you with farming today?', 'assistant', {
      intent: 'greeting',
      confidence: 0.9
    });

    console.log('✅ Messages added to conversation');

    // Test knowledge base search
    console.log('\n📚 Testing Knowledge Base:\n');

    const knowledgeCount = await AIKnowledgeBase.countDocuments();
    console.log(`Knowledge base entries: ${knowledgeCount}`);

    if (knowledgeCount > 0) {
      const searchResults = await AIKnowledgeBase.searchByKeywords(['rice', 'planting'], null, 3);
      console.log(`Search results for "rice planting": ${searchResults.length} entries`);
      
      if (searchResults.length > 0) {
        console.log(`Sample result: ${searchResults[0].question}`);
        console.log(`Answer: ${searchResults[0].answer.en.substring(0, 100)}...`);
      }
    }

    // Test suggested questions
    console.log('\n💡 Testing Suggested Questions:\n');

    const suggestions = await aiService.getSuggestedQuestions(testUser._id, 'en');
    console.log('Suggested questions:');
    suggestions.forEach((q, i) => console.log(`${i + 1}. ${q}`));

    console.log('\n🎉 All AI Assistant tests completed successfully!');
    
    // Cleanup
    await AIConversation.deleteOne({ _id: conversation._id });
    console.log('🧹 Test data cleaned up');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testAIAssistant();