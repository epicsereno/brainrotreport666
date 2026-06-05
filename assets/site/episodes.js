/* BRAINROT REPORT 666 — Episodes page
   Spotlight, searchable/filterable/sortable grid, full-detail modal with a
   per-episode Mermaid pipeline diagram, and the current-episode workflow map.
   ES module: imports Mermaid from CDN. */

import { render as renderDiagram } from "./mermaid-tools.js";

/* canonical pipeline order: stage -> { label, node id, filter bucket } */
const STAGES = ["incoming", "in-progress", "review", "ready", "published", "archived"];
const STATUS = {
  incoming:      { label: "Incoming", node: "I", bucket: "incoming" },
  "in-progress": { label: "In-Prod",  node: "P", bucket: "in-prod" },
  review:        { label: "In-Prod",  node: "R", bucket: "in-prod" },
  ready:         { label: "In-Prod",  node: "Y", bucket: "in-prod" },
  published:     { label: "Released", node: "L", bucket: "released" },
  archived:      { label: "Released", node: "A", bucket: "released" },
};
const stageOf = (ep) => ep.stage || ep.status || "incoming";
const stageIndex = (ep) => { const i = STAGES.indexOf(stageOf(ep)); return i < 0 ? 0 : i; };
const bucketOf = (ep) => (STATUS[ep.status] && STATUS[ep.status].bucket) || "incoming";
const statusLabel = (s) => (STATUS[s] && STATUS[s].label) || s;

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

let EPISODES = [];
let activeFilter = "all";
let query = "";
let sortMode = "date-desc";

const grid = document.getElementById("episode-grid");
const spotlight = document.getElementById("spotlight");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const resultCount = document.getElementById("result-count");

