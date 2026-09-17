/**
 * The audience module `vite.config.ts` aliases in — `audience/internal` or
 * `audience/external`. Declared rather than imported directly so the app has
 * no opinion about which manuals it contains.
 */
declare module "virtual:docs-config" {
  import type { DocsConfig } from "@jestrux/docs-viewer";
  export const docsConfig: DocsConfig;
}
