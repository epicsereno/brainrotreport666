/* BRAINROT REPORT 666 — Ethics page
   Interactive per-episode ethics checklist (persisted) + progress meter.
   Source of truth: docs/ethics/campaign-principles.md */
(function () {
  "use strict";

  var CHECKLIST = [
    { phase: "Creative Phase", items: [
      "Script fact-checked",
      "Claims verifiable",
      "No harmful stereotypes",
      "Disclosure requirements identified",
    ]},
    { phase: "Production Phase", items: [
      "All participants signed releases",
      "Location permissions obtained",
      "Privacy considerations addressed",
      "Safety protocols followed",
    ]},
    { phase: "Post-Production Phase", items: [
      "No deceptive editing",
      "Music/assets properly licensed",
      "Disclosures added",
      "Content warnings if needed",
    ]},
    { phase: "Distribution Phase", items: [
      "Sponsor disclosures visible",
      "Affiliate links marked",
      "Age restrictions if needed",
      "Community guidelines compliant",
    ]},
    { phase: "Publish Phase", items: [
      "Final ethics review complete",
      "Documentation archived",
      "Feedback channels open",
    ]},
  ];

  var STORE = "br666-ethics-checklist";
  var container = document.getElementById("checklist");
  if (!container) return;

  var state = {};
  try { state = JSON.parse(localStorage.getItem(STORE) || "{}") || {}; } catch (e) { state = {}; }

  function keyFor(p, i) { return p + "::" + i; }

  function render() {
    container.innerHTML = CHECKLIST.map(function (group) {
      var rows = group.items.map(function (item) {
        var k = keyFor(group.phase, item);
        var on = !!state[k];
        return (
          '<label class="check-item' + (on ? " checked" : "") + '">' +
            '<input type="checkbox" data-key="' + encodeURIComponent(k) + '"' + (on ? " checked" : "") + " />" +
            '<span class="check-label">' + escapeHtml(item) + "</span>" +
          "</label>"
        );
      }).join("");
      return '<div class="checklist-phase"><h3>' + escapeHtml(group.phase) + "</h3>" + rows + "</div>";
    }).join("");
    updateProgress();
  }

  function total() {
    return CHECKLIST.reduce(function (n, g) { return n + g.items.length; }, 0);
  }
  function done() {
    return Object.keys(state).filter(function (k) { return state[k]; }).length;
  }

  function updateProgress() {
    var t = total(), d = Math.min(done(), t);
    var pct = t ? Math.round((d / t) * 100) : 0;
    var fill = document.getElementById("ethics-progress-fill");
    var txt = document.getElementById("ethics-progress-text");
    if (fill) fill.style.width = pct + "%";
    if (txt) txt.innerHTML = "<b>" + d + " / " + t + "</b> &nbsp;(" + pct + "% — " +
      (pct === 100 ? "CERTIFIED BASED ✅" : pct >= 50 ? "looking ethical…" : "do better, legend") + ")";
  }

  container.addEventListener("change", function (e) {
    var box = e.target;
    if (!box || box.type !== "checkbox") return;
    var k = decodeURIComponent(box.dataset.key);
    state[k] = box.checked;
    box.closest(".check-item").classList.toggle("checked", box.checked);
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (err) {}
    updateProgress();
  });

  var resetBtn = document.getElementById("checklist-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      state = {};
      try { localStorage.removeItem(STORE); } catch (e) {}
      render();
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  render();

  /* nav menu + theme + year handled globally by theme.js */
})();
