/**
 * Record the narrated walkthrough of the trial.
 *
 * Narration first, picture second. `narration.mjs` renders each line and
 * reports how long it lasts, and every beat here holds for exactly that long —
 * so the voice is never cut off and the screen never sits still waiting for it.
 * The alternative, guessing at delays and hoping the audio fits, drifts further
 * out of step with every line.
 *
 * Captions carry the same words, because a walkthrough gets watched at a desk
 * with the sound off at least as often as not.
 *
 *   node capture/narration.mjs && node capture/walkthrough.mjs
 *   node capture/assemble.mjs            # voice, music bed, and the mux
 *
 * Expects the two *built* previews: internal on 5282, external on 5281. Built
 * rather than the dev server on purpose — the dev server hid a bug that made
 * the production site render nothing, so a video of it would have shown
 * something nobody could deploy.
 */

import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Borrowed from the e2e project rather than installed here.
 *
 * Playwright pulls browser binaries, and this repo has no other use for it —
 * the capture pipeline is supposed to end up in `otesha/e2e` beside the demo
 * recorder, at which point this resolution goes away and the import is just
 * `from "playwright"`.
 */
const { chromium } = await (async () => {
  try {
    return await import("playwright");
  } catch {
    const { createRequire } = await import("node:module");
    const require = createRequire(import.meta.url);
    const resolved = require.resolve("playwright", {
      paths: [new URL("../../otesha/e2e/", import.meta.url).pathname],
    });
    const mod = await import(resolved);
    return mod.chromium ? mod : mod.default;
  }
})();

const HERE = dirname(fileURLToPath(import.meta.url));
const INTERNAL = "http://localhost:5282";
const EXTERNAL = "http://localhost:5281";
const RAW_DIR = "/tmp/otesha-walkthrough";
const SIZE = { width: 1440, height: 900 };

/** A breath after each line, so beats do not run into one another. */
const GAP_MS = 600;
/** Silence before the first word, so the opening frame is seen before it is talked over. */
const LEAD_IN_MS = 1200;

const script = JSON.parse(readFileSync(resolve(HERE, "audio", "manifest.json"), "utf8"));
const byId = new Map(script.map((line) => [line.id, line]));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** The drawn cursor and the caption bar, both injected into whatever page is up. */
const OVERLAY = `
(() => {
  if (document.getElementById("__wt")) return;
  const wrap = document.createElement("div");
  wrap.id = "__wt";
  wrap.innerHTML = \`
    <div id="__wt_cap" style="position:fixed;left:50%;transform:translateX(-50%);bottom:34px;
      max-width:1080px;background:rgba(15,34,22,.94);color:#F6F3EB;padding:13px 24px;
      border-radius:11px;font:500 17px/1.45 -apple-system,Helvetica,Arial,sans-serif;
      z-index:2147483646;opacity:0;transition:opacity .3s;text-align:center;
      box-shadow:0 6px 26px rgba(0,0,0,.3)"></div>
    <svg id="__wt_cur" width="22" height="26" viewBox="0 0 22 26" style="position:fixed;
      left:0;top:0;z-index:2147483647;pointer-events:none;
      filter:drop-shadow(0 1px 4px rgba(0,0,0,.45))">
      <path d="M0 0 L0 21 L5.5 16 L9.5 25 L12.5 23.5 L8.5 14.5 L15 14.5 Z"
        fill="#FDFCF8" stroke="#14311F" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>\`;
  document.body.appendChild(wrap);
  window.__cap = (t) => {
    const el = document.getElementById("__wt_cap");
    el.textContent = t; el.style.opacity = t ? "1" : "0";
  };
  window.__cur = (x, y) => {
    document.getElementById("__wt_cur").style.transform = \`translate(\${x}px, \${y}px)\`;
  };
})();`;

