"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Sprout, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authApi } from "@/lib/api"

const translations = {
  en: {
    title: "Welcome Back",
    subtitle: "Sign in to your Krishi Mitra account",
    phone: "Phone Number",
    email: "Email Address",
    password: "Password",
    login: "Sign In",
    forgotPassword: "Forgot Password?",
    noAccount: "Don't have an account?",
    signUp: "Sign Up",
    phoneTab: "Phone",
    emailTab: "Email",
    otpLogin: "Login with OTP",
    passwordLogin: "Login with Password",
  },
  hi: {
    title: "वापस स्वागत है",
    subtitle: "अपने कृषि मित्र खाते में साइन इन करें",
    phone: "फोन नंबर",
    email: "ईमेल पता",
    password: "पासवर्ड",
    login: "साइन इन करें",
    forgotPassword: "पासवर्ड भूल गए?",
    noAccount: "खाता नहीं है?",
    signUp: "साइन अप करें",
    phoneTab: "फोन",
    emailTab: "ईमेल",
    otpLogin: "OTP से लॉगिन करें",
    passwordLogin: "पासवर्ड से लॉगिन करें",
  },
  te: {
    title: "తిరిగి స్వాగతం",
    subtitle: "మీ కృషి మిత్ర ఖాతాలోకి సైన్ ఇన్ చేయండి",
    phone: "ఫోన్ నంబర్",
    email: "ఇమెయిల్ చిరునామా",
    password: "పాస్‌వర్డ్",
    login: "సైన్ ఇన్ చేయండి",
    forgotPassword: "పాస్‌వర్డ్ మర్చిపోయారా?",
    noAccount: "ఖాతా లేదా?",
    signUp: "సైన్ అప్ చేయండి",
    phoneTab: "ఫోన్",
    emailTab: "ఇమెయిల్",
    otpLogin: "OTP తో లాగిన్ చేయండి",
    passwordLogin: "పాస్వర్డ్ తో లాగిన్ చేయండి",
  },
}

