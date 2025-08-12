"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Bot,
  Send,
  Mic,
  Volume2,
  VolumeX,
  ArrowRight,
  Loader2,
  User,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Trash2,
  Camera,
  Image as ImageIcon,
  FileText,
  Brain,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  PieChart,
  BarChart3,
  Calendar,
  Clock,
  Settings,
  Download,
  Share2,
  Copy,
  Star,
  Heart,
  Bookmark,
  Filter,
  Search,
  RefreshCw,
  Languages,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Minus,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Phone,
  Video,
  Globe,
  Smartphone,
  Wifi,
  Cloud,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Edit,
  Save,
  ArrowLeft,
  ExternalLink,
  Bell
} from "lucide-react"
import { useRouter } from "next/navigation"
import { assistantApi, Message, Conversation } from "@/lib/assistantApi"
import VoiceAssistant from "@/components/voice-assistant"
import Image from "next/image"

const translations = {
  en: {
    title: "AI Farming Assistant",
    speakMessage: "Speak Message",
    welcomeMessage: "Hello! I'm your AI farming assistant. How can I help you today?",
    placeholder: "Ask me anything about farming...",
    send: "Send",
    speak: "Speak",
    stopSpeaking: "Stop",
    backToDashboard: "Back to Dashboard",
    typing: "Assistant is typing...",
    newChat: "New Chat",
    chatHistory: "Chat History",
    suggestedQuestions: "Suggested Questions",
    voiceInput: "Voice Input",
    textToSpeech: "Text to Speech",
    feedback: "Was this helpful?",
    deleteChat: "Delete Chat",
    error: "Something went wrong. Please try again.",
    noHistory: "No chat history yet",
    listening: "Listening...",
    processing: "Processing...",
    expertMode: "Expert Mode",
    casualMode: "Casual Mode",
    analytics: "Analytics",
    insights: "Insights",
    templates: "Templates",
    multimodal: "Multimodal",
    uploadImage: "Upload Image",
    takePhoto: "Take Photo",
    cropAnalysis: "Crop Analysis",
    soilAnalysis: "Soil Analysis",
    pestIdentification: "Pest Identification",
    weatherIntegration: "Weather Integration",
    marketPrices: "Market Prices",
    personalizedRecommendations: "Personalized Recommendations",
    exportConversation: "Export Conversation",
    shareConversation: "Share Conversation",
    favoriteMessage: "Favorite Message",
    bookmarkConversation: "Bookmark Conversation",
    searchHistory: "Search History",
    filterBy: "Filter by",
    sortBy: "Sort by",
    contextualHelp: "Contextual Help",
    smartSuggestions: "Smart Suggestions",
    quickActions: "Quick Actions",
    farmingTips: "Farming Tips",
    seasonalAdvice: "Seasonal Advice",
    troubleshooting: "Troubleshooting",
    bestPractices: "Best Practices",
    emergencySupport: "Emergency Support",
    videoCall: "Video Call Expert",
    voiceCall: "Voice Call Expert",
    scheduleConsultation: "Schedule Consultation",
    realTimeMonitoring: "Real-time Monitoring",
    notifications: "Notifications",
    settings: "Settings",
    privacy: "Privacy",
    security: "Security",
    dataExport: "Data Export",
    offlineMode: "Offline Mode",
    syncStatus: "Sync Status",
    connectionStatus: "Connection Status",
    responseQuality: "Response Quality",
    confidenceLevel: "Confidence Level",
    sourceReliability: "Source Reliability",
    followUpQuestions: "Follow-up Questions",
    relatedTopics: "Related Topics",
    moreInfo: "More Information",
    detailedAnalysis: "Detailed Analysis",
    actionItems: "Action Items",
    reminders: "Reminders",
    progress: "Progress",
    achievements: "Achievements",
    goals: "Goals",
    planning: "Planning",
    optimization: "Optimization",
    sustainability: "Sustainability",
    costAnalysis: "Cost Analysis",
    riskAssessment: "Risk Assessment"
  },
  hi: {
    title: "कृत्रिम बुद्धिमान कृषि सहायक",
    speakMessage: "संदेश बोलें",
    welcomeMessage: "नमस्ते! मैं आपका कृषि सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
    placeholder: "खेती के बारे में कुछ भी पूछें...",
    send: "भेजें",
    speak: "बोलें",
    stopSpeaking: "रोकें",
    backToDashboard: "डैशबोर्ड पर वापस",
    typing: "सहायक टाइप कर रहा है...",
    newChat: "नई चैट",
    chatHistory: "चैट इतिहास",
    suggestedQuestions: "सुझाए गए प्रश्न",
    voiceInput: "आवाज इनपुट",
    textToSpeech: "टेक्स्ट टू स्पीच",
    feedback: "क्या यह सहायक था?",
    deleteChat: "चैट हटाएं",
    error: "कुछ गलत हुआ। कृपया पुनः प्रयास करें।",
    noHistory: "अभी तक कोई चैट ��तिहास नहीं",
    listening: "सुन रहा है...",
    processing: "प्रसंस्करण...",
    expertMode: "विशेषज्ञ मोड",
    casualMode: "सामान्य मोड",
    analytics: "विश्लेषण",
    insights: "अंतर्दृष्टि",
    templates: "टेम्प्लेट",
    multimodal: "मल्टीमोडल",
    uploadImage: "छवि अपलोड करें",
    takePhoto: "फोटो लें",
    cropAnalysis: "फसल विश्लेषण",
    soilAnalysis: "मिट्टी विश्लेषण",
    pestIdentification: "कीट पहचान",
    weatherIntegration: "मौसम एकीकरण",
    marketPrices: "बाजार दरें",
    personalizedRecommendations: "व्यक्तिगत सुझाव",
    exportConversation: "बातचीत निर्यात करें",
    shareConversation: "बातचीत साझा करें",
    favoriteMessage: "पसंदीदा संदेश",
    bookmarkConversation: "बातचीत बुकमार्क करें",
    searchHistory: "इतिहास खोजें",
    filterBy: "फिल्टर ���रें",
    sortBy: "क्रमबद्ध करें",
    contextualHelp: "प्रासंगिक सहायता",
    smartSuggestions: "स्मार्ट सुझाव",
    quickActions: "त्वरित कार्य",
    farmingTips: "खेती के टिप्स",
    seasonalAdvice: "मौसमी सलाह",
    troubleshooting: "समस्या निवारण",
    bestPractices: "सर्वोत्तम प्रथाएं",
    emergencySupport: "आपातकालीन सहायता",
    videoCall: "विशेषज्ञ से वीडियो कॉल",
    voiceCall: "विशेषज्ञ से वॉयस कॉल",
    scheduleConsultation: "परामर्श शेड्यूल करें"
  },
  te: {
    title: "కృత్రిమ మేధస్సు వ్యవసాయ సహాయకుడు",
    speakMessage: "సందేశం మాట్లాడండి",
    welcomeMessage: "నమస్కారం! నేను మీ వ్యవసాయ సహాయకుడను. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
    placeholder: "వ్యవసాయం గురించి ఏదైనా అడ��ండి...",
    send: "పంపండి",
    speak: "మాట్లాడండి",
    stopSpeaking: "ఆపండి",
    backToDashboard: "డాష్‌బోర్డ్‌కు తిరిగి",
    typing: "సహాయకుడు టైప్ చేస్తున్నాడు...",
    newChat: "కొత్త చాట్",
    chatHistory: "చాట్ చరిత్ర",
    suggestedQuestions: "సూచించిన ప్రశ్నలు",
    voiceInput: "వాయిస్ ఇన్‌పుట్",
    textToSpeech: "టెక్స్ట్ టు స్పీచ్",
    feedback: "ఇది సహాయకరంగా ఉందా?",
    deleteChat: "చాట్ తొలగించండి",
    error: "ఏదో తప్పు జరిగింది. ద��చేసి మళ్లీ ప్రయత్నించండి.",
    noHistory: "ఇంకా చాట్ చరిత్ర లేదు",
    listening: "వింటున్నాను...",
    processing: "ప్రాసెసింగ్...",
    expertMode: "నిపుణుల మోడ్",
    casualMode: "సాధారణ మోడ్",
    analytics: "విశ్లేషణ",
    insights: "అంతర్దృష్టులు",
    templates: "టెంప్లేట్స్",
    multimodal: "మల్టీమోడల్",
    uploadImage: "చిత్రం అప్‌లోడ్ చేయండి",
    takePhoto: "ఫోటో తీయండి",
    cropAnalysis: "పంట విశ్లేషణ",
    soilAnalysis: "మట్టి విశ్లేషణ",
    pestIdentification: "కీటకాల గుర్తింపు",
    weatherIntegration: "వాతావరణ ఏకీకరణ",
    marketPrices: "మార్కెట్ ధరలు"
  }
}

