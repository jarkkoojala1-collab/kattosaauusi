const CACHE = new Map();
let timer = null;
let observer = null;

function getApiBase() {
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  return isLocal ? `http://${window.location.hostname}:3001` : "";
}

function detectArea() {
  const text = document.querySelector(".panel-overlay")?.textContent || "";
  return text.includes("Pirkanmaa") || text.includes("Tampere") ? "pirkanmaa" : "uusimaa";
}

function areaLabel(area) {
  return area === "pirkanmaa" ? "Pirkanmaan" : "Uudenmaan";
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function average(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function format(value, digits = 1) {
  return Number.isFinite(value) ? value.toFixed(digits) : "-";
}

function windArrow(degrees) {
  const value = Number(degrees);
  if (!Number.isFinite(value)) return "";
  const arrows = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];
  return arrows[Math.round((((value % 360) + 360) % 360) / 45) % 8];
}

function weatherIcon(summary) {
  if (!summary) return "⛅";
  if ((summary.precipitation || 0) > 1.5) return "🌧️";
  if ((summary.precipitation || 0) > 0.1) return "🌦️";
  if ((summary.temp || 0) <= 0) return "❄️";
  if ((summary.humidity || 0) >= 85) return "☁️";
  if ((summary.temp || 0) >= 18) return "☀️";
  return "⛅";
}

function nearestTime(times) {
  if (!Array.isArray(times) || times.length === 0) return null;
  const now = Date.now();
  return times.reduce((best, item) => {
    const bestDiff = Math.abs(new Date(best.time).getTime() - now);
    const itemDiff = Math.abs(new Date(item.time).getTime() - now);
    return itemDiff < bestDiff ? item : best;
  }, times[0]);
}

function summarize(data) {
  const time = nearestTime(data && data.times ? data.times : []);
  const points = (time && Array.isArray(time.points) ? time.points : []).filter((point) => point && point.weather);
  if (!points.length) return null;

  const okCount = points.filter((point) => point.ok).length;
  return {
    pointCount: points.length,
    okPercent: Math.round((okCount / points.length) * 100),
    temp: average(points.map((point) => toNumber(point.weather.temp))),
    humidity: average(points.map((point) => toNumber(point.weather.humidity))),
    precipitation: average(points.map((point) => toNumber(point.weather.precipitation))),
    wind: average(points.map((point) => toNumber(point.weather.wind ?? point.weather.windSpeed ?? point.weather.wind_speed))),
    gust: average(points.map((point) => toNumber(point.weather.gust ?? point.weather.windGust ?? point.weather.wind_gust))),
    windDirection: average(points.map((point) => toNumber(point.weather.windDirection ?? point.weather.wind_direction ?? point.weather.windDir)))
  };
}

async function loadSummary(area) {
  const cached = CACHE.get(area);
  if (cached && Date.now() - cached.loadedAt < 10 * 60 * 1000) return cached.summary;

  const response = await fetch(`${getApiBase()}/api/forecast-map?area=${area}`);
  if (!response.ok) throw new Error("Alueen säätä ei voitu hakea");
  const data = await response.json();
  const summary = summarize(data);
  CACHE.set(area, { loadedAt: Date.now(), summary });
  return summary;
}

function render(card, area, summary) {
  if (!summary) {
    card.innerHTML = `<div class="area-summary-title">${areaLabel(area)} sää nyt</div><div class="area-summary-loading">Keskiarvosäätä ei ole saatavilla.</div>`;
    return;
  }

  const arrow = windArrow(summary.windDirection);
  const gust = Number.isFinite(summary.gust) ? ` (${format(summary.gust)} m/s)` : "";

  card.innerHTML = `
    <div class="area-summary-title">${areaLabel(area)} keskiarvosää nyt</div>
    <div class="area-summary-main">
      <div class="area-summary-icon">${weatherIcon(summary)}</div>
      <div>
        <div class="area-summary-temp">${format(summary.temp)} °C</div>
        <div class="area-summary-subtitle">Keskiarvo ${summary.pointCount} pisteestä</div>
      </div>
    </div>
    <div class="area-summary-grid">
      <div><span>Pinnoitus</span><strong>${summary.okPercent}% OK</strong></div>
      <div><span>Sade</span><strong>${format(summary.precipitation)} mm/h</strong></div>
      <div><span>Kosteus</span><strong>${format(summary.humidity, 0)} %</strong></div>
      <div><span>Tuuli</span><strong>${arrow ? `${arrow} ` : ""}${format(summary.wind)} m/s${gust}</strong></div>
    </div>
  `;
}

function removeCard() {
  const card = document.querySelector(".area-summary-card");
  if (card) card.remove();
}

function shouldShow() {
  const panel = document.querySelector(".panel-overlay .sidebar");
  const searchCard = document.querySelector(".panel-overlay .search-card");
  const selectedForecast = document.querySelector(".panel-overlay .forecast-panel");
  return Boolean(panel && searchCard && !selectedForecast);
}

async function updateCard() {
  try {
    if (!shouldShow()) {
      removeCard();
      return;
    }

    const searchCard = document.querySelector(".panel-overlay .search-card");
    let card = document.querySelector(".area-summary-card");
    if (!card) {
      card = document.createElement("section");
      card.className = "area-summary-card";
      searchCard.insertAdjacentElement("afterend", card);
    }

    const area = detectArea();
    if (card.dataset.area === area && card.dataset.ready === "true") return;

    card.dataset.area = area;
    card.dataset.ready = "false";
    card.innerHTML = `<div class="area-summary-title">${areaLabel(area)} keskiarvosää nyt</div><div class="area-summary-loading">Lasketaan keskiarvosäätä...</div>`;

    const summary = await loadSummary(area);
    card.dataset.ready = "true";
    render(card, area, summary);
  } catch (error) {
    console.warn("Alueen keskiarvosää ei latautunut", error);
  }
}

function scheduleUpdate() {
  window.clearTimeout(timer);
  timer = window.setTimeout(updateCard, 250);
}

if (typeof window !== "undefined") {
  window.setTimeout(scheduleUpdate, 500);
  window.setTimeout(scheduleUpdate, 1500);

  window.addEventListener("click", scheduleUpdate, true);
  window.addEventListener("input", scheduleUpdate, true);

  window.setTimeout(() => {
    if (!observer && document.body) {
      observer = new MutationObserver(scheduleUpdate);
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }, 500);
}

export {};
