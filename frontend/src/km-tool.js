const HALL_ADDRESS = "Ilvesvuorenkatu 25, Nurmijärvi";
const AREA_KEY = "kattosaa-area-for-km";
let panel = null;
let observer = null;
let bootDone = false;

function injectStyles() {
  if (document.getElementById("km-tool-styles")) return;
  const style = document.createElement("style");
  style.id = "km-tool-styles";
  style.textContent = `
    .km-panel-backdrop{position:fixed;inset:0;z-index:5000;display:grid;place-items:center;padding:16px;background:rgba(15,23,42,.45)}
    .km-panel{width:min(520px,calc(100vw - 28px));max-height:calc(100vh - 28px);overflow:auto;border-radius:22px;background:#fff;color:#111827;padding:18px;box-shadow:0 24px 70px rgba(15,23,42,.35)}
    .km-panel-head{display:flex;justify-content:space-between;gap:12px;margin-bottom:14px}.km-panel-title{font-size:22px;font-weight:950}.km-panel-subtitle,.km-muted{color:#64748b;font-size:13px;font-weight:700}
    .km-close-button,.km-add-button,.km-calc-button,.km-copy-button,.km-remove-stop,.km-maps-link{border:0;border-radius:12px;font-weight:900;cursor:pointer}.km-close-button{width:38px;height:38px;background:#f3f4f6}
    .km-stop-row{display:grid;gap:7px;margin-top:12px}.km-stop-row label{font-size:13px;font-weight:900}.km-stop-row div{display:grid;grid-template-columns:1fr auto;gap:8px}.km-stop-row input{min-height:44px;border-radius:12px;border:1px solid rgba(148,163,184,.45);padding:10px 12px;font-size:15px}.km-remove-stop{padding:0 12px;background:#fee2e2;color:#991b1b}
    .km-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.km-add-button,.km-calc-button,.km-copy-button,.km-maps-link{min-height:44px;padding:10px 12px}.km-add-button,.km-maps-link{background:#f3f4f6;color:#111827;text-decoration:none;text-align:center;display:grid;place-items:center}.km-calc-button,.km-copy-button{background:#1f2937;color:white}
    .km-result{margin-top:14px}.km-distance{font-size:28px;font-weight:950}.km-copy-text{margin:10px 0;padding:12px;border-radius:12px;background:#f8fafc;border:1px solid rgba(148,163,184,.35);white-space:pre-wrap}.km-error{margin-top:12px;padding:10px 12px;border-radius:12px;background:#fee2e2;color:#991b1b;font-weight:800}
    .topbar-actions button[data-icon-ready="true"]{font-size:0!important;min-width:38px!important;padding:8px 10px!important}
    .topbar-actions button[data-icon-ready="true"]::before{font-size:18px!important;line-height:1!important;display:inline-block}
    .topbar-actions button[data-topbar-icon="location"]::before{content:"⌖"}
    .topbar-actions button[data-topbar-icon="rain"]::before{content:"☔"}
    .topbar-actions button[data-topbar-icon="refresh"]::before{content:"↻"}
    .topbar-actions button[data-topbar-icon="forecast"]::before{content:"▤"}
    .topbar-actions button[data-topbar-icon="km"]::before{content:"🚗"}
    @media(max-width:760px){.km-panel-backdrop{align-items:end;padding:10px}.km-panel{width:100%;border-radius:20px}.km-actions{grid-template-columns:1fr}.topbar-actions{justify-content:center!important;gap:6px!important}.topbar-actions button[data-icon-ready="true"]{min-height:36px!important;min-width:40px!important;border-radius:12px!important}}
  `;
  document.head.appendChild(style);
}

function rememberArea(text) {
  const value = String(text || "").trim().toLowerCase();
  if (value === "pirkanmaa") sessionStorage.setItem(AREA_KEY, "pirkanmaa");
  if (value === "uusimaa") sessionStorage.setItem(AREA_KEY, "uusimaa");
}

