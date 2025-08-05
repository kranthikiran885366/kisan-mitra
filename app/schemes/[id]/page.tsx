"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  ExternalLink, 
  Calendar, 
  IndianRupee, 
  Users, 
  FileText, 
  CheckCircle, 
  Clock,
  Phone,
  Globe,
  Download,
  Share2
} from "lucide-react"

interface SchemeDetail {
  id: string
  title: string
  titleHi?: string
  titleTe?: string
  description: string
  descriptionHi?: string
  descriptionTe?: string
  amount: string
  deadline: string
  status: string
  category: string
  level: string
  eligibility: string
  documents: string[]
  applicationLink: string
  benefits: string
  howToApply: string
}

const translations = {
  en: {
    backToSchemes: "Back to Schemes",
    schemeDetails: "Scheme Details",
    eligibility: "Eligibility Criteria",
    documents: "Required Documents",
    benefits: "Key Benefits",
    howToApply: "How to Apply",
    applicationDeadline: "Application Deadline",
    schemeAmount: "Scheme Amount",
    targetBeneficiaries: "Target Beneficiaries",
    applyNow: "Apply Now",
    downloadGuidelines: "Download Guidelines",
    shareScheme: "Share Scheme",
    contactSupport: "Contact Support",
    loading: "Loading scheme details...",
    error: "Failed to load scheme details",
    retry: "Retry",
    central: "Central Government",
    state: "State Government",
    featured: "Featured",
    new: "New",
    active: "Active",
    expired: "Expired"
  },
  hi: {
    backToSchemes: "योजनाओं पर वापस",
    schemeDetails: "योजना विवरण",
    eligibility: "पात्रता मानदंड",
    documents: "आवश्यक दस्तावेज",
    benefits: "मुख्य लाभ",
    howToApply: "आवेदन कैसे करें",
    applicationDeadline: "आवेदन की अंतिम तिथि",
    schemeAmount: "योजना राशि",
    targetBeneficiaries: "लक्षित लाभार्थी",
    applyNow: "अभी आवेदन करें",
    downloadGuidelines: "दिशानिर्देश डाउनलोड करें",
    shareScheme: "योजना साझा करें",
    contactSupport: "सहायता से संपर्क करें",
    loading: "योजना विवरण लोड हो रहा है...",
    error: "योजना विवरण लोड करने में विफल",
    retry: "पुनः प्रयास करें",
    central: "केंद्र सरकार",
    state: "राज्य सरकार",
    featured: "विशेष",
    new: "नई",
    active: "सक्रिय",
    expired: "समाप्त"
  },
  te: {
    backToSchemes: "పథకాలకు తిరిగి",
    schemeDetails: "పథకం వివరాలు",
    eligibility: "అర్హత ప్రమాణాలు",
    documents: "అవసరమైన పత్రాలు",
    benefits: "ముఖ్య ప్రయోజనాలు",
    howToApply: "ఎలా దరఖాస్తు చేయాలి",
    applicationDeadline: "దరఖాస్తు గడువు",
    schemeAmount: "పథకం మొత్తం",
    targetBeneficiaries: "లక్ష్య లబ్ధిదారులు",
    applyNow: "ఇప్పుడే దరఖాస్తు చేయండి",
    downloadGuidelines: "మార్గదర్శకాలను డౌన్‌లోడ్ చేయండి",
    shareScheme: "పథకాన్ని పంచుకోండి",
    contactSupport: "మద్దతును సంప్రదించండి",
    loading: "పథకం వివరాలు లోడ్ అవుతున్నాయి...",
    error: "పథకం వివరాలను లోడ్ చేయడంలో విఫలమైంది",
    retry: "మళ్లీ ప్రయత్నించండి",
    central: "కేంద్ర ప్రభుత్వం",
    state: "రాష్ట్ర ప్రభుత్వం",
    featured: "ప్రత్యేక",
    new: "కొత్త",
    active: "క్రియాశీల",
    expired: "గడువు ముగిసింది"
  }
}

