// OpenWeatherMap integration for the Atmos Weather Dashboard.
const apiKey = "YOUR_OPENWEATHERMAP_API_KEY";
const currentWeatherEndpoint = "https://api.openweathermap.org/data/2.5/weather";
const forecastEndpoint = "https://api.openweathermap.org/data/2.5/forecast";
const airPollutionEndpoint = "https://api.openweathermap.org/data/2.5/air_pollution";
const oneCallEndpoint = "https://api.openweathermap.org/data/3.0/onecall";
const openMeteoForecastEndpoint = "https://api.open-meteo.com/v1/forecast";

const navItems = document.querySelectorAll(".nav-item");
const searchInput = document.querySelector("#citySearch");
const searchButton = document.querySelector(".search-submit");
const locationButton = document.querySelector("#locationButton");
const mobileMenuButton = document.querySelector("#mobileMenuButton");
const particleLayer = document.querySelector(".particle-layer");
const forecastStrip = document.querySelector(".forecast-strip");
const recentSearches = document.querySelector("#recentSearches");
const statusMessage = document.querySelector("#statusMessage");
const weatherIconWrap = document.querySelector(".weather-icon");

let weatherCondition = "Clear";
let weatherIcon = "01d";
let currentCity = "Chennai";

const sunnyConditions = ["Clear"];
const cloudyConditions = ["Clouds"];
const rainyConditions = ["Rain", "Drizzle", "Mist", "Fog", "Haze", "Smoke"];
const snowConditions = ["Snow"];
const stormConditions = ["Thunderstorm", "Squall", "Tornado"];
const themeNames = ["sunny", "cloudy", "rainy", "snow", "storm", "night"];
const themeClasses = themeNames.flatMap((themeName) => [themeName, `theme-${themeName}`]);

const themeSettings = {
  sunny: { count: 34, size: [3, 8], alpha: [0.18, 0.46], blur: [1, 5], duration: [14, 28] },
  cloudy: { count: 24, size: [42, 120], alpha: [0.08, 0.18], blur: [14, 28], duration: [22, 42] },
  rainy: { count: 1400, size: [1, 2], alpha: [0.42, 0.78], blur: [0, 0.6], duration: [1.8, 3.2] },
  snow: { count: 260, size: [3, 9], alpha: [0.28, 0.78], blur: [0, 2], duration: [9, 19] },
  storm: { count: 42, size: [2, 8], alpha: [0.14, 0.4], blur: [1, 6], duration: [4, 10] },
  night: { count: 190, size: [1, 3], alpha: [0.28, 0.92], blur: [0, 1], duration: [3, 8] }
};

const themeLabels = {
  sunny: "Sunny Atmosphere",
  cloudy: "Cloudy Atmosphere",
  rainy: "Rainy Atmosphere",
  snow: "Snow Atmosphere",
  storm: "Storm Atmosphere",
  night: "Night Atmosphere"
};

const elements = {
  cityName: document.querySelector("#cityName"),
  description: document.querySelector("#weatherDescription"),
  temperature: document.querySelector("#temperature"),
  condition: document.querySelector("#weatherConditionText"),
  highLow: document.querySelector("#highLow"),
  feelsSummary: document.querySelector("#feelsLikeSummary"),
  updatedTime: document.querySelector("#updatedTime"),
  icon: document.querySelector("#weatherIcon"),
  sidebarLocation: document.querySelector("#sidebarLocation"),
  sidebarSummary: document.querySelector("#sidebarSummary"),
  humidity: document.querySelector("#humidityValue"),
  wind: document.querySelector("#windValue"),
  pressure: document.querySelector("#pressureValue"),
  visibility: document.querySelector("#visibilityValue"),
  uv: document.querySelector("#uvValue"),
  feelsLike: document.querySelector("#feelsLikeValue"),
  airQualityValue: document.querySelector("#airQualityValue"),
  airQualityLabel: document.querySelector("#airQualityLabel"),
  airQualitySummary: document.querySelector("#airQualitySummary"),
  airQualityBar: document.querySelector("#airQualityBar"),
  sunDuration: document.querySelector("#sunDuration"),
  sunriseTime: document.querySelector("#sunriseTime"),
  sunsetTime: document.querySelector("#sunsetTime"),
  comfortIndex: document.querySelector("#comfortIndex"),
  comfortSummary: document.querySelector("#comfortSummary"),
  comfortRain: document.querySelector("#comfortRain"),
  comfortDew: document.querySelector("#comfortDew"),
  comfortClouds: document.querySelector("#comfortClouds")
};

