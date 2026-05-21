import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Popup,
  Tooltip,
  useMap
} from "react-leaflet";

function MapMover({ lat, lon, centerLat, centerLon, moveKey, areaMoveKey, areaZoom = 8 }) {
  const map = useMap();
  const lastMoveKeyRef = useRef(null);
  const lastAreaMoveKeyRef = useRef(null);

  useEffect(() => {
    if (!Number.isFinite(centerLat) || !Number.isFinite(centerLon)) return;
    if (lastAreaMoveKeyRef.current === areaMoveKey) return;

    lastAreaMoveKeyRef.current = areaMoveKey;

    map.setView([centerLat, centerLon], areaZoom, {
      animate: true
    });
  }, [centerLat, centerLon, areaMoveKey, areaZoom, map]);

  useEffect(() => {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    if (lastMoveKeyRef.current === moveKey) return;

    lastMoveKeyRef.current = moveKey;

    map.flyTo([lat, lon], Math.max(map.getZoom(), 10), {
      animate: true,
      duration: 0.6
    });
  }, [lat, lon, moveKey, map]);

  return null;
}

function MapSizeFixer({ triggerKey }) {
  const map = useMap();

  useEffect(() => {
    const refresh = () => {
      requestAnimationFrame(() => {
        map.invalidateSize({ animate: false });
      });
    };

    const timers = [
      setTimeout(refresh, 80),
      setTimeout(refresh, 300),
      setTimeout(refresh, 900)
    ];

    window.addEventListener("resize", refresh);
    window.addEventListener("orientationchange", refresh);
    window.visualViewport?.addEventListener("resize", refresh);
    window.visualViewport?.addEventListener("scroll", refresh);

    refresh();

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("orientationchange", refresh);
      window.visualViewport?.removeEventListener("resize", refresh);
      window.visualViewport?.removeEventListener("scroll", refresh);
    };
  }, [map, triggerKey]);

  return null;
}

function SafeRadarZoom({ enabled, activeRadarArea }) {
  const map = useMap();

  useEffect(() => {
    if (!enabled) {
      map.setMinZoom(0);
      map.setMaxZoom(18);
      map.setMaxBounds(null);
      return;
    }

    map.setMinZoom(RADAR_MIN_ZOOM);
    map.setMaxZoom(RADAR_MAX_ZOOM);
    map.setMaxBounds(activeRadarArea.bounds);

    const clampZoom = () => {
      const currentZoom = map.getZoom();
      if (currentZoom < RADAR_MIN_ZOOM) {
        map.setZoom(RADAR_MIN_ZOOM, { animate: false });
      } else if (currentZoom > RADAR_MAX_ZOOM) {
        map.setZoom(RADAR_MAX_ZOOM, { animate: false });
      }
    };

    map.setView(activeRadarArea.center, activeRadarArea.zoom, { animate: false });
    clampZoom();
    map.on("zoomend", clampZoom);

    setTimeout(() => {
      clampZoom();
      map.invalidateSize({ animate: false });
    }, 80);

    return () => {
      map.off("zoomend", clampZoom);
    };
  }, [enabled, map, activeRadarArea]);

  return null;
}