// Enhanced message types
interface EnhancedMessage extends Message {
  imageUrl?: string
  analysisData?: any
  actionItems?: string[]
  relatedTopics?: string[]
  confidence?: number
  sources?: string[]
  isFavorite?: boolean
  tags?: string[]
  mediaType?: 'text' | 'image' | 'voice' | 'video'
}

// Enhanced assistant modes
type AssistantMode = 'casual' | 'expert' | 'voice' | 'multimodal'

// Analytics data
interface Analytics {
  totalMessages: number
  avgResponseTime: number
  topTopics: string[]
  satisfactionScore: number
  improvementSuggestions: string[]
}

// Quick action templates
const quickActionTemplates = [
  {
    id: 'crop-problem',
    title: 'Crop Disease Diagnosis',
    description: 'Upload an image of your crop for instant diagnosis',
    icon: Camera,
    action: 'camera'
  },
  {
    id: 'weather-advice',
    title: 'Weather-based Farming Advice',
    description: 'Get recommendations based on current weather',
    icon: Cloud,
    action: 'weather'
  },
  {
    id: 'market-inquiry',
    title: 'Market Price Inquiry',
    description: 'Check current market prices for your crops',
    icon: TrendingUp,
    action: 'market'
  },
  {
    id: 'seasonal-planning',
    title: 'Seasonal Planning',
    description: 'Plan your farming activities for the season',
    icon: Calendar,
    action: 'planning'
  },
  {
    id: 'soil-health',
    title: 'Soil Health Assessment',
    description: 'Get advice on soil testing and improvement',
    icon: Target,
    action: 'soil'
  },
  {
    id: 'pest-control',
    title: 'Pest Control Solutions',
    description: 'Identify and control pests naturally',
    icon: Shield,
    action: 'pest'
  }
]

