/**
 * Build a self-contained measure script for one web capture.
 *
 * `measure.js` reads its spec from `window.__CALLOUTS`, which assumes the
 * global set by one browser call is still there for the next one. It usually
 * is. On the admin console it is not — that app remounts between calls and the
 * global goes with it, so the spec arrives empty and every target comes back
 * MISSING, which reads exactly like "the screen changed" and sends you looking
 * in the wrong place. It cost an hour here.
 *
 * So the spec is baked into the script instead of handed over separately.
 * Nothing has to survive between calls.
 *
 *   node capture/web-measure.mjs <callouts.json> <out.js> [--crop-x] [--no-crop]
 *
 * Writes a script to evaluate in the page, and prints its path.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const [, , calloutsPath, outPath, ...flags] = process.argv;

if (!calloutsPath || !outPath) {
  console.error("usage: web-measure.mjs <callouts.json> <out.js> [--crop-x] [--no-crop]");
  process.exit(2);
}

const callouts = JSON.parse(readFileSync(calloutsPath, "utf8"));
const measure = readFileSync(resolve(HERE, "measure.js"), "utf8");

const preamble = [
  `window.__CALLOUTS = ${JSON.stringify(callouts)};`,
  flags.includes("--crop-x") ? "window.__CROP_X = true;" : "",
  flags.includes("--no-crop") ? "window.__CROP = false;" : "",
].filter(Boolean).join("\n");

writeFileSync(outPath, `${preamble}\n${measure}`);
console.log(outPath);
