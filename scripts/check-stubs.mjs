/**
 * No page ships saying "Placeholder".
 *
 * Phase 0 scaffolded every planned page as a stub so the structure could be
 * built and navigated before any of it was written. That was the right way to
 * start and the wrong thing to forget: six of those stubs were still live weeks
 * later, including the overview — the first page anybody opening the link sees —
 * and the API key page, which other pages had begun linking to as though it said
 * something.
 *
 * Every other check passed the whole time. They ask whether links resolve and
 * figures rebuild, and a stub has no links and no figures, so it sails through.
 *
 * A page that cannot be written yet is fine. It has to say why it cannot, in the
 * words of the thing blocking it, which is what `docs/overview` promises the
 * reader. What it may not do is say "Placeholder — this page is a stub".
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const FORBIDDEN = [
  /placeholder/i,
  /\bstub for the structural trial\b/i,
  /\bTODO\b/,
  /\bTBD\b/,
  /\bLorem ipsum\b/i,
];

let failures = 0;

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith(".md")) {
      const text = readFileSync(path, "utf8");
      text.split("\n").forEach((line, i) => {
        for (const pattern of FORBIDDEN) {
          if (pattern.test(line)) {
            console.error(`  FAIL  ${path}:${i + 1}: ${line.trim().slice(0, 78)}`);
            failures++;
          }
        }
      });
    }
  }
}

walk("docs");

if (failures) {
  console.error(`\n  ${failures} unwritten line${failures === 1 ? "" : "s"} would have shipped`);
  process.exit(1);
}
console.log("  ok    no page ships a placeholder");
