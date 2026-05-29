function cleanWindGustText(root = document.body) {
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  for (const node of textNodes) {
    if (node.nodeValue && node.nodeValue.includes("(puuska ")) {
      node.nodeValue = node.nodeValue.replaceAll("(puuska ", "(");
    }
  }
}

cleanWindGustText();

const observer = new MutationObserver(() => cleanWindGustText());
observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});
