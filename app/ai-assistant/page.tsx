"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Trash2
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { assistantApi, Message, Conversation } from "@/lib/assistantApi"
import { usePageSpeech } from "@/hooks/use-speech"

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
  },
  hi: {
    title: "कृत्रिम बु���्धिमान कृषि सहायक",
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
    noHistory: "अभी तक कोई चैट इतिहास नहीं",
    listening: "सुन रहा है...",
    processing: "प्रसंस्करण...",
  },
  te: {
    title: "కృత్���ిమ మేధస్సు వ్యవసాయ సహాయకుడు",
    welcomeMessage: "నమస్కారం! నేను మీ వ్యవసాయ సహాయకుడను. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
    placeholder: "వ్యవసాయం గురించి ఏదైనా అడగండి...",
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
    error: "ఏదో తప్పు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.",
    noHistory: "ఇంక��� చాట్ చరిత్ర లేదు",
    listening: "వింటున్నాను...",
    processing: "ప్రాసెసింగ్...",
  },
}

export default function AIAssistantPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<'en' | 'hi' | 'te'>('en')
  const { speakPageContent, isPlaying, isSupported } = usePageSpeech()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeTab, setActiveTab] = useState("chat")
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  const t = translations[language]

  const speakMessage = (messageText: string) => {
    speakPageContent(messageText, language)
  }

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'hi' | 'te'
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
    
    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }

    startNewConversation()
    loadConversations()
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
        timestamp: new Date()
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

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim()
    if (!text || !currentSessionId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)
    setError(null)

    try {
      const response = await assistantApi.sendMessage(currentSessionId, text, language)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: 'assistant',
        timestamp: new Date(),
        metadata: {
          intent: response.intent,
          confidence: response.confidence
        }
      }

      setMessages(prev => [...prev, assistantMessage])
      setSuggestedQuestions(response.suggestedQuestions)

      // Speak the response if TTS is enabled
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

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false
    recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-US'

    recognitionRef.current.onstart = () => {
      setIsListening(true)
    }

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInputMessage(transcript)
      setIsListening(false)
    }

    recognitionRef.current.onerror = () => {
      setIsListening(false)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current.start()
  }

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const speakText = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-US'
      utterance.rate = 0.8
      synthRef.current.speak(utterance)
    }
  }

  const toggleTTS = () => {
    setIsSpeaking(!isSpeaking)
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel()
    }
  }

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

  const sendFeedback = async (messageId: string, rating: number) => {
    if (!currentSessionId) return
    
    try {
      await assistantApi.sendFeedback(currentSessionId, messageId, rating)
    } catch (err) {
      console.error('Error sending feedback:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={toggleTTS}
              className={`flex items-center gap-2 ${isSpeaking ? 'bg-blue-100' : ''}`}
            >
              {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {t.textToSpeech}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              {t.backToDashboard}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {t.chatHistory}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={startNewConversation}
                  className="w-full mb-4"
                  disabled={isLoading}
                >
                  {t.newChat}
                </Button>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      {t.noHistory}
                    </p>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv.sessionId}
                        className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                          currentSessionId === conv.sessionId ? 'bg-blue-50 border-blue-200' : ''
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
                            <p className="text-xs text-gray-400">
                              {new Date(conv.lastActivity).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteConversation(conv.sessionId)
                            }}
                            className="ml-2 h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-blue-600" />
                    AI Assistant
                  </CardTitle>
                  {error && (
                    <Badge variant="destructive" className="text-xs">
                      {error}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`p-3 rounded-lg ${
                            message.sender === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          {message.metadata?.confidence && (
                            <div className="mt-2 text-xs opacity-70">
                              Confidence: {Math.round(message.metadata.confidence * 100)}%
                            </div>
                          )}
                        </div>
                        
                        {message.sender === 'assistant' && (
                          <div className="flex items-center gap-2 mt-2">
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
                            {synthRef.current && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => speakText(message.text)}
                                className="h-6 w-6 p-0"
                              >
                                <Volume2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className={`flex items-end ${message.sender === 'user' ? 'order-1 mr-2' : 'order-2 ml-2'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.sender === 'user' ? 'bg-blue-600' : 'bg-gray-300'
                        }`}>
                          {message.sender === 'user' ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 p-3 rounded-lg flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-600">{t.typing}</span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              {/* Suggested Questions */}
              {suggestedQuestions.length > 0 && (
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.slice(0, 3).map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage(question)}
                        className="text-xs"
                        disabled={isLoading}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={isListening ? t.listening : t.placeholder}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      disabled={isLoading || isListening}
                      className={isListening ? 'bg-blue-50' : ''}
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={isListening ? stopVoiceInput : startVoiceInput}
                    disabled={isLoading}
                    className={isListening ? 'bg-red-100' : ''}
                  >
                    <Mic className={`h-4 w-4 ${isListening ? 'text-red-600' : ''}`} />
                  </Button>
                  
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
