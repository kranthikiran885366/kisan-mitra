"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  MessageCircle, 
  Users, 
  Plus, 
  Search, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  MoreHorizontal,
  ArrowLeft,
  TrendingUp,
  Star,
  MapPin,
  Calendar,
  Eye,
  Heart,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  Trophy,
  Image as ImageIcon,
  Video,
  FileText,
  Send,
  X
} from "lucide-react"
import { useRouter } from "next/navigation"
import { communityApi, CommunityPost, CommunityGroup, CreatePostData, CreateGroupData } from "@/lib/communityApi"

const translations = {
  en: {
    title: "Farmer's Community",
    searchPlaceholder: "Search discussions...",
    newPost: "New Post",
    createGroup: "Create Group",
    yourThoughts: "What's on your mind?",
    post: "Post",
    allDiscussions: "All Discussions",
    trending: "Trending",
    expert: "Expert Advice",
    myGroups: "My Groups",
    allGroups: "All Groups",
    recommended: "Recommended",
    joinGroup: "Join Group",
    leaveGroup: "Leave Group",
    members: "members",
    online: "online",
    like: "Like",
    comment: "Comment",
    share: "Share",
    viewMore: "View more comments",
    noPosts: "No posts yet. Be the first to start a discussion!",
    backToDashboard: "Back to Dashboard",
    postAdded: "Your post has been added!",
    loading: "Loading...",
    error: "Error loading data",
    retry: "Retry",
    writeComment: "Write a comment...",
    postComment: "Post Comment",
    markAsAnswer: "Mark as Answer",
    answered: "Answered",
    views: "views",
    ago: "ago",
    question: "Question",
    discussion: "Discussion",
    tip: "Tip",
    experience: "Experience",
    problem: "Problem",
    successStory: "Success Story",
    crops: "Crops",
    livestock: "Livestock",
    equipment: "Equipment",
    weather: "Weather",
    market: "Market",
    government: "Government",
    general: "General",
    attachFiles: "Attach Files",
    selectCategory: "Select Category",
    selectType: "Select Type",
    addTags: "Add Tags (comma separated)",
    groupName: "Group Name",
    groupDescription: "Group Description",
    selectGroupCategory: "Select Group Category",
    public: "Public",
    private: "Private",
    inviteOnly: "Invite Only",
    createPost: "Create Post",
    postTitle: "Post Title",
    postContent: "Post Content",
    helpful: "Helpful",
    thanks: "Thanks",
    love: "Love"
  },
  hi: {
    title: "किसान समुदाय",
    searchPlaceholder: "चर्चा खोजें...",
    newPost: "नई पोस्ट",
    createGroup: "समूह बनाएं",
    yourThoughts: "आपके मन में क्या है?",
    post: "पोस्ट करें",
    allDiscussions: "सभी चर्चाएं",
    trending: "ट्रेंडिंग",
    expert: "विशेषज्ञ सलाह",
    myGroups: "मेरे समूह",
    allGroups: "सभी समूह",
    recommended: "सुझाए गए",
    joinGroup: "समूह में शामिल हों",
    leaveGroup: "समूह छोड़ें",
    members: "सदस्य",
    online: "ऑनलाइन",
    like: "पसंद",
    comment: "टिप्पणी",
    share: "साझा करें",
    viewMore: "और टिप्पणियां देखें",
    noPosts: "अभी तक कोई पोस्ट नहीं। चर्चा शुरू करने वाले पहले व्यक्ति बनें!",
    backToDashboard: "डैशबोर्ड पर वापस",
    postAdded: "आपकी पोस्ट जोड़ दी गई है!",
    loading: "लोड हो रहा है...",
    error: "डेटा लोड करने में त्रुटि",
    retry: "पुनः प्रयास करें",
    writeComment: "टिप्पणी लिखें...",
    postComment: "टिप्पणी पोस्ट करें",
    markAsAnswer: "उत्तर के रूप में चिह्नित करें",
    answered: "उत्तर दिया गया",
    views: "दृश्य",
    ago: "पहले",
    question: "प्रश्न",
    discussion: "चर्चा",
    tip: "सुझाव",
    experience: "अनुभव",
    problem: "समस्या",
    successStory: "सफलता की कहानी",
    crops: "फसलें",
    livestock: "पशुधन",
    equipment: "उपकरण",
    weather: "मौसम",
    market: "बाजार",
    government: "सरकार",
    general: "सामान्य",
    attachFiles: "फाइलें संलग्न करें",
    selectCategory: "श्रेणी चुनें",
    selectType: "प्रकार चुनें",
    addTags: "टैग जोड़ें (कॉमा से अलग)",
    groupName: "समूह का नाम",
    groupDescription: "समूह विवरण",
    selectGroupCategory: "समूह श्रेणी चुनें",
    public: "सार्वजनिक",
    private: "निजी",
    inviteOnly: "केवल आमंत्रण",
    createPost: "पोस्ट बनाएं",
    postTitle: "पोस्ट शीर्षक",
    postContent: "पोस्ट सामग्री",
    helpful: "सहायक",
    thanks: "धन्यवाद",
    love: "प्रेम"
  },
  te: {
    title: "రైతుల కమ్యూనిటీ",
    searchPlaceholder: "చర్చలను వెతకండి...",
    newPost: "కొత్త పోస్ట్",
    createGroup: "గ్రూప్ సృష్టించండి",
    yourThoughts: "మీ మనసులో ఏమి ఉంది?",
    post: "పోస్ట్ చేయండి",
    allDiscussions: "అన్ని చర్చలు",
    trending: "ట్రెండింగ్",
    expert: "నిపుణుల సలహా",
    myGroups: "నా గ్రూప్‌లు",
    allGroups: "అన్ని గ్రూప్‌లు",
    recommended: "సిఫార్సు చేయబడినవి",
    joinGroup: "గ్రూప్‌లో చేరండి",
    leaveGroup: "గ్రూప్ వదిలివేయండి",
    members: "సభ్యులు",
    online: "ఆన్‌లైన్",
    like: "ఇష్టం",
    comment: "వ్యాఖ్య",
    share: "పంచుకోండి",
    viewMore: "మరిన్ని వ్యాఖ్యలు చూడండి",
    noPosts: "ఇంకా పోస్ట్‌లు లేవు. చర్చను ప్రారంభించే మొదటి వ్యక్తి అవ్వండి!",
    backToDashboard: "డాష్‌బోర్డ్‌కు తిరిగి",
    postAdded: "మీ పోస్ట్ జోడించబడింది!",
    loading: "లోడ్ అవుతోంది...",
    error: "డేటా లోడ్ చేయడంలో లోపం",
    retry: "మళ్లీ ప్రయత్నించండి",
    writeComment: "వ్యాఖ్య రాయండి...",
    postComment: "వ్యాఖ్య పోస్ట్ చేయండి",
    markAsAnswer: "సమాధానంగా గుర్తించండి",
    answered: "సమాధానం ఇవ్వబడింది",
    views: "వీక్షణలు",
    ago: "క్రితం",
    question: "ప్రశ్న",
    discussion: "చర్చ",
    tip: "చిట్కా",
    experience: "అనుభవం",
    problem: "సమస్య",
    successStory: "విజయ కథ",
    crops: "పంటలు",
    livestock: "పశువులు",
    equipment: "పరికరాలు",
    weather: "వాతావరణం",
    market: "మార్కెట్",
    government: "ప్రభుత్వం",
    general: "సాధారణ",
    attachFiles: "ఫైల్‌లను జోడించండి",
    selectCategory: "వర్గాన్ని ఎంచుకోండి",
    selectType: "రకాన్ని ఎంచుకోండి",
    addTags: "ట్యాగ్‌లను జోడించండి (కామాతో వేరు చేయండి)",
    groupName: "గ్రూప్ పేరు",
    groupDescription: "గ్రూప్ వివరణ",
    selectGroupCategory: "గ్రూప్ వర్గాన్ని ఎంచుకోండి",
    public: "పబ్లిక్",
    private: "ప్రైవేట్",
    inviteOnly: "ఆహ్వానం మాత్రమే",
    createPost: "పోస్ట్ సృష్టించండి",
    postTitle: "పోస్ట్ శీర్షిక",
    postContent: "పోస్ట్ కంటెంట్",
    helpful: "సహాయకరమైన",
    thanks: "ధన్యవాదాలు",
    love: "ప్రేమ"
  }
}

