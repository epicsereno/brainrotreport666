/* BRAINROT REPORT 666 — homepage live dashboard
   Fake-but-honest metrics, EP001 pipeline progress bars tied to a Mermaid diagram,
   and a Touch Grass counter. */

import { render as renderDiagram } from "./mermaid-tools.js";

/* EP001 pipeline stages (mock production state) */
const STAGES = [
  { name: "Creative", pct: 100, state: "done", node: "C" },
  { name: "Production", pct: 65, state: "current", node: "P" },
  { name: "Post-Production", pct: 15, state: "pending", node: "O" },
  { name: "Distribution", pct: 0, state: "pending", node: "D" },
];

/* ---- progress bars ---- */
const bars = document.getElementById("ep1-progress");
if (bars) {
  bars.innerHTML = STAGES.map(
    (s) => `
    <div class="progress-item ${s.state}">
      <div class="progress-head"><span class="stage-name">${s.name}</span><span>${s.pct}%</span></div>
      <div class="progress-track"><div class="progress-fill" data-pct="${s.pct}"></div></div>
    </div>`
  ).join("");
  // animate fills after paint
  requestAnimationFrame(() =>
    bars.querySelectorAll(".progress-fill").forEach((f) => (f.style.width = f.dataset.pct + "%"))
  );
}

/* ---- Mermaid pipeline, classes tied to stage state ---- */
async function renderPipeline() {
  const wrap = document.getElementById("ep1-pipeline");
  if (!wrap) return;
  const classLines = STAGES.filter((s) => s.state !== "pending")
    .map((s) => `  class ${s.node} ${s.state}`)
    .join("\n");
  const def = `flowchart LR
  C[Creative] --> P[Production]
  P --> O[Post-Prod]
  O --> D[Distribution]
${classLines}
  classDef done fill:#00ff9f,stroke:#00ff9f,color:#04110b,font-weight:bold
  classDef current fill:#a855f7,stroke:#a855f7,color:#ffffff,font-weight:bold`;
  try { await renderDiagram(wrap, def, { id: "ep1-pipeline-svg", toolbar: true }); }
  catch (err) { /* helper renders its own fallback */ }
}
renderPipeline();

/* ---- metric: Episodes Dropped (from real data: published count) ---- */
const dropped = document.getElementById("metric-dropped");
if (dropped) {
  fetch("assets/site/episodes.json")
    .then((r) => r.json())
    .then((d) => {
      const n = (d.episodes || []).filter((e) => e.status === "published").length;
      dropped.textContent = String(n);
    })
    .catch(() => (dropped.textContent = "1"));
}

/* ---- metric: Souls Saved count-up to 666K ---- */
const souls = document.getElementById("metric-souls");
if (souls) {
  let v = 0;
  const target = 666;
  const tick = () => {
    v += Math.ceil((target - v) / 12) || 1;
    if (v >= target) { v = target; souls.textContent = "666K"; return; }
    souls.textContent = v + "K";
    requestAnimationFrame(tick);
  };
  tick();
}

/* ---- metric: Rizz Level — count up, then flex "OVER 9000" ---- */
const rizz = document.getElementById("metric-rizz");
if (rizz) {
  let v = 0;
  const target = 9001;
  const tick = () => {
    v += Math.ceil((target - v) / 14) || 1;
    if (v >= target) { rizz.textContent = "OVER 9000"; return; }
    rizz.textContent = v.toLocaleString();
    requestAnimationFrame(tick);
  };
  tick();
}

/* ---- confetti (dependency-free, respects reduced motion) ---- */
const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const CONFETTI_COLORS = ["#00ff9f", "#a855f7", "#ff2e88", "#ffffff", "#7CFC9A"];
function burstConfetti(x, y) {
  if (reduceMotion) return;
  for (let i = 0; i < 26; i++) {
    const p = document.createElement("div");
    p.className = "confetti-piece";
    p.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    document.body.appendChild(p);
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 140;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist + 120 + Math.random() * 120; // bias downward (gravity)
    const rot = (Math.random() * 720 - 360) + "deg";
    p.animate(
      [
        { transform: `translate(${x}px, ${y}px) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${x + dx}px, ${y + dy}px) rotate(${rot})`, opacity: 0 },
      ],
      { duration: 800 + Math.random() * 600, easing: "cubic-bezier(.2,.8,.3,1)" }
    ).onfinish = () => p.remove();
  }
}

