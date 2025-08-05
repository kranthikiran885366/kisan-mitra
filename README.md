# 🌾 Krishi Mitra - AI-Powered Multilingual Farming Advisor

A comprehensive full-stack farming advisor application built with Next.js, providing real-time weather updates, market rates, government scheme alerts, smart crop suggestions, and multilingual voice assistance.

## 🚀 Features

### 🌐 Multilingual Support
- **English**, **Hindi (हिंदी)**, and **Telugu (తెలుగు)** language support
- Voice text-to-speech in all supported languages
- Culturally appropriate UI for different regions

### 🌤️ Weather Integration
- Real-time weather data and forecasts
- Agricultural weather alerts
- Humidity, wind speed, and rainfall tracking
- 5-day weather forecast

### 📈 Market Intelligence
- Live mandi (market) price updates
- Price trend analysis with interactive charts
- Crop price comparisons
- Market alerts and notifications

### 🌱 Smart Crop Recommendations
- AI-powered crop suggestions based on:
  - Current weather conditions
  - Soil type and quality
  - Market demand and prices
  - Seasonal patterns
- Personalized farming calendar

### 🏛️ Government Schemes
- Latest government scheme updates
- Eligibility checker
- Application deadlines and requirements
- Direct links to official portals

### 🎤 Voice Assistant
- Voice-based navigation and information
- Text-to-speech in multiple languages
- Hands-free operation for field use
- Audio alerts and notifications

### 📱 Progressive Web App (PWA)
- Offline functionality
- Mobile-first responsive design
- App-like experience on mobile devices
- Push notifications support

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Interactive data visualization
- **Lucide React** - Beautiful icons

### Backend APIs
- **Next.js API Routes** - Serverless functions
- **RESTful API design** - Clean and scalable
- **Mock data integration** - Ready for real API connections

### Features
- **Web Speech API** - Voice synthesis and recognition
- **Local Storage** - Client-side data persistence
- **Responsive Design** - Mobile and desktop optimized
- **PWA Support** - Installable web application

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/krishi-mitra.git
   cd krishi-mitra
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables (Optional)

Create a \`.env.local\` file for production APIs:

\`\`\`env
# Weather API
OPENWEATHER_API_KEY=your_openweather_api_key

# Market Data API  
AGMARKNET_API_KEY=your_agmarknet_api_key

# Database (if using real database)
DATABASE_URL=your_database_connection_string
\`\`\`

## 📱 Usage

### 1. **Sign Up / Login**
- Create account with phone number or email
- Provide farm details (location, size, primary crops)
- Choose preferred language

### 2. **Dashboard Overview**
- View weather conditions at a glance
- Check latest market prices
- See personalized crop recommendations
- Access government schemes

### 3. **Weather Section**
- Current weather conditions
- 5-day forecast
- Agricultural weather alerts
- Humidity and rainfall data

### 4. **Market Prices**
- Real-time mandi rates
- Price trend charts
- Crop-wise price comparison
- Market alerts

### 5. **Crop Advisor**
- Season-based crop recommendations
- Soil-specific suggestions
- Market demand analysis
- Farming calendar

### 6. **Government Schemes**
- Browse available schemes
- Check eligibility criteria
- Application deadlines
- Direct application links

### 7. **Voice Assistant**
- Click microphone icon for voice commands
- Listen to weather updates
- Get market price announcements
- Voice-guided navigation

## 🏗️ Project Structure

\`\`\`
krishi-mitra/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── weather/              # Weather data API
│   │   ├── market/               # Market prices API
│   │   ├── crops/                # Crop recommendations API
│   │   └── schemes/              # Government schemes API
│   ├── auth/                     # Authentication pages
│   │   ├── login/                # Login page
│   │   └── signup/               # Registration page
│   ├── dashboard/                # Main dashboard
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # Reusable components
│   └── ui/                       # UI components (shadcn/ui)
├── public/                       # Static assets
│   ├── manifest.json             # PWA manifest
│   └── icons/                    # App icons
├── package.json                  # Dependencies
├── tailwind.config.js            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project documentation
\`\`\`

## 🔧 API Endpoints

### Authentication
- \`POST /api/auth/login\` - User login
- \`POST /api/auth/signup\` - User registration

### Weather
- \`GET /api/weather\` - Current weather data
- \`POST /api/weather\` - Weather by coordinates

### Market Data
- \`GET /api/market\` - Market prices
- \`GET /api/market?crop=rice\` - Crop-specific prices

### Crop Recommendations
- \`GET /api/crops\` - Crop suggestions
- \`POST /api/crops\` - Personalized recommendations

### Government Schemes
- \`GET /api/schemes\` - Available schemes
- \`GET /api/schemes?category=financial\` - Category-wise schemes

## 🌟 Key Features Explained

### Multilingual Support
The application supports three languages with complete translations:
- **English** - Default language
- **Hindi (हिंदी)** - For Hindi-speaking farmers
- **Telugu (తెలుగు)** - For Telugu-speaking farmers

### Voice Assistant
- Uses Web Speech API for text-to-speech
- Supports all three languages
- Provides audio feedback for weather, prices, and navigation
- Hands-free operation suitable for field use

### Progressive Web App
- Installable on mobile devices
- Offline functionality for cached data
- Push notifications for important alerts
- App-like experience with native feel

### Responsive Design
- Mobile-first approach
- Optimized for various screen sizes
- Touch-friendly interface
- High contrast for outdoor visibility

## 🔮 Future Enhancements

### Phase 2 Features
- [ ] Real-time chat support
- [ ] Crop disease detection using AI
- [ ] Soil testing integration
- [ ] Drone imagery analysis
- [ ] IoT sensor integration

### Phase 3 Features
- [ ] Marketplace for direct selling
- [ ] Farmer community forums
- [ ] Expert consultation booking
- [ ] Financial planning tools
- [ ] Insurance claim assistance

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenWeatherMap** - Weather data API
- **Agmarknet** - Market price data
- **Government of India** - Scheme information
- **shadcn/ui** - Beautiful UI components
- **Vercel** - Deployment platform

## 📞 Support

For support and queries:
- 📧 Email: support@krishimitra.com
- 📱 Phone: +91-XXXX-XXXX-XX
- 🌐 Website: [www.krishimitra.com](https://krishimitra.com)

---

**Made with ❤️ for Indian Farmers**

*Empowering agriculture through technology*
\`\`\`