export default function CommunityPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<'en' | 'hi' | 'te'>('en')
  const [activeTab, setActiveTab] = useState("feed")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  
  // Data states
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [groups, setGroups] = useState<CommunityGroup[]>([])
  const [trending, setTrending] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // UI states
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  
  // Form states
  const [newPost, setNewPost] = useState<CreatePostData>({
    title: '',
    content: '',
    type: 'discussion',
    category: 'general',
    tags: [],
    language: 'en'
  })
  const [newGroup, setNewGroup] = useState<CreateGroupData>({
    name: '',
    description: '',
    category: 'general',
    privacy: 'public',
    language: 'mixed'
  })
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const t = translations[language]

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'hi' | 'te'
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (activeTab === 'feed') {
        const [feedRes, trendingRes] = await Promise.all([
          communityApi.getFeed({ limit: 20 }),
          communityApi.getTrending(10)
        ])
        
        if (feedRes.success) setPosts(feedRes.data)
        if (trendingRes.success) setTrending(trendingRes.data)
      } else if (activeTab === 'groups') {
        const groupsRes = await communityApi.getGroups({ type: 'all', limit: 20 })
        if (groupsRes.success) setGroups(groupsRes.data)
      }
    } catch (err: any) {
      console.error('Error loading data:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async () => {
    try {
      if (!newPost.title.trim() || !newPost.content.trim()) return

      const response = await communityApi.createPost(newPost, attachments)
      
      if (response.success) {
        setPosts(prev => [response.data, ...prev])
        setNewPost({
          title: '',
          content: '',
          type: 'discussion',
          category: 'general',
          tags: [],
          language: 'en'
        })
        setAttachments([])
        setShowCreatePost(false)
      }
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const handleCreateGroup = async () => {
    try {
      if (!newGroup.name.trim() || !newGroup.description.trim()) return

      const response = await communityApi.createGroup(newGroup)
      
      if (response.success) {
        setGroups(prev => [response.data, ...prev])
        setNewGroup({
          name: '',
          description: '',
          category: 'general',
          privacy: 'public',
          language: 'mixed'
        })
        setShowCreateGroup(false)
      }
    } catch (error) {
      console.error('Error creating group:', error)
    }
  }

  const handleReaction = async (postId: string, type: string = 'like') => {
    try {
      const response = await communityApi.reactToPost(postId, type)
      
      if (response.success) {
        setPosts(prev => prev.map(post => 
          post._id === postId 
            ? { ...post, reactionCount: response.data.reactionCount }
            : post
        ))
      }
    } catch (error) {
      console.error('Error reacting to post:', error)
    }
  }

  const handleComment = async (postId: string) => {
    try {
      const content = commentInputs[postId]?.trim()
      if (!content) return

      const response = await communityApi.addComment(postId, content)
      
      if (response.success) {
        setPosts(prev => prev.map(post => 
          post._id === postId 
            ? { ...post, comments: [...post.comments, response.data] }
            : post
        ))
        setCommentInputs(prev => ({ ...prev, [postId]: '' }))
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleJoinGroup = async (groupId: string) => {
    try {
      const response = await communityApi.joinGroup(groupId)
      
      if (response.success) {
        setGroups(prev => prev.map(group => 
          group._id === groupId 
            ? { ...group, memberCount: group.memberCount + 1 }
            : group
        ))
      }
    } catch (error) {
      console.error('Error joining group:', error)
    }
  }

  const togglePostExpansion = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'question': return <HelpCircle className="h-4 w-4 text-blue-500" />
      case 'tip': return <Lightbulb className="h-4 w-4 text-yellow-500" />
      case 'problem': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'success_story': return <Trophy className="h-4 w-4 text-green-500" />
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'question': return 'bg-blue-100 text-blue-800'
      case 'tip': return 'bg-yellow-100 text-yellow-800'
      case 'problem': return 'bg-red-100 text-red-800'
      case 'success_story': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${t.ago}`
    if (hours > 0) return `${hours}h ${t.ago}`
    return `${minutes}m ${t.ago}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t.loading}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t.newPost}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t.createPost}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder={t.postTitle}
                    value={newPost.title}
                    onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <Textarea
                    placeholder={t.postContent}
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={newPost.type} onValueChange={(value) => setNewPost(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectType} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="question">{t.question}</SelectItem>
                        <SelectItem value="discussion">{t.discussion}</SelectItem>
                        <SelectItem value="tip">{t.tip}</SelectItem>
                        <SelectItem value="experience">{t.experience}</SelectItem>
                        <SelectItem value="problem">{t.problem}</SelectItem>
                        <SelectItem value="success_story">{t.successStory}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={newPost.category} onValueChange={(value) => setNewPost(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectCategory} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="crops">{t.crops}</SelectItem>
                        <SelectItem value="livestock">{t.livestock}</SelectItem>
                        <SelectItem value="equipment">{t.equipment}</SelectItem>
                        <SelectItem value="weather">{t.weather}</SelectItem>
                        <SelectItem value="market">{t.market}</SelectItem>
                        <SelectItem value="government">{t.government}</SelectItem>
                        <SelectItem value="general">{t.general}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder={t.addTags}
                    onChange={(e) => setNewPost(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    }))}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <ImageIcon className="h-4 w-4" />
                      {t.attachFiles}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      onChange={(e) => setAttachments(Array.from(e.target.files || []))}
                      className="hidden"
                    />
                    {attachments.length > 0 && (
                      <span className="text-sm text-gray-600">
                        {attachments.length} file(s) selected
                      </span>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreatePost}>
                      {t.post}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-4 mb-6"
        >
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t.general}</SelectItem>
                <SelectItem value="crops">{t.crops}</SelectItem>
                <SelectItem value="livestock">{t.livestock}</SelectItem>
                <SelectItem value="equipment">{t.equipment}</SelectItem>
                <SelectItem value="weather">{t.weather}</SelectItem>
                <SelectItem value="market">{t.market}</SelectItem>
                <SelectItem value="government">{t.government}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t.trending}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trending?.tags?.slice(0, 5).map((tag: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-sm">#{tag._id}</span>
                    <Badge variant="secondary">{tag.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Expert Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trending?.posts?.slice(0, 3).map((post: any, index: number) => (
                  <div key={index} className="py-2 border-b last:border-b-0">
                    <p className="text-sm font-medium line-clamp-2">{post.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      by {post.author?.name}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="feed">{t.allDiscussions}</TabsTrigger>
                <TabsTrigger value="trending">{t.trending}</TabsTrigger>
                <TabsTrigger value="expert">{t.expert}</TabsTrigger>
                <TabsTrigger value="groups">{t.allGroups}</TabsTrigger>
              </TabsList>

              {/* Feed Tab */}
              <TabsContent value="feed">
                <div className="space-y-6">
                  <AnimatePresence>
                    {posts.map((post, index) => (
                      <motion.div
                        key={post._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={post.author.profilePicture} />
                                  <AvatarFallback>
                                    {post.author.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold">{post.author.name}</p>
                                    {post.author.role === 'expert' && (
                                      <Badge variant="secondary" className="text-xs">
                                        Expert
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>{formatTimeAgo(post.createdAt)}</span>
                                    {post.location && (
                                      <>
                                        <span>•</span>
                                        <MapPin className="h-3 w-3" />
                                        <span>{post.location.district}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getPostTypeColor(post.type)}>
                                  {getPostTypeIcon(post.type)}
                                  <span className="ml-1">{t[post.type as keyof typeof t] || post.type}</span>
                                </Badge>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                            <p className="text-gray-700 mb-4">
                              {expandedPosts.has(post._id) 
                                ? post.content 
                                : post.content.length > 200 
                                  ? post.content.substring(0, 200) + '...'
                                  : post.content
                              }
                              {post.content.length > 200 && (
                                <button
                                  onClick={() => togglePostExpansion(post._id)}
                                  className="text-blue-600 hover:underline ml-2"
                                >
                                  {expandedPosts.has(post._id) ? 'Show less' : 'Show more'}
                                </button>
                              )}
                            </p>
                            
                            {post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {post.tags.map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {post.attachments.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                                {post.attachments.map((attachment, attIndex) => (
                                  <div key={attIndex} className="relative">
                                    {attachment.type === 'image' ? (
                                      <img
                                        src={attachment.url}
                                        alt={attachment.filename}
                                        className="w-full h-32 object-cover rounded-lg"
                                      />
                                    ) : (
                                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                                        {attachment.type === 'video' ? (
                                          <Video className="h-8 w-8 text-gray-500" />
                                        ) : (
                                          <FileText className="h-8 w-8 text-gray-500" />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {post.views} {t.views}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-4 w-4" />
                                  {post.commentCount} {t.comment}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="h-4 w-4" />
                                  {post.reactionCount}
                                </span>
                              </div>
                              {post.isResolved && (
                                <Badge className="bg-green-100 text-green-800">
                                  {t.answered}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReaction(post._id, 'like')}
                                className="flex items-center gap-1"
                              >
                                <ThumbsUp className="h-4 w-4" />
                                {t.like}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReaction(post._id, 'helpful')}
                                className="flex items-center gap-1"
                              >
                                <Heart className="h-4 w-4" />
                                {t.helpful}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <Share2 className="h-4 w-4" />
                                {t.share}
                              </Button>
                            </div>

                            {/* Comments */}
                            {post.comments.length > 0 && (
                              <div className="border-t pt-4">
                                <div className="space-y-3">
                                  {post.comments.slice(0, 3).map((comment) => (
                                    <div key={comment._id} className="flex gap-3">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={comment.author.profilePicture} />
                                        <AvatarFallback>
                                          {comment.author.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="bg-gray-50 rounded-lg p-3">
                                          <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold text-sm">{comment.author.name}</p>
                                            {comment.isAnswer && (
                                              <Badge className="bg-green-100 text-green-800 text-xs">
                                                Answer
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-sm">{comment.content}</p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                          <span>{formatTimeAgo(comment.createdAt)}</span>
                                          <button className="hover:text-blue-600">{t.like}</button>
                                          <button className="hover:text-blue-600">Reply</button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  {post.comments.length > 3 && (
                                    <button className="text-blue-600 hover:underline text-sm">
                                      {t.viewMore} ({post.comments.length - 3} more)
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Comment Input */}
                            <div className="border-t pt-4 mt-4">
                              <div className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 flex gap-2">
                                  <Input
                                    placeholder={t.writeComment}
                                    value={commentInputs[post._id] || ''}
                                    onChange={(e) => setCommentInputs(prev => ({
                                      ...prev,
                                      [post._id]: e.target.value
                                    }))}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleComment(post._id)
                                      }
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleComment(post._id)}
                                    disabled={!commentInputs[post._id]?.trim()}
                                  >
                                    <Send className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </TabsContent>

              {/* Groups Tab */}
              <TabsContent value="groups">
                <div className="mb-6">
                  <Button
                    onClick={() => setShowCreateGroup(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {t.createGroup}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {groups.map((group, index) => (
                    <motion.div
                      key={group._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={group.avatar} />
                                <AvatarFallback>
                                  {group.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold">{group.name}</h3>
                                <p className="text-sm text-gray-500">
                                  {group.memberCount} {t.members}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline">{group.privacy}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-700 mb-4">
                            {group.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {group.tags.slice(0, 3).map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleJoinGroup(group._id)}
                            >
                              {t.joinGroup}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Create Group Dialog */}
        <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.createGroup}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder={t.groupName}
                value={newGroup.name}
                onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
              />
              <Textarea
                placeholder={t.groupDescription}
                value={newGroup.description}
                onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
              <Select value={newGroup.category} onValueChange={(value) => setNewGroup(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectGroupCategory} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crop_specific">Crop Specific</SelectItem>
                  <SelectItem value="location_based">Location Based</SelectItem>
                  <SelectItem value="technique_based">Technique Based</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="expert_led">Expert Led</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newGroup.privacy} onValueChange={(value) => setNewGroup(prev => ({ ...prev, privacy: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">{t.public}</SelectItem>
                  <SelectItem value="private">{t.private}</SelectItem>
                  <SelectItem value="invite_only">{t.inviteOnly}</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateGroup(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateGroup}>
                  {t.createGroup}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}