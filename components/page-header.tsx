"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import VoiceAssistant, { type SupportedLanguage } from "@/components/voice-assistant"

interface PageHeaderProps {
  title: string
  language?: SupportedLanguage
  showBackButton?: boolean
  backUrl?: string
  children?: ReactNode
  voiceContent?: string
  voiceTranslations?: {
    speak?: string
    speaking?: string
    stopSpeaking?: string
  }
}

export default function PageHeader({
  title,
  language = 'en',
  showBackButton = true,
  backUrl = '/dashboard',
  children,
  voiceContent,
  voiceTranslations
}: PageHeaderProps) {
  const router = useRouter()

  const backText = language === 'hi' ? 'वापस जाएं' : language === 'te' ? 'తిరిగి వెళ్లండి' : 'Back'

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <Button
            variant="outline"
            onClick={() => router.push(backUrl)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {backText}
          </Button>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <VoiceAssistant
          content={voiceContent}
          language={language}
          pageTitle={title}
          translations={voiceTranslations}
        />
        {children}
      </div>
    </div>
  )
}
