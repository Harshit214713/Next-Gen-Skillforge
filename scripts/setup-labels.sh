#!/usr/bin/env bash
# Creates the repository's label taxonomy. Requires: gh CLI, authenticated as a maintainer.
# Usage: ./scripts/setup-labels.sh [owner/repo]
set -euo pipefail

REPO="${1:-divyanshakya966/Next-Gen-Skillforge}"

create() {
  gh label create "$1" --repo "$REPO" --color "$2" --description "$3" --force >/dev/null
  echo "  ✓ $1"
}

echo "Creating labels for $REPO ..."

# Type
create "bug"            "d73a4a" "Something isn't working"
create "feature"        "a2eeef" "New feature or request"
create "docs"           "0075ca" "Documentation and templates"
create "dependencies"   "0366d6" "Pull requests that update a dependency"
create "security"       "b60205" "Security-related work or reports"
create "chore"          "fbca04" "Maintenance, tooling, refactors"
create "duplicate"      "cfd3d7" "This issue or pull request already exists"
create "invalid"        "e4e669" "Something doesn't seem right"
create "question"       "d876e3" "Further information is requested"
create "wontfix"        "ffffff" "This will not be worked on"
create "spam"           "ee0701" "Unwanted or automated spam content"
create "stale"          "eeeeee" "Marked inactive by automation"

# NSoC program
create "good first issue"  "7057ff" "Good for newcomers"
create "help wanted"       "008672" "Extra attention is needed"
create "NSOC'26 (WINTER EDITION)" "8250df" "Nexus Spring of Code 2026 Winter Edition track"

# Difficulty levels (use for effort estimation and contributor matching)
create "Level 1" "0e8a16" "Small: docs, typos, copy, simple fixes (< ~1 hour)"
create "Level 2" "fbca04" "Medium: UI/frontend — layouts, components, styling, pages"
create "Level 3" "b60205" "Large: core logic, data/session changes, complex features"

# Areas (matched by .github/labeler.yml — names must match exactly)
create "area/frontend"  "1d76db" "Next.js app, components, styling"
create "area/worker"    "5319e7" "Hono worker, routes, wrangler config"
create "area/shared"    "bfd4af" "Shared lib/ code"
create "area/tests"     "c2e0c6" "Tests and test configuration"
create "area/docs"      "0052cc" "Documentation and templates"
create "area/ci"        "e99695" "GitHub Actions, dependabot, package scripts"

# Workflow
create "needs review"      "fbca04" "Ready for maintainer review"
create "changes requested" "e11d48" "Author must address review feedback"
create "blocked"           "d93f0b" "Waiting on external factor"
create "ai-generated"      "d4c5f9" "PR suspected to be bulk AI output — verify carefully"

echo "Done."
