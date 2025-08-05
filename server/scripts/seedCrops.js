const mongoose = require('mongoose');
const CropRecommendation = require('../models/CropRecommendation');
require('dotenv').config();

const sampleCrops = [
  {
    cropName: "Rice",
    localNames: {
      en: "Rice",
      hi: "चावल",
      te: "వరి"
    },
    category: "cereal",
    season: "kharif",
    duration: 120,
    suitableSoils: ["clay", "loamy", "alluvial"],
    climateRequirements: {
      temperature: { min: 20, max: 35, optimal: 25 },
      rainfall: { min: 1000, max: 2000, optimal: 1500 },
      humidity: { min: 70, max: 90 }
    },
    sowingTime: { start: "June", end: "July", optimal: "Mid-June" },
    harvestTime: { start: "October", end: "November" },
    spacing: { rowToRow: 20, plantToPlant: 15 },
    seedRate: { value: 25, unit: "kg/hectare" },
    expectedYield: { min: 40, max: 80, average: 60 },
    marketPrice: { min: 1800, max: 2500, average: 2000 },
    profitability: "high",
    investmentRequired: {
      seeds: 2500,
      fertilizers: 8000,
      pesticides: 3000,
      labor: 15000,
      irrigation: 5000,
      total: 33500
    },
    fertilizers: [
      { name: "Urea", quantity: "100 kg/ha", timing: "Basal + Top dressing", method: "Broadcasting" },
      { name: "DAP", quantity: "50 kg/ha", timing: "Basal", method: "Broadcasting" },
      { name: "Potash", quantity: "25 kg/ha", timing: "Basal", method: "Broadcasting" }
    ],
    irrigation: {
      frequency: "Continuous flooding",
      method: "Flood irrigation",
      criticalStages: ["Tillering", "Panicle initiation", "Grain filling"]
    },
    pestManagement: [
      {
        pest: "Brown Plant Hopper",
        symptoms: ["Yellowing of leaves", "Stunted growth", "Honeydew secretion"],
        organicTreatment: ["Neem oil spray", "Light traps", "Biological control"],
        chemicalTreatment: ["Imidacloprid", "Thiamethoxam"],
        preventiveMeasures: ["Resistant varieties", "Proper spacing", "Avoid excess nitrogen"]
      }
    ],
    diseaseManagement: [
      {
        disease: "Blast",
        symptoms: ["Leaf spots", "Neck rot", "Panicle blast"],
        organicTreatment: ["Trichoderma", "Pseudomonas", "Neem extract"],
        chemicalTreatment: ["Tricyclazole", "Carbendazim"],
        preventiveMeasures: ["Resistant varieties", "Balanced fertilization", "Proper drainage"]
      }
    ],
    suitableStates: ["West Bengal", "Punjab", "Haryana", "Uttar Pradesh", "Andhra Pradesh"],
    majorProducingDistricts: ["Thanjavur", "Krishna", "Guntur", "Ludhiana"],
    marketDemand: "very-high",
    waterRequirement: "very-high",
    soilHealthImpact: "neutral",
    carbonFootprint: "high",
    adaptabilityScore: 85,
    riskFactor: "medium",
    isActive: true
  },
  {
    cropName: "Wheat",
    localNames: {
      en: "Wheat",
      hi: "गेहूं",
      te: "గోధుమ"
    },
    category: "cereal",
    season: "rabi",
    duration: 120,
    suitableSoils: ["loamy", "clay", "alluvial"],
    climateRequirements: {
      temperature: { min: 10, max: 25, optimal: 20 },
      rainfall: { min: 300, max: 800, optimal: 500 },
      humidity: { min: 50, max: 70 }
    },
    sowingTime: { start: "November", end: "December", optimal: "Mid-November" },
    harvestTime: { start: "March", end: "April" },
    spacing: { rowToRow: 20, plantToPlant: 5 },
    seedRate: { value: 100, unit: "kg/hectare" },
    expectedYield: { min: 35, max: 70, average: 50 },
    marketPrice: { min: 2000, max: 2800, average: 2300 },
    profitability: "high",
    investmentRequired: {
      seeds: 5000,
      fertilizers: 10000,
      pesticides: 2500,
      labor: 12000,
      irrigation: 4000,
      total: 33500
    },
    fertilizers: [
      { name: "Urea", quantity: "120 kg/ha", timing: "Split application", method: "Broadcasting" },
      { name: "DAP", quantity: "60 kg/ha", timing: "Basal", method: "Drilling" },
      { name: "MOP", quantity: "30 kg/ha", timing: "Basal", method: "Broadcasting" }
    ],
    irrigation: {
      frequency: "4-6 irrigations",
      method: "Furrow irrigation",
      criticalStages: ["Crown root initiation", "Tillering", "Flowering", "Grain filling"]
    },
    pestManagement: [
      {
        pest: "Aphids",
        symptoms: ["Curling of leaves", "Yellowing", "Honeydew secretion"],
        organicTreatment: ["Neem oil", "Soap solution", "Ladybird beetles"],
        chemicalTreatment: ["Dimethoate", "Malathion"],
        preventiveMeasures: ["Early sowing", "Balanced fertilization", "Monitoring"]
      }
    ],
    diseaseManagement: [
      {
        disease: "Rust",
        symptoms: ["Orange pustules", "Yellowing", "Premature drying"],
        organicTreatment: ["Copper fungicides", "Trichoderma"],
        chemicalTreatment: ["Propiconazole", "Tebuconazole"],
        preventiveMeasures: ["Resistant varieties", "Crop rotation", "Timely sowing"]
      }
    ],
    suitableStates: ["Punjab", "Haryana", "Uttar Pradesh", "Madhya Pradesh", "Rajasthan"],
    majorProducingDistricts: ["Ludhiana", "Karnal", "Meerut", "Indore"],
    marketDemand: "very-high",
    waterRequirement: "medium",
    soilHealthImpact: "neutral",
    carbonFootprint: "medium",
    adaptabilityScore: 90,
    riskFactor: "low",
    isActive: true
  },
  {
    cropName: "Cotton",
    localNames: {
      en: "Cotton",
      hi: "कपास",
      te: "పత్తి"
    },
    category: "cash-crop",
    season: "kharif",
    duration: 180,
    suitableSoils: ["black", "alluvial", "red"],
    climateRequirements: {
      temperature: { min: 21, max: 35, optimal: 28 },
      rainfall: { min: 500, max: 1200, optimal: 800 },
      humidity: { min: 60, max: 80 }
    },
    sowingTime: { start: "May", end: "June", optimal: "Mid-May" },
    harvestTime: { start: "October", end: "December" },
    spacing: { rowToRow: 45, plantToPlant: 15 },
    seedRate: { value: 12, unit: "kg/hectare" },
    expectedYield: { min: 15, max: 35, average: 25 },
    marketPrice: { min: 5000, max: 7000, average: 6000 },
    profitability: "very-high",
    investmentRequired: {
      seeds: 3000,
      fertilizers: 12000,
      pesticides: 8000,
      labor: 20000,
      irrigation: 6000,
      total: 49000
    },
    fertilizers: [
      { name: "Urea", quantity: "150 kg/ha", timing: "Split doses", method: "Side dressing" },
      { name: "SSP", quantity: "100 kg/ha", timing: "Basal", method: "Broadcasting" },
      { name: "MOP", quantity: "50 kg/ha", timing: "Basal", method: "Broadcasting" }
    ],
    irrigation: {
      frequency: "8-10 irrigations",
      method: "Drip irrigation",
      criticalStages: ["Squaring", "Flowering", "Boll development"]
    },
    pestManagement: [
      {
        pest: "Bollworm",
        symptoms: ["Holes in bolls", "Damaged squares", "Frass"],
        organicTreatment: ["Bt spray", "NPV", "Pheromone traps"],
        chemicalTreatment: ["Chlorpyrifos", "Quinalphos"],
        preventiveMeasures: ["Bt cotton varieties", "Crop rotation", "Monitoring"]
      }
    ],
    diseaseManagement: [
      {
        disease: "Wilt",
        symptoms: ["Yellowing", "Wilting", "Vascular browning"],
        organicTreatment: ["Trichoderma", "Pseudomonas", "Organic amendments"],
        chemicalTreatment: ["Carbendazim", "Thiophanate methyl"],
        preventiveMeasures: ["Resistant varieties", "Soil solarization", "Crop rotation"]
      }
    ],
    suitableStates: ["Gujarat", "Maharashtra", "Andhra Pradesh", "Karnataka", "Punjab"],
    majorProducingDistricts: ["Guntur", "Kurnool", "Nagpur", "Ahmedabad"],
    marketDemand: "high",
    waterRequirement: "high",
    soilHealthImpact: "negative",
    carbonFootprint: "high",
    adaptabilityScore: 75,
    riskFactor: "high",
    isActive: true
  },
  {
    cropName: "Tomato",
    localNames: {
      en: "Tomato",
      hi: "टमाटर",
      te: "టమాట"
    },
    category: "vegetable",
    season: "rabi",
    duration: 90,
    suitableSoils: ["loamy", "sandy", "red"],
    climateRequirements: {
      temperature: { min: 18, max: 30, optimal: 24 },
      rainfall: { min: 400, max: 800, optimal: 600 },
      humidity: { min: 60, max: 80 }
    },
    sowingTime: { start: "October", end: "November", optimal: "Mid-October" },
    harvestTime: { start: "January", end: "March" },
    spacing: { rowToRow: 60, plantToPlant: 45 },
    seedRate: { value: 0.5, unit: "kg/hectare" },
    expectedYield: { min: 300, max: 600, average: 450 },
    marketPrice: { min: 800, max: 2000, average: 1200 },
    profitability: "very-high",
    investmentRequired: {
      seeds: 2000,
      fertilizers: 15000,
      pesticides: 10000,
      labor: 25000,
      irrigation: 8000,
      total: 60000
    },
    fertilizers: [
      { name: "FYM", quantity: "25 t/ha", timing: "Basal", method: "Broadcasting" },
      { name: "NPK", quantity: "200:100:100 kg/ha", timing: "Split application", method: "Side dressing" }
    ],
    irrigation: {
      frequency: "Alternate days",
      method: "Drip irrigation",
      criticalStages: ["Transplanting", "Flowering", "Fruit development"]
    },
    pestManagement: [
      {
        pest: "Whitefly",
        symptoms: ["Yellowing", "Sooty mold", "Virus transmission"],
        organicTreatment: ["Yellow sticky traps", "Neem oil", "Reflective mulch"],
        chemicalTreatment: ["Imidacloprid", "Thiamethoxam"],
        preventiveMeasures: ["Resistant varieties", "Crop rotation", "Weed control"]
      }
    ],
    diseaseManagement: [
      {
        disease: "Late Blight",
        symptoms: ["Dark lesions", "White growth", "Fruit rot"],
        organicTreatment: ["Copper fungicides", "Bordeaux mixture"],
        chemicalTreatment: ["Mancozeb", "Metalaxyl"],
        preventiveMeasures: ["Resistant varieties", "Proper spacing", "Avoid overhead irrigation"]
      }
    ],
    suitableStates: ["Karnataka", "Andhra Pradesh", "Maharashtra", "Gujarat", "Himachal Pradesh"],
    majorProducingDistricts: ["Kolar", "Chittoor", "Nashik", "Pune"],
    marketDemand: "very-high",
    waterRequirement: "high",
    soilHealthImpact: "positive",
    carbonFootprint: "medium",
    adaptabilityScore: 80,
    riskFactor: "medium",
    isActive: true
  },
  {
    cropName: "Sugarcane",
    localNames: {
      en: "Sugarcane",
      hi: "गन्ना",
      te: "చెరకు"
    },
    category: "cash-crop",
    season: "perennial",
    duration: 365,
    suitableSoils: ["loamy", "clay", "alluvial"],
    climateRequirements: {
      temperature: { min: 20, max: 35, optimal: 28 },
      rainfall: { min: 1000, max: 2000, optimal: 1500 },
      humidity: { min: 70, max: 85 }
    },
    sowingTime: { start: "February", end: "March", optimal: "Mid-February" },
    harvestTime: { start: "December", end: "March" },
    spacing: { rowToRow: 90, plantToPlant: 30 },
    seedRate: { value: 40000, unit: "setts/hectare" },
    expectedYield: { min: 600, max: 1200, average: 900 },
    marketPrice: { min: 280, max: 350, average: 315 },
    profitability: "high",
    investmentRequired: {
      seeds: 15000,
      fertilizers: 20000,
      pesticides: 5000,
      labor: 30000,
      irrigation: 10000,
      total: 80000
    },
    fertilizers: [
      { name: "Urea", quantity: "300 kg/ha", timing: "Split doses", method: "Side dressing" },
      { name: "SSP", quantity: "200 kg/ha", timing: "Basal", method: "Broadcasting" },
      { name: "MOP", quantity: "100 kg/ha", timing: "Split doses", method: "Side dressing" }
    ],
    irrigation: {
      frequency: "Weekly",
      method: "Furrow irrigation",
      criticalStages: ["Germination", "Tillering", "Grand growth", "Maturity"]
    },
    pestManagement: [
      {
        pest: "Early Shoot Borer",
        symptoms: ["Dead hearts", "Bore holes", "Stunted growth"],
        organicTreatment: ["Trichogramma", "Light traps", "Pheromone traps"],
        chemicalTreatment: ["Chlorpyrifos", "Carbofuran"],
        preventiveMeasures: ["Resistant varieties", "Proper planting", "Field sanitation"]
      }
    ],
    diseaseManagement: [
      {
        disease: "Red Rot",
        symptoms: ["Reddening of internodes", "Alcoholic smell", "Hollow stems"],
        organicTreatment: ["Hot water treatment", "Trichoderma", "Resistant varieties"],
        chemicalTreatment: ["Carbendazim", "Propiconazole"],
        preventiveMeasures: ["Disease-free setts", "Crop rotation", "Field sanitation"]
      }
    ],
    suitableStates: ["Uttar Pradesh", "Maharashtra", "Karnataka", "Tamil Nadu", "Gujarat"],
    majorProducingDistricts: ["Muzaffarnagar", "Kolhapur", "Mandya", "Coimbatore"],
    marketDemand: "high",
    waterRequirement: "very-high",
    soilHealthImpact: "positive",
    carbonFootprint: "medium",
    adaptabilityScore: 85,
    riskFactor: "medium",
    isActive: true
  }
];

async function seedCrops() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan-mitra', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing crops
    await CropRecommendation.deleteMany({});
    console.log('Cleared existing crop data');

    // Insert sample crops
    const insertedCrops = await CropRecommendation.insertMany(sampleCrops);
    console.log(`✅ Inserted ${insertedCrops.length} crop recommendations`);

    // Display inserted crops
    insertedCrops.forEach(crop => {
      console.log(`- ${crop.cropName} (${crop.category}, ${crop.season})`);
    });

    console.log('\n🌾 Crop seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding crops:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedCrops();