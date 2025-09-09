"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Cloud,
  TrendingUp,
  FileText,
  Sprout,
  User,
  LogOut,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  TrendingDown,
  Calendar,
  Mic,
  Volume2,
  VolumeX,
  Menu,
  X,
  Camera,
  Save,
  CheckCircle,
  Upload,
  MessageCircle,
  Users,
  ShoppingCart,
  Stethoscope,
  BookOpen,
  Bell,
  Star,
  MapPin,
  Phone,
  Mail,
  Heart,
  Eye,
  AlertTriangle,
  Zap,
  Award,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Wallet,
  CreditCard,
  Gift,
  Truck,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Search,
  Filter,
  Download,
  Share2,
  Bookmark,
  Settings,
  HelpCircle,
  Globe,
  Smartphone,
  Wifi,
  Battery,
  Signal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { toast } from "sonner"

const translations = {
  en: {
    dashboard: "Dashboard",
    weather: "Weather",
    crops: "Crops",
    mandis: "Mandis",
    schemes: "Schemes",
    profile: "Profile",
    logout: "Logout",
    welcome: "Welcome back",
    todayWeather: "Today's Weather",
    temperature: "Temperature",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    rainfall: "Rainfall",
    marketPrices: "Market Prices",
    cropRecommendations: "Crop Recommendations",
    govSchemes: "Government Schemes",
    notifications: "Notifications",
    profileSetup: "Profile Setup",
    personalDetails: "Personal Details",
    farmingDetails: "Farming Details",
    profilePhoto: "Profile Photo",
    uploadPhoto: "Upload Photo",
    farmingType: "Type of Farming",
    saveProfile: "Save Profile",
    profileSaved: "Profile saved successfully!",
    verificationSuccess: "Verification Successful!",
    profileComplete: "Your profile is now complete and verified.",
    continueToApp: "Continue to App",
    community: "Community",
    marketplace: "Marketplace",
    consultations: "Consultations",
    messages: "Messages",
    cropScanner: "Crop Scanner",
    expertChat: "Expert Chat",
    quickActions: "Quick Actions",
    recentActivity: "Recent Activity",
    viewAll: "View All",
    scanCrop: "Scan Crop",
    buySell: "Buy/Sell",
    askExpert: "Ask Expert",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    weather: "मौसम",
    crops: "फसलें",
    mandis: "मंडियां",
    schemes: "योजनाएं",
    profile: "प्रोफाइल",
    logout: "लॉगआउट",
    welcome: "वापस स्वागत है",
    todayWeather: "आज का मौसम",
    temperature: "तापमान",
    humidity: "नमी",
    windSpeed: "हवा की गति",
    rainfall: "बारिश",
    marketPrices: "बाजार की कीमतें",
    cropRecommendations: "फसल सुझाव",
    govSchemes: "सरकारी योजनाएं",
    notifications: "सूचनाएं",
    profileSetup: "प्रोफाइल सेटअप",
    personalDetails: "व्यक्तिगत विवरण",
    farmingDetails: "कृषि विवरण",
    profilePhoto: "प्रोफाइल फोटो",
    uploadPhoto: "फोटो अपलोड करें",
    farmingType: "कृषि का प्रकार",
    saveProfile: "प्रोफाइल सेव करें",
    profileSaved: "प्रोफाइल सफलतापूर्वक सेव हो गया!",
    verificationSuccess: "सत्यापन सफल!",
    profileComplete: "आपका प्रोफाइल अब पूरा और सत्यापित है।",
    continueToApp: "ऐप में जारी रखें",
  },
  te: {
    dashboard: "డ్యాష్బోర్డ్",
    weather: "వాతావరణం",
    crops: "పంటలు",
    mandis: "మండీలు",
    schemes: "పథకాలు",
    profile: "ప్రొఫైల్",
    logout: "లాగ్అవుట్",
    welcome: "తిరిగి స్వాగతం",
    todayWeather: "నేటి వాతావరణం",
    temperature: "ఉష్ణోగ్రత",
    humidity: "తేమ",
    windSpeed: "గాలి వేగం",
    rainfall: "వర్షపాతం",
    marketPrices: "మార్కెట్ ధరలు",
    cropRecommendations: "పంట సూచనలు",
    govSchemes: "ప్రభుత్వ పథకాలు",
    notifications: "నోటిఫికేషన్లు",
    profileSetup: "ప్రొఫైల్ సెటప్",
    personalDetails: "వ్యక్తిగత వివరాలు",
    farmingDetails: "వ్యవసాయ వివరాలు",
    profilePhoto: "ప్రొఫైల్ ఫోటో",
    uploadPhoto: "ఫోటో అప్లోడ్ చేయండి",
    farmingType: "వ్యవసాయ రకం",
    saveProfile: "ప్రొఫైల్ సేవ్ చేయండి",
    profileSaved: "ప్రొఫైల్ విజయవంతంగా సేవ్ చేయబడింది!",
    verificationSuccess: "ధృవీకరణ విజయవంతం!",
    profileComplete: "మీ ప్రొఫైల్ ఇప్పుడు పూర్తి మరియు ధృవీకరించబడింది.",
    continueToApp: "యాప్లో కొనసాగించండి",
  },
}

