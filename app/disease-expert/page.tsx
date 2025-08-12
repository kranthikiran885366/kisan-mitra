"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { 
  Upload, Image as ImageIcon, Camera, X, Check, AlertTriangle, Loader2, 
  ArrowLeft, Download, Share2, BookOpen, MapPin, Calendar, Thermometer, 
  Droplets, Wind, Sun, Phone, MessageCircle, Bell, Search, Filter, Star, 
  Heart, Eye, TrendingUp, Clock, Shield, Leaf, Bug, Sprout, CheckCircle2, 
  AlertCircle, ChevronRight, ExternalLink, Info, Plus, Minus, Maximize2, 
  RefreshCw, ChevronDown, ChevronUp, HelpCircle, ShieldCheck, Share,
  AlertOctagon, CircleCheck, CircleX, CircleAlert, ChevronLeft, ChevronsRight,
  Zap, Target, Brain, Sparkles, BarChart3, PieChart, Activity, Microscope,
  Database, FileText, Settings, Lock, Globe, Smartphone, Wifi, Cloud,
  Save, Edit, Copy, Bookmark, Grid, List, SortAsc, SortDesc, ArrowUp,
  ArrowDown, RotateCcw, ZoomIn, ZoomOut, Crop, Contrast, Palette,
  Mail, Send, VideoIcon, Mic, Volume2, Languages, Users, Award,
  TrendingDown, BarChart, LineChart, DollarSign, Package, Truck,
  Factory, Home, Building, Warehouse, ShoppingCart, CreditCard,
  Calculator, Percent, Timer, Gauge, Radar, Compass, Navigation,
  Route, Map, Layers, Mountain, Trees, Waves, CloudRain, Sunset,
  Sunrise, Moon, CloudSnow, CloudLightning, Snowflake, Rainbow
} from "lucide-react"
import Image from "next/image"
import { diseaseApi } from "@/lib/diseaseApi"
import { toast } from "sonner"
import VoiceAssistant from "@/components/voice-assistant"

const translations = {
  en: {
    title: "Crop Disease Expert",
    uploadTitle: "Upload Crop Image",
    uploadDescription: "Upload an image of your crop to diagnose any diseases or pests using advanced AI technology.",
    takePhoto: "Take Photo",
    uploadFromDevice: "Upload from Device",
    or: "OR",
    recentScans: "Recent Scans",
    noRecentScans: "No recent scans found.",
    scanNow: "Scan Now",
    backToDashboard: "Back to Dashboard",
    analyzing: "Analyzing your image...",
    results: "Analysis Results",
    possibleDiseases: "Possible Diseases",
    treatment: "Recommended Treatment",
    accuracy: "Confidence",
    prevention: "Prevention Tips",
    organic: "Organic",
    chemical: "Chemical",
    cultural: "Cultural",
    biological: "Biological",
    similarImages: "Similar Cases",
    severity: "Severity",
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    weather: "Weather Impact",
    expert: "Consult Expert",
    saveReport: "Save Report",
    shareResults: "Share Results",
    searchDisease: "Search Disease",
    filterCrops: "Filter by Crop",
    emergencyContact: "Emergency Contact",
    notifications: "Notifications",
    favourites: "Favourites",
    trending: "Trending Issues",
    history: "Scan History",
    settings: "Settings",
    advancedScan: "Advanced Scan",
    quickScan: "Quick Scan",
    batchScan: "Batch Scan",
    realTimeMonitoring: "Real-time Monitoring",
    aiInsights: "AI Insights",
    predictiveAnalysis: "Predictive Analysis",
    cropHealth: "Crop Health Score",
    riskAssessment: "Risk Assessment",
    treatmentPlan: "Treatment Plan",
    followUpReminders: "Follow-up Reminders",
    expertConsultation: "Expert Consultation",
    communityForum: "Community Forum",
    knowledgeBase: "Knowledge Base",
    researchPapers: "Research Papers",
    latestNews: "Latest News",
    diagnosticTools: "Diagnostic Tools",
    imageEnhancement: "Image Enhancement",
    multipleViews: "Multiple Views",
    3dModeling: "3D Modeling",
    timelapseAnalysis: "Timelapse Analysis",
    comparativeAnalysis: "Comparative Analysis",
    seasonalTrends: "Seasonal Trends",
    geographicHotspots: "Geographic Hotspots",
    pestCalendar: "Pest Calendar",
    diseaseOutbreaks: "Disease Outbreaks",
    earlyWarning: "Early Warning System",
    satelliteData: "Satellite Data",
    droneIntegration: "Drone Integration",
    iotSensors: "IoT Sensors",
    weatherIntegration: "Weather Integration",
    marketImpact: "Market Impact",
    economicAnalysis: "Economic Analysis",
    costBenefit: "Cost-Benefit Analysis",
    sustainablePractices: "Sustainable Practices",
    organicSolutions: "Organic Solutions",
    integratedPestManagement: "Integrated Pest Management",
    biologicalControl: "Biological Control",
    cropRotation: "Crop Rotation",
    soilHealth: "Soil Health",
    nutrientDeficiency: "Nutrient Deficiency",
    waterStress: "Water Stress",
    yieldPrediction: "Yield Prediction",
    qualityAssessment: "Quality Assessment",
    harvestOptimization: "Harvest Optimization",
    postHarvestCare: "Post-harvest Care",
    storageAdvice: "Storage Advice",
    transportationTips: "Transportation Tips",
    marketTiming: "Market Timing",
    priceForecasting: "Price Forecasting",
    supplyChain: "Supply Chain",
    certification: "Certification",
    qualityStandards: "Quality Standards",
    exportRequirements: "Export Requirements",
    regulatoryCompliance: "Regulatory Compliance",
    safetyProtocols: "Safety Protocols",
    training: "Training",
    education: "Education",
    workshops: "Workshops",
    webinars: "Webinars",
    documentation: "Documentation",
    reports: "Reports",
    analytics: "Analytics",
    dashboard: "Dashboard",
    statistics: "Statistics",
    performance: "Performance",
    benchmarking: "Benchmarking",
    kpis: "Key Performance Indicators",
    roi: "Return on Investment",
    productivity: "Productivity",
    efficiency: "Efficiency",
    sustainability: "Sustainability",
    environmental: "Environmental Impact",
    carbonFootprint: "Carbon Footprint",
    biodiversity: "Biodiversity",
    ecosystem: "Ecosystem Health",
    climateAdaptation: "Climate Adaptation",
    resilience: "Resilience Building",
    riskMitigation: "Risk Mitigation",
    insurance: "Insurance",
    financing: "Financing",
    subsidies: "Subsidies",
    grants: "Grants",
    support: "Support Programs",
    networking: "Networking",
    partnerships: "Partnerships",
    collaboration: "Collaboration",
    innovation: "Innovation",
    research: "Research & Development",
    technology: "Technology Integration",
    automation: "Automation",
    precision: "Precision Agriculture",
    digitalization: "Digitalization",
    dataScience: "Data Science",
    machineLearning: "Machine Learning",
    artificialIntelligence: "Artificial Intelligence",
    imageProcessing: "Image Processing",
    patternRecognition: "Pattern Recognition",
    deepLearning: "Deep Learning",
    neuralNetworks: "Neural Networks",
    computerVision: "Computer Vision",
    algorithmOptimization: "Algorithm Optimization",
    modelAccuracy: "Model Accuracy",
    validationMetrics: "Validation Metrics",
    crossValidation: "Cross Validation",
    dataAugmentation: "Data Augmentation",
    featureExtraction: "Feature Extraction",
    classification: "Classification",
    detection: "Detection",
    segmentation: "Segmentation",
    localization: "Localization",
    quantification: "Quantification",
    measurement: "Measurement",
    calibration: "Calibration",
    standardization: "Standardization",
    normalization: "Normalization",
    preprocessing: "Preprocessing",
    postprocessing: "Postprocessing",
    optimization: "Optimization",
    enhancement: "Enhancement",
    restoration: "Restoration",
    reconstruction: "Reconstruction",
    synthesis: "Synthesis",
    generation: "Generation",
    simulation: "Simulation",
    modeling: "Modeling",
    prediction: "Prediction",
    forecasting: "Forecasting",
    estimation: "Estimation",
    approximation: "Approximation",
    interpolation: "Interpolation",
    extrapolation: "Extrapolation"
  },
  hi: {
    title: "फसल रोग विशेषज्ञ",
    uploadTitle: "फसल की तस्वीर अपलोड करें",
    uploadDescription: "उन्नत AI तकनीक का उपयोग करके किसी भी बीमारी या कीटों का निदान करने के लिए अपनी फसल की तस्वीर अपलोड करें।",
    takePhoto: "फोटो लें",
    uploadFromDevice: "डिवाइस से अपलोड करें",
    or: "या",
    recentScans: "हाल की स्कैन",
    noRecentScans: "कोई हाल की स्कैन नहीं मिली।",
    scanNow: "अभी स्कैन करें",
    backToDashboard: "डैशबोर्ड पर वापस",
    analyzing: "आपकी तस्वीर का विश्लेषण कर रहे हैं...",
    results: "विश्लेषण परिणाम",
    possibleDiseases: "संभावित रोग",
    treatment: "अनुशंसित उपचार",
    accuracy: "विश्वसनीयता",
    prevention: "रोकथाम के उपाय",
    organic: "जैविक",
    chemical: "रासायनिक",
    cultural: "सांस्कृतिक",
    biological: "जैविक नियंत्रण",
    similarImages: "समान मामले",
    severity: "गंभीरता",
    low: "कम",
    medium: "मध्यम",
    high: "उच्च",
    critical: "गंभीर",
    weather: "मौसम प्रभाव",
    expert: "विशेषज्ञ से सलाह",
    saveReport: "रिपोर्ट सेव करें",
    shareResults: "परिणाम साझा करें",
    searchDisease: "रोग खोजें",
    filterCrops: "फसल के अनुसार फिल्टर करें",
    emergencyContact: "आपातकालीन संपर्क",
    notifications: "सूचनाएं",
    favourites: "पसंदीदा",
    trending: "ट्रेंडिंग समस्याएं",
    history: "स्कैन इतिहास",
    settings: "सेटिंग्स",
    advancedScan: "उन्नत स्कैन",
    quickScan: "त्वरित स्कैन",
    batchScan: "बैच स्कैन",
    realTimeMonitoring: "वास्तविक समय निगरानी",
    aiInsights: "AI अंतर्दृष्टि",
    predictiveAnalysis: "भविष्यवाणी विश्लेषण",
    cropHealth: "फसल स्वास्थ्य स्कोर",
    riskAssessment: "जोखिम मूल्यांकन",
    treatmentPlan: "उपचार योजना",
    followUpReminders: "फॉलो-अप रिमाइंडर",
    expertConsultation: "विशेषज्ञ परामर्श",
    communityForum: "समुदायिक मंच"
  },
  te: {
    title: "పంట వ్యాధి నిపుణుడు",
    uploadTitle: "పంట చిత్రాన్ని అప్‌లోడ్ చేయండి",
    uploadDescription: "అధునాతన AI సాంకేతికతను ఉపయోగించి ఏదైనా వ్యాధులు లేదా కీటకాలను నిర్ధారించడానికి మీ పంట చిత్రాన్ని అప్‌లోడ్ చేయండి।",
    takePhoto: "ఫోటో తీయండి",
    uploadFromDevice: "పరికరం నుండి అప్‌లోడ్ చేయండి",
    or: "లేదా",
    recentScans: "ఇటీవలి స్కాన్‌లు",
    noRecentScans: "ఇటీవలి స్కాన్‌లు కనుగొనబడలేదు।",
    scanNow: "ఇప్పుడు స్కాన్ చేయండి",
    backToDashboard: "డాష్‌బోర్డ్‌కు తిరిగి",
    analyzing: "మీ చిత్రాన్ని విశ్లేషిస్��ున్నాము...",
    results: "విశ్లేషణ ఫలితాలు",
    possibleDiseases: "సంభావ్య వ్యాధులు",
    treatment: "సిఫార్సు చేయబడిన చికిత్స",
    accuracy: "విశ్వసనీయత",
    prevention: "నివారణ చిట్కాలు",
    organic: "సేంద్రీయ",
    chemical: "రసాయనిక",
    cultural: "సాంస్కృతిక",
    biological: "జీవసంబంధమైన",
    similarImages: "సారూప్య కేసులు",
    severity: "తీవ్రత",
    low: "తక్కువ",
    medium: "మధ్యమ",
    high: "అధిక",
    critical: "క్లిష్టమైన",
    weather: "వాతావరణ ప్రభావం",
    expert: "నిపుణుడిని సంప్రదించండి",
    saveReport: "నివేదికను సేవ్ చేయండి",
    shareResults: "ఫలితాలను పంచుకోండి",
    searchDisease: "వ్యాధిని వెతకండి",
    filterCrops: "పంట ద్వారా ఫిల్టర్ చేయండి",
    emergencyContact: "అత్యవసర సంప్రదింపు",
    notifications: "నోటిఫికేషన్‌లు",
    favourites: "ఇష్టమైనవి",
    trending: "ట్రెండింగ్ సమస్యలు",
    history: "స్కాన్ చరిత్ర",
    settings: "సెట్టింగ్‌లు"
  }
}

