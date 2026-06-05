/* BRAINROT REPORT 666 — Departments HQ
   Renders dept cards, filter (Core/Support), modals w/ manifesto + Mermaid sub-workflow.
   ES module: imports Mermaid from CDN. */

import { render as renderDiagram } from "./mermaid-tools.js";

/* ---- DATA (the 8 requested departments) ---- */
const DEPTS = [
  {
    id: "creative",
    emoji: "🎬",
    name: "Creative",
    category: "core",
    status: "COOKING",
    blurb: "Where the chaos is conceived. Scripts, storyboards, thumbnails — peak rizz, zero filler.",
    principle: "Every claim fact-checked, every source logged before a single frame is drawn.",
    manifesto:
      "Creative is the spark plug of the 666. We weaponize meme energy to make ideas go off — but the unhinged surface hides a disciplined core: outlines are pressure-tested, hooks are honest, and no claim leaves this department without a receipt. If we can't source it, we don't say it.",
    mermaid: `flowchart LR
  A[Brief] --> B[Outline]
  B --> C[Draft Script]
  C --> D{Sources logged?}
  D -- no --> C
  D -- yes --> E[Storyboard]
  E --> F[Handoff to Production]`,
  },
  {
    id: "production",
    emoji: "📹",
    name: "Production",
    category: "core",
    status: "ROLLING",
    blurb: "Lights, camera, no cap. Raw footage + audio capture and on-set asset wrangling.",
    principle: "No one is filmed without a signed release; every shoot clears a safety check.",
    manifesto:
      "Production turns the script into pixels and waveforms. It looks run-and-gun, but consent comes first: releases are signed before cameras roll, sets are safe, and every file is logged so nothing — and no one — gets lost in the rot.",
    mermaid: `flowchart LR
  A[Receive Brief] --> B[Releases Signed]
  B --> C[Capture Footage]
  C --> D[Capture Audio]
  D --> E{Safety check}
  E -- fail --> C
  E -- pass --> F[Handoff to Post]`,
  },
  {
    id: "post-production",
    emoji: "🎚️",
    name: "Post-Production",
    category: "core",
    status: "RENDERING",
    blurb: "Editing, VFX, color, sound design. We make it slap without making it lie.",
    principle: "No deceptive edits — context preserved. Nothing ships until QC signs off.",
    manifesto:
      "Post is where it all comes together at 2am. We push the aesthetic hard, but the edit never distorts meaning: quotes keep their context, timelines stay honest, and a hard QC gate stands between the cut and the world.",
    mermaid: `flowchart LR
  A[Ingest] --> B[Edit]
  B --> C[VFX and Color]
  C --> D[Sound Design]
  D --> E{QC pass?}
  E -- no --> B
  E -- yes --> F[Master Export]`,
  },
  {
    id: "distribution",
    emoji: "📡",
    name: "Distribution",
    category: "core",
    status: "SHIPPING",
    blurb: "YouTube, Instagram, TikTok. We blast the signal across every feed.",
    principle: "Every post carries its disclosures — sponsorships and AI use labeled, always.",
    manifesto:
      "Distribution is the cannon. We optimize titles, tags, and timing to hit the algorithm where it lives — while every upload ships with honest disclosures baked in. Reach, yes. Deception, never.",
    mermaid: `flowchart LR
  A[Receive Master] --> B[Add Disclosures]
  B --> C[Schedule]
  C --> D[YouTube]
  C --> E[Instagram]
  C --> F[TikTok]`,
  },
  {
    id: "analytics",
    emoji: "📊",
    name: "Analytics",
    category: "support",
    status: "CRUNCHING",
    blurb: "Numbers don't lie, but they doomscroll. We track what works and feed it back.",
    principle: "Privacy-respecting metrics only — aggregate, anonymized, never creepy.",
    manifesto:
      "Analytics reads the tea leaves of the feed. We measure what resonates and route insight back to Creative — but we refuse to surveil. Data is aggregated and anonymized; growth never comes at the cost of the audience's privacy.",
    mermaid: `flowchart LR
  A[Collect Metrics] --> B[Anonymize]
  B --> C[Dashboards]
  C --> D[Insights to Creative]`,
  },
  {
    id: "legal-compliance",
    emoji: "⚖️",
    name: "Legal & Compliance",
    category: "support",
    status: "AUDITING",
    blurb: "The based backbone. Contracts, rights, privacy, disclaimers — the boring superpower.",
    principle: "Nothing publishes that isn't cleared: rights, privacy, and law, full stop.",
    manifesto:
      "Legal & Compliance is the spine nobody sees. We clear the music, lock the rights, respect privacy law, and write the disclaimers. We hold a hard veto: if it isn't compliant, it doesn't ship — no matter how hard it slaps.",
    mermaid: `flowchart LR
  A[Intake] --> B[Rights Check]
  B --> C[Privacy Review]
  C --> D{Compliant?}
  D -- no --> E[Block Release]
  D -- yes --> F[Approve]`,
  },
  {
    id: "ethics-review",
    emoji: "🧭",
    name: "Ethics Review",
    category: "support",
    status: "REVIEWING",
    blurb: "The conscience with a clipboard. Independent audit of every cut before greenlight.",
    principle: "Independent veto power — answers to the mission, not the metrics.",
    manifesto:
      "Ethics Review is the secret heart of the 'secretly ethical' brand. Independent from production pressure, it audits honesty and consent on every episode and can veto anything that crosses the line. Its loyalty is to the audience and the mission — never to the view count.",
    mermaid: `flowchart LR
  A[Receive Cut] --> B[Honesty Audit]
  B --> C[Consent Audit]
  C --> D{Approved?}
  D -- no --> E[Veto and Notes]
  D -- yes --> F[Greenlight]`,
  },
  {
    id: "talent-casting",
    emoji: "🎭",
    name: "Talent & Casting",
    category: "support",
    status: "SCOUTING",
    blurb: "Finding the faces and voices. Real people, real deals, no exploitation.",
    principle: "Fair pay and informed consent for every contributor, on every project.",
    manifesto:
      "Talent & Casting builds the roster. We scout charisma but contract with conscience: rates are fair and documented, expectations are clear, and consent is informed before anyone signs. Stars are made here — never used up.",
    mermaid: `flowchart LR
  A[Role Brief] --> B[Scout]
  B --> C[Fair Offer]
  C --> D[Informed Consent]
  D --> E[Contract Signed]`,
  },
];

