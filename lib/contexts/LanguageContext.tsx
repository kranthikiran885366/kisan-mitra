"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { AuthContext } from "./AuthContext"

interface LanguageContextType {
  currentLanguage: "en" | "hi" | "te"
  voiceEnabled: boolean
  changeLanguage: (language: "en" | "hi" | "te") => Promise<void>
  toggleVoice: () => Promise<void>
  speak: (text: string, language?: "en" | "hi" | "te") => void
  stopSpeaking: () => void
  languages: Array<{
    code: "en" | "hi" | "te"
    name: string
    nativeName: string
  }>
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const authContext = useContext(AuthContext)
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "hi" | "te">("en")
  const [voiceEnabled, setVoiceEnabled] = useState(true)

  useEffect(() => {
    if (authContext?.user?.preferences?.language) {
      setCurrentLanguage(authContext.user.preferences.language as "en" | "hi" | "te")
    }
    if (typeof authContext?.user?.preferences?.voiceEnabled === "boolean") {
      setVoiceEnabled(authContext.user.preferences.voiceEnabled)
    }
  }, [authContext?.user])

  const changeLanguage = async (language: "en" | "hi" | "te") => {
    try {
      setCurrentLanguage(language)

      if (authContext?.user && authContext?.updateProfile) {
        await authContext.updateProfile({
          preferences: {
            ...authContext.user.preferences,
            language,
          },
        })
      }
    } catch (error) {
      console.error("Language change failed:", error)
    }
  }

  const toggleVoice = async () => {
    const newVoiceEnabled = !voiceEnabled
    setVoiceEnabled(newVoiceEnabled)

    if (authContext?.user && authContext?.updateProfile) {
      await authContext.updateProfile({
        preferences: {
          ...authContext.user.preferences,
          voiceEnabled: newVoiceEnabled,
        },
      })
    }
  }

  const speak = (text: string, language = currentLanguage) => {
    if (!voiceEnabled || !(typeof window !== "undefined" && "speechSynthesis" in window)) return

    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language === "en" ? "en-US" : language === "hi" ? "hi-IN" : "te-IN"
    utterance.rate = 0.9
    utterance.pitch = 1

    speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      speechSynthesis.cancel()
    }
  }

  const value: LanguageContextType = {
    currentLanguage,
    voiceEnabled,
    changeLanguage,
    toggleVoice,
    speak,
    stopSpeaking,
    languages: [
      { code: "en", name: "English", nativeName: "English" },
      { code: "hi", name: "Hindi", nativeName: "हिंदी" },
      { code: "te", name: "Telugu", nativeName: "తెలుగు" },
    ],
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}