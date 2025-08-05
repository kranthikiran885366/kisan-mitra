"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageCircle,
  Users,
  Search,
  MapPin,
  Send,
  Phone,
  Video,
  MoreVertical,
  Share,
  Camera,
  Mic,
  Paperclip,
  Smile,
  Crown,
  Shield,
  Award,
  Zap,
  Leaf,
  Droplets,
  Sun,
  CloudRain,
  TrendingUp,
  CheckCircle,
  Calendar,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface WhatsAppCommunityProps {
  language: "en" | "hi" | "te"
  user: any
}

const translations = {
  en: {
    title: "Farmer Communities",
    subtitle: "Connect with local farmers via WhatsApp",
    myGroups: "My Groups",
    discoverGroups: "Discover Groups",
    createGroup: "Create Group",
    joinGroup: "Join Group",
    searchGroups: "Search groups...",
    filterBy: "Filter by",
    location: "Location",
    cropType: "Crop Type",
    groupSize: "Group Size",
    activity: "Activity Level",
    members: "members",
    active: "Active",
    moderator: "Moderator",
    admin: "Admin",
    online: "Online",
    offline: "Offline",
    lastSeen: "Last seen",
    typing: "typing...",
    sendMessage: "Send message",
    joinWhatsApp: "Join on WhatsApp",
    groupInfo: "Group Info",
    groupRules: "Group Rules",
    recentActivity: "Recent Activity",
    popularGroups: "Popular Groups",
    nearbyGroups: "Nearby Groups",
    tabs: {
      groups: "Groups",
      chat: "Chat",
      experts: "Experts",
      events: "Events",
    },
    groupTypes: {
      general: "General Farming",
      organic: "Organic Farming",
      vegetables: "Vegetable Farming",
      fruits: "Fruit Farming",
      grains: "Grain Farming",
      livestock: "Livestock",
      market: "Market Updates",
      weather: "Weather Alerts",
      government: "Government Schemes",
      technology: "Farm Technology",
    },
  },
  hi: {
    title: "किसान समुदाय",
    subtitle: "व्हाट्सएप के माध्यम से स्थानीय किसानों से जुड़ें",
    myGroups: "मेरे समूह",
    discoverGroups: "समूह खोजें",
    createGroup: "समूह बनाएं",
    joinGroup: "समूह में शामिल हों",
    searchGroups: "समूह खोजें...",
    filterBy: "फ़िल्टर करें",
    location: "स्थान",
    cropType: "फसल प्रकार",
    groupSize: "समूह आकार",
    activity: "गतिविधि स्तर",
    members: "सदस्य",
    active: "सक्रिय",
    moderator: "मॉडरेटर",
    admin: "एडमिन",
    online: "ऑनलाइन",
    offline: "ऑफलाइन",
    lastSeen: "अंतिम बार देखा गया",
    typing: "टाइप कर रहा है...",
    sendMessage: "संदेश भेजें",
    joinWhatsApp: "व्हाट्सएप पर जुड़ें",
    groupInfo: "समूह जानकारी",
    groupRules: "समूह नियम",
    recentActivity: "हाल की गतिविधि",
    popularGroups: "लोकप्रिय समूह",
    nearbyGroups: "आस-पास के समूह",
    tabs: {
      groups: "समूह",
      chat: "चैट",
      experts: "विशेषज्ञ",
      events: "कार्यक्रम",
    },
    groupTypes: {
      general: "सामान्य कृषि",
      organic: "जैविक कृषि",
      vegetables: "सब्जी की खेती",
      fruits: "फल की खेती",
      grains: "अनाज की खेती",
      livestock: "पशुपालन",
      market: "बाजार अपडेट",
      weather: "मौसम चेतावनी",
      government: "सरकारी योजनाएं",
      technology: "कृषि तकनीक",
    },
  },
  te: {
    title: "రైతు కమ్యూనిటీలు",
    subtitle: "వాట్సాప్ ద్వారా స్థానిక రైతులతో కనెక్ట్ అవ్వండి",
    myGroups: "నా గ్రూపులు",
    discoverGroups: "గ్రూపులను కనుగొనండి",
    createGroup: "గ్రూప్ సృష్టించండి",
    joinGroup: "గ్రూప్‌లో చేరండి",
    searchGroups: "గ్రూపులను వెతకండి...",
    filterBy: "ఫిల్టర్ చేయండి",
    location: "స్థానం",
    cropType: "పంట రకం",
    groupSize: "గ్రూప్ పరిమాణం",
    activity: "కార్యకలాప స్థాయి",
    members: "సభ్యులు",
    active: "క్రియాశీలం",
    moderator: "మోడరేటర్",
    admin: "అడ్మిన్",
    online: "ఆన్‌లైన్",
    offline: "ఆఫ్‌లైన్",
    lastSeen: "చివరిసారి చూసింది",
    typing: "టైప్ చేస్తోంది...",
    sendMessage: "సందేశం పంపండి",
    joinWhatsApp: "వాట్సాప్‌లో చేరండి",
    groupInfo: "గ్రూప్ సమాచారం",
    groupRules: "గ్రూప్ నియమాలు",
    recentActivity: "ఇటీవలి కార్యకలాపాలు",
    popularGroups: "ప్రసిద్ధ గ్రూపులు",
    nearbyGroups: "సమీప గ్రూపులు",
    tabs: {
      groups: "గ్రూపులు",
      chat: "చాట్",
      experts: "నిపుణులు",
      events: "ఈవెంట్లు",
    },
    groupTypes: {
      general: "సాధారణ వ్యవసాయం",
      organic: "సేంద్రీయ వ్యవసాయం",
      vegetables: "కూరగాయల వ్యవసాయం",
      fruits: "పండ్ల వ్యవసాయం",
      grains: "ధాన్యాల వ్యవసాయం",
      livestock: "పశుపోషణ",
      market: "మార్కెట్ అప్‌డేట్‌లు",
      weather: "వాతావరణ హెచ్చరికలు",
      government: "ప్రభుత్వ పథకాలు",
      technology: "వ్యవసాయ సాంకేతికత",
    },
  },
}

