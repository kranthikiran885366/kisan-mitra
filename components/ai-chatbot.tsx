"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Camera,
  Loader2,
  User,
  Leaf,
  Bug,
  Droplets,
  Sun,
  AlertTriangle,
  CheckCircle,
  X,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  RotateCcw,
  Target,
  Zap,
  Shield,
  Award,
  TrendingUp,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
  imageUrl?: string
  diseaseInfo?: {
    name: string
    confidence: number
    severity: "low" | "medium" | "high"
    treatments: {
      organic: string[]
      inorganic: string[]
    }
    prevention: string[]
    symptoms: string[]
  }
  suggestions?: string[]
  isTyping?: boolean
}

interface AIChatbotProps {
  language: "en" | "hi" | "te"
  isOpen: boolean
  onClose: () => void
}

const translations = {
  en: {
    title: "AI Farming Assistant",
    subtitle: "Your Smart Crop Doctor",
    placeholder: "Ask about crops, diseases, or upload a photo...",
    send: "Send",
    listening: "Listening...",
    processing: "Analyzing...",
    uploadImage: "Upload Image",
    takePhoto: "Take Photo",
    diseaseDetected: "Disease Detected",
    confidence: "Confidence",
    severity: "Severity",
    organicTreatment: "Organic Treatment",
    inorganicTreatment: "Inorganic Treatment",
    prevention: "Prevention",
    symptoms: "Symptoms",
    suggestions: "Quick Suggestions",
    clearChat: "Clear Chat",
    voiceOn: "Voice On",
    voiceOff: "Voice Off",
    maximize: "Maximize",
    minimize: "Minimize",
    typing: "AI is typing...",
    quickActions: {
      weather: "Weather Update",
      prices: "Market Prices",
      diseases: "Common Diseases",
      fertilizers: "Fertilizer Guide",
      calendar: "Farming Calendar",
      experts: "Expert Advice",
    },
  },
  hi: {
    title: "AI कृषि सहायक",
    subtitle: "आपका स्मार्ट फसल डॉक्टर",
    placeholder: "फसलों, बीमारियों के बारे में पूछें या फोटो अपलोड करें...",
    send: "भेजें",
    listening: "सुन रहा है...",
    processing: "विश्लेषण कर रहा है...",
    uploadImage: "छवि अपलोड करें",
    takePhoto: "फोटो लें",
    diseaseDetected: "रोग का पता चला",
    confidence: "विश्वास",
    severity: "गंभीरता",
    organicTreatment: "जैविक उपचार",
    inorganicTreatment: "अजैविक उपचार",
    prevention: "रोकथाम",
    symptoms: "लक्षण",
    suggestions: "त्वरित सुझाव",
    clearChat: "चैट साफ़ करें",
    voiceOn: "आवाज़ चालू",
    voiceOff: "आवाज़ बंद",
    maximize: "बड़ा करें",
    minimize: "छोटा करें",
    typing: "AI टाइप कर रहा है...",
    quickActions: {
      weather: "मौसम अपडेट",
      prices: "बाजार की कीमतें",
      diseases: "सामान्य रोग",
      fertilizers: "उर्वरक गाइड",
      calendar: "कृषि कैलेंडर",
      experts: "विशेषज्ञ सलाह",
    },
  },
  te: {
    title: "AI వ్యవసాయ సహాయకుడు",
    subtitle: "మీ స్మార్ట్ పంట డాక్టర్",
    placeholder: "పంటలు, వ్యాధుల గురించి అడగండి లేదా ఫోటో అప్‌లోడ్ చేయండి...",
    send: "పంపండి",
    listening: "వింటోంది...",
    processing: "విశ్లేషిస్తోంది...",
    uploadImage: "చిత్రం అప్‌లోడ్ చేయండి",
    takePhoto: "ఫోటో తీయండి",
    diseaseDetected: "వ్యాధి గుర్తించబడింది",
    confidence: "నమ్మకం",
    severity: "తీవ్రత",
    organicTreatment: "సేంద్రీయ చికిత్స",
    inorganicTreatment: "అసేంద్రీయ చికిత్స",
    prevention: "నివారణ",
    symptoms: "లక్షణాలు",
    suggestions: "త్వరిత సూచనలు",
    clearChat: "చాట్ క్లియర్ చేయండి",
    voiceOn: "వాయిస్ ఆన్",
    voiceOff: "వాయిస్ ఆఫ్",
    maximize: "పెద్దది చేయండి",
    minimize: "చిన్నది చేయండి",
    typing: "AI టైప్ చేస్తోంది...",
    quickActions: {
      weather: "వాతావరణ అప్‌డేట్",
      prices: "మార్కెట్ ధరలు",
      diseases: "సాధారణ వ్యాధులు",
      fertilizers: "ఎరువుల గైడ్",
      calendar: "వ్యవసాయ క్యాలెండర్",
      experts: "నిపుణుల సలహా",
    },
  },
}