// Smart suggestions based on context
const getSmartSuggestions = (context: string, language: string) => {
  const suggestions = {
    en: {
      weather: [
        "What crops should I plant in this weather?",
        "How will rain affect my current crops?",
        "Should I delay harvesting due to weather?"
      ],
      disease: [
        "How can I prevent this disease in the future?",
        "Are there organic treatments available?",
        "What are the early warning signs?"
      ],
      market: [
        "When is the best time to sell this crop?",
        "What factors affect the price of this crop?",
        "Should I store or sell immediately?"
      ],
      general: [
        "What's the best fertilizer for my soil type?",
        "How can I improve my crop yield?",
        "What are the latest farming techniques?"
      ]
    },
    hi: {
      weather: [
        "इस मौसम में कौन सी फसल लगानी चाहिए?",
        "बारिश से मेरी फसल पर क्या प्रभाव पड़ेगा?",
        "क्या मुझे मौस��� के कारण कटाई में देरी करनी चाहिए?"
      ],
      disease: [
        "भविष्य में इस बीमारी को कैसे र���का जा सकता है?",
        "क्या कोई जैविक उपचार उपलब्ध है?",
        "शुरुआती चेतावनी के संकेत क्या हैं?"
      ],
      market: [
        "���स फसल को बेचने का सबसे अच्छा समय कब है?",
        "इस फसल की कीमत को कौन से कारक प्रभावित करते हैं?",
        "क्या मुझे स्टोर करना चाहिए या तुरंत बेचना चाहिए?"
      ],
      general: [
        "मेरी मिट्टी के प्रकार के लिए सबसे अच्छा उर्वरक कौन सा है?",
        "मैं अपनी फसल की पैदावार कैसे बढ़ा सकता हूं?",
        "नवीनतम कृषि तकनीकें क्या हैं?"
      ]
    },
    te: {
      weather: [
        "ఈ వాతావరణంలో ఏ పంటలు వేయాలి?",
        "వర్షం నా పంటలను ఎలా ప్రభావితం చేస్తుంది?",
        "వాతావరణం కారణంగా కోత ఆలస్యం చేయాలా?"
      ],
      disease: [
        "భవిష్యత్తులో ఈ వ్యాధిని ఎలా నివారించగలను?",
        "సేంద్రీయ చికిత్సలు అందుబాటులో ఉన్నాయా?",
        "ముందస్తు హెచ్చరిక సంకేతాలు ఏమిటి?"
      ],
      market: [
        "ఈ పంటను అమ్మడానికి ఉత్తమ సమయం ఎప్పుడు?",
        "ఈ పంట ధరను ఏ అంశాలు ప్రభావితం చేస్తాయి?",
        "నేను నిల్వ చేయాలా లేక వెంటనే అమ్మాలా?"
      ],
      general: [
        "నా మట్టి రకానికి ఉత్తమ ఎరువు ఏది?",
        "నా పంట దిగుబడిని ఎలా మెరుగుపరచగలను?",
        "తాజా వ్యవసాయ సాంకేతికతలు ఏమిటి?"
      ]
    }
  }
  
  return suggestions[language as keyof typeof suggestions]?.[context as keyof typeof suggestions.en] || suggestions[language as keyof typeof suggestions]?.general || []
}