/* ---- Touch Grass counter (persisted, increments on click, confetti) ---- */
const GKEY = "br666-grass-touched";
const grassOut = document.getElementById("metric-grass");
const grassBtn = document.getElementById("grass-touch-btn");
function readGrass() {
  try { return parseInt(localStorage.getItem(GKEY) || "0", 10) || 0; } catch (e) { return 0; }
}
let grass = readGrass();
if (grassOut) grassOut.textContent = grass.toLocaleString();
const QUIPS = ["based.", "log off king 👑", "vitamin D acquired", "touch detected ✅", "the grass is winning", "+1 serotonin"];
if (grassBtn && grassOut) {
  grassBtn.addEventListener("click", () => {
    grass += 1;
    try { localStorage.setItem(GKEY, String(grass)); } catch (e) {}
    grassOut.textContent = grass.toLocaleString();
    grassBtn.textContent = "🌱 " + QUIPS[grass % QUIPS.length];
    grassOut.animate(
      [{ transform: "scale(1.3)", color: "#7CFC9A" }, { transform: "scale(1)" }],
      { duration: 280, easing: "ease-out" }
    );
    const r = grassBtn.getBoundingClientRect();
    burstConfetti(r.left + r.width / 2, r.top + r.height / 2);
  });
}

/* ---- "Deploy New Episode" — simulates scripts/workflow/new-episode.sh ---- */
const EKEY = "br666-next-ep";
const deployBtn = document.getElementById("deploy-btn");
const deployStatus = document.getElementById("deploy-status");
const deployConsole = document.getElementById("deploy-console");
function nextEpNumber() {
  try { return parseInt(localStorage.getItem(EKEY) || "7", 10) || 7; } catch (e) { return 7; }
}
function epId(n) { return "EP" + String(n).padStart(3, "0"); }

if (deployBtn && deployConsole) {
  deployBtn.addEventListener("click", () => {
    const n = nextEpNumber();
    const ep = epId(n);
    const lines = [
      { t: `$ ./scripts/workflow/new-episode.sh ${ep}`, cls: "cmd" },
      { t: `→ scaffolding episodes/incoming/${ep}/ …`, cls: "muted" },
      { t: `→ seeding metadata from metadata/episodes/template.json …`, cls: "muted" },
      { t: `→ writing department blocks: creative · production · post-production · distribution`, cls: "muted" },
      { t: `→ support gates: analytics · legal-compliance · community · finance`, cls: "muted" },
      { t: `→ ethics_review: PENDING · safety_check: PENDING · qc: PENDING`, cls: "muted" },
      { t: `✓ ${ep} created — stage: incoming. handoff → creative ready.`, cls: "ok" },
    ];

    deployBtn.classList.add("deploy-btn-busy");
    deployBtn.setAttribute("aria-busy", "true");
    if (deployStatus) {
      deployStatus.className = "deploy-status running";
      deployStatus.innerHTML = `<span class="dot"></span> deploying ${ep}…`;
    }
    deployConsole.innerHTML = "";

    let i = 0;
    const step = () => {
      if (i < lines.length) {
        const span = document.createElement("span");
        span.className = lines[i].cls;
        span.textContent = lines[i].t;
        deployConsole.appendChild(span);
        deployConsole.appendChild(document.createTextNode("\n"));
        deployConsole.scrollTop = deployConsole.scrollHeight;
        i++;
        setTimeout(step, 380);
      } else {
        try { localStorage.setItem(EKEY, String(n + 1)); } catch (e) {}
        if (deployStatus) {
          deployStatus.className = "deploy-status done";
          deployStatus.innerHTML = `<span class="dot"></span> ${ep} queued → incoming`;
        }
        deployBtn.classList.remove("deploy-btn-busy");
        deployBtn.removeAttribute("aria-busy");
        alert(`🚀 ${ep} deployed to the pipeline!\n\nStage: incoming → routed to Creative.\nEthics + safety gates set to PENDING (secretly ethical, always).`);
      }
    };
    step();
  });
}
