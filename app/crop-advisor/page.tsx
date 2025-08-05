"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Sprout, Droplets, Thermometer, Sun, Calendar, ArrowRight, Filter, TrendingUp, AlertTriangle, Star } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { cropApi, CropRecommendation, SeasonalCalendar, CropCategory } from "@/lib/cropApi"

const translations = {
  en: {
    title: "Crop Advisor",
    searchPlaceholder: "Search crops...",
    recommendedCrops: "Recommended Crops",
    seasonalCrops: "Seasonal Crops",
    farmingCalendar: "Farming Calendar",
    soilType: "Soil Type",
    climate: "Climate",
    waterRequirement: "Water Requirement",
    season: "Season",
    viewDetails: "View Details",
    backToDashboard: "Back to Dashboard",
    filterBy: "Filter by",
    allCrops: "All Crops",
    loading: "Loading...",
    error: "Error loading data",
    retry: "Retry",
    profitability: "Profitability",
    marketDemand: "Market Demand",
    riskLevel: "Risk Level",
    duration: "Duration",
    expectedYield: "Expected Yield",
    investment: "Investment Required",
    currentSeason: "Current Season",
    upcomingTasks: "Upcoming Tasks",
    seasonalTips: "Seasonal Tips",
    activities: "Activities",
    score: "Recommendation Score",
  },
  hi: {
    title: "फसल सलाहकार",
    searchPlaceholder: "फसल खोजें...",
    recommendedCrops: "सुझाई गई फसलें",
    seasonalCrops: "मौसमी फसलें",
    farmingCalendar: "खेती कैलेंडर",
    soilType: "मिट्टी का प्रकार",
    climate: "जलवायु",
    waterRequirement: "पानी की आवश्यकता",
    season: "मौसम",
    viewDetails: "विवरण देखें",
    backToDashboard: "डैशबोर्ड पर वापस",
    filterBy: "फिल्टर करें",
    allCrops: "सभी फसलें",
    loading: "लोड हो रहा है...",
    error: "डेटा लोड करने में त्रुटि",
    retry: "पुनः प्रयास करें",
    profitability: "लाभप्रदता",
    marketDemand: "बाजार मांग",
    riskLevel: "जोखिम स्तर",
    duration: "अवधि",
    expectedYield: "अपेक्षित उत्पादन",
    investment: "आवश्यक निवेश",
    currentSeason: "वर्तमान मौसम",
    upcomingTasks: "आगामी कार्य",
    seasonalTips: "मौसमी सुझाव",
    activities: "गतिविधियां",
    score: "सिफारिश स्कोर",
  },
  te: {
    title: "పంట సలహాదారు",
    searchPlaceholder: "పంటలను వెతకండి...",
    recommendedCrops: "సిఫార్సు చేసిన పంటలు",
    seasonalCrops: "కాలానుగుణ పంటలు",
    farmingCalendar: "వ్యవసాయ క్యాలెండర్",
    soilType: "మట్టి రకం",
    climate: "వాతావరణం",
    waterRequirement: "నీటి అవసరం",
    season: "కాలం",
    viewDetails: "వివరాలు చూడండి",
    backToDashboard: "డాష్‌బోర్డ్‌కు తిరిగి",
    filterBy: "ఫిల్టర్ చేయండి",
    allCrops: "అన్ని పంటలు",
    loading: "లోడ్ అవుతోంది...",
    error: "డేటా లోడ్ చేయడంలో లోపం",
    retry: "మళ్లీ ప్రయత్నించండి",
    profitability: "లాభదాయకత",
    marketDemand: "మార్కెట్ డిమాండ్",
    riskLevel: "రిస్క్ లెవల్",
    duration: "వ్యవధి",
    expectedYield: "ఆశించిన దిగుబడి",
    investment: "అవసరమైన పెట్టుబడి",
    currentSeason: "ప్రస్తుత కాలం",
    upcomingTasks: "రాబోయే పనులు",
    seasonalTips: "కాలానుగుణ చిట్కాలు",
    activities: "కార్యకలాపాలు",
    score: "సిఫార్సు స్కోర్",
  },
}

