#!/usr/bin/env bash
# Storyboard JSON-to-HTML Renderer
# Usage:
#   ./scripts/workflow/render-storyboard.sh storyboard.json > storyboard.html
#   cat storyboard.json | ./scripts/workflow/render-storyboard.sh > storyboard.html

# Exit on any error
set -e

# Verify jq is installed
if ! command -v jq &> /dev/null; then
  echo "Error: jq is required but not installed." >&2
  exit 1
fi

# Helper to generate inline SVG badge for a segment
get_badge_svg() {
  local segment_id="$1"
  local name=""
  local beat=""
  local accent=""
  local glyph=""
  local n=0
  local code=""

  case "$segment_id" in
    concrete_dispatch) n=2; code="0xA2"; name="Deck Check"; beat="skate culture & spots"; accent="#FF8A00"; glyph="skate" ;;
    beef_tracker) n=12; code="0xAC"; name="Saint Circuit"; beat="ritual / occult satire"; accent="#FF006E"; glyph="circuit" ;;
    lowrider_lab) n=3; code="0xA3"; name="Rust & Boost"; beat="tuning · diagnostics"; accent="#00E5FF"; glyph="piston" ;;
    saint_of_the_day) n=4; code="0xA4"; name="Sacred Static"; beat="chicano iconography"; accent="#FF2D6E"; glyph="heart" ;;
    slang_forge) n=5; code="0xA5"; name="Slop Feed"; beat="internet brainrot"; accent="#B388FF"; glyph="drip" ;;
    cook_up) n=6; code="0xA6"; name="Night Market"; beat="discount street economy"; accent="#FFD000"; glyph="tag" ;;
    wall_watch) n=1; code="0xA1"; name="Street Wire"; beat="bombing & graf dispatch"; accent="#C6FF2E"; glyph="spray" ;;
    doom_scroll) n=8; code="0xA8"; name="Doom Scroll"; beat="attention & algorithm"; accent="#FF3B3B"; glyph="spiral" ;;
    gear_drop) n=9; code="0xA9"; name="Crypt Merch"; beat="drops & storefront"; accent="#7CFFB2"; glyph="crate" ;;
    crate_digger) n=10; code="0xAA"; name="Low Frequency"; beat="music · audio · bass"; accent="#00B3FF"; glyph="wave" ;;
    code_gremlin) n=11; code="0xAB"; name="Code Gremlin"; beat="dev tooling brainrot"; accent="#9DFF00"; glyph="bug" ;;
    lore_drop) n=13; code="0xAD"; name="Field Static"; beat="loose dispatch"; accent="#C0C0C8"; glyph="signal" ;;
    barrio_bulletin) n=13; code="0xAD"; name="Field Static"; beat="loose dispatch"; accent="#C0C0C8"; glyph="signal" ;;
    *) echo ""; return 0 ;;
  esac

  local glyph_markup=""
  case "$glyph" in
    spray) glyph_markup='<g stroke="'$accent'" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="20" y="22" width="20" height="34" rx="2.5"/><rect x="24.5" y="14" width="11" height="8" rx="1.5"/><line x1="24.5" y1="14" x2="24.5" y2="9"/><line x1="35.5" y1="14" x2="35.5" y2="9"/><circle cx="48" cy="10" r="1.6" fill="'$accent'" stroke="none"/><circle cx="53" cy="16" r="1.6" fill="'$accent'" stroke="none"/><circle cx="46" cy="20" r="1.6" fill="'$accent'" stroke="none"/><circle cx="52" cy="7" r="1.6" fill="'$accent'" stroke="none"/></g>' ;;
    skate) glyph_markup='<g stroke="'$accent'" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 30 Q32 38 50 30"/><line x1="14" y1="30" x2="11" y2="27"/><line x1="50" y1="30" x2="53" y2="27"/><circle cx="22" cy="42" r="4.5"/><circle cx="42" cy="42" r="4.5"/><line x1="22" y1="37.5" x2="22" y2="34"/><line x1="42" y1="37.5" x2="42" y2="34"/></g>' ;;
    piston) glyph_markup='<g stroke="'$accent'" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="24" y="14" width="16" height="16" rx="2"/><line x1="32" y1="30" x2="32" y2="40"/><circle cx="32" cy="46" r="9"/><circle cx="32" cy="46" r="2.4" fill="'$accent'" stroke="none"/><line x1="32" y1="37" x2="32" y2="33"/><line x1="41" y1="46" x2="46" y2="46"/><line x1="23" y1="46" x2="18" y2="46"/></g>' ;;
    heart) glyph_markup='<g stroke="'$accent'" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M32 50 C16 38 18 24 27 24 C31 24 32 27 32 29 C32 27 33 24 37 24 C46 24 48 38 32 50Z"/><path d="M32 24 C32 18 28 16 31 11" /><path d="M32 24 C33 19 37 17 34 12"/><line x1="20" y1="20" x2="16" y2="16"/><line x1="44" y1="20" x2="48" y2="16"/><line x1="32" y1="16" x2="32" y2="10"/></g>' ;;
    drip) glyph_markup='<g stroke="'$accent'" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 18 H46 V36 Q46 40 42 40 V48 Q42 51 39 48 V40 H34 V44 Q34 47 31 44 V40 H26 V52 Q26 55 23 52 V40 Q18 40 18 36 Z"/><circle cx="22" cy="58" r="1.7" fill="'$accent'" stroke="none"/><circle cx="40" cy="55" r="1.7" fill="'$accent'" stroke="none"/></g>' ;;
    tag) glyph_markup='<g stroke="'$accent'" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M16 32 L34 14 L52 14 L52 32 L34 50 Z"/><circle cx="44" cy="22" r="3.2"/><line x1="24" y1="34" x2="34" y2="44"/></g>' ;;
    needle) glyph_markup='<g stroke="'$accent'" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M44 18 L50 24 L30 44 L24 44 L24 38 Z"/><line x1="24" y1="44" x2="16" y2="52"/><line x1="40" y1="22" x2="46" y2="28"/><circle cx="20" cy="48" r="1.6" fill="'$accent'" stroke="none"/></g>' ;;
    spiral) glyph_markup='<g stroke="'$accent'" stroke-width="3.2" fill="none" stroke-linecap="round"><path d="M32 32 m0 -2 a2 2 0 1 1 -2 2 a6 6 0 1 1 6 -6 a10 10 0 1 1 -10 10 a14 14 0 1 1 14 -14 a18 18 0 1 1 -18 18"/></g>' ;;
    crate) glyph_markup='<g stroke="'$accent'" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="18" width="32" height="32" rx="2"/><line x1="16" y1="18" x2="48" y2="50"/><line x1="48" y1="18" x2="16" y2="50"/><line x1="16" y1="26" x2="48" y2="26"/><line x1="16" y1="42" x2="48" y2="42"/></g>' ;;
    wave) glyph_markup='<g stroke="'$accent'" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 34 H18 L22 22 L28 46 L34 18 L40 42 L44 30 H52"/></g>' ;;
    bug) glyph_markup='<g stroke="'$accent'" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 22 L14 32 L22 42"/><path d="M42 22 L50 32 L42 42"/><ellipse cx="32" cy="34" rx="6" ry="9"/><line x1="32" y1="20" x2="32" y2="25"/><line x1="26" y1="30" x2="20" y2="28"/><line x1="38" y1="30" x2="44" y2="28"/><line x1="26" y1="38" x2="20" y2="40"/><line x1="38" y1="38" x2="44" y2="40"/></g>' ;;
    circuit) glyph_markup='<g stroke="'$accent'" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="32" y1="14" x2="32" y2="50"/><line x1="18" y1="32" x2="46" y2="32"/><circle cx="32" cy="11" r="2.6"/><circle cx="32" cy="53" r="2.6"/><circle cx="15" cy="32" r="2.6"/><circle cx="49" cy="32" r="2.6"/><circle cx="32" cy="32" r="6"/></g>' ;;
    signal) glyph_markup='<g stroke="'$accent'" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="32" y1="34" x2="32" y2="52"/><polyline points="27,52 37,52"/><circle cx="32" cy="30" r="3" fill="'$accent'" stroke="none"/><path d="M24 24 Q22 30 24 36"/><path d="M40 24 Q42 30 40 36"/><path d="M19 19 Q15 30 19 41"/><path d="M45 19 Q49 30 45 41"/></g>' ;;
  esac

  local id=$(echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')
  local pad_n=$(printf "%02d" $n)

  local words=($name)
  local line1=""
  local line2=""
  if [ ${#words[@]} -gt 1 ]; then
    local len=${#words[@]}
    local half=$(( (len + 1) / 2 ))
    line1="${words[@]:0:half}"
    line2="${words[@]:half}"
  else
    line1="$name"
  fi

  local name_block=""
  if [ -n "$line2" ]; then
    name_block="<text x=\"30\" y=\"350\" class=\"nm\">${line1^^}</text><text x=\"30\" y=\"392\" class=\"nm\">${line2^^}</text>"
  else
    name_block="<text x=\"30\" y=\"372\" class=\"nm\">${line1^^}</text>"
  fi

  cat <<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 460" width="100%" height="100%">
  <defs>
    <pattern id="ht-${id}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
      <circle cx="2" cy="2" r="1.15" fill="${accent}" opacity="0.14"/>
    </pattern>
    <style>
      .nm{font-family:'Anton','Archivo Black',Impact,sans-serif;fill:#ededea;font-size:40px;letter-spacing:.5px;text-transform:uppercase}
      .mono{font-family:'Space Mono','Courier New',monospace;fill:#7c7c88;font-size:13px;letter-spacing:2px}
      .monoA{font-family:'Space Mono','Courier New',monospace;font-weight:700;font-size:13px;letter-spacing:2px}
      .num{font-family:'Anton',Impact,sans-serif;font-size:88px}
    </style>
  </defs>
  <rect x="0" y="0" width="360" height="460" fill="#0b0b0c"/>
  <rect x="0" y="0" width="360" height="460" fill="url(#ht-${id})"/>
  <rect x="22" y="22" width="316" height="416" fill="none" stroke="#26262e" stroke-width="2"/>
  <rect x="22" y="22" width="316" height="416" fill="none" stroke="${accent}" stroke-width="2" stroke-dasharray="2 10"/>

  <text x="30" y="58" class="mono">BRAINROT REPORT</text>
  <text x="330" y="58" text-anchor="end" class="monoA" fill="${accent}">666</text>
  <line x1="30" y1="70" x2="330" y2="70" stroke="#26262e" stroke-width="2"/>

  <text x="30" y="150" class="num" fill="${accent}">${pad_n}</text>
  <text x="330" y="112" text-anchor="end" class="mono">DEPT</text>
  <text x="330" y="132" text-anchor="end" class="monoA" fill="#ededea">${code}</text>

  <g transform="translate(180 240)">
    <circle r="64" fill="none" stroke="${accent}" stroke-width="2"/>
    <circle r="56" fill="none" stroke="#26262e" stroke-width="10"/>
    <g transform="translate(-64 -64) scale(2)">${glyph_markup}</g>
  </g>

  <line x1="30" y1="318" x2="330" y2="318" stroke="${accent}" stroke-width="3"/>
  ${name_block}

  <line x1="30" y1="406" x2="330" y2="406" stroke="#26262e" stroke-width="2"/>
  <text x="30" y="426" class="mono">BEAT//</text>
  <text x="86" y="426" class="monoA" fill="${accent}">${beat^^}</text>
</svg>
SVG
}

# Read input (file argument or stdin)
INPUT="/dev/stdin"
if [ -n "$1" ]; then
  if [ -f "$1" ]; then
    INPUT="$1"
  else
    echo "Error: File '$1' not found." >&2
    exit 1
  fi
fi

# Load JSON content
JSON_DATA=$(cat "$INPUT")

# Simple validation
if ! echo "$JSON_DATA" | jq empty &>/dev/null; then
  echo "Error: Input is not valid JSON." >&2
  exit 1
fi

# Extract top-level metadata
REPORT_ID=$(echo "$JSON_DATA" | jq -r '.report_id // "666"')
EDITION_DATE=$(echo "$JSON_DATA" | jq -r '.edition_date // ""')
EDITION_NO=$(echo "$JSON_DATA" | jq -r '.edition_no // 0')
THEME=$(echo "$JSON_DATA" | jq -r '.theme // ""')

# Extract Cold Open
COLD_HOOK=$(echo "$JSON_DATA" | jq -r '.cold_open.hook // ""')
COLD_DEK=$(echo "$JSON_DATA" | jq -r '.cold_open.dek // ""')
COLD_VISUAL=$(echo "$JSON_DATA" | jq -r '.cold_open.visual_direction // ""')

# Extract Sign Off
SIGN_HOOK=$(echo "$JSON_DATA" | jq -r '.sign_off.hook // ""')
SIGN_DEK=$(echo "$JSON_DATA" | jq -r '.sign_off.dek // ""')

# Extract Meta
META_COUNT=$(echo "$JSON_DATA" | jq -r '.meta.segment_count // 0')
META_SEED=$(echo "$JSON_DATA" | jq -r '.meta.rotation_seed // ""')
META_CURVE=$(echo "$JSON_DATA" | jq -r '.meta.energy_curve // ""')

# Start building the HTML
cat <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brainrot Report ${REPORT_ID} — Edition #${EDITION_NO} Storyboard</title>
  <style>
    :root {
      --bg: #07060a;
      --bg-soft: #0e0c14;
      --panel: #14111d;
      --panel-2: #1b1726;
      --border: #2a2440;
      --text: #e8e6f0;
      --muted: #9a93b5;
      --neon: #00ff9f;
      --neon-dim: #00c97e;
      --purple: #a855f7;
      --purple-dim: #7c3aed;
      --danger: #ff2e88;
      --font: "Segoe UI", system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif;
      --mono: "SFMono-Regular", "Cascadia Code", Consolas, "Liberation Mono", monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font);
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 2rem 0;
      position: relative;
    }
    
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      z-index: -2;
      background:
        radial-gradient(circle at 20% 10%, rgba(168, 85, 247, 0.14), transparent 40%),
        radial-gradient(circle at 80% 80%, rgba(0, 255, 159, 0.10), transparent 45%);
    }

    body::after {
      content: "";
      position: fixed;
      inset: 0;
      z-index: -1;
      background-image:
        linear-gradient(rgba(42, 36, 64, 0.35) 1px, transparent 1px),
        linear-gradient(90deg, rgba(42, 36, 64, 0.35) 1px, transparent 1px);
      background-size: 44px 44px;
      mask-image: radial-gradient(circle at 50% 30%, black, transparent 80%);
      opacity: 0.5;
    }

    .container {
      width: min(900px, 92vw);
      margin: 0 auto;
    }

    header {
      border-bottom: 2px solid var(--border);
      padding-bottom: 1.5rem;
      margin-bottom: 2.5rem;
      position: relative;
    }

    .kicker {
      font-family: var(--mono);
      font-size: 0.85rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--neon);
      margin-bottom: 0.5rem;
    }

    h1 {
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }

    .theme-banner {
      background: rgba(168, 85, 247, 0.1);
      border-left: 4px solid var(--purple);
      padding: 1rem;
      border-radius: 0 8px 8px 0;
      font-size: 1.1rem;
      font-weight: 600;
      margin-top: 1rem;
      color: #fff;
    }

    .section-title {
      font-family: var(--mono);
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--muted);
      margin: 2.5rem 0 1rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .section-title::after {
      content: "";
      flex-grow: 1;
      height: 1px;
      background: var(--border);
    }

    /* Cards */
    .card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      transition: all 0.25s ease;
    }

    .card:hover {
      border-color: rgba(0, 255, 159, 0.3);
      box-shadow: 0 0 20px rgba(0, 255, 159, 0.08);
    }

    .cold-open-card {
      border-left: 4px solid var(--neon);
    }

    .cold-open-card:hover {
      border-color: var(--neon);
      box-shadow: 0 0 25px rgba(0, 255, 159, 0.12);
    }

    .hook-text {
      font-size: 1.35rem;
      font-weight: 800;
      color: #fff;
      margin-bottom: 0.5rem;
    }

    .dek-text {
      color: var(--text);
      font-size: 1.05rem;
      margin-bottom: 1.2rem;
    }

    .visual-prompt {
      background: var(--bg-soft);
      border: 1px dashed var(--border);
      border-radius: 8px;
      padding: 0.8rem 1rem;
      font-family: var(--mono);
      font-size: 0.85rem;
      color: var(--neon);
    }

    .visual-prompt span {
      color: var(--muted);
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      display: block;
      margin-bottom: 0.3rem;
    }

    /* Segments Layout */
    .segment-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.8rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .segment-title-wrap {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .slot-num {
      background: var(--border);
      color: var(--text);
      font-family: var(--mono);
      font-size: 0.85rem;
      font-weight: bold;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
    }

    .segment-name {
      font-size: 1.1rem;
      font-weight: bold;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Badges */
    .badge-row {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .badge {
      font-family: var(--mono);
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .badge-unhinged {
      background: rgba(255, 46, 136, 0.15);
      color: var(--danger);
      border: 1px solid rgba(255, 46, 136, 0.3);
      box-shadow: 0 0 10px rgba(255, 46, 136, 0.1);
    }

    .badge-mid {
      background: rgba(168, 85, 247, 0.15);
      color: var(--purple);
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    .badge-low {
      background: rgba(0, 255, 159, 0.1);
      color: var(--neon);
      border: 1px solid rgba(0, 255, 159, 0.2);
    }

    .badge-tag {
      background: var(--bg-soft);
      color: var(--muted);
      border: 1px solid var(--border);
    }

    /* Beats */
    .beats-title {
      font-family: var(--mono);
      font-size: 0.8rem;
      text-transform: uppercase;
      color: var(--muted);
      margin: 1rem 0 0.4rem 0;
    }

    .beats-list {
      list-style-type: none;
      padding-left: 0.2rem;
      margin-bottom: 1rem;
    }

    .beats-list li {
      position: relative;
      padding-left: 1.5rem;
      margin-bottom: 0.3rem;
      font-size: 0.95rem;
    }

    .beats-list li::before {
      content: "✦";
      position: absolute;
      left: 0;
      color: var(--purple);
    }

    /* Sign Off */
    .sign-off-card {
      border-left: 4px solid var(--purple);
    }

    .sign-off-card:hover {
      border-color: var(--purple);
      box-shadow: 0 0 25px rgba(168, 85, 247, 0.12);
    }

    /* Meta / Footer */
    footer {
      border-top: 1px solid var(--border);
      padding-top: 1.5rem;
      margin-top: 3rem;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      color: var(--muted);
      font-family: var(--mono);
      font-size: 0.8rem;
    }

    .meta-item span {
      color: var(--text);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="kicker">REPORT ${REPORT_ID} // CAMPAIGN PRODUCTION SYSTEM</div>
      <h1>Brainrot Report: Edition #${EDITION_NO}</h1>
      <div class="kicker" style="color:var(--muted)">DATE: ${EDITION_DATE}</div>
      <div class="theme-banner">
        Theme: ${THEME}
      </div>
    </header>

    <div class="section-title">01 / COLD OPEN</div>
    <div class="card cold-open-card">
      <div class="hook-text">"${COLD_HOOK}"</div>
      <div class="dek-text">${COLD_DEK}</div>
      <div class="visual-prompt">
        <span>🎬 Visual Direction</span>
        ${COLD_VISUAL}
      </div>
    </div>

    <div class="section-title">02 / SEGMENTS ROTATION</div>
EOF

# Render each segment
echo "$JSON_DATA" | jq -c '.segments[]' | while read -r segment; do
  SLOT=$(echo "$segment" | jq -r '.slot')
  SEGMENT_ID=$(echo "$segment" | jq -r '.segment_id')
  SEGMENT_NAME=$(echo "$segment" | jq -r '.segment_name')
  HOOK=$(echo "$segment" | jq -r '.hook')
  DEK=$(echo "$segment" | jq -r '.dek')
  VISUAL=$(echo "$segment" | jq -r '.visual_direction')
  ENERGY=$(echo "$segment" | jq -r '.energy')
  WORD_TARGET=$(echo "$segment" | jq -r '.word_target')
  
  # Determine energy class
  ENERGY_CLASS="badge-mid"
  if [ "$ENERGY" = "unhinged" ]; then
    ENERGY_CLASS="badge-unhinged"
  elif [ "$ENERGY" = "low" ]; then
    ENERGY_CLASS="badge-low"
  fi

  BADGE_SVG=$(get_badge_svg "$SEGMENT_ID")

  if [ -n "$BADGE_SVG" ]; then
    cat <<EOF
    <div class="card" style="display:flex; gap:1.5rem; justify-content:space-between; align-items:flex-start;">
      <div style="flex-grow:1;">
EOF
  else
    cat <<EOF
    <div class="card">
      <div>
EOF
  fi

  cat <<EOF
      <div class="segment-header">
        <div class="segment-title-wrap">
          <div class="slot-num">${SLOT}</div>
          <div class="segment-name">${SEGMENT_NAME} <span style="font-size:0.75rem;color:var(--border);font-family:var(--mono)">#${SEGMENT_ID}</span></div>
        </div>
        <div class="badge-row">
          <span class="badge ${ENERGY_CLASS}">${ENERGY} energy</span>
          <span class="badge badge-tag">${WORD_TARGET} words</span>
        </div>
      </div>
      
      <div class="hook-text" style="font-size:1.15rem;margin-bottom:0.4rem">"${HOOK}"</div>
      <div class="dek-text" style="font-size:0.95rem;margin-bottom:0.8rem;color:var(--muted)">${DEK}</div>
      
      <div class="beats-title">Beats</div>
      <ul class="beats-list">
EOF

  # Render beats
  echo "$segment" | jq -r '.beats[]' | while read -r beat; do
    echo "        <li>$(echo "$beat" | sed 's/"/\&quot;/g')</li>"
  done

  cat <<EOF
      </ul>
      
      <div class="visual-prompt">
        <span>🎨 Art Direction</span>
        ${VISUAL}
      </div>
      
      <div class="badge-row" style="margin-top:0.8rem;flex-wrap:wrap">
EOF

  # Render tags
  echo "$segment" | jq -r '.tags[]' | while read -r tag; do
    echo "        <span class=\"badge badge-tag\" style=\"font-size:0.7rem\">#${tag}</span>"
  done

  if [ -n "$BADGE_SVG" ]; then
    cat <<EOF
      </div>
    </div>
    <div class="badge-wrapper" style="flex-shrink:0; width:90px; height:115px; background:var(--bg-soft); border:1px solid var(--border); border-radius:10px; display:flex; align-items:center; justify-content:center; padding:5px; margin-top: 15px;">
      ${BADGE_SVG}
    </div>
  </div>
EOF
  else
    cat <<EOF
      </div>
    </div>
  </div>
EOF
  fi
done

# Render Sign Off
cat <<EOF
    <div class="section-title">03 / SIGN OFF</div>
    <div class="card sign-off-card">
      <div class="segment-name" style="font-size:0.9rem;margin-bottom:0.5rem;color:var(--muted)">${SIGN_HOOK}</div>
      <div class="dek-text" style="font-size:1.1rem;font-weight:600;margin-bottom:0">${SIGN_DEK}</div>
    </div>

    <footer>
      <div class="meta-item">Rotation Seed: <span>${META_SEED}</span></div>
      <div class="meta-item">Segments: <span>${META_COUNT}</span></div>
      <div class="meta-item">Energy Curve: <span>${META_CURVE}</span></div>
      <div class="meta-item">© 2026 Brainrot Report 666</div>
    </footer>
  </div>
</body>
</html>
EOF
