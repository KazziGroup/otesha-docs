/**
 * Every `[[link:…]]` must resolve inside the build it ships in.
 *
 * The hazard the two-build split introduces. A corporate page may link to an
 * admin page and be perfectly correct in the internal build, while in the
 * external one the admin page is not merely hidden — it is not there, and the
 * link is a button that does nothing. Nobody at Otesha would see it, because
 * internally it works.
 *
 * So the check runs per audience against the same file sets the globs in
 * `src/audience/` use, and a link is only valid if its target is in that
 * audience's set.
 *
 *   node scripts/check-links.mjs
 */

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DOCS = resolve(dirname(fileURLToPath(import.meta.url)), "..", "docs");

/** Kept in step with the globs in `src/audience/`. */
const AUDIENCES = {
  internal: ["overview", "customer", "admin", "corporate", "caretaker"],
  external: ["overview", "corporate"],
};

const pages = [];
for (const category of readdirSync(DOCS, { withFileTypes: true })) {
  if (!category.isDirectory()) continue;
  for (const file of readdirSync(join(DOCS, category.name))) {
    if (!file.endsWith(".md")) continue;
    const body = readFileSync(join(DOCS, category.name, file), "utf8");
    const id = body.match(/^id:\s*(.+)$/m)?.[1]?.trim();
    if (!id) {
      console.error(`  FAIL  ${category.name}/${file} has no \`id:\` in its frontmatter`);
      process.exit(1);
    }
    pages.push({
      category: category.name,
      file: `${category.name}/${file}`,
      key: `${category.name}/${id}`,
      links: [...body.matchAll(/\[\[link:([^\]|]+)\|/g)].map((m) => m[1].trim()),
    });
  }
}

let failures = 0;

/*
 * Page ids must be unique across every manual, not merely within one.
 *
 * docs-viewer keys its lookup on the id alone — `buildSectionMap` does
 * `map[section.id] = …` with no category in the key — so two pages sharing an
 * id silently collapse into whichever was parsed last. Module 1 gave all four
 * sign-in pages `id: sign-in`, and every one of `/customer/sign-in`,
 * `/admin/sign-in`, `/corporate/sign-in` and `/caretaker/sign-in` rendered the
 * caretaker page. Nothing else caught it: the links resolved, the figures
 * existed, the builds mounted, and the sidebar listed all four.
 */
const byId = new Map();
for (const page of pages) {
  const id = page.key.split("/")[1];
  if (byId.has(id)) {
    console.error(
      `  FAIL  ${page.file} and ${byId.get(id)} share the id "${id}" — ` +
        `docs-viewer keys pages by id alone, so one will render in place of the other`,
    );
    failures++;
  }
  byId.set(id, page.file);
}

for (const [audience, categories] of Object.entries(AUDIENCES)) {
  const shipped = pages.filter((p) => categories.includes(p.category));
  const keys = new Set(shipped.map((p) => p.key));

  for (const page of shipped) {
    for (const link of page.links) {
      if (keys.has(link)) continue;
      // Named apart, because the two are different jobs: a typo is fixed in
      // the link, a cross-audience link is fixed by rewriting the sentence.
      const reason = pages.some((p) => p.key === link)
        ? `points at ${link}, which the ${audience} build does not ship`
        : `points at ${link}, which does not exist`;
      console.error(`  FAIL  [${audience}] ${page.file} ${reason}`);
      failures++;
    }
  }
  if (!failures) console.log(`  ok    ${audience}: ${shipped.length} pages, every link resolves`);
}

process.exit(failures ? 1 : 0);
