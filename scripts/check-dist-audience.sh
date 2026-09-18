#!/usr/bin/env bash
#
# Assert what a built bundle does and does not contain.
#
#   check-dist-audience.sh <dist-dir> external|internal
#
# Split out of `check-audience-builds.sh` so the deploy workflow can check the
# exact directory it is about to upload, rather than a rebuild of it. The two
# phrases live here and only here: a guard whose expectations are copied into a
# second file is a guard that goes quietly out of date.
#
# It greps the built JavaScript rather than the rendered sidebar, because the
# failure it guards against renders correctly. `import.meta.glob` inlines every
# match into the bundle, so filtering pages out in code produces a site with no
# admin section and the admin manual sitting in plain text inside index-*.js.

set -euo pipefail

DIST="${1:?usage: check-dist-audience.sh <dist-dir> external|internal}"
AUDIENCE="${2:?usage: check-dist-audience.sh <dist-dir> external|internal}"

# Page titles, so they change loudly rather than rotting into a grep that
# always passes.
SECRET="Release a payout run"          # internal only; clients must never get this
EXPECTED="Place a bulk order"          # the corporate manual, which they must

fail() { printf '  FAIL  %s\n' "$1" >&2; exit 1; }

[ -d "$DIST" ] || fail "no such directory: $DIST"

case "$AUDIENCE" in
  external)
    grep -rqF "$SECRET" "$DIST"/ && fail "internal manual leaked into the external bundle: $SECRET"
    grep -rqF "$EXPECTED" "$DIST"/ || fail "external bundle is missing the corporate manual: $EXPECTED"
    printf '  ok    external build excludes the internal manuals\n'
    ;;
  internal)
    grep -rqF "$SECRET" "$DIST"/ || fail "internal bundle is missing the admin manual: $SECRET"
    printf '  ok    internal build contains every manual\n'
    ;;
  *) fail "unknown audience: $AUDIENCE" ;;
esac
