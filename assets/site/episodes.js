/* BRAINROT REPORT 666 — Episodes page
   Spotlight, searchable/filterable grid, teaser modal, Mermaid workflow status.
   ES module: imports Mermaid from CDN. */

import { render as renderDiagram } from "./mermaid-tools.js";

/* canonical status -> { label, node id in the pipeline } */
const STATUS = {
  incoming: { label: "Incoming", node: "I" },
  "in-progress": { label: "In-Prod", node: "P" },
  review: { label: "In-Prod", node: "R" },
  ready: { label: "In-Prod", node: "Y" },
  published: { label: "Released", node: "L" },
  archived: { label: "Released", node: "A" },
};
/* the three filter buckets the page exposes */
const FILTER_OF = {
  incoming: "incoming",
  "in-progress": "in-prod",
  review: "in-prod",
  ready: "in-prod",
  published: "released",
  archived: "released",
};

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
function statusLabel(s) { return (STATUS[s] && STATUS[s].label) || s; }

let EPISODES = [];
let activeFilter = "all";
let query = "";

const grid = document.getElementById("episode-grid");
const spotlight = document.getElementById("spotlight");
const searchInput = document.getElementById("search");
const resultCount = document.getElementById("result-count");

/* ---- load data ---- */
fetch("assets/site/episodes.json")
  .then((r) => { if (!r.ok) throw new Error("episodes.json " + r.status); return r.json(); })
  .then((data) => {
    EPISODES = (data && data.episodes) || [];
    EPISODES.sort((a, b) => String(b.date).localeCompare(String(a.date))); // newest first
    renderSpotlight();
    renderGrid();
    renderWorkflow();
  })
  .catch((err) => {
    if (grid) grid.innerHTML = '<p class="empty-state">Could not load episodes (' + esc(err.message) + "). Serve over http://, not file://.</p>";
  });

/* ---- spotlight: newest episode ---- */
function renderSpotlight() {
  if (!spotlight || !EPISODES.length) return;
  const ep = EPISODES[0];
  const cls = esc(ep.status || "incoming");
  spotlight.innerHTML = `
    <div class="spotlight-thumb">${esc(ep.thumb || ep.id)}</div>
    <div class="spotlight-body">
      <div class="spotlight-meta">
        <span class="badge ${cls}">${esc(statusLabel(ep.status))}</span>
        <span class="ep-date">${esc(ep.date || "TBA")}</span>
        ${ep.runtime ? '<span class="ep-date">⏱ ' + esc(ep.runtime) + "</span>" : ""}
      </div>
      <h2>${esc(ep.id)} — ${esc(ep.title)}</h2>
      <p class="desc">${esc(ep.description || "")}</p>
      <div class="cta-row" style="justify-content:flex-start">
        <button class="btn btn-primary" data-teaser="${esc(ep.id)}">▶ Watch Teaser</button>
        <a class="btn btn-ghost" href="${esc(ep.link || "#")}" target="_blank" rel="noopener">Details ↗</a>
      </div>
    </div>`;
}

/* ---- grid ---- */
function matches(ep) {
  if (activeFilter !== "all" && FILTER_OF[ep.status] !== activeFilter) return false;
  if (!query) return true;
  const hay = [ep.id, ep.title, ep.description, (ep.tags || []).join(" ")].join(" ").toLowerCase();
  return hay.includes(query);
}

function cardHTML(ep) {
  const cls = esc(ep.status || "incoming");
  const tags = (ep.tags || []).slice(0, 5)
    .map((t) => '<span class="ep-tag">#' + esc(t) + "</span>").join("");
  return `
  <article class="card ep-card">
    <div class="ep-thumb">${esc(ep.thumb || ep.id)}</div>
    <div class="ep-meta">
      <span class="badge ${cls}">${esc(statusLabel(ep.status))}</span>
      <span class="ep-date">${esc(ep.date || "TBA")}</span>
      ${ep.runtime ? '<span class="ep-date">⏱ ' + esc(ep.runtime) + "</span>" : ""}
    </div>
    <h3>${esc(ep.id)} — ${esc(ep.title)}</h3>
    <div class="ep-tags">${tags}</div>
    <p class="desc">${esc(ep.description || "")}</p>
    <div class="cta-row" style="justify-content:flex-start;margin-top:1rem">
      <button class="btn btn-primary" data-teaser="${esc(ep.id)}">▶ Watch Teaser</button>
    </div>
  </article>`;
}

