"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Stethoscope,
  Camera,
  Upload,
  Leaf,
  Bug,
  Sun,
  AlertTriangle,
  CheckCircle,
  Star,
  BookOpen,
  Video,
  Clock,
  Award,
  TrendingUp,
  Zap,
  Shield,
  Target,
  Heart,
  Brain,
  Microscope,
  FlaskConical,
  Activity,
  BarChart3,
  PieChart,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DiseaseSpecialistProps {
  language: "en" | "hi" | "te"
}

const translations = {
  en: {
    title: "Disease Specialist Center",
    subtitle: "AI-Powered Crop Disease Diagnosis & Treatment",
    uploadImage: "Upload Crop Image",
    takePhoto: "Take Photo",
    searchDisease: "Search Disease",
    filterBy: "Filter By",
    allCrops: "All Crops",
    severity: "Severity",
    confidence: "Confidence",
    organicTreatment: "Organic Treatment",
    inorganicTreatment: "Inorganic Treatment",
    prevention: "Prevention Tips",
    symptoms: "Symptoms",
    causes: "Causes",
    lifecycle: "Disease Lifecycle",
    expertAdvice: "Expert Advice",
    similarCases: "Similar Cases",
    treatmentHistory: "Treatment History",
    successRate: "Success Rate",
    costAnalysis: "Cost Analysis",
    timeToRecover: "Recovery Time",
    environmentalImpact: "Environmental Impact",
    tabs: {
      diagnosis: "Diagnosis",
      treatments: "Treatments",
      prevention: "Prevention",
      experts: "Experts",
      history: "History",
    },
    diseaseTypes: {
      fungal: "Fungal",
      bacterial: "Bacterial",
      viral: "Viral",
      pest: "Pest",
      nutritional: "Nutritional",
      environmental: "Environmental",
    },
  },
  hi: {
    title: "रोग विशेषज्ञ केंद्र",
    subtitle: "AI-संचालित फसल रोग निदान और उपचार",
    uploadImage: "फसल की छवि अपलोड करें",
    takePhoto: "फोटो लें",
    searchDisease: "रोग खोजें",
    filterBy: "फ़िल्टर करें",
    allCrops: "सभी फसलें",
    severity: "गंभीरता",
    confidence: "विश्वास",
    organicTreatment: "जैविक उपचार",
    inorganicTreatment: "अजैविक उपचार",
    prevention: "रोकथाम के सुझाव",
    symptoms: "लक्षण",
    causes: "कारण",
    lifecycle: "रोग जीवनचक्र",
    expertAdvice: "विशेषज्ञ सलाह",
    similarCases: "समान मामले",
    treatmentHistory: "उपचार इतिहास",
    successRate: "सफलता दर",
    costAnalysis: "लागत विश्लेषण",
    timeToRecover: "ठीक होने का समय",
    environmentalImpact: "पर्यावरणीय प्रभाव",
    tabs: {
      diagnosis: "निदान",
      treatments: "उपचार",
      prevention: "रोकथाम",
      experts: "विशेषज्ञ",
      history: "इतिहास",
    },
    diseaseTypes: {
      fungal: "कवक",
      bacterial: "बैक्टीरियल",
      viral: "वायरल",
      pest: "कीट",
      nutritional: "पोषण",
      environmental: "पर्यावरणीय",
    },
  },
  te: {
    title: "వ్యాధి నిపుణుల కేంద్రం",
    subtitle: "AI-శక్తితో పంట వ్యాధి నిర్ధారణ & చికిత్స",
    uploadImage: "పంట చిత్రాన్ని అప్‌లోడ్ చేయండి",
    takePhoto: "ఫోటో తీయండి",
    searchDisease: "వ్యాధిని వెతకండి",
    filterBy: "ఫిల్టర్ చేయండి",
    allCrops: "అన్ని పంటలు",
    severity: "తీవ్రత",
    confidence: "నమ్మకం",
    organicTreatment: "సేంద్రీయ చికిత్స",
    inorganicTreatment: "అసేంద్రీయ చికిత్స",
    prevention: "నివారణ చిట్కాలు",
    symptoms: "లక్షణాలు",
    causes: "కారణాలు",
    lifecycle: "వ్యాధి జీవనచక్రం",
    expertAdvice: "నిపుణుల సలహా",
    similarCases: "సమాన కేసులు",
    treatmentHistory: "చికిత్స చరిత్ర",
    successRate: "విజయ రేటు",
    costAnalysis: "ఖర్చు విశ్లేషణ",
    timeToRecover: "కోలుకునే సమయం",
    environmentalImpact: "పర్యావరణ ప్రభావం",
    tabs: {
      diagnosis: "నిర్ధారణ",
      treatments: "చికిత్సలు",
      prevention: "నివారణ",
      experts: "నిపుణులు",
      history: "చరిత్ర",
    },
    diseaseTypes: {
      fungal: "ఫంగల్",
      bacterial: "బ్యాక్టీరియల్",
      viral: "వైరల్",
      pest: "కీటకాలు",
      nutritional: "పోషకాహారం",
      environmental: "పర్యావరణ",
    },
  },
}

