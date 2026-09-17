#!/usr/bin/env bash
#
# The external build must not contain the internal manuals.
#
# This greps the built JavaScript rather than checking the sidebar, because the
# failure this guards against renders correctly. `import.meta.glob` inlines
# every match into the bundle, so filtering the pages out in code produces a
# site with no admin section and an admin manual sitting in plain text inside
# index-*.js. Anything that inspects the output instead of the bytes passes
# while the pages are readable by View Source.
#
# Run it in CI. The arrangement in `vite.config.ts` is one careless import away
# from silently collapsing back to a single bundle.

set -euo pipefail
cd "$(dirname "$0")/.."

# A phrase from a manual that clients must never receive, and one from the
# manual they are meant to. Both are page titles, so they change loudly rather
# than rotting into a grep that always passes.
SECRET="Release a payout run"
EXPECTED="Place a bulk order"

fail() { printf '  FAIL  %s\n' "$1" >&2; exit 1; }

printf 'Building external…\n'
rm -rf dist
DOCS_AUDIENCE=external npm run build >/dev/null 2>&1 || fail "external build did not complete"

grep -rqF "$SECRET" dist/ && fail "internal manual leaked into the external bundle: $SECRET"
grep -rqF "$EXPECTED" dist/ || fail "external bundle is missing the corporate manual: $EXPECTED"
printf '  ok    external build excludes the internal manuals\n'

printf 'Building internal…\n'
rm -rf dist
DOCS_AUDIENCE=internal npm run build >/dev/null 2>&1 || fail "internal build did not complete"

grep -rqF "$SECRET" dist/ || fail "internal bundle is missing the admin manual: $SECRET"
printf '  ok    internal build contains every manual\n'
