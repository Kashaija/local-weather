import { useState, useRef, useEffect } from "react"

const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search"

export default function CitySelector({ onSelect }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    setLoading(true)
    clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${GEOCODING_API}?name=${encodeURIComponent(query)}&count=15&language=en&format=json`
        )
        if (res.ok) {
          const data = await res.json()
          setResults(data.results || [])
          setIsOpen(true)
          setHighlightIndex(-1)
        }
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timerRef.current)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const formatResult = (result) => {
    const parts = [result.name]
    if (result.admin1) parts.push(result.admin1)
    if (result.country_code && result.country_code !== "US") {
      parts.push(result.country)
    }
    return parts.join(", ")
  }

  const selectCity = (result) => {
    const city = {
      name: result.name,
      state: result.admin1 || "",
      country: result.country || "",
      countryCode: result.country_code || "",
      lat: result.latitude,
      lon: result.longitude,
      timezone: result.timezone,
    }
    setQuery(formatResult(result))
    setResults([])
    setIsOpen(false)
    setHighlightIndex(-1)
    onSelect(city)
  }

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true)
      }
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault()
      selectCity(results[highlightIndex])
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          if (e.target.value.length >= 2) setIsOpen(true)
        }}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search for any city worldwide..."
        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-lg"
      />

      {loading && query.length >= 2 && isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-gray-400">
          Searching...
        </div>
      )}

      {!loading && isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-auto">
          {results.map((result, i) => (
            <li
              key={`${result.id || result.latitude}-${result.longitude}`}
              onMouseDown={(e) => {
                e.preventDefault()
                selectCity(result)
              }}
              className={`px-4 py-3 cursor-pointer text-left border-b border-gray-100 last:border-b-0 ${
                i === highlightIndex
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="font-medium">{result.name}</span>
              {result.admin1 && (
                <span className="ml-2 text-sm text-gray-500">{result.admin1}</span>
              )}
              {result.country_code && result.country_code !== "US" && (
                <span className="ml-2 text-xs text-gray-400">{result.country}</span>
              )}
              {result.elevation && (
                <span className="ml-2 text-xs text-gray-300">
                  {Math.round(result.elevation)}m
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {!loading && isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-gray-400">
          No cities found
        </div>
      )}
    </div>
  )
}
