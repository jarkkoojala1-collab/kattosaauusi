function styleRainPanelBackButton(button) {
  Object.assign(button.style, {
    width: "42px",
    height: "42px",
    minWidth: "42px",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    borderRadius: "14px",
    background: "#f8fafc",
    color: "#111827",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    marginRight: "10px",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)",
    flex: "0 0 auto"
  });
}

function ensureRainPanelBackButton() {
  const shell = document.querySelector(".app-shell");
  const panel = document.querySelector(".rain-bottom-bar.mobile-rain-bar");
  const header = panel?.querySelector(".rain-mobile-header");
  const titleBlock = header?.firstElementChild;
  const radarButton = document.querySelector(".topbar-actions .radar-mode-button");

  if (!shell?.classList.contains("rain-mode-active") || !panel || !header || !titleBlock) {
    document.querySelector(".rain-panel-back-button")?.remove();
    return;
  }

  let backButton = header.querySelector(".rain-panel-back-button");
  if (!backButton) {
    backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "rain-panel-back-button";
    backButton.setAttribute("aria-label", "Edellinen");
    backButton.title = "Edellinen";
    backButton.innerHTML = "<svg viewBox=\"0 0 64 64\" width=\"24\" height=\"24\" aria-hidden=\"true\"><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M38 14L20 32l18 18\"/><path d=\"M22 32h26\"/></g></svg>";
    backButton.addEventListener("click", () => {
      const currentRadarButton = document.querySelector(".topbar-actions .radar-mode-button");
      currentRadarButton?.click();
    });
    styleRainPanelBackButton(backButton);
    titleBlock.insertBefore(backButton, titleBlock.firstChild);
  }

  Object.assign(titleBlock.style, {
    display: "grid",
    gridTemplateColumns: "42px 1fr",
    columnGap: "10px",
    alignItems: "center"
  });

  const titleTexts = Array.from(titleBlock.children).filter((child) => child !== backButton);
  if (titleTexts.length && !titleBlock.querySelector(".rain-panel-title-text")) {
    const wrapper = document.createElement("div");
    wrapper.className = "rain-panel-title-text";
    titleTexts.forEach((child) => wrapper.appendChild(child));
    titleBlock.appendChild(wrapper);
  }
}

function ensureRainTopbarActions() {
  const shell = document.querySelector(".app-shell");
  const actions = document.querySelector(".topbar-actions");

  ensureRainPanelBackButton();

  if (!shell || !actions) return;

  const rainModeActive = shell.classList.contains("rain-mode-active");
  const existingForecastButton = actions.querySelector(".rain-open-panel-button");

  if (!rainModeActive) {
    existingForecastButton?.remove();
    document.querySelector(".rain-panel-back-button")?.remove();
    return;
  }

  const radarButton = actions.querySelector(".radar-mode-button");
  const kmButton = actions.querySelector(".km-react-button");

  if (actions.querySelector(".open-panel-button:not(.rain-open-panel-button)")) {
    existingForecastButton?.remove();
    return;
  }

  if (!existingForecastButton) {
    const forecastButton = document.createElement("button");
    forecastButton.type = "button";
    forecastButton.className = "open-panel-button rain-open-panel-button";
    forecastButton.textContent = "Avaa ennuste";
    forecastButton.setAttribute("aria-label", "Avaa ennuste");
    forecastButton.title = "Avaa ennuste";

    forecastButton.addEventListener("click", () => {
      radarButton?.click();

      window.setTimeout(() => {
        const realOpenButton = document.querySelector(".topbar-actions .open-panel-button:not(.rain-open-panel-button)");
        realOpenButton?.click();
      }, 80);
    });

    if (kmButton) {
      actions.insertBefore(forecastButton, kmButton);
    } else {
      actions.appendChild(forecastButton);
    }
  }
}

const observer = new MutationObserver(() => {
  window.requestAnimationFrame(ensureRainTopbarActions);
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["class"]
});

window.addEventListener("load", ensureRainTopbarActions);
window.addEventListener("resize", ensureRainTopbarActions);
ensureRainTopbarActions();