function getTheme(condition, icon) {
  if (icon.endsWith("n")) return "night";
  if (sunnyConditions.includes(condition)) return "sunny";
  if (cloudyConditions.includes(condition)) return "cloudy";
  if (rainyConditions.includes(condition)) return "rainy";
  if (snowConditions.includes(condition)) return "snow";
  if (stormConditions.includes(condition)) return "storm";
  return "sunny";
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function renderParticles(themeName) {
  const settings = themeSettings[themeName];
  const particles = [];

  for (let index = 0; index < settings.count; index += 1) {
    const particle = document.createElement("span");
    const size = randomBetween(settings.size[0], settings.size[1]).toFixed(1);
    const alpha = randomBetween(settings.alpha[0], settings.alpha[1]).toFixed(2);
    const blur = randomBetween(settings.blur[0], settings.blur[1]).toFixed(1);
    const duration = randomBetween(settings.duration[0], settings.duration[1]).toFixed(1);
    const delay = randomBetween(-settings.duration[1], 0).toFixed(1);

    particle.className = "particle";
    particle.style.setProperty("--x", `${randomBetween(-5, 100).toFixed(1)}%`);
    particle.style.setProperty("--y", `${randomBetween(-10, 110).toFixed(1)}%`);
    particle.style.setProperty("--size", `${size}px`);
    particle.style.setProperty("--alpha", alpha);
    particle.style.setProperty("--blur", `${blur}px`);
    particle.style.setProperty("--duration", `${duration}s`);
    particle.style.setProperty("--delay", `${delay}s`);
    particles.push(particle);
  }

  particleLayer.replaceChildren(...particles);
}

function updateAtmosphere(themeName) {
  document.body.classList.remove(...themeClasses);
  document.body.classList.add(themeName, `theme-${themeName}`);
  renderParticles(themeName);

  const sidebarToggle = document.querySelector(".theme-pill");
  sidebarToggle.lastChild.textContent = ` ${themeLabels[themeName]}`;
}

function applyTheme(themeName) {
  updateAtmosphere(themeName);
  return themeName;
}

function setLoading(isLoading) {
  document.body.classList.toggle("is-loading", isLoading);
  searchButton.disabled = isLoading;
  locationButton.disabled = isLoading;
  locationButton.innerHTML = isLoading ? "..." : '<span class="location-pin" aria-hidden="true"></span>';
}

function toggleSidebar(isOpen) {
  document.body.classList.toggle("sidebar-open", isOpen);
  mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
}

function showStatus(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.className = `status-message show ${type === "error" ? "error" : ""}`;
}

function clearStatus() {
  statusMessage.textContent = "";
  statusMessage.className = "status-message";
}

function getLocationErrorMessage(error) {
  if (error.code === error.PERMISSION_DENIED) {
    return "Location permission was denied. Allow location access or search by city.";
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return "Your current location is unavailable. Search by city instead.";
  }

  if (error.code === error.TIMEOUT) {
    return "Location request timed out. Try again or search by city.";
  }

  return "Location access failed. Search by city instead.";
}

function buildUrl(endpoint, params) {
  const url = new URL(endpoint);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("units", "metric");
  return url;
}

async function requestWeather(url) {
  if (apiKey === "ADD_OPENWEATHER_API_KEY") {
    throw new Error("Add your OpenWeatherMap API key in script.js to load live weather.");
  }

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load weather data.");
  }

  return data;
}

async function requestExternal(url) {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.reason || "Unable to load external weather data.");
  }

  return data;
}

async function getWeatherData(query) {
  const params = typeof query === "string"
    ? { q: query.trim() }
    : { lat: query.lat, lon: query.lon };

  return requestWeather(buildUrl(currentWeatherEndpoint, params));
}

async function getForecastData(query) {
  const params = typeof query === "string"
    ? { q: query.trim() }
    : { lat: query.lat, lon: query.lon };

  return requestWeather(buildUrl(forecastEndpoint, params));
}

async function getAirQualityData(coords) {
  return requestWeather(buildUrl(airPollutionEndpoint, {
    lat: coords.lat,
    lon: coords.lon
  }));
}

async function getUvData(coords) {
  try {
    return await requestWeather(buildUrl(oneCallEndpoint, {
      lat: coords.lat,
      lon: coords.lon,
      exclude: "minutely,hourly,daily,alerts"
    }));
  } catch (error) {
    return getOpenMeteoUvData(coords);
  }
}