// Mock disease database
const mockDiseases = [
  {
    id: "1",
    name: "Late Blight",
    type: "fungal",
    crops: ["Potato", "Tomato"],
    severity: "high",
    confidence: 94,
    symptoms: [
      "Dark brown spots on leaves",
      "White fuzzy growth on leaf undersides",
      "Rapid leaf death",
      "Stem lesions",
      "Fruit rot",
    ],
    causes: [
      "High humidity (>90%)",
      "Cool temperatures (15-20°C)",
      "Poor air circulation",
      "Overhead watering",
      "Dense plant spacing",
    ],
    organicTreatments: [
      {
        name: "Copper Sulfate Spray",
        description: "Natural fungicide effective against late blight",
        application: "Spray every 7-10 days",
        cost: "₹200/acre",
        effectiveness: 85,
        environmentalImpact: "Low",
      },
      {
        name: "Baking Soda Solution",
        description: "1 tsp per liter of water with liquid soap",
        application: "Weekly application",
        cost: "₹50/acre",
        effectiveness: 70,
        environmentalImpact: "Very Low",
      },
      {
        name: "Neem Oil Treatment",
        description: "Natural antifungal and pest deterrent",
        application: "Bi-weekly spray",
        cost: "₹300/acre",
        effectiveness: 75,
        environmentalImpact: "Low",
      },
    ],
    inorganicTreatments: [
      {
        name: "Mancozeb Fungicide",
        description: "Broad-spectrum protective fungicide",
        application: "Every 10-14 days",
        cost: "₹400/acre",
        effectiveness: 95,
        environmentalImpact: "Medium",
      },
      {
        name: "Chlorothalonil",
        description: "Preventive fungicide for late blight",
        application: "Weekly during high risk periods",
        cost: "₹500/acre",
        effectiveness: 92,
        environmentalImpact: "Medium",
      },
    ],
    prevention: [
      "Use resistant varieties",
      "Ensure proper spacing",
      "Improve air circulation",
      "Avoid overhead irrigation",
      "Remove infected plant debris",
      "Crop rotation",
    ],
    recoveryTime: "2-3 weeks",
    successRate: 88,
    image: "/placeholder.svg?height=200&width=300&text=Late+Blight",
  },
  {
    id: "2",
    name: "Powdery Mildew",
    type: "fungal",
    crops: ["Cucumber", "Pumpkin", "Grapes"],
    severity: "medium",
    confidence: 91,
    symptoms: [
      "White powdery coating on leaves",
      "Yellowing of affected leaves",
      "Stunted growth",
      "Distorted leaves",
      "Premature leaf drop",
    ],
    causes: [
      "High humidity with dry conditions",
      "Poor air circulation",
      "Overcrowded plants",
      "Shade conditions",
      "Temperature fluctuations",
    ],
    organicTreatments: [
      {
        name: "Milk Spray",
        description: "1:10 milk to water ratio",
        application: "Weekly spray",
        cost: "₹100/acre",
        effectiveness: 80,
        environmentalImpact: "Very Low",
      },
      {
        name: "Sulfur Dust",
        description: "Natural fungicide powder",
        application: "Dust plants in morning",
        cost: "₹250/acre",
        effectiveness: 85,
        environmentalImpact: "Low",
      },
    ],
    inorganicTreatments: [
      {
        name: "Myclobutanil",
        description: "Systemic fungicide",
        application: "Every 14 days",
        cost: "₹600/acre",
        effectiveness: 95,
        environmentalImpact: "Medium",
      },
    ],
    prevention: [
      "Improve air circulation",
      "Avoid overhead watering",
      "Plant in sunny locations",
      "Proper plant spacing",
      "Remove affected leaves",
    ],
    recoveryTime: "1-2 weeks",
    successRate: 92,
    image: "/placeholder.svg?height=200&width=300&text=Powdery+Mildew",
  },
]

