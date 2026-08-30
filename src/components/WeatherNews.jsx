import { useState, useEffect, useCallback } from "react"
import { useWeatherNews } from "../hooks/useWeatherNews"

export default function WeatherNews() {
  const { articles, loading } = useWeatherNews()
  const [expandedIndex, setExpandedIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const rotateArticle = useCallback(() => {
    if (articles.length === 0) return
    setExpandedIndex((prev) => (prev + 1) % articles.length)
  }, [articles.length])

  useEffect(() => {
    if (isPaused || articles.length === 0) return

    const interval = setInterval(rotateArticle, 10000)
    return () => clearInterval(interval)
  }, [isPaused, articles.length, rotateArticle])

  if (loading || articles.length === 0) {
    return null
  }

  const currentArticle = articles[expandedIndex]

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-5xl mx-auto">
        <div className="bg-black/50 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-white/10 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white/90 text-xs font-semibold uppercase tracking-wider">
                Weather News
              </span>
            </div>
            <div className="flex items-center gap-1">
              {articles.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setExpandedIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === expandedIndex
                      ? "bg-white w-4"
                      : "bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Article Content */}
          <a
            href={currentArticle.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-3 hover:bg-white/5 transition-colors duration-200"
          >
            <div className="flex items-start gap-4">
              {currentArticle.image && (
                <div className="flex-shrink-0">
                  <img
                    src={currentArticle.image}
                    alt=""
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = "none"
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-base md:text-lg leading-tight mb-2 line-clamp-2">
                  {currentArticle.title}
                </h3>
                <p className="text-white/60 text-sm md:text-base line-clamp-3 mb-3">
                  {currentArticle.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-white/40">
                  <span>{currentArticle.source}</span>
                  <span>•</span>
                  <span>{currentArticle.timeAgo}</span>
                </div>
              </div>
              <div className="flex-shrink-0 mt-1">
                <svg
                  className="w-5 h-5 text-white/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </div>
            </div>
          </a>

          {/* Progress Bar */}
          <div className="h-0.5 bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000 ease-linear"
              style={{
                width: isPaused ? "100%" : "0%",
                animation: isPaused ? "none" : "progress 10s linear",
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}
