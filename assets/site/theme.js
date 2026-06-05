/* BRAINROT REPORT 666 — universal dark/light "brainrot theme" toggle.
   Loaded on every page; persists choice; syncs all .theme-btn labels. */
(function () {
  "use strict";
  var KEY = "br666-theme";
  function isLight() { return document.body.classList.contains("light"); }
  function label() { return isLight() ? "🌙" : "☀️"; }
  function syncLabels() {
    document.querySelectorAll(".theme-btn").forEach(function (b) { b.textContent = label(); });
  }
  try { if (localStorage.getItem(KEY) === "light") document.body.classList.add("light"); } catch (e) {}
  syncLabels();
  document.querySelectorAll(".theme-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.body.classList.toggle("light");
      try { localStorage.setItem(KEY, isLight() ? "light" : "dark"); } catch (e) {}
      syncLabels();
    });
  });
})();
