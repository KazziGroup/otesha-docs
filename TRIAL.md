# Trial: one repo or four?

A working scaffold for the Otesha manuals, built to answer the structural
question before we commit to writing ~70 pages against it. It is a real site,
not a mockup: **four real task pages, one per manual, with six annotated
screenshots captured from the running products** — including the caretaker app
on an iOS simulator — and 16 stubs so the navigation is judged at roughly the
shape it will actually reach.

Run it with `npm run dev`, check it with `npm run check`. A narrated walkthrough
is `node capture/narration.mjs && node capture/walkthrough.mjs && node
capture/assemble.mjs`.

## The answer

**One repo, two builds.** The only argument for splitting that survived contact
with the trial was access control, and it turns out not to need separate
repositories.

### Why not four

The four manuals share more than they differ:

- **The capture pipeline.** Screenshots are generated, not taken by hand (see
  below), and the generator has to sign in to each app and drive it. Four repos
  means four copies of that, or publishing it as a package and versioning it —
  both of which cost more than the thing they buy.
- **The viewer.** `@jestrux/docs-viewer` needed a change to support images at
  all. In four repos that is four dependency bumps, and in practice three of
  them happen and the fourth manual quietly renders differently for a year.
- **Cross-manual links.** A customer page pointing at a corporate one is a
  normal thing to want. Across four sites it is a hardcoded URL that nothing
  checks.
- **One search index.** Somebody at Otesha searching "payout" should find both
  the admin page that releases one and the corporate page that explains when
  they arrive. Four indexes cannot do that.

At 20 pages the whole tree is small. At the projected ~70 in two languages it is
still small. Splitting buys nothing on size.

### Why the audience split does not require splitting

The corporate manual is read by clients outside Otesha. The admin manual
describes releasing payouts and who is allowed to do what. Those want different
deployments — which is a build question, not a repository question.

`DOCS_AUDIENCE=external npm run build` produces a site containing only the
overview and corporate manuals. Not hidden: absent.

That distinction is the whole reason this needed testing rather than assuming.
The obvious implementation — glob every page, filter the internal ones out in
code — produces a site that looks correct, with no admin section in the sidebar
and the entire admin manual sitting in plain text inside `index-*.js`. It is the
appearance of access control, which is worse than none, because it reads as
solved.

So the two audiences are two modules with two globs, and `vite.config.ts`
aliases one of them into the build. Only the aliased one enters the module
graph. `scripts/check-audience-builds.sh` greps the built bundle to confirm it,
and was verified by reverting to the filter approach and watching it fail.

**The hazard this introduces**, and the reason `scripts/check-links.mjs` exists:
a corporate page may link to an admin page and be entirely correct internally,
while in the external build that link points at a page that is not there. Nobody
at Otesha would ever see it. The checker runs per audience and distinguishes the
two failures, because a typo is fixed in the link and a cross-audience link is
fixed by rewriting the sentence.

### The one thing that would change the answer

Everyone with access to this repository can read the admin manual's source,
whatever the deployed builds contain. If the admin content is sensitive enough
that the *source* needs separating and not just the deployment, that is the case
for a second repo — and it is a question about who is on the repo, not about
tooling. Worth deciding deliberately rather than inheriting.

## What the trial turned up along the way

### docs-viewer had no image support

Not limited support — none. `![alt](src)` was parsed, matched no case, and
returned an empty string, so images vanished silently. Added on the
`figure-blocks` branch as a first-class block: type, parser, renderer, and
search indexing, the last of which matters because the same `extractText` feeds
both search and the AI context, so a screenshot's alt text and caption are now
findable and answerable.

Two fixes worth noting because both were wrong in ways that still rendered:

- Figures were stretched to the content column. A 390×844 phone screenshot
  became 664×1435 — a screen and a half of picture per step, upscaled 1.7× so
  the interface text in it went soft. They are now capped by height, so a
  portrait shot keeps a phone's proportions and a console shot still fills the
  column.
- Captions used `--docs-muted`, which is a near-white *background* token, not
  the text one. They were barely legible on the paper background.

### Screenshots can be generated, and should be

All four apps can be driven automatically — the three web apps through a
browser, and the caretaker app through its 18 existing Maestro flows. This
changes the economics of the brief, which scopes ~350 images and calls
reshooting "the expensive half of the work", and it answers the open question
about what happens when a screen changes: the shot list is re-run.

