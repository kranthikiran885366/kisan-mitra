"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, Calendar, ArrowRight, Filter, ExternalLink, Clock, Users, IndianRupee, Bookmark, Share2, Heart } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { schemesApi, type Scheme, type SchemeFilters } from "@/lib/schemesApi"

const translations = {
  en: {
    title: "Government Schemes",
    searchPlaceholder: "Search schemes...",
    allSchemes: "All Schemes",
    centralGovt: "Central Government",
    stateGovt: "State Government",
    filterBy: "Filter by",
    allCategories: "All Categories",
    financialAssistance: "Financial Assistance",
    insurance: "Insurance",
    technical: "Technical Support",
    credit: "Credit Facilities",
    sortBy: "Sort by",
    newestFirst: "Newest First",
    popular: "Most Popular",
    deadline: "Application Deadline",
    viewDetails: "View Details",
    applyNow: "Apply Now",
    backToDashboard: "Back to Dashboard",
    noSchemes: "No schemes found matching your criteria.",
    deadlineLabel: "Deadline",
    eligibility: "Eligibility",
    benefits: "Benefits",
    documentsRequired: "Documents Required",
    applyOnline: "Apply Online",
    lastDate: "Last date to apply",
    loading: "Loading schemes...",
    error: "Failed to load schemes",
    retry: "Retry",
    featured: "Featured",
    new: "New",
    active: "Active",
    amount: "Amount",
    beneficiaries: "Beneficiaries",
  },
  hi: {
    title: "सरकारी योजनाएं",
    searchPlaceholder: "योजनाएं खोजें...",
    allSchemes: "सभी योजनाएं",
    centralGovt: "केंद्र सरकार",
    stateGovt: "राज्य सरकार",
    filterBy: "फिल्टर करें",
    allCategories: "सभी श्रेणियां",
    financialAssistance: "वित्तीय सहायता",
    insurance: "बीमा",
    technical: "तकनीकी सहायता",
    credit: "ऋण सुविधाएं",
    sortBy: "क्रमबद्ध करें",
    newestFirst: "नवीनतम पहले",
    popular: "सबसे लोकप्रिय",
    deadline: "आवेदन की अंतिम तिथि",
    viewDetails: "विवरण देखें",
    applyNow: "अभी आवेदन करें",
    backToDashboard: "डैशबोर्ड पर वापस",
    noSchemes: "आपके मानदंडों से मेल खाने वाली कोई योजना नहीं मिली।",
    deadlineLabel: "अंतिम तिथि",
    eligibility: "पात्रता",
    benefits: "लाभ",
    documentsRequired: "आवश्यक दस्तावेज",
    applyOnline: "ऑनलाइन आवेदन करें",
    lastDate: "आवेदन की अंतिम तिथि",
    loading: "योजनाएं लोड हो रही हैं...",
    error: "योजनाएं लोड करने में विफल",
    retry: "पुनः प्रयास करें",
    featured: "विशेष",
    new: "नई",
    active: "सक्रिय",
    amount: "राशि",
    beneficiaries: "लाभार्थी",
  },
  te: {
    title: "ప్రభుత్వ పథకాలు",
    searchPlaceholder: "పథకాలను వెతకండి...",
    allSchemes: "అన్ని పథకాలు",
    centralGovt: "కేంద్ర ప్రభుత్వం",
    stateGovt: "రాష్ట్ర ప్రభుత్వం",
    filterBy: "ఫిల్టర్ చేయండి",
    allCategories: "అన్ని వర్గాలు",
    financialAssistance: "ఆర్థిక సహాయం",
    insurance: "బీమా",
    technical: "సాంకేతిక మద్దతు",
    credit: "రుణ సౌకర్యాలు",
    sortBy: "క్రమబద్ధీకరించండి",
    newestFirst: "కొత్తవి మొదట",
    popular: "అత్యంత ప్రాచుర్యం",
    deadline: "దరఖాస్తు గడువు",
    viewDetails: "వివరాలు చూడండి",
    applyNow: "ఇప్పుడే దరఖాస్తు చేయండి",
    backToDashboard: "డ్యాష్‌బోర్డ్‌కు తిరిగి",
    noSchemes: "మీ ప్రమాణాలకు సరిపోలే పథకాలు కనుగొనబడలేదు.",
    deadlineLabel: "గడువు",
    eligibility: "అర్హత",
    benefits: "ప్రయోజనాలు",
    documentsRequired: "అవసరమైన పత్రాలు",
    applyOnline: "ఆన్‌లైన్‌లో దరఖాస్తు చేయండి",
    lastDate: "దరఖాస్తు చేయడానికి చివరి తేదీ",
    loading: "పథకాలు లోడ్ అవుతున్నాయి...",
    error: "పథకాలను లోడ్ చేయడంలో విఫలమైంది",
    retry: "మళ్లీ ప్రయత్నించండి",
    featured: "ప్రత్యేక",
    new: "కొత్త",
    active: "క్రియాశీల",
    amount: "మొత్తం",
    beneficiaries: "లబ్ధిదారులు",
  },
}



