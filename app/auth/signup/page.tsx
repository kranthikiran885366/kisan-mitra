"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Sprout, User, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authApi } from "@/lib/api"

const translations = {
  en: {
    title: "Join Krishi Mitra",
    subtitle: "Create your farming advisor account",
    name: "Full Name",
    phone: "Phone Number",
    email: "Email Address",
    state: "State",
    district: "District",
    password: "Password",
    confirmPassword: "Confirm Password",
    farmSize: "Farm Size (acres)",
    primaryCrop: "Primary Crop",
    signUp: "Create Account",
    haveAccount: "Already have an account?",
    signIn: "Sign In",
    selectState: "Select State",
    selectDistrict: "Select District",
    selectCrop: "Select Primary Crop",
    photo: "Profile Photo",
    uploadPhoto: "Upload Photo",
  },
  hi: {
    title: "कृषि मित्र में शामिल हों",
    subtitle: "अपना कृषि सलाहकार खाता बनाएं",
    name: "पूरा नाम",
    phone: "फोन नंबर",
    email: "ईमेल पता",
    state: "राज्य",
    district: "जिला",
    password: "पासवर्ड",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    farmSize: "खेत का आकार (एकड़)",
    primaryCrop: "मुख्य फसल",
    signUp: "खाता बनाएं",
    haveAccount: "पहले से खाता है?",
    signIn: "साइन इन करें",
    selectState: "राज्य चुनें",
    selectDistrict: "जिला चुनें",
    selectCrop: "मुख्य फसल चुनें",
    photo: "प्रोफाइल फोटो",
    uploadPhoto: "फोटो अपलोड करें",
  },
  te: {
    title: "కృషి మిత్రలో చేరండి",
    subtitle: "మీ వ్యవసాయ సలహాదారు ఖాతాను సృష్టించండి",
    name: "పూర్తి పేరు",
    phone: "ఫోన్ నంబర్",
    email: "ఇమెయిల్ చిరునామా",
    state: "రాష్ట్రం",
    district: "జిల్లా",
    password: "పాస్‌వర్డ్",
    confirmPassword: "పాస్‌వర్డ్‌ను నిర్ధారించండి",
    farmSize: "వ్యవసాయ భూమి (ఎకరాలు)",
    primaryCrop: "ప్రధాన పంట",
    signUp: "ఖాతా సృష్టించండి",
    haveAccount: "ఇప్పటికే ఖాతా ఉందా?",
    signIn: "సైన్ ఇన్ చేయండి",
    selectState: "రాష్ట్రాన్ని ఎంచుకోండి",
    selectDistrict: "జిల్లాను ఎంచుకోండి",
    selectCrop: "ప్రధాన పంటను ఎంచుకోండి",
    photo: "ప్రొఫైల్ ఫోటో",
    uploadPhoto: "ఫోటో అప్లోడ్ చేయండి",
  },
}

const states = [
  "Andhra Pradesh",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "Maharashtra",
  "Punjab",
  "Haryana",
  "Uttar Pradesh",
]
const districts = ["Guntur", "Krishna", "West Godavari", "East Godavari", "Visakhapatnam", "Vijayawada", "Tirupati"]
const crops = ["Rice", "Wheat", "Cotton", "Sugarcane", "Maize", "Groundnut", "Turmeric", "Chilli"]

