import { useRef, useEffect, useState } from "react"
import { usePexelsVideo } from "../hooks/usePexelsVideo"

const PARTICLE_COUNT = 50

function createParticles(width, height, weather, isNight) {
  const particles = []
  const type = getWeatherType(weather, isNight)

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * (type === "snow" ? 1 : 0.5),
      speedY: type === "rain" ? Math.random() * 8 + 4 : Math.random() * 1 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      type,
    })
  }
  return particles
}

function getWeatherType(weather, isNight) {
  if (!weather) return isNight ? "stars" : "clear"
  const code = weather.id

  if (code >= 200 && code < 300) return "thunder"
  if (code >= 300 && code < 400) return "drizzle"
  if (code >= 500 && code < 600) return "rain"
  if (code >= 600 && code < 700) return "snow"
  if (code >= 700 && code < 800) return "fog"
  if (code === 800) return isNight ? "stars" : "clear"
  return "clouds"
}

function getGradient(weather, isNight) {
  if (isNight) {
    return "linear-gradient(to bottom, #0f172a 0%, #1e293b 50%, #334155 100%)"
  }

  const type = getWeatherType(weather, false)

  switch (type) {
    case "rain":
    case "drizzle":
      return "linear-gradient(to bottom, #374151 0%, #4b5563 50%, #6b7280 100%)"
    case "thunder":
      return "linear-gradient(to bottom, #1f2937 0%, #374151 50%, #4b5563 100%)"
    case "snow":
      return "linear-gradient(to bottom, #9ca3af 0%, #d1d5db 50%, #e5e7eb 100%)"
    case "fog":
      return "linear-gradient(to bottom, #9ca3af 0%, #d1d5db 100%)"
    case "clouds":
      return "linear-gradient(to bottom, #6b7280 0%, #9ca3af 50%, #d1d5db 100%)"
    default:
      return "linear-gradient(to bottom, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)"
  }
}

function drawParticle(ctx, p) {
  ctx.globalAlpha = p.opacity

  if (p.type === "rain") {
    ctx.strokeStyle = "#93c5fd"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(p.x + p.speedX, p.y + p.speedY * 2)
    ctx.stroke()
  } else if (p.type === "snow") {
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  } else if (p.type === "stars") {
    ctx.fillStyle = "#fbbf24"
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2)
    ctx.fill()
  } else if (p.type === "thunder") {
    ctx.strokeStyle = "#fbbf24"
    ctx.lineWidth = 2
    if (Math.random() > 0.98) {
      ctx.globalAlpha = 0.8
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x + 10, p.y + 20)
      ctx.lineTo(p.x - 5, p.y + 25)
      ctx.stroke()
    }
  } else if (p.type === "drizzle") {
    ctx.strokeStyle = "#93c5fd"
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(p.x, p.y + p.speedY)
    ctx.stroke()
  } else if (p.type === "fog") {
    ctx.fillStyle = "#d1d5db"
    ctx.beginPath()
    ctx.ellipse(p.x, p.y, p.size * 8, p.size * 2, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalAlpha = 1
}

function updateParticle(p, width, height) {
  p.x += p.speedX
  p.y += p.speedY

  if (p.y > height + 10) {
    p.y = -10
    p.x = Math.random() * width
  }
  if (p.x < -10) p.x = width + 10
  if (p.x > width + 10) p.x = -10
}

export default function WeatherBackground({ weather, isNight, cityName }) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const [showVideo, setShowVideo] = useState(false)
  
  const weatherCondition = weather?.main?.toLowerCase() || "clear"
  const { video } = usePexelsVideo(cityName, weatherCondition)

  useEffect(() => {
    if (video) {
      setShowVideo(true)
    }
  }, [video])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    let animationId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      particlesRef.current = createParticles(
        canvas.width,
        canvas.height,
        weather,
        isNight
      )
    }

    resize()
    window.addEventListener("resize", resize)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((p) => {
        drawParticle(ctx, p)
        updateParticle(p, canvas.width, canvas.height)
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationId)
    }
  }, [weather, isNight])

  const gradient = getGradient(weather, isNight)

  return (
    <div className="fixed inset-0 -z-10 transition-all duration-1000 overflow-hidden">
      {/* Gradient background - always present */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{ background: gradient }}
      />

      {/* Pexels video - shown when available */}
      {showVideo && video && (
        <video
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={() => setShowVideo(true)}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: 0.4 }}
          poster={video.thumbnail}
        >
          <source src={video.url} type="video/mp4" />
        </video>
      )}

      {/* Canvas particles - always present for additional effect */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ opacity: showVideo && video ? 0.3 : 0.6 }}
      />

      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  )
}
