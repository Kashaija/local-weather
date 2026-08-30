import { useState, useEffect } from "react"

const RSS2JSON_API = "https://api.rss2json.com/v1/api.json"

const NEWS_FEEDS = [
  {
    name: "BBC Science & Environment",
    url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
  },
  {
    name: "The Guardian Climate",
    url: "https://www.theguardian.com/environment/climate-crisis/rss",
  },
  {
    name: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
  },
]

const WEATHER_KEYWORDS = [
  "weather", "storm", "flood", "hurricane", "tornado", "cyclone",
  "typhoon", "drought", "heatwave", "heat wave", "wildfire", "fire",
  "rain", "snow", "ice", "freeze", "frost", "thunderstorm", "lightning",
  "wind", "gale", "climate", "temperature", "record", "extreme",
  "disaster", "emergency", "warning", "alert", "devastat", "damage",
  "evacuate", "rescue", "victim", "death", "killed", "missing",
]

function isWeatherRelated(title, description) {
  const text = `${title} ${description}`.toLowerCase()
  return WEATHER_KEYWORDS.some((keyword) => text.includes(keyword))
}

function timeAgo(dateString) {
  const now = new Date()
  const publishDate = new Date(dateString)
  const diffMs = now - publishDate
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export function useWeatherNews() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAllFeeds = async () => {
      setLoading(true)
      const allArticles = []

      const fetchPromises = NEWS_FEEDS.map(async (feed) => {
        try {
          const res = await fetch(
            `${RSS2JSON_API}?rss_url=${encodeURIComponent(feed.url)}`
          )
          if (!res.ok) return []

          const data = await res.json()
          if (data.status !== "ok" || !data.items) return []

          return data.items
            .filter((item) => isWeatherRelated(item.title, item.description || ""))
            .map((item) => {
              // Extract image from various RSS formats
              let image = null
              if (item.enclosure?.thumbnail) {
                image = item.enclosure.thumbnail
              } else if (item.enclosure?.link) {
                image = item.enclosure.link.replace(/&amp;/g, "&")
              } else if (item.thumbnail) {
                image = item.thumbnail
              } else if (item.media_content?.[0]?.url) {
                image = item.media_content[0].url
              }
              
              return {
                id: item.guid || item.link,
                title: item.title,
                description: item.description?.replace(/<[^>]*>/g, "").slice(0, 200) || "",
                link: item.link,
                pubDate: item.pubDate,
                source: feed.name,
                timeAgo: timeAgo(item.pubDate),
                image,
              }
            })
        } catch {
          return []
        }
      })

      const results = await Promise.all(fetchPromises)
      results.forEach((items) => allArticles.push(...items))

      // Sort by date, newest first
      allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))

      // Deduplicate by title similarity
      const seen = new Set()
      const unique = allArticles.filter((article) => {
        const key = article.title.toLowerCase().slice(0, 50)
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      setArticles(unique.slice(0, 15))
      setLoading(false)
    }

    fetchAllFeeds()

    // Refresh every 5 minutes
    const interval = setInterval(fetchAllFeeds, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return { articles, loading }
}
