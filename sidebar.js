window.addEventListener("DOMContentLoaded", () => {
  const dateTimeEl = document.getElementById("date-time");
  const weatherEl = document.getElementById("weather");
  const inputEl = document.getElementById("bookmark-search");
  const resultsEl = document.getElementById("results-list");

  const bookmarks = [
    { title: "OpenAI", url: "https://openai.com" },
    { title: "Opera Add-ons", url: "https://addons.opera.com" },
    { title: "Weather", url: "https://open-meteo.com" }
  ];

  const renderTime = () => {
    const now = new Date();
    dateTimeEl.textContent = now.toLocaleString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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
    try {
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&current=temperature_2m,weather_code"
      );
      const data = await response.json();
      const current = data?.current;

      if (!current) {
        weatherEl.textContent = "Weather unavailable";
        return;
      }

      weatherEl.textContent = `${Math.round(current.temperature_2m)}°C • code ${current.weather_code}`;
    } catch (error) {
      weatherEl.textContent = "Weather unavailable";
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

  renderTime();
  fetchWeather();
  renderResults("");

  setInterval(renderTime, 60000);

  console.log("✅ script validated");
});