`capture/` holds the working approach, in two passes:

1. `measure.js` records where each callout target is and how much of the frame
   is worth keeping.
2. `compose.mjs` lays the clean frame on a wider canvas and draws the markers in
   the added margin.

Two passes because of the phone. The brief asks for callouts "in the margin,
never drawn over a control", which assumes a 1440×900 console frame with
whitespace either side. A 390px phone has none, so a badge outside the control
is a badge off the edge of the image. Capturing wider to manufacture the margin
does not work either — the customer app lays its species grid out one card per
row at 390 and two at 640, so a wider shot would document a screen the phone
reader never sees. The frame stays 390 and the margin is added afterwards.

The crop is worth the complexity: the apps centre their content, so over half a
phone frame is often empty, and since figures are height-capped in the page
every empty pixel shrinks the interface text the reader is trying to read. The
crop refuses to cut through any element, because a cut halfway through the logo
reads as a broken image rather than a deliberate crop.

**All four are covered, including the phone.** The caretaker app is a real
native build on an iOS simulator, run with `EXPO_PUBLIC_STATIC_DEMO=1` so it
uses bundled fixtures and needs no backend. `capture/mobile-measure.mjs` reads
Maestro's view hierarchy and anchors markers to `accessibilityText` bounds — the
same rule as the web, where they anchor to elements — and emits the same
`targets.json` the web path does, so one composer produces every figure and the
manuals share one visual language.

Worth flagging: it was shot on an **iPhone simulator**, and real caretakers
almost certainly carry Android. The pipeline does not care, but the figures
should be re-shot on whatever they actually use before this ships.

**For production this should be a Playwright project in `otesha/e2e`**, beside
`tests` and `demo`, reusing `harness/stack.ts` for stack boot, seeded data and
sign-in. The browse CLI used here cannot set `deviceScaleFactor`, so everything
in `public/img` is 1×; Playwright makes that one line, and the existing demo
config already drives all three web apps.

### The finding that matters most: a screenshot of a product that does not exist

Partway through the trial, a capture of the sign-in screen came back with a
**Phone / Email** tab switcher on it, and an email field hinted *"For sponsors
outside Tanzania."* That is exactly the kind of audience distinction a manual
exists to state, so the task page was rewritten around it.

It is not a feature of Otesha. It lives on `a-second-front-door`, an unmerged
branch, in a git worktree from an unrelated earlier session whose dev server was
still answering on the port the capture pointed at. `main` and `staging` have no
email sign-in at all.

Nothing about the image showed this. It was sharp, correctly annotated, and
wrong — and the page written from it described a product nobody can use. It has
since been corrected back to the phone-only flow that actually ships.

The lesson is not about timing or about care. It is that **a screenshot is only
true relative to a commit**, and a pipeline that attaches to whatever is
answering on a port has no idea which commit that is. Three consequences:

- The capture harness must **start its own servers from a named ref**, not
  attach to a running one. This is the single strongest argument for building it
  on `otesha/e2e`'s `harness/stack.ts`, which already does exactly that.
- Every figure records what it was shot from. `capture/provenance/` holds the
  app, branch, commit and URL per image; the one in this trial honestly reports
  `pay-by-the-field @ 11c986d`, whose login path is identical to `main`.
- The shot list must be re-runnable and its output diffed, so a screen changing
  under the manual is a visible failure rather than a page that quietly stops
  being true.

Worth saying plainly to anyone weighing the automation: this failure is *more*
likely with hand-shot screenshots, not less. A person taking this screenshot by
hand would have had the same stray tab open and no commit recorded anywhere.

### The dev server was lying, twice

Two separate bugs made the *built* site unusable while `npm run dev` looked
perfect. Both were found only by opening the build in a browser, which nothing
had done — `vite build` exited 0 and the audience check greps the bundle, so
everything was green.

- **A blank page.** docs-viewer is linked with `file:../docs-viewer`, which npm
  symlinks, and it carries its own `react-router`. The production bundle ended
  up with two Router instances: the app's `<HashRouter>` published context on
  one and `DocsViewer`'s `useNavigate` looked on the other. `useNavigate() may
  be used only in the context of a <Router>`, and `#root` stayed empty. Fixed
  with `resolve.dedupe` in `vite.config.ts`.
