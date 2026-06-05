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

  /* ---- universal mobile menu (hamburger), loaded on every page ---- */
  var menuBtn = document.querySelector(".menu-btn");
  var navLinks = document.querySelector(".nav-links");
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
    // close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navLinks.classList.contains("open")) {
        navLinks.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- year stamp in footers, every page ---- */
  document.querySelectorAll("#year").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
