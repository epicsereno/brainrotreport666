# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`brainrot report 666` is a **content-production workflow system**, not an application. There is no build, no package manager, no test suite. The repository is a department-structured filing system for producing periodical video/social content, driven by a few bash scripts and JSON metadata. Most directories are empty scaffolding held open by `.gitkeep` files.

The framing throughout is a "secretly ethical campaign" — the content is designed to look effortless/entertaining publicly while every department enforces real ethics, consent, fair-pay, and compliance checks privately. This duality is intentional and documented in `docs/ethics/campaign-principles.md`; preserve it when editing docs or scripts.

## Architecture

Three things define how the repo works together — understand all three before changing anything:

1. **Departments** (`departments/<dept>/...`) — eight departments (creative, production, post-production, distribution, analytics, legal-compliance, community, finance), each a fixed sub-tree of category folders. These are *workspaces*, not code modules.

2. **Episode pipeline** (`episodes/<stage>/`) — episodes flow through stages: `incoming → in-progress → review → ready → published → archived`. Moving an episode = moving its files/metadata between these stage directories.

3. **Episode metadata** (`metadata/episodes/template.json`) — the canonical schema and single source of truth for an episode's state. Every department has a block here with its own `status`, assignment, deliverables, and an embedded review gate (`ethics_review`, `safety_check`, `qc`, etc.). When adding a field or department, update this template so it stays authoritative.

The README's ASCII diagrams (workflow, folder tree, periodical Mon–Sun schedule) describe the intended end state, not necessarily what exists on disk.

## Scripts

Only two scripts currently exist and run:

```bash
# Log a department-to-department handoff (writes shared/handoffs/<EP>_<from>_to_<to>.log
# with a from-department checklist). Run from repo root.
./scripts/workflow/handoff.sh EP001 creative production

# Print an ethics/compliance status report to stdout
./scripts/reports/campaign-ethics.sh [episode-id]
```

`campaign-ethics.sh` has a real syntax bug around line 26 (a heredoc-style line missing its `echo "` prefix) that will error at runtime — fix it before relying on the script.

### Scripts referenced but NOT yet present

`README.md` and `departments/creative/NAMING_CONVENTION.md` document several scripts that do **not** exist in the repo: `scripts/workflow/new-episode.sh`, and a `departments/creative/scripts/` toolchain (`batch-rename.sh`, `lint-script.sh`, `generate-script.py`, `track-assets.py`). Treat those docs as a spec/TODO. If asked to "run" them, they need to be created first; match the documented interfaces (flags, naming format) when you do.

## Conventions

- **File naming** (creative dept, see `departments/creative/NAMING_CONVENTION.md`): `{DEPT}-{EPISODE}-{TYPE}-{descriptor}-v{VERSION}.{ext}`, e.g. `SCRIPT-EP003-FINAL-v3.md`. Department prefixes: `GFX`, `SB`, `THUMB`, `SCRIPT`. Never overwrite — always increment the `-vN` version.
- **Episode IDs**: `EP` + 3-digit zero-pad (`EP001`, `EP042`).
- **`.gitignore`**: all media (`*.mp4`, `*.wav`, `*.png`, `*.psd`, …), secrets, logs, and archives are git-ignored. Brand PNGs (`shared/brand/*.png`) are explicitly allowed. Don't add large binaries expecting them to commit.

## GitHub

Workflow uses PRs from `bRaiNRoTRePoRt666X/...-patch-*` branches merged into the default branch. Local git user here is `epicsereno`.
