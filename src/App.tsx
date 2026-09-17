import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { DocsProvider, DocsViewer } from "@jestrux/docs-viewer";
import "@jestrux/docs-viewer/styles";
import { docsConfig } from "virtual:docs-config";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/overview/intro" replace />} />
        {/*
          The third segment is optional and names a heading on the page, so a
          cross-manual reference can point at a step rather than at a page and
          the words "see the third step". docs-viewer already resolved
          `category/page/subsection` for link previews; without this route it
          resolved to a URL that matched nothing.
        */}
        <Route
          path="/:categoryId/:sectionId/:subsectionId?"
          element={
            <DocsProvider
              config={{
                ...docsConfig,
                // Bring-your-own-key: the reader pastes their own OpenAI or
                // Anthropic key, it is kept in their browser's localStorage,
                // and their browser calls the provider directly. Nothing is
                // proxied through Otesha and no key is stored server-side.
                ai: true,
                // Otesha's own palette, from the product theme.
                theme: {
                  primary: "#12862A",
                  primaryDark: "#8FD69B",
                  light: {
                    background: "#FFFFFF",
                    foreground: "#14231A",
                    card: "#FFFFFF",
                    "card-foreground": "#14231A",
                    primary: "#12862A",
                    "primary-foreground": "#FFFFFF",
                    muted: "#F6F3EB",
                    "muted-foreground": "#5C6B60",
                    border: "#E2E0D8",
                    sidebar: "#FFFFFF",
                    "sidebar-foreground": "#14231A",
                    "sidebar-border": "#E2E0D8",
                    "sidebar-accent": "#F6F3EB",
                    "sidebar-accent-foreground": "#14231A",
                  },
                  dark: {
                    background: "#0F2216",
                    foreground: "#F6F3EB",
                    card: "#16301F",
                    "card-foreground": "#F6F3EB",
                    primary: "#8FD69B",
                    "primary-foreground": "#0C2F1A",
                    muted: "#16301F",
                    "muted-foreground": "#8A9A8D",
                    border: "#2A4A32",
                    sidebar: "#16301F",
                    "sidebar-foreground": "#F6F3EB",
                    "sidebar-border": "#2A4A32",
                    "sidebar-accent": "#0F2216",
                    "sidebar-accent-foreground": "#F6F3EB",
                  },
                },
              }}
            >
              <DocsViewer />
            </DocsProvider>
          }
        />
      </Routes>
    </HashRouter>
  );
}