// Enhanced disease data with more comprehensive information
const enhancedDiseaseDatabase = [
  {
    id: 1,
    name: "Late Blight",
    namePi: "लेट ब्लाइट",
    nameTe: "లేట్ బ్లైట్",
    crop: "Potato",
    severity: "high",
    confidence: 92,
    description: "A serious fungal disease affecting potato crops, caused by Phytophthora infestans",
    scientificName: "Phytophthora infestans",
    pathogenType: "Fungus",
    symptoms: ["Dark spots on leaves", "White fungal growth", "Stem rot", "Tuber blight", "Water-soaked lesions"],
    causes: ["High humidity", "Cool temperatures", "Poor air circulation", "Infected seed material"],
    treatments: {
      organic: ["Copper-based fungicides", "Proper drainage", "Crop rotation", "Resistant varieties", "Neem oil spray"],
      chemical: ["Metalaxyl", "Chlorothalonil", "Propamocarb", "Cymoxanil", "Dimethomorph"],
      cultural: ["Remove infected plants", "Improve air circulation", "Avoid overhead watering", "Hill potatoes properly"],
      biological: ["Bacillus subtilis", "Trichoderma harzianum", "Beneficial bacteria applications"]
    },
    prevention: ["Use resistant varieties", "Maintain proper spacing", "Monitor weather conditions", "Proper crop rotation"],
    weatherImpact: "High humidity (>90%) and moderate temperatures (15-20°C) favor disease development",
    economicImpact: "Can cause 10-100% yield loss if untreated",
    geographicDistribution: ["Worldwide", "Temperate regions", "High altitude areas"],
    hostRange: ["Potato", "Tomato", "Other Solanaceae"],
    lifecycle: "7-14 days from infection to sporulation",
    diagnosticFeatures: ["Water-soaked lesions", "White sporangia on leaf undersides", "Distinctive odor"],
    differentialDiagnosis: ["Early blight", "Bacterial soft rot", "Frost damage"],
    resistanceGenes: ["R1", "R2", "R3a", "R3b", "R4", "R5", "R6", "R7", "R8", "R9", "R10", "R11"],
    managementStrategy: "Integrated approach combining resistant varieties, fungicide applications, and cultural practices",
    researchReferences: ["10.1094/PHYTO-95-0370", "10.1146/annurev.phyto.42.040803.140401"],
    expertNotes: "Monitor weather conditions closely and apply preventive fungicides before infection periods",
    image: "/api/placeholder/300/200",
    additionalImages: ["/api/placeholder/200/150", "/api/placeholder/200/150", "/api/placeholder/200/150"],
    riskFactors: ["Dense planting", "Poor drainage", "History of disease", "Susceptible varieties"],
    seasonality: "Most common during monsoon season",
    detectionMethods: ["Visual inspection", "Molecular diagnostics", "Spore trapping", "Weather-based models"],
    monitoringSchedule: "Weekly during high-risk periods",
    treatmentTimeline: "Immediate action required upon detection",
    followUpActions: ["Continue monitoring", "Adjust irrigation", "Plan for next season"],
    costOfTreatment: "$50-150 per hectare",
    yieldLossEstimate: "20-80% without treatment",
    qualityImpact: "Severe reduction in marketable yield",
    sustainabilityScore: 6.5,
    organicApproval: true,
    regulatoryStatus: "Registered pesticides available",
    safetyPrecautions: ["Use protective equipment", "Follow label instructions", "Avoid drift"],
    environmentalImpact: "Moderate impact with proper application",
    resistanceManagement: "Rotate fungicide modes of action"
  },
  {
    id: 2,
    name: "Aphid Infestation",
    namePi: "माहू संक्रमण",
    nameTe: "అఫిడ్ సంక్రమణ",
    crop: "Wheat",
    severity: "medium",
    confidence: 87,
    description: "Small insects that suck plant sap, weakening plants and transmitting viruses",
    scientificName: "Rhopalosiphum padi",
    pathogenType: "Insect",
    symptoms: ["Curled leaves", "Sticky honeydew", "Yellowing", "Stunted growth", "Sooty mold"],
    causes: ["Warm weather", "High nitrogen", "Water stress", "Nearby weed hosts"],
    treatments: {
      organic: ["Neem oil", "Ladybug release", "Soap spray", "Reflective mulch", "Companion planting"],
      chemical: ["Imidacloprid", "Thiamethoxam", "Acetamiprid", "Spirotetramat", "Pymetrozine"],
      cultural: ["Remove weeds", "Avoid excess nitrogen", "Use resistant varieties", "Proper irrigation"],
      biological: ["Predatory insects", "Parasitic wasps", "Entomopathogenic fungi", "Banker plants"]
    },
    prevention: ["Regular monitoring", "Beneficial insects", "Healthy soil", "Crop rotation"],
    weatherImpact: "Warm, dry conditions (20-25°C) promote rapid reproduction",
    economicImpact: "5-25% yield loss depending on infestation level",
    geographicDistribution: ["Worldwide", "Temperate and tropical regions"],
    hostRange: ["Wheat", "Barley", "Oats", "Rye", "Corn"],
    lifecycle: "7-10 days generation time in optimal conditions",
    diagnosticFeatures: ["Small green/black insects", "Honeydew presence", "Ant association"],
    differentialDiagnosis: ["Other aphid species", "Scale insects", "Whiteflies"],
    resistanceGenes: ["Dn1", "Dn2", "Dn3", "Dn4", "Dn5", "Dn6", "Dn7"],
    managementStrategy: "Economic threshold-based integrated pest management",
    researchReferences: ["10.1603/0022-0493-95.6.1296", "10.1146/annurev.ento.52.110405.091407"],
    expertNotes: "Monitor for natural enemies before applying insecticides",
    image: "/api/placeholder/300/200",
    additionalImages: ["/api/placeholder/200/150", "/api/placeholder/200/150"],
    riskFactors: ["High nitrogen fertilization", "Water stress", "Dense planting"],
    seasonality: "Peak populations in spring and fall",
    detectionMethods: ["Visual counts", "Yellow sticky traps", "Suction sampling"],
    monitoringSchedule: "Twice weekly during peak season",
    treatmentTimeline: "Treat when threshold exceeded",
    followUpActions: ["Monitor natural enemies", "Assess crop damage"],
    costOfTreatment: "$25-75 per hectare",
    yieldLossEstimate: "5-25% depending on timing",
    qualityImpact: "Reduced grain quality and weight",
    sustainabilityScore: 7.8,
    organicApproval: true,
    regulatoryStatus: "Multiple registered options",
    safetyPrecautions: ["Protect beneficial insects", "Follow PHI"],
    environmentalImpact: "Low with selective products",
    resistanceManagement: "Rotate insecticide classes"
  },
  {
    id: 3,
    name: "Downy Mildew",
    namePi: "डाउनी मिल्ड्यू",
    nameTe: "డౌనీ మిల్డ్యూ",
    crop: "Grape",
    severity: "high",
    confidence: 94,
    description: "Fungal disease causing significant losses in grape production",
    scientificName: "Plasmopara viticola",
    pathogenType: "Oomycete",
    symptoms: ["Yellow oil spots", "White downy growth", "Leaf necrosis", "Berry shrivel", "Defoliation"],
    causes: ["High humidity", "Warm temperatures", "Free moisture", "Dense canopy"],
    treatments: {
      organic: ["Copper sulfate", "Potassium bicarbonate", "Canopy management", "Resistant rootstocks"],
      chemical: ["Mancozeb", "Copper hydroxide", "Fosetyl-aluminum", "Cymoxanil"],
      cultural: ["Pruning for air circulation", "Avoid overhead irrigation", "Remove fallen leaves"],
      biological: ["Trichoderma species", "Bacillus subtilis", "Beneficial microorganisms"]
    },
    prevention: ["Use resistant varieties", "Proper vine spacing", "Canopy management", "Weather monitoring"],
    weatherImpact: "Requires 6+ hours of leaf wetness and temperatures 20-25°C",
    economicImpact: "Can cause 20-50% yield loss in favorable conditions",
    geographicDistribution: ["Europe", "North America", "Mediterranean", "Australia"],
    hostRange: ["Vitis vinifera", "Wild grape species", "American grape species"],
    lifecycle: "Primary and secondary infection cycles",
    diagnosticFeatures: ["Oil spot symptoms", "White sporulation", "Systemic spread"],
    differentialDiagnosis: ["Powdery mildew", "Black rot", "Anthracnose"],
    resistanceGenes: ["Rpv1", "Rpv2", "Rpv3", "Rpv4", "Rpv10", "Rpv12"],
    managementStrategy: "Preventive fungicide program with resistance management",
    researchReferences: ["10.1094/PDIS-11-19-2442-RE", "10.1146/annurev-phyto-080508-081748"],
    expertNotes: "Critical to start preventive applications before bloom",
    image: "/api/placeholder/300/200",
    riskFactors: ["Dense canopy", "Poor drainage", "Susceptible varieties"],
    seasonality: "Spring through early fall",
    detectionMethods: ["Visual symptoms", "Spore monitoring", "Weather models"],
    treatmentTimeline: "Preventive applications starting at 10cm shoot growth",
    sustainabilityScore: 6.0,
    organicApproval: true
  }
]

