"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter,
  RefreshCw,
  MapPin,
  AlertTriangle,
  BarChart3,
  Calendar,
  ArrowLeft
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useRouter } from "next/navigation"
import { marketApi, MarketPrice, MarketAnalysis, NearbyMarket, PriceAlert } from "@/lib/marketApi"

const translations = {
  en: {
    title: "Market Rates",
    searchPlaceholder: "Search crops...",
    location: "Location",
    commodity: "Commodity",
    market: "Market",
    price: "Price (₹/Quintal)",
    change: "Change",
    lastUpdated: "Last Updated",
    viewDetails: "View Details",
    filterBy: "Filter by",
    sortBy: "Sort by",
    backToDashboard: "Back to Dashboard",
    loading: "Loading...",
    error: "Error loading data",
    retry: "Retry",
    refresh: "Refresh",
    priceAnalysis: "Price Analysis",
    marketTrends: "Market Trends",
    nearbyMarkets: "Nearby Markets",
    alerts: "Price Alerts",
    forecast: "Price Forecast",
    statistics: "Market Statistics",
    topGainers: "Top Gainers",
    topLosers: "Top Losers",
    marketInsights: "Market Insights",
    recommendations: "Recommendations",
    arrivals: "Arrivals",
    quality: "Quality",
    volatility: "Volatility",
    trend: "Trend",
    distance: "Distance",
    crops: "Crops",
    avgPrice: "Avg Price",
    high: "High",
    medium: "Medium",
    low: "Low",
    stable: "Stable",
    increasing: "Increasing",
    decreasing: "Decreasing",
    days: "days",
    km: "km",
    quintal: "quintal",
  },
  hi: {
    title: "बाजार दरें",
    searchPlaceholder: "फसलें खोजें...",
    location: "स्थान",
    commodity: "वस्तु",
    market: "बाजार",
    price: "मूल्य (₹/क्विंटल)",
    change: "परिवर्तन",
    lastUpdated: "अंतिम अपडेट",
    viewDetails: "विवरण देखें",
    filterBy: "फिल्टर करें",
    sortBy: "क्रमबद्ध करें",
    backToDashboard: "डैशबोर्ड पर वापस",
    loading: "लोड हो रहा है...",
    error: "डेटा लोड करने में त्रुटि",
    retry: "पुनः प्रयास करें",
    refresh: "रिफ्रेश करें",
    priceAnalysis: "मूल्य विश्लेषण",
    marketTrends: "बाजार रुझान",
    nearbyMarkets: "नजदीकी बाजार",
    alerts: "मूल्य अलर्ट",
    forecast: "मूल्य पूर्वानुमान",
    statistics: "बाजार आंकड़े",
    topGainers: "शीर्ष लाभार्थी",
    topLosers: "शीर्ष हानि",
    marketInsights: "बाजार अंतर्दृष्टि",
    recommendations: "सिफारिशें",
    arrivals: "आगमन",
    quality: "गुणवत्ता",
    volatility: "अस्थिरता",
    trend: "रुझान",
    distance: "दूरी",
    crops: "फसलें",
    avgPrice: "औसत मूल्य",
    high: "उच्च",
    medium: "मध्यम",
    low: "कम",
    stable: "स्थिर",
    increasing: "बढ़ रहा",
    decreasing: "घट रहा",
    days: "दिन",
    km: "किमी",
    quintal: "क्विंटल",
  },
  te: {
    title: "మార్కెట్ రేట్లు",
    searchPlaceholder: "పంటలను వెతకండి...",
    location: "స్థానం",
    commodity: "వస్తువు",
    market: "మార్కెట్",
    price: "ధర (₹/క్వింటల్)",
    change: "మార్పు",
    lastUpdated: "చివరిగా అప్‌డేట్ చేయబడింది",
    viewDetails: "వివరాలు చూడండి",
    filterBy: "ఫిల్టర్ చేయండి",
    sortBy: "క్రమబద్ధీకరించండి",
    backToDashboard: "డాష్‌బోర్డ్‌కు తిరిగి",
    loading: "లోడ్ అవుతోంది...",
    error: "డేటా లోడ్ చేయడంలో లోపం",
    retry: "మళ్లీ ప్రయత్నించండి",
    refresh: "రిఫ్రెష్ చేయండి",
    priceAnalysis: "ధర విశ్లేషణ",
    marketTrends: "మార్కెట్ ట్రెండ్స్",
    nearbyMarkets: "సమీప మార్కెట్లు",
    alerts: "ధర అలర్ట్లు",
    forecast: "ధర అంచనా",
    statistics: "మార్కెట్ గణాంకాలు",
    topGainers: "టాప్ గైనర్స్",
    topLosers: "టాప్ లూజర్స్",
    marketInsights: "మార్కెట్ అంతర్దృష్టులు",
    recommendations: "సిఫార్సులు",
    arrivals: "రాకలు",
    quality: "నాణ్యత",
    volatility: "అస్థిరత",
    trend: "ట్రెండ్",
    distance: "దూరం",
    crops: "పంటలు",
    avgPrice: "సగటు ధర",
    high: "అధిక",
    medium: "మధ్యమ",
    low: "తక్కువ",
    stable: "స్థిరమైన",
    increasing: "పెరుగుతున్న",
    decreasing: "తగ్గుతున్న",
    days: "రోజులు",
    km: "కిమీ",
    quintal: "క్వింటల్",
  },
}

