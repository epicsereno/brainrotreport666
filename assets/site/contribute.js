/* BRAINROT REPORT 666 — Contribute page
   Renders the contribution-flow diagram with the shared Mermaid engine. */
import { render as renderDiagram } from "./mermaid-tools.js";

const FLOW = `flowchart LR
  A([Fork / branch]) --> B[bRaiNRoTRePoRt666X/<br/>...-patch-*]
  B --> C{Run the gates}
  C -->|ethics| D[campaign-ethics.sh]
  C -->|naming| E[DEPT-EPxxx-TYPE-vN]
  D --> F[Open PR -> main]
  E --> F
  F --> G{Review}
  G -->|changes| B
  G -->|based| H([Merged - touch grass])`;

const el = document.getElementById("contribute-flow");
if (el) {
  renderDiagram(el, FLOW, { id: "contribute-flow-svg", clickable: false })
    .catch(function () {
      el.innerHTML = '<p class="empty-state">diagram failed to load — run from a web server, not file://</p>';
    });
}
