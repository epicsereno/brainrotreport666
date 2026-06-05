/* BRAINROT REPORT 666 — Departments HQ
   Renders the 8 repo departments as glowing cards, with global search + category
   filter, and a modal (manifesto + Mermaid sub-workflow + live status + repo tools).
   ES module: imports Mermaid from CDN. */

import { render as renderDiagram } from "./mermaid-tools.js";

const REPO = "https://github.com/epicsereno/brainrotreport666/blob/main/";

/* ---- DATA — the 8 departments that actually exist in the repo
   (docs/departments/*.md): creative, production, post-production, distribution,
   analytics, legal-compliance, community, finance. ---- */
const DEPTS = [
  {
    id: "creative", emoji: "🎬", name: "Creative", category: "core", status: "COOKING",
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
    tools: [
      { label: "NAMING_CONVENTION.md", path: "departments/creative/NAMING_CONVENTION.md" },
      { label: "SCRIPT-EP001-DRAFT-v1.md", path: "departments/creative/scripts/SCRIPT-EP001-DRAFT-v1.md" },
      { label: "docs/departments/creative.md", path: "docs/departments/creative.md" },
    ],
  },
  {
    id: "production", emoji: "📹", name: "Production", category: "core", status: "ROLLING",
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
    tools: [
      { label: "handoff.sh", path: "scripts/workflow/handoff.sh" },
      { label: "docs/departments/production.md", path: "docs/departments/production.md" },
      { label: "handoff-process.md", path: "docs/workflows/handoff-process.md" },
    ],
  },
  {
    id: "post-production", emoji: "🎚️", name: "Post-Production", category: "core", status: "RENDERING",
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
    tools: [
      { label: "episodes/template.json", path: "metadata/episodes/template.json" },
      { label: "docs/departments/post-production.md", path: "docs/departments/post-production.md" },
    ],
  },
  {
    id: "distribution", emoji: "📡", name: "Distribution", category: "core", status: "SHIPPING",
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
    tools: [
      { label: "generate-episodes.js", path: "scripts/site/generate-episodes.js" },
      { label: "docs/departments/distribution.md", path: "docs/departments/distribution.md" },
    ],
  },
  {
    id: "analytics", emoji: "📊", name: "Analytics", category: "support", status: "CRUNCHING",
    blurb: "Numbers don't lie, but they doomscroll. We track what works and feed it back.",
    principle: "Privacy-respecting metrics only — aggregate, anonymized, never creepy.",
    manifesto:
      "Analytics reads the tea leaves of the feed. We measure what resonates and route insight back to Creative — but we refuse to surveil. Data is aggregated and anonymized; growth never comes at the cost of the audience's privacy.",
    mermaid: `flowchart LR
  A[Collect Metrics] --> B[Anonymize]
  B --> C[Dashboards]
  C --> D[Insights to Creative]`,
    tools: [
      { label: "generate-episodes.js", path: "scripts/site/generate-episodes.js" },
      { label: "docs/departments/analytics.md", path: "docs/departments/analytics.md" },
    ],
  },
  {
    id: "legal-compliance", emoji: "⚖️", name: "Legal & Compliance", category: "support", status: "AUDITING",
    blurb: "The based backbone. Contracts, rights, privacy, disclaimers — the boring superpower.",
    principle: "Nothing publishes that isn't cleared: rights, privacy, and law, full stop.",
    manifesto:
      "Legal & Compliance is the spine nobody sees. We clear the music, lock the rights, respect privacy law, and write the disclaimers. We hold a hard veto: if it isn't compliant, it doesn't ship — no matter how hard it slaps. This is also where the secretly-ethical conscience audits every cut before greenlight.",
    mermaid: `flowchart LR
  A[Intake] --> B[Rights Check]
  B --> C[Privacy Review]
  C --> D{Compliant and ethical?}
  D -- no --> E[Block Release]
  D -- yes --> F[Approve]`,
    tools: [
      { label: "campaign-ethics.sh", path: "scripts/reports/campaign-ethics.sh" },
      { label: "campaign-principles.md", path: "docs/ethics/campaign-principles.md" },
      { label: "docs/departments/legal-compliance.md", path: "docs/departments/legal-compliance.md" },
    ],
  },
  {
    id: "community", emoji: "💬", name: "Community", category: "support", status: "VIBING",
    blurb: "The comment-section frontline. Engagement, moderation, feedback and collabs.",
    principle: "Opt-in comms and real moderation — no manufactured outrage, no dark patterns.",
    manifesto:
      "Community is where the empire actually meets the people. We hype the drops and run the DMs, but the engagement is real: communications are opt-in, moderation is human and consistent, and feedback loops straight back into the work. We grow the circle without farming the rage.",
    mermaid: `flowchart LR
  A[Publish Drop] --> B[Engage and Reply]
  B --> C[Moderate]
  C --> D{Feedback?}
  D -- yes --> E[Route to Creative]
  D -- no --> F[Keep Vibing]`,
    tools: [
      { label: "docs/departments/community.md", path: "docs/departments/community.md" },
      { label: "campaign-principles.md", path: "docs/ethics/campaign-principles.md" },
    ],
  },
  {
    id: "finance", emoji: "💰", name: "Finance", category: "support", status: "COUNTING",
    blurb: "Where the bag is tracked. Budgets, invoices, revenue and expense receipts.",
    principle: "Fair pay, documented rates, timely payments — no volunteer exploitation.",
    manifesto:
      "Finance keeps the empire honest with itself. We track every dollar in and out, but the headline rule is fairness: rates are documented, contributors are paid on time, and 'we'll pay you in exposure' is a banned phrase. Sustainability over the grind.",
    mermaid: `flowchart LR
  A[Budget Episode] --> B[Approve Spend]
  B --> C[Pay Contributors]
  C --> D{On time and fair?}
  D -- no --> C
  D -- yes --> E[Log Receipts]`,
    tools: [
      { label: "docs/departments/finance.md", path: "docs/departments/finance.md" },
    ],
  },
];

