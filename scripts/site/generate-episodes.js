#!/usr/bin/env node
/* BRAINROT REPORT 666 — episode card generator
 *
 * Scans episodes/<stage>/*.md for YAML-ish frontmatter and emits
 * assets/site/episodes.json (consumed by episodes.js / main.js).
 *
 * Zero dependencies. Run from repo root:
 *   node scripts/site/generate-episodes.js
 *   node scripts/site/generate-episodes.js --check   # exit 1 if JSON is stale
 *
 * Frontmatter keys: id, title, status, date, thumb, runtime, description,
 *                   tags (comma list), teaser, link
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const EP_DIR = path.join(ROOT, "episodes");
const OUT = path.join(ROOT, "assets", "site", "episodes.json");
const checkOnly = process.argv.includes("--check");

/* recursively collect .md files under episodes/ */
function walk(dir, acc) {
  acc = acc || [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return acc; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.isFile() && e.name.toLowerCase().endsWith(".md")) acc.push(full);
  }
  return acc;
}

/* minimal frontmatter parser (handles quotes, `>` folded blocks, comma lists) */
function parseFrontmatter(text) {
  const m = text.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return null;
  const out = {};
  const lines = m[1].split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const kv = line.match(/^([A-Za-z0-9_]+):\s?(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let val = kv[2];
    if (val === ">" || val === "|") {
      // folded/literal block: gather subsequent indented lines
      const buf = [];
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) {
        buf.push(lines[++i].trim());
      }
      val = buf.join(" ");
    }
    val = val.replace(/^["']|["']$/g, "").trim();
    out[key] = val;
  }
  return out;
}

function toEpisode(fm) {
  const tags = fm.tags
    ? fm.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  return {
    id: fm.id || null,
    title: fm.title || "Untitled",
    status: fm.status || "incoming",
    date: fm.date || null,
    thumb: fm.thumb || fm.id || "BR666",
    runtime: fm.runtime || null,
    description: fm.description || "",
    tags,
    teaser: fm.teaser ? fm.teaser : null,
    link: fm.link || null,
  };
}

const files = walk(EP_DIR);
const episodes = [];
for (const f of files) {
  const fm = parseFrontmatter(fs.readFileSync(f, "utf8"));
  if (!fm || !fm.id) continue; // skip non-episode markdown
  episodes.push(toEpisode(fm));
}
episodes.sort((a, b) => String(b.date).localeCompare(String(a.date)));

const json = JSON.stringify({ episodes }, null, 2) + "\n";

if (checkOnly) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (current !== json) {
    console.error("[generate-episodes] OUT OF DATE — run: node scripts/site/generate-episodes.js");
    process.exit(1);
  }
  console.log("[generate-episodes] episodes.json is up to date (" + episodes.length + " episodes)");
  process.exit(0);
}

fs.writeFileSync(OUT, json);
console.log(
  "[generate-episodes] wrote " + path.relative(ROOT, OUT) + " — " +
  episodes.length + " episode(s): " + episodes.map((e) => e.id).join(", ")
);