export default function EnhancedAIAssistantPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<'en' | 'hi' | 'te'>('en')
  const [messages, setMessages] = useState<EnhancedMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeTab, setActiveTab] = useState("chat")
  const [error, setError] = useState<string | null>(null)
  const [assistantMode, setAssistantMode] = useState<AssistantMode>('casual')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterTag, setFilterTag] = useState("all")
  const [showTemplates, setShowTemplates] = useState(false)
  const [contextualSuggestions, setContextualSuggestions] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [responseQuality, setResponseQuality] = useState<number>(0)
  const [favorites, setFavorites] = useState<string[]>([])
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLVideoElement>(null)

  const t = translations[language]

  // Enhanced voice functionality
  const initializeSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return false
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-US'

    recognitionRef.current.onstart = () => {
      setIsListening(true)
    }

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript
      setInputMessage(transcript)
      if (event.results[event.results.length - 1].isFinal) {
        setIsListening(false)
      }
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }

    return true
  }, [language])

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }
    initializeSpeechRecognition()
  }, [initializeSpeechRecognition])

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'hi' | 'te'
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
    
    startNewConversation()
    loadConversations()
    loadAnalytics()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const startNewConversation = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await assistantApi.startConversation(language)
      setCurrentSessionId(response.sessionId)
      setSuggestedQuestions(response.suggestedQuestions)
      
      setMessages([{
        id: '1',
        text: response.welcomeMessage,
        sender: 'assistant',
        timestamp: new Date(),
        confidence: 1.0,
        mediaType: 'text'
      }])
    } catch (err: any) {
      console.error('Error starting conversation:', err)
      setError(t.error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadConversations = async () => {
    try {
      const response = await assistantApi.getConversations()
      setConversations(response.conversations)
    } catch (err) {
      console.error('Error loading conversations:', err)
    }
  }

  const loadAnalytics = async () => {
    try {
      // Mock analytics data - in real app, fetch from API
      setAnalytics({
        totalMessages: 145,
        avgResponseTime: 2.3,
        topTopics: ['Disease Diagnosis', 'Weather Advice', 'Market Prices'],
        satisfactionScore: 4.6,
        improvementSuggestions: ['Add more local language support', 'Improve image analysis']
      })
    } catch (err) {
      console.error('Error loading analytics:', err)
    }
  }

  // Enhanced message sending with multimodal support
  const sendMessage = async (messageText?: string, imageData?: string, analysisType?: string) => {
    const text = messageText || inputMessage.trim()
    if (!text && !imageData || !currentSessionId) return

    const userMessage: EnhancedMessage = {
      id: Date.now().toString(),
      text: text || 'Image analysis request',
      sender: 'user',
      timestamp: new Date(),
      imageUrl: imageData,
      mediaType: imageData ? 'image' : 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setSelectedImage(null)
    setIsLoading(true)
    setError(null)

    try {
      // Enhanced API call with multimodal support
      const response = await assistantApi.sendMessage(
        currentSessionId, 
        text, 
        language, 
        assistantMode,
        imageData ? { image: imageData, type: analysisType } : undefined
      )
      
      const assistantMessage: EnhancedMessage = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: 'assistant',
        timestamp: new Date(),
        metadata: {
          intent: response.intent,
          confidence: response.confidence
        },
        confidence: response.confidence,
        actionItems: response.actionItems,
        relatedTopics: response.relatedTopics,
        sources: response.sources,
        mediaType: 'text'
      }

      setMessages(prev => [...prev, assistantMessage])
      setSuggestedQuestions(response.suggestedQuestions)
      setContextualSuggestions(getSmartSuggestions(response.intent || 'general', language))
      setResponseQuality(response.confidence * 100)

      // Auto-speak response if TTS is enabled
      if (isSpeaking && synthRef.current) {
        speakText(response.response)
      }
    } catch (err: any) {
      console.error('Error sending message:', err)
      setError(t.error)
    } finally {
      setIsLoading(false)
    }
  }

  // Enhanced voice input
  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      if (!initializeSpeechRecognition()) {
        alert('Speech recognition not supported in this browser')
        return
      }
    }

    recognitionRef.current.start()
  }

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  // Enhanced text-to-speech
  const speakText = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-US'
      utterance.rate = 0.8
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      // Try to get a voice that matches the language
      const voices = synthRef.current.getVoices()
      const languageCode = utterance.lang.split('-')[0]
      const voice = voices.find(v => v.lang.startsWith(languageCode))
      if (voice) {
        utterance.voice = voice
      }
      
      synthRef.current.speak(utterance)
    }
  }

  const toggleTTS = () => {
    setIsSpeaking(!isSpeaking)
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel()
    }
  }

  // Image upload and analysis
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    const imageUrl = URL.createObjectURL(file)
    setSelectedImage(imageUrl)
    setIsAnalyzing(true)
    
    // Convert to base64 for API
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string
      setIsAnalyzing(false)
      
      // Send for analysis
      await sendMessage("Please analyze this crop image", base64Data, "crop-analysis")
    }
    reader.readAsDataURL(file)
  }

  // Camera capture
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      })
      
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream
        cameraRef.current.play()
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Could not access camera. Please check permissions.')
    }
  }

  const capturePhoto = () => {
    if (!cameraRef.current) return
    
    const canvas = document.createElement('canvas')
    canvas.width = cameraRef.current.videoWidth
    canvas.height = cameraRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      ctx.drawImage(cameraRef.current, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob(async (blob) => {
        if (!blob) return
        
        const imageUrl = URL.createObjectURL(blob)
        setSelectedImage(imageUrl)
        
        // Convert to base64 for API
        const reader = new FileReader()
        reader.onload = async (e) => {
          const base64Data = e.target?.result as string
          await sendMessage("Please analyze this crop image", base64Data, "crop-analysis")
        }
        reader.readAsBlob(blob)
        
        // Stop camera stream
        const stream = cameraRef.current?.srcObject as MediaStream
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
        }
      }, 'image/jpeg', 0.9)
    }
  }

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'camera':
        fileInputRef.current?.click()
        break
      case 'weather':
        sendMessage("What farming advice do you have based on current weather conditions?")
        break
      case 'market':
        sendMessage("What are the current market prices for my crops and when should I sell?")
        break
      case 'planning':
        sendMessage("Help me plan my farming activities for this season")
        break
      case 'soil':
        sendMessage("How can I assess and improve my soil health?")
        break
      case 'pest':
        sendMessage("What are natural and effective pest control methods?")
        break
    }
  }

  // Conversation management
  const loadConversation = async (sessionId: string) => {
    try {
      setIsLoading(true)
      const response = await assistantApi.getHistory(sessionId)
      setMessages(response.messages)
      setCurrentSessionId(sessionId)
      setActiveTab("chat")
    } catch (err) {
      console.error('Error loading conversation:', err)
      setError(t.error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteConversation = async (sessionId: string) => {
    try {
      await assistantApi.deleteConversation(sessionId)
      setConversations(prev => prev.filter(conv => conv.sessionId !== sessionId))
      
      if (currentSessionId === sessionId) {
        startNewConversation()
      }
    } catch (err) {
      console.error('Error deleting conversation:', err)
    }
  }

  // Message actions
  const sendFeedback = async (messageId: string, rating: number) => {
    if (!currentSessionId) return
    
    try {
      await assistantApi.sendFeedback(currentSessionId, messageId, rating)
    } catch (err) {
      console.error('Error sending feedback:', err)
    }
  }

  const toggleFavorite = (messageId: string) => {
    setFavorites(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    )
  }

  const exportConversation = () => {
    const conversationData = {
      sessionId: currentSessionId,
      messages: messages,
      timestamp: new Date().toISOString(),
      language: language
    }
    
    const blob = new Blob([JSON.stringify(conversationData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversation-${currentSessionId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Filter messages based on search and tags
  const filteredMessages = messages.filter(message => {
    const matchesSearch = searchQuery === "" || 
      message.text.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterTag === "all" || 
      message.tags?.includes(filterTag) ||
      (filterTag === "favorite" && favorites.includes(message.id))
    
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-8xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bot className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
                  {isConnected ? "Online" : "Offline"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {assistantMode === 'expert' ? t.expertMode : t.casualMode}
                </Badge>
                {responseQuality > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Quality: {responseQuality.toFixed(0)}%
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Mode Toggle */}
            <Select value={assistantMode} onValueChange={(value: AssistantMode) => setAssistantMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Casual
                  </div>
                </SelectItem>
                <SelectItem value="expert">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Expert
                  </div>
                </SelectItem>
                <SelectItem value="voice">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Voice
                  </div>
                </SelectItem>
                <SelectItem value="multimodal">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Multimodal
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Language Selection */}
            <Select value={language} onValueChange={(value: 'en' | 'hi' | 'te') => setLanguage(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇺🇸 EN</SelectItem>
                <SelectItem value="hi">🇮🇳 ह���ं</SelectItem>
                <SelectItem value="te">🇮🇳 తె</SelectItem>
              </SelectContent>
            </Select>

            {/* TTS Toggle */}
            <Button
              variant="outline"
              onClick={toggleTTS}
              className={`flex items-center gap-2 ${isSpeaking ? 'bg-blue-100' : ''}`}
            >
              {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>

            {/* Voice Assistant */}
            <VoiceAssistant
              language={language}
              pageTitle={t.title}
              size="icon"
            />

            {/* Back Button */}
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

        {/* Main Content with Enhanced Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Sidebar - Chat History & Quick Actions */}
          <div className="xl:col-span-3 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  {t.quickActions}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {quickActionTemplates.slice(0, 6).map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(template.action)}
                      className="h-auto p-3 flex flex-col items-center gap-1 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                    >
                      <template.icon className="h-4 w-4" />
                      <span className="text-xs text-center">{template.title.split(' ')[0]}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {t.chatHistory}
                </CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder={t.searchHistory}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={startNewConversation}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      {t.noHistory}
                    </p>
                  ) : (
                    conversations.map((conv) => (
                      <motion.div
                        key={conv.sessionId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          currentSessionId === conv.sessionId 
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => loadConversation(conv.sessionId)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conv.topic}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {conv.lastMessage}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-400">
                                {new Date(conv.lastActivity).toLocaleDateString()}
                              </p>
                              {bookmarks.includes(conv.sessionId) && (
                                <Bookmark className="h-3 w-3 text-blue-500" />
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteConversation(conv.sessionId)
                            }}
                            className="ml-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Analytics Preview */}
            {analytics && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    {t.analytics}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Messages</span>
                      <span className="text-sm font-medium">{analytics.totalMessages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Satisfaction</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{analytics.satisfactionScore}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Response</span>
                      <span className="text-sm font-medium">{analytics.avgResponseTime}s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Chat Area */}
          <div className="xl:col-span-6">
            <Card className="h-[800px] flex flex-col shadow-xl">
              <CardHeader className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <motion.div 
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </motion.div>
                    AI Assistant
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {error && (
                      <Badge variant="destructive" className="text-xs">
                        {error}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={exportConversation}
                      disabled={messages.length === 0}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => alert('Share functionality coming soon!')}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Filter and Search */}
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-sm"
                  />
                  <Select value={filterTag} onValueChange={setFilterTag}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="favorite">Favorites</SelectItem>
                      <SelectItem value="images">Images</SelectItem>
                      <SelectItem value="analysis">Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {filteredMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`p-4 rounded-2xl relative ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                              : 'bg-white border shadow-md'
                          }`}
                        >
                          {/* Message Image */}
                          {message.imageUrl && (
                            <div className="mb-3">
                              <Image
                                src={message.imageUrl}
                                alt="Uploaded image"
                                width={300}
                                height={200}
                                className="rounded-lg object-cover"
                              />
                            </div>
                          )}

                          {/* Message Text */}
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          
                          {/* Message Metadata */}
                          {message.confidence && message.sender === 'assistant' && (
                            <div className="mt-2 text-xs opacity-70 flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                <span>Confidence: {Math.round(message.confidence * 100)}%</span>
                              </div>
                              {message.sources && (
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  <span>Sources: {message.sources.length}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action Items */}
                          {message.actionItems && message.actionItems.length > 0 && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <h5 className="text-xs font-medium text-blue-800 mb-2">{t.actionItems}</h5>
                              <ul className="text-xs space-y-1">
                                {message.actionItems.map((item, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3 text-blue-600" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Related Topics */}
                          {message.relatedTopics && message.relatedTopics.length > 0 && (
                            <div className="mt-3">
                              <h5 className="text-xs font-medium mb-2">{t.relatedTopics}</h5>
                              <div className="flex flex-wrap gap-1">
                                {message.relatedTopics.map((topic, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Message Actions */}
                        {message.sender === 'assistant' && (
                          <div className="flex items-center gap-2 mt-2 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => sendFeedback(message.id, 1)}
                              className="h-6 w-6 p-0"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => sendFeedback(message.id, -1)}
                              className="h-6 w-6 p-0"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(message.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Heart className={`h-3 w-3 ${favorites.includes(message.id) ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => speakText(message.text)}
                              className="h-6 w-6 p-0"
                            >
                              <Volume2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(message.text)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Avatar */}
                      <div className={`flex items-end ${message.sender === 'user' ? 'order-1 mr-3' : 'order-2 ml-3'}`}>
                        <motion.div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.sender === 'user' 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                              : 'bg-gradient-to-r from-green-400 to-blue-500'
                          }`}
                          whileHover={{ scale: 1.1 }}
                        >
                          {message.sender === 'user' ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-white" />
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border shadow-md p-4 rounded-2xl flex items-center gap-3">
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-2 h-2 bg-blue-500 rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-blue-500 rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-blue-500 rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{t.typing}</span>
                    </div>
                  </motion.div>
                )}

                {/* Image Analysis Indicator */}
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <span className="text-sm text-blue-600">Analyzing image...</span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              {/* Smart Suggestions */}
              {(suggestedQuestions.length > 0 || contextualSuggestions.length > 0) && (
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-2">
                    {/* AI Suggested Questions */}
                    {suggestedQuestions.slice(0, 2).map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage(question)}
                        className="text-xs hover:bg-blue-50"
                        disabled={isLoading}
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        {question}
                      </Button>
                    ))}
                    {/* Contextual Suggestions */}
                    {contextualSuggestions.slice(0, 1).map((suggestion, index) => (
                      <Button
                        key={`context-${index}`}
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage(suggestion)}
                        className="text-xs hover:bg-purple-50"
                        disabled={isLoading}
                      >
                        <Lightbulb className="h-3 w-3 mr-1" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Input Area */}
              <div className="p-4 border-t bg-gray-50">
                {/* Image Preview */}
                {selectedImage && (
                  <div className="mb-3 relative">
                    <div className="relative inline-block">
                      <Image
                        src={selectedImage}
                        alt="Selected for analysis"
                        width={100}
                        height={100}
                        className="rounded-lg object-cover"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => setSelectedImage(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {/* Main Input */}
                  <div className="flex-1 relative">
                    <Textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={isListening ? t.listening : t.placeholder}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      disabled={isLoading || isListening}
                      className={`min-h-[44px] max-h-32 resize-none ${isListening ? 'bg-blue-50' : ''}`}
                      rows={1}
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    {/* Image Upload */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="h-11"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    
                    {/* Camera */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isLoading}
                          className="h-11"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Take Photo</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <video 
                            ref={cameraRef}
                            autoPlay
                            playsInline
                            className="w-full rounded-lg"
                          />
                          <div className="flex gap-2">
                            <Button onClick={startCamera} className="flex-1">
                              Start Camera
                            </Button>
                            <Button onClick={capturePhoto} className="flex-1">
                              Capture
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {/* Voice Input */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={isListening ? stopVoiceInput : startVoiceInput}
                      disabled={isLoading}
                      className={`h-11 ${isListening ? 'bg-red-100 border-red-300' : ''}`}
                    >
                      <Mic className={`h-4 w-4 ${isListening ? 'text-red-600' : ''}`} />
                    </Button>
                    
                    {/* Send Button */}
                    <Button
                      onClick={() => sendMessage()}
                      disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
                      className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Input Enhancements */}
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>Mode: {assistantMode}</span>
                    <Separator orientation="vertical" className="h-3" />
                    <span>Lang: {language.toUpperCase()}</span>
                    {responseQuality > 0 && (
                      <>
                        <Separator orientation="vertical" className="h-3" />
                        <span>Quality: {responseQuality.toFixed(0)}%</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Press Enter to send</span>
                  </div>
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </Card>
          </div>

          {/* Right Sidebar - Templates & Insights */}
          <div className="xl:col-span-3 space-y-6">
            {/* Quick Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  {t.templates}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quickActionTemplates.map((template) => (
                    <Button
                      key={template.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickAction(template.action)}
                      className="w-full justify-start h-auto p-3 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50"
                    >
                      <div className="flex items-start gap-3">
                        <template.icon className="h-4 w-4 mt-0.5 text-purple-600" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{template.title}</div>
                          <div className="text-xs text-gray-500">{template.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-green-500" />
                  {t.insights}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Seasonal Tip</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      This is a great time for soil preparation. Consider adding organic matter to improve soil health.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Weather Alert</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Heavy rainfall expected next week. Plan your field activities accordingly.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Market Insight</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Tomato prices are trending upward. Consider increasing your tomato crop area.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expert Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-red-500" />
                  {t.emergencySupport}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => alert('Video call feature coming soon!')}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    {t.videoCall}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => alert('Voice call feature coming soon!')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {t.voiceCall}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => alert('Scheduling feature coming soon!')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {t.scheduleConsultation}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Settings & Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-500" />
                  {t.settings}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Notifications</span>
                    <Button variant="ghost" size="sm">
                      <Bell className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Privacy</span>
                    <Button variant="ghost" size="sm">
                      <Shield className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Export</span>
                    <Button variant="ghost" size="sm" onClick={exportConversation}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
