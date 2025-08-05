const AIKnowledgeBase = require('../models/AIKnowledgeBase');
const CropRecommendation = require('../models/CropRecommendation');
const User = require('../models/User');

class AIService {
  constructor() {
    this.intents = {
      greeting: ['hello', 'hi', 'namaste', 'good morning', 'good evening'],
      crop_advice: ['crop', 'plant', 'grow', 'cultivation', 'farming', 'sowing'],
      disease: ['disease', 'pest', 'problem', 'infection', 'bug', 'insect'],
      weather: ['weather', 'rain', 'temperature', 'climate', 'season'],
      market: ['price', 'market', 'sell', 'buy', 'rate', 'cost'],
      schemes: ['scheme', 'subsidy', 'government', 'loan', 'support'],
      general: ['help', 'how', 'what', 'when', 'where', 'why']
    };
  }

  async processMessage(message, userId, context = {}) {
    try {
      const intent = this.detectIntent(message);
      const entities = this.extractEntities(message);
      
      let response;
      
      switch (intent) {
        case 'greeting':
          response = await this.handleGreeting(context.language || 'en');
          break;
        case 'crop_advice':
          response = await this.handleCropAdvice(message, entities, userId);
          break;
        case 'disease':
          response = await this.handleDiseaseQuery(message, entities);
          break;
        case 'weather':
          response = await this.handleWeatherQuery(message, entities, userId);
          break;
        case 'market':
          response = await this.handleMarketQuery(message, entities);
          break;
        case 'schemes':
          response = await this.handleSchemesQuery(message, entities);
          break;
        default:
          response = await this.handleGeneralQuery(message);
      }

      return {
        text: response,
        intent,
        entities,
        confidence: 0.8
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        text: "I'm sorry, I encountered an error. Please try asking your question again.",
        intent: 'error',
        entities: [],
        confidence: 0.1
      };
    }
  }

  detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    for (const [intent, keywords] of Object.entries(this.intents)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return intent;
      }
    }
    
    return 'general';
  }

  extractEntities(message) {
    const entities = [];
    const lowerMessage = message.toLowerCase();
    
    // Extract crop names
    const crops = ['rice', 'wheat', 'cotton', 'tomato', 'potato', 'onion', 'sugarcane'];
    crops.forEach(crop => {
      if (lowerMessage.includes(crop)) {
        entities.push({ type: 'crop', value: crop });
      }
    });
    
    // Extract seasons
    const seasons = ['kharif', 'rabi', 'zaid', 'summer', 'winter', 'monsoon'];
    seasons.forEach(season => {
      if (lowerMessage.includes(season)) {
        entities.push({ type: 'season', value: season });
      }
    });
    
    return entities;
  }

  async handleGreeting(language = 'en') {
    const greetings = {
      en: "Hello! I'm your AI farming assistant. I can help you with crop advice, disease identification, weather information, market prices, and government schemes. What would you like to know?",
      hi: "नमस्ते! मैं आपका कृषि सहायक हूं। मैं फसल सलाह, रोग पहचान, मौसम जानकारी, बाजार भाव और सरकारी योजनाओं में आपकी मदद कर सकता हूं। आप क्या जानना चाहते हैं?",
      te: "నమస్కారం! నేను మీ కృషి సహాయకుడను. నేను పంట సలహా, వ్యాధి గుర్తింపు, వాతావరణ సమాచారం, మార్కెట్ ధరలు మరియు ప్రభుత్వ పథకాలలో మీకు సహాయం చేయగలను. మీరు ఏమి తెలుసుకోవాలనుకుంటున్నారు?"
    };
    
    return greetings[language] || greetings.en;
  }

  async handleCropAdvice(message, entities, userId) {
    try {
      const user = await User.findById(userId);
      const cropEntity = entities.find(e => e.type === 'crop');
      
      if (cropEntity) {
        const crop = await CropRecommendation.findOne({ 
          cropName: new RegExp(cropEntity.value, 'i') 
        });
        
        if (crop) {
          return `For ${crop.cropName}:\n\n🌱 Best sowing time: ${crop.sowingTime?.optimal || crop.sowingTime?.start}\n🌾 Duration: ${crop.duration} days\n💧 Water requirement: ${crop.waterRequirement}\n🌡️ Optimal temperature: ${crop.climateRequirements?.temperature?.optimal}°C\n💰 Expected yield: ${crop.expectedYield?.average} quintals/hectare\n\nWould you like more specific information about cultivation practices?`;
        }
      }
      
      // Get general crop recommendations based on user profile
      if (user && user.soilType) {
        const recommendations = await CropRecommendation.find({
          suitableSoils: user.soilType,
          isActive: true
        }).limit(3);
        
        if (recommendations.length > 0) {
          const cropList = recommendations.map(crop => 
            `• ${crop.cropName} (${crop.season} season, ${crop.duration} days)`
          ).join('\n');
          
          return `Based on your ${user.soilType} soil, here are some recommended crops:\n\n${cropList}\n\nWould you like detailed information about any specific crop?`;
        }
      }
      
      return "I can help you with crop selection and cultivation advice. Please tell me:\n• What crop are you interested in?\n• What's your soil type?\n• Which season are you planning for?\n\nThis will help me give you more specific recommendations.";
    } catch (error) {
      return "I can provide crop advice for various seasons and soil types. What specific crop information do you need?";
    }
  }

  async handleDiseaseQuery(message, entities) {
    const commonDiseases = {
      'leaf spot': 'Leaf spots are usually caused by fungal infections. Apply copper-based fungicides and ensure proper air circulation. Remove affected leaves immediately.',
      'yellowing': 'Yellowing leaves can indicate nutrient deficiency (especially nitrogen), overwatering, or disease. Check soil moisture and consider soil testing.',
      'wilting': 'Wilting can be caused by water stress, root rot, or vascular diseases. Check soil moisture and root health. Ensure proper drainage.',
      'pest': 'For pest control, use integrated pest management: neem oil, beneficial insects, pheromone traps, and targeted pesticides as last resort.'
    };
    
    const lowerMessage = message.toLowerCase();
    
    for (const [disease, advice] of Object.entries(commonDiseases)) {
      if (lowerMessage.includes(disease)) {
        return `🔍 ${advice}\n\nFor accurate diagnosis, I recommend:\n• Taking clear photos of affected plants\n• Consulting with local agricultural extension officer\n• Using our disease detection feature\n\nWould you like more specific treatment options?`;
      }
    }
    
    return "I can help identify plant diseases and pests. Please describe:\n• What symptoms do you see?\n• Which crop is affected?\n• When did you first notice the problem?\n\nYou can also use our AI disease detection feature by uploading plant photos.";
  }

  async handleWeatherQuery(message, entities, userId) {
    try {
      const user = await User.findById(userId);
      const location = user?.district || 'your area';
      
      return `🌤️ For weather information in ${location}:\n\n• Check our weather section for current conditions\n• 5-day forecast available\n• Agricultural weather alerts\n• Rainfall and temperature trends\n\nBased on weather, I can suggest:\n• Best times for sowing/harvesting\n• Irrigation scheduling\n• Pest and disease risk alerts\n\nWhat specific weather information do you need?`;
    } catch (error) {
      return "I can provide weather-based farming advice. Visit our weather section for current conditions and forecasts in your area.";
    }
  }

  async handleMarketQuery(message, entities) {
    const cropEntity = entities.find(e => e.type === 'crop');
    
    if (cropEntity) {
      return `📈 For ${cropEntity.value} market information:\n\n• Current mandi prices\n• Price trends and analysis\n• Best selling locations\n• Market demand forecast\n\nVisit our market section for real-time prices and trends. Would you like information about specific markets or selling strategies?`;
    }
    
    return "💰 I can help with market information:\n\n• Current crop prices\n• Market trends\n• Best selling times\n• Price forecasts\n\nWhich crop's market information do you need? Visit our market section for live prices.";
  }

  async handleSchemesQuery(message, entities) {
    return "🏛️ Government schemes available for farmers:\n\n• PM-KISAN: Direct income support\n• Crop insurance schemes\n• Soil health card program\n• Organic farming support\n• Equipment subsidies\n\nVisit our schemes section for:\n• Eligibility criteria\n• Application process\n• Required documents\n• Deadlines\n\nWhich type of scheme are you interested in?";
  }

  async handleGeneralQuery(message) {
    // Search knowledge base
    const keywords = message.toLowerCase().split(' ').filter(word => word.length > 3);
    const results = await AIKnowledgeBase.searchByKeywords(keywords, null, 1);
    
    if (results.length > 0) {
      const result = results[0];
      await result.incrementUsage();
      return result.answer.en;
    }
    
    return "I'm here to help with farming questions! I can assist with:\n\n🌱 Crop selection and cultivation\n🐛 Disease and pest management\n🌤️ Weather-based advice\n💰 Market prices and trends\n🏛️ Government schemes\n\nWhat specific farming topic would you like to know about?";
  }

  async getSuggestedQuestions(userId, language = 'en') {
    try {
      const user = await User.findById(userId);
      const suggestions = {
        en: [
          "What crops are best for my soil type?",
          "How to control pests organically?",
          "When should I plant for the current season?",
          "What government schemes can I apply for?",
          "How to improve soil fertility naturally?"
        ],
        hi: [
          "मेरी मिट्टी के लिए कौन सी फसल सबसे अच्छी है?",
          "जैविक तरीके से कीट नियंत्रण कैसे करें?",
          "वर्तमान मौसम के लिए कब बुआई करनी चाहिए?",
          "कौन सी सरकारी योजनाओं के लिए आवेदन कर सकता हूं?",
          "प्राकृतिक तरीके से मिट्टी की उर्वरता कैसे बढ़ाएं?"
        ],
        te: [
          "నా మట్టికి ఏ పంటలు మంచివి?",
          "సేంద్రీయ పద్ధతిలో కీటకాలను ఎలా నియంత్రించాలి?",
          "ప్రస్తుత కాలానికి ఎప్పుడు విత్తనాలు వేయాలి?",
          "ఏ ప్రభుత్వ పథకాలకు దరఖాస్తు చేసుకోవచ్చు?",
          "సహజ పద్ధతిలో మట్టి సారవంతత ఎలా పెంచాలి?"
        ]
      };
      
      return suggestions[language] || suggestions.en;
    } catch (error) {
      return [
        "What crops are best for my soil type?",
        "How to control pests organically?",
        "When should I plant for the current season?"
      ];
    }
  }
}

module.exports = new AIService();