const CATEGORY_LABEL = { core: "Core Pipeline", support: "Support" };

/* ---- helpers ---- */
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
function haystack(d) {
  return [d.name, d.blurb, d.principle, d.manifesto, d.status,
    (d.tools || []).map((t) => t.label).join(" ")].join(" ").toLowerCase();
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
    class="dept-card group relative text-left bg-gradient-to-br from-[#14111d] to-[#1b1726] border ${catClass} rounded-2xl p-5 flex flex-col transition duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-rot-lime"
    data-category="${esc(d.category)}" data-id="${esc(d.id)}" aria-haspopup="dialog">
    <span class="secret-tag pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition duration-200 text-[0.6rem] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full">🔒 Secretly Ethical</span>
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

/* ---- search + category filter (combined) ---- */
const filterBtns = Array.from(document.querySelectorAll("[data-filter]"));
const searchInput = document.getElementById("dept-search");
const noResults = document.getElementById("dept-no-results");
const countEl = document.getElementById("dept-count");
let activeCategory = "all";
let query = "";

function applyFilters() {
  let shown = 0;
  document.querySelectorAll(".dept-card").forEach((card) => {
    const d = DEPTS.find((x) => x.id === card.dataset.id);
    const catOk = activeCategory === "all" || card.dataset.category === activeCategory;
    const qOk = !query || (d && haystack(d).includes(query));
    const show = catOk && qOk;
    card.style.display = show ? "" : "none";
    if (show) shown++;
  });
  if (noResults) noResults.classList.toggle("hidden", shown !== 0);
  if (countEl) countEl.textContent = shown + " / " + DEPTS.length + " depts";
}

filterBtns.forEach((b) =>
  b.addEventListener("click", () => {
    activeCategory = b.dataset.filter;
    filterBtns.forEach((x) => {
      const active = x === b;
      x.classList.toggle("filter-active", active);
      x.setAttribute("aria-pressed", active ? "true" : "false");
    });
    applyFilters();
  })
);
if (searchInput) {
  searchInput.addEventListener("input", () => {
    query = searchInput.value.trim().toLowerCase();
    applyFilters();
  });
}
applyFilters();

/* ---- modal ---- */
const modal = document.getElementById("dept-modal");
const modalBody = document.getElementById("dept-modal-body");
let lastFocused = null;

async function openModal(id) {
  const d = DEPTS.find((x) => x.id === id);
  if (!d || !modal || !modalBody) return;
  lastFocused = document.activeElement;

  const tools = (d.tools || []).map((t) =>
    `<a href="${REPO}${esc(t.path)}" target="_blank" rel="noopener"
        class="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg border border-white/10 bg-[#0b0911] text-rot-lime hover:border-rot-lime hover:text-rot-lime transition">
        <span class="text-rot-muted">↗</span>${esc(t.label)}</a>`
  ).join("");

  modalBody.innerHTML = `
    <div class="flex items-center gap-3 mb-1">
      <span class="text-5xl drop-shadow-[0_0_12px_rgba(0,255,159,0.4)]">${esc(d.emoji)}</span>
      <div>
        <p class="text-xs font-mono uppercase tracking-widest text-rot-purple">${esc(CATEGORY_LABEL[d.category])}</p>
        <h2 id="dept-modal-title" class="text-2xl font-extrabold">${esc(d.name)}</h2>
      </div>
      <span class="ml-auto inline-flex items-center gap-1.5 text-[0.7rem] font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-rot-lime/10 text-rot-lime border border-rot-lime/40">
        <span class="status-dot w-2 h-2 rounded-full bg-rot-lime"></span>${esc(d.status)} 🔥
      </span>
    </div>
    <p class="mt-4 text-sm leading-relaxed text-rot-text/90">${esc(d.manifesto)}</p>
    <div class="mt-5 rounded-xl border border-rot-lime/30 bg-rot-lime/5 p-4">
      <p class="text-xs font-mono uppercase tracking-wider text-rot-lime mb-1">🔒 Secretly Ethical Principle</p>
      <p class="text-sm text-rot-text">${esc(d.principle)}</p>
    </div>
    <p class="mt-6 mb-2 text-xs font-mono uppercase tracking-wider text-rot-purple">Sub-Workflow</p>
    <div id="dept-diagram" class="mermaid-wrap overflow-x-auto rounded-xl border border-white/10 bg-[#0b0911] p-4 text-center">
      <span class="text-rot-muted text-sm font-mono">rendering diagram…</span>
    </div>
    <p class="mt-6 mb-2 text-xs font-mono uppercase tracking-wider text-rot-purple">Key Scripts &amp; Tools</p>
    <div class="flex flex-wrap gap-2">${tools || '<span class="text-rot-muted text-sm font-mono">— no tracked tools yet</span>'}</div>`;

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
  const original = label.textContent;
  label.textContent = "Status: " + ALT[Math.floor(Math.random() * ALT.length)];
  setTimeout(() => (label.textContent = original), 900);
}, 2600);

/* nav menu + theme + year handled globally by theme.js */
