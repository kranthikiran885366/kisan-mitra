"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Sprout,
  Cloud,
  TrendingUp,
  FileText,
  Mic,
  ArrowRight,
  Bot,
  Users,
  Stethoscope,
  MessageCircle,
  Star,
  CheckCircle,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import VoiceAssistant from "@/components/voice-assistant"

const translations = {
  en: {
    title: "Kisan Mitra",
    subtitle: "AI-Powered Smart Farming Assistant",
    description:
      "Get AI-powered crop disease diagnosis, real-time weather, market rates, WhatsApp farmer groups, and expert farming guidance",
    heroSubtext: "Empowering farmers with cutting-edge technology for sustainable and profitable agriculture",
    features: {
      weather: "Weather Updates",
      market: "Market Rates",
      schemes: "Gov Schemes",
      crops: "Crop Advisor",
      aiBot: "AI Assistant",
      specialist: "Disease Expert",
      community: "Farmer Groups",
      analytics: "Farm Analytics",
    },
    getStarted: "Start Farming Smart",
    login: "Login",
    watchDemo: "Watch Demo",
    aiPowered: "AI-Powered Disease Detection",
    communitySupport: "WhatsApp Farmer Communities",
    expertGuidance: "Expert Farming Guidance",
    trustedBy: "Trusted by farmers across India",
    successStories: "Success Stories",
    testimonial: "Kisan Mitra helped me increase my crop yield by 40% and detect diseases early. It's a game-changer!",
    farmerName: "Rajesh Kumar, Farmer from Punjab",
  },
  hi: {
    title: "किसान मित्र",
    subtitle: "AI-संचालित स्मार्ट कृषि सहायक",
    description:
      "AI-संचालित फसल रोग निदान, वास्तविक समय मौसम, बाजार दरें, व्हाट्सएप किसान समूह और विशेषज्ञ कृषि मार्गदर्शन प्राप्त करें",
    heroSubtext: "टिकाऊ और लाभदायक कृषि के लिए अत्याधुनिक तकनीक से किसानों को सशक्त बनाना",
    features: {
      weather: "मौसम अपडेट",
      market: "बाजार दरें",
      schemes: "सरकारी योजनाएं",
      crops: "फसल सलाहकार",
      aiBot: "AI सहायक",
      specialist: "रोग विशेषज्ञ",
      community: "किसान समूह",
      analytics: "खेत विश्लेषण",
    },
    getStarted: "स्मार्ट खेती शुरू करें",
    login: "लॉगिन",
    watchDemo: "डेमो देखें",
    aiPowered: "AI-संचालित रोग पहचान",
    communitySupport: "व्हाट्सएप किसान समुदाय",
    expertGuidance: "विशेषज्ञ कृषि मार्गदर्शन",
    trustedBy: "भारत भर के किसानों द्वारा विश्वसनीय",
    successStories: "सफलता की कहानियां",
    testimonial: "किसान मित्र ने मेरी फसल की पैदावार 40% बढ़ाने और बीमारियों का जल्दी पता लगाने में मदद की।",
    farmerName: "राजेश कुमार, पंजाब के किसान",
  },
  te: {
    title: "కిసాన్ మిత్ర",
    subtitle: "AI-శక్తితో కూడిన స్మార్ట్ వ్యవసాయ సహాయకుడు",
    description:
      "AI-శక్తితో కూడిన పంట వ్యాధి నిర్ధారణ, రియల్ టైమ్ వాతావరణం, మార్కెట్ రేట్లు, వాట్సాప్ రైతు గ్రూపులు మరియు నిపుణుల వ్యవసాయ మార్గదర్శకత్వం పొందండి",
    heroSubtext: "స్థిరమైన మరియు లాభదాయకమైన వ్యవసాయం కోసం అత్యాధునిక సాంకేతికతతో రైతులను శక్తివంతం చేయడం",
    features: {
      weather: "వాతావరణ అప్‌డేట్‌లు",
      market: "మార్కెట్ రేట్లు",
      schemes: "ప్రభుత్వ పథకాలు",
      crops: "పంట సలహాదారు",
      aiBot: "AI సహాయకుడు",
      specialist: "వ్యాధి నిపుణుడు",
      community: "రైతు గ్రూపులు",
      analytics: "వ్యవసాయ విశ్లేషణ",
    },
    getStarted: "స్మార్ట్ వ్యవసాయం ప్రారంభించండి",
    login: "లాగిన్",
    watchDemo: "డెమో చూడండి",
    aiPowered: "AI-శక్తితో వ్యాధి గుర్తింపు",
    communitySupport: "వాట్సాప్ రైతు కమ్యూనిటీలు",
    expertGuidance: "నిపుణుల వ్యవసాయ మార్గదర్శకత్వం",
    trustedBy: "భారతదేశం అంతటా రైతులచే విశ్వసనీయమైనది",
    successStories: "విజయ కథలు",
    testimonial: "కిసాన్ మిత్ర నా పంట దిగుబడిని 40% పెంచడంలో మరియు వ్యాధులను త్వరగా గుర్తించడంలో సహాయపడింది।",
    farmerName: "రాజేష్ కుమార్, పంజాబ్‌కు చెందిన రైతు",
  },
}

