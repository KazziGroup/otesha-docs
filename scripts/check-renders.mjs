/**
 * The built site must actually mount in a browser.
 *
 * Written because it did not, for most of this trial, and nothing noticed.
 * `vite build` succeeded, the bundle contained every page, and
 * `check-audience-builds.sh` — which greps the output — passed. But opening the
 * result gave a blank page: docs-viewer is linked with `file:../docs-viewer`
 * and brings its own copy of react-router, so the production bundle held two
 * Router instances and `useNavigate` could not find the app's context. `npm run
 * dev` was perfect throughout, because the dev server resolves one copy.
 *
 * The lesson is narrow and worth keeping: a check that reads the bundle proves
 * what is in it, never that it runs. So this one opens it.
 *
 *   node scripts/check-renders.mjs
 */

import { execFileSync, spawn } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = await (async () => {
  try {
    return await import("playwright");
  } catch {
    // A fallback, not the plan: playwright is a devDependency here. This only
    // fires in a tree where dev dependencies were skipped, and borrows the copy
    // the e2e project already has rather than failing on an import.
    const resolved = require.resolve("playwright", {
      paths: [new URL("../../otesha/e2e/", import.meta.url).pathname],
    });
    const mod = await import(resolved);
    return mod.chromium ? mod : mod.default;
  }
})();

/** Each build, the port to preview it on, and the manuals it must show. */
const BUILDS = [
  {
    name: "internal",
    audience: "internal",
    outDir: "dist",
    port: 5391,
    expect: ["Customer app", "Admin portal", "Corporate portal", "Caretaker app"],
    forbid: [],
  },
  {
    name: "external",
    audience: "external",
    outDir: "dist-external",
    port: 5392,
    expect: ["Corporate portal"],
    // The sidebar is a weaker claim than the bundle grep next door, but it is
    // the one a reader would actually see, so both are worth asserting.
    forbid: ["Admin portal", "Caretaker app", "Customer app"],
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;

const browser = await chromium.launch();

for (const build of BUILDS) {
  execFileSync("npx", ["vite", "build", "--outDir", build.outDir], {
    env: { ...process.env, DOCS_AUDIENCE: build.audience },
    stdio: "ignore",
  });

  /*
   * Is the stylesheet actually full of Tailwind?
   *
   * Mounting is not the same as being styled, and two attempts to prove this
   * through the browser both failed. Watching `overflow-y` on the docs pane
   * survived a near-empty stylesheet; the sidebar's width moved the wrong way
   * (288px unstyled against 247px styled, because the measured element sits
   * inside the padded container that carries `w-72`). Computed layout turns out
   * to be a poor witness for "no CSS arrived".
   *
   * The file size is a direct one. Nearly every class that styles these pages
   * lives in docs-viewer's components, and Tailwind does not scan
   * `node_modules` without `@source` — drop that line and the stylesheet falls
   * from 34 kB to 10 kB. Drop the `@import` and it falls to 1.9 kB. The floor
   * sits well below a healthy build and well above both failures, so it needs
   * no maintenance as the manuals grow — which only pushes the number up.
   */
  const MIN_CSS_BYTES = 20_000;
  const cssDir = join(build.outDir, "assets");
  const css = readdirSync(cssDir).filter((f) => f.endsWith(".css"));
  const cssBytes = css.reduce((n, f) => n + statSync(join(cssDir, f)).size, 0);
  if (cssBytes < MIN_CSS_BYTES) {
    console.error(
      `  FAIL  ${build.name}: built stylesheet is ${cssBytes} bytes, expected at least ` +
        `${MIN_CSS_BYTES}. Tailwind generated almost nothing — check the @source line ` +
        `in src/index.css.`,
    );
    failures++;
  }

  const server = spawn(
    "npx",
    ["vite", "preview", "--outDir", build.outDir, "--port", String(build.port), "--strictPort"],
    { stdio: "ignore" },
  );

  try {
    // Polled rather than slept on. A fixed delay is either slower than it needs
    // to be or occasionally shorter than the server takes, and the second one
    // fails as a connection refused that looks like a broken build.
    const deadline = Date.now() + 30_000;
    for (;;) {
      try {
        const res = await fetch(`http://localhost:${build.port}/`);
        if (res.ok) break;
      } catch {
        // not listening yet
      }
      if (Date.now() > deadline) throw new Error(`${build.name}: preview never came up`);
      await sleep(250);
    }

    const page = await browser.newPage();
    // A fresh context per build, and a cache-busting query, because a stale
    // index.html from a previous run reads exactly like a passing check.
    await page.goto(`http://localhost:${build.port}/?check=${build.port}#/overview/intro`, {
      waitUntil: "networkidle",
    });
    await sleep(1200);

    const mounted = await page.evaluate(
      () => document.getElementById("root")?.childElementCount ?? 0,
    );
    if (!mounted) {
      console.error(`  FAIL  ${build.name}: built site renders nothing (#root is empty)`);
      failures++;
    } else {
      const sidebar = await page.evaluate(() =>
        [...document.querySelectorAll("nav a, nav button")].map((e) => e.textContent.trim()),
      );
      for (const manual of build.expect) {
        if (sidebar.some((t) => t.includes(manual))) continue;
        console.error(`  FAIL  ${build.name}: sidebar is missing "${manual}"`);
        failures++;
      }
      for (const manual of build.forbid) {
        if (!sidebar.some((t) => t.includes(manual))) continue;
        console.error(`  FAIL  ${build.name}: sidebar shows "${manual}", which it must not`);
        failures++;
      }
      if (!failures) console.log(`  ok    ${build.name}: built site mounts and lists its manuals`);
    }
    await page.close();
  } finally {
    server.kill();
  }
}

await browser.close();
process.exit(failures ? 1 : 0);
