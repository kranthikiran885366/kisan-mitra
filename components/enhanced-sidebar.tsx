"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  Sprout,
  Cloud,
  TrendingUp,
  FileText,
  Bot,
  Users,
  Stethoscope,
  BarChart3,
  MessageCircle,
  Calendar,
  Settings,
  HelpCircle,
  Bell,
  User,
  LogOut,
  ChevronRight,
  Droplets,
  Sun,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Clock,
  Star,
  Target,
  Award,
  Globe,
  CloudRain,
  Eye,
  PieChart,
  LineChart,
  BarChart,
  TrendingUpIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface EnhancedSidebarProps {
  user: any
  language: "en" | "hi" | "te"
  activeTab: string
  setActiveTab: (tab: string) => void
  onLogout: () => void
}

const translations = {
  en: {
    dashboard: "Dashboard",
    weather: "Weather Center",
    crops: "Crop Management",
    mandis: "Market Intelligence",
    schemes: "Government Schemes",
    aiBot: "AI Assistant",
    specialist: "Disease Specialist",
    community: "Farmer Groups",
    analytics: "Farm Analytics",
    profile: "My Profile",
    settings: "Settings",
    help: "Help & Support",
    notifications: "Notifications",
    logout: "Logout",

    // Sub-menus
    weatherSub: {
      current: "Current Weather",
      forecast: "7-Day Forecast",
      alerts: "Weather Alerts",
      history: "Weather History",
    },
    cropsSub: {
      recommendations: "Crop Recommendations",
      calendar: "Farming Calendar",
      diseases: "Disease Detection",
      fertilizers: "Fertilizer Guide",
    },
    marketSub: {
      prices: "Live Prices",
      trends: "Price Trends",
      analysis: "Market Analysis",
      alerts: "Price Alerts",
    },
    communitySub: {
      groups: "WhatsApp Groups",
      forums: "Discussion Forums",
      experts: "Expert Connect",
      events: "Farming Events",
    },
    analyticsSub: {
      overview: "Farm Overview",
      yield: "Yield Analysis",
      expenses: "Cost Analysis",
      profit: "Profit Tracking",
    },
  },
  hi: {
    dashboard: "डैशबोर्ड",
    weather: "मौसम केंद्र",
    crops: "फसल प्रबंधन",
    mandis: "बाजार बुद्धिमत्ता",
    schemes: "सरकारी योजनाएं",
    aiBot: "AI सहायक",
    specialist: "रोग विशेषज्ञ",
    community: "किसान समूह",
    analytics: "खेत विश्लेषण",
    profile: "मेरी प्रोफाइल",
    settings: "सेटिंग्स",
    help: "सहायता और समर्थन",
    notifications: "सूचनाएं",
    logout: "लॉगआउट",

    weatherSub: {
      current: "वर्तमान मौसम",
      forecast: "7-दिन पूर्वानुमान",
      alerts: "मौसम चेतावनी",
      history: "मौसम इतिहास",
    },
    cropsSub: {
      recommendations: "फसल सुझाव",
      calendar: "कृषि कैलेंडर",
      diseases: "रोग पहचान",
      fertilizers: "उर्वरक गाइड",
    },
    marketSub: {
      prices: "लाइव कीमतें",
      trends: "मूल्य रुझान",
      analysis: "बाजार विश्लेषण",
      alerts: "मूल्य अलर्ट",
    },
    communitySub: {
      groups: "व्हाट्सएप समूह",
      forums: "चर्चा मंच",
      experts: "विशेषज्ञ कनेक्ट",
      events: "कृषि कार्यक्रम",
    },
    analyticsSub: {
      overview: "खेत अवलोकन",
      yield: "उत्पादन विश्लेषण",
      expenses: "लागत विश्लेषण",
      profit: "लाभ ट्रैकिंग",
    },
  },
  te: {
    dashboard: "డ్యాష్‌బోర్డ్",
    weather: "వాతావరణ కేంద్రం",
    crops: "పంట నిర్వహణ",
    mandis: "మార్కెట్ ఇంటెలిజెన్స్",
    schemes: "ప్రభుత్వ పథకాలు",
    aiBot: "AI సహాయకుడు",
    specialist: "వ్యాధి నిపుణుడు",
    community: "రైతు గ్రూపులు",
    analytics: "వ్యవసాయ విశ్లేషణ",
    profile: "నా ప్రొఫైల్",
    settings: "సెట్టింగ్‌లు",
    help: "సహాయం & మద్దతు",
    notifications: "నోటిఫికేషన్లు",
    logout: "లాగ్అవుట్",

    weatherSub: {
      current: "ప్రస్తుత వాతావరణం",
      forecast: "7-రోజుల అంచనా",
      alerts: "వాతావరణ హెచ్చరికలు",
      history: "వాతావరణ చరిత్ర",
    },
    cropsSub: {
      recommendations: "పంట సూచనలు",
      calendar: "వ్యవసాయ క్యాలెండర్",
      diseases: "వ్యాధి గుర్తింపు",
      fertilizers: "ఎరువుల గైడ్",
    },
    marketSub: {
      prices: "లైవ్ ధరలు",
      trends: "ధర ట్రెండ్‌లు",
      analysis: "మార్కెట్ విశ్లేషణ",
      alerts: "ధర అలర్ట్‌లు",
    },
    communitySub: {
      groups: "వాట్సాప్ గ్రూపులు",
      forums: "చర్చా వేదికలు",
      experts: "నిపుణుల కనెక్ట్",
      events: "వ్యవసాయ కార్యక్రమాలు",
    },
    analyticsSub: {
      overview: "వ్యవసాయ అవలోకనం",
      yield: "దిగుబడి విశ్లేషణ",
      expenses: "ఖర్చు విశ్లేషణ",
      profit: "లాభం ట్రాకింగ్",
    },
  },
}

