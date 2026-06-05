/* BRAINROT REPORT 666 — Mermaid Tools
   Shared engine: themed init + a render() that wraps any diagram with a
   zoom/pan viewport, an export toolbar (SVG/PNG), clickable nodes, and a
   dynamic setStatus() to mark nodes COMPLETE/ACTIVE/BLOCKED at runtime. */

import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";

let inited = false;
export function initMermaid() {
  if (inited) return;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    themeVariables: {
      background: "#0b0911",
      primaryColor: "#14111d",
      primaryBorderColor: "#a855f7",
      primaryTextColor: "#e8e6f0",
      lineColor: "#00ff9f",
      secondaryColor: "#1b1726",
      tertiaryColor: "#14111d",
      fontFamily: "Consolas, monospace",
    },
  });
  inited = true;
}

let uid = 0;

/**
 * render(container, definition, opts)
 * opts: { id?, toolbar=true, clickable=false, onNodeClick?(key, el) }
 * returns: { setStatus(key, status), nodes(), root, svgEl }
 */
export async function render(container, definition, opts) {
  opts = opts || {};
  initMermaid();
  const id = opts.id || "mmd-" + ++uid;

  let svg;
  try {
    const out = await mermaid.render(id, definition);
    svg = out.svg;
  } catch (err) {
    container.innerHTML =
      '<pre class="mm-error">' +
      String(definition).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])) +
      "</pre>";
    throw err;
  }

  container.innerHTML = "";
  container.classList.add("mm-container");

  // toolbar
  if (opts.toolbar !== false) {
    const bar = document.createElement("div");
    bar.className = "mm-toolbar";
    bar.innerHTML =
      '<button data-act="in" title="Zoom in" aria-label="Zoom in">＋</button>' +
      '<button data-act="out" title="Zoom out" aria-label="Zoom out">－</button>' +
      '<button data-act="fit" title="Reset / fit" aria-label="Reset view">⟳</button>' +
      '<span class="mm-sep"></span>' +
      '<button data-act="svg" title="Export SVG">SVG</button>' +
      '<button data-act="png" title="Export PNG">PNG</button>';
    container.appendChild(bar);
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const act = b.dataset.act;
      if (act === "in") zoomBy(1.2);
      else if (act === "out") zoomBy(1 / 1.2);
      else if (act === "fit") reset();
      else if (act === "svg") exportSVG();
      else if (act === "png") exportPNG();
    });
  }

  // viewport / stage
  const viewport = document.createElement("div");
  viewport.className = "mm-viewport";
  const stage = document.createElement("div");
  stage.className = "mm-stage";
  stage.innerHTML = svg;
  viewport.appendChild(stage);
  container.appendChild(viewport);

  const svgEl = stage.querySelector("svg");
  if (svgEl) {
    svgEl.removeAttribute("height");
    svgEl.style.maxWidth = "none";
  }

  /* ---- zoom / pan ---- */
  let scale = 1, tx = 0, ty = 0;
  function apply() { stage.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`; }
  function zoomBy(f) { scale = Math.min(4, Math.max(0.2, scale * f)); apply(); }
  function reset() { scale = 1; tx = 0; ty = 0; apply(); }

  viewport.addEventListener("wheel", (e) => {
    e.preventDefault();
    zoomBy(e.deltaY < 0 ? 1.1 : 1 / 1.1);
  }, { passive: false });

  let dragging = false, sx = 0, sy = 0;
  viewport.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, .node")) return; // let clicks through on nodes/links
    dragging = true; sx = e.clientX - tx; sy = e.clientY - ty;
    viewport.setPointerCapture(e.pointerId);
    viewport.classList.add("grabbing");
  });
  viewport.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    tx = e.clientX - sx; ty = e.clientY - sy; apply();
  });
  const endDrag = () => { dragging = false; viewport.classList.remove("grabbing"); };
  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);

  /* ---- clickable nodes ---- */
  function nodeKey(el) {
    const t = el.querySelector(".nodeLabel, span, p, text");
    return ((t && t.textContent) || el.textContent || "").trim();
  }
  const nodeEls = Array.from(stage.querySelectorAll("g.node"));
  if (opts.clickable && typeof opts.onNodeClick === "function") {
    nodeEls.forEach((el) => {
      el.classList.add("mm-clickable");
      el.style.cursor = "pointer";
      el.addEventListener("click", (e) => { e.stopPropagation(); opts.onNodeClick(nodeKey(el), el); });
    });
  }

  /* ---- export ---- */
  function serializedSVG() {
    const clone = svgEl.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
  }
  function download(href, name) {
    const a = document.createElement("a");
    a.href = href; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  }
  function exportSVG() {
    const blob = new Blob([serializedSVG()], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    download(url, id + ".svg");
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  function exportPNG() {
    const box = svgEl.viewBox && svgEl.viewBox.baseVal;
    const w = (box && box.width) || svgEl.clientWidth || 800;
    const h = (box && box.height) || svgEl.clientHeight || 600;
    const img = new Image();
    const svgUrl = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(serializedSVG())));
    img.onload = function () {
      const s = 2; // 2x for crispness
      const canvas = document.createElement("canvas");
      canvas.width = w * s; canvas.height = h * s;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#0b0911"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      try { download(canvas.toDataURL("image/png"), id + ".png"); }
      catch (e) { exportSVG(); } // canvas taint fallback
    };
    img.onerror = exportSVG;
    img.src = svgUrl;
  }

  /* ---- dynamic status ---- */
  function setStatus(key, status) {
    const want = String(key).trim().toLowerCase();
    let hit = false;
    nodeEls.forEach((el) => {
      if (nodeKey(el).toLowerCase() === want || nodeKey(el).toLowerCase().includes(want)) {
        el.classList.remove("mm-complete", "mm-active", "mm-blocked");
        if (status) el.classList.add("mm-" + status);
        el.setAttribute("data-mm-status", status || "");
        hit = true;
      }
    });
    return hit;
  }

  return {
    root: container,
    svgEl,
    nodes: () => nodeEls.map(nodeKey),
    setStatus,
    zoomBy, reset, exportSVG, exportPNG,
  };
}
