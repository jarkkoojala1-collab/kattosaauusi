function ensureRainTopbarActions() {
  const shell = document.querySelector(".app-shell");
  const actions = document.querySelector(".topbar-actions");

  if (!shell || !actions) return;

  const rainModeActive = shell.classList.contains("rain-mode-active");
  const existingBackButton = actions.querySelector(".rain-back-button");
  const existingForecastButton = actions.querySelector(".rain-open-panel-button");

  if (!rainModeActive) {
    existingBackButton?.remove();
    existingForecastButton?.remove();
    return;
  }

  const radarButton = actions.querySelector(".radar-mode-button");
  const firstButton = actions.querySelector("button");
  const kmButton = actions.querySelector(".km-react-button");

  if (!existingBackButton) {
    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "ghost-location-button rain-back-button";
    backButton.textContent = "Edellinen";
    backButton.setAttribute("aria-label", "Edellinen");
    backButton.title = "Edellinen";
    backButton.addEventListener("click", () => {
      radarButton?.click();
    });

    actions.insertBefore(backButton, firstButton || null);
  }

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