// Mock scheme data
const mockScheme: SchemeDetail = {
  id: "pm-kisan",
  title: "PM-KISAN Scheme",
  titleHi: "पीएम-किसान योजना",
  titleTe: "పిఎం-కిసాన్ పథకం",
  description: "Direct income support to farmers providing ₹6000 per year in three equal installments",
  descriptionHi: "किसानों को प्रत्यक्ष आय सहायता - ₹6000 प्रति वर्ष तीन समान किस्तों में",
  descriptionTe: "రైతులకు ప్రత్యక్ష ఆదాయ మద్దతు - సంవత్సరానికి ₹6000 మూడు సమాన వాయిదాలలో",
  amount: "₹6,000/year",
  deadline: "2024-12-31",
  status: "featured",
  category: "financial",
  level: "central",
  eligibility: "Small and marginal farmers",
  documents: ["Aadhaar Card", "Bank Account", "Land Records", "Passport Photo"],
  applicationLink: "https://pmkisan.gov.in",
  benefits: "Direct cash transfer to bank account, No middleman involvement, Quick processing, Timely payments",
  howToApply: "Visit official website, Fill online form, Upload documents, Submit application, Track status"
}

export default function SchemeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [language, setLanguage] = useState<"en" | "hi" | "te">("en")
  const [scheme, setScheme] = useState<SchemeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const t = translations[language]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setScheme(mockScheme)
      setLoading(false)
    }, 1000)
  }, [params.id])

  const getLocalizedTitle = (scheme: SchemeDetail) => {
    switch (language) {
      case "hi": return scheme.titleHi || scheme.title
      case "te": return scheme.titleTe || scheme.title
      default: return scheme.title
    }
  }

  const getLocalizedDescription = (scheme: SchemeDetail) => {
    switch (language) {
      case "hi": return scheme.descriptionHi || scheme.description
      case "te": return scheme.descriptionTe || scheme.description
      default: return scheme.description
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      new: "bg-blue-100 text-blue-800",
      featured: "bg-purple-100 text-purple-800",
      expired: "bg-red-100 text-red-800"
    }
    return variants[status as keyof typeof variants] || variants.active
  }

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { text: "Expired", urgent: true }
    if (diffDays === 0) return { text: "Today", urgent: true }
    if (diffDays === 1) return { text: "Tomorrow", urgent: true }
    if (diffDays <= 7) return { text: `${diffDays} days left`, urgent: true }
    return { text: date.toLocaleDateString(), urgent: false }
  }

  const handleShare = async () => {
    if (navigator.share && scheme) {
      try {
        await navigator.share({
          title: getLocalizedTitle(scheme),
          text: getLocalizedDescription(scheme),
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t.loading}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !scheme) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">{t.error}</p>
              <Button onClick={() => setLoading(true)} variant="outline">
                {t.retry}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const deadlineInfo = formatDeadline(scheme.deadline)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t.backToSchemes}
              </Button>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "en" | "hi" | "te")}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="te">తెలుగు</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                {t.shareScheme}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scheme Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusBadge(scheme.status)}>
                        {t[scheme.status as keyof typeof t] || scheme.status}
                      </Badge>
                      <Badge variant="outline">
                        {scheme.category}
                      </Badge>
                      <Badge variant="outline">
                        {t[scheme.level as keyof typeof t] || scheme.level}
                      </Badge>
                    </div>
                    <div className={`flex items-center text-sm ${deadlineInfo.urgent ? 'text-red-600' : 'text-gray-500'}`}>
                      <Clock className="h-4 w-4 mr-1" />
                      {deadlineInfo.text}
                    </div>
                  </div>
                  <CardTitle className="text-2xl leading-tight">
                    {getLocalizedTitle(scheme)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {getLocalizedDescription(scheme)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Key Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t.schemeDetails}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <IndianRupee className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-500">{t.schemeAmount}</p>
                        <p className="font-semibold">{scheme.amount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">{t.applicationDeadline}</p>
                        <p className="font-semibold">{new Date(scheme.deadline).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-500">{t.targetBeneficiaries}</p>
                        <p className="font-semibold">{scheme.eligibility}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    {t.benefits}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {scheme.benefits.split(', ').map((benefit, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* How to Apply */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t.howToApply}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scheme.howToApply.split(', ').map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Now Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-lg mb-4">Ready to Apply?</h3>
                  <Button 
                    size="lg" 
                    className="w-full mb-3"
                    onClick={() => window.open(scheme.applicationLink, '_blank')}
                  >
                    {t.applyNow}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                  <p className="text-sm text-gray-600">
                    {language === "en" 
                      ? "Click to visit the official application portal"
                      : language === "hi"
                      ? "आधिकारिक आवेदन पोर्टल पर जाने के लिए क्लिक करें"
                      : "అధికారిక దరఖాస్తు పోర్టల్‌ను సందర్శించడానికి క్లిక్ చేయండి"
                    }
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Required Documents */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.documents}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {scheme.documents.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{doc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Support */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.contactSupport}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Helpline
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    {t.downloadGuidelines}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}