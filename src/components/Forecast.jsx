import { useMemo } from "react"

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function groupByDay(list) {
  const days = {}
  for (const item of list) {
    const date = new Date(item.dt * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    })
    if (!days[date]) {
      days[date] = { date, items: [], dt: item.dt }
    }
    days[date].items.push(item)
  }
  return Object.values(days).slice(0, 7)
}

function getDailySummary(day) {
  const temps = day.items.map((i) => i.main.temp)
  const icons = day.items.map((i) => i.weather[0])
  const descriptions = day.items.map((i) => i.weather[0].description)

  return {
    date: day.dt * 1000,
    high: Math.round(Math.max(...temps)),
    low: Math.round(Math.min(...temps)),
    icon: icons[Math.floor(icons.length / 2)],
    description: descriptions[Math.floor(descriptions.length / 2)],
    humidity: Math.round(
      day.items.reduce((sum, i) => sum + i.main.humidity, 0) / day.items.length
    ),
    wind: Math.round(
      day.items.reduce((sum, i) => sum + i.wind.speed, 0) / day.items.length
    ),
  }
}

export default function Forecast({ data, yesterday, units }) {
  const dailyForecasts = useMemo(() => {
    if (!data?.list) return []
    return groupByDay(data.list).map(getDailySummary)
  }, [data])

  if (dailyForecasts.length === 0) return null

  const tempUnit = units === "imperial" ? "°" : "°"
  const windUnit = units === "imperial" ? "mph" : "m/s"

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4 text-center text-white drop-shadow-lg">
        Daily Forecast
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {yesterday && (
          <div className="bg-amber-600/40 backdrop-blur-md rounded-xl shadow-xl p-4 text-center flex flex-col items-center border border-amber-400/30">
            <p className="font-semibold text-sm text-amber-200">Yesterday</p>
            <div className="w-12 h-12 flex items-center justify-center">
              <span className="text-3xl">🌡️</span>
            </div>
            <p className="text-xs mb-2 text-amber-300">Actual</p>
            <p className="text-lg font-bold text-white">
              {yesterday.high}{tempUnit}
            </p>
            <p className="text-sm text-white/80">{yesterday.low}{tempUnit}</p>
          </div>
        )}
        {dailyForecasts.map((day, i) => {
          const dayName = i === 0 ? "Today" : DAY_NAMES[new Date(day.date).getDay()]
          const iconUrl = `https://openweathermap.org/img/wn/${day.icon.icon}@2x.png`

          return (
            <div
              key={day.date}
              className="bg-white/20 backdrop-blur-md rounded-xl shadow-xl p-4 text-center flex flex-col items-center border border-white/10"
            >
              <p className="font-semibold text-sm text-white drop-shadow">{dayName}</p>
              <img src={iconUrl} alt={day.description} className="w-12 h-12 drop-shadow-lg" />
              <p className="text-xs capitalize mb-2 line-clamp-1 text-white/80">
                {day.description}
              </p>
              <p className="text-lg font-bold text-white drop-shadow">
                {day.high}{tempUnit}
              </p>
              <p className="text-sm text-white/80">{day.low}{tempUnit}</p>
              <div className="mt-2 text-xs text-white/70 space-y-0.5">
                <p>💧 {day.humidity}%</p>
                <p>💨 {day.wind} {windUnit}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
