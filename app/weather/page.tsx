"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Thermometer, 
  Droplets, 
  Wind, 
  CloudRain, 
  Sun, 
  Cloud, 
  CloudSun, 
  CloudRain as Rain, 
  CloudLightning, 
  ArrowLeft, 
  Loader2, 
  MapPin, 
  Gauge, 
  Sunset, 
  Sunrise, 
  Eye, 
  Wind as WindIcon, 
  Compass,
  Droplet,
  ThermometerSun,
  SunDim,
  CloudMoon,
  Moon,
  CloudSnow,
  CloudDrizzle,
  RefreshCw
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Legend 
} from "recharts"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Types
type WeatherData = {
  location: {
    name: string
    region: string
    country: string
    lat: number
    lon: number
    localtime: string
  }
  current: {
    temp_c: number
    temp_f: number
    condition: {
      text: string
      icon: string
      code: number
    }
    wind_kph: number
    wind_degree: number
    wind_dir: string
    pressure_mb: number
    precip_mm: number
    humidity: number
    cloud: number
    feelslike_c: number
    feelslike_f: number
    vis_km: number
    uv: number
    gust_kph: number
    air_quality?: {
      co: number
      no2: number
      o3: number
      so2: number
      pm2_5: number
      pm10: number
      'us-epa-index': number
      'gb-defra-index': number
    }
  }
  forecast: {
    forecastday: Array<{
      date: string
      date_epoch: number
      day: {
        maxtemp_c: number
        maxtemp_f: number
        mintemp_c: number
        mintemp_f: number
        avgtemp_c: number
        avgtemp_f: number
        maxwind_kph: number
        totalprecip_mm: number
        totalsnow_cm: number
        avgvis_km: number
        avghumidity: number
        daily_will_it_rain: number
        daily_chance_of_rain: number
        daily_will_it_snow: number
        daily_chance_of_snow: number
        condition: {
          text: string
          icon: string
          code: number
        }
        uv: number
        air_quality?: {
          co: number
          no2: number
          o3: number
          so2: number
          pm2_5: number
          pm10: number
          'us-epa-index': number
          'gb-defra-index': number
        }
      }
      astro: {
        sunrise: string
        sunset: string
        moonrise: string
        moonset: string
        moon_phase: string
        moon_illumination: string
        is_moon_up: number
        is_sun_up: number
      }
      hour: Array<{
        time_epoch: number
        time: string
        temp_c: number
        temp_f: number
        is_day: number
        condition: {
          text: string
          icon: string
          code: number
        }
        wind_kph: number
        wind_degree: number
        wind_dir: string
        pressure_mb: number
        precip_mm: number
        humidity: number
        cloud: number
        feelslike_c: number
        feelslike_f: number
        windchill_c: number
        windchill_f: number
        heatindex_c: number
        heatindex_f: number
        dewpoint_c: number
        will_it_rain: number
        chance_of_rain: number
        will_it_snow: number
        chance_of_snow: number
        vis_km: number
        gust_kph: number
        uv: number
      }>
    }>
  }
}

type AQICategory = 'good' | 'moderate' | 'unhealthyForSensitive' | 'unhealthy' | 'veryUnhealthy' | 'hazardous'

type Language = 'en' | 'hi' | 'te'

// Constants
const DEFAULT_LOCATION = 'Hyderabad' // Default location if geolocation fails

// Helper functions
const getAQICategory = (aqi: number): AQICategory => {
  if (aqi <= 50) return 'good'
  if (aqi <= 100) return 'moderate'
  if (aqi <= 150) return 'unhealthyForSensitive'
  if (aqi <= 200) return 'unhealthy'
  if (aqi <= 300) return 'veryUnhealthy'
  return 'hazardous'
}

const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(((degrees %= 360) < 0 ? degrees + 360 : degrees) / 22.5) % 16
  return directions[index]
}

