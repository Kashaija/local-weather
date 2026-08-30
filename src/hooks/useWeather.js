import { useState, useCallback } from "react"

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = "https://api.openweathermap.org/data/2.5"

export function useWeather() {
  const [currentWeather, setCurrentWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [yesterday, setYesterday] = useState(null)
  const [selectedCity, setSelectedCity] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchWeather = useCallback(async (city, units = "imperial") => {
    if (!API_KEY) {
      setError("Missing API key. Add VITE_OPENWEATHER_API_KEY to your .env file.")
      return
    }

    setLoading(true)
    setError(null)
    setSelectedCity(city)

    try {
      const currentRes = await fetch(
        `${BASE_URL}/weather?lat=${city.lat}&lon=${city.lon}&units=${units}&appid=${API_KEY}`
      )

      if (!currentRes.ok) {
        throw new Error(`Weather data unavailable (${currentRes.status})`)
      }

      const currentData = await currentRes.json()
      currentData.name = city.name
      if (city.state) {
        currentData.sys.country = city.state
      }
      setCurrentWeather(currentData)

      const forecastRes = await fetch(
        `${BASE_URL}/forecast?lat=${city.lat}&lon=${city.lon}&units=${units}&appid=${API_KEY}`
      )

      if (!forecastRes.ok) {
        throw new Error(`Forecast data unavailable (${forecastRes.status})`)
      }

      const forecastData = await forecastRes.json()
      setForecast(forecastData)

      // Fetch yesterday's temperature using Open-Meteo
      const yesterdayDate = new Date()
      yesterdayDate.setDate(yesterdayDate.getDate() - 1)
      const dateStr = yesterdayDate.toISOString().split("T")[0]

      try {
        const tempUnit = units === "imperial" ? "fahrenheit" : "celsius"
        const meteoRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=${tempUnit}&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`
        )

        if (meteoRes.ok) {
          const meteoData = await meteoRes.json()
          if (meteoData.daily?.temperature_2m_max?.[0] !== undefined) {
            setYesterday({
              high: Math.round(meteoData.daily.temperature_2m_max[0]),
              low: Math.round(meteoData.daily.temperature_2m_min[0]),
              date: dateStr,
            })
          }
        }
      } catch {
        setYesterday(null)
      }
    } catch (err) {
      setError(err.message || "Failed to fetch weather data")
    } finally {
      setLoading(false)
    }
  }, [])

  return { currentWeather, forecast, yesterday, selectedCity, loading, error, fetchWeather }
}
