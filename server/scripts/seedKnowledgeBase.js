const mongoose = require('mongoose');
const AIKnowledgeBase = require('../models/AIKnowledgeBase');
require('dotenv').config();

const knowledgeData = [
  {
    category: 'crops',
    subcategory: 'rice',
    question: 'When is the best time to plant rice?',
    answer: {
      en: 'Rice is typically planted during the monsoon season (June-July) for kharif crops. The ideal time is when there is sufficient water availability and temperature is between 20-35°C.',
      hi: 'चावल आमतौर पर मानसून के मौसम (जून-जुलाई) में खरीफ फसलों के लिए लगाया जाता है। आदर्श समय तब होता है जब पर्याप्त पानी उपलब्ध हो और तापमान 20-35°C के बीच हो।',
      te: 'వరిని సాధారణంగా వర్షాకాలంలో (జూన్-జూలై) ఖరీఫ్ పంటలకు నాటుతారు. తగినంత నీరు అందుబాటులో ఉన్నప్పుడు మరియు ఉష్ణోగ్రత 20-35°C మధ్య ఉన్నప్పుడు ఆదర్శ సమయం.'
    },
    keywords: ['rice', 'planting', 'time', 'season', 'monsoon'],
    tags: ['kharif', 'monsoon', 'timing'],
    confidence: 0.9
  },
  {
    category: 'diseases',
    subcategory: 'fungal',
    question: 'How to treat leaf spot disease?',
    answer: {
      en: 'Leaf spot disease can be treated with copper-based fungicides. Remove affected leaves, improve air circulation, and avoid overhead watering. Apply fungicide every 7-10 days until symptoms disappear.',
      hi: 'पत्ती धब्बा रोग का इलाज तांबा आधारित कवकनाशी से किया जा सकता है। प्रभावित पत्तियों को हटाएं, हवा का संचार बेहतर बनाएं, और ऊपर से पानी देने से बचें। लक्षण गायब होने तक हर 7-10 दिन में कवकनाशी का छिड़काव करें।',
      te: 'ఆకు మచ్చ వ్యాధిని రాగి ఆధారిత శిలీంద్రనాశకాలతో చికిత్స చేయవచ్చు. ప్రభావిత ఆకులను తొలగించండి, గాలి ప్రసరణను మెరుగుపరచండి మరియు పైనుండి నీరు పోయడం మానుకోండి. లక్షణాలు మాయమయ్యే వరకు ప్రతి 7-10 రోజులకు శిలీంద్రనాశకం వేయండి.'
    },
    keywords: ['leaf', 'spot', 'disease', 'fungal', 'treatment'],
    tags: ['disease', 'fungicide', 'treatment'],
    confidence: 0.85
  },
  {
    category: 'techniques',
    subcategory: 'organic',
    question: 'How to make organic fertilizer at home?',
    answer: {
      en: 'You can make organic fertilizer using kitchen waste, cow dung, and dried leaves. Mix them in a 3:1:1 ratio, add water, and let it decompose for 2-3 months. Turn the mixture weekly for better decomposition.',
      hi: 'आप रसोई के कचरे, गोबर और सूखे पत्तों का उपयोग करके जैविक खाद बना सकते हैं। इन्हें 3:1:1 के अनुपात में मिलाएं, पानी डालें और 2-3 महीने तक सड़ने दें। बेहतर सड़न के लिए मिश्रण को साप्ताहिक रूप से पलटें।',
      te: 'మీరు వంటగది వ్యర్థాలు, ఆవు పేడ మరియు ఎండిన ఆకులను ఉపయోగించి సేంద్రీయ ఎరువులను తయారు చేయవచ్చు. వాటిని 3:1:1 నిష్పత్తిలో కలపండి, నీరు జోడించి 2-3 నెలలు కుళ్ళిపోనివ్వండి. మంచి కుళ్ళిపోవడానికి వారానికి మిశ్రమాన్ని తిప్పండి.'
    },
    keywords: ['organic', 'fertilizer', 'compost', 'home', 'kitchen waste'],
    tags: ['organic', 'fertilizer', 'composting'],
    confidence: 0.8
  },
  {
    category: 'pests',
    subcategory: 'insects',
    question: 'How to control aphids naturally?',
    answer: {
      en: 'Control aphids naturally using neem oil spray, soap solution, or by introducing ladybugs. Spray neem oil (5ml per liter) in the evening. You can also use reflective mulch to confuse aphids.',
      hi: 'नीम तेल स्प्रे, साबुन के घोल का उपयोग करके या लेडीबग्स को शामिल करके माहू को प्राकृतिक रूप से नियंत्रित करें। शाम को नीम का तेल (5 मिली प्रति लीटर) का छिड़काव करें। आप माहू को भ्रमित करने के लिए परावर्तक मल्च का भी उपयोग कर सकते हैं।',
      te: 'వేప నూనె స్ప్రే, సబ్బు ద్రావణం ఉపయోగించి లేదా లేడీబగ్‌లను ప్రవేశపెట్టడం ద్వారా అఫిడ్‌లను సహజంగా నియంత్రించండి. సాయంత్రం వేప నూనె (లీటరుకు 5 మిలీ) స్ప్రే చేయండి. అఫిడ్‌లను గందరగోళపరచడానికి మీరు ప్రతిబింబ మల్చ్‌ను కూడా ఉపయోగించవచ్చు.'
    },
    keywords: ['aphids', 'control', 'natural', 'neem', 'organic'],
    tags: ['pest', 'organic', 'natural'],
    confidence: 0.85
  },
  {
    category: 'weather',
    subcategory: 'monsoon',
    question: 'How to prepare for monsoon farming?',
    answer: {
      en: 'Prepare for monsoon by cleaning drainage channels, checking irrigation systems, preparing seedbeds, and stocking quality seeds. Ensure proper field leveling and have contingency plans for excess or deficit rainfall.',
      hi: 'जल निकासी चैनलों की सफाई, सिंचाई प्रणालियों की जांच, बीज क्यारियों की तैयारी और गुणवत्तापूर्ण बीजों का भंडारण करके मानसून की तैयारी करें। उचित खेत समतलीकरण सुनिश्चित करें और अतिरिक्त या कम वर्षा के लिए आकस्मिक योजनाएं रखें।',
      te: 'డ్రైనేజీ చానెల్‌లను శుభ్రం చేయడం, నీటిపారుదల వ్యవస్థలను తనిఖీ చేయడం, విత్తన పడకలను సిద్ధం చేయడం మరియు నాణ్యమైన విత్తనాలను నిల్వ చేయడం ద్వారా వర్షాకాలానికి సిద్ధం అవ్వండి. సరైన పొలం సమం చేయడం మరియు అధిక లేదా తక్కువ వర్షపాతానికి ఆకస్మిక ప్రణాళికలను కలిగి ఉండండి.'
    },
    keywords: ['monsoon', 'preparation', 'farming', 'drainage', 'seeds'],
    tags: ['monsoon', 'preparation', 'planning'],
    confidence: 0.9
  },
  {
    category: 'market',
    subcategory: 'pricing',
    question: 'When is the best time to sell crops?',
    answer: {
      en: 'The best time to sell crops is when market demand is high and supply is low. Monitor market trends, avoid selling immediately after harvest when prices are typically low, and consider storage if you have proper facilities.',
      hi: 'फसल बेचने का सबसे अच्छा समय तब होता है जब बाजार की मांग अधिक हो और आपूर्ति कम हो। बाजार के रुझान पर नजर रखें, कटाई के तुरंत बाद बेचने से बचें जब कीमतें आमतौर पर कम होती हैं, और यदि आपके पास उचित सुविधाएं हैं तो भंडारण पर विचार करें।',
      te: 'మార్కెట్ డిమాండ్ ఎక్కువగా ఉన్నప్పుడు మరియు సరఫరా తక్కువగా ఉన్నప్పుడు పంటలను అమ్మడానికి ఉత్తమ సమయం. మార్కెట్ ట్రెండ్‌లను పర్యవేక్షించండి, కోత తర్వాత వెంటనే అమ్మకం మానుకోండి ఎందుకంటే ధరలు సాధారణంగా తక్కువగా ఉంటాయి, మరియు మీకు సరైన సౌకర్యాలు ఉంటే నిల్వను పరిగణించండి.'
    },
    keywords: ['sell', 'crops', 'market', 'timing', 'price'],
    tags: ['market', 'selling', 'timing'],
    confidence: 0.8
  },
  {
    category: 'schemes',
    subcategory: 'government',
    question: 'What is PM-KISAN scheme?',
    answer: {
      en: 'PM-KISAN is a government scheme providing ₹6,000 per year to eligible farmers in three installments of ₹2,000 each. It aims to provide income support to small and marginal farmers. Apply online through the official PM-KISAN portal.',
      hi: 'पीएम-किसान एक सरकारी योजना है जो पात्र किसानों को प्रति वर्ष ₹6,000 तीन किस्तों में ₹2,000 प्रत्येक प्रदान करती है। इसका उद्देश्य छोटे और सीमांत किसानों को आय सहायता प्रदान करना है। आधिकारिक पीएम-किसान पोर्टल के माध्यम से ऑनलाइन आवेदन करें।',
      te: 'PM-KISAN అనేది అర్హులైన రైతులకు సంవత్సరానికి ₹6,000 మూడు వాయిదాలలో ₹2,000 చొప్పున అందించే ప్రభుత్వ పథకం. ఇది చిన్న మరియు సరిహద్దు రైతులకు ఆదాయ మద్దతు అందించడం లక్ష్యంగా పెట్టుకుంది. అధికారిక PM-KISAN పోర్టల్ ద్వారా ఆన్‌లైన్‌లో దరఖాస్తు చేసుకోండి.'
    },
    keywords: ['PM-KISAN', 'scheme', 'government', 'farmers', 'income'],
    tags: ['scheme', 'government', 'support'],
    confidence: 0.95
  },
  {
    category: 'general',
    subcategory: 'soil',
    question: 'How to test soil health?',
    answer: {
      en: 'Test soil health by checking pH, organic matter, nutrients (NPK), and microbial activity. You can use soil testing kits, visit agricultural extension centers, or send samples to laboratories. Test soil every 2-3 years.',
      hi: 'पीएच, जैविक पदार्थ, पोषक तत्वों (एनपीके), और माइक्रोबियल गतिविधि की जांच करके मिट्टी के स्वास्थ्य का परीक्षण करें। आप मिट्टी परीक्षण किट का उपयोग कर सकते हैं, कृषि विस्तार केंद्रों में जा सकते हैं, या प्रयोगशालाओं में नमूने भेज सकते हैं। हर 2-3 साल में मिट्टी का परीक्षण करें।',
      te: 'pH, సేంద్రీయ పదార్థం, పోషకాలు (NPK), మరియు సూక్ష్మజీవుల కార్యకలాపాలను తనిఖీ చేయడం ద్వారా మట్టి ఆరోగ్యాన్ని పరీక్షించండి. మీరు మట్టి పరీక్ష కిట్‌లను ఉపయోగించవచ్చు, వ్యవసాయ విస్తరణ కేంద్రాలను సందర్శించవచ్చు లేదా ప్రయోగశాలలకు నమూనాలను పంపవచ్చు. ప్రతి 2-3 సంవత్సరాలకు మట్టిని పరీక్షించండి.'
    },
    keywords: ['soil', 'test', 'health', 'pH', 'nutrients'],
    tags: ['soil', 'testing', 'health'],
    confidence: 0.85
  }
];

async function seedKnowledgeBase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan-mitra', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    await AIKnowledgeBase.deleteMany({});
    console.log('Cleared existing knowledge base');

    const insertedData = await AIKnowledgeBase.insertMany(knowledgeData);
    console.log(`✅ Inserted ${insertedData.length} knowledge base entries`);

    insertedData.forEach(entry => {
      console.log(`- ${entry.category}: ${entry.question}`);
    });

    console.log('\n🧠 Knowledge base seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding knowledge base:', error);
    process.exit(1);
  }
}

seedKnowledgeBase();