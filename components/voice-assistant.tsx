"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Volume2, VolumeX } from "lucide-react"
import { usePageSpeech, type SupportedLanguage } from "@/hooks/use-speech"

interface VoiceAssistantProps {
  content?: string
  language?: SupportedLanguage
  pageTitle?: string
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  translations?: {
    speak?: string
    speaking?: string
    stopSpeaking?: string
  }
}

export default function VoiceAssistant({ 
  content,
  language = 'en',
  pageTitle,
  className = "",
  variant = "outline",
  size = "sm",
  translations = {}
}: VoiceAssistantProps) {
  const { speakPageContent, stopSpeech, isPlaying, isSupported } = usePageSpeech()
  
  const defaultTranslations = {
    speak: language === 'hi' ? 'बोलें' : language === 'te' ? 'మాట్లాడండి' : 'Speak',
    speaking: language === 'hi' ? 'बोल रहा है' : language === 'te' ? 'మాట్లాడుతోంది' : 'Speaking',
    stopSpeaking: language === 'hi' ? 'रो��ें' : language === 'te' ? 'ఆపండి' : 'Stop'
  }

  const t = { ...defaultTranslations, ...translations }

  const handleSpeak = () => {
    if (isPlaying) {
      stopSpeech()
    } else {
      const textToSpeak = content || getDefaultPageContent()
      if (textToSpeak) {
        speakPageContent(textToSpeak, language)
      }
    }
  }

  const getDefaultPageContent = () => {
    if (pageTitle) {
      return `${pageTitle} page. ${getPageSpecificContent()}`
    }
    return "Welcome to Kisan Mitra - your smart farming assistant"
  }

  const getPageSpecificContent = () => {
    // Get content based on current page context - only run on client
    if (typeof window === 'undefined') return ''
    const currentPath = window.location.pathname
    
    switch (true) {
      case currentPath.includes('/weather'):
        return language === 'hi' 
          ? 'मौसम अपडेट और पूर्वानुमान ��ेखें।'
          : language === 'te' 
          ? 'వాతావరణ అప్‌డేట్‌లు మరియు అంచనాలను చూడండి।'
          : 'View weather updates and forecasts.'
      
      case currentPath.includes('/market'):
        return language === 'hi' 
          ? 'बाजार ��ी कीमतें और रुझान देखें।'
          : language === 'te' 
          ? 'మార్కెట్ ధరలు మరియు ట్రెండ్‌లను చూడండి।'
          : 'View market prices and trends.'
      
      case currentPath.includes('/schemes'):
        return language === 'hi' 
          ? 'सरकारी योजनाओं के बारे में जानें।'
          : language === 'te' 
          ? 'ప్రభుత్వ పథకాల గురించి తెలుసుకోండి।'
          : 'Learn about government schemes.'
      
      case currentPath.includes('/crop-advisor'):
        return language === 'hi' 
          ? 'फसल सुझाव और खेती की जानकारी प्राप्त करें।'
          : language === 'te' 
          ? 'పంట సూచనలు మరియు వ్యవసా�� సమాచారం పొందండి।'
          : 'Get crop recommendations and farming information.'
      
      case currentPath.includes('/disease-expert'):
        return language === 'hi' 
          ? 'फसल रोग की पहचान और उपचार की जानकारी।'
          : language === 'te' 
          ? 'పంట వ్యాధి గుర్తింపు మరియు చికిత్స సమాచారం।'
          : 'Crop disease identification and treatment information.'
      
      case currentPath.includes('/community'):
        return language === 'hi' 
          ? 'किसान समुदाय में जुड़ें और चर्चा करें।'
          : language === 'te' 
          ? 'రైతు కమ్యూనిటీలో చేరండి మరియు చర్చించండి।'
          : 'Join farmer community and discussions.'
      
      case currentPath.includes('/ai-assistant'):
        return language === 'hi' 
          ? 'कृत्रिम बुद्धिमान सहायक से खेती की सलाह लें।'
          : language === 'te' 
          ? 'కృత్రిమ మేధస్సు సహాయకుడి నుండి వ్యవసాయ సలహా తీసుకోండి।'
          : 'Get farming advice from AI assistant.'
      
      case currentPath.includes('/dashboard'):
        return language === 'hi' 
          ? 'आपका डैशबोर्ड - सभी जानकारी एक जगह।'
          : language === 'te' 
          ? 'మీ డ్యాష్‌బోర్డ్ - అన్ని సమాచారం ఒకే చోట।'
          : 'Your dashboard - all information in one place.'
      
      default:
        return language === 'hi' 
          ? 'स्मार्ट खेती के लिए सभी सुविधाओं का उपयोग करें।'
          : language === 'te' 
          ? 'స్మార్ట్ వ్యవసాయం కోసం అన్ని సేవలను ఉపయోగించండి।'
          : 'Use all features for smart farming.'
    }
  }

  // Don't render anything during SSR to avoid hydration mismatch
  if (typeof window === 'undefined' || !isSupported) {
    return null
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSpeak}
      className={`flex items-center gap-2 ${isPlaying ? 'animate-pulse bg-blue-50' : ''} ${className}`}
      title={isPlaying ? t.speaking : t.speak}
    >
      {isPlaying ? (
        <>
          <VolumeX className="h-4 w-4" />
          {size !== "icon" && <span>{t.stopSpeaking}</span>}
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" />
          {size !== "icon" && <span>{t.speak}</span>}
        </>
      )}
    </Button>
  )
}

// Convenience hook for pages to get voice assistant with current page context
export function useVoiceAssistant(language: SupportedLanguage = 'en') {
  const VoiceButton = ({ content, className, variant, size, translations }: Omit<VoiceAssistantProps, 'language'>) => (
    <VoiceAssistant 
      content={content}
      language={language}
      className={className}
      variant={variant}
      size={size}
      translations={translations}
    />
  )

  return { VoiceButton }
}
