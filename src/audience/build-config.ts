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
export function buildDocsConfig(modules: Modules, sections: Section[]): DocsConfig {
  const files = Object.entries(modules)
    .map(([path, content]) => ({
      content: content as string,
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