// Mock disease detection responses
const mockDiseaseResponses = [
  {
    name: "Leaf Blight",
    confidence: 92,
    severity: "high" as const,
    treatments: {
      organic: [
        "Neem oil spray (2-3 times per week)",
        "Copper sulfate solution",
        "Baking soda and soap mixture",
        "Compost tea application",
        "Garlic and chili pepper spray",
      ],
      inorganic: [
        "Mancozeb fungicide",
        "Chlorothalonil spray",
        "Copper oxychloride",
        "Propiconazole treatment",
        "Azoxystrobin application",
      ],
    },
    prevention: [
      "Ensure proper air circulation",
      "Avoid overhead watering",
      "Remove infected plant debris",
      "Crop rotation practices",
      "Use disease-resistant varieties",
    ],
    symptoms: ["Brown spots on leaves", "Yellowing of leaf margins", "Premature leaf drop", "Stunted plant growth"],
  },
  {
    name: "Powdery Mildew",
    confidence: 88,
    severity: "medium" as const,
    treatments: {
      organic: [
        "Milk spray solution (1:10 ratio)",
        "Baking soda spray",
        "Neem oil application",
        "Sulfur dust treatment",
        "Apple cider vinegar spray",
      ],
      inorganic: [
        "Myclobutanil fungicide",
        "Trifloxystrobin spray",
        "Tebuconazole treatment",
        "Penconazole application",
      ],
    },
    prevention: [
      "Improve air circulation",
      "Reduce humidity levels",
      "Avoid overcrowding plants",
      "Water at soil level",
      "Remove affected leaves promptly",
    ],
    symptoms: [
      "White powdery coating on leaves",
      "Distorted leaf growth",
      "Reduced photosynthesis",
      "Yellowing and browning of leaves",
    ],
  },
  {
    name: "Root Rot",
    confidence: 85,
    severity: "high" as const,
    treatments: {
      organic: [
        "Improve soil drainage",
        "Beneficial bacteria application",
        "Cinnamon powder treatment",
        "Hydrogen peroxide soil drench",
        "Compost amendment",
      ],
      inorganic: [
        "Metalaxyl fungicide",
        "Fosetyl-aluminum treatment",
        "Phosphorous acid spray",
        "Mefenoxam application",
      ],
    },
    prevention: [
      "Ensure proper drainage",
      "Avoid overwatering",
      "Use well-draining soil mix",
      "Maintain proper pH levels",
      "Practice crop rotation",
    ],
    symptoms: [
      "Wilting despite moist soil",
      "Yellowing lower leaves",
      "Soft, brown roots",
      "Stunted growth",
      "Plant collapse",
    ],
  },
]

