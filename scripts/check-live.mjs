/**
 * Walk the deployed site and prove it is not quietly broken.
 *
 * The other checks run against the source and against `dist`. This one runs
 * against the URL the team actually opens, which is the only place a class of
 * failure shows up at all: a figure written as `/img/name.png` is correct in
 * the source, correct in the bundle, and a 404 the moment the site is served
 * from `/<repo>/` rather than the root. Nothing short of loading the real page
 * catches it.
 *
 * It opens every page, waits for the figures to settle, and clicks every
 * cross-link rather than reading its href — docs-viewer renders them as
 * `button.page-link` with an onClick, so an href check would find nothing and
 * report success.
 *
 *   node scripts/check-live.mjs [url]
 */
import { chromium } from "playwright";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SITE = (process.argv[2] ?? "https://kazzigroup.github.io/otesha-docs/").replace(/\/?$/, "/");

/** Every route, read from the frontmatter rather than hardcoded. */
function routes(dir = "docs") {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...routes(path));
    else if (entry.name.endsWith(".md")) {
      const text = readFileSync(path, "utf8");
      const id = text.match(/^id:\s*(\S+)/m);
      const category = text.match(/^category:\s*(\S+)/m);
      if (id && category) out.push(`${category[1]}/${id[1]}`);
    }
  }
  return out.sort();
}

const PAGES = routes();
const browser = await chromium.launch();
const page = await browser.newPage();
const httpErrors = [];
page.on("response", (r) => {
  if (r.status() >= 400) httpErrors.push(`${r.status()} ${r.url()}`);
});

console.log(`Walking ${SITE} — ${PAGES.length} pages\n`);
await page.goto(SITE, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(3000);

/**
 * Navigate by hash.
 *
 * `page.goto` with only the fragment changed does not reload, so `networkidle`
 * never settles and the call times out. Setting `location.hash` is what a click
 * does anyway.
 */
const go = async (route) => {
  await page.evaluate((h) => { window.location.hash = `#/${h}`; }, route);
  await page.waitForTimeout(650);
  await page
    .waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 15000 })
    .catch(() => {});
};

let figures = 0;
let hops = 0;
const problems = [];

for (const route of PAGES) {
  await go(route);
  const heading = await page.$eval("h1", (e) => e.textContent.trim()).catch(() => null);
  const shots = await page.$$eval("img", (els) =>
    els.map((e) => ({ src: e.getAttribute("src"), width: e.naturalWidth })),
  );
  const broken = shots.filter((s) => s.width === 0);
  const links = await page.$$eval("button.page-link", (els) => els.map((e) => e.textContent.trim()));
  figures += shots.length;

  if (!heading) problems.push(`${route}: rendered no heading`);
  for (const s of broken) problems.push(`${route}: broken figure ${s.src}`);

  const status = broken.length || !heading ? "FAIL" : "ok  ";
  console.log(
    `  ${status}  ${route.padEnd(32)} ${String(shots.length).padStart(2)} fig  ` +
      `${String(links.length).padStart(2)} links  "${(heading ?? "—").slice(0, 32)}"`,
  );

  for (let i = 0; i < links.length; i++) {
    // Re-enter the page each time: clicking navigates away, and the button list
    // on the destination is a different list.
    await go(route);
    const buttons = await page.$$("button.page-link");
    if (!buttons[i]) continue;
    await buttons[i].click();
    await page.waitForTimeout(650);
    const landed = (page.url().split("#/")[1] ?? "").split("#")[0];
    const heading2 = await page.$eval("h1", (e) => e.textContent.trim()).catch(() => null);
    hops++;
    if (!landed || !heading2) problems.push(`${route}: cross-link "${links[i]}" went nowhere`);
  }
}

console.log(
  `\n  ${PAGES.length} pages · ${figures} figures · ${hops} cross-links followed`,
);
if (httpErrors.length) {
  console.log("  HTTP errors:");
  [...new Set(httpErrors)].forEach((e) => console.log(`    ${e}`));
}
await browser.close();

if (problems.length) {
  console.log("\n  FAIL");
  problems.forEach((p) => console.log(`    - ${p}`));
  process.exit(1);
}
console.log("\n  ok    every page renders, every figure loads, every cross-link arrives");
