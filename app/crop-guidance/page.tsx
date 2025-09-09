"use client"

import { useState, useEffect } from "react"
import { Leaf, Calendar, MapPin, AlertTriangle, CheckCircle, TrendingUp, Droplets, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CropGuidancePage() {
  const [guidances, setGuidances] = useState([])
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGuidances()
    fetchWeatherData()
  }, [])

  const fetchGuidances = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/crop-guidance?farmerId=default_farmer")
      const data = await response.json()
      
      if (data.success) {
        setGuidances(data.data)
      }
    } catch (error) {
      console.error("Error fetching guidances:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWeatherData = async () => {
    try {
      const response = await fetch("/api/weather?district=Guntur&state=Andhra Pradesh")
      const data = await response.json()
      
      if (data.location) {
        setWeatherData(data)
      }
    } catch (error) {
      console.error("Error fetching weather:", error)
    }
  }

  const getHealthStatusColor = (status) => {
    switch (status) {
      case "excellent": return "bg-green-100 text-green-800"
      case "good": return "bg-blue-100 text-blue-800"
      case "fair": return "bg-yellow-100 text-yellow-800"
      case "poor": return "bg-orange-100 text-orange-800"
      case "critical": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-green-800 mb-2">🌱 Crop Guidance & Management</h1>
          <p className="text-gray-600">AI-powered crop health management and localized farming advice</p>
        </div>

        {weatherData && weatherData.cropAlerts && weatherData.cropAlerts.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-orange-800">Weather Alerts</h3>
              </div>
              <div className="space-y-2">
                {weatherData.cropAlerts.slice(0, 2).map((alert, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{alert.title}:</span> {alert.message}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Weather Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weatherData ? (
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{weatherData.current.temp_c}°C</div>
                    <div className="text-sm text-gray-600 capitalize">{weatherData.current.condition.text}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Droplets className="h-3 w-3 text-blue-500" />
                      <span>{weatherData.current.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-gray-500" />
                      <span>{weatherData.current.wind_kph} km/h</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">Loading weather...</div>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Your Crop Guidance</h2>
              <Button onClick={() => window.location.href = "/crop-scan"}>
                <Leaf className="h-4 w-4 mr-2" />
                Scan New Crop
              </Button>
            </div>

            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active">Active Guidance</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : guidances.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Leaf className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Guidance</h3>
                      <p className="text-gray-500 mb-4">Start by scanning your crops for personalized guidance</p>
                      <Button onClick={() => window.location.href = "/crop-scan"}>
                        Scan Your First Crop
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {guidances.map((guidance) => (
                      <Card key={guidance.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2">
                              <Leaf className="h-5 w-5 text-green-600" />
                              {guidance.cropName} - {guidance.variety}
                            </CardTitle>
                            <div className="flex gap-2">
                              <Badge className={getHealthStatusColor(guidance.healthStatus.overall)}>
                                {guidance.healthStatus.overall}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {guidance.growthStage}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                Location
                              </h4>
                              <p className="text-sm text-gray-600">{guidance.location.district}, {guidance.location.state}</p>
                              <p className="text-sm text-gray-500">
                                Updated: {new Date(guidance.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">Health Status</h4>
                              {guidance.healthStatus.issues.length > 0 ? (
                                <div className="space-y-1">
                                  {guidance.healthStatus.issues.slice(0, 2).map((issue, index) => (
                                    <div key={index} className="text-sm">
                                      <Badge variant="secondary" className="mr-2 capitalize">
                                        {issue.severity}
                                      </Badge>
                                      <span className="capitalize">{issue.type.replace('_', ' ')}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-green-600">No issues detected</p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Calendar className="h-4 w-4 mr-1" />
                              Follow-up
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => window.location.href = "/marketplace?tab=products"}
                            >
                              Buy Supplies
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recommendations">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Weather-Based Recommendations</h3>
                      
                      {weatherData && weatherData.cropAlerts && (
                        <div className="space-y-3 text-left">
                          {weatherData.cropAlerts.map((alert, index) => (
                            <div key={index} className="bg-yellow-50 p-3 rounded">
                              <h4 className="font-medium text-sm">{alert.title}</h4>
                              <p className="text-sm text-gray-600">{alert.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}