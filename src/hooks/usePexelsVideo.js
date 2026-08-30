import { useState, useEffect } from "react"

const PEXELS_API = "https://api.pexels.com/videos/search"
const PEXELS_KEY = import.meta.env.VITE_PEXELS_API_KEY

export function usePexelsVideo(cityName, weatherCondition) {
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!PEXELS_KEY || !cityName) return

    const fetchVideo = async () => {
      setLoading(true)
      try {
        // Search for city video first, fall back to weather-related video
        const queries = [
          cityName,
          `${cityName} cityscape`,
          `${cityName} skyline`,
          weatherCondition || "nature",
        ]

        for (const query of queries) {
          try {
            const res = await fetch(
              `${PEXELS_API}?query=${encodeURIComponent(query)}&per_page=3&size=medium`,
              {
                headers: {
                  Authorization: PEXELS_KEY,
                },
              }
            )

            if (res.ok) {
              const data = await res.json()
              if (data.videos?.length > 0) {
                // Pick a random video from results
                const randomIndex = Math.floor(Math.random() * Math.min(data.videos.length, 3))
                const selectedVideo = data.videos[randomIndex]
                
                // Get a good quality video file (prefer landscape HD)
                const sortedFiles = [...(selectedVideo.video_files || [])].sort((a, b) => {
                  // Prefer landscape videos with decent resolution
                  const aScore = (a.width >= 1280 ? 1000 : 0) + a.width
                  const bScore = (b.width >= 1280 ? 1000 : 0) + b.width
                  return bScore - aScore
                })
                const videoFile = sortedFiles[0]

                if (videoFile) {
                  setVideo({
                    url: videoFile.link,
                    width: videoFile.width,
                    height: videoFile.height,
                    duration: selectedVideo.duration,
                    thumbnail: selectedVideo.image,
                  })
                  setLoading(false)
                  return
                }
              }
            }
          } catch {
            // Continue to next query
          }
        }
        
        // No video found, will fallback to canvas animation
        setVideo(null)
      } catch {
        setVideo(null)
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [cityName, weatherCondition])

  return { video, loading }
}