async function getOpenMeteoUvData(coords) {
  try {
    const url = new URL(openMeteoForecastEndpoint);
    url.searchParams.set("latitude", coords.lat);
    url.searchParams.set("longitude", coords.lon);
    url.searchParams.set("hourly", "uv_index");
    url.searchParams.set("forecast_days", "1");
    url.searchParams.set("timezone", "auto");

    const data = await requestExternal(url);
    const uvValues = data.hourly && data.hourly.uv_index ? data.hourly.uv_index : [];
    const currentHour = new Date().getHours();
    const uvValue = uvValues[currentHour] ?? uvValues.find((value) => value !== null);

    return { current: { uvi: uvValue ?? null } };
  } catch (error) {
    return null;
  }
}

function formatTemp(value) {
  return `${Math.round(value)}&deg;`;
}

function formatDescription(value) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatTimeFromUnix(timestamp, timezoneOffset = 0) {
  return new Date((timestamp + timezoneOffset) * 1000).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC"
  });
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function getUvLabel(value) {
  if (value === null || value === undefined) return "N/A";
  if (value < 3) return `${Math.round(value)} Low`;
  if (value < 6) return `${Math.round(value)} Moderate`;
  if (value < 8) return `${Math.round(value)} High`;
  if (value < 11) return `${Math.round(value)} Very High`;
  return `${Math.round(value)} Extreme`;
}

