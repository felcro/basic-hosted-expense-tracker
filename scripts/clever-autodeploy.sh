#!/usr/bin/env bash
#
# Turns Clever Cloud's deploy-on-push on or off.
#
# Clever's GitHub *integration* cannot be disconnected once established: that
# is a Clever-side limitation with no console setting. But the thing that
# actually triggers a deploy is an ordinary repository webhook, created by
# Clever on this repo, which we own and can disable:
#
#   POST https://api.clever-cloud.com/v2/github/redeploy   on: push
#
# Disabling it stops every automatic deploy while leaving the integration, the
# app, and its GitHub link untouched. Fully reversible.
#
# Verified against this app on 2026-09-18: with the webhook off, Clever still
# fetches any commit on demand (`clever restart --commit <sha>` logged
# "Deploying commit ID <sha>" and deployed it), because the app's deployment
# source IS the GitHub repository: Clever pulls at deploy time rather than
# being pushed to. So manual deploys keep working. See .github/workflows/deploy.yml.
#
#   ./scripts/clever-autodeploy.sh status
#   ./scripts/clever-autodeploy.sh disable
#   ./scripts/clever-autodeploy.sh enable
#
# Requires: gh, authenticated with admin rights on the repo.

set -euo pipefail

REPO="${REPO:-$(gh repo view --json nameWithOwner --jq .nameWithOwner)}"
CLEVER_HOOK_URL='api.clever-cloud.com'

usage() {
  echo "usage: $0 {status|disable|enable}" >&2
  exit 64
}

[ $# -eq 1 ] || usage
action="$1"

# Found by URL rather than a hard-coded id, so this keeps working if the hook is
# ever recreated with a different one.
hook_id=$(gh api "repos/${REPO}/hooks" \
  --jq "[.[] | select(.config.url | contains(\"${CLEVER_HOOK_URL}\"))] | first | .id // empty")

if [ -z "$hook_id" ]; then
  echo "No Clever Cloud webhook found on ${REPO}." >&2
  echo "Either it was already removed, or the integration was never set up." >&2
  exit 1
fi

read_state() {
  gh api "repos/${REPO}/hooks/${hook_id}" --jq '.active'
}

case "$action" in
  status)
    if [ "$(read_state)" = "true" ]; then
      echo "Auto-deploy is ON: every push to the deployment branch deploys."
      echo "Disable it with: $0 disable"
    else
      echo "Auto-deploy is OFF: deploys only via the Deploy workflow."
    fi
    ;;

  disable)
    if [ "$(read_state)" = "false" ]; then
      echo "Auto-deploy is already off. Nothing to do."
      exit 0
    fi
    gh api --method PATCH "repos/${REPO}/hooks/${hook_id}" -F active=false >/dev/null
    if [ "$(read_state)" = "false" ]; then
      echo "Auto-deploy disabled (webhook ${hook_id} on ${REPO})."
      echo "Merging to main no longer deploys. Use the Deploy workflow:"
      echo "  gh workflow run deploy.yml -f ref=main -f confirm=DEPLOY"
    else
      echo "Webhook did not change state. Check permissions on ${REPO}." >&2
      exit 1
    fi
    ;;

  enable)
    gh api --method PATCH "repos/${REPO}/hooks/${hook_id}" -F active=true >/dev/null
    if [ "$(read_state)" = "true" ]; then
      echo "Auto-deploy re-enabled (webhook ${hook_id} on ${REPO})."
      echo "Pushes to the configured deployment branch will deploy again."
    else
      echo "Webhook did not change state. Check permissions on ${REPO}." >&2
      exit 1
    fi
    ;;

  *) usage ;;
esac
