window.addEventListener("DOMContentLoaded", () => {
  const weekdayDateEl = document.getElementById("weekday-date");
  const clockTimeEl = document.getElementById("clock-time");
  const weatherSummaryEl = document.getElementById("weather-summary");
  const inputEl = document.getElementById("bookmark-search");
  const resultsEl = document.getElementById("results-list");

  const bookmarks = [
    { title: "OpenAI", url: "https://openai.com" },
    { title: "Opera Add-ons", url: "https://addons.opera.com" },
    { title: "Weather", url: "https://open-meteo.com" }
  ];

  const dateFormatter = new Intl.DateTimeFormat([], {
    weekday: "long",
    month: "short",
    day: "numeric"
  });

  const timeFormatter = new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const weatherCodeMap = {
    0: "Clear",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    56: "Freezing drizzle",
    57: "Heavy freezing drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light showers",
    81: "Showers",
    82: "Heavy showers",
    85: "Light snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm + hail",
    99: "Severe storm + hail"
  };

  const setStatusClass = (el, status) => {
    el.classList.remove("status-loading", "status-ready", "status-error");
    el.classList.add(status);
  };

  const renderDateAndTime = () => {
    const now = new Date();
    weekdayDateEl.textContent = dateFormatter.format(now);
    clockTimeEl.textContent = timeFormatter.format(now);
    setStatusClass(weekdayDateEl, "status-ready");
    setStatusClass(clockTimeEl, "status-ready");
  };

  const renderResults = (query) => {
    const normalized = query.trim().toLowerCase();
    const filtered = bookmarks.filter(({ title, url }) => {
      return title.toLowerCase().includes(normalized) || url.toLowerCase().includes(normalized);
    });

    resultsEl.innerHTML = "";

    if (!normalized) {
      resultsEl.innerHTML = '<li class="empty">Start typing to find your bookmarks.</li>';
      return;
    }

    if (!filtered.length) {
      resultsEl.innerHTML = '<li class="empty">No matching bookmarks found.</li>';
      return;
    }

    filtered.forEach(({ title, url }) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noreferrer noopener";
      link.textContent = title;
      li.appendChild(link);
      resultsEl.appendChild(li);
    });
  };

  const fetchWeather = async () => {
    setStatusClass(weatherSummaryEl, "status-loading");
    weatherSummaryEl.textContent = "Refreshing weather…";

    try {
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=37.2089&longitude=-93.2923&current=temperature_2m,weather_code&temperature_unit=fahrenheit",
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error(`Weather request failed (${response.status})`);
      }

      const data = await response.json();
      const current = data?.current;

      if (!current || typeof current.temperature_2m !== "number" || typeof current.weather_code !== "number") {
        throw new Error("Weather payload incomplete");
      }

      const condition = weatherCodeMap[current.weather_code] || "Unknown conditions";
      weatherSummaryEl.textContent = `Springfield, MO: ${Math.round(current.temperature_2m)}°F • ${condition}`;
      setStatusClass(weatherSummaryEl, "status-ready");
    } catch (error) {
      weatherSummaryEl.textContent = "Springfield, MO weather unavailable";
      setStatusClass(weatherSummaryEl, "status-error");
      console.error("Weather fetch failed:", error);
    }
  };

  inputEl.addEventListener("input", (event) => {
    renderResults(event.target.value);
  });

  inputEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const firstLink = resultsEl.querySelector("a");
      if (firstLink) {
        window.open(firstLink.href, "_blank", "noopener,noreferrer");
      }
    }
  });

  renderDateAndTime();
  renderResults("");
  fetchWeather();

  setInterval(renderDateAndTime, 1000);
  setInterval(fetchWeather, 10 * 60 * 1000);

  console.log("✅ script validated");
});
