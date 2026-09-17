/**
 * Every figure in the manuals must have a shot list behind it.
 *
 * This is the check that keeps "we can regenerate any doc" true. Without it the
 * guarantee decays quietly: somebody takes one screenshot by hand on a Friday,
 * it looks identical to the generated ones, and a year later nobody knows which
 * of the three hundred images can be rebuilt and which cannot.
 *
 * It also runs the other way — a shot list naming a figure that no page uses is
 * reported too, since that is either a deleted page whose recipe was left
 * behind, or a figure somebody forgot to reference.
 *
 *   node scripts/check-shots.mjs
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { IOS_STEPS, WEB_STEPS, calloutProblems } from "../capture/steps.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = join(ROOT, "docs");
const SHOTS = join(ROOT, "capture", "shots");

/** `![alt](/img/name.png "caption")` */
const FIGURE = /!\[[^\]]*\]\((\/img\/[^)\s]+)/g;

const used = new Map(); // figure id → the page that uses it
for (const category of readdirSync(DOCS, { withFileTypes: true })) {
  if (!category.isDirectory()) continue;
  for (const file of readdirSync(join(DOCS, category.name))) {
    if (!file.endsWith(".md")) continue;
    const body = readFileSync(join(DOCS, category.name, file), "utf8");
    for (const [, src] of body.matchAll(FIGURE)) {
      used.set(src.replace(/^\/img\//, "").replace(/\.png$/, ""), `${category.name}/${file}`);
    }
  }
}

const CONFIG = JSON.parse(readFileSync(join(ROOT, "capture", "apps.json"), "utf8"));

let failures = 0;
const declared = new Map(); // figure id → the shot list that builds it

if (existsSync(SHOTS)) {
  for (const rel of readdirSync(SHOTS, { recursive: true })) {
    if (typeof rel !== "string" || !rel.endsWith(".json")) continue;
    const list = JSON.parse(readFileSync(join(SHOTS, rel), "utf8"));
    const app = CONFIG.apps[list.app];

    if (!app) {
      console.error(`  FAIL  capture/shots/${rel}: unknown app "${list.app}"`);
      failures++;
      continue;
    }

    /*
     * Validate the recipe's shape, not just its existence.
     *
     * A shot list is only run during a capture session, with servers up and a
     * simulator booted. A misspelled verb or a callout with no note therefore
     * surfaces at the most expensive possible moment. These are cheap to catch
     * here and they are exactly the mistakes a person makes writing JSON by
     * hand.
     */
    const allowed = app.surface === "ios" ? IOS_STEPS : WEB_STEPS;
    for (const figure of list.figures ?? []) {
      if (declared.has(figure.id)) {
        // Silently losing one of two recipes for the same id would mean a
        // figure rebuilt from a recipe nobody thinks is in use.
        console.error(
          `  FAIL  capture/shots/${rel}: figure id "${figure.id}" is already ` +
            `declared in capture/shots/${declared.get(figure.id)}`,
        );
        failures++;
      }
      declared.set(figure.id, rel);

      for (const step of figure.steps ?? []) {
        const verb = Object.keys(step)[0];
        if (allowed.includes(verb)) continue;
        console.error(
          `  FAIL  capture/shots/${rel}: ${figure.id} uses unknown step "${verb}" ` +
            `(${app.surface} allows ${allowed.join(", ")})`,
        );
        failures++;
      }

      for (const callout of figure.callouts ?? []) {
        for (const problem of calloutProblems(callout)) {
          console.error(`  FAIL  capture/shots/${rel}: ${figure.id} callout ${problem}`);
          failures++;
        }
      }
    }
  }
}

for (const [id, page] of used) {
  if (declared.has(id)) continue;
  console.error(`  FAIL  ${page}: ${id}.png has no shot list — it cannot be regenerated`);
  failures++;
}

for (const [id, list] of declared) {
  if (used.has(id)) continue;
  console.error(`  FAIL  capture/shots/${list}: builds ${id}, which no page uses`);
  failures++;
}

// A recipe that produces no file is a recipe nobody has run.
for (const [id, list] of declared) {
  if (existsSync(join(ROOT, "public", "img", `${id}.png`))) continue;
  console.error(`  FAIL  capture/shots/${list}: ${id}.png has never been built`);
  failures++;
}

if (!failures) {
  console.log(`  ok    shot lists: ${used.size} figures, every one rebuildable`);
}
process.exit(failures ? 1 : 0);
