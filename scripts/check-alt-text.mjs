/**
 * Every figure must carry its callout notes as text.
 *
 * The AI assistant is bring-your-own-key and runs in the reader's browser
 * against a context built from the pages' text. It is never given the images.
 * A screenshot therefore reaches it as exactly its alt text and caption and
 * nothing else — so a numbered marker whose explanation lives only in the
 * drawn legend is, to the assistant and to search and to a screen reader,
 * information the page does not contain.
 *
 * `capture/compose.mjs` writes each figure's notes to a `.alt.txt` beside the
 * image. This checks the markdown actually says them. It matches on the notes
 * rather than on the whole string so an author can still write a better
 * sentence around them.
 *
 *   node scripts/check-alt-text.mjs
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = join(ROOT, "docs");
const ALTS = join(ROOT, "capture", "alt");

/** `![alt](src "caption")` — the standalone-image form docs-viewer reads as a figure. */
const FIGURE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;

/** Punctuation and case are the author's business; the words are not. */
const normalise = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

let failures = 0;
let checked = 0;

for (const category of readdirSync(DOCS, { withFileTypes: true })) {
  if (!category.isDirectory()) continue;
  for (const file of readdirSync(join(DOCS, category.name))) {
    if (!file.endsWith(".md")) continue;
    const rel = `${category.name}/${file}`;
    const body = readFileSync(join(DOCS, category.name, file), "utf8");

    for (const [, alt, src, caption] of body.matchAll(FIGURE)) {
      if (!alt.trim()) {
        // An empty alt is how you mark an image as decorative. A screenshot in
        // a manual never is.
        console.error(`  FAIL  ${rel}: ${src} has empty alt text`);
        failures++;
        continue;
      }

      // Notes only exist for figures the capture step annotated.
      const notesFile = join(ALTS, `${src.split("/").pop().replace(/\.png$/, "")}.alt.txt`);
      if (!existsSync(notesFile)) continue;

      checked++;
      const haystack = normalise(`${alt} ${caption ?? ""}`);
      const notes = readFileSync(notesFile, "utf8")
        .replace(/^Marked on the screenshot:\s*/, "")
        .split(/(?<=\.)\s+/)
        .map((s) => s.trim())
        .filter(Boolean);

      for (const note of notes) {
        if (haystack.includes(normalise(note))) continue;
        console.error(`  FAIL  ${rel}: ${src} is missing its callout note — "${note}"`);
        failures++;
      }
    }
  }
}

if (!failures) console.log(`  ok    alt text: ${checked} annotated figures carry their callout notes`);
process.exit(failures ? 1 : 0);