const CATEGORY_LABEL = { core: "Core Pipeline", support: "Support" };

/* ---- helpers ---- */
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

/* ---- render cards ---- */
function cardHTML(d) {
  const catClass = d.category === "core" ? "border-rot-lime/40" : "border-rot-purple/40";
  const catChip =
    d.category === "core"
      ? '<span class="text-[0.65rem] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-rot-lime/10 text-rot-lime border border-rot-lime/40">Core Pipeline</span>'
      : '<span class="text-[0.65rem] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-rot-purple/10 text-rot-purple border border-rot-purple/40">Support</span>';
  return `
  <button type="button"
    class="dept-card group text-left bg-gradient-to-br from-[#14111d] to-[#1b1726] border ${catClass} rounded-2xl p-5 flex flex-col transition duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-rot-lime"
    data-category="${esc(d.category)}" data-id="${esc(d.id)}" aria-haspopup="dialog">
    <div class="flex items-center justify-between mb-3">
      <span class="text-4xl drop-shadow-[0_0_10px_rgba(0,255,159,0.35)]">${esc(d.emoji)}</span>
      ${catChip}
    </div>
    <h3 class="text-xl font-extrabold text-rot-text">${esc(d.name)}</h3>
    <p class="mt-2 text-sm text-rot-muted flex-grow">${esc(d.blurb)}</p>
    <p class="mt-4 pt-3 border-t border-dashed border-white/10 text-xs font-mono text-rot-lime/90">
      <span class="text-rot-purple">secret pill:</span> ${esc(d.principle)}
    </p>
    <div class="mt-4 flex items-center justify-between">
      <span class="status-pill inline-flex items-center gap-1.5 text-[0.7rem] font-mono uppercase tracking-wider text-rot-muted">
        <span class="status-dot w-2 h-2 rounded-full bg-rot-lime"></span>Status: ${esc(d.status)}
      </span>
      <span class="text-xs font-mono text-rot-purple opacity-0 group-hover:opacity-100 transition">open manifesto →</span>
    </div>
  </button>`;
}