const mockExperts = [
  {
    id: "1",
    name: "Dr. Rajesh Kumar",
    specialization: "Plant Pathology",
    experience: "15 years",
    rating: 4.8,
    consultations: 1250,
    languages: ["English", "Hindi"],
    availability: "Available",
    image: "/placeholder.svg?height=100&width=100&text=Dr.+Rajesh",
  },
  {
    id: "2",
    name: "Dr. Priya Sharma",
    specialization: "Organic Farming",
    experience: "12 years",
    rating: 4.9,
    consultations: 980,
    languages: ["English", "Hindi", "Telugu"],
    availability: "Busy",
    image: "/placeholder.svg?height=100&width=100&text=Dr.+Priya",
  },
]

export function DiseaseSpecialist({ language }: DiseaseSpecialistProps) {
  const [activeTab, setActiveTab] = useState("diagnosis")
  const [selectedDisease, setSelectedDisease] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const t = translations[language]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        analyzeImage()
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = () => {
    setIsAnalyzing(true)
    // Simulate AI analysis
    setTimeout(() => {
      const randomDisease = mockDiseases[Math.floor(Math.random() * mockDiseases.length)]
      setAnalysisResult(randomDisease)
      setSelectedDisease(randomDisease)
      setIsAnalyzing(false)
    }, 3000)
  }

  const filteredDiseases = mockDiseases.filter((disease) => {
    const matchesSearch = disease.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || disease.type === filterType
    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center"
          >
            <Stethoscope className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
        </div>
      </motion.div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="diagnosis" className="flex items-center gap-2">
            <Microscope className="h-4 w-4" />
            {t.tabs.diagnosis}
          </TabsTrigger>
          <TabsTrigger value="treatments" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            {t.tabs.treatments}
          </TabsTrigger>
          <TabsTrigger value="prevention" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t.tabs.prevention}
          </TabsTrigger>
          <TabsTrigger value="experts" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            {t.tabs.experts}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t.tabs.history}
          </TabsTrigger>
        </TabsList>

        {/* Diagnosis Tab */}
        <TabsContent value="diagnosis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Upload Section */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-blue-600" />
                    AI Disease Detection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {uploadedImage ? (
                      <div className="space-y-4">
                        <motion.img
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          src={uploadedImage}
                          alt="Uploaded crop"
                          className="max-w-full h-48 object-cover rounded-lg mx-auto"
                        />
                        {isAnalyzing && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                            <div className="flex items-center justify-center gap-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                              >
                                <Brain className="h-6 w-6 text-blue-600" />
                              </motion.div>
                              <span className="text-blue-600 font-medium">Analyzing with AI...</span>
                            </div>
                            <Progress value={66} className="w-full" />
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium text-gray-700">{t.uploadImage}</p>
                          <p className="text-sm text-gray-500">Drag & drop or click to select</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => document.getElementById("image-upload")?.click()}
                      className="flex-1"
                      disabled={isAnalyzing}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {t.uploadImage}
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent" disabled={isAnalyzing}>
                      <Camera className="h-4 w-4 mr-2" />
                      {t.takePhoto}
                    </Button>
                  </div>

                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Analysis Results */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisResult ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle
                          className={`h-6 w-6 ${
                            analysisResult.severity === "high"
                              ? "text-red-500"
                              : analysisResult.severity === "medium"
                                ? "text-yellow-500"
                                : "text-green-500"
                          }`}
                        />
                        <div>
                          <h3 className="text-xl font-bold">{analysisResult.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{analysisResult.type} Disease</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-sm text-blue-600 font-medium">{t.confidence}</div>
                          <div className="text-2xl font-bold text-blue-700">{analysisResult.confidence}%</div>
                        </div>
                        <div
                          className={`p-3 rounded-lg ${
                            analysisResult.severity === "high"
                              ? "bg-red-50"
                              : analysisResult.severity === "medium"
                                ? "bg-yellow-50"
                                : "bg-green-50"
                          }`}
                        >
                          <div
                            className={`text-sm font-medium ${
                              analysisResult.severity === "high"
                                ? "text-red-600"
                                : analysisResult.severity === "medium"
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }`}
                          >
                            {t.severity}
                          </div>
                          <div
                            className={`text-2xl font-bold capitalize ${
                              analysisResult.severity === "high"
                                ? "text-red-700"
                                : analysisResult.severity === "medium"
                                  ? "text-yellow-700"
                                  : "text-green-700"
                            }`}
                          >
                            {analysisResult.severity}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Target className="h-4 w-4 text-orange-500" />
                          Key Symptoms Detected
                        </h4>
                        <div className="space-y-1">
                          {analysisResult.symptoms.slice(0, 3).map((symptom: string, index: number) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-2 text-sm"
                            >
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {symptom}
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() => setActiveTab("treatments")}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500"
                      >
                        View Treatment Options
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Microscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Upload an image to start AI analysis</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Disease Database */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  Disease Database
                </CardTitle>
                <div className="flex gap-4">
                  <Input
                    placeholder={t.searchDisease}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t.filterBy} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.allCrops}</SelectItem>
                      <SelectItem value="fungal">{t.diseaseTypes.fungal}</SelectItem>
                      <SelectItem value="bacterial">{t.diseaseTypes.bacterial}</SelectItem>
                      <SelectItem value="viral">{t.diseaseTypes.viral}</SelectItem>
                      <SelectItem value="pest">{t.diseaseTypes.pest}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDiseases.map((disease, index) => (
                    <motion.div
                      key={disease.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="cursor-pointer"
                      onClick={() => setSelectedDisease(disease)}
                    >
                      <Card className="h-full border-2 border-transparent hover:border-blue-300 transition-all">
                        <CardContent className="p-4">
                          <img
                            src={disease.image || "/placeholder.svg"}
                            alt={disease.name}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                          <h3 className="font-bold text-lg mb-2">{disease.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {disease.type}
                            </Badge>
                            <Badge
                              variant={
                                disease.severity === "high"
                                  ? "destructive"
                                  : disease.severity === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {disease.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">Affects: {disease.crops.join(", ")}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm">{disease.successRate}%</span>
                            </div>
                            <div className="text-sm text-gray-500">{disease.confidence}% confidence</div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Treatments Tab */}
        <TabsContent value="treatments" className="space-y-6">
          {selectedDisease ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Disease Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedDisease.image || "/placeholder.svg"}
                      alt={selectedDisease.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <CardTitle className="text-2xl">{selectedDisease.name}</CardTitle>
                      <p className="text-gray-600 capitalize">{selectedDisease.type} Disease</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={
                            selectedDisease.severity === "high"
                              ? "destructive"
                              : selectedDisease.severity === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {selectedDisease.severity} severity
                        </Badge>
                        <Badge variant="outline">{selectedDisease.successRate}% success rate</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Treatment Options */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Organic Treatments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <Leaf className="h-5 w-5" />
                      {t.organicTreatment}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedDisease.organicTreatments.map((treatment: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-green-200 rounded-lg p-4 bg-green-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-green-800">{treatment.name}</h4>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {treatment.effectiveness}% effective
                          </Badge>
                        </div>
                        <p className="text-sm text-green-700 mb-3">{treatment.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-medium text-green-600">Cost:</span>
                            <div className="text-green-800">{treatment.cost}</div>
                          </div>
                          <div>
                            <span className="font-medium text-green-600">Impact:</span>
                            <div className="text-green-800">{treatment.environmentalImpact}</div>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-green-600">
                          <strong>Application:</strong> {treatment.application}
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>

                {/* Inorganic Treatments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <Zap className="h-5 w-5" />
                      {t.inorganicTreatment}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedDisease.inorganicTreatments.map((treatment: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-blue-200 rounded-lg p-4 bg-blue-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-blue-800">{treatment.name}</h4>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {treatment.effectiveness}% effective
                          </Badge>
                        </div>
                        <p className="text-sm text-blue-700 mb-3">{treatment.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-medium text-blue-600">Cost:</span>
                            <div className="text-blue-800">{treatment.cost}</div>
                          </div>
                          <div>
                            <span className="font-medium text-blue-600">Impact:</span>
                            <div className="text-blue-800">{treatment.environmentalImpact}</div>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-blue-600">
                          <strong>Application:</strong> {treatment.application}
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Treatment Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Treatment Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                        <h4 className="font-bold text-green-800 mb-2">Organic Benefits</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Environmentally friendly</li>
                          <li>• Safe for beneficial insects</li>
                          <li>• No chemical residues</li>
                          <li>• Lower cost options</li>
                        </ul>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                        <h4 className="font-bold text-blue-800 mb-2">Inorganic Benefits</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Higher effectiveness</li>
                          <li>• Faster results</li>
                          <li>• Longer protection</li>
                          <li>• Consistent performance</li>
                        </ul>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                        <h4 className="font-bold text-purple-800 mb-2">Recovery Stats</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Recovery Time:</span>
                            <span className="font-medium">{selectedDisease.recoveryTime}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Success Rate:</span>
                            <span className="font-medium">{selectedDisease.successRate}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <FlaskConical className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">No Disease Selected</h3>
              <p className="text-gray-500">Select a disease from the diagnosis tab to view treatment options</p>
              <Button onClick={() => setActiveTab("diagnosis")} className="mt-4">
                Go to Diagnosis
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Prevention Tab */}
        <TabsContent value="prevention" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* General Prevention */}
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Shield className="h-5 w-5" />
                  General Prevention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Use disease-resistant varieties",
                  "Maintain proper plant spacing",
                  "Ensure good air circulation",
                  "Practice crop rotation",
                  "Remove infected plant debris",
                  "Monitor plants regularly",
                ].map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 p-2 bg-green-50 rounded-lg"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-green-800">{tip}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Environmental Control */}
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Sun className="h-5 w-5" />
                  Environmental Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Optimize irrigation timing",
                  "Control humidity levels",
                  "Provide adequate sunlight",
                  "Maintain soil pH balance",
                  "Improve drainage systems",
                  "Use mulching techniques",
                ].map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg"
                  >
                    <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm text-blue-800">{tip}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Biological Control */}
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Bug className="h-5 w-5" />
                  Biological Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Encourage beneficial insects",
                  "Use companion planting",
                  "Apply beneficial microorganisms",
                  "Maintain biodiversity",
                  "Use natural predators",
                  "Implement IPM strategies",
                ].map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg"
                  >
                    <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0" />
                    <span className="text-sm text-purple-800">{tip}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Prevention Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Seasonal Prevention Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  {
                    season: "Spring",
                    color: "green",
                    tasks: ["Soil preparation", "Seed treatment", "Early monitoring"],
                  },
                  {
                    season: "Summer",
                    color: "yellow",
                    tasks: ["Regular inspection", "Water management", "Pest control"],
                  },
                  {
                    season: "Monsoon",
                    color: "blue",
                    tasks: ["Drainage check", "Fungicide spray", "Disease monitoring"],
                  },
                  {
                    season: "Winter",
                    color: "purple",
                    tasks: ["Field sanitation", "Equipment cleaning", "Planning next season"],
                  },
                ].map((season, index) => (
                  <motion.div
                    key={season.season}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-${season.color}-50 border-2 border-${season.color}-200 rounded-lg p-4`}
                  >
                    <h4 className={`font-bold text-${season.color}-800 mb-3`}>{season.season}</h4>
                    <ul className="space-y-2">
                      {season.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className={`text-sm text-${season.color}-700 flex items-center gap-2`}>
                          <div className={`w-2 h-2 bg-${season.color}-500 rounded-full`} />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experts Tab */}
        <TabsContent value="experts" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {mockExperts.map((expert, index) => (
              <motion.div
                key={expert.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="h-full border-2 border-transparent hover:border-blue-300 transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={expert.image || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                          {expert.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{expert.name}</CardTitle>
                        <p className="text-gray-600">{expert.specialization}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(expert.rating) ? "text-yellow-500 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-1">{expert.rating}</span>
                          </div>
                          <Badge variant={expert.availability === "Available" ? "default" : "secondary"}>
                            {expert.availability}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Experience:</span>
                        <div className="text-gray-800">{expert.experience}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Consultations:</span>
                        <div className="text-gray-800">{expert.consultations}</div>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-600 text-sm">Languages:</span>
                      <div className="flex gap-1 mt-1">
                        {expert.languages.map((lang, langIndex) => (
                          <Badge key={langIndex} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" disabled={expert.availability !== "Available"}>
                        <Video className="h-4 w-4 mr-2" />
                        Video Call
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Expert Consultation Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Expert Consultation Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Total Experts", value: "50+", icon: Award, color: "blue" },
                  { label: "Avg Response Time", value: "< 2 hrs", icon: Clock, color: "green" },
                  { label: "Success Rate", value: "94%", icon: TrendingUp, color: "purple" },
                  { label: "Satisfied Farmers", value: "10K+", icon: Heart, color: "red" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.5 }}
                      className={`w-12 h-12 bg-${stat.color}-100 text-${stat.color}-600 rounded-full flex items-center justify-center mx-auto mb-3`}
                    >
                      <stat.icon className="h-6 w-6" />
                    </motion.div>
                    <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {[
              {
                date: "2024-01-15",
                disease: "Late Blight",
                crop: "Tomato",
                treatment: "Organic - Copper Sulfate",
                status: "Recovered",
                duration: "2 weeks",
              },
              {
                date: "2024-01-10",
                disease: "Powdery Mildew",
                crop: "Cucumber",
                treatment: "Organic - Milk Spray",
                status: "In Progress",
                duration: "1 week",
              },
              {
                date: "2024-01-05",
                disease: "Root Rot",
                crop: "Pepper",
                treatment: "Inorganic - Metalaxyl",
                status: "Recovered",
                duration: "3 weeks",
              },
            ].map((record, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01, x: 5 }}
              >
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-500">{record.date}</div>
                          <div className="text-xs text-gray-400">{record.duration}</div>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{record.disease}</h4>
                          <p className="text-gray-600">Crop: {record.crop}</p>
                          <p className="text-sm text-gray-500">Treatment: {record.treatment}</p>
                        </div>
                      </div>
                      <Badge variant={record.status === "Recovered" ? "default" : "secondary"}>{record.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Treatment Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-600" />
                Treatment Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">85%</div>
                  <div className="text-sm text-gray-600">Organic Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">95%</div>
                  <div className="text-sm text-gray-600">Inorganic Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">2.1</div>
                  <div className="text-sm text-gray-600">Avg Recovery Weeks</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
