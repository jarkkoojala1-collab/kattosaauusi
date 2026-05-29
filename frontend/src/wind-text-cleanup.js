function cleanInterfaceTextOnce() {
  try {
    if (typeof document === "undefined" || !document.body || typeof NodeFilter === "undefined") return;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    for (const node of textNodes) {
      if (!node.nodeValue) continue;

      const nextValue = node.nodeValue
        .replaceAll("(puuska ", "(")
        .replaceAll("Tutka + sade ennuste", "Sade")
        .replaceAll("Tutka + sade-ennuste", "Sade")
        .replaceAll("Tutka+sade ennuste", "Sade")
        .replaceAll("Tutka+sade-ennuste", "Sade")
        .replaceAll("FMI-tutkaennuste", "Sade")
        .replaceAll("Tutka nyt · ennuste 2 h", "Sade");

      if (nextValue !== node.nodeValue) {
        node.nodeValue = nextValue;
      }
    }
  } catch {
    // Tämä lisäsiivous ei saa koskaan estää sovelluksen latautumista.
  }
}

if (typeof window !== "undefined") {
  [500, 1500, 3500].forEach((delay) => {
    window.setTimeout(cleanInterfaceTextOnce, delay);
  });
}

export {};
