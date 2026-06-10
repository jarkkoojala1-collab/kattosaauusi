function ensureRainTopbarActions() {
  const shell = document.querySelector(".app-shell");
  const actions = document.querySelector(".topbar-actions");

  if (!shell || !actions) return;

  const rainModeActive = shell.classList.contains("rain-mode-active");
  const existingButton = actions.querySelector(".rain-open-panel-button");

  if (!rainModeActive) {
    existingButton?.remove();
    return;
  }

  if (actions.querySelector(".open-panel-button:not(.rain-open-panel-button)")) {
    existingButton?.remove();
    return;
  }

  if (existingButton) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "open-panel-button rain-open-panel-button";
  button.textContent = "Avaa ennuste";
  button.setAttribute("aria-label", "Avaa ennuste");
  button.title = "Avaa ennuste";

  button.addEventListener("click", () => {
    const radarButton = actions.querySelector(".radar-mode-button");
    radarButton?.click();

    window.setTimeout(() => {
      const realOpenButton = document.querySelector(".topbar-actions .open-panel-button:not(.rain-open-panel-button)");
      realOpenButton?.click();
    }, 80);
  });

  const kmButton = actions.querySelector(".km-react-button");
  if (kmButton) {
    actions.insertBefore(button, kmButton);
  } else {
    actions.appendChild(button);
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