/* ---- load data ---- */
fetch("assets/site/episodes.json")
  .then((r) => { if (!r.ok) throw new Error("episodes.json " + r.status); return r.json(); })
  .then((data) => {
    EPISODES = (data && data.episodes) || [];
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
  const ep = [...EPISODES].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
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
        <button class="btn btn-primary" data-ep="${esc(ep.id)}">▶ Full Details</button>
        <a class="btn btn-ghost" href="${esc(ep.link || "#")}" target="_blank" rel="noopener">Source ↗</a>
      </div>
    </div>`;
}

/* ---- filter + sort + grid ---- */
function matches(ep) {
  if (activeFilter !== "all" && bucketOf(ep) !== activeFilter) return false;
  if (!query) return true;
  const hay = [ep.id, ep.title, ep.description, (ep.tags || []).join(" ")].join(" ").toLowerCase();
  return hay.includes(query);
}

function sortList(list) {
  const by = {
    "date-desc": (a, b) => String(b.date).localeCompare(String(a.date)),
    "date-asc":  (a, b) => String(a.date).localeCompare(String(b.date)),
    "stage":     (a, b) => stageIndex(a) - stageIndex(b) || String(a.date).localeCompare(String(b.date)),
    "title":     (a, b) => String(a.title).localeCompare(String(b.title)),
  }[sortMode] || ((a, b) => 0);
  return [...list].sort(by);
}

function cardHTML(ep) {
  const cls = esc(ep.status || "incoming");
  const tags = (ep.tags || []).slice(0, 5)
    .map((t) => '<span class="ep-tag">#' + esc(t) + "</span>").join("");
  return `
  <article class="card ep-card" data-ep="${esc(ep.id)}" role="button" tabindex="0"
           aria-label="Open details for ${esc(ep.id)} — ${esc(ep.title)}">
    <div class="ep-thumb">${esc(ep.thumb || ep.id)}</div>
    <div class="ep-meta">
      <span class="badge ${cls}">${esc(statusLabel(ep.status))}</span>
      <span class="ep-date">${esc(ep.date || "TBA")}</span>
      ${ep.runtime ? '<span class="ep-date">⏱ ' + esc(ep.runtime) + "</span>" : ""}
    </div>
    <h3>${esc(ep.id)} — ${esc(ep.title)}</h3>
    <div class="ep-tags">${tags}</div>
    <p class="desc">${esc(ep.description || "")}</p>
    <p class="ep-open">View details →</p>
  </article>`;
}

function renderGrid() {
  if (!grid) return;
  const visible = sortList(EPISODES.filter(matches));
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

/* ---- sort ---- */
if (sortSelect) {
  sortSelect.addEventListener("change", () => {
    sortMode = sortSelect.value;
    renderGrid();
  });
}

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

/* ---- full-detail modal (with per-episode Mermaid pipeline) ---- */
const modal = document.getElementById("teaser-modal");
const modalBody = document.getElementById("teaser-modal-body");

/* build a flowchart of the 6 stages, highlighting this episode's current one */
function pipelineDef(ep) {
  const node = (STATUS[ep.status] && STATUS[ep.status].node) || "I";
  const done = stageIndex(ep);
  const cls = STAGES.map((s, i) => {
    const n = STATUS[s].node;
    if (i < done) return `class ${n} done`;
    if (i === done) return `class ${n} current`;
    return "";
  }).filter(Boolean).join("\n  ");
  return `flowchart LR
  I[Incoming] --> P[In-Prod]
  P --> R[Review]
  R --> Y[Ready]
  Y --> L[Released]
  L --> A[Archived]
  ${cls}
  classDef current fill:#00ff9f,stroke:#00ff9f,color:#04110b,font-weight:bold
  classDef done fill:#7c3aed,stroke:#a855f7,color:#fff`;
}

async function openDetails(id) {
  const ep = EPISODES.find((e) => e.id === id);
  if (!ep || !modal || !modalBody) return;
  const tags = (ep.tags || []).map((t) => '<span class="ep-tag">#' + esc(t) + "</span>").join("");
  modalBody.innerHTML = `
    <div class="spotlight-thumb" style="aspect-ratio:16/9;margin-bottom:1rem">${esc(ep.thumb || ep.id)}</div>
    <div class="spotlight-meta">
      <span class="badge ${esc(ep.status)}">${esc(statusLabel(ep.status))}</span>
      <span class="ep-date">${esc(ep.date || "TBA")}</span>
      ${ep.runtime ? '<span class="ep-date">⏱ ' + esc(ep.runtime) + "</span>" : ""}
    </div>
    <h2 style="margin:0.5rem 0 0.4rem">${esc(ep.id)} — ${esc(ep.title)}</h2>
    <p class="desc" style="color:var(--muted)">${esc(ep.description || "")}</p>
    <div class="ep-tags" style="margin:0.8rem 0 0.4rem">${tags}</div>
    <p class="kicker" style="margin-top:1.2rem">// Pipeline status</p>
    <div id="modal-diagram" style="margin:0.6rem 0 1rem"><span class="empty-state">rendering pipeline…</span></div>
    ${
      ep.teaser
        ? '<a class="btn btn-primary" href="' + esc(ep.teaser) + '" target="_blank" rel="noopener">▶ Watch teaser</a> '
        : '<p class="empty-state" style="text-align:left;padding:0">🎬 Teaser still cooking — smash subscribe so you don\'t miss the drop.</p>'
    }
    <a class="btn btn-ghost" href="${esc(ep.link || "#")}" target="_blank" rel="noopener">Source ↗</a>`;
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  const c = modal.querySelector(".modal-close");
  if (c) c.focus();

  const dia = modalBody.querySelector("#modal-diagram");
  if (dia) {
    try { await renderDiagram(dia, pipelineDef(ep), { id: "modal-" + ep.id, toolbar: false }); }
    catch (err) { dia.innerHTML = '<span class="empty-state">pipeline diagram unavailable</span>'; }
  }
}
function closeModal() {
  if (!modal) return;
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

document.addEventListener("click", (e) => {
  const opener = e.target.closest("[data-ep]");
  if (opener) { openDetails(opener.dataset.ep); return; }
  if (modal && (e.target === modal || e.target.closest(".modal-close"))) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal && modal.classList.contains("open")) { closeModal(); return; }
  // keyboard-activate a focused episode card
  if ((e.key === "Enter" || e.key === " ") && document.activeElement) {
    const card = document.activeElement.closest && document.activeElement.closest(".ep-card[data-ep]");
    if (card) { e.preventDefault(); openDetails(card.dataset.ep); }
  }
});

/* ---- Mermaid: current episode workflow status (page section) ---- */
async function renderWorkflow() {
  const wrap = document.getElementById("workflow-diagram");
  const caption = document.getElementById("workflow-caption");
  if (!wrap || !EPISODES.length) return;
  // the episode currently moving through the pipeline (not yet released), else newest
  const inFlight = EPISODES.filter((e) => bucketOf(e) !== "released");
  const current = (inFlight.sort((a, b) => stageIndex(b) - stageIndex(a))[0]) ||
    [...EPISODES].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
  if (caption) caption.textContent = `Current episode: ${current.id} — ${current.title} (${statusLabel(current.status)})`;
  try { await renderDiagram(wrap, pipelineDef(current), { id: "ep-workflow", toolbar: true }); }
  catch (err) { /* helper renders its own fallback */ }
}