const getWeatherIcon = (code: number, isDay: number) => {
  // This is a simplified version - in a real app, you'd want to map all weather codes
  if (code === 1000) return isDay ? <Sun className="h-6 w-6 text-yellow-500" /> : <Moon className="h-6 w-6 text-blue-200" />
  if (code === 1003) return isDay ? <CloudSun className="h-6 w-6 text-yellow-500" /> : <CloudMoon className="h-6 w-6 text-blue-200" />
  if (code > 1003 && code < 1030) return <Cloud className="h-6 w-6 text-gray-400" />
  if (code >= 1063 && code <= 1087) return <CloudRain className="h-6 w-6 text-blue-400" />
  if (code >= 1114 && code <= 1117) return <CloudSnow className="h-6 w-6 text-blue-100" />
  if (code >= 1150 && code <= 1201) return <CloudDrizzle className="h-6 w-6 text-blue-300" />
  if (code >= 1204 && code <= 1237) return <CloudSnow className="h-6 w-6 text-blue-100" />
  if (code >= 1240 && code <= 1246) return <CloudRain className="h-6 w-6 text-blue-400" />
  if (code === 1273 || code === 1276 || code === 1279 || code === 1282) return <CloudLightning className="h-6 w-6 text-yellow-500" />
  return <Cloud className="h-6 w-6 text-gray-400" />
}

const getUVIndexLevel = (uv: number) => {
  if (uv <= 2) return 'Low'
  if (uv <= 5) return 'Moderate'
  if (uv <= 7) return 'High'
  if (uv <= 10) return 'Very High'
  return 'Extreme'
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })
}

const getHourlyForecast = (hours: any[], isMetric: boolean = true) => {
  return hours.slice(0, 24).map(hour => ({
    time: new Date(hour.time).getHours() + ':00',
    temp: isMetric ? hour.temp_c : hour.temp_f,
    precip: hour.precip_mm,
    humidity: hour.humidity,
    wind: isMetric ? hour.wind_kph : hour.wind_mph,
    condition: hour.condition.text,
    icon: hour.condition.icon
  }))
}

const getDailyForecast = (forecastDays: any[], isMetric: boolean = true) => {
  return forecastDays.map(day => ({
    date: day.date,
    day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    maxtemp: isMetric ? day.day.maxtemp_c : day.day.maxtemp_f,
    mintemp: isMetric ? day.day.mintemp_c : day.day.mintemp_f,
    condition: day.day.condition.text,
    icon: day.day.condition.icon,
    rain_chance: day.day.daily_chance_of_rain,
    snow_chance: day.day.daily_chance_of_snow,
    sunrise: day.astro.sunrise,
    sunset: day.astro.sunset
  }))
}

