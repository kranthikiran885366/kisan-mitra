const mongoose = require('mongoose');
const MarketPrice = require('../models/MarketPrice');
const marketService = require('../services/marketService');
require('dotenv').config();

async function seedMarketData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan-mitra', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🏪 Seeding Market Data...\n');

    // Clear existing data
    await MarketPrice.deleteMany({});
    console.log('✅ Cleared existing market data');

    // Generate market data for the last 30 days
    const crops = [
      { name: 'Rice', varieties: ['Basmati', 'IR-64', 'Sona Masuri'], basePrice: 2500 },
      { name: 'Wheat', varieties: ['Durum', 'Sharbati', 'Lokwan'], basePrice: 2200 },
      { name: 'Cotton', varieties: ['Medium Staple', 'Long Staple'], basePrice: 5800 },
      { name: 'Sugarcane', varieties: ['Co-86032', 'Co-0238'], basePrice: 350 },
      { name: 'Maize', varieties: ['Hybrid', 'Composite'], basePrice: 1800 },
      { name: 'Turmeric', varieties: ['Salem', 'Erode'], basePrice: 8000 },
      { name: 'Chilli', varieties: ['Teja', 'Sannam'], basePrice: 12000 },
      { name: 'Onion', varieties: ['Red', 'White'], basePrice: 2000 }
    ];

    const markets = [
      { name: 'Guntur Market', district: 'Guntur', state: 'Andhra Pradesh' },
      { name: 'Krishna Market', district: 'Krishna', state: 'Andhra Pradesh' },
      { name: 'Ludhiana Mandi', district: 'Ludhiana', state: 'Punjab' },
      { name: 'Karnal Market', district: 'Karnal', state: 'Haryana' },
      { name: 'Nashik Market', district: 'Nashik', state: 'Maharashtra' },
      { name: 'Indore Mandi', district: 'Indore', state: 'Madhya Pradesh' },
      { name: 'Coimbatore Market', district: 'Coimbatore', state: 'Tamil Nadu' },
      { name: 'Bangalore Market', district: 'Bangalore', state: 'Karnataka' }
    ];

    const marketData = [];
    const today = new Date();

    // Generate data for last 30 days
    for (let day = 30; day >= 0; day--) {
      const date = new Date(today);
      date.setDate(date.getDate() - day);

      for (const crop of crops) {
        for (const variety of crop.varieties) {
          for (const market of markets) {
            // Create realistic price variations with trends
            const dayTrend = Math.sin(day * 0.1) * 0.1; // Seasonal trend
            const randomVariation = (Math.random() - 0.5) * 0.2; // Random variation
            const totalVariation = dayTrend + randomVariation;
            
            const modalPrice = Math.round(crop.basePrice * (1 + totalVariation));
            const minPrice = Math.round(modalPrice * (0.95 + Math.random() * 0.03));
            const maxPrice = Math.round(modalPrice * (1.02 + Math.random() * 0.03));
            const avgPrice = Math.round((minPrice + maxPrice) / 2);

            // Calculate trend from previous day
            let trendDirection = 'stable';
            let trendPercentage = 0;
            
            if (day < 30) {
              const prevPrice = crop.basePrice * (1 + Math.sin((day + 1) * 0.1) * 0.1 + (Math.random() - 0.5) * 0.2);
              const change = ((modalPrice - prevPrice) / prevPrice) * 100;
              trendPercentage = Math.abs(change);
              
              if (change > 2) trendDirection = 'up';
              else if (change < -2) trendDirection = 'down';
            }

            const priceData = {
              cropName: crop.name,
              variety: variety,
              market: market,
              prices: {
                minimum: minPrice,
                maximum: maxPrice,
                modal: modalPrice,
                average: avgPrice
              },
              date: date,
              arrivals: Math.floor(Math.random() * 200) + 50,
              trend: {
                direction: trendDirection,
                percentage: trendPercentage.toFixed(2)
              },
              quality: ['poor', 'average', 'good', 'excellent'][Math.floor(Math.random() * 4)],
              source: 'seeded',
              isVerified: true,
              metadata: {
                temperature: Math.floor(Math.random() * 15) + 20,
                humidity: Math.floor(Math.random() * 30) + 50,
                weatherCondition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
                festivalSeason: Math.random() > 0.8,
                harvestSeason: (date.getMonth() >= 9 && date.getMonth() <= 11)
              }
            };

            marketData.push(priceData);
          }
        }
      }
    }

    // Batch insert data
    console.log(`📊 Inserting ${marketData.length} market price records...`);
    
    const batchSize = 1000;
    for (let i = 0; i < marketData.length; i += batchSize) {
      const batch = marketData.slice(i, i + batchSize);
      await MarketPrice.insertMany(batch);
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(marketData.length / batchSize)}`);
    }

    console.log(`\n🎉 Successfully seeded ${marketData.length} market price records!`);

    // Display summary
    const summary = await MarketPrice.aggregate([
      {
        $group: {
          _id: '$cropName',
          count: { $sum: 1 },
          avgPrice: { $avg: '$prices.modal' },
          markets: { $addToSet: '$market.name' }
        }
      },
      {
        $project: {
          crop: '$_id',
          records: '$count',
          avgPrice: { $round: ['$avgPrice', 0] },
          marketCount: { $size: '$markets' }
        }
      },
      {
        $sort: { avgPrice: -1 }
      }
    ]);

    console.log('\n📈 Market Data Summary:');
    console.log('Crop\t\tRecords\tAvg Price\tMarkets');
    console.log('─'.repeat(50));
    summary.forEach(item => {
      console.log(`${item.crop.padEnd(12)}\t${item.records}\t₹${item.avgPrice}\t\t${item.marketCount}`);
    });

    console.log('\n🏪 Market seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding market data:', error);
    process.exit(1);
  }
}

seedMarketData();