import { useState, useCallback, useEffect } from 'react'

export type SupportedLanguage = 'en' | 'hi' | 'te'

interface SpeechOptions {
  language?: SupportedLanguage
  rate?: number
  pitch?: number
  volume?: number
}

export function useSpeech() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isSupported, setIsSupported] = useState<boolean>(false)

  // Check for speech synthesis support only on client side
  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
  }, [])

  const speak = useCallback((text: string, options?: SpeechOptions) => {
    if (!isSupported || !text.trim()) {
      console.warn('Speech synthesis not supported or empty text provided')
      return
    }

    // Stop any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Set language based on option or default to English
    const lang = options?.language || 'en'
    utterance.lang = getLanguageCode(lang)
    
    // Set voice properties
    utterance.rate = options?.rate || 0.9
    utterance.pitch = options?.pitch || 1
    utterance.volume = options?.volume || 1

    // Set up event handlers
    utterance.onstart = () => {
      setIsPlaying(true)
    }

    utterance.onend = () => {
      setIsPlaying(false)
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error)
      setIsPlaying(false)
    }

    // Try to get a voice that matches the language
    const voices = window.speechSynthesis.getVoices()
    const targetLangCode = getLanguageCode(lang)
    
    const matchingVoice = voices.find(voice => 
      voice.lang.startsWith(targetLangCode.split('-')[0])
    )
    
    if (matchingVoice) {
      utterance.voice = matchingVoice
    }

    // Start speaking
    window.speechSynthesis.speak(utterance)
  }, [isSupported])

  const stop = useCallback(() => {
    if (isSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
    }
  }, [isSupported])

  const pause = useCallback(() => {
    if (isSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause()
    }
  }, [isSupported])

  const resume = useCallback(() => {
    if (isSupported && window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
  }, [isSupported])

  return {
    speak,
    stop,
    pause,
    resume,
    isPlaying,
    isSupported
  }
}

// Helper function to get proper language codes for speech synthesis
function getLanguageCode(lang: SupportedLanguage): string {
  switch (lang) {
    case 'en':
      return 'en-US'
    case 'hi':
      return 'hi-IN'
    case 'te':
      return 'te-IN'
    default:
      return 'en-US'
  }
}

// Hook specifically for page content speech with language-aware text
export function usePageSpeech() {
  const { speak, isPlaying, isSupported, stop } = useSpeech()

  const speakPageContent = useCallback((
    content: string,
    language: SupportedLanguage = 'en',
    options?: Omit<SpeechOptions, 'language'>
  ) => {
    speak(content, { ...options, language })
  }, [speak])

  return {
    speakPageContent,
    stopSpeech: stop,
    isPlaying,
    isSupported
  }
}
