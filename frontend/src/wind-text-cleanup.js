function cleanInterfaceText(root = document.body) {
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  for (const node of textNodes) {
    if (!node.nodeValue) continue;

    node.nodeValue = node.nodeValue
      .replaceAll("(puuska ", "(")
      .replaceAll("Tutka + sade ennuste", "Sade")
      .replaceAll("Tutka + sade-ennuste", "Sade")
      .replaceAll("Tutka+sade ennuste", "Sade")
      .replaceAll("Tutka+sade-ennuste", "Sade")
      .replaceAll("FMI-tutkaennuste", "Sade")
      .replaceAll("Tutka nyt · ennuste 2 h", "Sade");
  }
}

cleanInterfaceText();

const observer = new MutationObserver(() => cleanInterfaceText());
observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});
