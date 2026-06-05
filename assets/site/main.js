/* BRAINROT REPORT 666 — site behavior
   Mobile menu, theme toggle, episode loader, "souls saved" counter. */
(function () {
  "use strict";

  /* mobile menu + theme toggle + year handled globally by theme.js */

  /* ---- episode loader (drives both the grid and the spotlight, live from JSON) ---- */
  var grid = document.getElementById("episode-grid");
  var spotlight = document.getElementById("spotlight");
  if (grid || spotlight) {
    fetch("assets/site/episodes.json")
      .then(function (r) {
        if (!r.ok) throw new Error("episodes.json " + r.status);
        return r.json();
      })
      .then(function (data) {
        var eps = ((data && data.episodes) || []).slice()
          .sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); }); // newest first
        if (!eps.length) {
          if (grid) grid.innerHTML = '<p class="section-sub">No drops yet. The rot is loading...</p>';
          if (spotlight) spotlight.innerHTML = '<p class="empty-state" style="grid-column:1/-1">No drops yet.</p>';
          return;
        }
        if (spotlight) spotlight.innerHTML = renderSpotlight(eps[0]);
        if (grid) grid.innerHTML = eps.map(renderEpisode).join("");
      })
      .catch(function (err) {
        var msg = '<p class="section-sub">Could not load episodes (' +
          String(err.message) + "). Run from a web server, not file://.</p>";
        if (grid) grid.innerHTML = msg;
        if (spotlight) spotlight.innerHTML = msg;
      });
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var STATUS_LABEL = {
    incoming: "Incoming", "in-progress": "In-Prod", review: "In-Prod",
    ready: "In-Prod", published: "Released", archived: "Released"
  };

  function renderSpotlight(ep) {
    var statusClass = esc(ep.status || "incoming");
    var statusText = STATUS_LABEL[ep.status] || ep.status || "incoming";
    return (
      '<div class="spotlight-thumb">' + esc(ep.thumb || ep.id || "BR666") + "</div>" +
      '<div class="spotlight-body">' +
        '<div class="spotlight-meta">' +
          '<span class="badge ' + statusClass + '">' + esc(statusText) + "</span>" +
          '<span class="ep-date">' + esc(ep.date || "TBA") + "</span>" +
          (ep.runtime ? '<span class="ep-date">⏱ ' + esc(ep.runtime) + "</span>" : "") +
        "</div>" +
        "<h2>" + esc(ep.id ? ep.id + " — " : "") + esc(ep.title || "Untitled") + "</h2>" +
        '<p class="desc">' + esc(ep.description || "") + "</p>" +
        '<div class="cta-row" style="justify-content:flex-start">' +
          '<a class="btn btn-primary" href="episodes.html">▶ Full Details</a>' +
          '<a class="btn btn-ghost" href="' + (ep.link ? esc(ep.link) : "episodes.html") +
            '" target="_blank" rel="noopener">Source ↗</a>' +
        "</div>" +
      "</div>"
    );
  }

  function renderEpisode(ep) {
    var statusClass = esc(ep.status || "incoming");
    var statusText = STATUS_LABEL[ep.status] || ep.status || "incoming";
    var link = ep.link ? esc(ep.link) : "episodes.html";
    return (
      '<article class="card ep-card">' +
        '<div class="ep-thumb">' + esc(ep.thumb || ep.id || "BR666") + "</div>" +
        '<div class="ep-meta">' +
          '<span class="badge ' + statusClass + '">' + esc(statusText) + "</span>" +
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
})();
