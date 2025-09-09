"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  mobile: string
  state?: string
  district?: string
  village?: string
  farmSize?: string
  farmingType?: string
  primaryCrop?: string
  profilePhoto?: string
  preferences?: {
    language: string
    voiceEnabled: boolean
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: { mobile: string; password?: string }) => Promise<{ success: boolean; message?: string }>
  register: (userData: any) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  updateProfile: (profileData: Partial<User>) => Promise<{ success: boolean; message?: string }>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const userData = localStorage.getItem("user")
      const token = localStorage.getItem("token")
      
      if (!userData || !token) {
        setLoading(false)
        return
      }

      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("user")
      localStorage.removeItem("token")
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: { mobile: string; password?: string }) => {
    try {
      setLoading(true)
      
      const mockUser: User = {
        id: "1",
        name: "John Farmer",
        email: "john@example.com",
        mobile: credentials.mobile,
        state: "Karnataka",
        district: "Bangalore",
        village: "Sample Village",
        farmSize: "5",
        farmingType: "crops",
        primaryCrop: "Rice",
        preferences: {
          language: "en",
          voiceEnabled: true
        }
      }

      const token = "mock-jwt-token"
      
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(mockUser))
      setUser(mockUser)

      toast.success("Login successful!")
      return { success: true }
    } catch (error) {
      const message = "Login failed"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: any) => {
    try {
      setLoading(true)
      
      const newUser: User = {
        id: Date.now().toString(),
        ...userData,
        preferences: {
          language: "en",
          voiceEnabled: true
        }
      }

      const token = "mock-jwt-token"
      
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(newUser))
      setUser(newUser)

      toast.success("Registration successful!")
      return { success: true }
    } catch (error) {
      const message = "Registration failed"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    toast.success("Logged out successfully")
    router.push("/")
  }

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      if (!user) return { success: false, message: "No user logged in" }
      
      const updatedUser = { ...user, ...profileData }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      toast.success("Profile updated successfully")
      return { success: true }
    } catch (error) {
      const message = "Profile update failed"
      toast.error(message)
      return { success: false, message }
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}