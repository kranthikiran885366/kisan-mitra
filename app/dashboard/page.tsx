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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

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
  },
  te: {
    dashboard: "డ్యాష్‌బోర్డ్",
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
  },
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
                { id: "dashboard", icon: TrendingUp, label: t.dashboard },
                { id: "weather", icon: Cloud, label: t.weather },
                { id: "crops", icon: Sprout, label: t.crops },
                { id: "mandis", icon: TrendingUp, label: t.mandis },
                { id: "schemes", icon: FileText, label: t.schemes },
              ].map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start ${activeTab === item.id ? "bg-green-600 text-white" : ""}`}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
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
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-medium text-sm">{user.name}</div>
                <div className="text-xs text-gray-500">{user.district}</div>
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

          {/* Dashboard Content */}
          {activeTab === "dashboard" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">{t.temperature}</p>
                        <p className="text-2xl font-bold">{weatherData.temperature}°C</p>
                      </div>
                      <Thermometer className="h-8 w-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">{t.humidity}</p>
                        <p className="text-2xl font-bold">{weatherData.humidity}%</p>
                      </div>
                      <Droplets className="h-8 w-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">{t.windSpeed}</p>
                        <p className="text-2xl font-bold">{weatherData.windSpeed} km/h</p>
                      </div>
                      <Wind className="h-8 w-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100">{t.rainfall}</p>
                        <p className="text-2xl font-bold">{weatherData.rainfall} mm</p>
                      </div>
                      <CloudRain className="h-8 w-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Market Prices */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {t.marketPrices}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Sprout className="h-5 w-5 text-green-600" />
                          <span className="font-medium">{item.crop}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold">₹{item.price}/quintal</span>
                          <Badge variant={item.trend === "up" ? "default" : "destructive"}>
                            {item.trend === "up" ? "↑" : "↓"} {item.change}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Price Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Price Trends (Last 5 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={priceHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="rice" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="wheat" stroke="#f59e0b" strokeWidth={2} />
                      <Line type="monotone" dataKey="cotton" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
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
                    {t.todayWeather}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-blue-600 mb-2">{weatherData.temperature}°C</div>
                      <div className="text-lg text-gray-600">{weatherData.condition}</div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Humidity:</span>
                        <span>{weatherData.humidity}%</span>
                      </div>
                      <Progress value={weatherData.humidity} className="h-2" />
                      <div className="flex justify-between">
                        <span>Wind Speed:</span>
                        <span>{weatherData.windSpeed} km/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rainfall:</span>
                        <span>{weatherData.rainfall} mm</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>5-Day Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4">
                    {weatherData.forecast.map((day, index) => (
                      <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium mb-2">{day.day}</div>
                        <div className="text-2xl mb-2">
                          {day.condition === "sunny" ? "☀️" : day.condition === "cloudy" ? "☁️" : "🌧️"}
                        </div>
                        <div className="font-bold">{day.temp}°C</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Crops Tab */}
          {activeTab === "crops" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sprout className="h-5 w-5" />
                    {t.cropRecommendations}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-green-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Recommended for Current Season</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <Sprout className="h-5 w-5 text-green-600" />
                            <div>
                              <div className="font-medium">Rice (Kharif)</div>
                              <div className="text-sm text-gray-600">Best for current weather</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                            <Sprout className="h-5 w-5 text-blue-600" />
                            <div>
                              <div className="font-medium">Cotton</div>
                              <div className="text-sm text-gray-600">High market demand</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-orange-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Your Current Crops</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Sprout className="h-5 w-5 text-orange-600" />
                              <span>{user.primaryCrop}</span>
                            </div>
                            <Badge>Primary</Badge>
                          </div>
                          <div className="text-sm text-gray-600">Farm Size: {user.farmSize} acres</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Mandis Tab */}
          {activeTab === "mandis" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {t.marketPrices} - {user.district}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketData.map((item, index) => (
                      <Card key={index} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Sprout className="h-6 w-6 text-green-600" />
                              <div>
                                <div className="font-bold text-lg">{item.crop}</div>
                                <div className="text-sm text-gray-600">Per Quintal</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">₹{item.price}</div>
                              <div
                                className={`flex items-center gap-1 ${item.trend === "up" ? "text-green-600" : "text-red-600"}`}
                              >
                                {item.trend === "up" ? (
                                  <TrendingUp className="h-4 w-4" />
                                ) : (
                                  <TrendingDown className="h-4 w-4" />
                                )}
                                {item.change}%
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={marketData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="crop" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="price" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Schemes Tab */}
          {activeTab === "schemes" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t.govSchemes}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {schemes.map((scheme, index) => (
                      <Card
                        key={index}
                        className={`border-l-4 ${scheme.status === "new" ? "border-l-blue-500" : "border-l-green-500"}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-lg">{scheme.title}</h3>
                                <Badge variant={scheme.status === "new" ? "default" : "secondary"}>
                                  {scheme.status === "new" ? "New" : "Active"}
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-2">{scheme.description}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Amount:</span>
                                  <span className="text-green-600 font-bold">{scheme.amount}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Deadline: {scheme.deadline}</span>
                                </div>
                              </div>
                            </div>
                            <Button size="sm" className="ml-4">
                              Apply Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
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