// Enhanced weather data with more parameters
const enhancedWeatherData = {
  current: {
    temperature: 28,
    humidity: 65,
    rainfall: 12,
    windSpeed: 8,
    windDirection: "NE",
    pressure: 1013,
    uvIndex: 7,
    visibility: 10,
    cloudCover: 45,
    dewPoint: 18,
    feltTemperature: 31
  },
  forecast: [
    { day: "Today", temp: 28, humidity: 65, rain: 20, wind: 8, condition: "Partly Cloudy" },
    { day: "Tomorrow", temp: 30, humidity: 70, rain: 40, wind: 12, condition: "Cloudy" },
    { day: "Day 3", temp: 26, humidity: 80, rain: 80, wind: 15, condition: "Rainy" },
    { day: "Day 4", temp: 24, humidity: 85, rain: 60, wind: 10, condition: "Overcast" },
    { day: "Day 5", temp: 27, humidity: 60, rain: 10, wind: 8, condition: "Sunny" }
  ],
  alerts: [
    { type: "high-humidity", message: "High humidity may favor fungal diseases", severity: "medium" },
    { type: "rain-forecast", message: "Heavy rain expected in 2 days", severity: "high" },
    { type: "temperature-change", message: "Temperature drop may slow pest development", severity: "low" }
  ],
  diseaseRisk: {
    lateBlight: { risk: "high", factors: ["High humidity", "Moderate temperature"] },
    powderyMildew: { risk: "medium", factors: ["Moderate humidity", "Warm temperature"] },
    aphids: { risk: "low", factors: ["Increasing winds", "Beneficial insect activity"] }
  }
}

// Enhanced trending issues
const enhancedTrendingIssues = [
  { 
    disease: "Brown Spot", 
    crop: "Rice", 
    cases: 145, 
    trend: "up",
    region: "East India",
    severity: "medium",
    economicImpact: "$2.3M",
    affectedArea: "12,500 hectares"
  },
  { 
    disease: "Powdery Mildew", 
    crop: "Grape", 
    cases: 89, 
    trend: "down",
    region: "Maharashtra",
    severity: "low",
    economicImpact: "$1.1M",
    affectedArea: "8,200 hectares"
  },
  { 
    disease: "Leaf Curl", 
    crop: "Tomato", 
    cases: 67, 
    trend: "up",
    region: "Punjab",
    severity: "high",
    economicImpact: "$1.8M",
    affectedArea: "5,600 hectares"
  }
]