function renderGrid() {
  if (!grid) return;
  const visible = EPISODES.filter(matches);
  grid.innerHTML = visible.length
    ? visible.map(cardHTML).join("")
    : '<p class="empty-state">No drops match that energy. Try "rizz", "cooked", or clear the filter.</p>';
  if (resultCount) resultCount.textContent = visible.length + " / " + EPISODES.length + " drops";
}

/* ---- search + slang chips ---- */
if (searchInput) {
  searchInput.addEventListener("input", () => {
    query = searchInput.value.trim().toLowerCase();
    renderGrid();
  });
}
document.querySelectorAll("[data-slang]").forEach((chip) => {
  chip.addEventListener("click", () => {
    query = chip.dataset.slang.toLowerCase();
    if (searchInput) searchInput.value = query;
    renderGrid();
  });
});

/* ---- status filter ---- */
const filterBtns = Array.from(document.querySelectorAll("[data-filter]"));
filterBtns.forEach((b) =>
  b.addEventListener("click", () => {
    activeFilter = b.dataset.filter;
    filterBtns.forEach((x) => {
      const on = x === b;
      x.classList.toggle("filter-active", on);
      x.setAttribute("aria-pressed", on ? "true" : "false");
    });
    renderGrid();
  })
);

/* ---- teaser modal ---- */
const modal = document.getElementById("teaser-modal");
const modalBody = document.getElementById("teaser-modal-body");
function openTeaser(id) {
  const ep = EPISODES.find((e) => e.id === id);
  if (!ep || !modal || !modalBody) return;
  const hasTeaser = !!ep.teaser;
  modalBody.innerHTML = `
    <div class="spotlight-thumb" style="aspect-ratio:16/9;margin-bottom:1rem">${esc(ep.thumb || ep.id)}</div>
    <span class="badge ${esc(ep.status)}">${esc(statusLabel(ep.status))}</span>
    <h2 style="margin:0.6rem 0 0.4rem">${esc(ep.id)} — ${esc(ep.title)}</h2>
    <p class="desc" style="color:var(--muted)">${esc(ep.description || "")}</p>
    ${
      hasTeaser
        ? '<p style="margin-top:1rem"><a class="btn btn-primary" href="' + esc(ep.teaser) + '" target="_blank" rel="noopener">▶ Open teaser</a></p>'
        : '<p class="empty-state" style="text-align:left;padding:1rem 0 0">🎬 Teaser dropping soon — this one\'s still cooking in the lab. Smash subscribe so you don\'t miss it.</p>'
    }`;
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  const c = modal.querySelector(".modal-close");
  if (c) c.focus();
}
function closeTeaser() {
  if (!modal) return;
  modal.classList.remove("open");
  document.body.style.overflow = "";
}
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-teaser]");
  if (t) { openTeaser(t.dataset.teaser); return; }
  if (modal && (e.target === modal || e.target.closest(".modal-close"))) closeTeaser();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal && modal.classList.contains("open")) closeTeaser();
});

/* ---- Mermaid: current episode workflow status ---- */
async function renderWorkflow() {
  const wrap = document.getElementById("workflow-diagram");
  const caption = document.getElementById("workflow-caption");
  if (!wrap || !EPISODES.length) return;
  // the episode currently moving through the pipeline (not yet released), else newest
  const current = EPISODES.find((e) => FILTER_OF[e.status] !== "released") || EPISODES[0];
  const node = (STATUS[current.status] && STATUS[current.status].node) || "I";
  if (caption) caption.textContent = `Current episode: ${current.id} — ${current.title} (${statusLabel(current.status)})`;
  const def = `flowchart LR
  I[Incoming] --> P[In-Prod]
  P --> R[Review]
  R --> Y[Ready]
  Y --> L[Released]
  L --> A[Archived]
  class ${node} current
  classDef current fill:#00ff9f,stroke:#00ff9f,color:#04110b,font-weight:bold`;
  try { await renderDiagram(wrap, def, { id: "ep-workflow", toolbar: true }); }
  catch (err) { /* helper renders its own fallback */ }
}

/* ---- shared chrome ---- */
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.addEventListener("click", (e) => { if (e.target.tagName === "A") navLinks.classList.remove("open"); });
}
const yr = document.getElementById("year");
if (yr) yr.textContent = new Date().getFullYear();
