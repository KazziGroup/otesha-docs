import { buildDocsConfig } from "./build-config";

/**
 * Everything. The build Otesha staff read.
 *
 * Selected by `DOCS_AUDIENCE=internal`, which is the default — see the alias in
 * `vite.config.ts`. Erring towards the smaller build if the variable were
 * misspelled would mean a typo silently shipping staff a manual with the admin
 * portal missing, and nobody would report it as a bug; they would just assume
 * those pages had not been written yet.
 */
const modules = import.meta.glob("../../docs/**/*.md", {
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
  { title: "", categoryIds: ["customer"] },
  { title: "", categoryIds: ["admin"] },
  { title: "", categoryIds: ["corporate"] },
  { title: "", categoryIds: ["caretaker"] },
]);
