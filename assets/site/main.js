/* BRAINROT REPORT 666 — site behavior
   Mobile menu, theme toggle, episode loader, "souls saved" counter. */
(function () {
  "use strict";

  /* ---- mobile menu ---- */
  var menuBtn = document.querySelector(".menu-btn");
  var navLinks = document.querySelector(".nav-links");
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") navLinks.classList.remove("open");
    });
  }

  /* ---- theme toggle (persisted) ---- */
  var themeBtn = document.querySelector(".theme-btn");
  try {
    if (localStorage.getItem("br666-theme") === "light") {
      document.body.classList.add("light");
    }
  } catch (e) {}
  if (themeBtn) {
    var setLabel = function () {
      themeBtn.textContent = document.body.classList.contains("light") ? "🌙" : "☀️";
    };
    setLabel();
    themeBtn.addEventListener("click", function () {
      document.body.classList.toggle("light");
      try {
        localStorage.setItem("br666-theme", document.body.classList.contains("light") ? "light" : "dark");
      } catch (e) {}
      setLabel();
    });
  }

  /* ---- episode loader ---- */
  var grid = document.getElementById("episode-grid");
  if (grid) {
    fetch("assets/site/episodes.json")
      .then(function (r) {
        if (!r.ok) throw new Error("episodes.json " + r.status);
        return r.json();
      })
      .then(function (data) {
        var eps = (data && data.episodes) || [];
        if (!eps.length) {
          grid.innerHTML = '<p class="section-sub">No drops yet. The rot is loading...</p>';
          return;
        }
        grid.innerHTML = eps.map(renderEpisode).join("");
      })
      .catch(function (err) {
        grid.innerHTML = '<p class="section-sub">Could not load episodes (' +
          String(err.message) + "). Run from a web server, not file://.</p>";
      });
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderEpisode(ep) {
    var statusClass = esc(ep.status || "incoming");
    var link = ep.link ? esc(ep.link) : "#episodes";
    return (
      '<article class="card ep-card">' +
        '<div class="ep-thumb">' + esc(ep.thumb || ep.id || "BR666") + "</div>" +
        '<div class="ep-meta">' +
          '<span class="badge ' + statusClass + '">' + esc(ep.status || "incoming") + "</span>" +
          '<span class="ep-date">' + esc(ep.date || "TBA") + "</span>" +
        "</div>" +
        "<h3>" + esc(ep.id ? ep.id + " — " : "") + esc(ep.title || "Untitled") + "</h3>" +
        '<p class="desc">' + esc(ep.description || "") + "</p>" +
        '<p style="margin-top:1rem"><a href="' + link + '" target="_blank" rel="noopener">Read the script →</a></p>' +
      "</article>"
    );
  }

  /* ---- "souls saved from brainrot" counter (deterministic-ish, climbs live) ---- */
  var counter = document.getElementById("souls-counter");
  if (counter) {
    var base = 66600; // the empire's running tally
    var dayMs = 24 * 60 * 60 * 1000;
    var sinceLaunch = Math.max(0, Date.now() - Date.UTC(2026, 5, 5)); // launch: 2026-06-05
    var saved = base + Math.floor(sinceLaunch / dayMs) * 666;
    var shown = Math.max(0, saved - 1200);
    var tick = function () {
      if (shown < saved) {
        shown += Math.ceil((saved - shown) / 18);
        counter.textContent = shown.toLocaleString();
        requestAnimationFrame(tick);
      } else {
        counter.textContent = saved.toLocaleString();
        // keep it "live": occasionally bump
        setTimeout(function () { saved += Math.floor(Math.random() * 7); tick(); }, 4000);
      }
    };
    tick();
  }

  /* ---- year ---- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