function formatRainTime(iso) {
  if (!iso) return "ei näkyvissä";
  return new Date(iso).toLocaleTimeString("fi-FI", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function rainRiskLabel(risk) {
  if (risk === "korkea") return "Korkea";
  if (risk === "keskitaso") return "Keskitaso";
  return "Matala";
}

function rainRiskClass(risk) {
  if (risk === "korkea") return "rain-high";
  if (risk === "keskitaso") return "rain-medium";
  return "rain-low";
}

function getColor(point) {
  if (!point) return "#94a3b8";
  if (point.ok) return "#16a34a";
  if ((point.score ?? 0) >= 60) return "#f59e0b";
  return "#dc2626";
}

function getWeatherIcon(weather) {
  if (!weather) return "⛅";
  if ((weather.precipitation ?? 0) > 1.5) return "🌧️";
  if ((weather.precipitation ?? 0) > 0.1) return "🌦️";
  if ((weather.temp ?? 0) <= 0) return "❄️";
  if ((weather.humidity ?? 0) >= 85) return "☁️";
  if ((weather.temp ?? 0) >= 18) return "☀️";
  return "⛅";
}

function formatTime(iso) {
  return new Date(iso).toLocaleString("fi-FI", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatRadarTime(unixTime) {
  if (!unixTime) return "";
  return new Date(unixTime * 1000).toLocaleString("fi-FI", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit"
  });
}

function dayKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function formatDayLabel(iso) {
  return new Date(iso).toLocaleDateString("fi-FI", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  });
}

function formatHour(iso) {
  return new Date(iso).toLocaleTimeString("fi-FI", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function isTimelineDayHour(iso) {
  const h = new Date(iso).getHours();
  return h >= 6 && h <= 21;
}

function isForecastDayHour(iso) {
  const h = new Date(iso).getHours();
  return h >= 6 && h <= 21;
}


function pickNearestHourlyRow(rows, targetTime = new Date()) {
  if (!Array.isArray(rows) || rows.length === 0) return null;

  const target = new Date(targetTime).getTime();
  let best = rows[0];
  let bestDiff = Number.POSITIVE_INFINITY;

  for (const row of rows) {
    const diff = Math.abs(new Date(row.time).getTime() - target);
    if (diff < bestDiff) {
      best = row;
      bestDiff = diff;
    }
  }

  return best;
}

function coatingClass(row) {
  if (!row) return "";
  if (row.ok) return "coating-good";
  if ((row.score ?? 0) >= 60) return "coating-warn";
  return "coating-bad";
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}


const AREA_CONFIG = {
  uusimaa: {
    name: "Uusimaa",
    centerName: "Nurmijärvi",
    center: [60.4647, 24.8073],
    radiusKm: 150,
    zoom: 7,
    bounds: [
      [58.9, 21.6],
      [62.0, 27.7]
    ]
  },
  pirkanmaa: {
    name: "Pirkanmaa",
    centerName: "Tampere",
    center: [61.4978, 23.761],
    radiusKm: 150,
    zoom: 7,
    bounds: [
      [59.9, 20.8],
      [63.0, 26.7]
    ]
  }
};


function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}


function hasValidCoordinates(item) {
  return Number.isFinite(Number(item?.lat)) && Number.isFinite(Number(item?.lon));
}

function isInsideArea(point, area) {
  if (!point || !area) return false;
  return distanceKm(area.center[0], area.center[1], point.lat, point.lon) <= area.radiusKm + 2;
}


const RADAR_MIN_ZOOM = 5;
const RADAR_MAX_ZOOM = 8;

const RADAR_AREA_CONFIG = {
  uusimaa: {
    name: "Etelä-Suomi",
    center: [60.65, 24.95],
    bounds: [
      [59.55, 21.6],
      [61.75, 28.2]
    ],
    zoom: 7
  },
  pirkanmaa: {
    name: "Pirkanmaa",
    center: [61.5, 23.8],
    bounds: [
      [60.65, 21.9],
      [62.55, 25.9]
    ],
    zoom: 7
  }
};


function chooseAreaByLocation(lat, lon) {
  const uusimaa = AREA_CONFIG.uusimaa;
  const pirkanmaa = AREA_CONFIG.pirkanmaa;

  const distanceToUusimaa = distanceKm(lat, lon, uusimaa.center[0], uusimaa.center[1]);
  const distanceToPirkanmaa = distanceKm(lat, lon, pirkanmaa.center[0], pirkanmaa.center[1]);

  return distanceToPirkanmaa < distanceToUusimaa ? "pirkanmaa" : "uusimaa";
}

export default function App() {
  const [forecast, setForecast] = useState(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [errorText, setErrorText] = useState("");

  const [showNames, setShowNames] = useState(false);
  const [showRadar, setShowRadar] = useState(false);
  const [showColorAreas, setShowColorAreas] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNightForecast, setShowNightForecast] = useState(false);
  const [largeMapPoints, setLargeMapPoints] = useState(false);
  const [selectedArea, setSelectedArea] = useState("uusimaa");
  const [areaMoveKey, setAreaMoveKey] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mapRefreshKey, setMapRefreshKey] = useState(0);
  const [autoAreaMessage, setAutoAreaMessage] = useState("");

  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedMoveKey, setSelectedMoveKey] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [forecastSource, setForecastSource] = useState("");
  const inputRef = useRef(null);

  const [radarFrames, setRadarFrames] = useState([]);
  const [radarHost, setRadarHost] = useState("");
  const [radarIndex, setRadarIndex] = useState(0);
  const [radarPlaying, setRadarPlaying] = useState(false);
  const [radarError, setRadarError] = useState("");
  const [rainMode, setRainMode] = useState(false);
  const [rainNowcast, setRainNowcast] = useState(null);
  const [rainLoading, setRainLoading] = useState(false);
  const [rainError, setRainError] = useState("");

  const API_BASE = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : "";

  const [authToken, setAuthToken] = useState("public-access");
  const [loginUser, setLoginUser] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPasswordHint, setShowPasswordHint] = useState(true);


  const timelineItems = useMemo(
    () => (forecast?.times || []).filter((item) => isTimelineDayHour(item.time)),
    [forecast]
  );

  const [selectedTimeKey, setSelectedTimeKey] = useState("");

  useEffect(() => {
    if (timelineItems.length === 0) return;
    const exists = timelineItems.some((item) => item.time === selectedTimeKey);
    if (!selectedTimeKey || !exists) {
      setSelectedTimeKey(timelineItems[0].time);
    }
  }, [timelineItems, selectedTimeKey]);

  const selectedTime =
    timelineItems.find((item) => item.time === selectedTimeKey) || timelineItems[0];

  const activeArea = AREA_CONFIG[selectedArea] || AREA_CONFIG.uusimaa;
  const activeRadarArea = RADAR_AREA_CONFIG[selectedArea] || RADAR_AREA_CONFIG.uusimaa;
  const rawPoints = selectedTime?.points || [];
  const points = rawPoints.filter((point) => isInsideArea(point, activeArea));
  const center = activeArea.center;
  const mapBounds = activeArea.bounds;
  const selectedRadarFrame = radarFrames[radarIndex];
  const radarTileUrl =
    rainMode && selectedRadarFrame && radarHost
      ? `${radarHost}${selectedRadarFrame.path}/256/{z}/{x}/{y}/2/1_1.png`
      : null;

  const timelineDays = useMemo(() => {
    const groups = [];
    for (const item of timelineItems) {
      const key = dayKey(item.time);
      let group = groups.find((g) => g.key === key);
      if (!group) {
        group = { key, label: formatDayLabel(item.time), items: [] };
        groups.push(group);
      }
      group.items.push(item);
    }
    return groups;
  }, [timelineItems]);

  const selectedDayKey = selectedTime ? dayKey(selectedTime.time) : timelineDays[0]?.key;
  const selectedDay = timelineDays.find((d) => d.key === selectedDayKey) || timelineDays[0];

  const okPercent = useMemo(() => {
    if (!selectedTime?.totalCount) return 0;
    return Math.round((selectedTime.okCount / selectedTime.totalCount) * 100);
  }, [selectedTime]);

  useEffect(() => {
    // iPhone Safari / PWA: Leaflet voi jäädä harmaaksi, jos koko muuttuu kesken latauksen.
    const timers = [
      setTimeout(() => setMapRefreshKey((value) => value + 1), 80),
      setTimeout(() => setMapRefreshKey((value) => value + 1), 350),
      setTimeout(() => setMapRefreshKey((value) => value + 1), 900)
    ];

    return () => timers.forEach(clearTimeout);
  }, [showPanel, selectedArea, selectedTimeKey, forecast?.generatedAt]);

  const visibleHourlyForecast = useMemo(() => {
    const rows = showNightForecast
      ? hourlyForecast
      : hourlyForecast.filter((row) => isForecastDayHour(row.time));

    const groups = [];
    for (const row of rows) {
      const key = dayKey(row.time);
      let group = groups.find((g) => g.key === key);
      if (!group) {
        group = {
          key,
          label: new Date(row.time).toLocaleDateString("fi-FI", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit"
          }),
          rows: []
        };
        groups.push(group);
      }
      group.rows.push(row);
    }
    return groups;
  }, [hourlyForecast, showNightForecast]);

  useEffect(() => {
    // Valittu alue vaihtuu: poistetaan vanhan alueen data välittömästi
    setForecast(null);
    setSelectedTimeKey("");
    setSelectedPlace(null);
    setCity("");
    setHourlyForecast([]);
    setForecastSource("");
    setErrorText("");
    setLoadingMap(true);
    setAreaMoveKey((value) => value + 1);
  }, [selectedArea]);

  useEffect(() => {
    let cancelled = false;
    const requestedArea = selectedArea;

    setLoadingMap(true);

    fetch(`${API_BASE}/api/forecast-map?area=${requestedArea}`)
      .then((response) => {
        if (!response.ok) throw new Error("Backend ei vastannut oikein");
        return response.json();
      })
      .then((items) => {
        if (cancelled) return;
        if (!items) return;

        const active = AREA_CONFIG[requestedArea] || AREA_CONFIG.uusimaa;

        const cleanedItems = {
          ...items,
          area: requestedArea,
          center: {
            name: active.centerName,
            lat: active.center[0],
            lon: active.center[1]
          },
          times: (items.times || []).map((timeItem) => ({
            ...timeItem,
            points: (timeItem.points || []).filter((point) => isInsideArea(point, active))
          }))
        };

        setForecast(cleanedItems);
        setLoadingMap(false);
      })
      .catch((error) => {
        if (cancelled) return;

        setErrorText(error.message);
        setForecast(null);
        setLoadingMap(false);
      });

    return () => {
      cancelled = true;
    };
  }, [API_BASE, selectedArea, refreshKey]);

  useEffect(() => {
    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then((response) => {
        if (!response.ok) throw new Error("Sadetutkaa ei voitu hakea");
        return response.json();
      })
      .then((data) => {
        const frames = data?.radar?.past || [];
        setRadarHost(data.host || "https://tilecache.rainviewer.com");
        setRadarFrames(frames);
        setRadarIndex(Math.max(0, frames.length - 1));
      })
      .catch((error) => setRadarError(error.message));
  }, []);

  useEffect(() => {
    // Sadetutka seuraa valittua aluetta ja keskittää kartan uudelleen.
    if (!rainMode) return;
    setMapRefreshKey((value) => value + 1);
  }, [rainMode, selectedArea]);

  useEffect(() => {
    // Sadetutka-tila hakee lähisade-ennusteen valitulle paikalle / omalle sijainnille.
    if (!rainMode) return;
    loadRainNowcast();
  }, [rainMode, selectedPlace?.lat, selectedPlace?.lon, userLocation?.lat, userLocation?.lon, selectedArea]);

  useEffect(() => {
    if (!radarPlaying || !radarFrames.length) return;
    const timer = setInterval(() => {
      setRadarIndex((current) => (current + 1) % radarFrames.length);
    }, 700);
    return () => clearInterval(timer);
  }, [radarPlaying, radarFrames.length]);

  useEffect(() => {
    if (!selectedPlace || selectedPlace.isOwnLocation || !points.length) return;

    const updated = points.find((point) => point.name === selectedPlace.name);
    if (updated) {
      setSelectedPlace((current) => ({
        ...current,
        weather: updated.weather,
        ok: updated.ok,
        score: updated.score,
        distanceKm: updated.distanceKm,
        source: updated.source
      }));
    }
  }, [points, selectedPlace?.name, selectedPlace?.isOwnLocation]);

  async function login(event) {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: loginUser.trim(),
          password: loginPassword
        })
      });

      const result = await response.json();

      if (!response.ok || !result.token) {
        throw new Error(result.error || "Kirjautuminen epäonnistui");
      }

      localStorage.setItem("kattokarttaToken", result.token);
      setAuthToken(result.token);
      setLoginPassword("");
      setLoginError("");
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setLoginLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("kattokarttaToken");
    setAuthToken("");
    setLoginUser("");
    setLoginPassword("");
    setSelectedPlace(null);
    setHourlyForecast([]);
    setShowPanel(false);
  }

  function refreshForecast() {
    setForecast(null);
    setSelectedTimeKey("");
    setSelectedPlace(null);
    setHourlyForecast([]);
    setForecastSource("");
    setErrorText("");
    setLoadingMap(true);
    setAreaMoveKey((value) => value + 1);
    setRefreshKey((value) => value + 1);
    setMapRefreshKey((value) => value + 1);
  }

  function clearSelection() {
    setCity("");
    setSelectedPlace(null);
    setHourlyForecast([]);
    setForecastSource("");
    setErrorText("");
    inputRef.current?.focus();
  }

  async function loadPlaceForecast(placeName) {
    const response = await fetch(
      `${API_BASE}/api/place-forecast?city=${encodeURIComponent(placeName)}&area=${selectedArea}`
    );
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Tuntiennustetta ei voitu hakea");
    }

    const hourly = result.hourly || [];
    const currentRow = pickNearestHourlyRow(hourly, new Date());

    setHourlyForecast(hourly);
    setForecastSource(result.source || "");

    if (currentRow) {
      setSelectedPlace((current) => {
        if (!current) return current;

        return {
          ...current,
          name: result.name || current.name,
          lat: Number(result.lat ?? current.lat),
          lon: Number(result.lon ?? current.lon),
          time: currentRow.time,
          weather: currentRow.weather,
          ok: currentRow.ok,
          score: currentRow.score,
          source: result.source || current.source,
          distanceKm: result.distanceKm ?? current.distanceKm
        };
      });
    }
  }


  async function useOwnLocation() {
    if (!navigator.geolocation) {
      setErrorText("Tämä laite ei tue sijainnin hakua");
      return;
    }

    setLocating(true);
    setErrorText("");
    setAutoAreaMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const detectedArea = chooseAreaByLocation(lat, lon);
        const areaChanged = detectedArea !== selectedArea;
        const time = selectedTime?.time || new Date().toISOString();

        if (areaChanged) {
          setSelectedArea(detectedArea);
          setAutoAreaMessage(
            detectedArea === "pirkanmaa"
              ? "Sijainnin perusteella alueeksi valittiin Pirkanmaa."
              : "Sijainnin perusteella alueeksi valittiin Uusimaa."
          );
        }

        try {
          const response = await fetch(
            `${API_BASE}/api/location-forecast?lat=${lat}&lon=${lon}&time=${encodeURIComponent(time)}&area=${detectedArea}`
          );
          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || "Oman sijainnin ennustetta ei voitu hakea");
          }

          setUserLocation({ lat, lon });
          setCity(result.name || "Oma sijainti");
          setSelectedPlace({
            name: result.name || "Oma sijainti",
            lat,
            lon,
            time: result.time,
            weather: result.weather,
            ok: result.ok,
            score: result.score,
            source: result.source,
            distanceKm: result.distanceKm,
            isOwnLocation: true
          });
          setSelectedMoveKey((value) => value + 1);
          setAreaMoveKey((value) => value + 1);
          setMapRefreshKey((value) => value + 1);
          setHourlyForecast(result.hourly || []);
          setForecastSource(result.source || "");
          setShowPanel(true);
        } catch (error) {
          setErrorText(error.message);
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        if (error.code === 1) {
          setErrorText("Sijainnin käyttö estettiin. Salli sijainti selaimessa.");
        } else {
          setErrorText("Sijaintia ei voitu hakea.");
        }
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  useEffect(() => {
    const query = city.trim();

    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setSuggestionsLoading(true);

      try {
        const response = await fetch(
          `${API_BASE}/api/suggest?q=${encodeURIComponent(query)}&area=${selectedArea}`
        );
        const result = await response.json();

        if (!cancelled && response.ok) {
          const items = result.suggestions || [];
          setSuggestions(items);
          setShowSuggestions(items.length > 0);
        }
      } catch {
        if (!cancelled) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } finally {
        if (!cancelled) {
          setSuggestionsLoading(false);
        }
      }
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [city, selectedArea, API_BASE]);

  async function chooseSuggestion(suggestion) {
    const name = suggestion.name;
    setCity(name);
    setSuggestions([]);
    setShowSuggestions(false);
    await searchForCity(name);
  }

  async function searchForCity(query) {
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      inputRef.current?.focus();
      return;
    }

    const time = selectedTime?.time || new Date().toISOString();
    setSearchLoading(true);
    setErrorText("");
    setSuggestions([]);
    setShowSuggestions(false);

    try {
      const response = await fetch(
        `${API_BASE}/api/search?city=${encodeURIComponent(cleanQuery)}&time=${encodeURIComponent(time)}&area=${selectedArea}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || "Hakua ei voitu suorittaa");
      }

      if (!Number.isFinite(Number(result.lat)) || !Number.isFinite(Number(result.lon))) {
        throw new Error("Haun tuloksesta puuttui sijainti");
      }

      const place = {
        ...result,
        lat: Number(result.lat),
        lon: Number(result.lon)
      };

      setCity(place.name || cleanQuery);
      setSelectedPlace(place);
      setSelectedMoveKey((value) => value + 1);
      setForecastSource(place.source || "");

      try {
        await loadPlaceForecast(place.name || cleanQuery);
      } catch (forecastError) {
        setHourlyForecast([]);
        setErrorText(`Paikka löytyi, mutta tuntiennustetta ei saatu: ${forecastError.message}`);
      }

      setShowPanel(true);
    } catch (error) {
      setErrorText(error.message);
      setSelectedPlace(null);
      setHourlyForecast([]);
      setForecastSource("");
    } finally {
      setSearchLoading(false);
    }
  }

  async function searchCity(event) {
    event.preventDefault();
    await searchForCity(city);
  }

  async function selectMapPoint(point) {
    const place = {
      name: point.name,
      lat: point.lat,
      lon: point.lon,
      time: selectedTime?.time || new Date().toISOString(),
      weather: point.weather,
      ok: point.ok,
      score: point.score,
      source: point.source,
      distanceKm: point.distanceKm
    };

    setCity(point.name);
    setSelectedPlace(place);
    setSelectedMoveKey((value) => value + 1);
    setForecastSource(point.source || "");
    setShowPanel(true);
    setErrorText("");

    try {
      await loadPlaceForecast(point.name);
    } catch (error) {
      setErrorText(error.message);
      setHourlyForecast([]);
    }
  }

  async function loadRainNowcast() {
    const target =
      selectedPlace && hasValidCoordinates(selectedPlace)
        ? selectedPlace
        : userLocation
          ? { name: "Oma sijainti", lat: userLocation.lat, lon: userLocation.lon }
          : { name: activeArea.centerName, lat: activeArea.center[0], lon: activeArea.center[1] };

    setRainLoading(true);
    setRainError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/rain-nowcast?lat=${encodeURIComponent(target.lat)}&lon=${encodeURIComponent(target.lon)}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || "Lähisadetta ei voitu hakea");
      }

      setRainNowcast({
        ...result,
        placeName: target.name
      });
    } catch (error) {
      setRainError(error.message);
      setRainNowcast(null);
    } finally {
      setRainLoading(false);
    }
  }

  const radarUrl =
    showRadar && selectedRadarFrame && radarHost
      ? `${radarHost}${selectedRadarFrame.path}/256/{z}/{x}/{y}/2/1_1.png`
      : null;

  const radarCenter =
    selectedPlace && hasValidCoordinates(selectedPlace)
      ? { lat: selectedPlace.lat, lon: selectedPlace.lon }
      : userLocation
        ? { lat: userLocation.lat, lon: userLocation.lon }
        : { lat: activeArea.center[0], lon: activeArea.center[1] };

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="topbar-title"><img src="/logo.png" alt="" /> Kattosää · {selectedArea === "pirkanmaa" ? "Pirkanmaa" : "Uusimaa"}</div>
        {autoAreaMessage && (
          <div className="auto-area-message">
            {autoAreaMessage}
            <button type="button" onClick={() => setAutoAreaMessage("")}>×</button>
          </div>
        )}
        <div className="topbar-actions">
          <button className="ghost-location-button" onClick={useOwnLocation}>
            {locating ? "Haetaan sijaintia..." : "Oma sijainti"}
          </button>
          <button
            className={`ghost-location-button radar-mode-button ${rainMode ? "active" : ""}`}
            onClick={() => {
              setRainMode((value) => {
                const next = !value;
                setShowRadar(next);
                setRadarPlaying(next);
                return next;
              });
            }}
          >
            {rainMode ? "Pinnoituskartta" : "Sadetutka"}
          </button>
          <button className="ghost-location-button refresh-button" onClick={refreshForecast}>
            Päivitä
          </button>
          {!showPanel && (
          <button className="open-panel-button" onClick={() => setShowPanel(true)}>
            Avaa ennuste
          </button>
        )}
        </div>
      </div>

      {rainMode && (
        <div className="rain-bottom-bar">
          <div className="rain-bar-main">
            <button
              type="button"
              className="rain-play-button"
              onClick={() => setRadarPlaying((value) => !value)}
              disabled={!radarFrames.length}
              aria-label={radarPlaying ? "Pysäytä sadetutka" : "Toista sadetutka"}
            >
              {radarPlaying ? "⏸" : "▶"}
            </button>

            <div className="rain-bar-slider">
              <div className="rain-bar-time">
                <strong>Sadetutka</strong>
                <span>{selectedRadarFrame ? `${formatRadarTime(selectedRadarFrame.time)} · Zoom lukittu` : "Ladataan..."}</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(0, radarFrames.length - 1)}
                value={radarIndex}
                onChange={(event) => {
                  setRadarPlaying(false);
                  setRadarIndex(Number(event.target.value));
                }}
                disabled={!radarFrames.length}
              />
            </div>

            <div className="rain-bar-legend" aria-label="Sadeasteikko">
              <span className="rain-dot rain-dot-light" title="Heikko sade"></span>
              <span className="rain-dot rain-dot-medium" title="Kohtalainen sade"></span>
              <span className="rain-dot rain-dot-heavy" title="Kova sade"></span>
              <span className="rain-dot rain-dot-very-heavy" title="Erittäin kova sade"></span>
            </div>
          </div>
        </div>
      )}
<MapContainer
        key={selectedArea}
        center={rainMode ? activeRadarArea.center : center}
        zoom={rainMode ? activeRadarArea.zoom : 8}
        minZoom={rainMode ? RADAR_MIN_ZOOM : 7}
        maxZoom={rainMode ? RADAR_MAX_ZOOM : 18}
        maxBounds={rainMode ? activeRadarArea.bounds : mapBounds}
        className="map"
        zoomControl={false}
      >
        <MapMover
          lat={selectedPlace?.lat}
          lon={selectedPlace?.lon}
          centerLat={center?.[0]}
          centerLon={center?.[1]}
          moveKey={selectedMoveKey}
          areaMoveKey={areaMoveKey}
          areaZoom={activeArea.zoom}
        />

        <MapSizeFixer triggerKey={`${selectedArea}-${selectedTimeKey}-${showPanel}-${mapRefreshKey}-${rainMode}`} />

        <SafeRadarZoom enabled={rainMode} activeRadarArea={activeRadarArea} />

        <TileLayer
          className={rainMode ? "normal-map-base-hidden" : ""}
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          keepBuffer={6}
          updateWhenIdle={false}
          updateWhenZooming={false}
          maxNativeZoom={19}
        />

        {rainMode && (
          <TileLayer
            className="radar-base-layer"
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            minZoom={RADAR_MIN_ZOOM}
            maxZoom={RADAR_MAX_ZOOM}
            maxNativeZoom={RADAR_MAX_ZOOM}
            bounds={activeRadarArea.bounds}
            noWrap={true}
            keepBuffer={1}
            updateWhenIdle={true}
            updateWhenZooming={false}
          />
        )}

        {radarTileUrl && (
          <TileLayer
            key={radarTileUrl}
            url={radarTileUrl}
            opacity={0.84}
            zIndex={650}
            minZoom={RADAR_MIN_ZOOM}
            maxZoom={RADAR_MAX_ZOOM}
            maxNativeZoom={RADAR_MAX_ZOOM}
            minNativeZoom={RADAR_MIN_ZOOM}
            tileSize={256}
            bounds={activeRadarArea.bounds}
            noWrap={true}
            keepBuffer={1}
            updateWhenIdle={true}
            updateWhenZooming={false}
            attribution='Sadetutka &copy; <a href="https://www.rainviewer.com/">RainViewer</a>'
          />
        )}

        {!rainMode && showColorAreas &&
          points.map((point) => {
            const color = getColor(point);
            return (
              <Circle
                key={`area-${point.name}-${point.lat}-${point.lon}`}
                center={[point.lat, point.lon]}
                radius={18000}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.085,
                  weight: 0,
                  opacity: 0
                }}
                interactive={false}
              />
            );
          })}

        {!rainMode && points.map((point, index) => {
          const color = getColor(point);
          return (
            <CircleMarker
              key={`${point.name}-${point.lat}-${point.lon}-${index}`}
              center={[point.lat, point.lon]}
              radius={largeMapPoints ? 9 : 6}
              eventHandlers={{
                click: () => selectMapPoint(point)
              }}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.95,
                weight: 1
              }}
            >
              {showNames && (
                <Tooltip permanent direction="top" offset={[0, -4]} className="city-label">
                  {point.name}
                </Tooltip>
              )}

              <Popup>
                <div className="popup">
                  <strong>{point.name}</strong>
                  <p>{point.ok ? "✅ Pinnoitus onnistuu" : "❌ Pinnoitus ei onnistu"}</p>
                  <p>Lämpö: {point.weather?.temp ?? "-"} °C</p>
                  <p>Kosteus: {point.weather?.humidity ?? "-"} %</p>
                  <p>Tuuli: {point.weather?.wind?.toFixed?.(1) ?? point.weather?.wind ?? "-"} m/s</p>
                  <p>Sade: {point.weather?.precipitation ?? "-"} mm/h</p>
                  <p>Etäisyys Nurmijärveltä: {point.distanceKm ?? "-"} km</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
{userLocation && (
          <>
            <Circle
              center={[userLocation.lat, userLocation.lon]}
              radius={250}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#60a5fa",
                fillOpacity: 0.18,
                weight: 1.2
              }}
            />
            <CircleMarker
              center={[userLocation.lat, userLocation.lon]}
              radius={8}
              pathOptions={{
                color: "#1d4ed8",
                fillColor: "#3b82f6",
                fillOpacity: 1,
                weight: 2
              }}
            >
              {!rainMode && (
                <Popup>
                  <div className="popup">
                    <strong>Oma sijainti</strong>
                    <p>Voit hakea ennusteen tälle sijainnille.</p>
                  </div>
                </Popup>
              )}
            </CircleMarker>
          </>
        )}

        {selectedPlace && hasValidCoordinates(selectedPlace) && (
          <CircleMarker
            center={[selectedPlace.lat, selectedPlace.lon]}
            radius={10}
            pathOptions={{
              color: "#0f4c81",
              fillColor: "#2563eb",
              fillOpacity: 1,
              weight: 3
            }}
          >
            {!rainMode && (
              <Popup>
                <div className="popup">
                  <strong>{selectedPlace.name}</strong>
                  <p>{selectedPlace.ok ? "✅ Pinnoitus onnistuu" : "❌ Pinnoitus ei onnistu"}</p>
                  <p>Lämpö: {selectedPlace.weather?.temp ?? "-"} °C</p>
                  <p>Kosteus: {selectedPlace.weather?.humidity ?? "-"} %</p>
                  <p>Tuuli: {selectedPlace.weather?.wind?.toFixed?.(1) ?? selectedPlace.weather?.wind ?? "-"} m/s</p>
                  <p>Sade: {selectedPlace.weather?.precipitation ?? "-"} mm/h</p>
                  <p>Etäisyys Nurmijärveltä: {selectedPlace.distanceKm ?? "-"} km</p>
                </div>
              </Popup>
            )}
          </CircleMarker>
        )}
      </MapContainer>

      {timelineDays.length > 0 && (
        <div className="timeline-card">
          <div className="timeline-days">
            {timelineDays.map((day) => (
              <button
                key={day.key}
                className={day.key === selectedDayKey ? "active" : ""}
                onClick={() => setSelectedTimeKey(day.items[0].time)}
              >
                {day.label}
              </button>
            ))}
          </div>

          <div className="timeline-hours">
            {selectedDay?.items.map((item) => (
              <button
                key={item.time}
                className={`timeline-hour ${item.time === selectedTimeKey ? "active" : ""}`}
                onClick={() => setSelectedTimeKey(item.time)}
              >
                <span>{formatHour(item.time)}</span>
                <small>{Math.round((item.okCount / Math.max(item.totalCount, 1)) * 100)}% OK</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {showPanel && (
        <div className="panel-overlay">
          <aside className="sidebar fullscreen">
            <div className="sidebar-top">
              <div>
                <div className="sidebar-title">Sääennuste</div>
                <div className="sidebar-subtitle">
                  Hae paikka tai paina kartan pistettä. {selectedArea === "pirkanmaa" ? "Kartalla näkyy Tampereen 150 km alue." : "Kartalla näkyy Nurmijärven 150 km alue."}
                </div>
              </div>
              <button className="close-panel-button" onClick={() => setShowPanel(false)}>
                Sulje
              </button>
            </div>

            <form className="search-card" onSubmit={searchCity}>
              <div className="search-row">
                <div className="search-input-wrap">
                  <input
                    ref={inputRef}
                    value={city}
                    onChange={(event) => {
                      setCity(event.target.value);
                      setShowSuggestions(event.target.value.trim().length >= 2);
                    }}
                    onFocus={() => {
                      if (city.trim().length >= 2 && suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 180);
                    }}
                    placeholder="Hae paikkakunta, esim. Nurmijärvi"
                  />

                  {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestions-list">
                      {suggestions.map((suggestion) => (
                        <button
                          type="button"
                          key={`${suggestion.name}-${suggestion.lat}-${suggestion.lon}`}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            chooseSuggestion(suggestion);
                          }}
                        >
                          <strong>{suggestion.name}</strong>
                          <span>{suggestion.distanceKm} km aluekeskuksesta</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {suggestionsLoading && city.trim().length >= 2 && (
                    <div className="suggestions-loading">Haetaan ehdotuksia...</div>
                  )}
                </div>

                <button type="submit" disabled={searchLoading}>
                  {searchLoading ? "..." : "Hae"}
                </button>
              </div>

              <button
                type="button"
                className="location-search-button"
                onClick={useOwnLocation}
                disabled={locating}
              >
                {locating ? "Haetaan omaa sijaintia..." : "Käytä omaa sijaintia"}
              </button>
            </form>

            <section className="summary-strip">
              <Stat label="Paikkoja kartalla" value={forecast?.placeCount ?? "-"} />
              <Stat label="Rajaus" value={selectedArea === "pirkanmaa" ? "150 km Tampereelta" : "150 km Nurmijärveltä"} />
            </section>

            {selectedPlace ? (
              <section className="forecast-panel">
                <div className="forecast-panel-head">
                  <div>
                    <div className="selected-place-name">{selectedPlace.name}</div>
                    <div className={`status-pill ${coatingClass(selectedPlace)}`}>
                      {selectedPlace.ok ? "Pinnoitus onnistuu" : "Pinnoitus ei onnistu"}
                    </div>
                    <div className="forecast-source">
                      Sääennusteen lähde: {forecastSource || selectedPlace.source || "Open-Meteo"}
                    </div>
                  </div>
                  <button className="secondary-button" type="button" onClick={clearSelection}>
                    Poista valinta
                  </button>
                </div>

                <div className={`current-forecast-box large ${coatingClass(selectedPlace)}`}>
                  <div className="current-icon">{getWeatherIcon(selectedPlace.weather)}</div>
                  <div className="current-main">
                    <div className="current-label">Nykyhetken ennuste</div>
                    <div className="current-temp">{selectedPlace.weather?.temp ?? "-"} °C</div>
                  </div>
                  <div className="current-details">
                    <div className="detail-pill">Kosteus {selectedPlace.weather?.humidity ?? "-"} %</div>
                    <div className="detail-pill">
                      Tuuli {selectedPlace.weather?.wind?.toFixed?.(1) ?? selectedPlace.weather?.wind ?? "-"} m/s
                    </div>
                    <div className="detail-pill">Sade {selectedPlace.weather?.precipitation ?? "-"} mm/h</div>
                    <div className="detail-pill">Etäisyys Nurmijärveltä {selectedPlace.distanceKm ?? "-"} km</div>
                  </div>
                </div>

                {visibleHourlyForecast.length > 0 && (
                  <div className="forecast-sections">
                    {visibleHourlyForecast.map((group) => (
                      <div className="forecast-day-card" key={group.key}>
                        <div className="forecast-day-title">{group.label}</div>
                        <div className="weather-table">
                          <div className="weather-table-head">
                            <span>Aika</span>
                            <span>Sää</span>
                            <span>Lämpö</span>
                            <span>Sade</span>
                            <span>Kosteus</span>
                            <span>Tuuli</span>
                          </div>

                          {group.rows.map((row) => (
                            <div
                              className={`weather-table-row ${coatingClass(row)}`}
                              key={row.time}
                            >
                              <span className="time-cell">
                                <strong>{formatHour(row.time)}</strong>
                              </span>
                              <span className="table-icon">{getWeatherIcon(row.weather)}</span>
                              <span className="temp-cell">{row.weather?.temp ?? "-"} °C</span>
                              <span className="rain-cell">
                                {(row.weather?.precipitation ?? 0) > 0 ? `${row.weather?.precipitation} mm` : "Ei"}
                              </span>
                              <span>{row.weather?.humidity ?? "-"} %</span>
                              <span>{row.weather?.wind?.toFixed?.(1) ?? row.weather?.wind ?? "-"} m/s</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <section className="empty-state">
                <div className="empty-state-title">Valitse paikka</div>
                <p>
                  Hae paikkakunta tai paina kartan pistettä. Saat näkyviin suuremman sääennusteen
                  sekä pinnoituskelin helposti luettavassa muodossa.
                </p>
              </section>
            )}

            <section className="settings-card">
              <button
                type="button"
                className="settings-toggle"
                onClick={() => setShowSettings((value) => !value)}
              >
                ⚙️ Asetukset
              </button>

              {showSettings && (
                <div className="settings-content">
                  <div className="setting-group">
                    <div className="setting-label">Alue</div>
                    <div className="area-selector">
                      <button
                        type="button"
                        className={selectedArea === "uusimaa" ? "active" : ""}
                        onClick={() => { setAutoAreaMessage(""); selectedArea !== "uusimaa" && setSelectedArea("uusimaa"); }}
                      >
                        Uusimaa
                      </button>
                      <button
                        type="button"
                        className={selectedArea === "pirkanmaa" ? "active" : ""}
                        onClick={() => { setAutoAreaMessage(""); selectedArea !== "pirkanmaa" && setSelectedArea("pirkanmaa"); }}
                      >
                        Pirkanmaa
                      </button>
                    </div>
                  </div>

                  <label className="switch-row">
                    <input
                      type="checkbox"
                      checked={showColorAreas}
                      onChange={(event) => setShowColorAreas(event.target.checked)}
                    />
                    <span>Näytä koko kartan värialueet</span>
                  </label>

                  <label className="switch-row">
                    <input
                      type="checkbox"
                      checked={showRadar}
                      onChange={(event) => setShowRadar(event.target.checked)}
                    />
                    <span>Näytä sadetutka</span>
                  </label>

                  <label className="switch-row">
                    <input
                      type="checkbox"
                      checked={showNames}
                      onChange={(event) => setShowNames(event.target.checked)}
                    />
                    <span>Näytä paikkakuntien nimet</span>
                  </label>

                  <label className="switch-row">
                    <input
                      type="checkbox"
                      checked={showNightForecast}
                      onChange={(event) => setShowNightForecast(event.target.checked)}
                    />
                    <span>Näytä myös yötunnit ennusteessa</span>
                  </label>

                  <label className="switch-row">
                    <input
                      type="checkbox"
                      checked={largeMapPoints}
                      onChange={(event) => setLargeMapPoints(event.target.checked)}
                    />
                    <span>Isommat karttapisteet</span>
                  </label>
{showRadar && (
                    <div className="radar-controls">
                      <div className="radar-actions">
                        <button
                          type="button"
                          onClick={() => setRadarPlaying((value) => !value)}
                          disabled={!radarFrames.length}
                        >
                          {radarPlaying ? "Tauko" : "Toista"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setRadarIndex((current) =>
                              current <= 0 ? radarFrames.length - 1 : current - 1
                            )
                          }
                          disabled={!radarFrames.length}
                        >
                          ◀
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setRadarIndex((current) => (current + 1) % radarFrames.length)
                          }
                          disabled={!radarFrames.length}
                        >
                          ▶
                        </button>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max={Math.max(0, radarFrames.length - 1)}
                        value={radarIndex}
                        onChange={(event) => setRadarIndex(Number(event.target.value))}
                        disabled={!radarFrames.length}
                      />

                      <p className="radar-time">
                        {selectedRadarFrame
                          ? `Tutka: ${formatRadarTime(selectedRadarFrame.time)}`
                          : "Tutkaa ladataan..."}
                      </p>

                      {radarError && <p className="error-box">{radarError}</p>}
                    </div>
                  )}
                </div>
              )}
            </section>

            {loadingMap && <div className="empty-state">Ladataan säädataa... Ensimmäinen lataus voi kestää, seuraavat lataukset ovat nopeampia.</div>}
            {errorText && <div className="error-box">{errorText}</div>}
          </aside>
        </div>
      )}
    </div>
  );
}
