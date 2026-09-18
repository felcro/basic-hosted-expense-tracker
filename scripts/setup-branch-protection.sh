#!/usr/bin/env bash
#
# Applies the main-branch ruleset: no direct pushes, PR required, CI required.
#
# Branch protection is repository configuration, not code: it cannot live in a
# workflow file. This script exists so the configuration is reviewable and
# reproducible rather than a sequence of clicks nobody can audit later.
#
# Idempotent: updates the existing ruleset if one with the same name is found.
#
#   ./scripts/setup-branch-protection.sh            # apply
#   DRY_RUN=1 ./scripts/setup-branch-protection.sh  # print the payload only
#
# Requires: gh, authenticated with admin rights on the repo.

set -euo pipefail

REPO="${REPO:-$(gh repo view --json nameWithOwner --jq .nameWithOwner)}"
RULESET_NAME="main protection"
# Must match the name of the aggregating job in .github/workflows/ci.yml.
# Pointing at that single job means adding a CI job never requires editing this.
REQUIRED_CHECK="CI passed"

echo "Repository: ${REPO}"

# bypass_actors is deliberately empty: the repository owner is an admin and
# would otherwise be able to push straight to main, which is exactly what
# requirement 1 rules out. Add an entry here only with a reason.
read -r -d '' PAYLOAD <<JSON || true
{
  "name": "${RULESET_NAME}",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["~DEFAULT_BRANCH"],
      "exclude": []
    }
  },
  "bypass_actors": [],
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true,
        "automatic_copilot_code_review_enabled": false,
        "allowed_merge_methods": ["squash", "merge", "rebase"]
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "do_not_enforce_on_create": false,
        "required_status_checks": [
          { "context": "${REQUIRED_CHECK}" }
        ]
      }
    }
  ]
}
JSON

# No merge queue rule here. It requires an organisation-owned repository and
# this one is owned by a personal account, so the API rejects the rule outright
# (422 "Invalid rule 'merge_queue'"). See docs/ci-cd-setup.md if the repo ever
# moves to an organisation.

if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "$PAYLOAD" | jq .
  exit 0
fi

existing_id=$(gh api "repos/${REPO}/rulesets" --jq \
  ".[] | select(.name == \"${RULESET_NAME}\") | .id" 2>/dev/null || true)

if [ -n "$existing_id" ]; then
  echo "Updating existing ruleset ${existing_id}..."
  echo "$PAYLOAD" | gh api --method PUT "repos/${REPO}/rulesets/${existing_id}" --input - >/dev/null
  echo "Ruleset updated."
else
  echo "Creating ruleset..."
  echo "$PAYLOAD" | gh api --method POST "repos/${REPO}/rulesets" --input - >/dev/null
  echo "Ruleset created."
fi

# Auto-merge is what lets a PR be queued the moment its checks go green rather
# than needing someone present to click merge.
echo "Enabling auto-merge..."
gh api --method PATCH "repos/${REPO}" -F allow_auto_merge=true >/dev/null

# Keeps merged branches from accumulating.
gh api --method PATCH "repos/${REPO}" -F delete_branch_on_merge=true >/dev/null

echo
echo "Applied to ${REPO}:"
echo "  - Direct pushes to main blocked (no bypass actors, including admins)"
echo "  - Pull request required; resolved review threads required"
echo "  - Required check: '${REQUIRED_CHECK}'"
echo "  - Force-push and deletion of main blocked"
echo "  - Auto-merge and delete-branch-on-merge enabled"
echo
echo "Verify: gh api repos/${REPO}/rulesets --jq '.[].name'"