- **An unstyled page.** `src/index.css` was empty, inherited that way from
  kinpay-docs, which loads `cdn.tailwindcss.com` from `index.html` and compiles
  classes in the reader's browser at runtime. Removing that script tag as a
  leftover took the built CSS to 1.9 kB and the site to serif text with no
  layout. Fixed by actually importing Tailwind, which is what the already
  installed `@tailwindcss/vite` was waiting for.

`scripts/check-renders.mjs` exists because of these: it builds both audiences,
serves them, opens them in a real browser, and asserts the app mounts, the
sidebar lists the right manuals, and the page is styled. Both fixes were
verified by reverting them and watching it fail.

The general lesson, which applies to the audience check as much as anything: a
check that reads the bundle proves what is in it, never that it runs.

## The AI assistant, and what it can see of a screenshot

docs-viewer ships a bring-your-own-key assistant, enabled here with `ai: true`.
The reader pastes their own OpenAI or Anthropic key, it is kept in their
browser's `localStorage`, and their browser calls the provider directly —
nothing is proxied through Otesha and no key is stored anywhere central. It is
off by default in kinpay-docs; it is on in this trial.

**It never receives the images.** The whole corpus is flattened to text and put
in the system prompt, so a screenshot reaches the model as exactly its alt text
and its caption, and nothing else. That has two consequences worth designing
around rather than discovering later.

**Alt text is not decoration here — it is the only representation of the image
that anything can read.** Search, screen readers and the assistant all get the
same string. So alt text has to describe what the screen *says and does*, not
what the picture is of. "The sign-in screen" is useless to all three.

**The callout notes were the real gap.** The numbered legend is drawn into the
PNG, which is what makes a screenshot self-explaining when it travels on its
own — and completely invisible to anything reading text. The most instructive
sentences on the figure, the ones explaining what each marker means, existed
only as pixels.

They now come out of the shot list twice: drawn into the image, and written to
`capture/alt/<image>.alt.txt` as words for the author to carry into the alt
text. One source behind both, so the drawn legend and the alt text cannot drift
into disagreeing. `scripts/check-alt-text.mjs` fails the build if a figure's
notes are missing from its markdown, and allows the author to write better
prose around them.

The block is also labelled in the context now. Previously alt text and caption
were concatenated bare, so the model received `…the Send code button marked The
sign-in screen is the first thing you see.` — a run-on with no signal that any
of it described a picture, which invites the model to quote a description of a
screenshot back to a reader as though the documentation had said it. It is now
emitted as `[Figure: …]` with the parts punctuated.

**What this does not solve.** The assistant cannot answer anything that is only
visible in the pixels — where a control sits, what colour a state badge is, what
the screen looks like. If that matters later, the options are a vision model
with the images attached per-question, or committing to alt text thorough enough
to stand in for the image. The second is cheaper, works offline, and helps
screen-reader users too; it is what the checks above push towards.

Also worth watching: the entire corpus goes in the prompt on **every** question.
At the trial's 20 pages that is ~5.9k characters. At the projected ~70 pages in
two languages it is roughly 40–60k characters per message, which is affordable
on a small model but is a per-question cost the reader pays with their own key.
If it becomes a problem the fix is to retrieve the handful of relevant pages
rather than sending all of them, which is a change to `buildDocsContext` in
docs-viewer, not to the manuals.

## Layout

```
docs/<manual>/NN-task.md   the pages; filename order is sidebar order
src/audience/              internal.ts and external.ts — the two globs
capture/                   measure.js, compose.mjs
capture/alt/               callout notes as words, for alt text
capture/provenance/        app, branch and commit per image
scripts/                   check-links.mjs, check-alt-text.mjs,
                           check-audience-builds.sh, check-renders.mjs
capture/mobile-measure.mjs the phone equivalent, via Maestro
capture/narration.mjs      renders the voice track (local Kokoro)
capture/audition.mjs       hear candidate voices before choosing one
capture/walkthrough.mjs    records the walkthrough
capture/assemble.mjs       voice + ducked music bed + mux
public/img/                generated; nothing here is edited by hand
```
