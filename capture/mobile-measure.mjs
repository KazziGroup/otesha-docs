/**
 * Measure callout targets in the caretaker app, via Maestro.
 *
 * The native counterpart to `measure.js`. Same contract — it emits the exact
 * `targets.json` that `compose.mjs` already consumes — so phone-app figures and
 * web figures come out of one composer and look like one manual rather than two.
 *
 * Targets are matched on `accessibilityText` and positioned from the bounds
 * Maestro reports, which keeps the rule that holds everywhere else here: a
 * marker is anchored to a real element, never to coordinates somebody typed in.
 * When a screen changes, this fails loudly instead of pointing confidently at
 * the wrong place.
 *
 *   node capture/mobile-measure.mjs <udid> <screenshot.png> <out.json> '<callouts json>'
 *
 * The callouts argument is `[{ match, note, side }]`, where `match` is a
 * substring of the element's accessibility label.
 *
 * The screenshot is rewritten in place at logical size. Maestro reports points
 * (402 wide on this device) while `simctl` writes device pixels (1206), and
 * rather than teach the composer about scale factors the image is reduced to
 * agree with the numbers. It is a clean 1:3 reduction of a 3× capture, so it
 * stays sharper than the browser captures next to it.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const [, , udid, shotPath, outPath, calloutsJson] = process.argv;

if (!udid || !shotPath || !outPath || !calloutsJson) {
  console.error(
    "usage: mobile-measure.mjs <udid> <screenshot.png> <out.json> '<callouts json>'",
  );
  process.exit(2);
}

// A path or inline JSON. Paths are what the shot lists actually use: these
// labels contain apostrophes ("Today's tasks"), and passing those through a
// shell inside a JSON string is a quoting puzzle whose failure mode is a
// silently different string and a MISSING that looks like the screen changed.
const callouts = JSON.parse(
  calloutsJson.trimStart().startsWith("[") ? calloutsJson : readFileSync(calloutsJson, "utf8"),
);

const hierarchy = JSON.parse(
  execFileSync("maestro", ["--device", udid, "hierarchy"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "ignore"],
  }),
);

/** `[x1,y1][x2,y2]` → a rect, or null if it is not a box. */
function parseBounds(bounds) {
  const m = /^\[(-?\d+),(-?\d+)\]\[(-?\d+),(-?\d+)\]$/.exec(bounds ?? "");
  if (!m) return null;
  const [x1, y1, x2, y2] = m.slice(1).map(Number);
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

const nodes = [];
(function walk(node) {
  if (!node || typeof node !== "object") return;
  const a = node.attributes ?? {};
  const label = a.accessibilityText || a.text || a.title || a.value || "";
  const rect = parseBounds(a.bounds);
  if (label && rect && rect.w > 0 && rect.h > 0) nodes.push({ label, rect });
  for (const child of node.children ?? []) walk(child);
})(hierarchy);

const missing = [];
const targets = [];

callouts.forEach(({ match, note, side = "right" }, i) => {
  // Smallest match wins. A label often appears on both a control and the card
  // wrapping it, and the control is the thing being pointed at.
  const found = nodes
    .filter((n) => n.label.includes(match))
    .sort((a, b) => a.rect.w * a.rect.h - b.rect.w * b.rect.h)[0];
  if (!found) {
    missing.push(match);
    return;
  }
  targets.push({ n: i + 1, note: note || "", side, ...found.rect });
});

if (missing.length) {
  console.error(`MISSING: ${missing.join(", ")}`);
  process.exit(1);
}

// The device's logical size, measured rather than assumed, so this is not
// pinned to one simulator. Taken from the widest element rather than the root
// node, which reports no bounds of its own.
const viewport = nodes.reduce(
  (biggest, n) =>
    n.rect.w * n.rect.h > biggest.w * biggest.h ? { w: n.rect.w, h: n.rect.h } : biggest,
  { w: 0, h: 0 },
);
if (!viewport.w || !viewport.h) {
  console.error("could not determine the device's logical size from the hierarchy");
  process.exit(1);
}

// Reduce the capture to logical points so the composer's numbers line up.
execFileSync("sips", ["-z", String(viewport.h), String(viewport.w), shotPath], {
  stdio: "ignore",
});

/** Same crop rules as the web capture — see `measure.js`. */
const PAD_ABOVE = 150;
const PAD_BELOW = 130;
const top = Math.min(...targets.map((t) => t.y));
const bottom = Math.max(...targets.map((t) => t.y + t.h));
let crop = { y: Math.round(top) - PAD_ABOVE, h: Math.round(bottom - top) + PAD_ABOVE + PAD_BELOW };
crop.y = Math.max(0, Math.min(crop.y, viewport.h - 1));
crop.h = Math.min(crop.h, viewport.h - crop.y);

const commit = (() => {
  try {
    return execFileSync(
      "git",
      ["-C", "../otesha/caretaker-mobile-app", "rev-parse", "--short", "HEAD"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
  } catch {
    return null;
  }
})();

writeFileSync(
  outPath,
  JSON.stringify({
    ok: true,
    viewport,
    crop,
    provenance: {
      app: "caretaker-mobile-app",
      platform: "ios-simulator",
      bundleId: "com.otesha.app.demo",
      note: "EXPO_PUBLIC_STATIC_DEMO=1 — bundled fixtures, no backend",
      device: udid,
      ...(commit ? { commit } : {}),
    },
    targets,
  }),
);

console.log(`ok: ${targets.length} targets, viewport ${viewport.w}x${viewport.h}`);
