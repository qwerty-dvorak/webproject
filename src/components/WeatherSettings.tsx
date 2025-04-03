import React, { useEffect, useState } from "react";
import { weatherService } from "../services/weatherService";
import { sfxState } from "../stores/sfxState";
import "../styles/WeatherSettings.css";

export const WeatherSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [weatherEnabled, setWeatherEnabled] = useState(
    weatherService.isEnabled
  );

  // Simplified preset locations
  const presetLocations = ["Vellore", "Chennai", "Bengaluru"];

  useEffect(() => {
    // Load weather data if enabled
    if (weatherEnabled && !weatherService.currentWeather) {
      loadCurrentLocation();
    }
  }, [weatherEnabled]);

  const loadCurrentLocation = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const userLocation = await weatherService.getUserLocation();

      if (userLocation) {
        await weatherService.fetchWeatherByCoordinates(
          userLocation.lat,
          userLocation.lng
        );
      } else {
        // Use a default location if geolocation fails
        await weatherService.fetchWeatherByLocation("Vellore");
      }
    } catch (error) {
      console.error("Error getting weather:", error);
      setErrorMessage("Unable to get weather data. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = async () => {
    if (!location.trim()) {
      setErrorMessage("Please enter a location");
      return;
    }

    sfxState.playSfx("menuSelect");
    setLoading(true);
    setErrorMessage(null);

    try {
      await weatherService.fetchWeatherByLocation(location);
      setLocation(""); // Clear the input after successful search
    } catch (error) {
      setErrorMessage("Location not found. Try another city.");
    } finally {
      setLoading(false);
    }
  };

  const handlePresetLocation = async (preset: string) => {
    sfxState.playSfx("menuSelect");
    setLoading(true);
    setErrorMessage(null);

    try {
      await weatherService.fetchWeatherByLocation(preset);
    } catch (error) {
      setErrorMessage(`Failed to get weather for ${preset}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleWeatherEffects = () => {
    sfxState.playSfx("menuSelect");
    weatherService.toggleEnabled();
    setWeatherEnabled(weatherService.isEnabled);
  };

  return (
    <div className="weather-settings-container">
      <h2 className="settings-title">Weather Effects</h2>

      <div className="toggle-section">
        <label className="toggle-label">
          Enable Weather Effects
          <div className="toggle-switch">
            <input
              type="checkbox"
              checked={weatherEnabled}
              onChange={toggleWeatherEffects}
            />
            <span className="toggle-slider"></span>
          </div>
        </label>
      </div>

      {weatherEnabled && (
        <>
          {weatherService.currentWeather ? (
            <div className="current-weather">
              <h3>Current Weather</h3>
              <div className="weather-info">
                <div className="weather-details">
                  <div className="weather-location">
                    <span className="weather-icon">
                      {weatherService.currentWeather.icon}
                    </span>
                    {weatherService.currentWeather.location}
                  </div>
                  <div className="weather-temp-condition">
                    <span className="weather-temp">
                      {weatherService.currentWeather.temperature}°C
                    </span>
                    <span className="weather-condition">
                      {weatherService.currentWeather.condition}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-weather">
              {loading ? "Loading weather..." : "No weather data available"}
            </div>
          )}

          <div className="location-search">
            <div className="search-input">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter city name..."
                disabled={loading}
              />
              <button onClick={handleLocationSearch} disabled={loading}>
                Search
              </button>
            </div>

            <div className="preset-buttons">
              {presetLocations.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetLocation(preset)}
                  disabled={loading}
                  className="preset-button"
                >
                  {preset}
                </button>
              ))}
              <button
                onClick={loadCurrentLocation}
                disabled={loading}
                className="preset-button"
              >
                My Location
              </button>
            </div>

            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