export function AIChatbot({ language, isOpen, onClose }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        language === "en"
          ? "Hello! I'm your AI farming assistant. I can help you identify crop diseases, suggest treatments, and answer farming questions. How can I help you today?"
          : language === "hi"
            ? "नमस्ते! मैं आपका AI कृषि सहायक हूं। मैं फसल की बीमारियों की पहचान करने, उपचार सुझाने और कृषि प्रश्नों के उत्तर देने में आपकी मदद कर सकता हूं। आज मैं आपकी कैसे मदद कर सकता हूं?"
            : "నమస్కారం! నేను మీ AI వ్యవసాయ సహాయకుడను. నేను పంట వ్యాధులను గుర్తించడంలో, చికిత్సలను సూచించడంలో మరియు వ్యవసాయ ప్రశ్నలకు సమాధానాలు ఇవ్వడంలో మీకు సహాయం చేయగలను. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
      timestamp: new Date(),
      suggestions: [
        "Identify crop disease",
        "Weather advice",
        "Market prices",
        "Fertilizer recommendations",
        "Pest control",
        "Soil health",
      ],
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isMaximized, setIsMaximized] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = translations[language]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const speakText = (text: string) => {
    if (voiceEnabled && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === "en" ? "en-US" : language === "hi" ? "hi-IN" : "te-IN"
      speechSynthesis.speak(utterance)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedImage) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
      imageUrl: selectedImage || undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setSelectedImage(null)
    setIsProcessing(true)

    // Add typing indicator
    const typingMessage: Message = {
      id: "typing",
      type: "bot",
      content: "",
      timestamp: new Date(),
      isTyping: true,
    }
    setMessages((prev) => [...prev, typingMessage])

    // Simulate AI processing
    setTimeout(() => {
      setMessages((prev) => prev.filter((msg) => msg.id !== "typing"))

      let botResponse: Message

      if (selectedImage || inputValue.toLowerCase().includes("disease") || inputValue.toLowerCase().includes("sick")) {
        // Disease detection response
        const randomDisease = mockDiseaseResponses[Math.floor(Math.random() * mockDiseaseResponses.length)]
        botResponse = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content:
            language === "en"
              ? `I've analyzed the image and detected ${randomDisease.name}. Here's what I found:`
              : language === "hi"
                ? `मैंने छवि का विश्लेषण किया है और ${randomDisease.name} का पता लगाया है। यहाँ मैंने जो पाया है:`
                : `నేను చిత్రాన్ని విశ్లేషించాను మరియు ${randomDisease.name} గుర్తించాను. నేను కనుగొన్నది ఇక్కడ ఉంది:`,
          timestamp: new Date(),
          diseaseInfo: randomDisease,
          suggestions: ["More about this disease", "Prevention tips", "Expert consultation", "Similar cases"],
        }
      } else {
        // General farming advice
        const responses = {
          en: [
            "Based on current weather conditions, I recommend checking soil moisture levels before watering.",
            "For optimal growth, consider applying organic fertilizer during the early morning hours.",
            "The market prices for your crops are trending upward. It might be a good time to harvest.",
            "I notice some pest activity in your area. Consider using neem oil as a natural deterrent.",
            "Your soil pH levels seem optimal for the crops you're growing. Keep monitoring regularly.",
          ],
          hi: [
            "वर्तमान मौसम की स्थिति के आधार पर, मैं पानी देने से पहले मिट्टी की नमी के स्तर की जांच करने की सलाह देता हूं।",
            "इष्टतम विकास के लिए, सुबह के समय जैविक उर्वरक लगाने पर विचार करें।",
            "आपकी फसलों के लिए बाजार की कीमतें ऊपर की ओर बढ़ रही हैं। यह फसल काटने का अच्छा समय हो सकता है।",
            "मुझे आपके क्षेत्र में कुछ कीट गतिविधि दिखाई दे रही है। प्राकृतिक निवारक के रूप में नीम के तेल का उपयोग करने पर विचार करें।",
            "आपकी मिट्टी का pH स्तर आपकी उगाई जा रही फसलों के लिए इष्टतम लगता है। नियमित रूप से निगरानी करते रहें।",
          ],
          te: [
            "ప్రస్తుత వాతావరణ పరిస్థితుల ఆధారంగా, నీరు పెట్టే ముందు మట్టి తేమ స్థాయిలను తనిఖీ చేయాలని నేను సిఫార్సు చేస్తున్నాను.",
            "సరైన పెరుగుదల కోసం, ఉదయం వేళల్లో సేంద్రీయ ఎరువులు వేయడాన్ని పరిగణించండి.",
            "మీ పంటలకు మార్కెట్ ధరలు పెరుగుతున్నాయి. పంట కోయడానికి మంచి సమయం కావచ్చు.",
            "మీ ప్రాంతంలో కొంత కీటకాల కార్యకలాపాలు నేను గమనిస్తున్నాను. సహజ నిరోధకంగా వేప నూనెను ఉపయోగించడాన్ని పరిగణించండి.",
            "మీ మట్టి pH స్థాయిలు మీరు పెంచుతున్న పంటలకు సరైనవిగా కనిపిస్తున్నాయి. క్రమం తప్పకుండా పర్యవేక్షించండి.",
          ],
        }

        const randomResponse = responses[language][Math.floor(Math.random() * responses[language].length)]

        botResponse = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: randomResponse,
          timestamp: new Date(),
          suggestions: ["Weather forecast", "Market analysis", "Crop calendar", "Expert advice"],
        }
      }

      setMessages((prev) => [...prev, botResponse])
      speakText(botResponse.content)
      setIsProcessing(false)
    }, 2000)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleQuickAction = (action: string) => {
    setInputValue(action)
    handleSendMessage()
  }

  const clearChat = () => {
    setMessages([messages[0]]) // Keep the initial greeting
  }

  const quickActions = [
    { key: "weather", icon: Sun, color: "bg-yellow-500" },
    { key: "prices", icon: TrendingUp, color: "bg-green-500" },
    { key: "diseases", icon: Bug, color: "bg-red-500" },
    { key: "fertilizers", icon: Droplets, color: "bg-blue-500" },
    { key: "calendar", icon: BookOpen, color: "bg-purple-500" },
    { key: "experts", icon: Award, color: "bg-orange-500" },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          className={`fixed ${isMaximized ? "inset-4" : "bottom-4 right-4 w-96 h-[600px]"} bg-white rounded-2xl shadow-2xl border-2 border-green-200 z-50 flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
                >
                  <Bot className="h-6 w-6" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg">{t.title}</h3>
                  <p className="text-sm opacity-90">{t.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                >
                  {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => setIsMaximized(!isMaximized)}
                >
                  {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>

                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={clearChat}>
                  <RotateCcw className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-3 bg-gray-50 border-b">
            <div className="flex gap-2 overflow-x-auto">
              {quickActions.map((action) => (
                <motion.button
                  key={action.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickAction(t.quickActions[action.key as keyof typeof t.quickActions])}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-white text-sm font-medium whitespace-nowrap ${action.color}`}
                >
                  <action.icon className="h-4 w-4" />
                  {t.quickActions[action.key as keyof typeof t.quickActions]}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : ""}`}>
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      {message.type === "user" ? (
                        <AvatarFallback className="bg-green-500 text-white">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      ) : (
                        <AvatarFallback className="bg-blue-500 text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className={`space-y-2 ${message.type === "user" ? "items-end" : "items-start"} flex flex-col`}>
                      {message.isTyping ? (
                        <div className="bg-gray-100 rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                            <span className="text-sm text-gray-500 ml-2">{t.typing}</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          {message.imageUrl && (
                            <motion.img
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              src={message.imageUrl}
                              alt="Uploaded crop"
                              className="max-w-48 rounded-lg border-2 border-gray-200"
                            />
                          )}

                          <div
                            className={`rounded-2xl px-4 py-3 ${
                              message.type === "user" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>

                          {message.diseaseInfo && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              <Card className="w-full border-2 border-red-200">
                                <CardHeader className="pb-3">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    <CardTitle className="text-lg text-red-700">
                                      {t.diseaseDetected}: {message.diseaseInfo.name}
                                    </CardTitle>
                                  </div>
                                  <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">{t.confidence}:</span>
                                      <Badge variant="secondary">{message.diseaseInfo.confidence}%</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">{t.severity}:</span>
                                      <Badge
                                        variant={
                                          message.diseaseInfo.severity === "high"
                                            ? "destructive"
                                            : message.diseaseInfo.severity === "medium"
                                              ? "default"
                                              : "secondary"
                                        }
                                      >
                                        {message.diseaseInfo.severity}
                                      </Badge>
                                    </div>
                                  </div>
                                </CardHeader>

                                <CardContent>
                                  <Tabs defaultValue="organic" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                      <TabsTrigger value="organic" className="text-xs">
                                        <Leaf className="h-3 w-3 mr-1" />
                                        {t.organicTreatment}
                                      </TabsTrigger>
                                      <TabsTrigger value="inorganic" className="text-xs">
                                        <Zap className="h-3 w-3 mr-1" />
                                        {t.inorganicTreatment}
                                      </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="organic" className="mt-3">
                                      <div className="space-y-2">
                                        {message.diseaseInfo.treatments.organic.map((treatment, index) => (
                                          <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center gap-2 p-2 bg-green-50 rounded-lg"
                                          >
                                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            <span className="text-sm">{treatment}</span>
                                          </motion.div>
                                        ))}
                                      </div>
                                    </TabsContent>

                                    <TabsContent value="inorganic" className="mt-3">
                                      <div className="space-y-2">
                                        {message.diseaseInfo.treatments.inorganic.map((treatment, index) => (
                                          <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg"
                                          >
                                            <Shield className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                            <span className="text-sm">{treatment}</span>
                                          </motion.div>
                                        ))}
                                      </div>
                                    </TabsContent>
                                  </Tabs>

                                  <div className="mt-4 space-y-3">
                                    <div>
                                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                        <Target className="h-4 w-4 text-orange-500" />
                                        {t.symptoms}
                                      </h4>
                                      <div className="grid grid-cols-1 gap-1">
                                        {message.diseaseInfo.symptoms.map((symptom, index) => (
                                          <span
                                            key={index}
                                            className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded"
                                          >
                                            {symptom}
                                          </span>
                                        ))}
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-purple-500" />
                                        {t.prevention}
                                      </h4>
                                      <div className="grid grid-cols-1 gap-1">
                                        {message.diseaseInfo.prevention.map((prevention, index) => (
                                          <span
                                            key={index}
                                            className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded"
                                          >
                                            {prevention}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )}

                          {message.suggestions && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 }}
                              className="flex flex-wrap gap-2 mt-2"
                            >
                              {message.suggestions.map((suggestion, index) => (
                                <motion.button
                                  key={index}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleQuickAction(suggestion)}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
                                >
                                  {suggestion}
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </>
                      )}

                      <span className="text-xs text-gray-400">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Image Preview */}
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-gray-50 border-t"
            >
              <div className="relative inline-block">
                <img
                  src={selectedImage || "/placeholder.svg"}
                  alt="Selected"
                  className="w-20 h-20 object-cover rounded-lg border-2 border-green-300"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 w-6 h-6"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t">
            <div className="flex items-center gap-2">
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0"
              >
                <Camera className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsListening(!isListening)}
                className={`flex-shrink-0 ${isListening ? "bg-red-100 text-red-600" : ""}`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>

              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t.placeholder}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
                disabled={isProcessing}
              />

              <Button
                onClick={handleSendMessage}
                disabled={(!inputValue.trim() && !selectedImage) || isProcessing}
                className="flex-shrink-0 bg-green-500 hover:bg-green-600"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>

            {isListening && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-center">
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                    className="w-2 h-2 bg-red-500 rounded-full"
                  />
                  <span className="text-sm">{t.listening}</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
