/* BRAINROT REPORT 666 — GitHub integration
   Pulls repo stats (stars/forks/issues) + latest commits from the public GitHub API.
   Degrades gracefully to placeholders/mock on rate-limit or offline. */
(function () {
  "use strict";

  var REPO = "epicsereno/brainrotreport666";
  var API = "https://api.github.com/repos/" + REPO;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function setStat(name, val) {
    document.querySelectorAll('[data-gh="' + name + '"]').forEach(function (el) {
      el.textContent = val;
    });
  }
  function timeAgo(iso) {
    var s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (isNaN(s)) return "";
    var u = [["y", 31536000], ["mo", 2592000], ["d", 86400], ["h", 3600], ["m", 60]];
    for (var i = 0; i < u.length; i++) {
      var n = Math.floor(s / u[i][1]);
      if (n >= 1) return n + u[i][0] + " ago";
    }
    return "just now";
  }

  /* ---- repo stats (footers, all pages) ---- */
  if (document.querySelector("[data-gh]")) {
    fetch(API, { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { if (!r.ok) throw new Error("repo " + r.status); return r.json(); })
      .then(function (d) {
        setStat("stars", (d.stargazers_count || 0).toLocaleString());
        setStat("forks", (d.forks_count || 0).toLocaleString());
        setStat("issues", (d.open_issues_count || 0).toLocaleString());
      })
      .catch(function () {
        // leave the static placeholders in place; mark them as estimates
        document.querySelectorAll("[data-gh]").forEach(function (el) {
          if (el.textContent === "—") el.textContent = "·";
        });
      });
  }

  /* ---- latest commit feed (index) ---- */
  var feed = document.getElementById("commit-feed");
  if (feed) {
    fetch(API + "/commits?per_page=5", { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { if (!r.ok) throw new Error("commits " + r.status); return r.json(); })
      .then(function (list) {
        if (!Array.isArray(list) || !list.length) throw new Error("empty");
        feed.innerHTML = list.map(renderCommit).join("");
      })
      .catch(function () {
        feed.innerHTML = MOCK.map(renderCommit).join("") +
          '<p class="commit-note">live feed rate-limited — showing a recent snapshot</p>';
      });
  }

  function renderCommit(c) {
    var sha = (c.sha || "").slice(0, 7);
    var msg = ((c.commit && c.commit.message) || "").split("\n")[0];
    var who = (c.commit && c.commit.author && c.commit.author.name) || "anon";
    var when = (c.commit && c.commit.author && c.commit.author.date) || "";
    var url = c.html_url || ("https://github.com/" + REPO + "/commit/" + sha);
    return (
      '<a class="commit-item" href="' + esc(url) + '" target="_blank" rel="noopener">' +
        '<span class="commit-sha">' + esc(sha || "0000000") + "</span>" +
        '<span class="commit-msg">' + esc(msg) + "</span>" +
        '<span class="commit-meta">' + esc(who) + (when ? " · " + esc(timeAgo(when)) : "") + "</span>" +
      "</a>"
    );
  }

  /* offline/rate-limit fallback snapshot */
  var MOCK = [
    { sha: "2eafffd0", commit: { message: "Add ethics manifesto page + homepage live dashboard", author: { name: "epicsereno", date: new Date(Date.now() - 36e5).toISOString() } } },
    { sha: "33eb88b0", commit: { message: "Add Episodes archive page with search, filters & workflow status", author: { name: "epicsereno", date: new Date(Date.now() - 72e5).toISOString() } } },
    { sha: "6f88c2b0", commit: { message: "Add Departments HQ page with interactive cards + modals", author: { name: "epicsereno", date: new Date(Date.now() - 108e5).toISOString() } } },
  ];
})();
