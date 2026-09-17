import { buildDocsConfig } from "./build-config";

/**
 * The corporate manual only. The build clients outside Otesha read.
 *
 * **Why this is a second glob and not a filter.**
 *
 * `import.meta.glob` inlines every match into the bundle at build time. So
 * globbing everything and then dropping the admin pages in code hides them from
 * the sidebar while leaving their full text sitting in the JavaScript, where
 * View Source finds it. For pages describing payout release and the permissions
 * matrix, a filter is not access control — it is the appearance of it, which is
 * worse, because it reads as solved.
 *
 * Narrowing the pattern is what actually keeps the bytes out. Vite needs it
 * written as a literal here, and `vite.config.ts` picks which of these two
 * modules enters the graph, so only one set is ever bundled.
 *
 * The test that this still holds is in `scripts/check-audience-builds.sh`, and
 * it greps the built bundle rather than trusting the arrangement.
 */
const modules = import.meta.glob("../../docs/{overview,corporate}/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

// Section titles are blank because each section holds exactly one manual, and
// the manual's own collapsible header already carries its name — a section
// title above it renders "CUSTOMER APP" immediately above "Customer app".
// The sections still exist to fix the order.
export const docsConfig = buildDocsConfig(modules, [
  { title: "", categoryIds: ["overview"] },
  { title: "", categoryIds: ["corporate"] },
]);