const farmingTypes = [
  { value: "crops", label: { en: "Crops", hi: "फसलें", te: "పంటలు" } },
  { value: "livestock", label: { en: "Livestock", hi: "पशुधन", te: "పశువులు" } },
  { value: "fish", label: { en: "Fish Farming", hi: "मछली पालन", te: "చేపల పెంపకం" } },
  { value: "vegetables", label: { en: "Vegetables", hi: "सब्जियां", te: "కూరగాయలు" } },
  { value: "fruits", label: { en: "Fruits", hi: "फल", te: "పండ్లు" } },
  { value: "dairy", label: { en: "Dairy", hi: "डेयरी", te: "పాల వ్యాపారం" } },
  { value: "poultry", label: { en: "Poultry", hi: "मुर्गी पालन", te: "కోడి పెంపకం" } },
  { value: "mixed", label: { en: "Mixed Farming", hi: "मिश्रित कृषि", te: "మిశ్రమ వ్యవసాయం" } },
]

// Profile Setup Component
function ProfileSetup({ user, setUser, language }: { user: any; setUser: any; language: "en" | "hi" | "te" }) {
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    mobile: user?.mobile || "",
    email: user?.email || "",
    state: user?.state || "",
    district: user?.district || "",
    village: user?.village || "",
    farmSize: user?.farmSize || "",
    farmingType: user?.farmingType || "",
    primaryCrop: user?.primaryCrop || "",
    profilePhoto: user?.profilePhoto || null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto || null)
  const t = translations[language]

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPhotoPreview(result)
        setProfileData({ ...profileData, profilePhoto: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true)
      
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const updatedUser = { ...user, ...profileData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      toast.success(t.profileSaved)
      setShowSuccess(true)
      
      // Auto hide success screen after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      toast.error('Failed to save profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="h-10 w-10 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">{t.verificationSuccess}</h2>
            <p className="text-gray-600 mb-6">{t.profileComplete}</p>
            <Button onClick={() => setShowSuccess(false)} className="w-full">
              {t.continueToApp}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t.profileSetup}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Photo */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden mx-auto mb-4">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700">
                <Upload className="h-4 w-4" />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
            <p className="text-sm text-gray-600">{t.uploadPhoto}</p>
          </div>

          {/* Personal Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t.personalDetails}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Mobile</Label>
                <Input
                  value={profileData.mobile}
                  onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })}
                  disabled
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Village</Label>
                <Input
                  value={profileData.village}
                  onChange={(e) => setProfileData({ ...profileData, village: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Farming Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t.farmingDetails}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t.farmingType}</Label>
                <Select
                  value={profileData.farmingType}
                  onValueChange={(value) => setProfileData({ ...profileData, farmingType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select farming type" />
                  </SelectTrigger>
                  <SelectContent>
                    {farmingTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label[language]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Farm Size (acres)</Label>
                <Input
                  type="number"
                  value={profileData.farmSize}
                  onChange={(e) => setProfileData({ ...profileData, farmSize: e.target.value })}
                />
              </div>
              <div>
                <Label>Primary Crop</Label>
                <Input
                  value={profileData.primaryCrop}
                  onChange={(e) => setProfileData({ ...profileData, primaryCrop: e.target.value })}
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSaveProfile} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {t.saveProfile}
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Mock data
const weatherData = {
  temperature: 28,
  humidity: 65,
  windSpeed: 12,
  rainfall: 2.5,
  condition: "Partly Cloudy",
  forecast: [
    { day: "Mon", temp: 28, condition: "sunny" },
    { day: "Tue", temp: 30, condition: "cloudy" },
    { day: "Wed", temp: 26, condition: "rainy" },
    { day: "Thu", temp: 29, condition: "sunny" },
    { day: "Fri", temp: 27, condition: "cloudy" },
  ],
}

const marketData = [
  { crop: "Rice", price: 2500, change: 5.2, trend: "up" },
  { crop: "Wheat", price: 2200, change: -2.1, trend: "down" },
  { crop: "Cotton", price: 5800, change: 8.7, trend: "up" },
  { crop: "Sugarcane", price: 350, change: 1.5, trend: "up" },
]

const priceHistory = [
  { month: "Jan", rice: 2300, wheat: 2100, cotton: 5200 },
  { month: "Feb", rice: 2400, wheat: 2150, cotton: 5400 },
  { month: "Mar", rice: 2350, wheat: 2200, cotton: 5600 },
  { month: "Apr", rice: 2450, wheat: 2180, cotton: 5500 },
  { month: "May", rice: 2500, wheat: 2200, cotton: 5800 },
]

const schemes = [
  {
    title: "PM-KISAN Scheme",
    description: "Direct income support to farmers",
    amount: "₹6000/year",
    deadline: "2024-03-31",
    status: "active",
  },
  {
    title: "Crop Insurance Scheme",
    description: "Protection against crop loss",
    amount: "Up to ₹2L",
    deadline: "2024-04-15",
    status: "new",
  },
  {
    title: "Soil Health Card",
    description: "Free soil testing and recommendations",
    amount: "Free",
    deadline: "2024-05-30",
    status: "active",
  },
]

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [language, setLanguage] = useState<"en" | "hi" | "te">("en")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const t = translations[language]

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/auth/login")
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setLanguage(parsedUser.language || "en")
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === "en" ? "en-US" : language === "hi" ? "hi-IN" : "te-IN"
      speechSynthesis.speak(utterance)
      setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
    }
  }

  const stopSpeaking = () => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/90 backdrop-blur-sm border-b border-green-200 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sprout className="h-6 w-6 text-green-600" />
          <span className="font-bold text-green-800">Krishi Mitra</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-sm border-r border-green-200 transition-transform duration-300 ease-in-out`}
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <Sprout className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-green-800">Krishi Mitra</span>
            </div>

            <div className="space-y-2">
              {[
                { id: "dashboard", icon: BarChart3, label: t.dashboard },
                { id: "weather", icon: Cloud, label: t.weather },
                { id: "crops", icon: Sprout, label: t.crops },
                { id: "marketplace", icon: ShoppingCart, label: "Marketplace" },
                { id: "mandis", icon: TrendingUp, label: t.mandis },
                { id: "schemes", icon: FileText, label: t.schemes },
                { id: "community", icon: Users, label: "Community" },
                { id: "consultations", icon: Stethoscope, label: "Expert Chat" },
                { id: "crop-scan", icon: Camera, label: "Crop Scanner" },
                { id: "messages", icon: MessageCircle, label: "Messages" },
                { id: "notifications", icon: Bell, label: "Notifications" },
                { id: "profile", icon: User, label: t.profile },
              ].map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start ${activeTab === item.id ? "bg-green-600 text-white" : ""}`}
                  onClick={() => {
                    const routeMap: { [key: string]: string } = {
                      "marketplace": "/marketplace",
                      "community": "/community",
                      "consultations": "/consultations",
                      "crop-scan": "/crop-scan",
                      "messages": "/messages",
                      "weather": "/weather",
                      "crop-guidance": "/crop-guidance"
                    }
                    
                    if (routeMap[item.id]) {
                      router.push(routeMap[item.id])
                    } else {
                      setActiveTab(item.id)
                      setSidebarOpen(false)
                    }
                  }}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center overflow-hidden">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <div className="font-medium text-sm">{user.name}</div>
                <div className="text-xs text-gray-500">{user.district}</div>
                <div className="text-xs text-green-600">{user.farmingType || 'Farmer'}</div>
              </div>
            </div>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "hi" | "te")}
              className="w-full px-3 py-1 rounded-lg border border-green-300 bg-white mb-2 text-sm"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="te">తెలుగు</option>
            </select>

            <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              {t.logout}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          {/* Voice Controls */}
          <div className="flex justify-between items-center mb-6">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl lg:text-3xl font-bold text-green-800"
            >
              {t.welcome}, {user.name}!
            </motion.h1>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  speakText(
                    `${t.welcome} ${user.name}. ${t.todayWeather}: ${weatherData.temperature} degrees, ${weatherData.condition}`,
                  )
                }
                className={isSpeaking ? "animate-pulse" : ""}
              >
                <Mic className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={isSpeaking ? stopSpeaking : () => speakText("Voice assistant ready")}
              >
                {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <ProfileSetup user={user} setUser={setUser} language={language} />
          )}

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-pointer hover:scale-105 transition-transform" onClick={() => router.push('/weather')}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">{t.temperature}</p>
                        <p className="text-2xl font-bold">{weatherData.temperature}°C</p>
                        <p className="text-sm text-blue-200">{weatherData.condition}</p>
                      </div>
                      <Thermometer className="h-8 w-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white cursor-pointer hover:scale-105 transition-transform" onClick={() => router.push('/marketplace')}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Market Prices</p>
                        <p className="text-2xl font-bold">₹2,500</p>
                        <p className="text-sm text-green-200">Rice per quintal</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white cursor-pointer hover:scale-105 transition-transform" onClick={() => router.push('/community')}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Community</p>
                        <p className="text-2xl font-bold">1,247</p>
                        <p className="text-sm text-purple-200">Active farmers</p>
                      </div>
                      <Users className="h-8 w-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white cursor-pointer hover:scale-105 transition-transform" onClick={() => router.push('/consultations')}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100">Expert Chat</p>
                        <p className="text-2xl font-bold">24/7</p>
                        <p className="text-sm text-orange-200">Available now</p>
                      </div>
                      <Stethoscope className="h-8 w-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/crop-scan')}>
                      <Camera className="h-6 w-6" />
                      <span className="text-sm">Scan Crop</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/weather')}>
                      <Cloud className="h-6 w-6" />
                      <span className="text-sm">Weather</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/marketplace')}>
                      <ShoppingCart className="h-6 w-6" />
                      <span className="text-sm">Buy/Sell</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/consultations')}>
                      <MessageCircle className="h-6 w-6" />
                      <span className="text-sm">Ask Expert</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Weather */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cloud className="h-5 w-5 text-blue-500" />
                      {t.todayWeather}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span className="text-sm">{t.temperature}: {weatherData.temperature}°C</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{t.humidity}: {weatherData.humidity}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{t.windSpeed}: {weatherData.windSpeed} km/h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CloudRain className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{t.rainfall}: {weatherData.rainfall} mm</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4" onClick={() => router.push('/weather')}>
                      View Full Forecast
                    </Button>
                  </CardContent>
                </Card>

                {/* Market Prices */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      {t.marketPrices}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {marketData.slice(0, 4).map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="font-medium">{item.crop}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">₹{item.price}</span>
                            <Badge variant={item.trend === 'up' ? 'default' : 'destructive'} className="text-xs">
                              {item.trend === 'up' ? '+' : ''}{item.change}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-4" onClick={() => router.push('/marketplace')}>
                      View All Prices
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Government Schemes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    {t.govSchemes}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {schemes.slice(0, 3).map((scheme, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm">{scheme.title}</h4>
                          <Badge variant={scheme.status === 'new' ? 'default' : 'secondary'} className="text-xs">
                            {scheme.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{scheme.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-600">{scheme.amount}</span>
                          <span className="text-xs text-gray-500">Due: {scheme.deadline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" onClick={() => setActiveTab('schemes')}>
                    View All Schemes
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Weather alert received</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">New message from Dr. Sharma</p>
                        <p className="text-xs text-gray-500">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium">Rice prices increased by 5.2%</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Weather Tab */}
          {activeTab === "weather" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    Weather Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {weatherData.forecast.map((day, index) => (
                      <div key={index} className="text-center p-4 border rounded-lg">
                        <p className="font-medium">{day.day}</p>
                        <div className="my-2">
                          {day.condition === 'sunny' && <Thermometer className="h-8 w-8 mx-auto text-yellow-500" />}
                          {day.condition === 'cloudy' && <Cloud className="h-8 w-8 mx-auto text-gray-500" />}
                          {day.condition === 'rainy' && <CloudRain className="h-8 w-8 mx-auto text-blue-500" />}
                        </div>
                        <p className="text-lg font-bold">{day.temp}°C</p>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" onClick={() => router.push('/weather')}>
                    View Detailed Weather
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Crops Tab */}
          {activeTab === "crops" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sprout className="h-5 w-5" />
                      Crop Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-green-600">Rice (Kharif)</h4>
                        <p className="text-sm text-gray-600">Best suited for current weather conditions</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">95% match</span>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-green-600">Cotton</h4>
                        <p className="text-sm text-gray-600">High market demand expected</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">88% match</span>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full mt-4" onClick={() => router.push('/crop-guidance')}>
                      Get Detailed Guidance
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Crop Health Scanner
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Camera className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">Scan your crops to detect diseases and get treatment recommendations</p>
                      <Button onClick={() => router.push('/crop-scan')}>
                        <Camera className="h-4 w-4 mr-2" />
                        Start Scanning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Mandis Tab */}
          {activeTab === "mandis" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Market Price Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="rice" stroke="#8884d8" strokeWidth={2} />
                        <Line type="monotone" dataKey="wheat" stroke="#82ca9d" strokeWidth={2} />
                        <Line type="monotone" dataKey="cotton" stroke="#ffc658" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <Button className="w-full mt-4" onClick={() => router.push('/marketplace')}>
                    View Live Prices
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Schemes Tab */}
          {activeTab === "schemes" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schemes.map((scheme, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{scheme.title}</CardTitle>
                        <Badge variant={scheme.status === 'new' ? 'default' : 'secondary'}>
                          {scheme.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{scheme.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Amount:</span>
                          <span className="font-semibold text-green-600">{scheme.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Deadline:</span>
                          <span className="font-medium">{scheme.deadline}</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4">
                        Apply Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Recent Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: 'weather', title: 'Heavy rain expected tomorrow', time: '2 hours ago', icon: CloudRain, color: 'blue' },
                      { type: 'market', title: 'Rice prices increased by 5%', time: '5 hours ago', icon: TrendingUp, color: 'green' },
                      { type: 'scheme', title: 'New PM-KISAN installment released', time: '1 day ago', icon: Gift, color: 'purple' },
                      { type: 'expert', title: 'Dr. Sharma replied to your query', time: '2 days ago', icon: MessageCircle, color: 'orange' },
                    ].map((notification, index) => (
                      <div key={index} className={`flex items-start gap-3 p-4 border-l-4 border-${notification.color}-500 bg-${notification.color}-50 rounded-r-lg`}>
                        <notification.icon className={`h-5 w-5 text-${notification.color}-500 mt-0.5`} />
                        <div className="flex-1">
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-gray-500">{notification.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}