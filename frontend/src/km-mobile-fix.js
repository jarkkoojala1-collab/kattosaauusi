const KM_AREA_KEY = "kattosaa-km-area";

function injectKmMobileFixStyles() {
  if (document.getElementById("km-mobile-fix-styles")) return;
  const style = document.createElement("style");
  style.id = "km-mobile-fix-styles";
  style.textContent = `
    @media (max-width: 760px) {
      .topbar {
        left: 50% !important;
        right: auto !important;
        transform: translateX(-50%) !important;
        width: min(94vw, 440px) !important;
        padding: 7px !important;
        border-radius: 18px !important;
      }
      .topbar-actions {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        gap: 6px !important;
        flex-wrap: wrap !important;
        width: 100% !important;
      }
      .topbar-actions button,
      .open-panel-button {
        min-height: 38px !important;
        padding: 8px 10px !important;
        font-size: 11px !important;
        white-space: nowrap !important;
      }
      .panel-overlay {
        padding: 10px !important;
        align-items: flex-end !important;
      }
      .panel-overlay .sidebar {
        width: 100% !important;
        max-height: calc(100vh - 20px) !important;
        padding: 14px !important;
        border-radius: 20px 20px 12px 12px !important;
      }
      .search-row {
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 8px !important;
      }
      .search-row button,
      .location-search-button {
        width: 100% !important;
        min-height: 42px !important;
      }
      .search-input-wrap input {
        width: 100% !important;
        min-height: 44px !important;
      }
      .timeline-card {
        left: 50% !important;
        right: auto !important;
        transform: translateX(-50%) !important;
        width: min(94vw, 520px) !important;
      }
      .timeline-days,
      .timeline-hours {
        justify-content: center !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function rememberAreaFromClick(event) {
  const button = event.target?.closest?.("button");
  const text = button?.textContent?.trim().toLowerCase() || "";
  if (text === "pirkanmaa") sessionStorage.setItem(KM_AREA_KEY, "pirkanmaa");
  if (text === "uusimaa") sessionStorage.setItem(KM_AREA_KEY, "uusimaa");
  window.setTimeout(updateKmVisibility, 60);
}

function detectCurrentArea() {
  const active = document.querySelector(".area-selector button.active")?.textContent?.trim().toLowerCase() || "";
  if (active.includes("pirkanmaa")) return "pirkanmaa";
  if (active.includes("uusimaa")) return "uusimaa";

  const text = document.body?.innerText || "";
  if (text.includes("Tampereen 150 km alue")) return "pirkanmaa";
  if (text.includes("Nurmijärven 150 km alue")) return "uusimaa";

  return sessionStorage.getItem(KM_AREA_KEY) || "uusimaa";
}

function updateKmVisibility() {
  const kmButton = document.querySelector(".km-button");
  if (!kmButton) return;

  const show = detectCurrentArea() === "uusimaa";
  kmButton.hidden = !show;
  kmButton.style.display = show ? "" : "none";

  const kmPanel = document.querySelector(".km-panel-backdrop");
  if (!show && kmPanel) kmPanel.remove();
}

function bootKmMobileFix() {
  injectKmMobileFixStyles();
  updateKmVisibility();
  window.addEventListener("click", rememberAreaFromClick, true);

  const observer = new MutationObserver(updateKmVisibility);
  if (document.body) observer.observe(document.body, { childList: true, subtree: true, attributes: true });
}

if (typeof window !== "undefined") {
  window.setTimeout(bootKmMobileFix, 500);
  window.setTimeout(updateKmVisibility, 1500);
  window.setTimeout(updateKmVisibility, 3000);
}

export {};