const grid = document.getElementById("dept-grid");
if (grid) grid.innerHTML = DEPTS.map(cardHTML).join("");

/* ---- filtering ---- */
const filterBtns = Array.from(document.querySelectorAll("[data-filter]"));
function applyFilter(value) {
  document.querySelectorAll(".dept-card").forEach((card) => {
    const show = value === "all" || card.dataset.category === value;
    card.style.display = show ? "" : "none";
  });
  filterBtns.forEach((b) => {
    const active = b.dataset.filter === value;
    b.classList.toggle("filter-active", active);
    b.setAttribute("aria-pressed", active ? "true" : "false");
  });
}
filterBtns.forEach((b) => b.addEventListener("click", () => applyFilter(b.dataset.filter)));
applyFilter("all");

/* ---- modal ---- */
const modal = document.getElementById("dept-modal");
const modalBody = document.getElementById("dept-modal-body");
let lastFocused = null;

async function openModal(id) {
  const d = DEPTS.find((x) => x.id === id);
  if (!d || !modal || !modalBody) return;
  lastFocused = document.activeElement;

  modalBody.innerHTML = `
    <div class="flex items-center gap-3 mb-1">
      <span class="text-5xl drop-shadow-[0_0_12px_rgba(0,255,159,0.4)]">${esc(d.emoji)}</span>
      <div>
        <p class="text-xs font-mono uppercase tracking-widest text-rot-purple">${esc(CATEGORY_LABEL[d.category])}</p>
        <h2 id="dept-modal-title" class="text-2xl font-extrabold">${esc(d.name)}</h2>
      </div>
    </div>
    <p class="mt-4 text-sm leading-relaxed text-rot-text/90">${esc(d.manifesto)}</p>
    <div class="mt-5 rounded-xl border border-rot-lime/30 bg-rot-lime/5 p-4">
      <p class="text-xs font-mono uppercase tracking-wider text-rot-lime mb-1">Secretly Ethical Principle</p>
      <p class="text-sm text-rot-text">${esc(d.principle)}</p>
    </div>
    <p class="mt-6 mb-2 text-xs font-mono uppercase tracking-wider text-rot-purple">Sub-Workflow</p>
    <div id="dept-diagram" class="mermaid-wrap overflow-x-auto rounded-xl border border-white/10 bg-[#0b0911] p-4 text-center">
      <span class="text-rot-muted text-sm font-mono">rendering diagram…</span>
    </div>`;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
  const closeBtn = modal.querySelector("[data-close]");
  if (closeBtn) closeBtn.focus();

  const wrap = document.getElementById("dept-diagram");
  if (wrap) {
    try { await renderDiagram(wrap, d.mermaid, { toolbar: true }); }
    catch (err) { /* helper renders its own fallback */ }
  }
}

function closeModal() {
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.style.overflow = "";
  if (lastFocused && lastFocused.focus) lastFocused.focus();
}

if (grid)
  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".dept-card");
    if (card) openModal(card.dataset.id);
  });
if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-close]")) closeModal();
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) closeModal();
});

/* ---- fake "live" status flicker ---- */
const ALT = ["COOKING", "LIVE", "BASED", "ROLLING", "SYNCING"];
setInterval(() => {
  const dots = document.querySelectorAll(".dept-card:not([style*='display: none']) .status-pill");
  if (!dots.length) return;
  const pick = dots[Math.floor(Math.random() * dots.length)];
  const label = pick.lastChild;
  // briefly flash an alternate status, then restore
  const original = label.textContent;
  label.textContent = "Status: " + ALT[Math.floor(Math.random() * ALT.length)];
  setTimeout(() => (label.textContent = original), 900);
}, 2600);

/* ---- shared chrome (nav menu, theme, year) duplicated minimally ---- */
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") navLinks.classList.remove("open");
  });
}
const yr = document.getElementById("year");
if (yr) yr.textContent = new Date().getFullYear();