export default function SignUpPage() {
  const [language, setLanguage] = useState<"en" | "hi" | "te">("en")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    state: "",
    district: "",
    village: "",
    farmSize: "",
    primaryCrop: "",
    role: "farmer", // default role
    photo: null as File | null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const t = translations[language]

  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [otpTimer, setOtpTimer] = useState(0)

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpTimer])

  const sendOtp = async () => {
    if (!formData.mobile || !/^[6-9]\d{9}$/.test(formData.mobile)) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }
    
    // For testing - simulate OTP sent
    setOtpSent(true)
    setOtpTimer(60)
    toast.success('OTP sent! Use 12345 for testing')
  }

  const verifyOtp = async () => {
    if (!otp) {
      toast.error('Please enter OTP')
      return false
    }
    
    // For testing - accept 12345 as valid OTP
    if (otp === '12345') {
      toast.success('Mobile number verified successfully!')
      return true
    } else {
      toast.error('Invalid OTP. Use 12345 for testing.')
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submission started')
    
    // If OTP not verified, verify first
    if (!otpSent) {
      await sendOtp()
      return
    }
    
    const otpVerified = await verifyOtp()
    if (!otpVerified) return
    
    // Validate form
    const validations = [
      {
        condition: !formData.name || formData.name.length < 2,
        message: 'Please enter your name (at least 2 characters)'
      },
      {
        condition: !formData.mobile || !/^[6-9]\d{9}$/.test(formData.mobile),
        message: 'Please enter a valid 10-digit Indian mobile number'
      },
      {
        condition: !formData.password || formData.password.length < 6,
        message: 'Password must be at least 6 characters'
      },
      {
        condition: formData.password !== formData.confirmPassword,
        message: 'Passwords do not match!'
      },
      {
        condition: !formData.state || formData.state.length < 2,
        message: 'Please select your state (at least 2 characters)'
      },
      {
        condition: !formData.district || formData.district.length < 2,
        message: 'Please select your district (at least 2 characters)'
      },
      {
        condition: !formData.village || formData.village.length < 2,
        message: 'Please enter your village (at least 2 characters)'
      },
      {
        condition: !formData.role || !['farmer', 'agri_doctor', 'agriculture_expert'].includes(formData.role),
        message: 'Please select a valid role'
      }
    ]

    // Run validations
    for (const validation of validations) {
      if (validation.condition) {
        console.error('Validation failed:', validation.message)
        toast.error(validation.message)
        return
      }
    }

    setIsLoading(true)
    console.log('Form validation passed, preparing API request...')
    
    try {
      const userData = {
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email || undefined,
        password: formData.password,
        state: formData.state,
        district: formData.district,
        village: formData.village,
        role: formData.role,
        landSize: formData.farmSize ? parseFloat(formData.farmSize) : undefined,
        primaryCrop: formData.primaryCrop || undefined,
        preferredLanguage: language,
      }
      
      console.log('Sending registration request with data:', JSON.stringify(userData, null, 2))
      
      const response = await authApi.register(userData)
      console.log('Register API response received:', response)
      
      if (response?.success) {
        console.log('Registration successful, showing success message...')
        toast.success('Registration successful! Please login.')
        
        // Store registration success in session storage
        sessionStorage.setItem('registrationSuccess', 'true')
        
        console.log('Initiating redirect to login page...')
        // Use window.location for more reliable redirect
        setTimeout(() => {
          window.location.href = '/auth/login'
        }, 1500)
      } else {
        const errorMsg = response?.message || 'Registration failed without error message'
        console.error('Registration failed:', errorMsg)
        throw new Error(errorMsg)
      }
    } catch (error: any) {
      console.error('Registration error details:', {
        name: error.name,
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      })
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map((e: any) => e.msg).join(', ')
        console.error('Backend validation errors:', errorMessages)
        toast.error(errorMessages)
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.'
        console.error('Registration error:', errorMessage)
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
      console.log('Form submission process completed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-green-400 rounded-full animate-bounce"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl relative z-10"
      >
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-green-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <Sprout className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-800">{t.title}</CardTitle>
            <CardDescription>{t.subtitle}</CardDescription>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "hi" | "te")}
              className="mt-4 px-3 py-1 rounded-lg border border-green-300 bg-white mx-auto"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="te">తెలుగు</option>
            </select>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t.name}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      className="pl-10"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="mobile">{t.phone}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="mobile"
                      type="tel"
                      className="pl-10"
                      placeholder="9876543210"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      required
                      disabled={otpSent}
                    />
                    {!otpSent && (
                      <Button
                        type="button"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={sendOtp}
                        disabled={isLoading}
                      >
                        Send OTP
                      </Button>
                    )}
                  </div>
                  {otpSent && (
                    <div className="mt-2">
                      <Label htmlFor="otp">Enter OTP</Label>
                      <div className="flex gap-2">
                        <Input
                          id="otp"
                          type="text"
                          placeholder="123456"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          required
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={sendOtp}
                          disabled={otpTimer > 0 || isLoading}
                        >
                          {otpTimer > 0 ? `${otpTimer}s` : 'Resend'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="email">{t.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    placeholder="farmer@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t.state}</Label>
                  <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectState} />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t.district}</Label>
                  <Select
                    value={formData.district}
                    onValueChange={(value) => setFormData({ ...formData, district: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectDistrict} />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="village">Village</Label>
                <Input
                  id="village"
                  type="text"
                  placeholder="Enter your village"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="farmSize">{t.farmSize}</Label>
                  <Input
                    id="farmSize"
                    type="number"
                    placeholder="5"
                    value={formData.farmSize}
                    onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t.primaryCrop}</Label>
                  <Select
                    value={formData.primaryCrop}
                    onValueChange={(value) => setFormData({ ...formData, primaryCrop: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectCrop} />
                    </SelectTrigger>
                    <SelectContent>
                      {crops.map((crop) => (
                        <SelectItem key={crop} value={crop}>
                          {crop}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="photo">Profile Photo</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFormData({ ...formData, photo: file })
                    }
                  }}
                />
                <p className="text-sm text-gray-500 mt-1">Upload your profile picture (optional)</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">{t.password}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="agri_doctor">Agri Doctor</SelectItem>
                    <SelectItem value="agriculture_expert">Agriculture Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {!otpSent ? 'Sending OTP...' : 'Verifying...'}
                  </div>
                ) : (
                  !otpSent ? 'Send OTP' : t.signUp
                )}
              </Button>
              <div className="text-center text-sm text-gray-600">
                {t.haveAccount}{" "}
                <Link href="/auth/login" className="text-green-600 hover:underline">
                  {t.signIn}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