function getAqiDetails(aqi) {
  const details = {
    1: { label: "Good", percent: 20, summary: "Air quality is good for most outdoor activity." },
    2: { label: "Fair", percent: 40, summary: "Air quality is fair with minor sensitivity concerns." },
    3: { label: "Moderate", percent: 60, summary: "Moderate air quality. Sensitive groups should pace outdoor time." },
    4: { label: "Poor", percent: 80, summary: "Poor air quality. Consider reducing extended outdoor activity." },
    5: { label: "Very Poor", percent: 100, summary: "Very poor air quality. Outdoor activity is not recommended." }
  };

  return details[aqi] || details[3];
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function calculateDewPoint(temp, humidity) {
  const a = 17.27;
  const b = 237.7;
  const gamma = (a * temp) / (b + temp) + Math.log(humidity / 100);
  return (b * gamma) / (a - gamma);
}

function getRainChance(forecastData) {
  if (!forecastData || !Array.isArray(forecastData.list)) return 0;

  const nextDayForecast = forecastData.list.slice(0, 8);
  const maxPop = nextDayForecast.reduce((highest, item) => {
    return Math.max(highest, item.pop || 0);
  }, 0);

  return Math.round(maxPop * 100);
}

function calculateComfortScore(weatherData, forecastData) {
  const feelsLike = weatherData.main.feels_like;
  const humidity = weatherData.main.humidity;
  const windKmh = weatherData.wind.speed * 3.6;
  const cloudCover = weatherData.clouds ? weatherData.clouds.all : 0;
  const rainChance = getRainChance(forecastData);

  let score = 100;

  if (feelsLike < 18) score -= (18 - feelsLike) * 3.2;
  if (feelsLike > 30) score -= (feelsLike - 30) * 3.4;
  if (humidity < 35) score -= (35 - humidity) * 0.45;
  if (humidity > 65) score -= (humidity - 65) * 0.55;
  if (windKmh > 24) score -= (windKmh - 24) * 0.85;
  if (rainChance > 20) score -= (rainChance - 20) * 0.45;
  if (cloudCover > 80) score -= (cloudCover - 80) * 0.18;

  return clampScore(score);
}

function getComfortSummary(score, weatherData, rainChance) {
  const feelsLike = weatherData.main.feels_like;
  const humidity = weatherData.main.humidity;

  if (score >= 85) return "Excellent comfort. Outdoor plans should feel easy and pleasant.";
  if (score >= 70) return "Comfortable overall with only light weather tradeoffs.";
  if (score >= 55) return "Moderate comfort. Expect some humidity, heat, wind, or clouds.";
  if (rainChance >= 60) return "Low comfort due to higher rain chances. Keep plans flexible.";
  if (feelsLike > 34) return "Low comfort due to heat. Shade and hydration are recommended.";
  if (humidity > 78) return "Low comfort due to heavy humidity and sticky air.";
  return "Low comfort. Weather may feel demanding for longer outdoor activity.";
}

function renderComfortIndex(weatherData, forecastData) {
  const rainChance = getRainChance(forecastData);
  const dewPoint = calculateDewPoint(weatherData.main.temp, weatherData.main.humidity);
  const cloudCover = weatherData.clouds ? weatherData.clouds.all : 0;
  const comfortScore = calculateComfortScore(weatherData, forecastData);

  elements.comfortIndex.textContent = `${comfortScore}%`;
  elements.comfortSummary.textContent = getComfortSummary(comfortScore, weatherData, rainChance);
  elements.comfortRain.textContent = `Rain ${rainChance}%`;
  elements.comfortDew.innerHTML = `Dew ${Math.round(dewPoint)}&deg;`;
  elements.comfortClouds.textContent = `Clouds ${cloudCover}%`;
}

function renderSunPath(weatherData) {
  const sunrise = weatherData.sys.sunrise;
  const sunset = weatherData.sys.sunset;
  const timezoneOffset = weatherData.timezone || 0;
  const daylightSeconds = Math.max(0, sunset - sunrise);

  elements.sunDuration.textContent = formatDuration(daylightSeconds);
  elements.sunriseTime.textContent = `Sunrise ${formatTimeFromUnix(sunrise, timezoneOffset)}`;
  elements.sunsetTime.textContent = `Sunset ${formatTimeFromUnix(sunset, timezoneOffset)}`;
}

function renderAirQuality(airQualityData) {
  const firstReading = airQualityData && airQualityData.list && airQualityData.list[0];

  if (!firstReading) {
    elements.airQualityValue.textContent = "N/A";
    elements.airQualityLabel.textContent = "Unavailable";
    elements.airQualitySummary.textContent = "Air quality data is unavailable for this location.";
    elements.airQualityBar.style.width = "0%";
    return;
  }

  const aqi = firstReading.main.aqi;
  const details = getAqiDetails(aqi);

  elements.airQualityValue.textContent = aqi;
  elements.airQualityLabel.textContent = details.label;
  elements.airQualitySummary.textContent = details.summary;
  elements.airQualityBar.style.width = `${details.percent}%`;
}

function renderUvIndex(uvData) {
  const uvValue = uvData && uvData.current ? uvData.current.uvi : null;
  elements.uv.textContent = getUvLabel(uvValue);
}

function animateUpdatedCards() {
  document.querySelectorAll(".weather-card, .highlight-card, .forecast-card, .detail-card").forEach((card) => {
    card.classList.remove("data-fade");
    void card.offsetWidth;
    card.classList.add("data-fade");
  });
}

function renderWeather(data) {
  const weather = data.weather[0];
  const country = data.sys.country;
  const visibilityKm = data.visibility ? (data.visibility / 1000).toFixed(1) : "N/A";
  const windKmh = Math.round(data.wind.speed * 3.6);
  const updated = new Date(data.dt * 1000).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });

  weatherCondition = weather.main;
  weatherIcon = weather.icon;
  currentCity = data.name;

  elements.cityName.textContent = `${data.name}, ${country}`;
  elements.description.textContent = formatDescription(weather.description);
  elements.sidebarLocation.textContent = `${data.name}, ${country}`;
  elements.sidebarSummary.textContent = formatDescription(weather.description);
  elements.temperature.innerHTML = formatTemp(data.main.temp);
  elements.condition.textContent = weather.main;
  elements.highLow.innerHTML = `H:${formatTemp(data.main.temp_max)} L:${formatTemp(data.main.temp_min)}`;
  elements.feelsSummary.innerHTML = `Feels like ${formatTemp(data.main.feels_like)}`;
  elements.updatedTime.textContent = `Updated ${updated}`;
  elements.icon.src = `https://openweathermap.org/img/wn/${weather.icon}@4x.png`;
  elements.icon.alt = weather.description;
  weatherIconWrap.classList.add("has-api-icon");

  elements.humidity.textContent = `${data.main.humidity}%`;
  elements.wind.textContent = `${windKmh} km/h`;
  elements.pressure.textContent = `${data.main.pressure} hPa`;
  elements.visibility.textContent = `${visibilityKm} km`;
  elements.feelsLike.innerHTML = formatTemp(data.main.feels_like);

  const theme = getTheme(weather.main, weather.icon);
  applyTheme(theme);
  animateUpdatedCards();
}

function groupForecastByDay(list) {
  const days = new Map();

  list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const key = date.toISOString().slice(0, 10);
    const hour = date.getHours();

    if (!days.has(key)) {
      days.set(key, {
        date,
        min: item.main.temp_min,
        max: item.main.temp_max,
        condition: item.weather[0].main,
        icon: item.weather[0].icon,
        preferredHourDistance: Math.abs(hour - 12)
      });
      return;
    }

    const day = days.get(key);
    day.min = Math.min(day.min, item.main.temp_min);
    day.max = Math.max(day.max, item.main.temp_max);

    const hourDistance = Math.abs(hour - 12);
    if (hourDistance < day.preferredHourDistance) {
      day.condition = item.weather[0].main;
      day.icon = item.weather[0].icon;
      day.preferredHourDistance = hourDistance;
    }
  });

  return Array.from(days.values()).slice(0, 5);
}

