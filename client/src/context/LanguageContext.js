"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "./AuthContext"

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation()
  const { user, updateProfile } = useAuth()
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [voiceEnabled, setVoiceEnabled] = useState(true)

  useEffect(() => {
    if (user?.preferences?.language) {
      setCurrentLanguage(user.preferences.language)
      i18n.changeLanguage(user.preferences.language)
    }
    if (typeof user?.preferences?.voiceEnabled === "boolean") {
      setVoiceEnabled(user.preferences.voiceEnabled)
    }
  }, [user, i18n])

  const changeLanguage = async (language) => {
    try {
      await i18n.changeLanguage(language)
      setCurrentLanguage(language)

      if (user) {
        await updateProfile({
          preferences: {
            ...user.preferences,
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

    if (user) {
      await updateProfile({
        preferences: {
          ...user.preferences,
          voiceEnabled: newVoiceEnabled,
        },
      })
    }
  }

  const speak = (text, language = currentLanguage) => {
    if (!voiceEnabled || !("speechSynthesis" in window)) return

    // Cancel any ongoing speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language === "en" ? "en-US" : language === "hi" ? "hi-IN" : "te-IN"
    utterance.rate = 0.9
    utterance.pitch = 1

    speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
    }
  }

  const value = {
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
