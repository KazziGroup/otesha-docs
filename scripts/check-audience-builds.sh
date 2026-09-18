#!/usr/bin/env bash
#
# Both builds, checked for what they carry.
#
# The external build must not contain the internal manuals, and the internal
# build must contain them. What counts as either lives in
# `check-dist-audience.sh`, which the deploy workflow also runs against the
# directory it uploads.
#
# Run it in CI. The arrangement in `vite.config.ts` is one careless import away
# from silently collapsing back to a single bundle.

set -euo pipefail
cd "$(dirname "$0")/.."

fail() { printf '  FAIL  %s\n' "$1" >&2; exit 1; }

printf 'Building external…\n'
rm -rf dist
DOCS_AUDIENCE=external npm run build >/dev/null 2>&1 || fail "external build did not complete"
scripts/check-dist-audience.sh dist external

printf 'Building internal…\n'
rm -rf dist
DOCS_AUDIENCE=internal npm run build >/dev/null 2>&1 || fail "internal build did not complete"
scripts/check-dist-audience.sh dist internal
