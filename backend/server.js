import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.join(__dirname, "..", "frontend", "dist");

const NURMIJARVI = { name: "Nurmijärvi", lat: 60.4647, lon: 24.8073 };
const MAX_DISTANCE_KM = 150;

const allPlaces = [

  { name: "Nurmijärvi", lat: 60.4647, lon: 24.8073 },
  { name: "Klaukkala", lat: 60.3824, lon: 24.7494 },
  { name: "Rajamäki", lat: 60.5291, lon: 24.7257 },
  { name: "Röykkä", lat: 60.4869, lon: 24.6076 },
  { name: "Helsinki", lat: 60.1699, lon: 24.9384 },
  { name: "Espoo", lat: 60.2055, lon: 24.6559 },
  { name: "Vantaa", lat: 60.2934, lon: 25.0378 },
  { name: "Kauniainen", lat: 60.2121, lon: 24.7276 },
  { name: "Kirkkonummi", lat: 60.1231, lon: 24.4381 },
  { name: "Vihti", lat: 60.4167, lon: 24.3167 },
  { name: "Nummela", lat: 60.3330, lon: 24.3258 },
  { name: "Karkkila", lat: 60.5342, lon: 24.2103 },
  { name: "Lohja", lat: 60.2486, lon: 24.0653 },
  { name: "Kerava", lat: 60.4034, lon: 25.1050 },
  { name: "Järvenpää", lat: 60.4737, lon: 25.0899 },
  { name: "Tuusula", lat: 60.4020, lon: 25.0290 },
  { name: "Jokela", lat: 60.5553, lon: 25.0955 },
  { name: "Sipoo", lat: 60.3775, lon: 25.2691 },
  { name: "Pornainen", lat: 60.4758, lon: 25.3748 },
  { name: "Mäntsälä", lat: 60.6333, lon: 25.3167 },
  { name: "Askola", lat: 60.5333, lon: 25.6000 },
  { name: "Porvoo", lat: 60.3923, lon: 25.6651 },
  { name: "Loviisa", lat: 60.4566, lon: 26.2251 },
  { name: "Hyvinkää", lat: 60.6333, lon: 24.8667 },
  { name: "Riihimäki", lat: 60.7377, lon: 24.7773 },
  { name: "Hausjärvi", lat: 60.7833, lon: 24.9333 },
  { name: "Loppi", lat: 60.7167, lon: 24.4500 },
  { name: "Janakkala", lat: 60.9000, lon: 24.6000 },
  { name: "Hämeenlinna", lat: 61.0027, lon: 24.4590 },
  { name: "Forssa", lat: 60.8146, lon: 23.6215 },
  { name: "Lahti", lat: 60.9827, lon: 25.6612 },
  { name: "Hollola", lat: 61.0500, lon: 25.4333 },
  { name: "Orimattila", lat: 60.8049, lon: 25.7296 },
  { name: "Heinola", lat: 61.2056, lon: 26.0381 },
  { name: "Kouvola", lat: 60.8681, lon: 26.7042 },
  { name: "Tampere", lat: 61.4978, lon: 23.7610 },
  { name: "Valkeakoski", lat: 61.2642, lon: 24.0312 },
  { name: "Akaa", lat: 61.1667, lon: 23.8667 },
  { name: "Lempäälä", lat: 61.3167, lon: 23.7500 }

];

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

const places = allPlaces
  .filter((place) => haversineKm(NURMIJARVI.lat, NURMIJARVI.lon, place.lat, place.lon) <= MAX_DISTANCE_KM)
  .map((place) => ({
    ...place,
    distanceKm: Math.round(haversineKm(NURMIJARVI.lat, NURMIJARVI.lon, place.lat, place.lon))
  }))
  .sort((a, b) => a.distanceKm - b.distanceKm);

