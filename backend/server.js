import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.join(__dirname, "..", "frontend", "dist");

const AREAS = {
  uusimaa: { id: "uusimaa", name: "Uusimaa", centerName: "Nurmijärvi", lat: 60.4647, lon: 24.8073, radiusKm: 150 },
  pirkanmaa: { id: "pirkanmaa", name: "Pirkanmaa", centerName: "Tampere", lat: 61.4978, lon: 23.7610, radiusKm: 150 }
};

function getArea(areaId) {
  return AREAS[areaId] || AREAS.uusimaa;
}

const DEFAULT_AREA = AREAS.uusimaa;
const NURMIJARVI = { name: DEFAULT_AREA.centerName, lat: DEFAULT_AREA.lat, lon: DEFAULT_AREA.lon };
const MAX_DISTANCE_KM = DEFAULT_AREA.radiusKm;

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
  { name: "Lempäälä", lat: 61.3167, lon: 23.7500 },
  { name: "Pirkkala", lat: 61.4613, lon: 23.6320 },
  { name: "Ylöjärvi", lat: 61.5563, lon: 23.5961 },
  { name: "Nokia", lat: 61.4667, lon: 23.5000 },
  { name: "Kangasala", lat: 61.4638, lon: 24.0651 },
  { name: "Orivesi", lat: 61.6777, lon: 24.3572 },
  { name: "Vesilahti", lat: 61.3167, lon: 23.6167 },
  { name: "Hämeenkyrö", lat: 61.6381, lon: 23.1953 },
  { name: "Ikaalinen", lat: 61.7697, lon: 23.0658 },
  { name: "Parkano", lat: 62.0167, lon: 23.0167 },
  { name: "Virrat", lat: 62.2476, lon: 23.7800 },
  { name: "Mänttä-Vilppula", lat: 62.0300, lon: 24.6300 },
  { name: "Ruovesi", lat: 61.9858, lon: 24.0575 },
  { name: "Juupajoki", lat: 61.8000, lon: 24.3667 },
  { name: "Pälkäne", lat: 61.3340, lon: 24.2710 },
  { name: "Urjala", lat: 61.0833, lon: 23.5333 },
  { name: "Punkalaidun", lat: 61.1167, lon: 23.1000 },
  { name: "Sastamala", lat: 61.3406, lon: 22.9086 },
  { name: "Kuhmoinen", lat: 61.5667, lon: 25.1833 },
  { name: "Jämsä", lat: 61.8642, lon: 25.1900 },
  { name: "Keuruu", lat: 62.2600, lon: 24.7067 },
  { name: "Muurame", lat: 62.1333, lon: 25.6667 },
  { name: "Jyväskylä", lat: 62.2426, lon: 25.7473 },
  { name: "Kokemäki", lat: 61.2565, lon: 22.3564 },
  { name: "Harjavalta", lat: 61.3167, lon: 22.1333 },
  { name: "Pori", lat: 61.4851, lon: 21.7972 },
  { name: "Rauma", lat: 61.1280, lon: 21.5113 },
  { name: "Loimaa", lat: 60.8497, lon: 23.0561 },
  { name: "Huittinen", lat: 61.1833, lon: 22.7000 },
  { name: "Eura", lat: 61.1333, lon: 22.1333 },
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

