/**
 * Rebuild a page's figures from a committed shot list.
 *
 * The point of this file is that nobody has to remember how a screenshot was
 * taken. Every figure has a recipe beside it — the app, the ref, the steps to
 * reach the screen, the callouts — so it can be rebuilt a year from now by
 * somebody who has never seen it.
 *
 *   node capture/shoot.mjs                  # every shot list
 *   node capture/shoot.mjs customer/sign-in # one page
 *
 * **Playwright, not the browse CLI.** Two reasons, both learned the hard way.
 * browse cannot set `deviceScaleFactor`, so every figure taken with it is 1×
 * and soft on the retina screens people read these on. And it keeps session
 * state *per working directory*, so a `cd` between two commands silently drives
 * a different browser — which presents as elements being missing from a page
 * that plainly has them.
 *
 * The composite is rendered in the same browser: `compose.mjs` emits an HTML
 * page and this screenshots it, so there is one tool and one scale factor from
 * the app to the finished figure.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
const ROOT = resolve(HERE, "..");
const SHOTS = join(HERE, "shots");
const WORK = "/tmp/otesha-shoot";
const CONFIG = JSON.parse(readFileSync(join(HERE, "apps.json"), "utf8"));
const MEASURE = readFileSync(join(HERE, "measure.js"), "utf8");

/** 2× so the interface text in a figure survives being looked at closely. */
const SCALE = 2;
const ALLOW_DRIFT = process.env.ALLOW_REF_DRIFT === "1";

mkdirSync(WORK, { recursive: true });
for (const d of ["public/img", "capture/alt", "capture/provenance"]) {
  mkdirSync(join(ROOT, d), { recursive: true });
}

