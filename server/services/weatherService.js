const axios = require("axios")
const User = require("../models/User")
const Alert = require("../models/Alert")
const whatsappService = require("./whatsappService")

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY
    this.baseUrl = "https://api.openweathermap.org/data/2.5"
    this.oneCallUrl = "https://api.openweathermap.org/data/3.0/onecall"
  }

  // Get current weather for coordinates
  async getCurrentWeather(lat, lon, units = "metric") {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units,
          lang: "en",
        },
      })

      return this.formatCurrentWeather(response.data)
    } catch (error) {
      console.error("Error fetching current weather:", error)
      throw new Error("Failed to fetch current weather data")
    }
  }

  // Get weather forecast using One Call API
  async getWeatherForecast(lat, lon, units = "metric") {
    try {
      const response = await axios.get(this.oneCallUrl, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units,
          exclude: "minutely",
          lang: "en",
        },
      })

      return this.formatForecastWeather(response.data)
    } catch (error) {
      console.error("Error fetching weather forecast:", error)
      throw new Error("Failed to fetch weather forecast data")
    }
  }

  // Format current weather data
  formatCurrentWeather(data) {
    return {
      location: {
        name: data.name,
        country: data.sys.country,
        coordinates: {
          lat: data.coord.lat,
          lon: data.coord.lon,
        },
      },
      current: {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        visibility: data.visibility / 1000, // Convert to km
        uvIndex: 0, // Not available in current weather API
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        cloudiness: data.clouds.all,
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        sunrise: new Date(data.sys.sunrise * 1000),
        sunset: new Date(data.sys.sunset * 1000),
        timestamp: new Date(data.dt * 1000),
      },
      alerts: [], // Will be populated separately
    }
  }

  // Format forecast weather data
  formatForecastWeather(data) {
    return {
      location: {
        coordinates: {
          lat: data.lat,
          lon: data.lon,
        },
        timezone: data.timezone,
      },
      current: {
        temperature: Math.round(data.current.temp),
        feelsLike: Math.round(data.current.feels_like),
        humidity: data.current.humidity,
        pressure: data.current.pressure,
        visibility: data.current.visibility / 1000,
        uvIndex: data.current.uvi,
        windSpeed: data.current.wind_speed,
        windDirection: data.current.wind_deg,
        cloudiness: data.current.clouds,
        condition: data.current.weather[0].main,
        description: data.current.weather[0].description,
        icon: data.current.weather[0].icon,
        sunrise: new Date(data.current.sunrise * 1000),
        sunset: new Date(data.current.sunset * 1000),
        timestamp: new Date(data.current.dt * 1000),
      },
      hourly: data.hourly.slice(0, 24).map((hour) => ({
        time: new Date(hour.dt * 1000),
        temperature: Math.round(hour.temp),
        feelsLike: Math.round(hour.feels_like),
        humidity: hour.humidity,
        pressure: hour.pressure,
        windSpeed: hour.wind_speed,
        windDirection: hour.wind_deg,
        cloudiness: hour.clouds,
        condition: hour.weather[0].main,
        description: hour.weather[0].description,
        icon: hour.weather[0].icon,
        pop: Math.round(hour.pop * 100), // Probability of precipitation
        rain: hour.rain ? hour.rain["1h"] || 0 : 0,
        snow: hour.snow ? hour.snow["1h"] || 0 : 0,
      })),
      daily: data.daily.slice(0, 8).map((day) => ({
        date: new Date(day.dt * 1000),
        temperature: {
          min: Math.round(day.temp.min),
          max: Math.round(day.temp.max),
          morning: Math.round(day.temp.morn),
          day: Math.round(day.temp.day),
          evening: Math.round(day.temp.eve),
          night: Math.round(day.temp.night),
        },
        feelsLike: {
          morning: Math.round(day.feels_like.morn),
          day: Math.round(day.feels_like.day),
          evening: Math.round(day.feels_like.eve),
          night: Math.round(day.feels_like.night),
        },
        humidity: day.humidity,
        pressure: day.pressure,
        windSpeed: day.wind_speed,
        windDirection: day.wind_deg,
        cloudiness: day.clouds,
        condition: day.weather[0].main,
        description: day.weather[0].description,
        icon: day.weather[0].icon,
        pop: Math.round(day.pop * 100),
        rain: day.rain || 0,
        snow: day.snow || 0,
        uvIndex: day.uvi,
        sunrise: new Date(day.sunrise * 1000),
        sunset: new Date(day.sunset * 1000),
      })),
      alerts: data.alerts
        ? data.alerts.map((alert) => ({
            sender: alert.sender_name,
            event: alert.event,
            start: new Date(alert.start * 1000),
            end: new Date(alert.end * 1000),
            description: alert.description,
            tags: alert.tags || [],
          }))
        : [],
    }
  }

  // Get weather for city name
  async getWeatherByCity(cityName, units = "metric") {
    try {
      // First get coordinates for the city
      const geoResponse = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: cityName,
          appid: this.apiKey,
          units,
        },
      })

      const { lat, lon } = geoResponse.data.coord

      // Then get detailed forecast
      return await this.getWeatherForecast(lat, lon, units)
    } catch (error) {
      console.error("Error fetching weather by city:", error)
      throw new Error("Failed to fetch weather data for city")
    }
  }

  // Analyze weather for farming advice
  analyzeWeatherForFarming(weatherData, cropType = null) {
    const current = weatherData.current
    const forecast = weatherData.daily
    const advice = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
      alerts: [],
    }

    // Temperature analysis
    if (current.temperature > 35) {
      advice.immediate.push({
        type: "warning",
        message: "High temperature detected. Ensure adequate irrigation and shade for crops.",
        priority: "high",
      })
    }

    if (current.temperature < 10) {
      advice.immediate.push({
        type: "warning",
        message: "Low temperature detected. Protect sensitive crops from cold damage.",
        priority: "high",
      })
    }

    // Humidity analysis
    if (current.humidity > 80) {
      advice.immediate.push({
        type: "advisory",
        message: "High humidity may increase disease risk. Monitor crops for fungal infections.",
        priority: "medium",
      })
    }

    if (current.humidity < 30) {
      advice.immediate.push({
        type: "advisory",
        message: "Low humidity detected. Increase irrigation frequency.",
        priority: "medium",
      })
    }

    // Wind analysis
    if (current.windSpeed > 15) {
      advice.immediate.push({
        type: "warning",
        message: "Strong winds detected. Secure loose structures and protect young plants.",
        priority: "high",
      })
    }

    // Rainfall analysis for next 7 days
    const totalRainfall = forecast.slice(0, 7).reduce((sum, day) => sum + day.rain, 0)

    if (totalRainfall > 100) {
      advice.shortTerm.push({
        type: "warning",
        message: "Heavy rainfall expected. Ensure proper drainage and delay harvesting if needed.",
        priority: "high",
      })
    } else if (totalRainfall < 10) {
      advice.shortTerm.push({
        type: "advisory",
        message: "Low rainfall expected. Plan irrigation accordingly.",
        priority: "medium",
      })
    }

    // UV Index analysis
    if (current.uvIndex > 8) {
      advice.immediate.push({
        type: "advisory",
        message: "High UV index. Consider shade nets for sensitive crops.",
        priority: "medium",
      })
    }

    // Crop-specific advice
    if (cropType) {
      const cropAdvice = this.getCropSpecificAdvice(cropType, weatherData)
      advice.immediate.push(...cropAdvice.immediate)
      advice.shortTerm.push(...cropAdvice.shortTerm)
    }

    return advice
  }

  // Get crop-specific weather advice
  getCropSpecificAdvice(cropType, weatherData) {
    const advice = { immediate: [], shortTerm: [] }
    const current = weatherData.current
    const forecast = weatherData.daily

    switch (cropType.toLowerCase()) {
      case "rice":
      case "paddy":
        if (current.temperature > 32) {
          advice.immediate.push({
            type: "warning",
            message: "High temperature may affect rice flowering. Maintain water levels.",
            priority: "high",
          })
        }
        break

      case "wheat":
        if (current.temperature > 25 && forecast[0].temperature.max > 30) {
          advice.immediate.push({
            type: "warning",
            message: "Rising temperature may affect wheat grain filling. Consider early harvest.",
            priority: "high",
          })
        }
        break

      case "cotton":
        if (current.humidity > 85) {
          advice.immediate.push({
            type: "warning",
            message: "High humidity increases bollworm risk in cotton. Monitor and treat if necessary.",
            priority: "high",
          })
        }
        break

      case "tomato":
        if (current.temperature > 30 || current.temperature < 15) {
          advice.immediate.push({
            type: "advisory",
            message: "Temperature stress may affect tomato fruit setting. Provide shade or protection.",
            priority: "medium",
          })
        }
        break

      default:
        // General advice for unknown crops
        break
    }

    return advice
  }

  // Send daily weather alerts to farmers
  async sendDailyWeatherAlerts() {
    try {
      console.log("Starting daily weather alert job...")

      // Get all active farmers with coordinates
      const farmers = await User.find({
        role: "farmer",
        isActive: true,
        "coordinates.latitude": { $exists: true },
        "coordinates.longitude": { $exists: true },
        "notifications.weather": true,
      }).select("name mobile coordinates preferredLanguage currentCrops district state")

      console.log(`Found ${farmers.length} farmers for weather alerts`)

      for (const farmer of farmers) {
        try {
          // Get weather data for farmer's location
          const weatherData = await this.getWeatherForecast(farmer.coordinates.latitude, farmer.coordinates.longitude)

          // Analyze weather for farming advice
          const cropTypes = farmer.currentCrops.map((crop) => crop.cropName)
          const advice = this.analyzeWeatherForFarming(weatherData, cropTypes[0])

          // Check if any alerts need to be sent
          const criticalAlerts = [
            ...advice.immediate.filter((a) => a.priority === "high"),
            ...advice.shortTerm.filter((a) => a.priority === "high"),
          ]

          if (criticalAlerts.length > 0 || this.shouldSendDailyUpdate(weatherData)) {
            await this.createWeatherAlert(farmer, weatherData, advice)
          }
        } catch (error) {
          console.error(`Failed to process weather alert for farmer ${farmer._id}:`, error)
        }
      }

      console.log("Daily weather alert job completed")
    } catch (error) {
      console.error("Daily weather alert job failed:", error)
      throw error
    }
  }

  // Check if daily weather update should be sent
  shouldSendDailyUpdate(weatherData) {
    const current = weatherData.current
    const tomorrow = weatherData.daily[1]

    // Send if extreme weather conditions
    if (current.temperature > 35 || current.temperature < 10) return true
    if (current.windSpeed > 15) return true
    if (tomorrow.rain > 20) return true
    if (tomorrow.temperature.max > 35 || tomorrow.temperature.min < 10) return true

    return false
  }

  // Create weather alert for farmer
  async createWeatherAlert(farmer, weatherData, advice) {
    try {
      const current = weatherData.current
      const tomorrow = weatherData.daily[1]

      // Create alert content in multiple languages
      const alertContent = {
        en: {
          title: `Weather Alert - ${farmer.district}`,
          message: this.generateWeatherMessage(weatherData, advice, "en"),
          actionText: "View Details",
        },
        hi: {
          title: `मौसम चेतावनी - ${farmer.district}`,
          message: this.generateWeatherMessage(weatherData, advice, "hi"),
          actionText: "विवरण देखें",
        },
        te: {
          title: `వాతావరణ హెచ్చరిక - ${farmer.district}`,
          message: this.generateWeatherMessage(weatherData, advice, "te"),
          actionText: "వివరాలు చూడండి",
        },
      }

      // Determine alert severity
      const severity = this.determineAlertSeverity(advice)

      // Create alert document
      const alert = new Alert({
        title: alertContent.en.title,
        message: alertContent.en.message,
        type: "weather_warning",
        severity: severity,
        content: alertContent,
        targetAudience: {
          roles: ["farmer"],
          locations: [
            {
              state: farmer.state,
              districts: [farmer.district],
            },
          ],
        },
        weatherData: {
          temperature: {
            current: current.temperature,
            min: tomorrow.temperature.min,
            max: tomorrow.temperature.max,
          },
          humidity: current.humidity,
          rainfall: {
            current: 0,
            forecast: tomorrow.rain,
          },
          windSpeed: current.windSpeed,
          conditions: current.condition,
          forecast: weatherData.daily.slice(0, 3).map((day) => ({
            date: day.date,
            condition: day.condition,
            temperature: { min: day.temperature.min, max: day.temperature.max },
            rainfall: day.rain,
          })),
        },
        recommendations: advice.immediate.concat(advice.shortTerm).map((item) => ({
          action: item.message,
          priority: item.priority === "high" ? "immediate" : "within_24hrs",
        })),
        scheduledFor: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        status: "sent",
        createdBy: null, // System generated
        creatorType: "weather_service",
        channels: {
          inApp: true,
          whatsapp: farmer.notifications.whatsapp,
          push: true,
        },
      })

      await alert.save()

      // Send WhatsApp message if enabled
      if (farmer.notifications.whatsapp && farmer.mobile) {
        const message = alertContent[farmer.preferredLanguage] || alertContent.en
        await whatsappService.sendWeatherAlert(farmer.mobile, message, farmer.preferredLanguage)
      }

      console.log(`Weather alert created for farmer ${farmer.name} (${farmer.mobile})`)
    } catch (error) {
      console.error("Error creating weather alert:", error)
      throw error
    }
  }

  // Generate weather message in specified language
  generateWeatherMessage(weatherData, advice, language = "en") {
    const current = weatherData.current
    const tomorrow = weatherData.daily[1]

    const messages = {
      en: {
        current: `Current: ${current.temperature}°C, ${current.condition}`,
        tomorrow: `Tomorrow: ${tomorrow.temperature.min}-${tomorrow.temperature.max}°C`,
        rain: tomorrow.rain > 0 ? `, ${tomorrow.rain}mm rain expected` : "",
        advice: advice.immediate.length > 0 ? `\n\nAdvice: ${advice.immediate[0].message}` : "",
      },
      hi: {
        current: `वर्तमान: ${current.temperature}°C, ${current.condition}`,
        tomorrow: `कल: ${tomorrow.temperature.min}-${tomorrow.temperature.max}°C`,
        rain: tomorrow.rain > 0 ? `, ${tomorrow.rain}mm बारिश की संभावना` : "",
        advice: advice.immediate.length > 0 ? `\n\nसलाह: ${advice.immediate[0].message}` : "",
      },
      te: {
        current: `ప్రస్తుతం: ${current.temperature}°C, ${current.condition}`,
        tomorrow: `రేపు: ${tomorrow.temperature.min}-${tomorrow.temperature.max}°C`,
        rain: tomorrow.rain > 0 ? `, ${tomorrow.rain}mm వర్షం అవకాశం` : "",
        advice: advice.immediate.length > 0 ? `\n\nసలహా: ${advice.immediate[0].message}` : "",
      },
    }

    const msg = messages[language] || messages.en
    return `${msg.current}\n${msg.tomorrow}${msg.rain}${msg.advice}`
  }

  // Determine alert severity based on advice
  determineAlertSeverity(advice) {
    const highPriorityCount =
      advice.immediate.filter((a) => a.priority === "high").length +
      advice.shortTerm.filter((a) => a.priority === "high").length

    if (highPriorityCount >= 2) return "critical"
    if (highPriorityCount >= 1) return "high"
    return "medium"
  }

  // Get weather alerts for location
  async getWeatherAlertsForLocation(state, district) {
    try {
      return await Alert.getWeatherAlertsForLocation(state, district)
    } catch (error) {
      console.error("Error getting weather alerts:", error)
      throw error
    }
  }

  // Get historical weather data (mock implementation)
  async getHistoricalWeather(lat, lon, startDate, endDate) {
    // This would typically call a historical weather API
    // For now, return mock data
    return {
      location: { lat, lon },
      period: { start: startDate, end: endDate },
      data: [
        // Mock historical data
        {
          date: new Date(startDate),
          temperature: { min: 20, max: 30 },
          humidity: 65,
          rainfall: 5,
          condition: "Partly Cloudy",
        },
      ],
    }
  }
}

module.exports = new WeatherService()
