const CACHE = new Map();
let debounceTimer = null;
let observer = null;

function getApiBase() {
  const isDev = Boolean(import.meta.env && import.meta.env.DEV);
  return isDev ? `http://${window.location.hostname}:3001` : "";
}

function detectArea() {
  const activeAreaButton = document.querySelector(".panel-overlay .area-selector button.active");
  const activeText = activeAreaButton?.textContent?.toLowerCase() || "";

  if (activeText.includes("pirkanmaa")) return "pirkanmaa";
  if (activeText.includes("uusimaa")) return "uusimaa";

  const panelText = document.querySelector(".panel-overlay .sidebar-subtitle")?.textContent || "";
  if (panelText.includes("Tampere")) return "pirkanmaa";
  return "uusimaa";
}

function areaLabel(area) {
  return area === "pirkanmaa" ? "Pirkanmaan" : "Uudenmaan";
}

function numberValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function avg(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function formatNumber(value, digits = 1) {
  if (!Number.isFinite(value)) return "-";
  return value.toFixed(digits);
}

function windDirection(degrees) {
  const value = Number(degrees);
  if (!Number.isFinite(value)) return "";
  const directions = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];
  const normalized = ((value % 360) + 360) % 360;
  return directions[Math.round(normalized / 45) % 8];
}

function getWeatherIcon(summary) {
  if (!summary) return "⛅";
  if ((summary.precipitation ?? 0) > 1.5) return "🌧️";
  if ((summary.precipitation ?? 0) > 0.1) return "🌦️";
  if ((summary.temp ?? 0) <= 0) return "❄️";
  if ((summary.humidity ?? 0) >= 85) return "☁️";
  if ((summary.temp ?? 0) >= 18) return "☀️";
  return "⛅";
}

function pickBestTime(times) {
  if (!Array.isArray(times) || !times.length) return null;
  const now = Date.now();
  let best = times[0];
  let bestDiff = Number.POSITIVE_INFINITY;

  for (const item of times) {
    const diff = Math.abs(new Date(item.time).getTime() - now);
    if (diff < bestDiff) {
      best = item;
      bestDiff = diff;
    }
  }

  return best;
}

function calculateSummary(data) {
  const bestTime = pickBestTime(data?.times || []);
  const points = (bestTime?.points || []).filter((point) => point?.weather);

  if (!points.length) return null;

  const temperatures = points.map((point) => numberValue(point.weather?.temp));
  const humidities = points.map((point) => numberValue(point.weather?.humidity));
  const precipitations = points.map((point) => numberValue(point.weather?.precipitation));
  const winds = points.map((point) => numberValue(point.weather?.wind ?? point.weather?.windSpeed ?? point.weather?.wind_speed));
  const gusts = points.map((point) => numberValue(point.weather?.gust ?? point.weather?.windGust ?? point.weather?.wind_gust));
  const directions = points.map((point) => numberValue(point.weather?.windDirection ?? point.weather?.wind_direction ?? point.weather?.windDir));
  const okCount = points.filter((point) => point.ok).length;

  return {
    time: bestTime?.time,
    pointCount: points.length,
    okPercent: Math.round((okCount / Math.max(points.length, 1)) * 100),
    temp: avg(temperatures),
    humidity: avg(humidities),
    precipitation: avg(precipitations),
    wind: avg(winds),
    gust: avg(gusts),
    windDirection: avg(directions)
  };
}

async function fetchSummary(area) {
  const cached = CACHE.get(area);
  if (cached && Date.now() - cached.loadedAt < 10 * 60 * 1000) return cached.summary;

  const response = await fetch(`${getApiBase()}/api/forecast-map?area=${area}`);
  if (!response.ok) throw new Error("Alue-ennustetta ei voitu hakea");
  const data = await response.json();
  const summary = calculateSummary(data);
  CACHE.set(area, { loadedAt: Date.now(), summary });
  return summary;
}

function renderLoading(card, area) {
  card.innerHTML = `
    <div class="area-summary-title">${areaLabel(area)} sää nyt</div>
    <div class="area-summary-loading">Lasketaan alueen keskiarvoa...</div>
  `;
}

function renderSummary(card, area, summary) {
  if (!summary) {
    card.innerHTML = `
      <div class="area-summary-title">${areaLabel(area)} sää nyt</div>
      <div class="area-summary-loading">Alueen keskiarvoennustetta ei ole saatavilla.</div>
    `;
    return;
  }

  const dir = windDirection(summary.windDirection);
  const gustText = Number.isFinite(summary.gust) ? ` (${formatNumber(summary.gust)} m/s)` : "";

  card.innerHTML = `
    <div class="area-summary-title">${areaLabel(area)} sää nyt</div>
    <div class="area-summary-main">
      <div class="area-summary-icon">${getWeatherIcon(summary)}</div>
      <div>
        <div class="area-summary-temp">${formatNumber(summary.temp)} °C</div>
        <div class="area-summary-subtitle">Keskiarvo ${summary.pointCount} pisteestä</div>
      </div>
    </div>
    <div class="area-summary-grid">
      <div><span>Pinnoitus</span><strong>${summary.okPercent}% OK</strong></div>
      <div><span>Sade</span><strong>${formatNumber(summary.precipitation)} mm/h</strong></div>
      <div><span>Kosteus</span><strong>${formatNumber(summary.humidity, 0)} %</strong></div>
      <div><span>Tuuli</span><strong>${dir ? `${dir} ` : ""}${formatNumber(summary.wind)} m/s${gustText}</strong></div>
    </div>
  `;
}

async function updateAreaSummary() {
  try {
    const panel = document.querySelector(".panel-overlay .sidebar");
    const searchCard = document.querySelector(".panel-overlay .search-card");
    const selectedForecast = document.querySelector(".panel-overlay .forecast-panel");

    if (!panel || !searchCard || selectedForecast) {
      document.querySelector(".area-summary-card")?.remove();
      return;
    }

    let card = document.querySelector(".area-summary-card");
    if (!card) {
      card = document.createElement("section");
      card.className = "area-summary-card";
      searchCard.insertAdjacentElement("afterend", card);
    }

    const area = detectArea();
    if (card.dataset.area !== area || !card.dataset.loaded) {
      card.dataset.area = area;
      card.dataset.loaded = "";
      renderLoading(card, area);
      const summary = await fetchSummary(area);
      card.dataset.loaded = "true";
      renderSummary(card, area, summary);
    }
  } catch {
    // Lisäkortti ei saa koskaan estää sovelluksen käyttöä.
  }
}

function scheduleUpdate() {
  window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(updateAreaSummary, 160);
}

if (typeof window !== "undefined") {
  [300, 1000, 2200].forEach((delay) => window.setTimeout(scheduleUpdate, delay));

  window.setTimeout(() => {
    if (document.body && !observer) {
      observer = new MutationObserver(scheduleUpdate);
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }, 300);
}

export {};
