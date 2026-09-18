import { parseMarkdownDocs, organizeSidebar } from "@jestrux/docs-viewer/parser";
import type { DocsConfig } from "@jestrux/docs-viewer";

/** A raw markdown file, as `import.meta.glob` hands it over. */
export type Modules = Record<string, unknown>;

type Section = { title: string; categoryIds: string[] };

/**
 * Turn a glob result into a docs config.
 *
 * The glob itself stays in the caller. Vite requires the pattern to be a
 * literal it can see at build time, so a shared `loadDocs(pattern)` would
 * silently match nothing — the one arrangement that looks tidiest is the one
 * that cannot work. What is safe to share is everything after the glob, which
 * is this.
 */
/**
 * Point the figures at wherever this build is being served from.
 *
 * Every page writes its figures as `/img/name.png`, which is right when the
 * site is at the root and wrong the moment it is not: GitHub Pages serves a
 * project repo at `/<repo>/`, where a root-absolute path resolves against the
 * domain and every screenshot 404s. Vite rewrites asset URLs it can see in JS
 * and CSS, but these live inside markdown loaded `?raw`, so they are just text
 * to it.
 *
 * Rewriting here rather than in the markdown keeps the source portable: the
 * pages stay readable on GitHub, and the same files build for the root, for a
 * subpath, or for a custom domain without editing 43 of them.
 */
function withBase(content: string): string {
  const base = import.meta.env.BASE_URL;
  if (base === "/") return content;
  // Markdown `](/img/…)` and any raw HTML `src="/img/…"`.
  return content.replace(/(\]\(|["'])\/img\//g, `$1${base}img/`);
}

export function buildDocsConfig(modules: Modules, sections: Section[]): DocsConfig {
  const files = Object.entries(modules)
    .map(([path, content]) => ({
      content: withBase(content as string),
      path: path.replace("../../docs/", ""),
    }))
    // Sorted so the sidebar order is the filename order, which is what the
    // `01-`, `02-` prefixes are for.
    .sort((a, b) => a.path.localeCompare(b.path));

  return {
    title: "Otesha manuals",
    subtitle: "How to do the thing you came to do",
    sections: organizeSidebar(parseMarkdownDocs(files), sections),
  };
}