rmSync(RAW_DIR, { recursive: true, force: true });
mkdirSync(RAW_DIR, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: SIZE,
  recordVideo: { dir: RAW_DIR, size: SIZE },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

let cursor = { x: SIZE.width / 2, y: SIZE.height / 2 };
let t0 = null;
const timings = [];

async function overlay() {
  await page.evaluate(OVERLAY);
  await page.evaluate(([x, y]) => window.__cur(x, y), [cursor.x, cursor.y]);
}

/**
 * Show a line and hold the picture for as long as it is spoken.
 *
 * The offset recorded here is what `assemble.mjs` uses to place the wav, so
 * this is the only place the two halves agree about time.
 */
async function say(id) {
  const line = byId.get(id);
  if (!line) throw new Error(`no narration line "${id}" — is audio/manifest.json stale?`);
  timings.push({ id, at: (Date.now() - t0) / 1000, seconds: line.seconds });
  await page.evaluate((t) => window.__cap?.(t), line.text);
  await sleep(line.seconds * 1000 + GAP_MS);
}

/** Glide rather than teleport, so the eye can follow where the click lands. */
async function moveTo(selector) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) return;
  const to = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  for (let i = 1; i <= 20; i++) {
    const x = cursor.x + ((to.x - cursor.x) * i) / 20;
    const y = cursor.y + ((to.y - cursor.y) * i) / 20;
    await page.mouse.move(x, y);
    await page.evaluate(([a, b]) => window.__cur(a, b), [x, y]);
    await sleep(14);
  }
  cursor = to;
}

async function click(selector) {
  await moveTo(selector);
  await page.locator(selector).first().click();
  await sleep(500);
}

/**
 * Wheel-scroll the docs pane, which scrolls independently of the window.
 *
 * The pointer is parked over the content first, because a wheel event goes to
 * whatever is underneath it. Left where the last sidebar click put it, the
 * sidebar scrolls and the page stays where it was — which does not fail, it
 * just quietly narrates the wrong thing.
 */
async function scrollBy(amount, steps = 16) {
  await moveTo("main");
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, amount / steps);
    await sleep(40);
  }
  await sleep(350);
}

// ── the walkthrough ──────────────────────────────────────────────────────────

await page.goto(`${INTERNAL}/#/overview/intro`, { waitUntil: "networkidle" });
await overlay();
t0 = Date.now();
await sleep(LEAD_IN_MS);

await say("open");

for (const manual of ["Customer app", "Admin portal", "Corporate portal", "Caretaker app"]) {
  await click(`text=${manual}`);
  await sleep(300);
}
await say("repo");

await click("text=Sign in to your account");
await overlay();
await say("template");

await scrollBy(420);
await say("shots");
await say("callouts");

// The caretaker manual: a real phone build, annotated the same way. The groups
// were all opened at the top, so these are page links, not group headers —
// clicking a header again would fold the manual shut.
await click("text=Start your day on Today");
await overlay();
await scrollBy(380);
await say("mobile");

// The console manuals, and the recipe behind every figure.
await click("text=Approve a caretaker");
await overlay();
await scrollBy(400);
await say("recipe");
await say("rebuilt");
await say("refs");

// The search proof. These words are written on no page — they are a callout
// inside a screenshot.
await click('button:has-text("Search docs")');
await overlay();
await page.keyboard.type("where signing in lands you", { delay: 70 });
await sleep(900);
await say("search");
await say("found");
await say("ai");
await page.keyboard.press("Escape");
await sleep(400);

await page.goto(`${EXTERNAL}/#/overview/intro`, { waitUntil: "networkidle" });
await overlay();
await say("external");
await say("absent");
await say("close");

await page.evaluate(() => window.__cap?.(""));
await sleep(1200);

await context.close();
await browser.close();

const raw = readdirSync(RAW_DIR).find((f) => f.endsWith(".webm"));
if (!raw) throw new Error("playwright wrote no video");
renameSync(join(RAW_DIR, raw), join(RAW_DIR, "silent.webm"));

writeFileSync(
  join(RAW_DIR, "timings.json"),
  JSON.stringify({ leadInMs: LEAD_IN_MS, timings }, null, 2) + "\n",
);
console.log(`  ${timings.length} beats → ${join(RAW_DIR, "silent.webm")}`);
