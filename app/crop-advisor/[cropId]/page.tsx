"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Sprout, 
  Droplets, 
  Thermometer, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  AlertTriangle,
  Leaf,
  Bug,
  Shield,
  Star
} from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { cropApi, CropRecommendation } from "@/lib/cropApi"

export default function CropDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const cropId = params.cropId as string
  
  const [language, setLanguage] = useState<'en' | 'hi' | 'te'>('en')
  const [crop, setCrop] = useState<CropRecommendation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'hi' | 'te'
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    if (cropId) {
      loadCropDetails()
    }
  }, [cropId])

  const loadCropDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await cropApi.getCropDetails(cropId)
      
      if (response.success) {
        setCrop(response.data)
      } else {
        setError(response.message || 'Failed to load crop details')
      }
    } catch (err: any) {
      console.error('Error loading crop details:', err)
      setError(err.message || 'Failed to load crop details')
    } finally {
      setLoading(false)
    }
  }

  const getProfitabilityColor = (profitability: string) => {
    switch (profitability) {
      case "very-high": return "bg-green-500"
      case "high": return "bg-green-400"
      case "medium": return "bg-yellow-400"
      case "low": return "bg-red-400"
      default: return "bg-gray-400"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !crop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error || 'Error loading crop details'}</p>
              <Button onClick={loadCropDetails} variant="outline">
                Retry
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
            <Button
              variant="outline"
              onClick={() => router.push('/crop-advisor')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Crops
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {crop.localNames?.[language] || crop.cropName}
              </h1>
              <p className="text-gray-600 capitalize">
                {crop.category} • {crop.season} Season
              </p>
            </div>
          </div>
          {crop.recommendationScore && (
            <Badge variant="secondary" className="flex items-center gap-1 text-lg px-3 py-1">
              <Star className="h-4 w-4" />
              {crop.recommendationScore}/100
            </Badge>
          )}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-semibold">{crop.duration} days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Profitability</p>
              <Badge className={`${getProfitabilityColor(crop.profitability)} text-white`}>
                {crop.profitability}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Droplets className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Water Requirement</p>
              <p className="font-semibold capitalize">{crop.waterRequirement}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Risk Level</p>
              <p className="font-semibold capitalize">{crop.riskFactor}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Information Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cultivation">Cultivation</TabsTrigger>
              <TabsTrigger value="economics">Economics</TabsTrigger>
              <TabsTrigger value="pest-disease">Pest & Disease</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-red-500" />
                      Ideal Growing Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {crop.climateRequirements && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Temperature:</span>
                          <span>
                            {crop.climateRequirements.temperature?.optimal}°C 
                            ({crop.climateRequirements.temperature?.min}-{crop.climateRequirements.temperature?.max}°C)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rainfall:</span>
                          <span>
                            {crop.climateRequirements.rainfall?.optimal}mm
                            ({crop.climateRequirements.rainfall?.min}-{crop.climateRequirements.rainfall?.max}mm)
                          </span>
                        </div>
                        {crop.climateRequirements.humidity && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Humidity:</span>
                            <span>
                              {crop.climateRequirements.humidity.min}-{crop.climateRequirements.humidity.max}%
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    <div>
                      <span className="text-gray-600">Suitable Soil Types:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {crop.suitableSoils?.map((soil, index) => (
                          <Badge key={index} variant="outline" className="capitalize">
                            {soil}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      Sowing & Harvest Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {crop.sowingTime && (
                      <div>
                        <span className="text-gray-600">Sowing Time:</span>
                        <p className="font-medium">
                          {crop.sowingTime.optimal || `${crop.sowingTime.start} - ${crop.sowingTime.end}`}
                        </p>
                      </div>
                    )}
                    {crop.harvestTime && (
                      <div>
                        <span className="text-gray-600">Harvest Time:</span>
                        <p className="font-medium">
                          {crop.harvestTime.start} - {crop.harvestTime.end}
                        </p>
                      </div>
                    )}
                    {crop.spacing && (
                      <div>
                        <span className="text-gray-600">Plant Spacing:</span>
                        <p className="font-medium">
                          {crop.spacing.rowToRow} x {crop.spacing.plantToPlant} cm
                        </p>
                      </div>
                    )}
                    {crop.seedRate && (
                      <div>
                        <span className="text-gray-600">Seed Rate:</span>
                        <p className="font-medium">
                          {crop.seedRate.value} {crop.seedRate.unit}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Cultivation Tab */}
            <TabsContent value="cultivation" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {crop.fertilizers && crop.fertilizers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Leaf className="h-5 w-5 text-green-500" />
                        Fertilization Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {crop.fertilizers.map((fertilizer, index) => (
                          <div key={index} className="border-l-4 border-green-500 pl-3">
                            <p className="font-medium">{fertilizer.name}</p>
                            <p className="text-sm text-gray-600">
                              {fertilizer.quantity} • {fertilizer.timing}
                            </p>
                            <p className="text-sm text-gray-500">{fertilizer.method}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {crop.irrigation && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-blue-500" />
                        Irrigation Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-gray-600">Frequency:</span>
                        <p className="font-medium">{crop.irrigation.frequency}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Method:</span>
                        <p className="font-medium">{crop.irrigation.method}</p>
                      </div>
                      {crop.irrigation.criticalStages && crop.irrigation.criticalStages.length > 0 && (
                        <div>
                          <span className="text-gray-600">Critical Stages:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {crop.irrigation.criticalStages.map((stage, index) => (
                              <Badge key={index} variant="outline">
                                {stage}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Economics Tab */}
            <TabsContent value="economics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Expected Yield & Market Price
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {crop.expectedYield && (
                      <div>
                        <span className="text-gray-600">Expected Yield:</span>
                        <p className="font-medium">
                          {crop.expectedYield.average} quintals/hectare
                          <span className="text-sm text-gray-500 ml-2">
                            ({crop.expectedYield.min}-{crop.expectedYield.max})
                          </span>
                        </p>
                      </div>
                    )}
                    {crop.marketPrice && (
                      <div>
                        <span className="text-gray-600">Market Price:</span>
                        <p className="font-medium">
                          ₹{crop.marketPrice.average}/quintal
                          <span className="text-sm text-gray-500 ml-2">
                            (₹{crop.marketPrice.min}-₹{crop.marketPrice.max})
                          </span>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {crop.investmentRequired && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-blue-500" />
                        Investment Required
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Seeds:</span>
                        <span>₹{crop.investmentRequired.seeds}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fertilizers:</span>
                        <span>₹{crop.investmentRequired.fertilizers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pesticides:</span>
                        <span>₹{crop.investmentRequired.pesticides}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Labor:</span>
                        <span>₹{crop.investmentRequired.labor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Irrigation:</span>
                        <span>₹{crop.investmentRequired.irrigation}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Total:</span>
                        <span>₹{crop.investmentRequired.total}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Pest & Disease Tab */}
            <TabsContent value="pest-disease" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {crop.pestManagement && crop.pestManagement.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bug className="h-5 w-5 text-red-500" />
                        Pest Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {crop.pestManagement.map((pest, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-semibold text-lg mb-3">{pest.pest}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div>
                                <h5 className="font-medium text-sm text-gray-600 mb-2">Symptoms</h5>
                                <ul className="text-sm space-y-1">
                                  {pest.symptoms?.map((symptom, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                      {symptom}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium text-sm text-gray-600 mb-2">Organic Treatment</h5>
                                <ul className="text-sm space-y-1">
                                  {pest.organicTreatment?.map((treatment, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                      {treatment}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium text-sm text-gray-600 mb-2">Chemical Treatment</h5>
                                <ul className="text-sm space-y-1">
                                  {pest.chemicalTreatment?.map((treatment, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                      {treatment}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium text-sm text-gray-600 mb-2">Preventive Measures</h5>
                                <ul className="text-sm space-y-1">
                                  {pest.preventiveMeasures?.map((measure, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <div className="w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                                      {measure}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {crop.diseaseManagement && crop.diseaseManagement.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-orange-500" />
                        Disease Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {crop.diseaseManagement.map((disease, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-semibold text-lg mb-3">{disease.disease}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div>
                                <h5 className="font-medium text-sm text-gray-600 mb-2">Symptoms</h5>
                                <ul className="text-sm space-y-1">
                                  {disease.symptoms?.map((symptom, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                      {symptom}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium text-sm text-gray-600 mb-2">Organic Treatment</h5>
                                <ul className="text-sm space-y-1">
                                  {disease.organicTreatment?.map((treatment, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                      {treatment}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium text-sm text-gray-600 mb-2">Chemical Treatment</h5>
                                <ul className="text-sm space-y-1">
                                  {disease.chemicalTreatment?.map((treatment, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                      {treatment}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium text-sm text-gray-600 mb-2">Preventive Measures</h5>
                                <ul className="text-sm space-y-1">
                                  {disease.preventiveMeasures?.map((measure, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <div className="w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                                      {measure}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}