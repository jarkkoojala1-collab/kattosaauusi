const HALL_ADDRESS = "Ilvesvuorenkatu 25, Nurmijärvi";
let panel = null;
let observer = null;

function isUusimaaMode() {
  const activePirkanmaa = document.querySelector(".area-selector button.active")?.textContent?.includes("Pirkanmaa");
  const text = document.body?.innerText || "";
  if (activePirkanmaa || text.includes("Tampereen 150 km alue")) return false;
  return true;
}

function updateKmButtonVisibility() {
  const actions = document.querySelector(".topbar-actions");
  if (!actions) return;

  let button = document.querySelector(".km-button");
  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.className = "ghost-location-button km-button";
    button.textContent = "KM";
    button.addEventListener("click", openPanel);
    actions.appendChild(button);
  }

  button.style.display = isUusimaaMode() ? "" : "none";
}

function kmText(stops) {
  return [HALL_ADDRESS, ...stops, HALL_ADDRESS]
    .filter(Boolean)
    .map((item) => `- ${item}`)
    .join("\n");
}

function googleMapsUrl(stops) {
  const allStops = [HALL_ADDRESS, ...stops, HALL_ADDRESS].map(encodeURIComponent);
  return `https://www.google.com/maps/dir/${allStops.join("/")}`;
}

async function geocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await response.json();
  if (!data?.[0]) throw new Error(`Osoitetta ei löytynyt: ${address}`);
  return [Number(data[0].lon), Number(data[0].lat)];
}

async function routeDistanceKm(stops) {
  const coords = [];
  for (const address of [HALL_ADDRESS, ...stops, HALL_ADDRESS]) {
    coords.push(await geocode(address));
  }
  const coordinateString = coords.map((coord) => coord.join(",")).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinateString}?overview=false`;
  const response = await fetch(url);
  const data = await response.json();
  if (!data?.routes?.[0]) throw new Error("Reittiä ei voitu laskea.");
  return Math.round(data.routes[0].distance / 1000);
}

function getStops() {
  return Array.from(panel.querySelectorAll(".km-stop-input"))
    .map((input) => input.value.trim())
    .filter(Boolean);
}

function addStop(value = "") {
  const list = panel.querySelector(".km-stops");
  const index = list.children.length + 1;
  const row = document.createElement("div");
  row.className = "km-stop-row";
  row.innerHTML = `<label>Työmaan osoite ${index}</label><div><input class="km-stop-input" value="${value.replace(/"/g, "&quot;")}" placeholder="Syötä osoite"><button type="button" class="km-remove-stop">Poista</button></div>`;
  row.querySelector(".km-remove-stop").addEventListener("click", () => row.remove());
  list.appendChild(row);
}

function renderResult(distanceKm, stops) {
  const result = panel.querySelector(".km-result");
  const copy = kmText(stops);
  result.innerHTML = `<div class="km-distance">${distanceKm} km</div><div class="km-copy-text">${copy}</div><button type="button" class="km-copy-button">Kopioi osoitteet</button><a class="km-maps-link" target="_blank" rel="noreferrer" href="${googleMapsUrl(stops)}">Avaa Google Mapsissa</a>`;
  result.querySelector(".km-copy-button").addEventListener("click", async () => {
    await navigator.clipboard.writeText(copy);
    result.querySelector(".km-copy-button").textContent = "Kopioitu";
  });
}

function openPanel() {
  if (panel) return;
  panel = document.createElement("div");
  panel.className = "km-panel-backdrop";
  panel.innerHTML = `<div class="km-panel"><div class="km-panel-head"><div><div class="km-panel-title">KM-laskuri</div><div class="km-panel-subtitle">Lähtö ja paluu: ${HALL_ADDRESS}</div></div><button type="button" class="km-close-button">×</button></div><div class="km-stops"></div><div class="km-actions"><button type="button" class="km-add-button">Lisää pysähdys</button><button type="button" class="km-calc-button">Laske kilometrit</button></div><div class="km-result"></div><div class="km-error" style="display:none"></div><div class="km-muted">Kilometrit lasketaan tieverkkoa pitkin. Tarkista tarvittaessa Google Maps -linkistä.</div></div>`;
  document.body.appendChild(panel);
  panel.querySelector(".km-close-button").addEventListener("click", closePanel);
  panel.querySelector(".km-add-button").addEventListener("click", () => addStop());
  panel.querySelector(".km-calc-button").addEventListener("click", calculate);
  panel.addEventListener("click", (event) => { if (event.target === panel) closePanel(); });
  addStop();
}

function closePanel() {
  panel?.remove();
  panel = null;
}

async function calculate() {
  const error = panel.querySelector(".km-error");
  const button = panel.querySelector(".km-calc-button");
  const stops = getStops();
  error.style.display = "none";
  if (!stops.length) {
    error.textContent = "Lisää vähintään yksi työmaan osoite.";
    error.style.display = "block";
    return;
  }
  try {
    button.textContent = "Lasketaan...";
    button.disabled = true;
    const km = await routeDistanceKm(stops);
    renderResult(km, stops);
  } catch (err) {
    error.textContent = err.message || "Kilometrien laskenta epäonnistui.";
    error.style.display = "block";
  } finally {
    button.textContent = "Laske kilometrit";
    button.disabled = false;
  }
}

function boot() {
  updateKmButtonVisibility();
  if (!observer && document.body) {
    observer = new MutationObserver(updateKmButtonVisibility);
    observer.observe(document.body, { childList: true, subtree: true });
  }
  window.addEventListener("click", () => setTimeout(updateKmButtonVisibility, 50), true);
}

if (typeof window !== "undefined") {
  window.setTimeout(boot, 400);
  window.setTimeout(boot, 1400);
}

export {};