function getPlacesForArea(areaId = "uusimaa") {
  const area = getArea(areaId);

  return allPlaces
    .filter((place) => haversineKm(area.lat, area.lon, place.lat, place.lon) <= area.radiusKm)
    .map((place) => ({
      ...place,
      distanceKm: Math.round(haversineKm(area.lat, area.lon, place.lat, place.lon))
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

const places = getPlacesForArea("uusimaa");

const forecastCache = new Map();
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

  // 3 vuorokautta tunnin välein
  for (let i = 0; i < 72; i += 1) {
    steps.push(addHours(start, i));
  }

  return steps;
}

function isGood(weather) {
  return (
    weather &&
    weather.temp > 5 &&
    weather.wind < 10 &&
    weather.humidity < 78 &&
    weather.precipitation <= 0.1
  );
}

function scoreWeather(weather) {
  if (!weather) return 0;
  let score = 100;
  if (weather.temp <= 5) score -= 45;
  else if (weather.temp < 8) score -= 15;
  if (weather.humidity >= 78) score -= 45;
  else if (weather.humidity > 73) score -= 15;
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

async function fetchWithTimeout(url, timeoutMs = 4500, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
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

async function fetchForecastPlaces(areaId = "uusimaa") {
  const area = getArea(areaId);
  const places = getPlacesForArea(area.id);
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
  const known = allPlaces.find((p) => p.name.toLowerCase() === city.toLowerCase());
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



const nowcastCache = new Map();
const NOWCAST_CACHE_DURATION_MS = 5 * 60 * 1000;

async function fetchMetNowcast(lat, lon) {
  const roundedLat = Number(lat).toFixed(4);
  const roundedLon = Number(lon).toFixed(4);
  const cacheKey = `${roundedLat},${roundedLon}`;
  const cached = nowcastCache.get(cacheKey);

  if (cached && Date.now() - cached.time < NOWCAST_CACHE_DURATION_MS) {
    return cached.value;
  }

  const url =
    "https://api.met.no/weatherapi/nowcast/2.0/complete" +
    `?lat=${encodeURIComponent(roundedLat)}` +
    `&lon=${encodeURIComponent(roundedLon)}`;

  const response = await fetchWithTimeout(url, 6000, {
    headers: {
      "User-Agent": "Kattosaa/1.0 jarkko.ojala1@gmail.com"
    }
  });

  if (!response.ok) {
    throw new Error(`MET Norway nowcast status ${response.status}`);
  }

  const data = await response.json();
  const rows = (data?.properties?.timeseries || []).slice(0, 24).map((item) => {
    const details = item?.data?.instant?.details || {};
    const next1h = item?.data?.next_1_hours?.details || {};

    const precipitationRate =
      details.precipitation_rate ??
      details.precipitation_amount ??
      next1h.precipitation_amount ??
      0;

    return {
      time: item.time,
      precipitationRate: Number(precipitationRate) || 0,
      airTemperature: details.air_temperature,
      source: "MET Norway Nowcast"
    };
  });

  if (!rows.length) {
    throw new Error("MET Norway nowcast returned no values");
  }

  const result = {
    source: "MET Norway Nowcast / api.met.no",
    updatedAt: new Date().toISOString(),
    rows
  };

  nowcastCache.set(cacheKey, { time: Date.now(), value: result });
  return result;
}

function summarizeRainRisk(rows) {
  const nextTwoHours = rows.slice(0, 12);
  const rainyRows = nextTwoHours.filter((row) => row.precipitationRate > 0.05);
  const heavyRows = nextTwoHours.filter((row) => row.precipitationRate >= 1);

  let risk = "matala";
  let recommendation = "Sadetta ei näy lähitunneilla. Pinnoituksen voi arvioida normaalien säärajojen mukaan.";

  if (heavyRows.length > 0) {
    risk = "korkea";
    recommendation = "Sadetta näyttää olevan tulossa lähitunneille. Älä aloita riskialtista pinnoitusta ilman uutta tarkistusta.";
  } else if (rainyRows.length > 0) {
    risk = "keskitaso";
    recommendation = "Lähitunneilla näkyy sadekuurojen mahdollisuus. Tarkista tilanne uudelleen ennen pitkää työvaihetta.";
  }

  const firstRain = rainyRows[0];

  return {
    risk,
    firstRainAt: firstRain?.time || null,
    maxPrecipitationRate: Math.max(0, ...nextTwoHours.map((row) => row.precipitationRate || 0)),
    rainySlots: rainyRows.length,
    recommendation
  };
}



app.get("/api/rain-nowcast", async (req, res) => {
  try {
    let lat = Number(req.query.lat);
    let lon = Number(req.query.lon);
    const city = String(req.query.city || "").trim();

    if ((!Number.isFinite(lat) || !Number.isFinite(lon)) && city) {
      const place = await geocodeCity(city);
      lat = Number(place.lat);
      lon = Number(place.lon);
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ error: "Sijainti puuttuu" });
    }

    const result = await fetchMetNowcast(lat, lon);
    const summary = summarizeRainRisk(result.rows);

    res.json({
      lat,
      lon,
      source: result.source,
      updatedAt: result.updatedAt,
      summary,
      rows: result.rows
    });
  } catch (error) {
    console.error("Rain nowcast error:", error.message);

    // Fallback: käytetään olemassa olevaa ennustedataa, jos MET nowcast ei onnistu.
    try {
      const lat = Number(req.query.lat);
      const lon = Number(req.query.lon);

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        throw error;
      }

      const forecast = await fetchPointForecast(lat, lon);
      const rows = (forecast.forecasts || []).slice(0, 12).map((weather) => ({
        time: weather.time,
        precipitationRate: Number(weather.precipitation || 0),
        airTemperature: weather.temp,
        source: forecast.source
      }));

      res.json({
        lat,
        lon,
        source: `${forecast.source} lähisadevaralähde`,
        updatedAt: new Date().toISOString(),
        summary: summarizeRainRisk(rows),
        rows
      });
    } catch {
      res.status(500).json({
        error: "Lähisadetta ei voitu hakea",
        details: error.message
      });
    }
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "Kattosää backend",
    time: new Date().toISOString()
  });
});

app.get("/api/forecast-map", async (req, res) => {
  try {
    const areaId = String(req.query.area || "uusimaa");
    const area = getArea(areaId);
    const cached = forecastCache.get(area.id);
    const now = Date.now();

    if (cached && now - cached.cacheTime < CACHE_DURATION_MS) {
      return res.json(cached.data);
    }

    console.log(`Haetaan ennustekarttaa alueelle ${area.name}...`);
    const times = await fetchForecastPlaces(area.id);
    const areaPlaces = getPlacesForArea(area.id);

    const data = {
      generatedAt: new Date().toISOString(),
      source: "FMI primary, Open-Meteo fallback",
      mode: `${area.id}-150km-color-areas`,
      area: area.id,
      areaName: area.name,
      center: { name: area.centerName, lat: area.lat, lon: area.lon },
      radiusKm: area.radiusKm,
      placeCount: areaPlaces.length,
      times
    };

    forecastCache.set(area.id, { cacheTime: now, data });
    res.json(data);
  } catch (error) {
    console.error("Backend error:", error.message);
    res.status(500).json({ error: "Backend error", details: error.message });
  }
});


app.get("/api/suggest", (req, res) => {
  try {
    const query = String(req.query.q || "").trim().toLocaleLowerCase("fi-FI");
    const area = getArea(String(req.query.area || "uusimaa"));

    if (query.length < 2) {
      return res.json({ suggestions: [] });
    }

    const normalize = (value) => String(value || "").toLocaleLowerCase("fi-FI");
    const areaPlaces = getPlacesForArea(area.id);
    const source = [...areaPlaces, ...allPlaces];
    const seen = new Set();

    const suggestions = source
      .map((place) => {
        const name = place.name;
        const lowerName = normalize(name);
        let rank = 99;

        if (lowerName.startsWith(query)) rank = 0;
        else if (lowerName.includes(query)) rank = 1;

        return {
          name,
          lat: Number(place.lat),
          lon: Number(place.lon),
          distanceKm: Math.round(haversineKm(area.lat, area.lon, place.lat, place.lon)),
          rank
        };
      })
      .filter((place) => place.rank < 99 && Number.isFinite(place.lat) && Number.isFinite(place.lon))
      .filter((place) => {
        const key = normalize(place.name);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => {
        if (a.rank !== b.rank) return a.rank - b.rank;
        if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
        return a.name.localeCompare(b.name, "fi");
      })
      .slice(0, 8);

    res.json({ suggestions });
  } catch (error) {
    console.error("Suggest error:", error.message);
    res.status(500).json({ error: "Ehdotuksia ei voitu hakea", details: error.message });
  }
});

app.get("/api/search", async (req, res) => {
  try {
    const city = String(req.query.city || "").trim();
    const timeIso = req.query.time ? String(req.query.time) : new Date().toISOString();
    const area = getArea(String(req.query.area || "uusimaa"));

    if (!city) {
      return res.status(400).json({ error: "Paikkakunta puuttuu" });
    }

    const place = await geocodeCity(city);

    if (!place || !Number.isFinite(Number(place.lat)) || !Number.isFinite(Number(place.lon))) {
      return res.status(404).json({ error: "Paikkakuntaa ei löytynyt" });
    }

    const result = await fetchPointForecast(Number(place.lat), Number(place.lon));
    const weather = pickNearestForecast(result.forecasts || [], timeIso);

    if (!weather) {
      return res.status(502).json({ error: "Sääennustetta ei saatu haetulle paikkakunnalle" });
    }

    res.json({
      name: place.name || city,
      lat: Number(place.lat),
      lon: Number(place.lon),
      time: weather.time || timeIso,
      weather,
      ok: isGood(weather),
      score: scoreWeather(weather),
      source: result.source || "FMI / Open-Meteo",
      distanceKm: Math.round(haversineKm(area.lat, area.lon, Number(place.lat), Number(place.lon)))
    });
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({
      error: "Hakua ei voitu suorittaa",
      details: error.message
    });
  }
});

app.get("/api/place-forecast", async (req, res) => {
  try {
    const city = String(req.query.city || "").trim();
    const area = getArea(String(req.query.area || "uusimaa"));
    if (!city) return res.status(400).json({ error: "Paikkakunta puuttuu" });

    const place = await geocodeCity(city);
    const result = await fetchPointForecast(place.lat, place.lon);

    res.json({
      name: place.name,
      lat: place.lat,
      lon: place.lon,
      source: result.source,
      distanceKm: Math.round(haversineKm(area.lat, area.lon, place.lat, place.lon)),
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
    const area = getArea(String(req.query.area || "uusimaa"));
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
      distanceKm: Math.round(haversineKm(area.lat, area.lon, lat, lon)),
      hourly: makeHourlyRows(result.forecasts)
    });
  } catch (error) {
    console.error("Location forecast error:", error.message);
    res.status(500).json({ error: "Oman sijainnin ennustetta ei voitu hakea", details: error.message });
  }
});


const LOGIN_USER = process.env.LOGIN_USER || "admin";
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD || "kattosaa";
const LOGIN_TOKEN = process.env.LOGIN_TOKEN || "kattokartta-local-token";

app.post("/api/login", (req, res) => {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");

  const validUsername = process.env.KATTOSAA_USER || "kattosaa";
  const validPassword = process.env.KATTOSAA_PASSWORD || "pinnoitus";

  if (username === validUsername && password === validPassword) {
    return res.json({
      token: "kattosaa-maintenance-access",
      username,
      mode: "maintenance"
    });
  }

  res.status(401).json({
    error: "Väärä käyttäjätunnus tai salasana"
  });
});

app.get("/api/session", (req, res) => {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "");

  if (token === LOGIN_TOKEN) {
    return res.json({ ok: true });
  }

  return res.status(401).json({ ok: false });
});


app.use(express.static(frontendDistPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
