import React from "react";
import ReactDOM from "react-dom/client";
import KmTool from "./KmTool.jsx";

const AREA_KEY = "kattosaa-km-selected-area";
let root = null;
let mountNode = null;
let observer = null;
let booted = false;

function injectKmStyles() {
  if (document.getElementById("km-react-styles")) return;

  const style = document.createElement("style");
  style.id = "km-react-styles";
  style.textContent = `
    .km-react-button .mobile-label { display: none; }
    .km-react-backdrop {
      position: fixed;
      inset: 0;
      z-index: 5000;
      display: grid;
      place-items: center;
      padding: 16px;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(8px);
    }
    .km-react-panel {
      width: min(520px, calc(100vw - 28px));
      max-height: calc(100vh - 28px);
      overflow: auto;
      padding: 18px;
      border-radius: 22px;
      background: #ffffff;
      color: #111827;
      box-shadow: 0 24px 70px rgba(15, 23, 42, 0.35);
    }
    .km-react-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }
    .km-react-head h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 950;
    }
    .km-react-head p,
    .km-react-panel p {
      margin: 4px 0 0;
      color: #64748b;
      font-size: 13px;
      font-weight: 700;
    }
    .km-react-close,
    .km-react-actions button,
    .km-react-stop button,
    .km-react-actions a {
      border: 0;
      border-radius: 12px;
      font-weight: 900;
      cursor: pointer;
      text-decoration: none;
    }
    .km-react-close {
      width: 38px;
      height: 38px;
      background: #f3f4f6;
      color: #111827;
      font-size: 22px;
    }
    .km-react-stop {
      display: grid;
      gap: 7px;
      margin-top: 12px;
      font-size: 13px;
      font-weight: 900;
    }
    .km-react-stop div {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
    }
    .km-react-stop input {
      min-height: 44px;
      border-radius: 12px;
      border: 1px solid rgba(148, 163, 184, 0.45);
      padding: 10px 12px;
      font-size: 15px;
    }
    .km-react-stop button {
      padding: 0 12px;
      background: #fee2e2;
      color: #991b1b;
    }
    .km-react-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 14px;
    }
    .km-react-actions button,
    .km-react-actions a {
      min-height: 44px;
      padding: 10px 12px;
      display: grid;
      place-items: center;
      background: #f3f4f6;
      color: #111827;
    }
    .km-react-actions .primary {
      background: #1f2937;
      color: #ffffff;
    }
    .km-react-error {
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 12px;
      background: #fee2e2;
      color: #991b1b;
      font-weight: 800;
    }
    .km-react-result {
      margin-top: 14px;
    }
    .km-react-result strong {
      display: block;
      font-size: 28px;
      font-weight: 950;
      letter-spacing: -0.04em;
    }
    .km-react-result pre {
      margin: 10px 0 0;
      padding: 12px;
      border-radius: 12px;
      background: #f8fafc;
      border: 1px solid rgba(148, 163, 184, 0.35);
      white-space: pre-wrap;
      font-family: inherit;
      font-size: 14px;
    }
    @media (max-width: 760px) {
      .km-react-button .desktop-label { display: none; }
      .km-react-button .mobile-label { display: inline; }
      .km-react-button {
        min-width: 40px !important;
        padding-left: 10px !important;
        padding-right: 10px !important;
      }
      .km-react-backdrop {
        align-items: end;
        padding: 10px;
      }
      .km-react-panel {
        width: 100%;
        border-radius: 20px 20px 12px 12px;
      }
      .km-react-actions,
      .km-react-stop div {
        grid-template-columns: 1fr;
      }
      .km-react-stop button {
        min-height: 40px;
      }
    }
  `;
  document.head.appendChild(style);
}

function rememberAreaFromClick(event) {
  const button = event.target?.closest?.("button");
  const text = button?.textContent?.trim().toLowerCase() || "";

  if (text === "pirkanmaa") sessionStorage.setItem(AREA_KEY, "pirkanmaa");
  if (text === "uusimaa") sessionStorage.setItem(AREA_KEY, "uusimaa");

  window.setTimeout(renderKmTool, 120);
}

function detectArea() {
  const activeButton = document.querySelector(".area-selector button.active")?.textContent?.trim().toLowerCase() || "";
  if (activeButton.includes("pirkanmaa")) return "pirkanmaa";
  if (activeButton.includes("uusimaa")) return "uusimaa";

  const text = document.body?.innerText || "";
  if (text.includes("Tampereen 150 km alue") || text.includes("Pirkanmaa")) return "pirkanmaa";
  if (text.includes("Nurmijärven 150 km alue") || text.includes("Uusimaa")) return "uusimaa";

  return sessionStorage.getItem(AREA_KEY) || "uusimaa";
}

function ensureMountNode() {
  const actions = document.querySelector(".topbar-actions");
  if (!actions) return null;

  if (mountNode && actions.contains(mountNode)) return mountNode;

  mountNode = document.createElement("span");
  mountNode.className = "km-react-mount";
  actions.appendChild(mountNode);
  root = ReactDOM.createRoot(mountNode);

  return mountNode;
}

function renderKmTool() {
  try {
    injectKmStyles();
    const node = ensureMountNode();
    if (!node || !root) return;

    root.render(<KmTool selectedArea={detectArea()} />);
  } catch (error) {
    console.warn("KM-työkalua ei voitu ladata", error);
  }
}

function bootKmTool() {
  try {
    renderKmTool();

    if (!booted) {
      booted = true;
      window.addEventListener("click", rememberAreaFromClick, true);
    }

    if (!observer && document.body) {
      observer = new MutationObserver(renderKmTool);
      observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    }
  } catch (error) {
    console.warn("KM-työkalun käynnistys ohitettiin", error);
  }
}

if (typeof window !== "undefined") {
  window.setTimeout(bootKmTool, 500);
  window.setTimeout(renderKmTool, 1600);
  window.setTimeout(renderKmTool, 3200);
}
