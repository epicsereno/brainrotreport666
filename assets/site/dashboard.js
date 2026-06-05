/* BRAINROT REPORT 666 — homepage live dashboard
   Fake-but-honest metrics, EP001 pipeline progress bars tied to a Mermaid diagram,
   and a Touch Grass counter. */

import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";

mermaid.initialize({
  startOnLoad: false,
  securityLevel: "strict",
  theme: "base",
  themeVariables: {
    background: "#0b0911",
    primaryColor: "#14111d",
    primaryBorderColor: "#2a2440",
    primaryTextColor: "#e8e6f0",
    lineColor: "#00ff9f",
    fontFamily: "Consolas, monospace",
  },
});

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
  try {
    const { svg } = await mermaid.render("ep1-pipeline-svg", def);
    wrap.innerHTML = svg;
  } catch (err) {
    wrap.innerHTML = '<pre style="text-align:left;color:var(--muted);font-size:0.72rem">' +
      def.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])) + "</pre>";
  }
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

/* ---- Touch Grass counter (persisted, increments on click) ---- */
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
  });
}