function detectArea() {
  const active = document.querySelector(".area-selector button.active")?.textContent || "";
  if (/pirkanmaa/i.test(active)) return "pirkanmaa";
  if (/uusimaa/i.test(active)) return "uusimaa";

  const text = document.body?.innerText || "";
  if (text.includes("Tampereen 150 km alue") || text.includes("150 km Tampereelta")) return "pirkanmaa";
  if (text.includes("Nurmijärven 150 km alue") || text.includes("150 km Nurmijärveltä")) return "uusimaa";

  return sessionStorage.getItem(AREA_KEY) || "uusimaa";
}

function isUusimaaMode() {
  return detectArea() === "uusimaa";
}

function iconizeTopbar() {
  const buttons = Array.from(document.querySelectorAll(".topbar-actions button"));
  for (const button of buttons) {
    const text = button.textContent.trim();
    button.dataset.iconReady = "true";
    if (text.includes("Oma sijainti") || text.includes("Haetaan sijaintia")) {
      button.dataset.topbarIcon = "location";
      button.title = text;
      button.setAttribute("aria-label", text);
    } else if (text.includes("Sade") || text.includes("Tutka") || text.includes("Pinnoituskartta")) {
      button.dataset.topbarIcon = "rain";
      button.title = text;
      button.setAttribute("aria-label", text);
    } else if (text.includes("Päivitä")) {
      button.dataset.topbarIcon = "refresh";
      button.title = text;
      button.setAttribute("aria-label", text);
    } else if (text.includes("Avaa ennuste")) {
      button.dataset.topbarIcon = "forecast";
      button.title = text;
      button.setAttribute("aria-label", text);
    }
  }
}

function updateKmButtonVisibility() {
  const actions = document.querySelector(".topbar-actions");
  if (!actions) return;

  iconizeTopbar();

  let button = document.querySelector(".km-button");
  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.className = "ghost-location-button km-button";
    button.textContent = "KM";
    button.dataset.iconReady = "true";
    button.dataset.topbarIcon = "km";
    button.title = "KM-laskuri";
    button.setAttribute("aria-label", "KM-laskuri");
    button.addEventListener("click", openPanel);
    actions.appendChild(button);
  }

  const show = isUusimaaMode();
  button.hidden = !show;
  button.style.display = show ? "" : "none";
  if (!show && panel) closePanel();
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
  injectStyles();
  updateKmButtonVisibility();
  if (!isUusimaaMode() || panel) return;
  panel = document.createElement("div");
  panel.className = "km-panel-backdrop";
  panel.innerHTML = `<div class="km-panel"><div class="km-panel-head"><div><div class="km-panel-title">KM-laskuri</div><div class="km-panel-subtitle">Lähtö ja paluu: ${HALL_ADDRESS}</div></div><button type="button" class="km-close-button">×</button></div><div class="km-stops"></div><div class="km-actions"><button type="button" class="km-add-button">Lisää pysähdys</button><button type="button" class="km-calc-button">Laske kilometrit</button></div><div class="km-result"></div><div class="km-error" style="display:none"></div><div class="km-muted">Kilometrit lasketaan tieverkkoa pitkin. Google Maps -linkki avautuu tarkistusta varten.</div></div>`;
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
  injectStyles();
  updateKmButtonVisibility();
  if (!observer && document.body) {
    observer = new MutationObserver(updateKmButtonVisibility);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
  }
  if (!bootDone) {
    bootDone = true;
    window.addEventListener("click", (event) => {
      const text = event.target?.closest?.("button")?.textContent || "";
      rememberArea(text);
      setTimeout(updateKmButtonVisibility, 80);
      setTimeout(updateKmButtonVisibility, 400);
    }, true);
  }
}

if (typeof window !== "undefined") {
  window.setTimeout(boot, 300);
  window.setTimeout(boot, 1000);
  window.setTimeout(boot, 2200);
}

export {};