export default function MarketPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<'en' | 'hi' | 'te'>('en')
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [activeTab, setActiveTab] = useState("prices")
  
  // Data states
  const [prices, setPrices] = useState<MarketPrice[]>([])
  const [trends, setTrends] = useState<any>({})
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null)
  const [nearbyMarkets, setNearbyMarkets] = useState<NearbyMarket[]>([])
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const t = translations[language]

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'hi' | 'te'
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    loadMarketData()
  }, [])

  const loadMarketData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [pricesRes, trendsRes, analysisRes, marketsRes, alertsRes, statsRes] = await Promise.all([
        marketApi.getPrices({ limit: 50, sortBy }),
        marketApi.getTrends({ days: 30 }),
        marketApi.getAnalysis(),
        marketApi.getNearbyMarkets(100),
        marketApi.getAlerts(),
        marketApi.getStats()
      ])

      if (pricesRes.success) setPrices(pricesRes.data.prices || [])
      if (trendsRes.success) setTrends(trendsRes.data.trends || {})
      if (analysisRes.success) setAnalysis(analysisRes.data)
      if (marketsRes.success) setNearbyMarkets(marketsRes.data.markets || [])
      if (alertsRes.success) setAlerts(alertsRes.data || [])
      if (statsRes.success) setStats(statsRes.data)

      setLastUpdated(new Date())
    } catch (err: any) {
      console.error('Error loading market data:', err)
      setError(err.message || 'Failed to load market data')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    try {
      await marketApi.updatePrices()
      await loadMarketData()
    } catch (err) {
      console.error('Error refreshing data:', err)
    }
  }

  const filteredPrices = prices.filter(price => 
    price.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    price.variety.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <ArrowUpRight className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-600 bg-green-50'
      case 'down': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-500'
      case 'good': return 'bg-blue-500'
      case 'average': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t.loading}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={refreshData}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {t.refresh}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.backToDashboard}
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.totalCrops}</p>
                <p className="text-sm text-gray-600">{t.crops}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.totalMarkets}</p>
                <p className="text-sm text-gray-600">Markets</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">₹{stats.avgPrice}</p>
                <p className="text-sm text-gray-600">{t.avgPrice}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.totalArrivals}</p>
                <p className="text-sm text-gray-600">{t.arrivals}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t.sortBy} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="change">Change</SelectItem>
                <SelectItem value="arrivals">Arrivals</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            {t.lastUpdated}: {lastUpdated.toLocaleString()}
          </div>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="prices">{t.price}</TabsTrigger>
            <TabsTrigger value="trends">{t.marketTrends}</TabsTrigger>
            <TabsTrigger value="analysis">{t.priceAnalysis}</TabsTrigger>
            <TabsTrigger value="markets">{t.nearbyMarkets}</TabsTrigger>
            <TabsTrigger value="alerts">{t.alerts}</TabsTrigger>
          </TabsList>

          {/* Prices Tab */}
          <TabsContent value="prices">
            <div className="grid grid-cols-1 gap-4">
              {filteredPrices.map((price, index) => (
                <motion.div
                  key={price._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{price.cropName}</h3>
                            <Badge variant="outline">{price.variety}</Badge>
                            <Badge className={`${getQualityColor(price.quality)} text-white`}>
                              {price.quality}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <MapPin className="h-4 w-4 inline mr-1" />
                            {price.market.name}, {price.market.district}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Modal Price</p>
                              <p className="font-semibold">₹{price.prices.modal}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Range</p>
                              <p className="font-semibold">₹{price.prices.minimum} - ₹{price.prices.maximum}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">{t.arrivals}</p>
                              <p className="font-semibold">{price.arrivals} {t.quintal}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">{t.trend}</p>
                              <div className={`flex items-center gap-1 px-2 py-1 rounded ${getTrendColor(price.trend.direction)}`}>
                                {getTrendIcon(price.trend.direction)}
                                <span className="font-semibold">{price.trend.percentage}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {price.priceAnalysis && (
                          <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">{t.volatility}</div>
                            <div className="text-lg font-bold">{price.priceAnalysis.volatility}%</div>
                            <div className="text-xs text-gray-600 mt-2 max-w-32">
                              {price.priceAnalysis.recommendation}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(trends).map(([crop, data]: [string, any]) => (
                <Card key={crop}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      {crop} Price Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          formatter={(value) => [`₹${value}`, 'Price']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis">
            {analysis && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Gainers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <TrendingUp className="h-5 w-5" />
                      {t.topGainers}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.topGainers.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="font-semibold">{item._id}</p>
                            <p className="text-sm text-gray-600">₹{item.latestPrice}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-green-600 font-bold">+{item.changePercent?.toFixed(2)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Losers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <TrendingDown className="h-5 w-5" />
                      {t.topLosers}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.topLosers.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <p className="font-semibold">{item._id}</p>
                            <p className="text-sm text-gray-600">₹{item.latestPrice}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-red-600 font-bold">{item.changePercent?.toFixed(2)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Market Insights */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>{t.marketInsights}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-3">Insights</h4>
                        <div className="space-y-2">
                          {analysis.marketInsights.map((insight, index) => (
                            <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm">{insight}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">{t.recommendations}</h4>
                        <div className="space-y-2">
                          {analysis.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm">{rec.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Nearby Markets Tab */}
          <TabsContent value="markets">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyMarkets.map((market, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-500" />
                        {market.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t.location}:</span>
                        <span>{market.district}, {market.state}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t.distance}:</span>
                        <span>{market.distance} {t.km}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t.avgPrice}:</span>
                        <span className="font-semibold">₹{market.avgPrice}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">{t.crops}: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {market.crops.slice(0, 3).map((crop, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {crop}
                            </Badge>
                          ))}
                          {market.crops.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{market.crops.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No price alerts at the moment</p>
                  </CardContent>
                </Card>
              ) : (
                alerts.map((alert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`border-l-4 ${
                      alert.urgency === 'high' ? 'border-red-500' : 
                      alert.urgency === 'medium' ? 'border-yellow-500' : 'border-blue-500'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className={`h-4 w-4 ${
                                alert.urgency === 'high' ? 'text-red-500' : 
                                alert.urgency === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                              }`} />
                              <Badge variant={alert.urgency === 'high' ? 'destructive' : 'secondary'}>
                                {alert.urgency}
                              </Badge>
                              {alert.crop && <Badge variant="outline">{alert.crop}</Badge>}
                            </div>
                            <p className="font-semibold mb-1">{alert.message}</p>
                            {alert.recommendation && (
                              <p className="text-sm text-gray-600">{alert.recommendation}</p>
                            )}
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            {new Date(alert.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}