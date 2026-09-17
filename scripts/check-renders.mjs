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
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = await (async () => {
  try {
    return await import("playwright");
  } catch {
    // Borrowed from the e2e project — see capture/walkthrough.mjs.
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
      /*
       * Mounting is not the same as being styled, and this check learned that
       * the hard way: it passed on a build that rendered as unstyled HTML —
       * serif text, no layout, icons the size of the page — because the markup
       * was all present.
       *
       * `overflow-y-auto` on the docs pane is a Tailwind utility, so if
       * Tailwind generated nothing the computed value falls back to `visible`.
       *
       * It is deliberately a coarse probe: it catches "Tailwind produced
       * essentially nothing", which is the failure that happened, and it will
       * not notice a single missing utility. A finer check would need a
       * screenshot and a human, and would fail on every intentional restyle.
       */
      const overflow = await page.evaluate(() => {
        const main = document.querySelector("main");
        return main ? getComputedStyle(main).overflowY : null;
      });
      if (overflow !== "auto") {
        console.error(
          `  FAIL  ${build.name}: built site is unstyled — main overflow-y is "${overflow}", expected "auto"`,
        );
        failures++;
      }

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