export default function LoginPage() {
  const [language, setLanguage] = useState<"en" | "hi" | "te">("en")
  const [showPassword, setShowPassword] = useState(false)
  const [loginType, setLoginType] = useState<"phone" | "email">("phone")
  const [formData, setFormData] = useState({
    phone: "", // This is just for the form state, we'll map it to 'mobile' in the API request
    email: "",
    password: "",
  })
  const [otpMode, setOtpMode] = useState(false)
  const [otp, setOtp] = useState("")
  const [otpTimer, setOtpTimer] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const t = translations[language]

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpTimer])

  const sendLoginOtp = async () => {
    if (!formData.phone || !/^[6-9]\d{9}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }
    
    // For testing - simulate OTP sent
    setOtpMode(true)
    setOtpTimer(60)
    toast.success('OTP sent! Use 12345 for testing')
  }

  const verifyLoginOtp = async () => {
    if (!otp) {
      toast.error('Please enter OTP')
      return false
    }
    
    // For testing - accept 12345 as valid OTP
    if (otp === '12345') {
      const mockToken = `otp_token_${Date.now()}`
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify({ mobile: formData.phone, loginMethod: 'otp' }))
      
      toast.success('Login successful!')
      router.push('/dashboard')
      return true
    } else {
      toast.error('Invalid OTP. Use 12345 for testing.')
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login form submitted')
    
    // Validate form
    const validations = [
      {
        condition: loginType === 'phone' && !formData.phone,
        message: 'Please enter your phone number'
      },
      {
        condition: loginType === 'email' && !formData.email,
        message: 'Please enter your email address'
      },
      {
        condition: !formData.password,
        message: 'Please enter your password'
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
    console.log('Form validation passed, preparing login request...')

    try {
      // Prepare credentials based on login type
      // Ensure password is trimmed and there are no extra spaces
      const password = formData.password.trim();
      
      const credentials = loginType === 'phone' 
        ? { 
            mobile: formData.phone, // Changed from 'phone' to 'mobile' to match API expectation
            password: password
          }
        : { 
            email: formData.email.toLowerCase().trim(), // Ensure email is lowercase and trimmed
            password: password
          }
      
      console.log('Sending login request with credentials:', JSON.stringify(credentials, null, 2))
      
      console.log('Attempting login with credentials:', JSON.stringify(credentials, null, 2))
      
      // Call login API
      const response = await authApi.login(credentials)
      console.log('Login API response:', response)
      
      if (response?.success) {
        console.log('Login successful, saving token...')
        // Save token to local storage
        localStorage.setItem('token', response.token)
        
        try {
          console.log('Fetching user profile...')
          // Get user profile
          const userResponse = await authApi.getMe()
          console.log('User profile response:', userResponse)
          
          if (userResponse?.success) {
            // Save user data to local storage
            localStorage.setItem('user', JSON.stringify(userResponse.user))
            
            // Show success message
            toast.success('Login successful!')
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              console.log('Redirecting to dashboard...')
              router.push('/dashboard')
            }, 1000)
          } else {
            throw new Error(userResponse?.message || 'Failed to fetch user profile')
          }
        } catch (profileError: any) {
          console.error('Error fetching user profile:', profileError)
          // Clear any partial authentication data
          localStorage.removeItem('token')
          throw new Error('Failed to load user profile. Please try again.')
        }
      } else {
        throw new Error(response?.message || 'Login failed: Invalid response from server')
      }
    } catch (error: any) {
      console.error('Login error details:', {
        name: error.name,
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      })
      
      // Show appropriate error message
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Login failed. Please check your credentials and try again.'
      
      toast.error(errorMessage)
      
      // Clear form on certain errors
      if (error.response?.status === 400 || error.response?.status === 401) {
        setFormData(prev => ({
          ...prev,
          password: '' // Clear password field on auth errors
        }))
      }
    } finally {
      setIsLoading(false)
      console.log('Login process completed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-400 rounded-full animate-bounce"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
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
              <Tabs value={loginType} onValueChange={(value) => setLoginType(value as "phone" | "email")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {t.phoneTab}
                  </TabsTrigger>
                  <TabsTrigger value="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t.emailTab}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="phone" className="space-y-4">
                  <div>
                    <Label htmlFor="phone">{t.phone}</Label>
                    <div className="flex gap-2">
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData({ ...formData, phone: value });
                        }}
                        required
                        pattern="[0-9]{10}"
                        title="Please enter a valid 10-digit mobile number"
                        disabled={otpMode}
                      />
                      {!otpMode && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={sendLoginOtp}
                          disabled={isLoading}
                        >
                          {t.otpLogin}
                        </Button>
                      )}
                    </div>
                    {otpMode && (
                      <div className="mt-2">
                        <Label htmlFor="loginOtp">Enter OTP</Label>
                        <div className="flex gap-2">
                          <Input
                            id="loginOtp"
                            type="text"
                            placeholder="123456"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            required
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={sendLoginOtp}
                            disabled={otpTimer > 0 || isLoading}
                          >
                            {otpTimer > 0 ? `${otpTimer}s` : 'Resend'}
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setOtpMode(false)
                            setOtp('')
                            setOtpTimer(0)
                          }}
                          className="mt-2"
                        >
                          {t.passwordLogin}
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="email" className="space-y-4">
                  <div>
                    <Label htmlFor="email">{t.email}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="farmer@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </TabsContent>
              </Tabs>

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

              {otpMode && loginType === 'phone' ? (
                <Button 
                  type="button" 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  disabled={isLoading}
                  onClick={verifyLoginOtp}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying OTP...
                    </div>
                  ) : (
                    'Verify OTP'
                  )}
                </Button>
              ) : (
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t.login}
                    </div>
                  ) : (
                    t.login
                  )}
                </Button>
              )}

              <div className="text-center">
                <Link href="/auth/forgot-password" className="text-sm text-green-600 hover:underline">
                  {t.forgotPassword}
                </Link>
              </div>

              <div className="text-center text-sm text-gray-600">
                {t.noAccount}{" "}
                <Link href="/auth/signup" className="text-green-600 hover:underline">
                  {t.signUp}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