// Mock WhatsApp groups data
const mockGroups = [
  {
    id: "1",
    name: "Guntur Farmers United",
    description: "General farming discussions for Guntur district farmers",
    type: "general",
    location: "Guntur, AP",
    members: 245,
    activeMembers: 89,
    lastActivity: "2 minutes ago",
    admin: "Ravi Kumar",
    moderators: ["Priya Sharma", "Suresh Reddy"],
    isJoined: true,
    avatar: "/placeholder.svg?height=60&width=60&text=GFU",
    whatsappLink: "https://chat.whatsapp.com/sample1",
    rules: [
      "Only farming-related discussions",
      "Be respectful to all members",
      "No spam or promotional content",
      "Share knowledge and help others",
    ],
    recentMessages: [
      {
        sender: "Ravi Kumar",
        message: "Weather forecast shows rain this week. Good time for sowing!",
        time: "2 min ago",
        type: "text",
      },
      {
        sender: "Priya Sharma",
        message: "Cotton prices increased by 5% in Guntur market",
        time: "15 min ago",
        type: "text",
      },
    ],
  },
  {
    id: "2",
    name: "Organic Farming AP",
    description: "Dedicated to organic farming practices in Andhra Pradesh",
    type: "organic",
    location: "Andhra Pradesh",
    members: 156,
    activeMembers: 67,
    lastActivity: "5 minutes ago",
    admin: "Dr. Organic Farmer",
    moderators: ["Green Thumb"],
    isJoined: false,
    avatar: "/placeholder.svg?height=60&width=60&text=OFA",
    whatsappLink: "https://chat.whatsapp.com/sample2",
    rules: [
      "Focus on organic methods only",
      "Share organic success stories",
      "Help with organic certification",
      "No chemical farming discussions",
    ],
    recentMessages: [],
  },
  {
    id: "3",
    name: "Rice Farmers Network",
    description: "Everything about rice cultivation and market updates",
    type: "grains",
    location: "Krishna District",
    members: 189,
    activeMembers: 45,
    lastActivity: "1 hour ago",
    admin: "Rice Expert",
    moderators: ["Paddy King"],
    isJoined: true,
    avatar: "/placeholder.svg?height=60&width=60&text=RFN",
    whatsappLink: "https://chat.whatsapp.com/sample3",
    rules: [
      "Rice farming discussions only",
      "Share market price updates",
      "Help with pest management",
      "Discuss new rice varieties",
    ],
    recentMessages: [
      {
        sender: "Rice Expert",
        message: "New high-yield variety available at seed center",
        time: "1 hour ago",
        type: "text",
      },
    ],
  },
  {
    id: "4",
    name: "Vegetable Growers Hub",
    description: "Vegetable farming tips, tricks, and market information",
    type: "vegetables",
    location: "Multiple Districts",
    members: 312,
    activeMembers: 123,
    lastActivity: "30 minutes ago",
    admin: "Veggie Master",
    moderators: ["Tomato King", "Onion Queen"],
    isJoined: false,
    avatar: "/placeholder.svg?height=60&width=60&text=VGH",
    whatsappLink: "https://chat.whatsapp.com/sample4",
    rules: [
      "Vegetable farming focus",
      "Share growing techniques",
      "Market price discussions",
      "Pest and disease solutions",
    ],
    recentMessages: [],
  },
  {
    id: "5",
    name: "Weather Alerts AP",
    description: "Real-time weather updates and farming alerts",
    type: "weather",
    location: "Andhra Pradesh",
    members: 567,
    activeMembers: 234,
    lastActivity: "Just now",
    admin: "Weather Bot",
    moderators: ["Climate Expert"],
    isJoined: true,
    avatar: "/placeholder.svg?height=60&width=60&text=WAP",
    whatsappLink: "https://chat.whatsapp.com/sample5",
    rules: [
      "Weather-related content only",
      "Share local weather observations",
      "Alert about extreme weather",
      "Farming advice based on weather",
    ],
    recentMessages: [
      {
        sender: "Weather Bot",
        message: "🌧️ Heavy rainfall expected in coastal areas tomorrow",
        time: "Just now",
        type: "alert",
      },
      {
        sender: "Climate Expert",
        message: "Perfect conditions for transplanting this week",
        time: "5 min ago",
        type: "text",
      },
    ],
  },
]

