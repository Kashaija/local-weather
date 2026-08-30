import { useState, useEffect } from "react"

const PEXELS_API = "https://api.pexels.com/videos/search"
const PEXELS_KEY = import.meta.env.VITE_PEXELS_API_KEY

export function usePexelsVideo(cityName, weatherCondition) {
  const [videos, setVideos] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!PEXELS_KEY || !cityName) return

    const fetchVideos = async () => {
      setLoading(true)
      setVideos([])
      setCurrentIndex(0)
      try {
        const queries = [
          cityName,
          `${cityName} cityscape`,
          `${cityName} skyline`,
          weatherCondition || "nature",
        ]

        for (const query of queries) {
          try {
            const res = await fetch(
              `${PEXELS_API}?query=${encodeURIComponent(query)}&per_page=5&size=medium`,
              {
                headers: {
                  Authorization: PEXELS_KEY,
                },
              }
            )

            if (res.ok) {
              const data = await res.json()
              if (data.videos?.length > 0) {
                const processedVideos = data.videos
                  .map((v) => {
                    const sortedFiles = [...(v.video_files || [])].sort((a, b) => {
                      const aScore = (a.width >= 1280 ? 1000 : 0) + a.width
                      const bScore = (b.width >= 1280 ? 1000 : 0) + b.width
                      return bScore - aScore
                    })
                    const videoFile = sortedFiles[0]
                    if (!videoFile) return null
                    return {
                      url: videoFile.link,
                      width: videoFile.width,
                      height: videoFile.height,
                      duration: v.duration,
                      thumbnail: v.image,
                    }
                  })
                  .filter(Boolean)

                if (processedVideos.length > 0) {
                  setVideos(processedVideos)
                  setLoading(false)
                  return
                }
              }
            }
          } catch {
            // Continue to next query
          }
        }
      } catch {
        setVideos([])
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [cityName, weatherCondition])

  useEffect(() => {
    if (videos.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length)
    }, 15000) // Switch every 15 seconds

    return () => clearInterval(interval)
  }, [videos.length])

  return { video: videos[currentIndex] || null, videos, loading }
}
