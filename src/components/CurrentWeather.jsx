import { useState, useEffect } from "react"

const US_TIMEZONES = {
  "-18000": "HST", "-14400": "AST", "-12600": "AST",
  "-10800": "EST", "-9000": "CST", "-7200": "MST",
  "-5400": "PST",
}

const TIMEZONE_OFFSETS = {
  "-39600": "UTC-11", "-36000": "UTC-10", "-32400": "UTC-9",
  "-28800": "UTC-8", "-25200": "UTC-7", "-21600": "UTC-6",
  "-18000": "UTC-5", "-14400": "UTC-4", "-10800": "UTC-3",
  "-7200": "UTC-2", "-3600": "UTC-1", "0": "UTC",
  "3600": "UTC+1", "7200": "UTC+2", "10800": "UTC+3",
  "14400": "UTC+4", "18000": "UTC+5", "21600": "UTC+6",
  "25200": "UTC+7", "28800": "UTC+8", "32400": "UTC+9",
  "36000": "UTC+10", "39600": "UTC+11", "43200": "UTC+12",
}

function getLocalTime(offsetSeconds) {
  const now = new Date()
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000
  const localMs = utcMs + offsetSeconds * 1000
  const localDate = new Date(localMs)
  return localDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
}

function getTimezoneLabel(offsetSeconds, countryCode) {
  const key = String(offsetSeconds)
  if (countryCode === "US") {
    return US_TIMEZONES[key] || TIMEZONE_OFFSETS[key] || `UTC${offsetSeconds >= 0 ? "+" : ""}${Math.floor(offsetSeconds / 3600)}`
  }
  return TIMEZONE_OFFSETS[key] || `UTC${offsetSeconds >= 0 ? "+" : ""}${Math.floor(offsetSeconds / 3600)}`
}

export default function CurrentWeather({ data, city, units }) {
  const [time, setTime] = useState("")

  useEffect(() => {
    if (!data?.timezone) return
    const update = () => setTime(getLocalTime(data.timezone))
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [data?.timezone])

  if (!data) return null

  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`
  const description = data.weather[0].description
  const tzLabel = data.timezone !== undefined
    ? getTimezoneLabel(data.timezone, city?.countryCode)
    : ""
  const tempUnit = units === "imperial" ? "°F" : "°C"
  const windUnit = units === "imperial" ? "mph" : "m/s"

  let displayLocation = data.name
  if (city) {
    if (city.state && city.countryCode === "US") {
      displayLocation = `${city.name}, ${city.state}`
    } else if (city.state && city.country) {
      displayLocation = `${city.name}, ${city.state}, ${city.country}`
    } else if (city.country) {
      displayLocation = `${city.name}, ${city.country}`
    }
  }

  return (
    <div className="backdrop-blur-md rounded-2xl shadow-2xl p-8 bg-black/30 border border-white/20">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white drop-shadow-lg">
          {displayLocation}
        </h2>

        {time && (
          <div className="mt-2">
            <p className="text-4xl font-bold text-white drop-shadow-lg">
              {time}
            </p>
            {tzLabel && (
              <p className="text-sm mt-1 text-white/80">({tzLabel})</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <img src={iconUrl} alt={description} className="w-20 h-20 drop-shadow-lg" />
        <div className="text-left">
          <p className="text-5xl font-bold text-white drop-shadow-lg">
            {Math.round(data.main.temp)}{tempUnit}
          </p>
          <p className="text-white/90 capitalize drop-shadow">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <p className="text-xs uppercase tracking-wide text-white/70">Feels Like</p>
          <p className="text-lg font-semibold text-white">
            {Math.round(data.main.feels_like)}{tempUnit}
          </p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <p className="text-xs uppercase tracking-wide text-white/70">Humidity</p>
          <p className="text-lg font-semibold text-white">{data.main.humidity}%</p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <p className="text-xs uppercase tracking-wide text-white/70">Wind</p>
          <p className="text-lg font-semibold text-white">
            {Math.round(data.wind.speed)} {windUnit}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <p className="text-xs uppercase tracking-wide text-white/70">High / Low</p>
          <p className="text-lg font-semibold text-white">
            {Math.round(data.main.temp_max)}° / {Math.round(data.main.temp_min)}°
          </p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <p className="text-xs uppercase tracking-wide text-white/70">Pressure</p>
          <p className="text-lg font-semibold text-white">{data.main.pressure} hPa</p>
        </div>
      </div>
    </div>
  )
}