export default function HomePage() {
  const [language, setLanguage] = useState<"en" | "hi" | "te">("en")
  const [isPlaying, setIsPlaying] = useState(false)
  const t = translations[language]

  const getPageContent = () => {
    return `${t.title}. ${t.subtitle}. ${t.description}. ${t.heroSubtext}`
  }

  const features = [
    { 
      icon: Cloud, 
      key: "weather", 
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
      path: "/weather"
    },
    { 
      icon: TrendingUp, 
      key: "market", 
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
      path: "/market"
    },
    { 
      icon: FileText, 
      key: "schemes", 
      color: "bg-gradient-to-r from-purple-500 to-violet-500",
      path: "/schemes"
    },
    { 
      icon: Sprout, 
      key: "crops", 
      color: "bg-gradient-to-r from-orange-500 to-amber-500",
      path: "/crop-advisor"
    },
    { 
      icon: Bot, 
      key: "aiBot", 
      color: "bg-gradient-to-r from-pink-500 to-rose-500",
      path: "/ai-assistant"
    },
    { 
      icon: Stethoscope, 
      key: "specialist", 
      color: "bg-gradient-to-r from-indigo-500 to-blue-500",
      path: "/disease-expert"
    },
    { 
      icon: Users, 
      key: "community", 
      color: "bg-gradient-to-r from-teal-500 to-cyan-500",
      path: "/community"
    },
    { 
      icon: TrendingUp, 
      key: "analytics", 
      color: "bg-gradient-to-r from-yellow-500 to-orange-500",
      path: "/analytics"
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-green-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 bg-yellow-400 rounded-full"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-400 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div
          className="absolute bottom-40 right-10 w-28 h-28 bg-orange-400 rounded-full"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
        />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 p-4 flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Sprout className="h-8 w-8 text-green-600" />
          </motion.div>
          <span className="text-xl font-bold text-green-800">{t.title}</span>
        </motion.div>

        <div className="flex items-center gap-4">
          <motion.select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "hi" | "te")}
            className="px-3 py-1 rounded-lg border border-green-300 bg-white/80 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileFocus={{ scale: 1.05 }}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="te">తెలుగు</option>
          </motion.select>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <VoiceAssistant
              content={getPageContent()}
              language={language}
              size="icon"
              className="backdrop-blur-sm"
            />
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero Section with Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Hero Content */}
            <div className="text-left lg:text-left">
              <motion.h1
                className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
              >
                {t.title}
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl text-green-600 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {t.subtitle}
              </motion.p>
              <motion.p
                className="text-lg text-gray-700 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t.description}
              </motion.p>
              <motion.p
                className="text-md text-gray-600 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {t.heroSubtext}
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Link href="/auth/signup">
                  <motion.div
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3"
                    >
                      {t.getStarted}
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/auth/login">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-8 py-3 bg-white/80 backdrop-blur-sm border-2 border-green-300"
                    >
                      {t.login}
                    </Button>
                  </motion.div>
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="px-8 py-3 text-green-700 hover:bg-green-50"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    {t.watchDemo}
                  </Button>
                </motion.div>
              </motion.div>
            </div>

            {/* Hero Image */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.pexels.com/photos/3770775/pexels-photo-3770775.jpeg"
                  alt="Indian farmers using modern farming technology"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent" />
                <motion.div
                  className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-800">{t.trustedBy}</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Technology Showcase Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div className="relative rounded-xl overflow-hidden shadow-lg">
              <Image
                src="https://images.pexels.com/photos/5230963/pexels-photo-5230963.jpeg"
                alt="Smart farming with tablet technology"
                width={400}
                height={300}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-semibold text-lg">Smart Technology</h3>
                <p className="text-sm opacity-90">Advanced farming tools</p>
              </div>
            </motion.div>

            <motion.div className="relative rounded-xl overflow-hidden shadow-lg">
              <Image
                src="https://images.pexels.com/photos/33339086/pexels-photo-33339086.jpeg"
                alt="Farmers working together in rice field"
                width={400}
                height={300}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-semibold text-lg">Community Power</h3>
                <p className="text-sm opacity-90">Farmers working together</p>
              </div>
            </motion.div>

            <motion.div className="relative rounded-xl overflow-hidden shadow-lg">
              <Image
                src="https://images.pexels.com/photos/7599097/pexels-photo-7599097.jpeg"
                alt="Healthy crop harvest"
                width={400}
                height={300}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-900/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-semibold text-lg">Quality Harvest</h3>
                <p className="text-sm opacity-90">Better crop yields</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <Link href={feature.path} key={feature.key} className="block h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
                whileTap={{
                  scale: 0.98,
                }}
                className="h-full group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.location.href = feature.path;
                  }
                }}
              >
                <Card className="h-full border-2 border-transparent group-hover:border-green-300 transition-all duration-300 bg-white/90 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="text-center relative h-full flex flex-col justify-center">
                    <motion.div
                      className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
                      whileHover={{
                        scale: 1.2,
                        rotate: 360,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                      {t.features[feature.key as keyof typeof t.features]}
                    </CardTitle>
                    <motion.div 
                      className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-1 group-hover:text-green-500 transition-colors"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {language === 'en' ? 'Explore' : language === 'hi' ? 'अन्वेषण करें' : 'అన్వేషించండి'}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </motion.div>

                    {/* Animated background effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-lg"
                      initial={{ opacity: 0, scale: 0 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </CardHeader>
                </Card>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Feature Highlights with Images */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {/* AI Disease Detection */}
          <motion.div whileHover={{ scale: 1.02, y: -5 }} className="group">
            <Card className="h-full bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 group-hover:border-pink-400 transition-all duration-300 overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="https://images.pexels.com/photos/14828474/pexels-photo-14828474.jpeg"
                  alt="AI-powered farming technology"
                  width={400}
                  height={200}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-900/40 to-transparent" />
              </div>
              <CardHeader>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mb-4"
                >
                  <Bot className="h-6 w-6 text-white" />
                </motion.div>
                <CardTitle className="text-xl text-pink-800">{t.aiPowered}</CardTitle>
                <CardDescription className="text-pink-600">
                  {language === "en"
                    ? "Upload crop photos for instant AI-powered disease diagnosis with organic & inorganic treatment options"
                    : language === "hi"
                      ? "तत्काल AI-संचालित रोग निदान के लिए फसल की तस्वीरें अपलोड करें"
                      : "తక్షణ AI-శక్తితో వ్యాధి నిర్ధారణ కోసం పంట ఫోటోలను అప్‌లోడ్ చేయండి"}
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          {/* WhatsApp Communities */}
          <motion.div whileHover={{ scale: 1.02, y: -5 }} className="group">
            <Card className="h-full bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 group-hover:border-green-400 transition-all duration-300 overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="https://images.pexels.com/photos/15031234/pexels-photo-15031234.jpeg"
                  alt="Community support and assistance"
                  width={400}
                  height={200}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 to-transparent" />
              </div>
              <CardHeader>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4"
                >
                  <MessageCircle className="h-6 w-6 text-white" />
                </motion.div>
                <CardTitle className="text-xl text-green-800">{t.communitySupport}</CardTitle>
                <CardDescription className="text-green-600">
                  {language === "en"
                    ? "Join WhatsApp groups with local farmers, share experiences, and get real-time farming advice"
                    : language === "hi"
                      ? "स्थानीय किसानों के साथ व्हाट्सएप समूह में शामिल हों, अनुभव साझा करें"
                      : "స్థానిక రైతులతో వాట్సాప్ గ్రూపులలో చేరండి, అనుభవాలను పంచుకోండి"}
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Expert Guidance */}
          <motion.div whileHover={{ scale: 1.02, y: -5 }} className="group">
            <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 group-hover:border-blue-400 transition-all duration-300 overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="https://images.pexels.com/photos/3220348/pexels-photo-3220348.jpeg"
                  alt="Healthy crop growth and expert guidance"
                  width={400}
                  height={200}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
              </div>
              <CardHeader>
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(59, 130, 246, 0.7)",
                      "0 0 0 10px rgba(59, 130, 246, 0)",
                      "0 0 0 0 rgba(59, 130, 246, 0)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-4"
                >
                  <Stethoscope className="h-6 w-6 text-white" />
                </motion.div>
                <CardTitle className="text-xl text-blue-800">{t.expertGuidance}</CardTitle>
                <CardDescription className="text-blue-600">
                  {language === "en"
                    ? "Get personalized advice from agricultural experts and disease specialists"
                    : language === "hi"
                      ? "कृषि विशेषज्ञों और रोग विशेषज्ञों से व्यक्तिगत सलाह प्राप्त करें"
                      : "వ్యవసాయ నిపుణులు మరియు వ్యాధి నిపుణుల నుండి వ్యక్తిగత సలహా పొందండి"}
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </motion.div>

        {/* Testimonial Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-16"
        >
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-800 mb-4">{t.successStories}</CardTitle>
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-500 fill-current" />
                ))}
              </div>
              <blockquote className="text-lg italic text-gray-700 mb-4">
                "{t.testimonial}"
              </blockquote>
              <cite className="text-sm font-medium text-green-600">- {t.farmerName}</cite>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Enhanced Statistics Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-center"
        >
          <Card className="max-w-6xl mx-auto bg-white/95 backdrop-blur-sm border-2 border-green-200 overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-blue-400/10 to-purple-400/10"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
            />
            <CardHeader className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
              >
                <CardTitle className="text-3xl text-green-800 mb-4">
                  {language === "en"
                    ? "Experience the Future of Smart Farming"
                    : language === "hi"
                      ? "स्मार्ट कृषि के भविष्य का अनुभव करें"
                      : "స్మార్ట్ వ్యవసాయ భవిష్యత్తును అనుభవించండి"}
                </CardTitle>
              </motion.div>
              <CardDescription className="text-lg">
                {language === "en"
                  ? "Join thousands of farmers already using Kisan Mitra for smarter, more profitable farming"
                  : language === "hi"
                    ? "हजारों किसानों के साथ जुड़ें जो पहले से ही स्मार्ट और अधिक लाभदायक खेती के लिए किसान मित्र का उपयोग कर रहे हैं"
                    : "స్మార్ట్, మరింత లాభదాయకమైన వ్యవసాయం కోసం ఇప్పటికే కిసాన్ మిత్రను ఉపయోగిస్తున్న వేలాది రైతులతో చేరండి"}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                {[
                  {
                    number: "50K+",
                    label: language === "en" ? "Active Farmers" : language === "hi" ? "सक्रिय किसान" : "క్రియాశీల రైతులు",
                    color: "text-green-600",
                  },
                  {
                    number: "98%",
                    label:
                      language === "en"
                        ? "Disease Detection Accuracy"
                        : language === "hi"
                          ? "रोग पहचान सटीकता"
                          : "వ్యాధి గుర్తింపు ఖచ్చితత్వం",
                    color: "text-blue-600",
                  },
                  {
                    number: "1000+",
                    label: language === "en" ? "WhatsApp Groups" : language === "hi" ? "व्हाट्सएप समूह" : "వాట్సాప్ గ్రూపులు",
                    color: "text-purple-600",
                  },
                  {
                    number: "24/7",
                    label: language === "en" ? "AI Support" : language === "hi" ? "AI सहायता" : "AI మద్దతు",
                    color: "text-orange-600",
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      className={`text-4xl font-bold ${stat.color} mb-2`}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.5 }}
                    >
                      {stat.number}
                    </motion.div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
