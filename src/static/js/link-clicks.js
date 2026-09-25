// Sends an Umami "link-click" event for every link followed on the page.
// Umami counts page views on its own; clicks need an explicit event.
document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link || !window.umami) return;
  umami.track("link-click", {
    url: link.href,
    text: link.textContent.trim().replace(/\s+/g, " "),
  });
});