export default function CropAdvisorPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<'en' | 'hi' | 'te'>('en')
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("score")
  const [activeTab, setActiveTab] = useState("recommendations")
  
  // Data states
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([])
  const [seasonalCalendar, setSeasonalCalendar] = useState<SeasonalCalendar | null>(null)
  const [categories, setCategories] = useState<CropCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const t = translations[language]

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'hi' | 'te'
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [recommendationsRes, calendarRes, categoriesRes] = await Promise.all([
        cropApi.getRecommendations({ limit: 20 }),
        cropApi.getSeasonalCalendar(),
        cropApi.getCategories(),
      ])

      if (recommendationsRes.success) {
        setRecommendations(recommendationsRes.data.recommendations || [])
      }

      if (calendarRes.success) {
        setSeasonalCalendar(calendarRes.data)
      }

      if (categoriesRes.success) {
        setCategories(categoriesRes.data || [])
      }
    } catch (err: any) {
      console.error('Error loading crop data:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const filteredCrops = recommendations.filter(crop => {
    const matchesSearch = crop.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.localNames?.[language]?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || crop.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedCrops = [...filteredCrops].sort((a, b) => {
    switch (sortBy) {
      case "score":
        return (b.recommendationScore || 0) - (a.recommendationScore || 0)
      case "name":
        return a.cropName.localeCompare(b.cropName)
      case "profitability":
        const profitOrder = { "very-high": 4, "high": 3, "medium": 2, "low": 1 }
        return (profitOrder[b.profitability as keyof typeof profitOrder] || 0) - 
               (profitOrder[a.profitability as keyof typeof profitOrder] || 0)
      case "duration":
        return a.duration - b.duration
      default:
        return 0
    }
  })

  const getProfitabilityColor = (profitability: string) => {
    switch (profitability) {
      case "very-high": return "bg-green-500"
      case "high": return "bg-green-400"
      case "medium": return "bg-yellow-400"
      case "low": return "bg-red-400"
      default: return "bg-gray-400"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-green-600"
      case "medium": return "text-yellow-600"
      case "high": return "text-red-600"
      default: return "text-gray-600"
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadData} variant="outline">
                {t.retry}
              </Button>
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
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <Sprout className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            {t.backToDashboard}
          </Button>
        </motion.div>

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
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t.filterBy} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allCrops}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">{t.score}</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="profitability">{t.profitability}</SelectItem>
                <SelectItem value="duration">{t.duration}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">{t.recommendedCrops}</TabsTrigger>
            <TabsTrigger value="seasonal">{t.seasonalCrops}</TabsTrigger>
            <TabsTrigger value="calendar">{t.farmingCalendar}</TabsTrigger>
          </TabsList>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCrops.map((crop, index) => (
                <motion.div
                  key={crop._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {crop.localNames?.[language] || crop.cropName}
                          </CardTitle>
                          <p className="text-sm text-gray-500 capitalize">
                            {crop.category} • {crop.season}
                          </p>
                        </div>
                        {crop.recommendationScore && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {crop.recommendationScore}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t.profitability}:</span>
                        <Badge className={`${getProfitabilityColor(crop.profitability)} text-white`}>
                          {crop.profitability}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t.duration}:</span>
                        <span>{crop.duration} days</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t.waterRequirement}:</span>
                        <span className="flex items-center gap-1">
                          <Droplets className="h-3 w-3 text-blue-500" />
                          {crop.waterRequirement}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t.marketDemand}:</span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          {crop.marketDemand}
                        </span>
                      </div>
                      {crop.riskAssessment && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{t.riskLevel}:</span>
                          <span className={getRiskColor(crop.riskAssessment.level)}>
                            {crop.riskAssessment.level}
                          </span>
                        </div>
                      )}
                      {crop.expectedYield && (
                        <div className="text-sm">
                          <span className="text-gray-600">{t.expectedYield}: </span>
                          <span>{crop.expectedYield.average} quintals/hectare</span>
                        </div>
                      )}
                      {crop.suitabilityReason && (
                        <p className="text-xs text-green-600 bg-green-50 p-2 rounded">
                          {crop.suitabilityReason}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => router.push(`/crop-advisor/${crop._id}`)}
                      >
                        {t.viewDetails}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Seasonal Tab */}
          <TabsContent value="seasonal">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCrops.filter(crop => crop.season === seasonalCalendar?.currentSeason).map((crop, index) => (
                <motion.div
                  key={crop._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sun className="h-5 w-5 text-yellow-500" />
                        {crop.localNames?.[language] || crop.cropName}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        {t.currentSeason}: {seasonalCalendar?.currentSeason}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm">
                        <span className="text-gray-600">Sowing: </span>
                        <span>{crop.sowingTime?.optimal || crop.sowingTime?.start}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Harvest: </span>
                        <span>{crop.harvestTime?.start} - {crop.harvestTime?.end}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span>{crop.climateRequirements?.temperature?.optimal}°C optimal</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => router.push(`/crop-advisor/${crop._id}`)}
                      >
                        {t.viewDetails}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            {seasonalCalendar && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Season Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      {t.currentSeason}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">{seasonalCalendar.currentSeason} - {seasonalCalendar.currentMonth}</h4>
                        <div className="space-y-2">
                          {seasonalCalendar.activities.slice(0, 5).map((activity, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              {activity}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      {t.upcomingTasks}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {seasonalCalendar.upcomingTasks.slice(0, 5).map((task, index) => (
                        <div key={index} className="border-l-4 border-orange-500 pl-3">
                          <p className="text-sm font-medium">{task.task}</p>
                          <p className="text-xs text-gray-500">
                            Priority: {task.priority} • Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Seasonal Tips */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sun className="h-5 w-5 text-yellow-500" />
                      {t.seasonalTips}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {seasonalCalendar.seasonalTips.map((tip, index) => (
                        <div key={index} className="bg-yellow-50 p-3 rounded-lg">
                          <p className="text-sm">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}