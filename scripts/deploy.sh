#!/bin/sh
# Push to GitHub, then trigger a Coolify redeploy over the LAN.
# Coolify is not internet-reachable, so GitHub webhooks can't fire;
# this calls the Coolify API directly from inside the network instead.
#
# Setup (once): copy .env.deploy.example to .env.deploy (gitignored)
# and paste in a Coolify API token (Keys & Tokens -> API tokens).
set -e
cd "$(dirname "$0")/.."

[ -f .env.deploy ] && . ./.env.deploy
: "${COOLIFY_TOKEN:?Set COOLIFY_TOKEN in .env.deploy or your shell environment}"
: "${COOLIFY_URL:=http://192.168.1.12:8000}"
: "${COOLIFY_APP_UUID:=btqmvj5d3tmfqp46ywhxaupu}"

git push
curl -fsS -X POST \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_URL/api/v1/deploy?uuid=$COOLIFY_APP_UUID"
echo ""
echo "Deploy triggered on Coolify."
