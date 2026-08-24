import React, { useState, useEffect } from "react";
import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiFog,
  WiWindDeg,
  WiBarometer,
  WiSunrise,
  WiSunset,
  WiHumidity,
  WiDaySunnyOvercast
} from "react-icons/wi";
import { FaCalendarAlt, FaMapMarkerAlt, FaSearch, FaCrosshairs, FaEye } from "react-icons/fa";

export default function WeatherApp() {
  const [city, setCity] = useState("Kolkata");
  const [searchQuery, setSearchQuery] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("C"); // 'C' for Celsius, 'F' for Fahrenheit

  // Helper function to map WMO Weather Codes to text & component icons
  const getWeatherDetails = (code) => {
    switch (code) {
      case 0:
        return { condition: "Clear Sky", icon: <WiDaySunny className="text-xl text-yellow-300" />, type: "sun" };
      case 1:
      case 2:
      case 3:
        return { condition: "Partly Cloudy", icon: <WiCloudy className="text-xl text-gray-200" />, type: "cloud" };
      case 45:
      case 48:
        return { condition: "Foggy", icon: <WiFog className="text-xl text-gray-300" />, type: "fog" };
      case 51:
      case 53:
      case 55:
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
      case 82:
        return { condition: "Rainy", icon: <WiRain className="text-xl text-blue-300" />, type: "rain" };
      case 71:
      case 73:
      case 75:
      case 85:
      case 86:
        return { condition: "Snowy", icon: <WiSnow className="text-xl text-blue-100" />, type: "snow" };
      case 95:
      case 96:
      case 99:
        return { condition: "Thunderstorm", icon: <WiThunderstorm className="text-xl text-yellow-400" />, type: "thunder" };
      default:
        return { condition: "Clear", icon: <WiDaySunny className="text-xl text-yellow-300" />, type: "sun" };
    }
  };

  // Convert Celsius to Fahrenheit
  const convertTemp = (tempC) => {
    if (unit === "F") {
      return Math.round((tempC * 9) / 5 + 32);
    }
    return Math.round(tempC);
  };

  // Dynamic macOS Glassmorphism Backgrounds depending on weather type
  const getThemeGradient = (type) => {
    switch (type) {
      case "sun":
        return "from-[#1e3c72] via-[#2a5298] to-[#4a00e0]";
      case "cloud":
        return "from-[#2c3e50] via-[#4ca1af] to-[#2c3e50]";
      case "rain":
      case "thunder":
        return "from-[#0f2027] via-[#203a43] to-[#2c5364]";
      case "snow":
        return "from-[#136a8a] via-[#267871] to-[#136a8a]";
      default:
        return "from-[#2c5364] via-[#203a43] to-[#0f2027]";
    }
  };

  // Helper function to parse forecast data into state structure
  const buildWeatherData = (cityName, countryName, data) => {
    const currentDetails = getWeatherDetails(data.current.weather_code);

    return {
      city: cityName,
      country: countryName,
      rawTemp: data.current.temperature_2m,
      rawFeelsLike: data.current.apparent_temperature,
      rawHigh: data.daily.temperature_2m_max[0],
      rawLow: data.daily.temperature_2m_min[0],
      humidity: `${data.current.relative_humidity_2m}%`,
      wind: `${Math.round(data.current.wind_speed_10m)} km/h`,
      pressure: `${Math.round(data.current.surface_pressure)} hPa`,
      condition: currentDetails.condition,
      type: currentDetails.type,
      uvIndex: data.daily.uv_index_max ? data.daily.uv_index_max[0] : 4,
      visibility: data.current.visibility ? `${(data.current.visibility / 1000).toFixed(1)} km` : "10 km",
      dewPoint: data.current.dew_point_2m ? Math.round(data.current.dew_point_2m) : Math.round(data.current.temperature_2m - 2),
      sunrise: data.daily.sunrise ? new Date(data.daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "6:00 AM",
      sunset: data.daily.sunset ? new Date(data.daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "6:30 PM",
      hourly: data.hourly.time.slice(0, 12).map((timeStr, idx) => {
        const hourDetails = getWeatherDetails(data.hourly.weather_code[idx]);
        return {
          time: idx === 0 ? "Now" : new Date(timeStr).toLocaleTimeString([], { hour: 'numeric', hour12: true }),
          rawTemp: data.hourly.temperature_2m[idx],
          icon: hourDetails.icon
        };
      }),
      daily: data.daily.time.slice(0, 5).map((d, idx) => {
        const dayDetails = getWeatherDetails(data.daily.weather_code[idx]);
        return {
          day: idx === 0 ? "Today" : new Date(d).toLocaleDateString("en-US", { weekday: "short" }),
          rawLow: data.daily.temperature_2m_min[idx],
          rawHigh: data.daily.temperature_2m_max[idx],
          icon: dayDetails.icon
        };
      })
    };
  };

  // Fetch weather by city search
  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError(null);
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("Location not found.");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,visibility,dew_point_2m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset&timezone=auto`
      );
      const data = await weatherRes.json();

      setWeatherData(buildWeatherData(name, country, data));
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather using live latitude and longitude
  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,visibility,dew_point_2m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset&timezone=auto`
      );
      const data = await weatherRes.json();

      // Reverse geocode to get real location name
      const locationRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      const locationData = await locationRes.json();
      const detectedCity = locationData.city || locationData.locality || locationData.principalSubdivision || "Current Location";

      setWeatherData(buildWeatherData(detectedCity, locationData.countryName || "", data));
    } catch (err) {
      console.error("Live Location Fetch Error:", err);
      fetchWeather("Kolkata");
    } finally {
      setLoading(false);
    }
  };

  // Get user's active geolocation
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (geoError) => {
          console.warn("Geolocation denied or failed:", geoError.message);
          fetchWeather("Kolkata");
        },
        { timeout: 10000 }
      );
    } else {
      fetchWeather("Kolkata");
    }
  };

  useEffect(() => {
    handleGetLocation();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCity(searchQuery);
      fetchWeather(searchQuery);
      setSearchQuery("");
    }
  };

  const dynamicBg = weatherData ? getThemeGradient(weatherData.type) : "from-[#2c5364] via-[#203a43] to-[#0f2027]";

  return (
    <div className={`w-full h-full bg-gradient-to-b ${dynamicBg} text-white flex flex-col font-sans select-none overflow-y-auto sm:overflow-y-auto sm:h-full sm:max-h-screen p-4 pt-14 sm:pt-4 pb-12 sm:pb-6 relative scrollbar-none min-h-screen sm:min-h-0 transition-all duration-700`}>
      
      {/* Background Soft Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Header Search bar & Controls */}
      <div className="relative z-10 flex items-center justify-between mb-4 shrink-0 gap-2">
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative flex items-center w-40 sm:w-60">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city..."
              className="w-full bg-white/15 border border-white/20 rounded-full py-1 px-3 pl-8 text-xs text-white placeholder-white/60 focus:outline-none focus:bg-white/25 transition-all"
            />
            <FaSearch className="absolute left-2.5 text-xs text-white/60 pointer-events-none" />
          </form>

          {/* Current Location Button */}
          <button
            onClick={handleGetLocation}
            title="Use Current Location"
            className="p-1.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-full text-xs transition-all flex items-center justify-center active:scale-95"
          >
            <FaCrosshairs className="text-white/80" />
          </button>
        </div>

        {/* macOS Style Segmented °C / °F Unit Switcher */}
        <div className="flex items-center bg-black/20 border border-white/20 p-0.5 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setUnit("C")}
            className={`px-2 py-0.5 rounded-md transition-all ${unit === "C" ? "bg-white/30 text-white shadow-sm" : "text-white/60 hover:text-white"}`}
          >
            °C
          </button>
          <button
            onClick={() => setUnit("F")}
            className={`px-2 py-0.5 rounded-md transition-all ${unit === "F" ? "bg-white/30 text-white shadow-sm" : "text-white/60 hover:text-white"}`}
          >
            °F
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm font-light animate-pulse">
          Fetching live weather data...
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-sm text-red-300">
          {error}
        </div>
      ) : weatherData ? (
        <>
          {/* Main Hero Card */}
          <div className="relative z-10 flex flex-col items-center justify-center my-2 text-center shrink-0">
            <span className="text-[11px] uppercase tracking-widest font-semibold opacity-80">
              MY LOCATION
            </span>
            <h1 className="text-3xl font-light tracking-tight mt-0.5">
              {weatherData.city}
            </h1>
            <div className="text-6xl font-extralight tracking-tighter my-1">
              {convertTemp(weatherData.rawTemp)}°
            </div>
            <p className="text-sm font-medium">{weatherData.condition}</p>
            <div className="flex items-center gap-2 text-xs font-medium opacity-90 mt-0.5">
              <span>H:{convertTemp(weatherData.rawHigh)}°</span>
              <span>L:{convertTemp(weatherData.rawLow)}°</span>
              <span className="ml-1 opacity-75">(Feels like {convertTemp(weatherData.rawFeelsLike)}°)</span>
            </div>
          </div>

          {/* Hourly Carousel */}
          <div className="relative z-10 mt-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-lg shrink-0">
            <p className="text-xs font-medium opacity-90 mb-3 px-1 border-b border-white/10 pb-2">
              Conditions are currently {weatherData.condition.toLowerCase()}. Humidity is at {weatherData.humidity}.
            </p>

            <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-none py-1 px-1">
              {weatherData.hourly.map((item, index) => (
                <div key={index} className="flex flex-col items-center min-w-[40px] gap-1.5 shrink-0">
                  <span className="text-[11px] font-medium opacity-80">{item.time}</span>
                  {item.icon}
                  <span className="text-xs font-semibold">{convertTemp(item.rawTemp)}°</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grid Layout Cards */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 shrink-0">
            
            {/* 5-Day Forecast */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-lg flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold opacity-75 mb-2">
                <FaCalendarAlt className="text-[10px]" /> 5-DAY FORECAST
              </div>
              <div className="flex flex-col gap-2.5">
                {weatherData.daily.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-medium">
                    <span className="w-12">{item.day}</span>
                    {item.icon}
                    <span className="opacity-60 text-[11px]">{convertTemp(item.rawLow)}°</span>
                    <div className="w-20 h-1.5 bg-white/20 rounded-full relative overflow-hidden mx-1">
                      <div className="absolute inset-y-0 left-2 right-2 bg-gradient-to-r from-blue-300 to-yellow-400 rounded-full" />
                    </div>
                    <span className="font-semibold">{convertTemp(item.rawHigh)}°</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Metrics & Extras */}
            <div className="flex flex-col gap-3">
              {/* Pressure & UV Index */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2.5 shadow-lg">
                  <div className="flex items-center gap-1 text-[11px] font-semibold opacity-75 mb-1">
                    <WiBarometer className="text-base" /> PRESSURE
                  </div>
                  <div className="text-xl font-bold">{weatherData.pressure}</div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2.5 shadow-lg">
                  <div className="flex items-center gap-1 text-[11px] font-semibold opacity-75 mb-1">
                    <WiDaySunnyOvercast className="text-base text-yellow-300" /> UV INDEX
                  </div>
                  <div className="text-xl font-bold">{weatherData.uvIndex}</div>
                  <p className="text-[9px] opacity-70">{weatherData.uvIndex > 5 ? "Moderate to High" : "Low"}</p>
                </div>
              </div>

              {/* Wind & Dew Point Widget */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-lg flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold opacity-75">
                    <WiWindDeg className="text-lg" /> WIND & HUMIDITY
                  </div>
                </div>
                <div className="flex items-baseline justify-between my-1">
                  <span className="text-lg font-bold">{weatherData.wind}</span>
                  <span className="text-xs opacity-80">Dew Point: {convertTemp(weatherData.dewPoint)}°</span>
                </div>
                <div className="w-full h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] opacity-75">
                  Relative Humidity: {weatherData.humidity}
                </div>
              </div>
            </div>

            {/* Sun Cycle & Visibility Map */}
            <div className="flex flex-col gap-3">
              {/* Sunrise & Sunset */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WiSunrise className="text-2xl text-yellow-300" />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider opacity-70 block">SUNRISE</span>
                    <span className="text-xs font-bold">{weatherData.sunrise}</span>
                  </div>
                </div>
                <div className="h-6 w-px bg-white/20" />
                <div className="flex items-center gap-2">
                  <WiSunset className="text-2xl text-orange-400" />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider opacity-70 block">SUNSET</span>
                    <span className="text-xs font-bold">{weatherData.sunset}</span>
                  </div>
                </div>
              </div>

              {/* Location & Visibility Radar Tile */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-lg flex-1 flex flex-col justify-between overflow-hidden relative min-h-[110px]">
                <div className="flex items-center justify-between text-xs font-semibold opacity-75 z-10">
                  <div className="flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-[10px]" /> LOCATION MAP
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <FaEye /> {weatherData.visibility}
                  </div>
                </div>
                
                <div className="absolute inset-0 top-7 rounded-b-2xl bg-zinc-900/40 p-2 flex flex-col justify-between opacity-90">
                  <div className="w-full h-full rounded-xl bg-[#1e293b] relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-[1px]" />
                    <div className="text-center z-10">
                      <div className="px-2.5 py-1 bg-blue-600/90 rounded-full text-[11px] font-bold shadow-md inline-block">
                        {convertTemp(weatherData.rawTemp)}° {weatherData.city}
                      </div>
                      <p className="text-[9px] opacity-70 mt-1">{weatherData.condition}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </>
      ) : null}
    </div>
  );
}