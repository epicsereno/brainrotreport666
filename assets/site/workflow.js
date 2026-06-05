/* BRAINROT REPORT 666 — Workflow page
   Showcases the supercharged Mermaid engine: clickable animated flowchart,
   handoff.sh sequence diagram, episode Gantt — all with zoom/pan/export. */

import { render } from "./mermaid-tools.js";

/* node -> detail (for clickable flowchart modal) */
const NODE_INFO = {
  Creative: { emoji: "🎬", desc: "Scripts, storyboards, thumbnails. Claims fact-checked, sources logged.", link: "https://github.com/epicsereno/brainrotreport666/blob/Brainrotreport666/departments/creative/scripts/SCRIPT-EP001-DRAFT-v1.md", linkLabel: "EP001 draft script →" },
  Production: { emoji: "📹", desc: "Footage + audio capture. Releases signed, safety check cleared.", link: "https://github.com/epicsereno/brainrotreport666/tree/Brainrotreport666/departments/production", linkLabel: "production dept →" },
  "Post-Prod": { emoji: "🎚️", desc: "Editing, VFX, color, sound. No deceptive edits; QC gate.", link: "https://github.com/epicsereno/brainrotreport666/tree/Brainrotreport666/departments/post-production", linkLabel: "post-production dept →" },
  Review: { emoji: "🧭", desc: "Ethics + QC review. Independent veto before anything ships.", link: "https://github.com/epicsereno/brainrotreport666/blob/Brainrotreport666/docs/ethics/campaign-principles.md", linkLabel: "ethics principles →" },
  Distribution: { emoji: "📡", desc: "YouTube / IG / TikTok. Disclosures on every post.", link: "https://github.com/epicsereno/brainrotreport666/tree/Brainrotreport666/departments/distribution", linkLabel: "distribution dept →" },
  Released: { emoji: "🚀", desc: "Live on platforms, analytics enabled, community notified.", link: "https://epicsereno.github.io/brainrotreport666/episodes.html", linkLabel: "episodes archive →" },
};

const FLOW = `flowchart LR
  C[Creative] --> P[Production]
  P --> O[Post-Prod]
  O --> R[Review]
  R --> D[Distribution]
  D --> L[Released]`;

const SEQ = `sequenceDiagram
  autonumber
  actor Op as Operator
  participant H as handoff.sh
  participant FS as shared/handoffs
  participant Dep as Dest Dept
  Op->>H: ./handoff.sh EP001 creative production
  H->>H: validate args (id, from, to)
  H->>H: TIMESTAMP = date -Iseconds
  H->>FS: mkdir -p shared/handoffs
  H->>FS: write EP001_creative_to_production.log
  H->>FS: append creative checklist
  H-->>Op: Status: PENDING REVIEW
  H-->>Dep: Awaiting production confirmation`;

const GANTT = `gantt
  title EP001 — Episode Timeline
  dateFormat YYYY-MM-DD
  axisFormat %b %d
  section Creative
  Script draft        :done, c1, 2026-06-01, 2d
  Storyboard          :done, c2, after c1, 1d
  section Production
  Shoot               :active, p1, 2026-06-05, 3d
  Audio capture       :p2, after p1, 1d
  section Post
  Edit and color      :o1, after p2, 3d
  QC pass             :o2, after o1, 1d
  section Distribution
  Schedule and publish:d1, after o2, 1d`;

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---- modal ---- */
const modal = document.getElementById("workflow-modal");
const modalBody = document.getElementById("workflow-modal-body");
function openNode(key) {
  const info = NODE_INFO[key];
  if (!info || !modal || !modalBody) return;
  modalBody.innerHTML =
    '<div style="font-size:3rem">' + esc(info.emoji) + "</div>" +
    "<h2 style='margin:0.3rem 0'>" + esc(key) + "</h2>" +
    '<p class="desc" style="color:var(--muted)">' + esc(info.desc) + "</p>" +
    '<p style="margin-top:1rem"><a href="' + esc(info.link) + '" target="_blank" rel="noopener">' + esc(info.linkLabel) + "</a></p>";
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  const c = modal.querySelector(".modal-close");
  if (c) c.focus();
}
function closeModal() { if (modal) { modal.classList.remove("open"); document.body.style.overflow = ""; } }
document.addEventListener("click", (e) => {
  if (modal && (e.target === modal || e.target.closest(".modal-close"))) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal && modal.classList.contains("open")) closeModal();
});

/* ---- render diagrams ---- */
let flowApi = null;
const STEPS = ["Creative", "Production", "Post-Prod", "Review", "Distribution", "Released"];
let progress = 1; // Creative done by default

async function boot() {
  const flowEl = document.getElementById("diagram-flow");
  if (flowEl) {
    try {
      flowEl.classList.add("mm-animated");
      flowApi = await render(flowEl, FLOW, { id: "wf-flow", clickable: true, onNodeClick: openNode });
      paintProgress();
    } catch (e) {}
  }
  const seqEl = document.getElementById("diagram-seq");
  if (seqEl) { try { await render(seqEl, SEQ, { id: "wf-seq" }); } catch (e) {} }
  const ganttEl = document.getElementById("diagram-gantt");
  if (ganttEl) { try { await render(ganttEl, GANTT, { id: "wf-gantt" }); } catch (e) {} }
}

function paintProgress() {
  if (!flowApi) return;
  STEPS.forEach((s, i) => {
    if (i < progress) flowApi.setStatus(s, "complete");
    else if (i === progress) flowApi.setStatus(s, "active");
    else flowApi.setStatus(s, null);
  });
}

document.getElementById("wf-advance")?.addEventListener("click", () => {
  progress = Math.min(STEPS.length, progress + 1);
  paintProgress();
});
document.getElementById("wf-back")?.addEventListener("click", () => {
  progress = Math.max(0, progress - 1);
  paintProgress();
});
document.getElementById("wf-block")?.addEventListener("click", () => {
  if (flowApi) flowApi.setStatus(STEPS[Math.min(progress, STEPS.length - 1)], "blocked");
});
document.getElementById("wf-reset")?.addEventListener("click", () => {
  progress = 1; paintProgress();
});

boot();

/* shared chrome */
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.addEventListener("click", (e) => { if (e.target.tagName === "A") navLinks.classList.remove("open"); });
}
const yr = document.getElementById("year");
if (yr) yr.textContent = new Date().getFullYear();
