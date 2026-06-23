#!/bin/bash
# Create new episode request
# Usage: ./scripts/workflow/new-episode.sh "Episode Title" [Episode ID]

set -euo pipefail

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <Episode Title> [Episode ID]"
    echo "Example: $0 \"The Rizz Recession\""
    exit 1
fi

TITLE="$1"

# Go to repo root
cd "$(dirname "$0")/../.." || exit 1

# If episode ID is provided, use it, else auto-increment
if [ "$#" -ge 2 ]; then
    EP_ID="$2"
else
    # Find the latest episode ID
    LAST_EP=$(ls metadata/episodes/EP*.json 2>/dev/null | grep -o 'EP[0-9]*' | sort | tail -n 1 || true)
    if [ -z "$LAST_EP" ]; then
        EP_ID="EP001"
    else
        NUM=$(echo "$LAST_EP" | sed 's/EP//')
        NEXT_NUM=$((10#$NUM + 1))
        EP_ID=$(printf "EP%03d" $NEXT_NUM)
    fi
fi

EP_NUM=$(echo "$EP_ID" | sed 's/EP//')

echo "Creating new episode request: $EP_ID - $TITLE"

# Setup directories if needed
mkdir -p "metadata/episodes"
mkdir -p "episodes/incoming"
mkdir -p "departments/creative/scripts"
mkdir -p "departments/creative/storyboards/$EP_ID"
mkdir -p "departments/creative/graphics/$EP_ID"
mkdir -p "departments/creative/thumbnails/$EP_ID"

# 1. Create metadata JSON
META_FILE="metadata/episodes/$EP_ID.json"
if [ -f "$META_FILE" ]; then
    echo "Error: Episode metadata already exists at $META_FILE"
    exit 1
fi

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Generate JSON using sed instead of jq as jq might not be available, or simpler, construct basic replacement.
# But python is definitely available if it's a standard environment. We'll use python.
python3 -c "
import json
import sys

with open('metadata/episodes/template.json', 'r') as f:
    data = json.load(f)

data['episode']['id'] = sys.argv[1]
data['episode']['number'] = int(sys.argv[2]) if sys.argv[2] else 0
data['episode']['title'] = sys.argv[3]
data['episode']['created_at'] = sys.argv[4]
data['episode']['updated_at'] = sys.argv[4]

with open(sys.argv[5], 'w') as f:
    json.dump(data, f, indent=2)
" "$EP_ID" "${EP_NUM#"${EP_NUM%%[!0]*}"}" "$TITLE" "$TIMESTAMP" "$META_FILE"

echo "✓ Created metadata: $META_FILE"

# 2. Stage in episodes pipeline
STAGE_FILE="episodes/incoming/$EP_ID.md"
cat > "$STAGE_FILE" << EOF
---
id: $EP_ID
title: "$TITLE"
status: incoming
created_at: $TIMESTAMP
---

# $EP_ID: $TITLE

Initial request created.
EOF

echo "✓ Staged episode: $STAGE_FILE"

# 3. Create draft script template
SCRIPT_FILE="departments/creative/scripts/SCRIPT-$EP_ID-DRAFT-v1.md"
cat > "$SCRIPT_FILE" << EOF
# $EP_ID: $TITLE
**Status:** Draft 1
**Date:** $(date +"%Y-%m-%d")

## Concept
[Brief description of the episode concept]

## Outline
- Introduction
- Main Content
- Conclusion
EOF

echo "✓ Created draft script: $SCRIPT_FILE"

echo ""
echo "Done. Episode $EP_ID is now in the 'incoming' stage."