function renderForecast(data) {
  const forecastDays = groupForecastByDay(data.list);
  const cards = forecastDays.map((day) => {
    const card = document.createElement("article");
    const dayName = day.date.toLocaleDateString([], { weekday: "short" });

    card.className = "forecast-card";
    card.innerHTML = `
      <span>${dayName}</span>
      <b><img class="forecast-icon" src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt=""></b>
      <small>${day.condition}</small>
      <strong>${Math.round(day.max)}&deg;</strong>
      <em>${Math.round(day.min)}&deg;</em>
    `;
    return card;
  });

  forecastStrip.replaceChildren(...cards);
}

function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem("atmosRecentSearches")) || [];
  } catch (error) {
    return [];
  }
}

function saveRecentSearch(city) {
  const normalizedCity = city.trim();
  if (!normalizedCity) return;

  const searches = getRecentSearches().filter((item) => item.toLowerCase() !== normalizedCity.toLowerCase());
  searches.unshift(normalizedCity);

  try {
    localStorage.setItem("atmosRecentSearches", JSON.stringify(searches.slice(0, 5)));
  } catch (error) {
    return;
  }

  renderRecentSearches();
}

function renderRecentSearches() {
  const searches = getRecentSearches();
  const fallback = ["Bengaluru", "Mumbai", "Singapore"];
  const cities = searches.length ? searches : fallback;

  const buttons = cities.map((city) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = city;
    button.addEventListener("click", () => loadWeatherByCity(city));
    return button;
  });

  recentSearches.replaceChildren(...buttons);
}

async function loadWeather(query, shouldSave = false) {
  setLoading(true);
  clearStatus();

  try {
    const [weatherData, forecastData] = await Promise.all([
      getWeatherData(query),
      getForecastData(query)
    ]);
    const coords = {
      lat: weatherData.coord.lat,
      lon: weatherData.coord.lon
    };
    const [airQualityResult, uvData] = await Promise.all([
      getAirQualityData(coords).then((data) => data).catch(() => null),
      getUvData(coords)
    ]);

    renderWeather(weatherData);
    renderForecast(forecastData);
    renderComfortIndex(weatherData, forecastData);
    renderSunPath(weatherData);
    renderAirQuality(airQualityResult);
    renderUvIndex(uvData);

    if (shouldSave) {
      saveRecentSearch(weatherData.name);
    }

    if (typeof query !== "string") {
      showStatus(`Loaded weather for your current location: ${weatherData.name}.`);
    }
  } catch (error) {
    showStatus(error.message, "error");
  } finally {
    setLoading(false);
  }
}

function loadWeatherByCity(city) {
  const trimmedCity = city.trim();

  if (!trimmedCity) {
    showStatus("Please enter a city name.", "error");
    return;
  }

  searchInput.value = trimmedCity;
  loadWeather(trimmedCity, true);
}

function loadWeatherByLocation() {
  if (!navigator.geolocation) {
    showStatus("Geolocation is not supported in this browser. Search by city instead.", "error");
    return;
  }

  setLoading(true);
  showStatus("Detecting your current location...");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const query = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      };
      loadWeather(query, true);
    },
    (error) => {
      setLoading(false);
      showStatus(getLocationErrorMessage(error), "error");
    },
    { enableHighAccuracy: true, timeout: 9000, maximumAge: 600000 }
  );
}

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((navItem) => navItem.classList.remove("active"));
    item.classList.add("active");
    toggleSidebar(false);
  });
});

searchButton.addEventListener("click", () => loadWeatherByCity(searchInput.value));

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    loadWeatherByCity(searchInput.value);
    searchInput.blur();
  }
});

locationButton.addEventListener("click", loadWeatherByLocation);

mobileMenuButton.addEventListener("click", () => {
  toggleSidebar(!document.body.classList.contains("sidebar-open"));
});

document.addEventListener("click", (event) => {
  if (!document.body.classList.contains("sidebar-open")) return;
  if (event.target.closest(".sidebar") || event.target.closest("#mobileMenuButton")) return;
  toggleSidebar(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    toggleSidebar(false);
  }
});

renderRecentSearches();
applyTheme(getTheme(weatherCondition, weatherIcon));
loadWeatherByLocation();