const cropTypes = [
  "All", "Rice", "Wheat", "Potato", "Tomato", "Cotton", "Maize", "Sugarcane", 
  "Grape", "Apple", "Mango", "Banana", "Onion", "Garlic", "Soybean", "Groundnut"
]

// New advanced features
const scanModes = [
  { id: 'quick', name: 'Quick Scan', icon: Zap, description: 'Fast basic analysis' },
  { id: 'advanced', name: 'Advanced Scan', icon: Microscope, description: 'Detailed comprehensive analysis' },
  { id: 'batch', name: 'Batch Scan', icon: Grid, description: 'Multiple images at once' },
  { id: 'monitoring', name: 'Real-time Monitoring', icon: Activity, description: 'Continuous monitoring setup' }
]

const imageEnhancements = [
  { id: 'brightness', name: 'Brightness', icon: Sun, min: -50, max: 50, default: 0 },
  { id: 'contrast', name: 'Contrast', icon: Contrast, min: -50, max: 50, default: 0 },
  { id: 'saturation', name: 'Saturation', icon: Palette, min: -50, max: 50, default: 0 },
  { id: 'sharpness', name: 'Sharpness', icon: Target, min: 0, max: 100, default: 50 }
]

// Types for enhanced functionality
interface EnhancedAnalysisResult {
  disease: any
  confidence: number
  cropHealthScore: number
  riskAssessment: {
    spreadRisk: number
    severityTrend: string
    economicImpact: string
  }
  treatmentPlan: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
  followUpSchedule: {
    nextCheck: string
    monitoring: string[]
    reminders: string[]
  }
  predictiveAnalysis: {
    weatherInfluence: string
    seasonalForecast: string
    resistanceRisk: number
  }
  expertRecommendation: string
  similarCases: any[]
  researchLinks: string[]
}

interface ScanSettings {
  mode: string
  sensitivity: number
  enhanceImage: boolean
  multipleAngles: boolean
  includeMetadata: boolean
  realTimeProcessing: boolean
}