// Mock chat messages
const mockChatMessages = [
  {
    id: "1",
    sender: "Ravi Kumar",
    message: "Good morning everyone! How are your crops doing after yesterday's rain?",
    time: "09:15 AM",
    avatar: "/placeholder.svg?height=40&width=40&text=RK",
    isAdmin: true,
    reactions: [
      { emoji: "👍", count: 5 },
      { emoji: "🌱", count: 3 },
    ],
  },
  {
    id: "2",
    sender: "Priya Sharma",
    message: "My tomatoes are looking much better now! The rain was exactly what they needed.",
    time: "09:18 AM",
    avatar: "/placeholder.svg?height=40&width=40&text=PS",
    isModerator: true,
    reactions: [
      { emoji: "🍅", count: 8 },
      { emoji: "👏", count: 4 },
    ],
  },
  {
    id: "3",
    sender: "Suresh Reddy",
    message: "I'm worried about fungal diseases after this humidity. Any organic solutions?",
    time: "09:22 AM",
    avatar: "/placeholder.svg?height=40&width=40&text=SR",
    reactions: [{ emoji: "🤔", count: 2 }],
  },
  {
    id: "4",
    sender: "Dr. Plant Expert",
    message: "For fungal prevention, try neem oil spray early morning. Mix 2ml per liter of water.",
    time: "09:25 AM",
    avatar: "/placeholder.svg?height=40&width=40&text=DE",
    isExpert: true,
    reactions: [
      { emoji: "👨‍⚕️", count: 12 },
      { emoji: "💡", count: 7 },
    ],
  },
  {
    id: "5",
    sender: "You",
    message: "Thanks for the advice! I'll try the neem oil treatment today.",
    time: "09:28 AM",
    avatar: "/placeholder.svg?height=40&width=40&text=U",
    isCurrentUser: true,
  },
]

