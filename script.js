let currentUnit = "F";
let lastSearchedLocation = null;
const weatherApp = document.querySelector(".weather-app");
const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const status = document.getElementById("status");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const city = cityInput.value.trim();

  if (city === "") {
    status.textContent = "Please enter a city name.";
    return;
  }

  getCoordinates(city);
});


async function getCoordinates(city) {

    showLoading();
    console.log("Searching coordinates for:", city);

    try {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error("Could not search for that city.");
        }

        if (!data.results || data.results.length === 0) {
            throw new Error("City not found.");
        }

        const location = data.results[0];

        lastSearchedLocation = {
            name: location.name,
            latitude: location.latitude,
            longitude: location.longitude
        };

        console.log("Coordinates found:", location.latitude, location.longitude);

        getWeather(location.latitude, location.longitude, location.name);
    } catch (error) {
        showError(error.message);
    }

}

async function getWeather(lat, lon, cityName) {
    try {
        const unit = currentUnit === "F" ? "fahrenheit" : "celsius";
        const response = await fetch(
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=${unit}`
);

        const data = await response.json();

        if (!response.ok || !data.current) {
            throw new Error("Could not fetch weather data.");
        }

        const weatherData = {
          name: cityName,
          temp: data.current.temperature_2m,
          description: getWeatherDescription(data.current.weather_code),
          icon: getWeatherIcon(data.current.weather_code),
          theme: getWeatherTheme(data.current.weather_code)  
        };

        updateUI(weatherData);
    } catch (error) {
        showError(error.message);
    }
}


function getWeatherDescription(code) {
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
  };

  return weatherCodes[code] || "Unknown weather";
}

function getWeatherIcon(code) {
  if (code === 0) return "☀️";
  if (code === 1 || code === 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 57) return "🌦️";
  if (code >= 61 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌧️";
  if (code >= 85 && code <= 86) return "❄️";
  if (code >= 95 && code <= 99) return "⛈️";

  return "❔";
}


function getWeatherTheme(code) {
    if (code === 0 || code === 1) return "weather-clear";
    if (code === 2 || code === 3) return "weather-cloudy";
    if (code === 45 || code === 48) return "weather-fog";
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "weather-rain";
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "weather-snow";
    if (code >= 95 && code <= 99) return "weather-storm";

    return "weather-cloudy";
}

function showLoading() {
    status.textContent = "Loading...";
}

function updateUI(data) {
    status.textContent = "";

    document.getElementById("city-name").textContent = data.name;
    document.getElementById("temperature").textContent = `${data.temp}°${currentUnit}`;
    document.getElementById("description").textContent = data.description;
    document.getElementById("weather-icon").textContent = data.icon;

    weatherApp.classList.remove(
  "weather-clear",
  "weather-cloudy",
  "weather-rain",
  "weather-snow",
  "weather-storm",
  "weather-fog"
);

weatherApp.classList.add(data.theme);
}

function showError(message) {
    status.textContent = message;
}

const toggleBtn = document.getElementById("toggle-unit");

toggleBtn.addEventListener("click", () => {
    currentUnit = currentUnit === "F" ? "C" : "F";

    if (lastSearchedLocation) {
        getWeather(
           lastSearchedLocation.latitude,
           lastSearchedLocation.longitude,
           lastSearchedLocation.name 
        );
    }
});