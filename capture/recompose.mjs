/**
 * Redraw every figure's markers from the frames already on disk.
 *
 * `shoot.mjs` is two passes — measure and photograph a clean frame, then draw
 * the markers onto a wider canvas — and it leaves both halves of pass one in
 * `/tmp/otesha-shoot`. So a change to how markers are *drawn* does not need the
 * applications running, does not spend an SMS code against the corporate
 * number, and cannot disturb the data the figures were captured against.
 *
 * That last point is the real reason this exists. Re-shooting 43 figures to fix
 * a badge position means signing in 43 times and re-running every recipe that
 * writes something, which is how a capture run ends up changing the thing it
 * was documenting.
 *
 *   node capture/recompose.mjs            # every figure with a cached frame
 *   node capture/recompose.mjs admin-     # only ids starting admin-
 *
 * If the cache has been cleared, `npm run shoot` rebuilds it — that is the
 * regeneration guarantee, and this is only the fast path.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const WORK = "/tmp/otesha-shoot";
const SCALE = 2;

const filter = process.argv[2] ?? "";

/** Every figure the shot lists declare, with the title the composer puts on it. */
function figures() {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith(".json")) {
        const spec = JSON.parse(readFileSync(path, "utf8"));
        for (const figure of spec.figures ?? []) out.push(figure);
      }
    }
  };
  walk(join(ROOT, "capture", "shots"));
  return out;
}

const wanted = figures().filter((f) => f.id.startsWith(filter));
const browser = await chromium.launch();
let done = 0;
const skipped = [];

for (const figure of wanted) {
  const cleanPath = join(WORK, `${figure.id}.clean.png`);
  const targetsPath = join(WORK, `${figure.id}.json`);
  if (!existsSync(cleanPath) || !existsSync(targetsPath)) {
    skipped.push(figure.id);
    continue;
  }

  const htmlPath = join(WORK, `${figure.id}.html`);
  execFileSync(
    "node",
    [join(HERE, "compose.mjs"), cleanPath, targetsPath, htmlPath, figure.title ?? figure.id],
    { stdio: ["ignore", "ignore", "inherit"] },
  );

  const context = await browser.newContext({ deviceScaleFactor: SCALE });
  const page = await context.newPage();
  try {
    await page.goto(`file://${htmlPath}`, { waitUntil: "load" });
    await page.waitForFunction(() => document.title.startsWith("ready:"), { timeout: 15_000 });
    const [w, h] = (await page.title()).replace("ready:", "").split("x").map(Number);
    await page.setViewportSize({ width: w, height: h });
    await page.screenshot({ path: join(ROOT, "public", "img", `${figure.id}.png`) });
  } finally {
    await context.close();
  }

  // The alt text is regenerated too: it is built from the same notes, and
  // letting it drift from the picture is the failure `check-alt-text` exists
  // to catch.
  for (const [from, to] of [
    [htmlPath.replace(/\.html$/, ".alt.txt"), join(ROOT, "capture", "alt", `${figure.id}.alt.txt`)],
    [
      htmlPath.replace(/\.html$/, ".provenance.json"),
      join(ROOT, "capture", "provenance", `${figure.id}.json`),
    ],
  ]) {
    if (existsSync(from)) writeFileSync(to, readFileSync(from));
  }

  done++;
  console.log(`  ✓ ${figure.id}`);
}

await browser.close();
console.log(`\n  ${done} figure${done === 1 ? "" : "s"} redrawn from cached frames`);
if (skipped.length) {
  console.log(`  ${skipped.length} not cached — run \`npm run shoot\` for these:`);
  skipped.forEach((id) => console.log(`    ${id}`));
}
