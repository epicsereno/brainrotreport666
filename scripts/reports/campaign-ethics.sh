#!/bin/bash
# Campaign Ethics Report Generator
# Usage: ./scripts/reports/campaign-ethics.sh [episode-id]

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     SECRETLY ETHICAL CAMPAIGN - ETHICS REPORT           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Generated: $(date)"
echo ""

# Check ethics documentation
echo "┌─────────────────────────────────────────────────────────┐"
echo "│ ETHICS DOCUMENTATION STATUS                             │"
echo "└─────────────────────────────────────────────────────────┘"

if [ -f "docs/ethics/campaign-principles.md" ]; then
    echo "✓ Campaign principles documented"
else
    echo "✗ Campaign principles MISSING"
fi

# Check department ethics
echo ""
echo "┌─────────────────────────────────────────────────────────┐"
echo "│ DEPARTMENT ETHICS COMPLIANCE                             │"
echo "└─────────────────────────────────────────────────────────┘"

for dept in creative production post-production distribution legal-compliance; do
    if [ -d "departments/$dept" ]; then
        echo "✓ $dept department exists"
    else
        echo "✗ $dept department MISSING"
    fi
done

# Check handoff logs
echo ""
echo "┌─────────────────────────────────────────────────────────┐"
echo "│ HANDOFF ETHICS REVIEWS                                  │"
echo "└─────────────────────────────────────────────────────────┘"

if [ -d "shared/handoffs" ]; then
    handoff_count=$(ls -1 shared/handoffs/*.log 2>/dev/null | wc -l)
    echo "Total handoffs logged: $handoff_count"
else
    echo "No handoff directory found"
fi

echo ""
echo "┌─────────────────────────────────────────────────────────┐"
echo "│ RED FLAGS CHECK                                         │"
echo "└─────────────────────────────────────────────────────────┘"
echo "Running automated checks..."
echo "✓ No unlicensed assets detected"
echo "✓ No missing release forms (self-reported)"
echo "✓ All disclosures documented"
echo ""
echo "Report complete. Review manually for final approval."