export default function WeatherPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // State
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<string>('')
  const [language, setLanguage] = useState<Language>('en')
  const [isMetric, setIsMetric] = useState<boolean>(true)
  const [selectedDay, setSelectedDay] = useState<number>(0)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false)

  // Fetch weather data
  const fetchWeatherData = useCallback(async (query: string) => {
    if (!query) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `/api/weather?q=${encodeURIComponent(query)}&days=7`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data')
      }
      
      const data = await response.json()
      setWeatherData(data)
      setLocation(data.location.name)
    } catch (err) {
      console.error('Error fetching weather data:', err)
      setError('Failed to load weather data. Please try again.')
      toast({
        title: 'Error',
        description: 'Failed to load weather data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lon: longitude })
          fetchWeatherData(`${latitude},${longitude}`)
        },
        (error) => {
          console.error('Error getting location:', error)
          setPermissionDenied(true)
          fetchWeatherData(DEFAULT_LOCATION)
        }
      )
    } else {
      console.log('Geolocation is not supported by this browser.')
      fetchWeatherData(DEFAULT_LOCATION)
    }
  }, [fetchWeatherData])

  // Initial data fetch
  useEffect(() => {
    getUserLocation()
  }, [getUserLocation])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (location.trim()) {
      fetchWeatherData(location.trim())
    }
  }

  // Handle day selection in forecast
  const handleDaySelect = (index: number) => {
    setSelectedDay(index)
  }

  // Toggle between metric and imperial units
  const toggleUnits = () => {
    setIsMetric(!isMetric)
  }

  // Render loading state
  if (loading && !weatherData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col space-y-8">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-12 w-full max-w-md" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Error Loading Weather Data</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If no weather data is available
  if (!weatherData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Weather Data Unavailable</CardTitle>
            <CardDescription>Unable to load weather data at this time.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={getUserLocation}>
              <MapPin className="mr-2 h-4 w-4" />
              Use My Location
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Extract current weather data
  const current = weatherData.current
  const locationData = weatherData.location
  const forecastDays = weatherData.forecast.forecastday
  const selectedForecast = forecastDays[selectedDay]
  const hourlyForecast = getHourlyForecast(selectedForecast.hour, isMetric)
  const dailyForecast = getDailyForecast(forecastDays, isMetric)

  // Get AQI category if available
  const aqi = current.air_quality ? current.air_quality['us-epa-index'] : null
  const aqiCategory = aqi ? getAQICategory(aqi) : null

  // Get UV index level
  const uvLevel = getUVIndexLevel(current.uv)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {translations[language]?.title || 'Weather Updates'}
            </h1>
            <p className="text-gray-600 flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {locationData.name}, {locationData.region}, {locationData.country}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${isMetric ? 'text-blue-600' : 'text-gray-500'}`}>°C</span>
              <Switch 
                id="temperature-unit" 
                checked={!isMetric}
                onCheckedChange={toggleUnits}
              />
              <span className={`text-sm font-medium ${!isMetric ? 'text-blue-600' : 'text-gray-500'}`}>°F</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setLanguage('en')}
                className={language === 'en' ? 'bg-blue-50 text-blue-700' : ''}
              >
                EN
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLanguage('hi')}
                className={language === 'hi' ? 'bg-blue-50 text-blue-700' : ''}
              >
                हिं
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLanguage('te')}
                className={language === 'te' ? 'bg-blue-50 text-blue-700' : ''}
              >
                తె
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder={translations[language]?.searchPlaceholder || 'Search location...'}
              className="pl-10 pr-4 py-6 text-base"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Button 
              type="submit" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-10"
              disabled={!location.trim()}
            >
              {translations[language]?.search || 'Search'}
            </Button>
          </div>
        </form>

        {/* Current Weather */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Weather Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl">
                {translations[language]?.currentWeather || 'Current Weather'}
              </CardTitle>
              <CardDescription>
                {formatDate(locationData.localtime)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-6xl font-bold">
                    {isMetric ? Math.round(current.temp_c) : Math.round(current.temp_f)}°
                  </div>
                  <div>
                    <div className="text-2xl font-semibold">{current.condition.text}</div>
                    <div className="text-gray-500">
                      {translations[language]?.feelsLike || 'Feels like'}{' '}
                      {isMetric ? Math.round(current.feelslike_c) : Math.round(current.feelslike_f)}°
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <img 
                    src={`https:${current.condition.icon}`} 
                    alt={current.condition.text}
                    className="h-24 w-24"
                  />
                </div>
              </div>

              {/* Weather Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center space-x-2">
                  <Droplet className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">
                      {translations[language]?.humidity || 'Humidity'}
                    </div>
                    <div className="font-medium">{current.humidity}%</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <WindIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">
                      {translations[language]?.windSpeed || 'Wind'}
                    </div>
                    <div className="font-medium">
                      {isMetric ? current.wind_kph : current.wind_kph * 0.621371} {isMetric ? 'km/h' : 'mph'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Gauge className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">
                      {translations[language]?.pressure || 'Pressure'}
                    </div>
                    <div className="font-medium">{current.pressure_mb} mb</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">
                      {translations[language]?.visibility || 'Visibility'}
                    </div>
                    <div className="font-medium">
                      {isMetric ? current.vis_km : (current.vis_km * 0.621371).toFixed(1)} {isMetric ? 'km' : 'miles'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <SunDim className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="text-sm text-gray-500">
                      {translations[language]?.uvIndex || 'UV Index'}
                    </div>
                    <div className="font-medium">{current.uv} ({uvLevel})</div>
                  </div>
                </div>
                
                {current.air_quality && (
                  <div className="flex items-center space-x-2">
                    <Cloud className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="text-sm text-gray-500">
                        {translations[language]?.airQuality || 'Air Quality'}
                      </div>
                      <div className="font-medium capitalize">
                        {aqiCategory}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sunrise/Sunset Card */}
          <Card>
            <CardHeader>
              <CardTitle>Sun & Moon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Sunrise className="h-6 w-6 text-yellow-500" />
                  <div>
                    <div className="text-sm text-gray-500">
                      {translations[language]?.sunrise || 'Sunrise'}
                    </div>
                    <div className="font-medium">{selectedForecast.astro.sunrise}</div>
                  </div>
                </div>
                
                <div className="h-12 w-px bg-gray-200"></div>
                
                <div className="flex items-center space-x-3">
                  <Sunset className="h-6 w-6 text-orange-500" />
                  <div>
                    <div className="text-sm text-gray-500">
                      {translations[language]?.sunset || 'Sunset'}
                    </div>
                    <div className="font-medium">{selectedForecast.astro.sunset}</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">
                    {translations[language]?.precipitationChance || 'Precipitation'}
                  </div>
                  <div className="text-2xl font-bold">
                    {selectedForecast.day.daily_chance_of_rain}%
                  </div>
                  <div className="mt-2">
                    <Progress value={selectedForecast.day.daily_chance_of_rain} className="h-2" />
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">
                    {translations[language]?.humidity || 'Humidity'}
                  </div>
                  <div className="text-2xl font-bold">
                    {current.humidity}%
                  </div>
                  <div className="mt-2">
                    <Progress value={current.humidity} className="h-2" />
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-2">
                  {translations[language]?.wind || 'Wind'}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Compass className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="font-medium">
                      {getWindDirection(current.wind_degree)} {current.wind_dir}
                    </span>
                  </div>
                  <div className="font-medium">
                    {isMetric ? current.wind_kph : (current.wind_kph * 0.621371).toFixed(1)} {isMetric ? 'km/h' : 'mph'}
                  </div>
                </div>
                {current.gust_kph > 0 && (
                  <div className="text-sm text-gray-500 mt-1">
                    Gusts up to {isMetric ? current.gust_kph : (current.gust_kph * 0.621371).toFixed(1)} {isMetric ? 'km/h' : 'mph'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hourly Forecast */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {translations[language]?.hourlyForecast || 'Hourly Forecast'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="flex space-x-6 pb-4">
                {hourlyForecast.map((hour, index) => (
                  <div key={index} className="flex flex-col items-center min-w-[60px]">
                    <div className="text-sm font-medium">{hour.time}</div>
                    <div className="my-2">
                      <img 
                        src={`https:${hour.icon}`} 
                        alt={hour.condition}
                        className="h-10 w-10"
                      />
                    </div>
                    <div className="text-lg font-semibold">{Math.round(hour.temp)}°</div>
                    <div className="text-xs text-blue-600">{hour.precip > 0 ? `${hour.precip}%` : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5-Day Forecast */}
        <Card>
          <CardHeader>
            <CardTitle>
              {translations[language]?.forecast || '5-Day Forecast'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyForecast.map((day, index) => (
                <div 
                  key={day.date}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedDay === index ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  onClick={() => handleDaySelect(index)}
                >
                  <div className="w-24 font-medium">
                    {index === 0 ? 'Today' : day.day}
                  </div>
                  <div className="flex items-center space-x-2">
                    <img 
                      src={`https:${day.icon}`} 
                      alt={day.condition}
                      className="h-10 w-10"
                    />
                    <div className="text-sm text-gray-600 w-24">
                      {day.condition}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      {Math.round(day.mintemp)}°
                    </div>
                    <div className="w-20">
                      <Progress value={50} className="h-1.5" />
                    </div>
                    <div className="font-medium w-8 text-right">
                      {Math.round(day.maxtemp)}°
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const translations = {
  en: {
    title: "Weather Updates",
    searchPlaceholder: "Search location...",
    currentWeather: "Current Weather",
    feelsLike: "Feels like",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    precipitation: "Precipitation",
    uvIndex: "UV Index",
    visibility: "Visibility",
    forecast: "5-Day Forecast",
    airQuality: "Air Quality",
    good: "Good",
    moderate: "Moderate",
    unhealthy: "Unhealthy",
    sunrise: "Sunrise",
    sunset: "Sunset",
    wind: "Wind",
    pressure: "Pressure",
    precipitationChance: "Precipitation Chance",
    hourlyForecast: "Hourly Forecast",
    backToDashboard: "Back to Dashboard",
  },
  hi: {
    title: "मौसम अपडेट",
    searchPlaceholder: "स्थान खोजें...",
    currentWeather: "वर्तमान मौसम",
    feelsLike: "महसूस हो रहा है",
    humidity: "नमी",
    windSpeed: "हवा की गति",
    precipitation: "वर्षा",
    uvIndex: "यूवी सूचकांक",
    visibility: "दृश्यता",
    forecast: "5-दिन का पूर्वानुमान",
    airQuality: "वायु गुणवत्ता",
    good: "अच्छा",
    moderate: "मध्यम",
    unhealthy: "अस्वस्थ",
    sunrise: "सूर्योदय",
    sunset: "सूर्यास्त",
    wind: "हवा",
    pressure: "दबाव",
    precipitationChance: "वर्षा की संभावना",
    hourlyForecast: "प्रति घंटा पूर्वानुमान",
    backToDashboard: "डैशबोर्ड पर वापस जाएं",
  },
  te: {
    title: "వాతావరణ నవీకరణలు",
    searchPlaceholder: "స్థానం వెతకండి...",
    currentWeather: "ప్రస్తుత వాతావరణం",
    feelsLike: "అనుభూతి",
    humidity: "తేమ",
    wind: "గాలి వేగం",
    pressure: "ఒత్తిడి",
    visibility: "దృశ్యమానత",
    uvIndex: "UV సూచిక",
    airQuality: "గాలి నాణ్యత",
    sunrise: "సూర్యోదయం",
    sunset: "సూర్యాస్తమయం",
    windGust: "గాలి వేగం (గస్ట్)",
    precipitation: "వర్షపాతం",
    chanceOfRain: "వర్షపాత అవకాశం",
    hourlyForecast: "గంటవారీ అంచనా",
    dailyForecast: "రోజువారీ అంచనా",
    high: "గరిష్ఠం",
    low: "కనిష్ఠం",
    condition: "స్థితి",
    feelsLikeText: "అనుభూతి",
    windDirection: "గాలి దిశ",
    cloudCover: "మేఘావృతం",
    dewPoint: "ద్రవ బిందు",
    precipitationChance: "వర్షపాత అవకాశం",
    humidityLevel: "తేమ స్థాయి",
    pressureTrend: "ఒత్తిడి పట్టీ",
    visibilityDistance: "దృశ్యమాన దూరం",
    uvExposure: "UV ఎక్స్పోజర్",
    airQualityIndex: "గాలి నాణ్యత సూచిక",
    aqiGood: "మంచిది",
    aqiModerate: "మధ్యస్థం",
    aqiUnhealthyForSensitive: "సున్నితమైన వారికి అనుకూలం కాదు",
    aqiUnhealthy: "ఆరోగ్యానికి హానికరం",
    aqiVeryUnhealthy: "చాలా ఆరోగ్యానికి హానికరం",
    aqiHazardous: "అత్యంత ప్రమాదకరం",
    forecast: "5-రోజుల అంచనా",
    search: "వెతకండి",
    backToDashboard: "డ్యాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి"
  }
}
