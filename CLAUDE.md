# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`brainrot report 666` is two layers in one repo, joined by a generator script:

1. A **content-production workflow system** — a department-structured filing system for producing periodical video/social content, driven by a few bash scripts and JSON metadata. Most filing directories are empty scaffolding held open by `.gitkeep` files.
2. A **public GitHub Pages website** (`*.html` + `assets/site/`) — a multi-page, zero-build static site that presents the empire and renders episode/department/workflow data live in the browser.

There is no package manager, no bundler, and no test suite. The only "build" is a single Node script that scans episode markdown and emits JSON the site reads (see *Site ⇄ workflow bridge*).

The framing throughout is a "secretly ethical campaign" — the content is designed to look effortless/entertaining publicly while every department enforces real ethics, consent, fair-pay, and compliance checks privately. This duality is intentional and documented in `docs/ethics/campaign-principles.md`; preserve it when editing docs or scripts.

## Architecture — workflow layer

Three things define how the filing system works together — understand all three before changing anything:

1. **Departments** (`departments/<dept>/...`) — eight departments (creative, production, post-production, distribution, analytics, legal-compliance, community, finance), each a fixed sub-tree of category folders. These are *workspaces*, not code modules.

2. **Episode pipeline** (`episodes/<stage>/`) — episodes flow through stages: `incoming → in-progress → review → ready → published → archived`. Moving an episode = moving its files/metadata between these stage directories.

3. **Episode metadata** (`metadata/episodes/template.json`) — the canonical schema and single source of truth for an episode's state. Every department has a block here with its own `status`, assignment, deliverables, and an embedded review gate (`ethics_review`, `safety_check`, `qc`, etc.). When adding a field or department, update this template so it stays authoritative.

The README's ASCII diagrams (workflow, folder tree, periodical Mon–Sun schedule) describe the intended end state, not necessarily what exists on disk.

## Architecture — website layer

The site is plain HTML + vanilla JS, no framework or build step. Each top-level `*.html` page (`index`, `episodes`, `departments`, `workflow`, `ethics`, `contribute`) loads its scripts from `assets/site/`. Two scripts load on **every** page as classic `<script>` tags and provide shared behavior:

- `theme.js` — dark/light theme toggle (persisted in `localStorage`, key `br666-theme`) **and** the universal hamburger mobile menu. Nav/footer/menu markup is duplicated per page, so this keeps them in sync.
- `github.js` — pulls live repo stats + latest commits from the public GitHub API (`epicsereno/brainrotreport666`); degrades to placeholders on rate-limit/offline.

Page-specific logic is split into one file per page (`main.js`, `episodes.js`, `departments.js`, etc.). The richer ones are **ES modules** (`type="module"`): `dashboard.js` (homepage live metrics + EP001 pipeline bars) and anything importing `mermaid-tools.js` — a shared engine that themes Mermaid (loaded from the jsDelivr CDN as an ESM import) and wraps diagrams with zoom/pan, SVG/PNG export, and runtime node status. Classic scripts and modules coexist; keep cross-page shared code (theme, github) as classic scripts and per-page interactive code as modules, matching the existing split.

PWA: `sw.js` is a same-origin cache-first service worker (cache name `br666-v1`) that deliberately **never** intercepts cross-origin requests, so the Mermaid CDN and GitHub API stay live. `manifest.webmanifest` + `assets/icon.svg` make it installable. When you change cached assets, bump the cache name in `sw.js`.

### Site ⇄ workflow bridge

This is the seam that ties the two layers together. `scripts/site/generate-episodes.js` (Node, zero deps) walks `episodes/**/*.md`, parses each file's YAML-ish frontmatter, and emits `assets/site/episodes.json`, which the site fetches at runtime to render episode cards and the homepage spotlight.

```bash
node scripts/site/generate-episodes.js          # regenerate episodes.json
node scripts/site/generate-episodes.js --check  # exit 1 if episodes.json is stale (CI guard)
```

Consequence: **after adding or editing any episode markdown, re-run the generator and commit the updated `episodes.json`** or the site will be out of date. Only `.md` files with an `id:` in their frontmatter are treated as episodes. The frontmatter contract is `id, title, status, date, thumb, runtime, description, tags` (comma list), `teaser, link` — see `episodes/in-progress/EP001.md` for the canonical example.

## Deployment

Hosted on **GitHub Pages** at `https://epicsereno.github.io/brainrotreport666/`. `.nojekyll` disables Jekyll processing; all asset URLs are repo-relative so they resolve under the `/brainrotreport666/` base path. `sitemap.xml` + `robots.txt` are committed and reference that public URL. Serve locally with a static server from the repo root, e.g. `python3 -m http.server 8000`.

## Scripts

Workflow scripts (run from repo root):

```bash
# Log a department-to-department handoff (writes shared/handoffs/<EP>_<from>_to_<to>.log
# with a from-department checklist).
./scripts/workflow/handoff.sh EP001 creative production

# Print an ethics/compliance status report to stdout (optional episode-id arg)
./scripts/reports/campaign-ethics.sh [episode-id]
```

### Scripts referenced but NOT yet present

`README.md` and `departments/creative/NAMING_CONVENTION.md` document several scripts that do **not** exist in the repo: `scripts/workflow/new-episode.sh`, and a `departments/creative/scripts/` toolchain (`batch-rename.sh`, `lint-script.sh`, `generate-script.py`, `track-assets.py`). Treat those docs as a spec/TODO. If asked to "run" them, they need to be created first; match the documented interfaces (flags, naming format) when you do.

## Conventions

- **File naming** (creative dept, see `departments/creative/NAMING_CONVENTION.md`): `{DEPT}-{EPISODE}-{TYPE}-{descriptor}-v{VERSION}.{ext}`, e.g. `SCRIPT-EP003-FINAL-v3.md`. Department prefixes: `GFX`, `SB`, `THUMB`, `SCRIPT`. Never overwrite — always increment the `-vN` version.
- **Episode IDs**: `EP` + 3-digit zero-pad (`EP001`, `EP042`).
- **`.gitignore`**: all media (`*.mp4`, `*.wav`, `*.png`, `*.psd`, …), secrets, logs, and archives are git-ignored. Brand PNGs (`shared/brand/*.png`) are explicitly allowed. Don't add large binaries expecting them to commit.

## GitHub

Workflow uses PRs from `bRaiNRoTRePoRt666X/...-patch-*` branches merged into the default branch. Local git user here is `epicsereno`.