export default function EnhancedCropDiseaseExpert() {
  // Enhanced state management
  const [activeTab, setActiveTab] = useState<'scan' | 'database' | 'weather' | 'trending' | 'history' | 'analytics' | 'research'>('scan')
  const [selectedCrop, setSelectedCrop] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCamera, setShowCamera] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [language, setLanguage] = useState<'en' | 'hi' | 'te'>('en')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisResults, setAnalysisResults] = useState<EnhancedAnalysisResult | null>(null)
  const [recentScans, setRecentScans] = useState<any[]>([])
  const [trendingDiseases, setTrendingDiseases] = useState(enhancedTrendingIssues)
  const [diseaseDatabase, setDiseaseDatabase] = useState(enhancedDiseaseDatabase)
  const [stats, setStats] = useState<any>(null)
  const [favourites, setFavourites] = useState<number[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [scanMode, setScanMode] = useState('quick')
  const [scanSettings, setScanSettings] = useState<ScanSettings>({
    mode: 'quick',
    sensitivity: 50,
    enhanceImage: true,
    multipleAngles: false,
    includeMetadata: true,
    realTimeProcessing: false
  })
  const [imageEnhancements, setImageEnhancements] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 50
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('confidence')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [expertMode, setExpertMode] = useState(false)
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(false)
  const [comparisonMode, setComparisonMode] = useState(false)
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([])
  const [timelapseMode, setTimelapseMode] = useState(false)
  const [batchProcessing, setBatchProcessing] = useState(false)
  const [aiInsightsEnabled, setAiInsightsEnabled] = useState(true)
  const [predictiveMode, setPredictiveMode] = useState(false)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  
  // Derived state
  const t = translations[language] as typeof translations.en

  // Enhanced image upload with multiple images support
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    const imageUrls = files.map(file => URL.createObjectURL(file))
    setSelectedImages(imageUrls)
    setCurrentImageIndex(0)
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    
    // Simulate progressive analysis
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)
    
    // Enhanced analysis simulation
    setTimeout(() => {
      const mockEnhancedResult: EnhancedAnalysisResult = {
        disease: enhancedDiseaseDatabase[0],
        confidence: 94.5,
        cropHealthScore: 72,
        riskAssessment: {
          spreadRisk: 78,
          severityTrend: "increasing",
          economicImpact: "Moderate to High ($150-300/hectare)"
        },
        treatmentPlan: {
          immediate: ["Apply copper-based fungicide", "Improve field drainage", "Remove infected plant debris"],
          shortTerm: ["Monitor weather conditions", "Adjust irrigation schedule", "Apply preventive treatments"],
          longTerm: ["Plan crop rotation", "Select resistant varieties", "Improve soil health"]
        },
        followUpSchedule: {
          nextCheck: "3 days",
          monitoring: ["Daily visual inspection", "Weather monitoring", "Soil moisture check"],
          reminders: ["Fungicide application in 7 days", "Progress assessment in 14 days"]
        },
        predictiveAnalysis: {
          weatherInfluence: "High humidity (70%+) expected to favor disease development",
          seasonalForecast: "Risk will increase during monsoon season",
          resistanceRisk: 25
        },
        expertRecommendation: "Immediate intervention required. Begin fungicide treatment and improve field conditions.",
        similarCases: enhancedDiseaseDatabase.slice(1, 4),
        researchLinks: [
          "Latest research on late blight management",
          "Integrated pest management strategies",
          "Climate-smart agriculture practices"
        ]
      }
      
      setAnalysisResults(mockEnhancedResult)
      setIsAnalyzing(false)
      setAnalysisProgress(100)
    }, 3000)
  }

  // Enhanced camera functionality
  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      })
      
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream
        cameraRef.current.play()
        setShowCamera(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error('Could not access camera. Please check permissions.')
    }
  }

  const capturePhoto = () => {
    if (!cameraRef.current || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const video = cameraRef.current
    const ctx = canvas.getContext('2d')
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob(async (blob) => {
        if (!blob) return
        
        const imageUrl = URL.createObjectURL(blob)
        setSelectedImages([imageUrl])
        setCurrentImageIndex(0)
        setShowCamera(false)
        setIsAnalyzing(true)
        
        // Stop camera stream
        const stream = video.srcObject as MediaStream
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
        }
        
        // Trigger analysis
        setTimeout(() => {
          setAnalysisResults({
            disease: enhancedDiseaseDatabase[0],
            confidence: 91.2,
            cropHealthScore: 68,
            riskAssessment: {
              spreadRisk: 65,
              severityTrend: "stable",
              economicImpact: "Low to Moderate ($50-150/hectare)"
            },
            treatmentPlan: {
              immediate: ["Monitor closely", "Ensure good drainage"],
              shortTerm: ["Apply preventive measures", "Improve air circulation"],
              longTerm: ["Plan resistant varieties", "Soil health improvement"]
            },
            followUpSchedule: {
              nextCheck: "5 days",
              monitoring: ["Visual inspection twice weekly"],
              reminders: ["Check weather forecast", "Monitor plant health"]
            },
            predictiveAnalysis: {
              weatherInfluence: "Current conditions moderately favorable for disease",
              seasonalForecast: "Low risk expected next month",
              resistanceRisk: 15
            },
            expertRecommendation: "Continue monitoring with preventive measures",
            similarCases: [],
            researchLinks: []
          } as EnhancedAnalysisResult)
          setIsAnalyzing(false)
        }, 2500)
      }, 'image/jpeg', 0.9)
    }
  }

  // Utility functions
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "text-green-600 bg-green-100 border-green-200"
      case "medium": return "text-yellow-600 bg-yellow-100 border-yellow-200"
      case "high": return "text-orange-600 bg-orange-100 border-orange-200"
      case "critical": return "text-red-600 bg-red-100 border-red-200"
      default: return "text-gray-600 bg-gray-100 border-gray-200"
    }
  }

  const getRiskColor = (risk: number) => {
    if (risk < 30) return "text-green-600 bg-green-100"
    if (risk < 60) return "text-yellow-600 bg-yellow-100"
    if (risk < 80) return "text-orange-600 bg-orange-100"
    return "text-red-600 bg-red-100"
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    if (score >= 40) return "text-orange-600"
    return "text-red-600"
  }

  // Filter and sort functions
  const filteredDiseases = diseaseDatabase.filter(disease => {
    const matchesCrop = selectedCrop === "All" || disease.crop === selectedCrop
    const matchesSearch = searchQuery === "" || 
      disease.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disease.crop.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeverity = filterSeverity === "all" || disease.severity === filterSeverity
    
    return matchesCrop && matchesSearch && matchesSeverity
  }).sort((a, b) => {
    switch (sortBy) {
      case 'confidence':
        return b.confidence - a.confidence
      case 'severity':
        const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 }
        return severityOrder[b.severity as keyof typeof severityOrder] - severityOrder[a.severity as keyof typeof severityOrder]
      case 'name':
        return a.name.localeCompare(b.name)
      case 'crop':
        return a.crop.localeCompare(b.crop)
      default:
        return 0
    }
  })

  // Toggle functions
  const toggleFavourite = (diseaseId: number) => {
    setFavourites(prev => 
      prev.includes(diseaseId) 
        ? prev.filter(id => id !== diseaseId)
        : [...prev, diseaseId]
    )
  }

  const toggleComparison = (imageUrl: string) => {
    setSelectedForComparison(prev => 
      prev.includes(imageUrl)
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl]
    )
  }

  // Advanced analysis functions
  const runBatchAnalysis = async () => {
    setBatchProcessing(true)
    // Simulate batch processing
    setTimeout(() => {
      setBatchProcessing(false)
      toast.success('Batch analysis completed')
    }, 5000)
  }

  const enableRealTimeMonitoring = () => {
    setRealTimeMonitoring(true)
    toast.success('Real-time monitoring enabled')
  }

  const exportResults = () => {
    if (!analysisResults) return
    
    const exportData = {
      timestamp: new Date().toISOString(),
      analysis: analysisResults,
      settings: scanSettings,
      language: language
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `disease-analysis-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Enhanced image processing
  const applyImageEnhancements = (imageData: ImageData) => {
    // This would normally apply actual image processing
    // For demo purposes, we'll just return the original data
    return imageData
  }

  useEffect(() => {
    // Load initial data
    const mockStats = {
      totalScans: 1247,
      accuracyRate: 94.3,
      diseasesDetected: 156,
      avgConfidence: 89.7,
      topDiseases: ["Late Blight", "Aphid Infestation", "Powdery Mildew"],
      monthlyTrend: [65, 72, 89, 94, 87, 91, 96],
      severityBreakdown: { low: 34, medium: 45, high: 18, critical: 3 }
    }
    setStats(mockStats)

    // Simulate some notifications
    setNotifications([
      { id: 1, type: 'alert', message: 'New disease outbreak detected in your region', time: '2 hours ago' },
      { id: 2, type: 'info', message: 'Weather conditions favor late blight development', time: '5 hours ago' },
      { id: 3, type: 'success', message: 'Your scan accuracy has improved to 96%', time: '1 day ago' }
    ])
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-xl border-b border-green-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="lg:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Microscope className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    {t.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                      AI Powered
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      v2.0 Enhanced
                    </Badge>
                    {realTimeMonitoring && (
                      <Badge variant="default" className="text-xs bg-blue-100 text-blue-800 animate-pulse">
                        <Activity className="h-3 w-3 mr-1" />
                        Live Monitoring
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Expert Mode Toggle */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="expert-mode" className="text-sm">Expert Mode</Label>
                <Switch
                  id="expert-mode"
                  checked={expertMode}
                  onCheckedChange={setExpertMode}
                />
              </div>

              {/* Notifications */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t.notifications}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-3 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className={`p-1 rounded-full ${
                            notification.type === 'alert' ? 'bg-red-100' :
                            notification.type === 'info' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            {notification.type === 'alert' ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
                             notification.type === 'info' ? <Info className="h-4 w-4 text-blue-600" /> :
                             <CheckCircle className="h-4 w-4 text-green-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              
              {/* Voice Assistant */}
              <VoiceAssistant
                language={language}
                pageTitle={t.title}
                size="sm"
              />

              {/* Language Selection */}
              <Select value={language} onValueChange={(value: 'en' | 'hi' | 'te') => setLanguage(value)}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇺🇸 EN</SelectItem>
                  <SelectItem value="hi">🇮🇳 हिं</SelectItem>
                  <SelectItem value="te">🇮🇳 తె</SelectItem>
                </SelectContent>
              </Select>

              {/* Settings */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t.settings}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Scan Settings</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sensitivity">AI Sensitivity</Label>
                          <div className="w-32">
                            <Slider
                              id="sensitivity"
                              min={0}
                              max={100}
                              step={1}
                              value={[scanSettings.sensitivity]}
                              onValueChange={(value) => setScanSettings(prev => ({ ...prev, sensitivity: value[0] }))}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="enhance">Auto-enhance Images</Label>
                          <Switch
                            id="enhance"
                            checked={scanSettings.enhanceImage}
                            onCheckedChange={(checked) => setScanSettings(prev => ({ ...prev, enhanceImage: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="metadata">Include Metadata</Label>
                          <Switch
                            id="metadata"
                            checked={scanSettings.includeMetadata}
                            onCheckedChange={(checked) => setScanSettings(prev => ({ ...prev, includeMetadata: checked }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Enhanced Navigation Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as any)} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-7 mb-6 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="scan" className="flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Scan</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Database</span>
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <span className="hidden sm:inline">Weather</span>
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trending</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Research</span>
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Scan Tab */}
          <TabsContent value="scan" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left Panel - Scan Controls */}
              <div className="xl:col-span-4 space-y-6">
                {/* Scan Mode Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Scan Mode
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {scanModes.map((mode) => (
                        <Button
                          key={mode.id}
                          variant={scanMode === mode.id ? "default" : "outline"}
                          onClick={() => setScanMode(mode.id)}
                          className="h-auto p-3 flex flex-col items-center gap-2"
                        >
                          <mode.icon className="h-5 w-5" />
                          <div className="text-center">
                            <div className="text-sm font-medium">{mode.name}</div>
                            <div className="text-xs text-gray-500">{mode.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Upload Section */}
                <Card className="border-2 border-dashed border-green-300 hover:border-green-400 transition-colors">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center space-x-2">
                      <Upload className="h-6 w-6 text-green-600" />
                      <span>{t.uploadTitle}</span>
                    </CardTitle>
                    <p className="text-gray-600">{t.uploadDescription}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedImages.length === 0 && !showCamera && (
                      <div className="space-y-4">
                        <Button 
                          onClick={handleCameraCapture}
                          className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        >
                          <Camera className="mr-2 h-5 w-5" />
                          {t.takePhoto}
                        </Button>
                        
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-300" />
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">{t.or}</span>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="w-full h-12 border-green-300 hover:bg-green-50"
                        >
                          <ImageIcon className="mr-2 h-5 w-5" />
                          {t.uploadFromDevice}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple={scanMode === 'batch'}
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    )}

                    {/* Camera View */}
                    {showCamera && (
                      <div className="space-y-4">
                        <video 
                          ref={cameraRef}
                          autoPlay
                          playsInline
                          className="w-full rounded-lg"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex space-x-2">
                          <Button onClick={capturePhoto} className="flex-1 bg-green-600 hover:bg-green-700">
                            <Camera className="mr-2 h-4 w-4" />
                            Capture
                          </Button>
                          <Button 
                            onClick={() => {
                              setShowCamera(false)
                              const stream = cameraRef.current?.srcObject as MediaStream
                              stream?.getTracks().forEach(track => track.stop())
                            }}
                            variant="outline"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Image Preview */}
                    {selectedImages.length > 0 && (
                      <div className="space-y-4">
                        <div className="relative">
                          <Image 
                            src={selectedImages[currentImageIndex]} 
                            alt="Selected crop" 
                            width={400}
                            height={300}
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          <Button
                            onClick={() => {
                              setSelectedImages([])
                              setAnalysisResults(null)
                            }}
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          
                          {/* Image navigation for multiple images */}
                          {selectedImages.length > 1 && (
                            <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-2">
                              {selectedImages.map((_, index) => (
                                <Button
                                  key={index}
                                  size="sm"
                                  variant={index === currentImageIndex ? "default" : "outline"}
                                  className="w-8 h-8 p-0"
                                  onClick={() => setCurrentImageIndex(index)}
                                >
                                  {index + 1}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Analysis Progress */}
                        {isAnalyzing && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-center space-x-2 p-4 bg-blue-50 rounded-lg">
                              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                              <span className="text-blue-600">{t.analyzing}</span>
                            </div>
                            <Progress value={analysisProgress} className="w-full" />
                            <div className="text-center text-sm text-gray-600">
                              {analysisProgress.toFixed(0)}% Complete
                            </div>
                          </div>
                        )}

                        {/* Batch processing controls */}
                        {scanMode === 'batch' && selectedImages.length > 1 && (
                          <div className="flex gap-2">
                            <Button 
                              onClick={runBatchAnalysis}
                              disabled={batchProcessing}
                              className="flex-1"
                            >
                              {batchProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Grid className="h-4 w-4 mr-2" />
                              )}
                              Analyze All ({selectedImages.length})
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => setComparisonMode(!comparisonMode)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Image Enhancement Controls */}
                {selectedImages.length > 0 && expertMode && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-purple-500" />
                        {t.imageEnhancement}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(imageEnhancements).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <div className="flex justify-between">
                              <Label className="capitalize">{key}</Label>
                              <span className="text-sm text-gray-500">{value}</span>
                            </div>
                            <Slider
                              value={[value]}
                              onValueChange={(newValue) => 
                                setImageEnhancements(prev => ({ ...prev, [key]: newValue[0] }))
                              }
                              min={key === 'sharpness' ? 0 : -50}
                              max={key === 'sharpness' ? 100 : 50}
                              step={1}
                            />
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setImageEnhancements({ brightness: 0, contrast: 0, saturation: 0, sharpness: 50 })}
                          className="w-full"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Center Panel - Results */}
              <div className="xl:col-span-5">
                {analysisResults && (
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span>{t.results}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => toggleFavourite(analysisResults.disease.id)}
                            variant="ghost"
                            size="sm"
                          >
                            <Heart 
                              className={`h-4 w-4 ${favourites.includes(analysisResults.disease.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                            />
                          </Button>
                          <Button
                            onClick={exportResults}
                            variant="ghost"
                            size="sm"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => alert('Share functionality coming soon!')}
                            variant="ghost"
                            size="sm"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Disease Identification */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-lg">
                            {language === "hi" && analysisResults.disease.namePi ? analysisResults.disease.namePi :
                             language === "te" && analysisResults.disease.nameTe ? analysisResults.disease.nameTe :
                             analysisResults.disease.name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(analysisResults.disease.severity)}`}>
                            {t[analysisResults.disease.severity as keyof typeof t]}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{analysisResults.disease.description}</p>
                        
                        {/* Enhanced metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{analysisResults.confidence.toFixed(1)}%</div>
                            <div className="text-xs text-gray-500">{t.accuracy}</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getHealthScoreColor(analysisResults.cropHealthScore)}`}>
                              {analysisResults.cropHealthScore}
                            </div>
                            <div className="text-xs text-gray-500">{t.cropHealth}</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getRiskColor(analysisResults.riskAssessment.spreadRisk)}`}>
                              {analysisResults.riskAssessment.spreadRisk}%
                            </div>
                            <div className="text-xs text-gray-500">Spread Risk</div>
                          </div>
                        </div>
                      </div>

                      {/* Risk Assessment */}
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <span>{t.riskAssessment}</span>
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Economic Impact</span>
                            <span className="text-sm font-medium">{analysisResults.riskAssessment.economicImpact}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Severity Trend</span>
                            <Badge variant={analysisResults.riskAssessment.severityTrend === 'increasing' ? 'destructive' : 'default'}>
                              {analysisResults.riskAssessment.severityTrend}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Symptoms */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Bug className="h-4 w-4 text-yellow-600" />
                          <span>Symptoms Detected</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisResults.disease.symptoms?.map((symptom: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Treatment Plan */}
                      <div>
                        <h4 className="font-medium mb-3">{t.treatmentPlan}</h4>
                        <Tabs defaultValue="immediate" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="immediate">Immediate</TabsTrigger>
                            <TabsTrigger value="shortTerm">Short-term</TabsTrigger>
                            <TabsTrigger value="longTerm">Long-term</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="immediate" className="mt-3">
                            <ul className="space-y-2">
                              {analysisResults.treatmentPlan.immediate.map((treatment, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-red-500" />
                                  <span className="text-sm">{treatment}</span>
                                </li>
                              ))}
                            </ul>
                          </TabsContent>
                          
                          <TabsContent value="shortTerm" className="mt-3">
                            <ul className="space-y-2">
                              {analysisResults.treatmentPlan.shortTerm.map((treatment, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-yellow-500" />
                                  <span className="text-sm">{treatment}</span>
                                </li>
                              ))}
                            </ul>
                          </TabsContent>
                          
                          <TabsContent value="longTerm" className="mt-3">
                            <ul className="space-y-2">
                              {analysisResults.treatmentPlan.longTerm.map((treatment, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <Target className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">{treatment}</span>
                                </li>
                              ))}
                            </ul>
                          </TabsContent>
                        </Tabs>
                      </div>

                      {/* Predictive Analysis */}
                      {expertMode && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Brain className="h-4 w-4 text-blue-600" />
                            <span>{t.predictiveAnalysis}</span>
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <h5 className="text-sm font-medium text-blue-800">Weather Influence</h5>
                              <p className="text-sm text-gray-600">{analysisResults.predictiveAnalysis.weatherInfluence}</p>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-blue-800">Seasonal Forecast</h5>
                              <p className="text-sm text-gray-600">{analysisResults.predictiveAnalysis.seasonalForecast}</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Resistance Risk</span>
                              <Badge variant={analysisResults.predictiveAnalysis.resistanceRisk > 50 ? 'destructive' : 'default'}>
                                {analysisResults.predictiveAnalysis.resistanceRisk}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Follow-up Schedule */}
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-600" />
                          <span>{t.followUpReminders}</span>
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Next Check</span>
                            <span className="text-sm font-medium">{analysisResults.followUpSchedule.nextCheck}</span>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-green-800 mb-1">Monitoring Tasks</h5>
                            <ul className="text-xs space-y-1">
                              {analysisResults.followUpSchedule.monitoring.map((task, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Expert Recommendation */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          <span>Expert Recommendation</span>
                        </h4>
                        <p className="text-sm text-gray-700">{analysisResults.expertRecommendation}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" className="flex-1 min-w-32">
                          <Save className="mr-2 h-4 w-4" />
                          {t.saveReport}
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 min-w-32">
                          <Share2 className="mr-2 h-4 w-4" />
                          {t.shareResults}
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 min-w-32">
                          <Phone className="mr-2 h-4 w-4" />
                          {t.expert}
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 min-w-32">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Discuss
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Panel - Similar Cases & Research */}
              <div className="xl:col-span-3 space-y-6">
                {/* Similar Cases */}
                {analysisResults && analysisResults.similarCases.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-blue-500" />
                        {t.similarImages}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysisResults.similarCases.slice(0, 3).map((similarCase, index) => (
                          <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Leaf className="h-6 w-6 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <h5 className="text-sm font-medium">{similarCase.name}</h5>
                                <p className="text-xs text-gray-500">{similarCase.crop}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {similarCase.confidence}% match
                                  </Badge>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(similarCase.severity)}`}>
                                    {similarCase.severity}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Research Links */}
                {analysisResults && analysisResults.researchLinks.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-purple-500" />
                        Research & Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysisResults.researchLinks.map((link, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start h-auto p-3 text-left"
                            onClick={() => alert('Research link functionality coming soon!')}
                          >
                            <div className="flex items-start gap-3">
                              <ExternalLink className="h-4 w-4 mt-0.5 text-purple-600" />
                              <div className="flex-1">
                                <div className="text-sm font-medium">{link}</div>
                                <div className="text-xs text-gray-500">Research Article</div>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={enableRealTimeMonitoring}
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Enable Monitoring
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => setActiveTab('weather')}
                      >
                        <Cloud className="h-4 w-4 mr-2" />
                        Check Weather Risk
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => setActiveTab('database')}
                      >
                        <Database className="h-4 w-4 mr-2" />
                        Browse Database
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => alert('Expert consultation booking coming soon!')}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Book Expert Call
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Enhanced Database Tab */}
          <TabsContent value="database" className="space-y-6">
            {/* Enhanced Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={t.searchDisease}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder={t.filterCrops} />
                  </SelectTrigger>
                  <SelectContent>
                    {cropTypes.map(crop => (
                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t pt-4 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confidence">Confidence</SelectItem>
                        <SelectItem value="severity">Severity</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="crop">Crop</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {filteredDiseases.length} results
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Disease Grid/List */}
            <div className={viewMode === 'grid' ? 
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : 
              "space-y-4"
            }>
              {filteredDiseases.map((disease, index) => (
                <motion.div
                  key={disease.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`hover:shadow-lg transition-all duration-300 ${
                    viewMode === 'list' ? 'flex flex-row items-center' : ''
                  }`}>
                    {viewMode === 'grid' ? (
                      <>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {language === "hi" && disease.namePi ? disease.namePi :
                               language === "te" && disease.nameTe ? disease.nameTe :
                               disease.name}
                            </CardTitle>
                            <Button
                              onClick={() => toggleFavourite(disease.id)}
                              variant="ghost"
                              size="sm"
                            >
                              <Heart 
                                className={`h-4 w-4 ${favourites.includes(disease.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                              />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{disease.crop}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(disease.severity)}`}>
                              {t[disease.severity as keyof typeof t]}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{disease.description}</p>
                          <div className="space-y-2">
                            <div className="text-xs">
                              <span className="font-medium">Symptoms: </span>
                              <span>{disease.symptoms.slice(0, 2).join(", ")}</span>
                              {disease.symptoms.length > 2 && "..."}
                            </div>
                            {expertMode && (
                              <div className="text-xs">
                                <span className="font-medium">Scientific Name: </span>
                                <span className="italic">{disease.scientificName}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </CardFooter>
                      </>
                    ) : (
                      <>
                        <div className="w-24 h-24 bg-gray-200 rounded-lg m-4 flex items-center justify-center flex-shrink-0">
                          <Leaf className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold">
                                {language === "hi" && disease.namePi ? disease.namePi :
                                 language === "te" && disease.nameTe ? disease.nameTe :
                                 disease.name}
                              </h3>
                              <p className="text-sm text-gray-600">{disease.crop}</p>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{disease.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(disease.severity)}`}>
                                  {t[disease.severity as keyof typeof t]}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {disease.confidence}% confidence
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                onClick={() => toggleFavourite(disease.id)}
                                variant="ghost"
                                size="sm"
                              >
                                <Heart 
                                  className={`h-4 w-4 ${favourites.includes(disease.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                                />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="mr-2 h-4 w-4" />
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredDiseases.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No diseases found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
              </div>
            )}
          </TabsContent>

          {/* Enhanced Weather Tab */}
          <TabsContent value="weather" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Weather */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2">
                        <Thermometer className="h-5 w-5" />
                        <span>Temperature</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{enhancedWeatherData.current.temperature}°C</div>
                      <p className="text-sm opacity-90">Feels like {enhancedWeatherData.current.feltTemperature}°C</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2">
                        <Droplets className="h-5 w-5" />
                        <span>Humidity</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{enhancedWeatherData.current.humidity}%</div>
                      <p className="text-sm opacity-90">Dew point {enhancedWeatherData.current.dewPoint}°C</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2">
                        <Wind className="h-5 w-5" />
                        <span>Wind</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{enhancedWeatherData.current.windSpeed} km/h</div>
                      <p className="text-sm opacity-90">{enhancedWeatherData.current.windDirection}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* 5-Day Forecast */}
                <Card>
                  <CardHeader>
                    <CardTitle>5-Day Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {enhancedWeatherData.forecast.map((day, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              {day.condition === 'Sunny' ? <Sun className="h-5 w-5 text-yellow-600" /> :
                               day.condition === 'Rainy' ? <CloudRain className="h-5 w-5 text-blue-600" /> :
                               day.condition === 'Cloudy' ? <Cloud className="h-5 w-5 text-gray-600" /> :
                               <CloudSun className="h-5 w-5 text-blue-600" />}
                            </div>
                            <div>
                              <p className="font-medium">{day.day}</p>
                              <p className="text-sm text-gray-600">{day.condition}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{day.temp}°C</p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Droplets className="h-3 w-3" />
                              <span>{day.rain}%</span>
                              <Wind className="h-3 w-3 ml-2" />
                              <span>{day.wind}km/h</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Weather Alerts & Disease Risk */}
              <div className="space-y-6">
                {/* Weather Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Weather Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {enhancedWeatherData.alerts.map((alert, index) => (
                        <div key={index} className={`p-3 rounded-lg border-l-4 ${
                          alert.severity === 'high' ? 'bg-red-50 border-red-500' :
                          alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                          'bg-blue-50 border-blue-500'
                        }`}>
                          <div className="flex items-start gap-2">
                            <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                              alert.severity === 'high' ? 'text-red-600' :
                              alert.severity === 'medium' ? 'text-yellow-600' :
                              'text-blue-600'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm">{alert.message}</p>
                              <Badge 
                                variant={alert.severity === 'high' ? 'destructive' : 'secondary'}
                                className="mt-1 text-xs"
                              >
                                {alert.severity}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Disease Risk Assessment */}
                <Card>
                  <CardHeader>
                    <CardTitle>Disease Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(enhancedWeatherData.diseaseRisk).map(([disease, data]) => (
                        <div key={disease} className={`p-3 rounded-lg ${
                          data.risk === 'high' ? 'bg-red-50' :
                          data.risk === 'medium' ? 'bg-yellow-50' : 'bg-green-50'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium capitalize">{disease.replace(/([A-Z])/g, ' $1').trim()}</h4>
                            <Badge variant={
                              data.risk === 'high' ? 'destructive' :
                              data.risk === 'medium' ? 'secondary' : 'default'
                            }>
                              {data.risk} risk
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Factors:</p>
                            <ul className="list-disc list-inside mt-1 space-y-0.5">
                              {data.factors.map((factor, index) => (
                                <li key={index}>{factor}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Weather-based Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Sprout className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-800">Crop Management</span>
                        </div>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Monitor potato crops closely for late blight symptoms</li>
                          <li>• Consider preventive fungicide application</li>
                          <li>• Improve field drainage if possible</li>
                        </ul>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">Preventive Measures</span>
                        </div>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Apply preventive treatments before rain</li>
                          <li>• Ensure good air circulation in fields</li>
                          <li>• Remove infected plant debris</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Enhanced Trending Tab */}
          <TabsContent value="trending" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Outbreaks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    <span>Current Disease Outbreaks</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trendingDiseases.map((issue, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${
                              issue.trend === 'up' ? 'bg-red-100' : 'bg-green-100'
                            }`}>
                              <TrendingUp className={`h-4 w-4 ${
                                issue.trend === 'up' ? 'text-red-600' : 'text-green-600 rotate-180'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium">{issue.disease}</p>
                              <p className="text-sm text-gray-600">{issue.crop} crops affected</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {issue.region}
                                </Badge>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(issue.severity)}`}>
                                  {issue.severity}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{issue.cases}</p>
                            <p className="text-sm text-gray-600">reported cases</p>
                            <p className="text-xs text-gray-500 mt-1">{issue.affectedArea}</p>
                          </div>
                        </div>
                        
                        {/* Economic Impact */}
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Economic Impact</span>
                            <span className="text-sm font-medium text-red-600">{issue.economicImpact}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Regional Disease Map */}
              <Card>
                <CardHeader>
                  <CardTitle>Regional Disease Hotspots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Interactive disease map</p>
                      <p className="text-sm text-gray-500">Showing disease hotspots in your region</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">23</div>
                      <div className="text-sm text-red-700">High Risk Areas</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">45</div>
                      <div className="text-sm text-yellow-700">Moderate Risk Areas</div>
                    </div>
                  </div>

                  {/* Regional Breakdown */}
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-sm">Most Affected Regions</h4>
                    {[
                      { region: "Punjab", cases: 89, trend: "up" },
                      { region: "Maharashtra", cases: 67, trend: "down" },
                      { region: "West Bengal", cases: 54, trend: "up" },
                      { region: "Uttar Pradesh", cases: 42, trend: "stable" }
                    ].map((region, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{region.region}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{region.cases}</span>
                          <div className={`w-2 h-2 rounded-full ${
                            region.trend === 'up' ? 'bg-red-500' :
                            region.trend === 'down' ? 'bg-green-500' : 'bg-gray-500'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Seasonal Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Disease Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">Spring (Mar-May)</h4>
                    <div className="space-y-2">
                      {["Aphid Infestation", "Powdery Mildew", "Rust"].map((disease, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm">{disease}</span>
                          <Badge variant="outline" className="text-xs">High</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Monsoon (Jun-Sep)</h4>
                    <div className="space-y-2">
                      {["Late Blight", "Bacterial Blight", "Downy Mildew"].map((disease, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-sm">{disease}</span>
                          <Badge variant="destructive" className="text-xs">Critical</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Winter (Oct-Feb)</h4>
                    <div className="space-y-2">
                      {["Yellow Rust", "Stem Borer", "Leaf Spot"].map((disease, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                          <span className="text-sm">{disease}</span>
                          <Badge variant="secondary" className="text-xs">Medium</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t.recentScans}</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {recentScans.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">{t.noRecentScans}</p>
                  <Button onClick={() => setActiveTab("scan")}>
                    <Camera className="mr-2 h-4 w-4" />
                    {t.scanNow}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentScans.map((scan) => (
                  <Card key={scan.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{scan.disease}</CardTitle>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(scan.severity)}`}>
                          {t[scan.severity as keyof typeof t]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{scan.crop}</p>
                    </CardHeader>
                    <CardContent>
                      {scan.image && (
                        <Image 
                          src={scan.image} 
                          alt="Scanned crop" 
                          width={300}
                          height={200}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{scan.date}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Enhanced Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Scan Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats?.totalScans || 0}</div>
                      <div className="text-sm text-gray-600">Total Scans</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {stats?.accuracyRate || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Accuracy Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats?.diseasesDetected || 0}
                      </div>
                      <div className="text-sm text-gray-600">Diseases Detected</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {stats?.avgConfidence || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Avg Confidence</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Monthly Accuracy</span>
                        <span>94.3%</span>
                      </div>
                      <Progress value={94.3} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Detection Speed</span>
                        <span>2.1s avg</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>User Satisfaction</span>
                        <span>4.7/5</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* New Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Key Metrics */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">94.3%</div>
                        <div className="text-sm text-gray-600">Overall Accuracy</div>
                        <div className="text-xs text-green-600 mt-1">↑ 2.1% from last month</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">2.1s</div>
                        <div className="text-sm text-gray-600">Avg Detection Time</div>
                        <div className="text-xs text-green-600 mt-1">↓ 0.3s faster</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">156</div>
                        <div className="text-sm text-gray-600">Diseases Detected</div>
                        <div className="text-xs text-blue-600 mt-1">12 new this month</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">4.7/5</div>
                        <div className="text-sm text-gray-600">User Rating</div>
                        <div className="text-xs text-green-600 mt-1">↑ 0.2 from last month</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Usage Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Usage Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Usage analytics chart</p>
                        <p className="text-sm text-gray-500">Showing scan frequency and accuracy over time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                {/* Top Diseases */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Most Detected Diseases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats?.topDiseases?.map((disease: string, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{disease}</span>
                          <Badge variant="outline" className="text-xs">
                            {Math.floor(Math.random() * 50) + 20}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Accuracy by Crop */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Accuracy by Crop</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {["Potato", "Tomato", "Rice", "Wheat", "Cotton"].map((crop, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{crop}</span>
                            <span>{(Math.random() * 10 + 90).toFixed(1)}%</span>
                          </div>
                          <Progress value={Math.random() * 10 + 90} className="h-1" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Model Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AI Model Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Model Version</span>
                        <Badge variant="default">v2.1.0</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Training Data</span>
                        <span className="text-sm font-medium">1.2M images</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Last Updated</span>
                        <span className="text-sm text-gray-600">2 days ago</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Status</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* New Research Tab */}
          <TabsContent value="research" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Research Papers */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      Latest Research Papers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          title: "Deep Learning Approaches for Plant Disease Detection: A Comprehensive Review",
                          authors: "Smith, J. et al.",
                          journal: "Journal of Agricultural Technology",
                          year: "2024",
                          citations: 145,
                          relevance: "high"
                        },
                        {
                          title: "AI-Powered Early Warning Systems for Crop Disease Management",
                          authors: "Patel, R. & Kumar, S.",
                          journal: "Agricultural AI Review",
                          year: "2024",
                          citations: 89,
                          relevance: "high"
                        },
                        {
                          title: "Integrated Pest Management Using Computer Vision and IoT Sensors",
                          authors: "Chen, L. et al.",
                          journal: "Smart Agriculture",
                          year: "2023",
                          citations: 67,
                          relevance: "medium"
                        }
                      ].map((paper, index) => (
                        <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-blue-800 hover:text-blue-600 cursor-pointer">
                                {paper.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">{paper.authors}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span>{paper.journal}</span>
                                <span>•</span>
                                <span>{paper.year}</span>
                                <span>•</span>
                                <span>{paper.citations} citations</span>
                              </div>
                            </div>
                            <Badge variant={paper.relevance === 'high' ? 'default' : 'secondary'} className="ml-3">
                              {paper.relevance}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Latest News */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-green-500" />
                      Agricultural News & Updates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          title: "New AI Model Achieves 98% Accuracy in Detecting Late Blight",
                          source: "AgTech Today",
                          time: "2 hours ago",
                          category: "Technology"
                        },
                        {
                          title: "Government Launches Digital Agriculture Initiative",
                          source: "Agricultural Ministry",
                          time: "1 day ago",
                          category: "Policy"
                        },
                        {
                          title: "Climate Change Impact on Crop Disease Patterns",
                          source: "Climate Agriculture Journal",
                          time: "3 days ago",
                          category: "Research"
                        }
                      ].map((news, index) => (
                        <div key={index} className="p-3 border-l-4 border-green-500 bg-green-50">
                          <h4 className="font-medium text-green-800">{news.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-green-600">
                            <span>{news.source}</span>
                            <span>•</span>
                            <span>{news.time}</span>
                            <Badge variant="outline" className="text-xs">
                              {news.category}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                {/* Research Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Research Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        "Computer Vision",
                        "Machine Learning",
                        "Disease Detection",
                        "Precision Agriculture",
                        "Climate Change",
                        "Sustainable Farming"
                      ].map((category, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Conferences & Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upcoming Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          name: "AI in Agriculture Conference",
                          date: "March 15-17, 2024",
                          location: "Delhi"
                        },
                        {
                          name: "Digital Farming Workshop",
                          date: "April 5, 2024",
                          location: "Online"
                        }
                      ].map((event, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-800">{event.name}</h4>
                          <p className="text-sm text-blue-600">{event.date}</p>
                          <p className="text-xs text-blue-500">{event.location}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Collaboration Opportunities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Collaboration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Join Research Group
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Submit Research
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Discussion Forum
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced FAB Menu */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex flex-col gap-3">
          {/* Emergency Contact */}
          <Button 
            size="lg" 
            className="rounded-full h-14 w-14 bg-red-600 hover:bg-red-700 shadow-lg"
            title={t.emergencyContact}
          >
            <Phone className="h-6 w-6" />
          </Button>
          
          {/* Quick Scan */}
          <Button 
            size="lg" 
            className="rounded-full h-12 w-12 bg-green-600 hover:bg-green-700 shadow-lg"
            onClick={() => {
              setActiveTab("scan")
              fileInputRef.current?.click()
            }}
            title="Quick Scan"
          >
            <Camera className="h-5 w-5" />
          </Button>
          
          {/* Expert Chat */}
          <Button 
            size="lg" 
            variant="outline" 
            className="rounded-full h-12 w-12 bg-white shadow-lg"
            title="Chat with Expert"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}