export function WhatsAppCommunity({ language, user }: WhatsAppCommunityProps) {
  const [activeTab, setActiveTab] = useState("groups")
  const [selectedGroup, setSelectedGroup] = useState<any>(mockGroups[0])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterLocation, setFilterLocation] = useState("all")
  const [newMessage, setNewMessage] = useState("")
  const [showGroupInfo, setShowGroupInfo] = useState(false)

  const t = translations[language]

  const filteredGroups = mockGroups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || group.type === filterType
    const matchesLocation = filterLocation === "all" || group.location.includes(filterLocation)
    return matchesSearch && matchesType && matchesLocation
  })

  const handleJoinGroup = (groupId: string) => {
    // In real implementation, this would open WhatsApp
    window.open(`https://chat.whatsapp.com/sample${groupId}`, "_blank")
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In real implementation, this would send to WhatsApp
      console.log("Sending message:", newMessage)
      setNewMessage("")
    }
  }

  const getGroupTypeIcon = (type: string) => {
    const icons = {
      general: Users,
      organic: Leaf,
      vegetables: Droplets,
      fruits: Sun,
      grains: Leaf,
      livestock: Users,
      market: TrendingUp,
      weather: CloudRain,
      government: Shield,
      technology: Zap,
    }
    return icons[type as keyof typeof icons] || Users
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center"
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
        </div>
      </motion.div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t.tabs.groups}
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {t.tabs.chat}
          </TabsTrigger>
          <TabsTrigger value="experts" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            {t.tabs.experts}
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t.tabs.events}
          </TabsTrigger>
        </TabsList>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder={t.searchGroups}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t.cropType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.entries(t.groupTypes).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterLocation} onValueChange={setFilterLocation}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t.location} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="Guntur">Guntur</SelectItem>
                      <SelectItem value="Krishna">Krishna</SelectItem>
                      <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* My Groups */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  {t.myGroups}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredGroups
                    .filter((group) => group.isJoined)
                    .map((group, index) => (
                      <motion.div
                        key={group.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="cursor-pointer"
                        onClick={() => setSelectedGroup(group)}
                      >
                        <Card className="border-2 border-transparent hover:border-green-300 transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={group.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold">
                                  {group.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="font-bold text-lg">{group.name}</h3>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {group.location}
                                </p>
                              </div>
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                                className="w-3 h-3 bg-green-500 rounded-full"
                              />
                            </div>

                            <p className="text-sm text-gray-700 mb-3 line-clamp-2">{group.description}</p>

                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {group.members} {t.members}
                                </span>
                                <span className="flex items-center gap-1 text-green-600">
                                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                                  {group.activeMembers} {t.active}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {t.groupTypes[group.type as keyof typeof t.groupTypes]}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {t.lastSeen} {group.lastActivity}
                              </span>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActiveTab("chat")
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <MessageCircle className="h-3 w-3 mr-1" />
                                Chat
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Discover Groups */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  {t.discoverGroups}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredGroups
                    .filter((group) => !group.isJoined)
                    .map((group, index) => (
                      <motion.div
                        key={group.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                      >
                        <Card className="h-full border-2 border-transparent hover:border-blue-300 transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={group.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                                  {group.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="font-bold">{group.name}</h3>
                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {group.location}
                                </p>
                              </div>
                            </div>

                            <p className="text-sm text-gray-700 mb-3 line-clamp-2">{group.description}</p>

                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {group.members}
                                </span>
                                <span className="flex items-center gap-1 text-green-600">
                                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                                  {group.activeMembers}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {t.groupTypes[group.type as keyof typeof t.groupTypes]}
                              </Badge>
                            </div>

                            <Button
                              size="sm"
                              onClick={() => handleJoinGroup(group.id)}
                              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                            >
                              <MessageCircle className="h-3 w-3 mr-1" />
                              {t.joinWhatsApp}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
            {/* Group List */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Active Chats</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {mockGroups
                    .filter((group) => group.isJoined)
                    .map((group) => (
                      <motion.div
                        key={group.id}
                        whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                        className={`p-3 cursor-pointer border-b ${
                          selectedGroup?.id === group.id ? "bg-green-50 border-l-4 border-l-green-500" : ""
                        }`}
                        onClick={() => setSelectedGroup(group)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={group.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs font-bold">
                              {group.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{group.name}</h4>
                            <p className="text-xs text-gray-500 truncate">
                              {group.recentMessages[0]?.message || "No recent messages"}
                            </p>
                          </div>
                          <div className="text-xs text-gray-400">{group.lastActivity}</div>
                        </div>
                      </motion.div>
                    ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-3">
              {selectedGroup ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedGroup.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold">
                            {selectedGroup.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold">{selectedGroup.name}</h3>
                          <p className="text-sm text-gray-600">
                            {selectedGroup.activeMembers} {t.online} • {selectedGroup.members} {t.members}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setShowGroupInfo(!showGroupInfo)}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages Area */}
                  <CardContent className="p-0">
                    <ScrollArea className="h-[400px] p-4">
                      <div className="space-y-4">
                        {mockChatMessages.map((message, index) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex gap-3 ${message.isCurrentUser ? "flex-row-reverse" : ""}`}
                          >
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage src={message.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                                {message.sender
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`max-w-[70%] ${message.isCurrentUser ? "items-end" : "items-start"} flex flex-col`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{message.sender}</span>
                                {message.isAdmin && <Crown className="h-3 w-3 text-yellow-500" />}
                                {message.isModerator && <Shield className="h-3 w-3 text-blue-500" />}
                                {message.isExpert && <Award className="h-3 w-3 text-purple-500" />}
                                <span className="text-xs text-gray-500">{message.time}</span>
                              </div>
                              <div
                                className={`rounded-2xl px-4 py-2 ${
                                  message.isCurrentUser ? "bg-green-500 text-white" : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                <p className="text-sm">{message.message}</p>
                              </div>
                              {message.reactions && message.reactions.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {message.reactions.map((reaction, reactionIndex) => (
                                    <motion.button
                                      key={reactionIndex}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="bg-white border rounded-full px-2 py-1 text-xs flex items-center gap-1 shadow-sm"
                                    >
                                      <span>{reaction.emoji}</span>
                                      <span>{reaction.count}</span>
                                    </motion.button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="border-t p-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Camera className="h-4 w-4" />
                        </Button>
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={t.sendMessage}
                          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button variant="ghost" size="icon">
                          <Smile className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Mic className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-600 mb-2">Select a Group</h3>
                    <p className="text-gray-500">Choose a group from the left to start chatting</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Group Info Sidebar */}
          <AnimatePresence>
            {showGroupInfo && selectedGroup && (
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                className="fixed right-4 top-4 bottom-4 w-80 bg-white rounded-lg shadow-2xl border-2 border-gray-200 z-50 overflow-hidden"
              >
                <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{t.groupInfo}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={() => setShowGroupInfo(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-full p-4">
                  <div className="space-y-6">
                    {/* Group Details */}
                    <div className="text-center">
                      <Avatar className="w-20 h-20 mx-auto mb-3">
                        <AvatarImage src={selectedGroup.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-xl">
                          {selectedGroup.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-xl">{selectedGroup.name}</h3>
                      <p className="text-gray-600">{selectedGroup.description}</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{selectedGroup.members}</div>
                        <div className="text-sm text-gray-600">{t.members}</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{selectedGroup.activeMembers}</div>
                        <div className="text-sm text-gray-600">{t.active}</div>
                      </div>
                    </div>

                    {/* Group Rules */}
                    <div>
                      <h4 className="font-bold mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        {t.groupRules}
                      </h4>
                      <ul className="space-y-2">
                        {selectedGroup.rules.map((rule: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Admin & Moderators */}
                    <div>
                      <h4 className="font-bold mb-3">Admin & Moderators</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                          <Crown className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{selectedGroup.admin}</span>
                          <Badge variant="outline" className="text-xs">
                            Admin
                          </Badge>
                        </div>
                        {selectedGroup.moderators.map((mod: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                            <Shield className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">{mod}</span>
                            <Badge variant="outline" className="text-xs">
                              Moderator
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleJoinGroup(selectedGroup.id)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {t.joinWhatsApp}
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent">
                        <Share className="h-4 w-4 mr-2" />
                        Share Group
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Experts Tab */}
        <TabsContent value="experts" className="space-y-6">
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">Expert Consultations</h3>
            <p className="text-gray-500">Connect with agricultural experts through WhatsApp groups</p>
            <Button className="mt-4">Find Expert Groups</Button>
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">Farming Events</h3>
            <p className="text-gray-500">Discover and join farming events organized by community groups</p>
            <Button className="mt-4">Browse Events</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
