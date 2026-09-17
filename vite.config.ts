import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Which manuals this build contains.
 *
 * One repo, two builds. The corporate manual goes to clients outside Otesha;
 * the admin manual describes releasing payouts and who may do what. Those want
 * different deployments, but they do not want different repositories: the
 * screenshots, the components and the writing conventions are shared, and four
 * repos means four of everything and four chances to drift.
 *
 * The split is an alias rather than a runtime flag on purpose. Both audience
 * modules glob their own pages, and only the aliased one is pulled into the
 * module graph — so the external bundle never contains the internal text, as
 * opposed to containing it and declining to render it. See `audience/external`.
 */
const AUDIENCE = process.env.DOCS_AUDIENCE === "external" ? "external" : "internal";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  resolve: {
    /**
     * One copy of each of these, or the production build renders nothing.
     *
     * docs-viewer is linked with `file:../docs-viewer`, which npm symlinks, and
     * it carries its own `react`, `react-dom` and `react-router` in
     * `node_modules`. Without deduping, the production bundle contains two
     * React Router instances: the app's `<HashRouter>` publishes its context on
     * one, and `DocsViewer`'s `useNavigate` looks for it on the other. The page
     * dies on "useNavigate() may be used only in the context of a <Router>".
     *
     * It only breaks in `vite build`. The dev server resolves through a single
     * optimised copy, so `npm run dev` is perfect while the thing you deploy is
     * a blank page — which is exactly how this survived unnoticed until the
     * build was actually opened in a browser rather than grepped.
     */
    dedupe: ["react", "react-dom", "react-router", "react-router-dom"],
    alias: {
      "virtual:docs-config": fileURLToPath(
        new URL(`./src/audience/${AUDIENCE}.ts`, import.meta.url),
      ),
    },
  },
});
