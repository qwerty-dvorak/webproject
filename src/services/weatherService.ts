// Weather API integration for customizing game environment

// In a real implementation, you would use environment variables for API keys
const WEATHER_API_KEY = "88e2f73971864238bcb80135250304";

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  windSpeed: number;
  humidity: number;
}

export interface GameWeatherEffect {
  skyColor: string;
  fogDensity: number;
  particleEffect: "none" | "rain" | "snow" | "fog" | "sunny";
  lightIntensity: number;
}

export interface WeatherService {
    currentWeather: WeatherData | null;
    gameEffect: GameWeatherEffect;
    isLoading: boolean;
    error: string | null;
    fetchWeatherByLocation: (location: string) => Promise<void>;
    fetchWeatherByCoordinates: (lat: number, lng: number) => Promise<void>;
    applyWeatherToGameEffect: () => void;
    getUserLocation: () => Promise<{ lat: number; lng: number } | null>;
    isEnabled: boolean;
    toggleEnabled: () => void;
    getWeatherIcon: (condition: string) => string; // Add this method declaration
  }
  
// Default game effects
const defaultGameEffect: GameWeatherEffect = {
  skyColor: "#87CEEB", // Default blue sky
  fogDensity: 0,
  particleEffect: "none",
  lightIntensity: 1.0,
};

// Mock weather data for development without API key
// const MOCK_WEATHER_DATA: Record<string, WeatherData> = {
//   "New York": {
//     location: "New York, US",
//     temperature: 18,
//     condition: "Partly Cloudy",
//     icon: "⛅",
//     windSpeed: 8,
//     humidity: 65,
//   },
//   London: {
//     location: "London, UK",
//     temperature: 12,
//     condition: "Rainy",
//     icon: "🌧️",
//     windSpeed: 12,
//     humidity: 80,
//   },
//   Tokyo: {
//     location: "Tokyo, JP",
//     temperature: 22,
//     condition: "Clear",
//     icon: "☀️",
//     windSpeed: 5,
//     humidity: 45,
//   },
//   Sydney: {
//     location: "Sydney, AU",
//     temperature: 26,
//     condition: "Sunny",
//     icon: "☀️",
//     windSpeed: 10,
//     humidity: 50,
//   },
//   default: {
//     location: "Unknown",
//     temperature: 20,
//     condition: "Clear",
//     icon: "☀️",
//     windSpeed: 5,
//     humidity: 60,
//   },
// };

// Weather service implementation
export const weatherService: WeatherService = {
  currentWeather: null,
  gameEffect: { ...defaultGameEffect },
  isLoading: false,
  error: null,
  isEnabled: localStorage.getItem("weatherEffects") === "true" || false,

  // Toggle weather effects
  toggleEnabled() {
    this.isEnabled = !this.isEnabled;
    localStorage.setItem("weatherEffects", this.isEnabled.toString());
  },

  // Fetch weather by location name
  async fetchWeatherByLocation(location: string) {
    this.isLoading = true;
    this.error = null;

    try {
      console.log(`Fetching weather for location: ${location}`);
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(
          location
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const data = await response.json();
      console.log("Weather API response:", data);

      this.currentWeather = {
        location: `${data.location.name}, ${data.location.country}`,
        temperature: data.current.temp_c,
        condition: data.current.condition.text,
        icon: this.getWeatherIcon(data.current.condition.text), // Use emoji instead of URL
        windSpeed: data.current.wind_kph,
        humidity: data.current.humidity,
      };

      // Apply weather effects to game
      this.applyWeatherToGameEffect();
    } catch (error) {
      console.error("Error fetching weather data:", error);
      this.error = "Failed to load weather data. Please try again later.";
    } finally {
      this.isLoading = false;
    }
  },

  // Fetch weather by coordinates
  async fetchWeatherByCoordinates(lat: number, lng: number) {
    this.isLoading = true;
    this.error = null;

    try {
      console.log(`Fetching weather for coordinates: ${lat}, ${lng}`);
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lng}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const data = await response.json();
      console.log("Weather API response:", data);

      this.currentWeather = {
        location: `${data.location.name}, ${data.location.country}`,
        temperature: data.current.temp_c,
        condition: data.current.condition.text,
        icon: this.getWeatherIcon(data.current.condition.text), // Use emoji instead of URL
        windSpeed: data.current.wind_kph,
        humidity: data.current.humidity,
      };

      // Apply weather effects to game
      this.applyWeatherToGameEffect();
    } catch (error) {
      console.error("Error fetching weather data:", error);
      this.error = "Failed to load weather data. Please try again later.";
    } finally {
      this.isLoading = false;
    }
  },

  // Convert weather data to game effects
  applyWeatherToGameEffect() {
    if (!this.currentWeather) return;

    const weather = this.currentWeather;
    const condition = weather.condition.toLowerCase();

    // Reset to defaults
    const effect = { ...defaultGameEffect };

    // Apply effects based on weather condition
    if (condition.includes("rain") || condition.includes("drizzle")) {
      effect.skyColor = "#708090"; // Slate gray
      effect.fogDensity = 0.2;
      effect.particleEffect = "rain";
      effect.lightIntensity = 0.7;
    } else if (condition.includes("snow")) {
      effect.skyColor = "#E0FFFF"; // Light cyan
      effect.fogDensity = 0.3;
      effect.particleEffect = "snow";
      effect.lightIntensity = 0.8;
    } else if (condition.includes("fog") || condition.includes("mist")) {
      effect.skyColor = "#DCDCDC"; // Gainsboro
      effect.fogDensity = 0.5;
      effect.particleEffect = "fog";
      effect.lightIntensity = 0.6;
    } else if (condition.includes("cloud")) {
      effect.skyColor = "#B0C4DE"; // Light steel blue
      effect.fogDensity = 0.1;
      effect.particleEffect = "none";
      effect.lightIntensity = 0.9;
    } else if (condition.includes("clear") || condition.includes("sunny")) {
      effect.skyColor = "#87CEEB"; // Sky blue
      effect.fogDensity = 0;
      effect.particleEffect = "sunny";
      effect.lightIntensity = 1.2;
    }

    // Adjust for temperature
    if (weather.temperature < 0) {
      // Colder tint for very cold weather
      effect.skyColor = mixColors(effect.skyColor, "#ADD8E6", 0.3); // Light blue tint
    } else if (weather.temperature > 30) {
      // Warmer tint for very hot weather
      effect.skyColor = mixColors(effect.skyColor, "#FFA07A", 0.3); // Light salmon tint
    }

    this.gameEffect = effect;
  },

  // Get user's location
  async getUserLocation() {
    return new Promise<{ lat: number; lng: number } | null>((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          resolve(null);
        }
      );
    });
  },

  // Get weather icon as emoji
     getWeatherIcon(condition: string): string {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes("rain")) return "🌧️";
    if (conditionLower.includes("snow")) return "❄️";
    if (conditionLower.includes("clear") || conditionLower.includes("sunny"))
      return "☀️";
    if (conditionLower.includes("cloud")) return "☁️";
    if (conditionLower.includes("fog") || conditionLower.includes("mist"))
      return "🌫️";
    return "⛅"; // Default icon
  },
};

// Helper function to mix colors
function mixColors(color1: string, color2: string, ratio: number): string {
  // Convert hex to RGB
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);

  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);

  // Mix the colors
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);

  // Convert back to hex
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
