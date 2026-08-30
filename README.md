# LocalWeather

A beautiful, real-time weather application with animated backgrounds that change based on weather conditions. Search any city worldwide and get instant weather updates with a stunning visual experience.

![LocalWeather Screenshot](screenshot.png)

## Features

- **🌍 Global City Search** - Search any city worldwide using Open-Meteo Geocoding API (200,000+ cities)
- **🌡️ Real-Time Weather** - Current temperature, humidity, wind speed, pressure, and more
- **📅 7-Day Forecast** - Daily high/low temperatures with weather conditions
- **📊 Yesterday's Temperature** - Compare today with yesterday's actual temperatures
- **🎨 Dynamic Backgrounds** - Animated weather particles that match current conditions:
  - 🎬 **Video Backgrounds** - Real city footage from Pexels (optional, requires free API key)
  - ☀️ Clear skies with blue gradients
  - 🌙 Night mode with twinkling stars
  - 🌧️ Rain with falling droplets
  - ❄️ Snow with drifting flakes
  - ⛈️ Thunderstorms with lightning
  - ☁️ Cloudy/overcast conditions
  - 🌫️ Fog and mist effects
- **🌓 Auto Dark Mode** - Automatically switches based on sunrise/sunset at selected location
- **🔄 Temperature Units** - Toggle between Fahrenheit (°F) and Celsius (°C)
- **⏰ Live Local Time** - Shows current time with timezone for selected city
- **Glassmorphism UI** - Modern frosted-glass design with smooth animations

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4
- **Weather API:** [OpenWeatherMap](https://openweathermap.org/) (requires free API key)
- **Geocoding:** [Open-Meteo Geocoding](https://open-meteo.com/) (free, no API key)
- **Historical Data:** [Open-Meteo Forecast](https://open-meteo.com/) (free, no API key)
- **Video Backgrounds:** [Pexels](https://www.pexels.com/api/) (optional, free API key)
- **Linting:** OxLint

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenWeatherMap API key (free tier works)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/localweather.git
cd localweather
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file and add your API keys:
```env
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here

# Optional: For video backgrounds (free)
VITE_PEXELS_API_KEY=your_pexels_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Getting an API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to "My API Keys" in your account
4. Copy your API key and add it to your `.env` file

**Note:** New API keys may take 1-2 hours to activate.

### Getting a Pexels API Key (Optional - for video backgrounds)

1. Go to [Pexels API](https://www.pexels.com/api/)
2. Sign up for a free account
3. Click "Your API Key" to get your key
4. Add it to your `.env` file

**Note:** Without a Pexels key, the app will use animated canvas particles instead of video backgrounds.

## Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Project Structure

```
localweather/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── CitySelector.jsx    # Autocomplete city search
│   │   ├── CurrentWeather.jsx  # Current weather display
│   │   ├── Forecast.jsx        # 7-day forecast cards
│   │   └── WeatherBackground.jsx # Animated canvas background
│   ├── hooks/
│   │   └── useWeather.js       # Weather API hook
│   ├── utils/
│   │   └── cities.js           # Fallback cities list
│   ├── App.jsx                 # Main application
│   ├── main.jsx                # Entry point
│   └── index.css               # Tailwind imports
├── .env.example                # Environment variables template
├── package.json
├── vite.config.js
└── README.md
```

## API Usage

This application uses the following APIs:

| API | Purpose | Rate Limit | Cost |
|-----|---------|------------|------|
| OpenWeatherMap | Current weather + forecast | 60 calls/min (free) | Free tier available |
| Open-Meteo Geocoding | City search | 10,000/day | Free |
| Open-Meteo Forecast | Yesterday's temperature | 10,000/day | Free |

## Features in Detail

### Weather Backgrounds
The app uses HTML5 Canvas to render animated weather particles:
- Rain: Angled falling lines
- Snow: Drifting circles with slight horizontal movement
- Stars: Twinkling points at night
- Thunder: Random lightning flashes
- Fog: Horizontal elliptical layers

### Auto Dark Mode
The app calculates sunrise/sunset times from the OpenWeather API response and automatically switches to a dark theme when it's nighttime at the selected location.

### Glassmorphism Design
All UI elements use frosted-glass effects with `backdrop-blur` and semi-transparent backgrounds, creating a modern, layered visual experience.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [Open-Meteo](https://open-meteo.com/) for geocoding and historical data
- [Vite](https://vitejs.dev/) for the build tool
- [React](https://react.dev/) for the UI framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

## Support

If you found this project helpful, please give it a ⭐ on GitHub!
