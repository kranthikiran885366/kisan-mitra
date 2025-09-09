import { NextRequest, NextResponse } from 'next/server'
import dbConnect from "@/lib/mongodb"
import WeatherAlert from "@/server/models/WeatherAlert"

const API_KEY = 'f8a2b9d4c6e8f1a3b5c7d9e2f4a6b8c1'
const BASE_URL = 'https://api.weatherapi.com/v1'

// Mock weather data for development
const getMockWeatherData = (location: string) => ({
  location: {
    name: location.includes(',') ? 'Current Location' : location,
    region: 'Telangana',
    country: 'India',
    lat: 17.385,
    lon: 78.4867,
    localtime: new Date().toISOString()
  },
  current: {
    temp_c: 28,
    temp_f: 82,
    condition: {
      text: 'Partly cloudy',
      icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
      code: 1003
    },
    wind_kph: 15,
    wind_degree: 180,
    wind_dir: 'S',
    pressure_mb: 1013,
    precip_mm: 0,
    humidity: 65,
    cloud: 25,
    feelslike_c: 31,
    feelslike_f: 88,
    vis_km: 10,
    uv: 6,
    gust_kph: 20,
    air_quality: {
      co: 233.4,
      no2: 15.8,
      o3: 154.3,
      so2: 7.9,
      pm2_5: 12.1,
      pm10: 18.4,
      'us-epa-index': 1,
      'gb-defra-index': 2
    }
  },
  forecast: {
    forecastday: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      date_epoch: Math.floor(Date.now() / 1000) + i * 24 * 60 * 60,
      day: {
        maxtemp_c: 30 + Math.random() * 5,
        maxtemp_f: 86 + Math.random() * 9,
        mintemp_c: 20 + Math.random() * 5,
        mintemp_f: 68 + Math.random() * 9,
        avgtemp_c: 25 + Math.random() * 5,
        avgtemp_f: 77 + Math.random() * 9,
        maxwind_kph: 15 + Math.random() * 10,
        totalprecip_mm: Math.random() * 5,
        totalsnow_cm: 0,
        avgvis_km: 10,
        avghumidity: 60 + Math.random() * 20,
        daily_will_it_rain: Math.random() > 0.7 ? 1 : 0,
        daily_chance_of_rain: Math.floor(Math.random() * 100),
        daily_will_it_snow: 0,
        daily_chance_of_snow: 0,
        condition: {
          text: ['Sunny', 'Partly cloudy', 'Cloudy', 'Light rain'][Math.floor(Math.random() * 4)],
          icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
          code: 1003
        },
        uv: 5 + Math.random() * 5
      },
      astro: {
        sunrise: '06:30 AM',
        sunset: '06:45 PM',
        moonrise: '08:30 PM',
        moonset: '07:15 AM',
        moon_phase: 'Waxing Crescent',
        moon_illumination: '25',
        is_moon_up: 0,
        is_sun_up: 1
      },
      hour: Array.from({ length: 24 }, (_, h) => ({
        time_epoch: Math.floor(Date.now() / 1000) + i * 24 * 60 * 60 + h * 60 * 60,
        time: new Date(Date.now() + i * 24 * 60 * 60 * 1000 + h * 60 * 60 * 1000).toISOString(),
        temp_c: 22 + Math.random() * 10,
        temp_f: 72 + Math.random() * 18,
        is_day: h >= 6 && h <= 18 ? 1 : 0,
        condition: {
          text: 'Partly cloudy',
          icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
          code: 1003
        },
        wind_kph: 10 + Math.random() * 10,
        wind_degree: 180,
        wind_dir: 'S',
        pressure_mb: 1013,
        precip_mm: Math.random() * 2,
        humidity: 60 + Math.random() * 20,
        cloud: 25,
        feelslike_c: 25 + Math.random() * 8,
        feelslike_f: 77 + Math.random() * 14,
        windchill_c: 22,
        windchill_f: 72,
        heatindex_c: 28,
        heatindex_f: 82,
        dewpoint_c: 18,
        will_it_rain: 0,
        chance_of_rain: Math.floor(Math.random() * 30),
        will_it_snow: 0,
        chance_of_snow: 0,
        vis_km: 10,
        gust_kph: 15,
        uv: h >= 10 && h <= 16 ? 5 + Math.random() * 5 : 0
      }))
    }))
  }
})

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const district = searchParams.get('district') || 'Guntur'
    const state = searchParams.get('state') || 'Andhra Pradesh'
    const crop = searchParams.get('crop')
    const days = searchParams.get('days') || '7'
    
    if (!query && !district) {
      return NextResponse.json({ error: 'Location parameter is required' }, { status: 400 })
    }

    // Check for existing weather data
    let weatherData = await WeatherAlert.findOne({
      "location.district": district,
      "location.state": state,
      createdAt: {
        $gte: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    }).sort({ createdAt: -1 })

    if (!weatherData) {
      // Try external API first, fallback to mock data
      let externalData
      try {
        const apiUrl = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(query || district)}&days=${days}&aqi=yes&alerts=no`
        const response = await fetch(apiUrl)
        if (response.ok) {
          externalData = await response.json()
        }
      } catch (error) {
        console.log('External API failed, using generated data')
      }

      // Use external data or generate mock data
      const weatherInfo = externalData ? {
        temperature: externalData.current.temp_c,
        humidity: externalData.current.humidity,
        rainfall: externalData.current.precip_mm,
        windSpeed: externalData.current.wind_kph,
        condition: externalData.current.condition.text.toLowerCase().includes('rain') ? 'rainy' : 
                  externalData.current.condition.text.toLowerCase().includes('cloud') ? 'cloudy' : 'sunny',
        pressure: externalData.current.pressure_mb,
        uvIndex: externalData.current.uv
      } : {
        temperature: Math.round(20 + Math.random() * 15),
        humidity: Math.round(40 + Math.random() * 40),
        rainfall: Math.random() > 0.7 ? Math.round(Math.random() * 20) : 0,
        windSpeed: Math.round(5 + Math.random() * 15),
        condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
        pressure: Math.round(1000 + Math.random() * 50),
        uvIndex: Math.round(Math.random() * 10)
      }

      // Generate forecast
      const forecastData = []
      for (let i = 0; i < parseInt(days); i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        
        const dayData = externalData?.forecast?.forecastday?.[i]
        forecastData.push({
          date,
          temperature: {
            min: dayData?.day?.mintemp_c || (weatherInfo.temperature - 5),
            max: dayData?.day?.maxtemp_c || (weatherInfo.temperature + 5)
          },
          humidity: dayData?.day?.avghumidity || (weatherInfo.humidity + (Math.random() - 0.5) * 20),
          rainfall: dayData?.day?.totalprecip_mm || (Math.random() > 0.6 ? Math.round(Math.random() * 15) : 0),
          condition: dayData?.day?.condition?.text?.toLowerCase().includes('rain') ? 'rainy' : 
                    dayData?.day?.condition?.text?.toLowerCase().includes('cloud') ? 'cloudy' : 'sunny'
        })
      }

      weatherData = new WeatherAlert({
        location: { district, state },
        weather: weatherInfo,
        forecast: forecastData
      })

      await weatherData.generateCropAlerts()
      await weatherData.calculateRisks()
      await weatherData.save()
    }

    // Filter alerts by crop if specified
    let filteredAlerts = weatherData.cropAlerts
    if (crop) {
      filteredAlerts = weatherData.cropAlerts.filter(alert => 
        alert.cropName.toLowerCase().includes(crop.toLowerCase())
      )
    }

    const response = {
      location: {
        name: `${district}, ${state}`,
        region: state,
        country: 'India'
      },
      current: {
        temp_c: weatherData.weather.temperature,
        condition: {
          text: weatherData.weather.condition,
          icon: `//cdn.weatherapi.com/weather/64x64/day/${weatherData.weather.condition === 'sunny' ? '113' : weatherData.weather.condition === 'rainy' ? '296' : '116'}.png`
        },
        humidity: weatherData.weather.humidity,
        wind_kph: weatherData.weather.windSpeed,
        precip_mm: weatherData.weather.rainfall,
        pressure_mb: weatherData.weather.pressure,
        uv: weatherData.weather.uvIndex
      },
      forecast: {
        forecastday: weatherData.forecast.map(f => ({
          date: f.date.toISOString().split('T')[0],
          day: {
            maxtemp_c: f.temperature.max,
            mintemp_c: f.temperature.min,
            avghumidity: f.humidity,
            totalprecip_mm: f.rainfall,
            condition: {
              text: f.condition,
              icon: `//cdn.weatherapi.com/weather/64x64/day/${f.condition === 'sunny' ? '113' : f.condition === 'rainy' ? '296' : '116'}.png`
            }
          }
        }))
      },
      cropAlerts: filteredAlerts.map(alert => ({
        type: alert.alertType,
        severity: alert.severity,
        title: `${alert.cropName} - ${alert.alertType.replace('_', ' ').toUpperCase()}`,
        message: alert.message,
        recommendations: alert.recommendations,
        validUntil: alert.validUntil
      })),
      pestDiseaseRisk: weatherData.pestDiseaseRisk
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(getMockWeatherData(query || 'Default Location'))
  }
}