export default function SchemesPage() {
  const [language, setLanguage] = useState<"en" | "hi" | "te">("en")
  const [schemes, setSchemes] = useState<Scheme[]>([])
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [bookmarkedSchemes, setBookmarkedSchemes] = useState<Set<string>>(new Set())
  const router = useRouter()
  const t = translations[language]

  const handleBookmark = (schemeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newBookmarks = new Set(bookmarkedSchemes)
    if (newBookmarks.has(schemeId)) {
      newBookmarks.delete(schemeId)
      alert('Scheme removed from bookmarks!')
    } else {
      newBookmarks.add(schemeId)
      alert('Scheme bookmarked successfully!')
    }
    setBookmarkedSchemes(newBookmarks)
  }

  const handleShare = (scheme: any, e: React.MouseEvent) => {
    e.stopPropagation()
    const shareText = `Check out this government scheme: ${getLocalizedTitle(scheme, language)}\n\nAmount: ${scheme.amount?.description || scheme.amount}\nDeadline: ${formatDeadline(scheme.deadline)}\n\nApply at: ${scheme.applicationProcess?.url || '#'}`
    
    if (navigator.share) {
      navigator.share({
        title: getLocalizedTitle(scheme, language),
        text: shareText,
        url: scheme.applicationProcess?.url || '#'
      })
    } else {
      navigator.clipboard.writeText(shareText)
      alert('Scheme details copied to clipboard!')
    }
  }

  const checkEligibility = async (scheme: any, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Mock user profile - in real app, get from user context
    const userProfile = {
      landSize: 2.5,
      income: 150000,
      age: 35,
      category: 'General',
      state: 'Telangana',
      crops: ['Rice', 'Cotton']
    }
    
    try {
      const response = await fetch('/api/schemes/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemeId: scheme._id || scheme.id,
          userProfile
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        const { eligible, eligibilityScore, reasons, potentialBenefit } = result.data
        
        let message = `Eligibility Check: ${getLocalizedTitle(scheme, language)}\n\n`
        message += `Status: ${eligible ? '✅ ELIGIBLE' : '❌ NOT ELIGIBLE'}\n`
        message += `Score: ${eligibilityScore}/100\n\n`
        
        if (potentialBenefit > 0) {
          message += `Potential Benefit: ₹${potentialBenefit.toLocaleString()}\n\n`
        }
        
        if (reasons.length > 0) {
          message += `Details:\n${reasons.join('\n')}\n\n`
        }
        
        message += eligible ? 'You can apply for this scheme!' : 'Check other available schemes.'
        
        alert(message)
      }
    } catch (error) {
      alert('Error checking eligibility. Please try again.')
    }
  }

  // Fetch schemes from API
  useEffect(() => {
    fetchSchemes()
  }, [selectedCategory, selectedLevel, language])

  // Real-time search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        fetchSchemes()
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const fetchSchemes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filters: SchemeFilters = {
        language,
        limit: 20,
        page: 1,
        sortBy
      }
      
      if (selectedCategory !== "all") filters.category = selectedCategory
      if (selectedLevel !== "all") filters.level = selectedLevel as "central" | "state"
      if (searchTerm) filters.search = searchTerm
      
      const data = await schemesApi.getSchemes(filters)
      setSchemes(data.schemes || [])
      
      // Update real-time statistics
      console.log(`📊 Loaded ${data.schemes?.length || 0} schemes`)
      console.log(`💰 Total potential benefits: ₹${data.meta?.totalAmount?.toLocaleString() || 0}`)
      
    } catch (err) {
      console.error("Error fetching schemes:", err)
      setError(err instanceof Error ? err.message : "Failed to load schemes")
      
      // Show user-friendly error with retry option
      if (err instanceof Error && err.message.includes('network')) {
        setError('Network error. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort schemes
  useEffect(() => {
    let filtered = [...schemes]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(scheme => {
        const title = getLocalizedTitle(scheme, language)
        const description = getLocalizedDescription(scheme, language)
        return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               description.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    // Level filter
    if (selectedLevel !== "all") {
      filtered = filtered.filter(scheme => scheme.level === selectedLevel)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
        case "popular":
          return a.status === "featured" ? -1 : b.status === "featured" ? 1 : 0
        case "deadline":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        default:
          return 0
      }
    })

    setFilteredSchemes(filtered)
  }, [schemes, searchTerm, selectedLevel, sortBy, language])

  const getLocalizedTitle = (scheme: Scheme, lang: string) => {
    switch (lang) {
      case "hi": return scheme.titleHi || scheme.title
      case "te": return scheme.titleTe || scheme.title
      default: return scheme.title
    }
  }

  const getLocalizedDescription = (scheme: Scheme, lang: string) => {
    switch (lang) {
      case "hi": return scheme.descriptionHi || scheme.description
      case "te": return scheme.descriptionTe || scheme.description
      default: return scheme.description
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      new: "bg-blue-100 text-blue-800",
      featured: "bg-purple-100 text-purple-800"
    }
    return variants[status as keyof typeof variants] || variants.active
  }

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return "Expired"
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays <= 7) return `${diffDays} days left`
    return date.toLocaleDateString()
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">{t.error}</p>
              <Button onClick={fetchSchemes} variant="outline">
                {t.retry}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-gray-600 mt-1">
                {language === "en" 
                  ? "Discover government schemes and benefits for farmers"
                  : language === "hi"
                  ? "किसानों के लिए सरकारी योजनाओं और लाभों की खोज करें"
                  : "రైతుల కోసం ప్రభుత్వ పథకాలు మరియు ప్రయోజనాలను కనుగొనండి"
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "en" | "hi" | "te")}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="te">తెలుగు</option>
              </select>
              <Link href="/dashboard">
                <Button variant="outline">{t.backToDashboard}</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t.filterBy} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allCategories}</SelectItem>
                <SelectItem value="financial">{t.financialAssistance}</SelectItem>
                <SelectItem value="insurance">{t.insurance}</SelectItem>
                <SelectItem value="technical">{t.technical}</SelectItem>
                <SelectItem value="credit">{t.credit}</SelectItem>
              </SelectContent>
            </Select>

            {/* Level Filter */}
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Government Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allSchemes}</SelectItem>
                <SelectItem value="central">{t.centralGovt}</SelectItem>
                <SelectItem value="state">{t.stateGovt}</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder={t.sortBy} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t.newestFirst}</SelectItem>
                <SelectItem value="popular">{t.popular}</SelectItem>
                <SelectItem value="deadline">{t.deadline}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Schemes Grid */}
        {filteredSchemes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">{t.noSchemes}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme, index) => (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  className="h-full hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-green-500 cursor-pointer"
                  onClick={() => {
                    console.log('Scheme clicked:', scheme.title)
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge 
                        className={`${getStatusBadge(scheme.status)} cursor-pointer hover:opacity-80`}
                        onClick={(e) => {
                          e.stopPropagation()
                          const statusInfo = {
                            active: 'This scheme is currently accepting applications',
                            new: 'This is a newly launched scheme',
                            featured: 'This scheme is specially recommended for you'
                          }
                          alert(`Status: ${scheme.status.toUpperCase()}\n\n${statusInfo[scheme.status as keyof typeof statusInfo] || 'Scheme status information'}`)
                        }}
                      >
                        {t[scheme.status as keyof typeof t] || scheme.status}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => handleBookmark(scheme.id, e)}
                        >
                          <Bookmark 
                            className={`h-4 w-4 ${
                              bookmarkedSchemes.has(scheme.id) 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-400 hover:text-yellow-400'
                            }`} 
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => handleShare(scheme, e)}
                        >
                          <Share2 className="h-4 w-4 text-gray-400 hover:text-blue-400" />
                        </Button>
                        <div 
                          className="flex items-center text-sm text-gray-500 cursor-pointer hover:text-gray-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            const deadline = new Date(scheme.deadline)
                            const today = new Date()
                            const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                            alert(`Application Deadline\n\nLast Date: ${deadline.toLocaleDateString()}\nDays Remaining: ${daysLeft > 0 ? daysLeft : 'Expired'}\n\nDon't miss the deadline!`)
                          }}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDeadline(scheme.deadline)}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {getLocalizedTitle(scheme, language)}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {getLocalizedDescription(scheme, language)}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-green-600">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        <span className="font-semibold">
                          {scheme.amount?.description || scheme.amount || 'Amount varies'}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{scheme.eligibility?.category?.join(', ') || scheme.eligibility || 'All farmers'}</span>
                      </div>
                    </div>

                    {/* Real-time eligibility check */}
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={(e) => checkEligibility(scheme, e)}
                      >
                        🔍 Check My Eligibility
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">{t.documentsRequired}:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {scheme.documents.slice(0, 3).map((doc, idx) => (
                            <Badge 
                              key={idx} 
                              variant="secondary" 
                              className="text-xs cursor-pointer hover:bg-gray-200"
                              onClick={(e) => {
                                e.stopPropagation()
                                alert(`Document Required: ${doc}\n\nThis document is mandatory for the application process.`)
                              }}
                            >
                              {doc}
                            </Badge>
                          ))}
                          {scheme.documents.length > 3 && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs cursor-pointer hover:bg-gray-200"
                              onClick={(e) => {
                                e.stopPropagation()
                                alert(`All Required Documents:\n\n${scheme.documents.join('\n')}`)
                              }}
                            >
                              +{scheme.documents.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        alert(`Viewing details for: ${getLocalizedTitle(scheme, language)}\n\nEligibility: ${scheme.eligibility}\nBenefits: ${scheme.benefits}\nDocuments: ${scheme.documents.join(', ')}\n\nDeadline: ${formatDeadline(scheme.deadline)}`)
                      }}
                    >
                      {t.viewDetails}
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        const applicationUrl = scheme.applicationProcess?.url || scheme.applicationLink || '#'
                        const steps = scheme.applicationProcess?.steps || []
                        
                        let message = `Apply for ${getLocalizedTitle(scheme, language)}?\n\n`
                        message += `💰 Amount: ${scheme.amount?.description || scheme.amount}\n`
                        message += `📅 Deadline: ${formatDeadline(scheme.deadline)}\n\n`
                        
                        if (steps.length > 0) {
                          message += `Application Steps:\n${steps.slice(0, 3).map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}\n\n`
                        }
                        
                        message += 'This will redirect you to the official portal.'
                        
                        if (confirm(message)) {
                          if (applicationUrl !== '#') {
                            window.open(applicationUrl, '_blank')
                          } else {
                            alert('Application portal will be available soon. Please check back later.')
                          }
                        }
                      }}
                    >
                      {t.applyNow}
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredSchemes.length > 0 && filteredSchemes.length >= 6 && (
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                alert('Loading more schemes...\n\nThis would typically fetch more data from the server.')
                // In a real app, this would load more schemes
                console.log('Loading more schemes...')
              }}
            >
              Load More Schemes
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}