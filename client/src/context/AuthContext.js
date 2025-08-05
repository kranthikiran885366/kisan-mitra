"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
  }, [])

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setLoading(false)
        return
      }

      const response = await axios.get("/api/auth/me")
      if (response.data.success) {
        setUser(response.data.user)
      } else {
        localStorage.removeItem("token")
        delete axios.defaults.headers.common["Authorization"]
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("token")
      delete axios.defaults.headers.common["Authorization"]
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await axios.post("/api/auth/login", credentials)

      if (response.data.success) {
        const { token, user } = response.data

        localStorage.setItem("token", token)
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
        setUser(user)

        toast.success("Login successful!")
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed"
      toast.error(message)
      return { success: false, message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post("/api/auth/register", userData)

      if (response.data.success) {
        const { token, user } = response.data

        localStorage.setItem("token", token)
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
        setUser(user)

        toast.success("Registration successful!")
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed"
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
    toast.success("Logged out successfully")
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put("/api/auth/profile", profileData)

      if (response.data.success) {
        setUser(response.data.user)
        toast.success("Profile updated successfully")
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Profile update failed"
      toast.error(message)
      return { success: false, message }
    }
  }

  const value = {
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