let cachedForecast = null;
let cacheTime = 0;
const CACHE_DURATION_MS = 60 * 60 * 1000;
const pointForecastCache = new Map();
const POINT_CACHE_DURATION_MS = 60 * 60 * 1000;
const BATCH_SIZE = 12;
const BATCH_DELAY_MS = 80;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function roundToNextHour(date) {
  const d = new Date(date);
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

function makeTimeSteps() {
  const start = roundToNextHour(new Date());
  const steps = [];
  for (let i = 0; i < 24; i += 1) {
    steps.push(addHours(start, i * 3));
  }
  return steps;
}

function isGood(weather) {
  return (
    weather &&
    weather.temp > 5 &&
    weather.wind < 10 &&
    weather.humidity < 70 &&
    weather.precipitation <= 0.1
  );
}

function scoreWeather(weather) {
  if (!weather) return 0;
  let score = 100;
  if (weather.temp <= 5) score -= 45;
  else if (weather.temp < 8) score -= 15;
  if (weather.humidity >= 70) score -= 45;
  else if (weather.humidity > 65) score -= 15;
  if (weather.wind >= 10) score -= 30;
  else if (weather.wind > 7) score -= 10;
  if (weather.precipitation > 0.1) score -= 60;
  return Math.max(0, Math.min(100, score));
}

function pickNearestForecast(forecasts, targetTime) {
  const target = new Date(targetTime).getTime();
  let best = forecasts[0];
  let bestDiff = Infinity;
  for (const forecast of forecasts) {
    const diff = Math.abs(new Date(forecast.time).getTime() - target);
    if (diff < bestDiff) {
      best = forecast;
      bestDiff = diff;
    }
  }
  return best;
}

async function fetchWithTimeout(url, timeoutMs = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function formatFmiTime(date) {
  return date.toISOString().slice(0, 19) + "Z";
}

function parseFmiTimeValuePair(xml) {
  const memberBlocks = xml.match(/<wfs:member[\s\S]*?<\/wfs:member>/g) || [];
  const byTime = new Map();

  for (const block of memberBlocks) {
    const lower = block.toLowerCase();
    let key = null;

    if (lower.includes("temperature")) key = "temp";
    else if (lower.includes("humidity")) key = "humidity";
    else if (lower.includes("windspeedms")) key = "wind";
    else if (lower.includes("precipitation1h") || lower.includes("precipitationamount")) key = "precipitation";

    if (!key) continue;

    const tvps = block.match(/<wml2:MeasurementTVP[\s\S]*?<\/wml2:MeasurementTVP>/g) || [];
    for (const tvp of tvps) {
      const timeMatch = tvp.match(/<wml2:time>(.*?)<\/wml2:time>/);
      const valueMatch = tvp.match(/<wml2:value>(.*?)<\/wml2:value>/);
      if (!timeMatch || !valueMatch) continue;

      const time = timeMatch[1];
      const value = Number.parseFloat(valueMatch[1]);
      if (!Number.isFinite(value)) continue;

      if (!byTime.has(time)) {
        byTime.set(time, {
          time,
          temp: null,
          humidity: null,
          wind: null,
          precipitation: 0
        });
      }

      byTime.get(time)[key] = value;
    }
  }

  return [...byTime.values()]
    .filter((item) => item.temp !== null && item.humidity !== null && item.wind !== null)
    .sort((a, b) => new Date(a.time) - new Date(b.time));
}

async function fetchFmiPointForecast(lat, lon) {
  const start = roundToNextHour(new Date());
  const end = addHours(start, 72);

  const base =
    "https://opendata.fmi.fi/wfs" +
    "?service=WFS" +
    "&version=2.0.0" +
    "&request=getFeature" +
    "&storedquery_id=fmi::forecast::harmonie::surface::point::timevaluepair" +
    `&latlon=${lat},${lon}` +
    `&starttime=${encodeURIComponent(formatFmiTime(start))}` +
    `&endtime=${encodeURIComponent(formatFmiTime(end))}` +
    "&timestep=60";

  const urls = [
    base + "&parameters=Temperature,Humidity,WindSpeedMS,Precipitation1h",
    base + "&param=Temperature,Humidity,WindSpeedMS,Precipitation1h"
  ];

  for (const url of urls) {
    try {
      const response = await fetchWithTimeout(url, 4500);
      if (!response.ok) continue;
      const xml = await response.text();
      if (xml.includes("ExceptionReport")) continue;
      const forecasts = parseFmiTimeValuePair(xml);
      if (forecasts.length > 0) return forecasts;
    } catch {
      // fallback seuraavaan
    }
  }

  throw new Error("FMI ei palauttanut ennustearvoja nopeasti");
}

async function fetchOpenMeteoPointForecast(lat, lon) {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    "&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation" +
    "&forecast_days=3" +
    "&timezone=auto";

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Open-Meteo status ${response.status}`);

  const json = await response.json();
  const hourly = json.hourly;
  if (!hourly?.time?.length) throw new Error("Open-Meteo returned no values");

  return hourly.time.map((time, index) => ({
    time,
    temp: hourly.temperature_2m[index],
    humidity: hourly.relative_humidity_2m[index],
    wind: hourly.wind_speed_10m[index] / 3.6,
    precipitation: hourly.precipitation[index] ?? 0
  }));
}

async function fetchPointForecast(lat, lon) {
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  const cached = pointForecastCache.get(cacheKey);

  if (cached && Date.now() - cached.time < POINT_CACHE_DURATION_MS) {
    return cached.value;
  }

  let result;
  try {
    const forecasts = await fetchFmiPointForecast(lat, lon);
    result = { source: "FMI / Ilmatieteen laitos", forecasts };
  } catch (error) {
    console.warn("FMI varalähteeseen:", error.message);
    const forecasts = await fetchOpenMeteoPointForecast(lat, lon);
    result = { source: "Open-Meteo varalähde", forecasts };
  }

  pointForecastCache.set(cacheKey, { time: Date.now(), value: result });
  return result;
}

async function fetchForecastPlaces() {
  const timeSteps = makeTimeSteps();
  const timeBuckets = timeSteps.map((time) => ({
    time: time.toISOString(),
    label: time.toLocaleString("fi-FI", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Helsinki"
    }),
    okCount: 0,
    totalCount: 0,
    errorCount: 0,
    sources: {},
    points: []
  }));

  let totalErrors = 0;

  for (let i = 0; i < places.length; i += BATCH_SIZE) {
    const batch = places.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (place) => {
        try {
          const result = await fetchPointForecast(place.lat, place.lon);
          return { ...place, ...result };
        } catch {
          totalErrors += 1;
          return null;
        }
      })
    );

    for (const item of batchResults.filter(Boolean)) {
      timeBuckets.forEach((bucket) => {
        const weather = pickNearestForecast(item.forecasts, bucket.time);
        if (!weather) {
          bucket.errorCount += 1;
          return;
        }

        const ok = isGood(weather);
        bucket.points.push({
          name: item.name,
          lat: item.lat,
          lon: item.lon,
          weather,
          ok,
          score: scoreWeather(weather),
          source: item.source,
          distanceKm: item.distanceKm
        });

        bucket.sources[item.source] = (bucket.sources[item.source] || 0) + 1;
        bucket.totalCount += 1;
        if (ok) bucket.okCount += 1;
      });
    }

    if (i + BATCH_SIZE < places.length) await sleep(BATCH_DELAY_MS);
  }

  console.log(`Ennustekartta valmis. Paikkoja: ${places.length}, virheet: ${totalErrors}`);
  return timeBuckets;
}

async function geocodeCity(city) {
  const known = places.find((p) => p.name.toLowerCase() === city.toLowerCase());
  if (known) return known;

  const searchUrl =
    "https://nominatim.openstreetmap.org/search" +
    `?q=${encodeURIComponent(city + ", Finland")}` +
    "&format=json" +
    "&limit=1" +
    "&addressdetails=1";

  const response = await fetch(searchUrl, {
    headers: { "User-Agent": "kattokartta-local-app/1.0" }
  });

  const json = await response.json();
  if (!Array.isArray(json) || json.length === 0) throw new Error("Paikkakuntaa ei löytynyt");

  const lat = Number.parseFloat(json[0].lat);
  const lon = Number.parseFloat(json[0].lon);

  return {
    name: json[0].display_name,
    lat,
    lon,
    distanceKm: Math.round(haversineKm(NURMIJARVI.lat, NURMIJARVI.lon, lat, lon))
  };
}

async function reverseGeocode(lat, lon) {
  try {
    const url =
      "https://nominatim.openstreetmap.org/reverse" +
      `?lat=${lat}` +
      `&lon=${lon}` +
      "&format=json" +
      "&zoom=12";

    const response = await fetch(url, {
      headers: { "User-Agent": "kattokartta-local-app/1.0" }
    });

    if (!response.ok) throw new Error("Reverse geocode failed");

    const json = await response.json();
    return (
      json?.address?.city ||
      json?.address?.town ||
      json?.address?.village ||
      json?.address?.municipality ||
      json?.display_name ||
      "Oma sijainti"
    );
  } catch {
    return "Oma sijainti";
  }
}

function makeHourlyRows(forecasts) {
  return forecasts.slice(0, 72).map((weather) => ({
    time: weather.time,
    weather,
    ok: isGood(weather),
    score: scoreWeather(weather),
    isDaytime: (() => {
      const hour = new Date(weather.time).getHours();
      return hour >= 6 && hour <= 22;
    })()
  }));
}

app.get("/api/forecast-map", async (req, res) => {
  try {
    const now = Date.now();
    if (cachedForecast && now - cacheTime < CACHE_DURATION_MS) return res.json(cachedForecast);

    console.log("Haetaan ennustekarttaa...");
    const times = await fetchForecastPlaces();

    cachedForecast = {
      generatedAt: new Date().toISOString(),
      source: "FMI primary, Open-Meteo fallback",
      mode: "nurmijarvi-150km-color-areas",
      center: NURMIJARVI,
      radiusKm: MAX_DISTANCE_KM,
      placeCount: places.length,
      times
    };

    cacheTime = now;
    res.json(cachedForecast);
  } catch (error) {
    console.error("Backend error:", error.message);
    res.status(500).json({ error: "Backend error", details: error.message });
  }
});

app.get("/api/search", async (req, res) => {
  try {
    const city = String(req.query.city || "").trim();
    const timeIso = req.query.time ? String(req.query.time) : new Date().toISOString();
    if (!city) return res.status(400).json({ error: "Paikkakunta puuttuu" });

    const place = await geocodeCity(city);
    const result = await fetchPointForecast(place.lat, place.lon);
    const weather = pickNearestForecast(result.forecasts, timeIso);

    res.json({
      name: place.name,
      lat: place.lat,
      lon: place.lon,
      time: timeIso,
      weather,
      ok: isGood(weather),
      score: scoreWeather(weather),
      source: result.source,
      distanceKm: place.distanceKm
    });
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ error: "Hakua ei voitu suorittaa", details: error.message });
  }
});

app.get("/api/place-forecast", async (req, res) => {
  try {
    const city = String(req.query.city || "").trim();
    if (!city) return res.status(400).json({ error: "Paikkakunta puuttuu" });

    const place = await geocodeCity(city);
    const result = await fetchPointForecast(place.lat, place.lon);

    res.json({
      name: place.name,
      lat: place.lat,
      lon: place.lon,
      source: result.source,
      distanceKm: place.distanceKm,
      hourly: makeHourlyRows(result.forecasts)
    });
  } catch (error) {
    console.error("Place forecast error:", error.message);
    res.status(500).json({ error: "Tuntiennustetta ei voitu hakea", details: error.message });
  }
});

app.get("/api/location-forecast", async (req, res) => {
  try {
    const lat = Number.parseFloat(String(req.query.lat || ""));
    const lon = Number.parseFloat(String(req.query.lon || ""));
    const timeIso = req.query.time ? String(req.query.time) : new Date().toISOString();
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return res.status(400).json({ error: "Sijainti puuttuu" });

    const result = await fetchPointForecast(lat, lon);
    const weather = pickNearestForecast(result.forecasts, timeIso);
    const name = await reverseGeocode(lat, lon);

    res.json({
      name,
      lat,
      lon,
      time: timeIso,
      weather,
      ok: isGood(weather),
      score: scoreWeather(weather),
      source: result.source,
      distanceKm: Math.round(haversineKm(NURMIJARVI.lat, NURMIJARVI.lon, lat, lon)),
      hourly: makeHourlyRows(result.forecasts)
    });
  } catch (error) {
    console.error("Location forecast error:", error.message);
    res.status(500).json({ error: "Oman sijainnin ennustetta ei voitu hakea", details: error.message });
  }
});

app.use(express.static(frontendDistPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