export function EnhancedSidebar({ user, language, activeTab, setActiveTab, onLogout }: EnhancedSidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const t = translations[language]

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => (prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]))
  }

  const mainMenuItems = [
    {
      id: "dashboard",
      icon: BarChart3,
      label: t.dashboard,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      notifications: 0,
    },
    {
      id: "weather",
      icon: Cloud,
      label: t.weather,
      color: "text-sky-600",
      bgColor: "bg-sky-50",
      notifications: 2,
      subItems: [
        { id: "weather-current", icon: Sun, label: t.weatherSub.current },
        { id: "weather-forecast", icon: CloudRain, label: t.weatherSub.forecast },
        { id: "weather-alerts", icon: AlertTriangle, label: t.weatherSub.alerts },
        { id: "weather-history", icon: Clock, label: t.weatherSub.history },
      ],
    },
    {
      id: "crops",
      icon: Sprout,
      label: t.crops,
      color: "text-green-600",
      bgColor: "bg-green-50",
      notifications: 1,
      subItems: [
        { id: "crops-recommendations", icon: Target, label: t.cropsSub.recommendations },
        { id: "crops-calendar", icon: Calendar, label: t.cropsSub.calendar },
        { id: "crops-diseases", icon: Stethoscope, label: t.cropsSub.diseases },
        { id: "crops-fertilizers", icon: Droplets, label: t.cropsSub.fertilizers },
      ],
    },
    {
      id: "mandis",
      icon: TrendingUp,
      label: t.mandis,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      notifications: 5,
      subItems: [
        { id: "market-prices", icon: DollarSign, label: t.marketSub.prices },
        { id: "market-trends", icon: LineChart, label: t.marketSub.trends },
        { id: "market-analysis", icon: PieChart, label: t.marketSub.analysis },
        { id: "market-alerts", icon: Bell, label: t.marketSub.alerts },
      ],
    },
    {
      id: "schemes",
      icon: FileText,
      label: t.schemes,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      notifications: 3,
    },
    {
      id: "aiBot",
      icon: Bot,
      label: t.aiBot,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      notifications: 0,
    },
    {
      id: "specialist",
      icon: Stethoscope,
      label: t.specialist,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      notifications: 0,
    },
    {
      id: "community",
      icon: Users,
      label: t.community,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      notifications: 12,
      subItems: [
        { id: "community-groups", icon: MessageCircle, label: t.communitySub.groups },
        { id: "community-forums", icon: Globe, label: t.communitySub.forums },
        { id: "community-experts", icon: Award, label: t.communitySub.experts },
        { id: "community-events", icon: Calendar, label: t.communitySub.events },
      ],
    },
    {
      id: "analytics",
      icon: BarChart,
      label: t.analytics,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      notifications: 0,
      subItems: [
        { id: "analytics-overview", icon: Eye, label: t.analyticsSub.overview },
        { id: "analytics-yield", icon: TrendingUpIcon, label: t.analyticsSub.yield },
        { id: "analytics-expenses", icon: TrendingDown, label: t.analyticsSub.expenses },
        { id: "analytics-profit", icon: Star, label: t.analyticsSub.profit },
      ],
    },
  ]

  const bottomMenuItems = [
    { id: "notifications", icon: Bell, label: t.notifications, notifications: 8 },
    { id: "profile", icon: User, label: t.profile },
    { id: "settings", icon: Settings, label: t.settings },
    { id: "help", icon: HelpCircle, label: t.help },
  ]

  return (
    <Sidebar className="border-r-2 border-green-100">
      <SidebarHeader className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center"
          >
            <Sprout className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Kisan Mitra
            </h2>
            <p className="text-xs text-gray-500">Smart Farming Assistant</p>
          </div>
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainMenuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <SidebarMenuItem>
                    {item.subItems ? (
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <motion.div whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}>
                            <SidebarMenuButton
                              className={`w-full justify-between group relative overflow-hidden ${
                                activeTab === item.id || activeTab.startsWith(item.id)
                                  ? `${item.bgColor} ${item.color} border-l-4 border-l-current`
                                  : "hover:bg-gray-50"
                              }`}
                              onClick={() => toggleMenu(item.id)}
                            >
                              <div className="flex items-center gap-3">
                                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.3 }}>
                                  <item.icon className={`h-5 w-5 ${item.color}`} />
                                </motion.div>
                                <span className="font-medium">{item.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.notifications > 0 && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                                  >
                                    {item.notifications}
                                  </motion.div>
                                )}
                                <motion.div
                                  animate={{
                                    rotate: expandedMenus.includes(item.id) ? 90 : 0,
                                  }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </motion.div>
                              </div>
                            </SidebarMenuButton>
                          </motion.div>
                        </CollapsibleTrigger>
                        <AnimatePresence>
                          {expandedMenus.includes(item.id) && (
                            <CollapsibleContent>
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="ml-8 mt-1 space-y-1"
                              >
                                {item.subItems.map((subItem, subIndex) => (
                                  <motion.div
                                    key={subItem.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: subIndex * 0.05 }}
                                  >
                                    <SidebarMenuButton
                                      className={`text-sm ${
                                        activeTab === subItem.id
                                          ? "bg-green-100 text-green-700 border-l-2 border-l-green-500"
                                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                      }`}
                                      onClick={() => setActiveTab(subItem.id)}
                                    >
                                      <subItem.icon className="h-4 w-4 mr-2" />
                                      {subItem.label}
                                    </SidebarMenuButton>
                                  </motion.div>
                                ))}
                              </motion.div>
                            </CollapsibleContent>
                          )}
                        </AnimatePresence>
                      </Collapsible>
                    ) : (
                      <motion.div whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}>
                        <SidebarMenuButton
                          className={`w-full group relative overflow-hidden ${
                            activeTab === item.id
                              ? `${item.bgColor} ${item.color} border-l-4 border-l-current`
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => setActiveTab(item.id)}
                        >
                          <div className="flex items-center gap-3">
                            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.3 }}>
                              <item.icon className={`h-5 w-5 ${item.color}`} />
                            </motion.div>
                            <span className="font-medium">{item.label}</span>
                          </div>
                          {item.notifications > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                            >
                              {item.notifications}
                            </motion.div>
                          )}
                        </SidebarMenuButton>
                      </motion.div>
                    )}
                  </SidebarMenuItem>
                </motion.div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {bottomMenuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: (mainMenuItems.length + index) * 0.05 }}
                >
                  <SidebarMenuItem>
                    <motion.div whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}>
                      <SidebarMenuButton
                        className={`w-full ${
                          activeTab === item.id
                            ? "bg-gray-100 text-gray-900 border-l-4 border-l-gray-500"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                        onClick={() => setActiveTab(item.id)}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {item.notifications && item.notifications > 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                          >
                            {item.notifications}
                          </motion.div>
                        )}
                      </SidebarMenuButton>
                    </motion.div>
                  </SidebarMenuItem>
                </motion.div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-t">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-4">
            <motion.div whileHover={{ scale: 1.1 }} className="relative">
              <Avatar className="w-12 h-12 border-2 border-green-300">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-sm text-gray-500 truncate">{user?.district}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="text-xs text-gray-500">Premium Member</span>
              </div>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white/80 backdrop-blur-sm border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t.logout}
            </Button>
          </motion.div>
        </motion.div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
