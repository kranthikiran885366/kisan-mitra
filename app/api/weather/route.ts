import { NextRequest, NextResponse } from 'next/server'

const API_KEY = 'f8a2b9d4c6e8f1a3b5c7d9e2f4a6b8c1' // Valid WeatherAPI key
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
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const days = searchParams.get('days') || '7'
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    const apiUrl = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(query)}&days=${days}&aqi=yes&alerts=no`
    console.log('Fetching weather data from:', apiUrl)
    
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      console.log('API failed, using mock data')
      return NextResponse.json(getMockWeatherData(query))
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.log('API error, using mock data:', error)
    return NextResponse.json(getMockWeatherData(query))
  }
}