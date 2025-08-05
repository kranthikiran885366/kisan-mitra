const express = require("express");
const axios = require("axios");
const auth = require("../middleware/auth");
const User = require("../models/User"); // FIXED: Use User instead of Farmer to match your auth system

const router = express.Router();

// Get current weather
router.get("/current", auth, async (req, res) => {
  try {
    const { lat, lon, district } = req.query;
    let weatherData;

    // Try to get user's location if not provided
    if (!lat || !lon) {
      const user = await User.findById(req.userId); // FIXED: Use req.userId instead of req.farmerId
      if (user && user.coordinates && user.coordinates.latitude) {
        weatherData = await getWeatherData(user.coordinates.latitude, user.coordinates.longitude);
      } else if (district) {
        // Get coordinates for district
        const districtCoords = getDistrictCoordinates(district);
        weatherData = await getWeatherData(districtCoords.lat, districtCoords.lon);
      } else {
        // Default to a central location
        weatherData = await getWeatherData(20.5937, 78.9629); // India center
      }
    } else {
      weatherData = await getWeatherData(lat, lon);
    }

    // Add farming-specific advice
    const farmingAdvice = generateFarmingAdvice(weatherData);

    res.json({
      success: true,
      data: {
        ...weatherData,
        farmingAdvice,
      },
    });
  } catch (error) {
    console.error("Weather error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get weather data",
      error: error.message,
      data: getMockWeatherData(), // Fallback to mock data
    });
  }
});

// Get weather forecast
router.get("/forecast", auth, async (req, res) => {
  try {
    const { lat, lon, days = 5 } = req.query;
    let forecastData;

    // Try to get user's location if not provided
    if (!lat || !lon) {
      const user = await User.findById(req.userId);
      if (user && user.coordinates && user.coordinates.latitude) {
        forecastData = await getForecastData(user.coordinates.latitude, user.coordinates.longitude, days);
      } else {
        // Default to a central location
        forecastData = await getForecastData(20.5937, 78.9629, days); // India center
      }
    } else {
      forecastData = await getForecastData(lat, lon, days);
    }

    res.json({
      success: true,
      data: forecastData,
    });
  } catch (error) {
    console.error("Forecast error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get forecast data",
      error: error.message,
    });
  }
});

// Helper functions
async function getWeatherData(lat, lon) {
  try {
    const API_KEY = process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;
    
    if (!API_KEY) {
      console.warn("Weather API key not found, returning mock data");
      return getMockWeatherData();
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const response = await axios.get(url);
    
    return {
      temperature: response.data.main.temp,
      humidity: response.data.main.humidity,
      pressure: response.data.main.pressure,
      windSpeed: response.data.wind.speed,
      windDirection: response.data.wind.deg,
      description: response.data.weather[0].description,
      main: response.data.weather[0].main,
      visibility: response.data.visibility,
      location: response.data.name,
      country: response.data.sys.country,
      sunrise: new Date(response.data.sys.sunrise * 1000),
      sunset: new Date(response.data.sys.sunset * 1000),
      feelsLike: response.data.main.feels_like,
    };
  } catch (error) {
    console.error("Weather API error:", error);
    return getMockWeatherData();
  }
}

async function getForecastData(lat, lon, days) {
  try {
    const API_KEY = process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;
    
    if (!API_KEY) {
      console.warn("Weather API key not found, returning mock data");
      return getMockForecastData();
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=${days * 8}&appid=${API_KEY}&units=metric`;
    const response = await axios.get(url);
    
    return {
      list: response.data.list.map(item => ({
        dt: item.dt,
        date: new Date(item.dt * 1000),
        temperature: item.main.temp,
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        windSpeed: item.wind.speed,
        description: item.weather[0].description,
        main: item.weather[0].main,
      })),
      city: response.data.city,
    };
  } catch (error) {
    console.error("Forecast API error:", error);
    return getMockForecastData();
  }
}

function getDistrictCoordinates(district) {
  // This is a simplified implementation
  // In a real app, you'd have a database of district coordinates
  const districtCoords = {
    "hyderabad": { lat: 17.3850, lon: 78.4867 },
    "bangalore": { lat: 12.9716, lon: 77.5946 },
    "mumbai": { lat: 19.0760, lon: 72.8777 },
    "delhi": { lat: 28.7041, lon: 77.1025 },
    "chennai": { lat: 13.0827, lon: 80.2707 },
    "kolkata": { lat: 22.5726, lon: 88.3639 },
    "pune": { lat: 18.5204, lon: 73.8567 },
    "ahmedabad": { lat: 23.0225, lon: 72.5714 },
  };

  return districtCoords[district.toLowerCase()] || { lat: 20.5937, lon: 78.9629 };
}

function generateFarmingAdvice(weatherData) {
  const advice = [];
  
  if (weatherData.temperature > 35) {
    advice.push("High temperature detected. Ensure adequate irrigation and consider shade nets for sensitive crops.");
  }
  
  if (weatherData.humidity > 80) {
    advice.push("High humidity levels. Monitor crops for fungal diseases and ensure proper ventilation.");
  }
  
  if (weatherData.windSpeed > 15) {
    advice.push("Strong winds detected. Secure loose structures and protect young plants.");
  }
  
  if (weatherData.main && weatherData.main.toLowerCase().includes("rain")) {
    advice.push("Rain expected. Delay pesticide/fertilizer application and ensure proper drainage.");
  }
  
  if (weatherData.temperature < 10) {
    advice.push("Low temperature alert. Protect sensitive crops from frost damage.");
  }

  return advice;
}

function getMockWeatherData() {
  return {
    temperature: 28,
    humidity: 65,
    pressure: 1013,
    windSpeed: 5.2,
    windDirection: 180,
    description: "partly cloudy",
    main: "Clouds",
    visibility: 10000,
    location: "Sample Location",
    country: "IN",
    sunrise: new Date(),
    sunset: new Date(),
    feelsLike: 30,
  };
}

function getMockForecastData() {
  const forecast = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    forecast.push({
      dt: Math.floor(date.getTime() / 1000),
      date: date,
      temperature: 25 + Math.random() * 10,
      humidity: 60 + Math.random() * 20,
      pressure: 1010 + Math.random() * 10,
      windSpeed: 3 + Math.random() * 5,
      description: "partly cloudy",
      main: "Clouds",
    });
  }
  
  return {
    list: forecast,
    city: { name: "Sample City", country: "IN" },
  };
}

module.exports = router;