const git = (dir, args) => {
  try {
    return execFileSync("git", ["-C", dir, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
};

/**
 * Refuse to shoot an app that is not on the ref it is documented from.
 *
 * Returns what was actually checked out, so provenance records the truth
 * whether or not it matched.
 */
function preflight(appName, app) {
  const dir = resolve(ROOT, app.dir);
  const head = git(dir, ["rev-parse", "--short", "HEAD"]);
  const branch = git(dir, ["branch", "--show-current"]);
  const wanted = git(dir, ["rev-parse", "--short", app.ref]);

  if (!head) throw new Error(`${appName}: ${dir} is not a git repository`);

  const onRef = wanted && head === wanted;
  if (!onRef) {
    const message =
      `${appName} is on ${branch || "a detached HEAD"} (${head}), ` +
      `but its figures are documented from ${app.ref} (${wanted ?? "unknown"}).`;
    if (!ALLOW_DRIFT) {
      throw new Error(
        `${message}\n` +
          `  Check out ${app.ref} in ${app.dir}, or re-run with ALLOW_REF_DRIFT=1 ` +
          `to shoot anyway — the drift is then recorded in every provenance file.`,
      );
    }
    console.warn(`  ⚠ ${message}`);
  }

  return {
    app: appName,
    commit: head,
    branch: branch || null,
    documentedRef: app.ref,
    ...(onRef ? {} : { refDrift: true }),
    ...(app.note ? { note: app.note } : {}),
  };
}

/**
 * `{{uniquePhone}}` — a number Otesha has never seen.
 *
 * The customer app's welcome screen only exists on a first sign-in; visiting
 * `/welcome` as an existing account redirects to My trees. So a recipe that
 * hardcoded a number would work once and then quietly document a different
 * screen, which is the failure this whole pipeline exists to prevent.
 *
 * The screen never displays the number — it asks for a name and an optional
 * email — so a different one each run produces an identical figure. The cost is
 * an abandoned account per capture in the development database, which is a fair
 * price for a figure that rebuilds.
 *
 * `07` then nine digits off the clock. Seeded numbers are in ranges this will
 * not reach, and a collision fails loudly rather than silently: the run lands
 * on My trees and the measure step cannot find the name field.
 */
function resolveValue(value) {
  if (typeof value !== "string" || !value.includes("{{uniquePhone}}")) return value;
  const digits = String(Date.now()).slice(-9);
  return value.replace("{{uniquePhone}}", `07${digits}`);
}

/** The steps a shot list may use. Deliberately few — a shot list is a recipe,
 *  not a program, and anything that needs branching belongs in a test. */
async function runStep(page, step, baseUrl) {
  const [verb, arg] = Object.entries(step)[0];
  switch (verb) {
    case "goto":
      await page.goto(`${baseUrl}${arg}`, { waitUntil: "networkidle" });
      return;
    case "wait":
      await page.locator(arg).first().waitFor({ state: "visible", timeout: 30_000 });
      return;
    case "fill":
      await page.locator(arg[0]).first().fill(resolveValue(arg[1]));
      return;
    case "click":
      await page.locator(arg).first().click();
      return;
    case "press":
      await page.keyboard.press(arg);
      return;
    case "pause":
      await new Promise((r) => setTimeout(r, arg));
      return;
    case "park":
      /*
       * Put the pointer and the focus somewhere harmless.
       *
       * A click leaves the mouse where it landed, and a dialog opening under it
       * opens with something hovered. The New caretaker figure came back with a
       * black "Close" tooltip over its heading — real, but an artefact of how
       * the screenshot was taken rather than anything a reader would meet.
       *
       * Moving the mouse was not enough: that tooltip is on *focus*, and the
       * dialog autofocuses its close button. Both have to be cleared, which is
       * why this is one step and not two.
       */
      await page.mouse.move(8, 8);
      await page.evaluate(() => {
        const el = document.activeElement;
        if (el && el !== document.body && typeof el.blur === "function") el.blur();
      });
      await new Promise((r) => setTimeout(r, 300));
      return;
    case "hide": {
      // For things that exist only because this is a development stack — the
      // mock SMS panel prints the sign-in code on screen, and a reader would
      // never see it.
      //
      // It fails when nothing matched, rather than quietly hiding nothing. The
      // selector is a styling class on somebody else's app; the day it changes,
      // a silent no-op publishes a live code into a manual, and the screenshot
      // looks entirely normal.
      const hidden = await page.evaluate((sel) => {
        const els = [...document.querySelectorAll(sel)];
        els.forEach((el) => {
          el.style.visibility = "hidden";
        });
        return els.length;
      }, arg);
      if (!hidden) {
        throw new Error(
          `hide "${arg}" matched nothing — if the element is gone the step should go too, ` +
            `and if it moved this figure would have shipped it`,
        );
      }
      return;
    }
    case "hideText": {
      /*
       * Hide by what it says, not by how it is styled.
       *
       * `hide` takes a CSS selector, which for a development banner means
       * coupling to somebody else's Tailwind classes — and this is the second
       * dev artefact to nearly ship in a figure. The first was the mock SMS
       * panel; the second was a "TEST ENVIRONMENT — NO SMS SENT" banner sitting
       * in the middle of the corporate sign-in shot, which is the manual that
       * goes to clients.
       *
       * The wording is the durable part. A banner may be restyled; it will not
       * quietly stop saying what it says.
       */
      const hidden = await page.evaluate((text) => {
        const wanted = text.toLowerCase();
        const matches = [...document.querySelectorAll("body *")].filter(
          (el) =>
            (el.textContent || "").toLowerCase().includes(wanted) &&
            ![...el.children].some((child) =>
              (child.textContent || "").toLowerCase().includes(wanted),
            ),
        );
        // The innermost match, then the box around it, so a bordered banner
        // does not leave its border behind.
        matches.forEach((el) => {
          const box = el.closest("div") ?? el;
          box.style.visibility = "hidden";
        });
        return matches.length;
      }, arg);
      if (!hidden) {
        throw new Error(
          `hideText "${arg}" matched nothing — if that notice is gone the step should go ` +
            `too, and if it was reworded this figure would have shipped it`,
        );
      }
      return;
    }
    case "eval":
      await page.evaluate(arg);
      return;
    default:
      throw new Error(`unknown step "${verb}"`);
  }
}

async function shootWeb(browser, list, appName, app, provenance) {
  const surface = CONFIG.surfaces[app.surface];
  const baseUrl = process.env[app.urlEnv] ?? app.url;

  for (const figure of list.figures) {
    const context = await browser.newContext({
      viewport: { width: surface.width, height: surface.height },
      deviceScaleFactor: SCALE,
    });
    const page = await context.newPage();

    try {
      for (const step of figure.steps) await runStep(page, step, baseUrl);

      const cropX = figure.cropX ?? surface.cropX;
      const measured = await page.evaluate(
        ([spec, wantCropX, src]) => {
          window.__CALLOUTS = spec;
          window.__CROP_X = wantCropX;
          // eslint-disable-next-line no-eval
          return eval(src);
        },
        [figure.callouts, cropX, MEASURE],
      );

      const parsed = JSON.parse(measured);
      if (!parsed.ok) {
        throw new Error(
          `${figure.id}: could not find ${parsed.missing.join(", ")} — ` +
            `the screen has moved under the shot list`,
        );
      }
      parsed.provenance = { ...(parsed.provenance ?? {}), ...provenance, url: page.url() };

      const cleanPath = join(WORK, `${figure.id}.clean.png`);
      await page.screenshot({ path: cleanPath });
      writeFileSync(join(WORK, `${figure.id}.json`), JSON.stringify(parsed));

      await composeAndRender(browser, figure, cleanPath, join(WORK, `${figure.id}.json`));
      console.log(`  ✓ ${figure.id}`);
    } finally {
      await context.close();
    }
  }
}

/**
 * Draw the markers, then photograph the drawing.
 *
 * The clean frame is inlined into a generated page by `compose.mjs`; this opens
 * that page and screenshots it at the same scale, so the finished figure is one
 * consistent resolution rather than a 2× screenshot inside a 1× canvas.
 */
async function composeAndRender(browser, figure, cleanPath, targetsPath) {
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
    // The page reports its finished size once the frame has decoded, because
    // the legend's height depends on how its text wraps.
    await page.waitForFunction(() => document.title.startsWith("ready:"), { timeout: 15_000 });
    const [w, h] = (await page.title()).replace("ready:", "").split("x").map(Number);
    await page.setViewportSize({ width: w, height: h });
    await page.screenshot({ path: join(ROOT, "public", "img", `${figure.id}.png`) });
  } finally {
    await context.close();
  }

  for (const [from, to] of [
    [htmlPath.replace(/\.html$/, ".alt.txt"), join(ROOT, "capture", "alt", `${figure.id}.alt.txt`)],
    [
      htmlPath.replace(/\.html$/, ".provenance.json"),
      join(ROOT, "capture", "provenance", `${figure.id}.json`),
    ],
  ]) {
    if (existsSync(from)) writeFileSync(to, readFileSync(from));
  }
}

/**
 * The phone. Driven by `simctl` and Maestro rather than a browser, but it
 * produces the same `targets.json` and goes through the same composer, so the
 * figures match the web ones instead of looking like a second manual.
 */
async function shootIos(browser, list, appName, app, provenance) {
  const device = process.env[app.deviceEnv];
  if (!device) {
    throw new Error(
      `${appName}: set ${app.deviceEnv} to a booted simulator udid ` +
        `(xcrun simctl list devices booted)`,
    );
  }

  for (const figure of list.figures) {
    // Terminate first so each figure starts from a cold app rather than
    // wherever the previous one left it. It exits non-zero when the app was not
    // running, which is the normal case on the first figure and not a failure.
    try {
      execFileSync("xcrun", ["simctl", "terminate", device, app.bundleId], { stdio: "ignore" });
    } catch {
      // not running
    }

    // Launched through Maestro rather than `simctl launch`, which returns as
    // soon as the process exists and tells you nothing about whether the app
    // came up. Sleeping afterwards is a guess, and it was wrong often enough to
    // produce a capture of the simulator's home screen — which fails as a
    // missing callout and reads like the app changed.
    const launch = join(WORK, `${figure.id}.launch.yml`);
    writeFileSync(launch, `appId: ${app.bundleId}\n---\n- launchApp\n`);
    execFileSync("maestro", ["--device", device, "test", launch], { stdio: "ignore" });

    for (const step of figure.steps ?? []) {
      const [verb, arg] = Object.entries(step)[0];
      if (verb === "tap" || verb === "tapIfPresent") {
        // Maestro rather than raw coordinates, so a moved button is a failure
        // rather than a tap on empty space.
        //
        // `tapIfPresent` is for things that are genuinely intermittent — the
        // simulator's "Open in Otesha (Demo)?" prompt appears on some launches
        // and not others. Maestro fails a missing `tapOn` outright, so without
        // an optional form the whole capture dies on a dialog that was not
        // there.
        const flow = join(WORK, `${figure.id}.tap.yml`);
        const body =
          verb === "tapIfPresent"
            ? `- tapOn:\n    text: ${JSON.stringify(arg)}\n    optional: true\n`
            : `- tapOn: ${JSON.stringify(arg)}\n`;
        writeFileSync(flow, `appId: ${app.bundleId}\n---\n${body}`);
        execFileSync("maestro", ["--device", device, "test", flow], { stdio: "ignore" });
      } else if (verb === "scroll") {
        // Repeated rather than parameterised by distance: Maestro scrolls by a
        // screenful, and "three screens down" is the unit a shot list actually
        // wants when it is hunting for something at the bottom of a settings
        // page.
        const flow = join(WORK, `${figure.id}.scroll.yml`);
        writeFileSync(flow, `appId: ${app.bundleId}\n---\n${"- scroll\n".repeat(Number(arg) || 1)}`);
        execFileSync("maestro", ["--device", device, "test", flow], { stdio: "ignore" });
      } else if (verb === "pause") {
        await new Promise((r) => setTimeout(r, arg));
      } else {
        throw new Error(`unknown ios step "${verb}"`);
      }
    }

    const cleanPath = join(WORK, `${figure.id}.clean.png`);
    execFileSync("xcrun", ["simctl", "io", device, "screenshot", cleanPath], { stdio: "ignore" });

    const calloutsPath = join(WORK, `${figure.id}.callouts.json`);
    writeFileSync(calloutsPath, JSON.stringify(figure.callouts));
    const targetsPath = join(WORK, `${figure.id}.json`);
    execFileSync(
      "node",
      [join(HERE, "mobile-measure.mjs"), device, cleanPath, targetsPath, calloutsPath],
      { stdio: ["ignore", "ignore", "inherit"] },
    );

    const parsed = JSON.parse(readFileSync(targetsPath, "utf8"));
    parsed.provenance = { ...(parsed.provenance ?? {}), ...provenance };
    writeFileSync(targetsPath, JSON.stringify(parsed));

    await composeAndRender(browser, figure, cleanPath, targetsPath);
    console.log(`  ✓ ${figure.id}`);
  }
}

// ── run ──────────────────────────────────────────────────────────────────────

const only = process.argv[2];
const lists = readdirSync(SHOTS, { recursive: true })
  .filter((f) => typeof f === "string" && f.endsWith(".json"))
  .filter((f) => !only || f.replace(/\.json$/, "") === only)
  .sort();

if (!lists.length) {
  console.error(only ? `no shot list for "${only}"` : `no shot lists in ${SHOTS}`);
  process.exit(2);
}

const browser = await chromium.launch();
let failures = 0;

try {
  for (const file of lists) {
    const list = JSON.parse(readFileSync(join(SHOTS, file), "utf8"));
    const app = CONFIG.apps[list.app];
    if (!app) throw new Error(`${file}: unknown app "${list.app}"`);

    console.log(`\n${file.replace(/\.json$/, "")} · ${list.app}`);
    try {
      const provenance = preflight(list.app, app);
      if (app.surface === "ios") await shootIos(browser, list, list.app, app, provenance);
      else await shootWeb(browser, list, list.app, app, provenance);
    } catch (err) {
      console.error(`  ✗ ${err.message}`);
      failures++;
    }
  }
} finally {
  await browser.close();
}

process.exit(failures ? 1 : 0);
