import { useState, useEffect } from "react"
import CitySelector from "./components/CitySelector"
import CurrentWeather from "./components/CurrentWeather"
import Forecast from "./components/Forecast"
import WeatherBackground from "./components/WeatherBackground"
import WeatherNews from "./components/WeatherNews"
import { useWeather } from "./hooks/useWeather"

function isNightTime(weatherData) {
  if (!weatherData?.sys) return false
  const now = Math.floor(Date.now() / 1000)
  const sunrise = weatherData.sys.sunrise
  const sunset = weatherData.sys.sunset
  return now < sunrise || now > sunset
}

export default function App() {
  const { currentWeather, forecast, yesterday, selectedCity, loading, error, fetchWeather } = useWeather()
  const [units, setUnits] = useState("imperial")
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (currentWeather) {
      setIsDark(isNightTime(currentWeather))
    }
  }, [currentWeather])

  const handleSelectCity = (city) => {
    fetchWeather(city, units)
  }

  const toggleUnits = () => {
    const newUnits = units === "imperial" ? "metric" : "imperial"
    setUnits(newUnits)
    if (selectedCity) {
      fetchWeather(selectedCity, newUnits)
    }
  }

  return (
    <>
      <WeatherBackground weather={currentWeather?.weather?.[0]} isNight={isDark} cityName={selectedCity?.name} />
      
      <div className="relative min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <header className="text-center mb-10">
            <h1 className={`text-4xl md:text-5xl font-bold mb-2 transition-colors duration-500 ${
              isDark ? "text-white" : "text-white drop-shadow-lg"
            }`}>
              LocalWeather
            </h1>
            <p className={`text-lg transition-colors duration-500 ${
              isDark ? "text-slate-300" : "text-white/90 drop-shadow"
            }`}>
              Real-time weather & 7-day forecast worldwide
            </p>
          </header>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <CitySelector onSelect={handleSelectCity} />
            
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium transition-colors duration-500 ${
                units === "imperial" ? "text-blue-400" : "text-white/70"
              }`}>°F</span>
              <button
                onClick={toggleUnits}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  units === "metric" ? "bg-blue-500" : "bg-white/30"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    units === "metric" ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
              <span className={`text-sm font-medium transition-colors duration-500 ${
                units === "metric" ? "text-blue-400" : "text-white/70"
              }`}>°C</span>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="bg-red-500/80 backdrop-blur-sm border border-red-400 text-white rounded-xl p-4 text-center max-w-md mx-auto">
              {error}
            </div>
          )}

          {!loading && !error && currentWeather && (
            <div className="space-y-6">
              <CurrentWeather data={currentWeather} city={selectedCity} units={units} isDark={isDark} />
              <Forecast data={forecast} yesterday={yesterday} units={units} isDark={isDark} />
            </div>
          )}

          {!loading && !error && !currentWeather && (
            <div className="text-center py-16 text-white/70">
              <p className="text-6xl mb-4">{isDark ? "🌙" : "🌤️"}</p>
              <p className="text-xl">Select a city to view the weather</p>
            </div>
          )}

          <div style={{ marginTop: currentWeather ? '0' : '300px' }}>
            <WeatherNews isVisible={true} />
          </div>
        </div>
      </div>
    </>
  )
}
