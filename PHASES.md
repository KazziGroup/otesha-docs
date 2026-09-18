# Modules, and the order we document them

An itemisation, not a plan for any one module. The point is to see the whole
board before starting, so a phase is chosen deliberately rather than whichever
screen we happened to be looking at.

**Filing does not change.** Pages stay grouped per app, exactly as the sidebar
has them now. A module is how the *work* is phased: one flow, followed across
every surface it touches, finished before the next one opens. The payout page
still lives in the admin manual and the earnings page in the caretaker manual —
they just get written in the same sitting, because they are two ends of one
event and written apart they drift.

Modules below are named after the backend's own domains (`backend/src/otesha/
modules/`), because that is where the real boundaries already are, and routes
were enumerated from all four apps.

## Cross-linking: what the library gives us

Relevant because module-wise writing produces far more links between manuals
than app-wise writing would.

- `[[link:category/page|Label]]` renders a button that navigates. Cross-manual
  links already work and `scripts/check-links.mjs` validates them per audience.
- **Hovering a link shows a preview of the target page** (`LinkPreviewPopover`).
  Good for a reader sent from the caretaker manual to an admin page — they can
  see what is there without losing their place.
- The palette supports an **`entities` quick-jump** — keywords mapped to a page,
  shown above search results. Unused so far. It is the natural home for module
  vocabulary: "payout", "gift code", "rota" jumping to the right page whichever
  manual it lives in.

Two things to know before we lean on this:

- **Links fail soft.** An unresolvable `category/page` previews as the
  category's *first* page rather than erroring, so a wrong link looks plausible.
  The checker is what catches it; keep it in CI.
- **`resolvePageLink` understands `category/page/subsection`, but the app's
  route does not.** `App.tsx` matches `/:categoryId/:sectionId` only, so a
  three-part deep link would not resolve. Module work will want to point at a
  specific step ("see step 3 of releasing a payout"), so adding the third
  segment is worth doing before the first phase rather than after.

## Phase 0 — done

Three things that make the rest repeatable, all landed before any page is
written, because each gets harder to retrofit once pages depend on it.

1. **Refs are pinned and checked.** `capture/apps.json` names the ref each
   manual documents. `capture/shoot.mjs` refuses to shoot an app that is not on
   it — `ALLOW_REF_DRIFT=1` overrides, and the drift is then written into every
   provenance file it produces, so a figure taken off-ref says so. All three web
   apps are currently on feature branches, so this refuses by default today.
2. **Shot lists are committed.** `capture/shots/**.json`, one per page. Every
   figure in the manuals was deleted and rebuilt from these alone.
   `scripts/check-shots.mjs` fails on a figure with no recipe, a recipe with no
   figure, and a recipe that has never been run.
3. **The third path segment routes.** `[[link:customer/sign-in/how-you-know-it-worked]]`
   now lands on the page and scrolls to the heading. A missing heading degrades
   to the top of the page rather than a blank one.

One thing fell out of the move to Playwright: **figures are now 2×.** The browse
CLI could not set `deviceScaleFactor`, so every figure taken during the trial
was 1× and soft on the screens people read these on. Every figure is exactly
twice the size it was, from the same recipe.

## Regenerating a doc

The goal is that any figure can be rebuilt on demand, from a named commit,
without anybody remembering how it was taken. Where that stands:

| Piece | State |
|---|---|
| Anchoring markers to real elements | scripted — `measure.js`, `mobile-measure.mjs` |
| Drawing and cropping the figure | scripted — `compose.mjs` |
| Alt text and provenance sidecars | scripted, and checked |
| **Getting the app into the state being shot** | **not captured — ad hoc** |

That last row is the gap, and it is the one that matters. Signing in, filling a
phone number, clicking through to the review queue, dismissing a simulator
dialog — all of that was typed by hand per figure and then thrown away. Today,
rebuilding `admin-approve-caretaker-01-en.png` means reconstructing those steps
from memory, which is exactly the "expensive half of the work" the brief warns
about.

**What to build, in phase 0:** a committed shot list per page — the app and ref,
the steps to reach the state, the callouts, the crop mode, the output name — so
that `npm run shoot customer/sign-in` rebuilds that page's figures and
`npm run shoot` rebuilds all of them. Plus a check that every figure referenced
in markdown has a shot list behind it, so a picture cannot exist without a
recipe to rebuild it. That is the same pattern as `check-alt-text.mjs`, and it
is what keeps the guarantee true a year from now.

**Prose is not generated, and should not be.** What a reader needs to be told —
which control matters, what the error means, what to do when it goes wrong — is
judgement, and generating it from the interface produces descriptions of
screenshots rather than instructions. Regenerating a doc means rebuilding its
figures and re-running its checks against a known commit; the words are written
once and edited by people.

## The modules

Ordered by dependency: each one can be captured given the state the ones above
it leave behind. Page counts are rough sizing, not a contract.

| # | Module | Backend domain | Manuals touched | ~Pages |
|---|---|---|---|---|
| 1 | Getting in | `identity` | all four | 6 |
| 2 | Caretaker onboarding & standing | `identity`, `fieldops` | admin, caretaker | 4 |
| 3 | Zones, clusters and the rota | `geography`, `fieldops` | admin, caretaker | 4 |
| 4 | Species, pricing and the nursery | `catalogue`, `nursery` | admin, customer | 5 |
| 5 | Sponsoring a tree | `orders`, `payments` | customer, admin | 5 |
| 6 | ~~Gifting a tree~~ — deferred in the product | `orders` | — | 0 |
| 7 | The daily round | `fieldops` | caretaker, admin | 5 |
| 8 | Caretaker pay | `payouts`, `ledger` | caretaker, admin | 5 |
| 9 | Watching your tree | `registry`, `impact` | customer, corporate, caretaker | 6 |
| 10 | Money and invoices | `payments`, `ledger` | corporate, admin | 3 |
| 11 | Corporate partnership | `corporate`, `reporting` | corporate, admin | 7 |
| 12 | The developer platform | `partner`, `webhooks` | corporate | 8 |
| 13 | Motivation and recognition | — (client-side) | caretaker | 5 |
| 14 | Running the programme | `identity`, `audit`, `catalogue` | admin | 6 |

Roughly 69 pages, against the ~70 the brief estimated — close enough that the
estimate looks sound.

### What each one covers

**1. Getting in.** Four front doors, and they genuinely differ: the customer and
caretaker sign in by SMS code, the corporate portal by SMS code against an
account with no password at all, and the admin console by email and password.
Worth doing first — it is the prerequisite for capturing anything behind a
login, and it is small enough to prove the module workflow before betting a
large flow on it.
*Routes:* `login`/`logout` in all three web apps, `(auth)/sign-in` and the
static `gate` on the phone, `orgs` where a person belongs to more than one, and
customer `welcome`.

**`welcome` is the gap this module has to close.** After a first sign-in the
customer app asks for a name and an *optional* email — "Where receipts and
updates about your trees go. You can add it later" — with a Skip. It is shipped
on `origin/main` and the trial's sign-in page does not mention it at all, so a
new sponsor currently meets an undocumented screen immediately after the one
step we did document.

**Not to be confused with signing in by email.** A second front door — "How
would you like your code? Phone / Email", hinted "For sponsors outside
Tanzania" — exists on the branch `a-second-front-door` and is **not merged into
`main` or `staging`** as of 17 Sep 2026. Two different features that both say
"email": one is an address on your account, the other is a way in. When the
second one lands, it changes this module's first page and nothing else.

**2. Caretaker onboarding & standing.** Registering somebody, the review queue,
finding them afterwards, and what the caretaker sees of their own standing. Ends
with an active caretaker who can be given work.
*Routes:* admin `caretakers` (directory, review queue, the New caretaker
dialog); caretaker `(tabs)/profile`.

**Certifications is not documented, and should not be.** The screen exists at
`(app)/certifications`, but the entry point on the profile is wrapped in
`<StaticOnly>` and the code beside it says why: *"Certification — invented.
`profile.cert` and `profile.badges` are `mocks/use-role-data`: a progress bar to
a level nobody can reach and four badges nobody can earn. Gated rather than
deleted so the ladder survives to be made real."* It renders in the demo build
and nowhere else. Writing it up would document a feature that does not exist —
the same failure as the phantom sign-in screen, except here the code warns you.
That takes this module to four pages.

**Two routes I had wrong in the first itemisation**, found by opening them:
`kit` is the admin console's own UI component gallery, not caretaker equipment,
and `invite` is staff password setup — that belongs to module 14. Neither is
part of this module. The page list is the five below.

The subject that makes this module worth writing as one piece: registering
somebody offers **two paths with different accountability** — *"Yes, enrol them
now. Active immediately, with you recorded as the approver"* against *"Not yet —
file for review. Nobody is recorded as approving."* One of those creates a
record of who decided; the other defers it.

**3. Zones, clusters and the rota.** Where trees live and who tends them.
Directly downstream of 2 — an approved caretaker with no section is the warning
banner the admin console already shows, and this module is what clears it.
*Routes:* admin `zones`, `assignments` (by caretaker and by cluster); caretaker
`(tabs)/trees`.

**Tracing a boundary is deferred, not skipped.** `MAPBOX_TOKEN` is empty in
every `.env` here, so the console says the map is unavailable and no honest
screenshot of it can be taken. The zone *list* does not need the map and is
documented; `admin/zone-boundary` stays a stub until somebody supplies a token.
Four pages rather than five.

**4. Species, pricing and the nursery.** What can be sponsored, what it costs,
and the seedlings behind it. Must precede sponsorship: you cannot buy what is
not published.
*Routes:* admin `species`, `nursery`; customer `species`, `species.detail`.

Three things the screens say that a route list does not. A species' three names
are **fixed** once trees point at them — *"a correction is a new species and a
decision about those trees"*. Withdrawing from sale is **a catalogue decision,
not a botanical one**: trees already in the ground are unaffected. And every
price carries the date it came into force, because a new price does not reprice
what has already been sold.

**5. Sponsoring a tree.** The money path: cart, confirmation, payment, and what
the order looks like from the fulfilment side.
*Routes:* customer `cart`, `checkout`, `checkout.pay`, `checkout.status`,
`orders`; admin `fulfilment`, `transactions`. Five pages rather than seven —
confirm, pay and wait are three screens of one task, not three tasks.

**The unpaid order is documented on purpose.** `PAYMENT_PROVIDER=mock` settles
only through a signed webhook, so a capture stops at "Check your phone" — and
that is the state a reader who got stuck is actually looking at. The customer
pages say what it means: nothing charged, order held, no tree planted. Seeded
data already carries paid orders, so the admin side shows the other half.

**6. ~~Gifting a tree~~ — dropped.** Gifts and subscriptions are **deferred in
the product**. On `staging` both are hidden from the nav *and* unregistered in
the router, so their URLs no longer answer: *"a bookmark, an old email or a
search result would still open a screen for something we are not offering, with
nothing on it to say so."* Invoices got a deliberately different treatment —
hidden from the nav but still routed, because *"the screen is finished and is
simply not somewhere a customer should be sent yet."*

It is a deferral rather than a deletion; the route files are kept and bringing
either back is three lines. If that happens, this module comes back with it.

**7. The daily round.** The caretaker's actual job, and the thread that runs
through it: a log is only worth anything if the handset knew where it was.
*Routes:* caretaker `(tabs)/today`, `tree/[id]`, `log/watering`; admin `review`.

The two ends of one fact. The watering form promises *"GPS + time recorded
automatically · works offline, syncs later"*, and the console's flagged-work
queue lists what happens when that fails: *"the handset never got a fix"*,
*"the position could not be checked"* — under a heading that says **none of it
can be paid until somebody decides**. The caretaker sees *"1 log was not
accepted. Show a supervisor."* That is one story told from both sides, which is
the argument for module-wise phasing in a single screenshot.

**Two constraints the capture found.** Logging needs the simulator's location
set inside Tanzania or the API rejects the coordinates outright —
`xcrun simctl location <udid> set -6.1871451,35.7677985`. And the offline page
reuses the watering figure rather than showing a queued log: a dedicated one
needs the API stopped mid-capture, which the shared backend on :8000 is serving
every other app's figures from. Worth doing when the capture harness moves into
`otesha/e2e`, where `offline-sync.sh` already does exactly that.

**8. Caretaker pay.** Earnings on the phone, and the three-step release on the
console. Requires 7, since there must be logged work to pay for.
*Routes:* caretaker `earnings`; admin `payouts`, `payouts/$runId`, `rates`,
`holds`.

**Three rules the console states and enforces.** Compiling *"reads the rates in
force, sums the work in the period and subtracts anything held — nothing is paid
yet"*. A run *"has to be approved by somebody other than whoever compiled it"*.
And a hold *"withholds everything for this subject from every run, until
somebody releases it"* — **only a person can lift one**. Rates are *"published
as a version, never edited in place"*, so work keeps the rate in force when it
was done.

**The earnings page documents its empty state, deliberately.** The seeded run is
compiled but not approved, so nobody has been paid — and approving it would
mutate seed state the e2e suite compiles against. That turned out to be the more
useful page anyway: logged work is not paid work, and a caretaker looking at an
empty screen with forty-five logs this month needs to be told why rather than
shown somebody else's money.

**9. Watching your tree.** The sponsor's view of a living tree, the same tree in
the caretaker's list, and the corporate map. One subject, three audiences.
*Routes:* customer `trees`, `trees.detail`, `home`; corporate `$org.trees`,
`$org.map`; caretaker `(tabs)/trees`, `tree/[id]`, `tree-filters`, `my-qr`,
`drone/[id]`.

**10. Money and invoices.** Invoices, subscriptions and how transactions read
from each side.
*Routes:* customer `invoices`, `subscriptions`; corporate `$org.invoices`,
`$org.orders`; admin `transactions`.

**11. Corporate partnership.** Bulk orders, the dashboard, ESG and SDG
reporting, certificates, team and settings — plus the admin side of partner
accounts. **The whole of this module is client-facing**, so it is the one that
lands in the external build.
*Routes:* corporate `$org.dashboard`, `$org.orders`, `$org.reports`,
`$org.team`, `$org.settings`; admin `partners`.

**12. The developer platform.** API credentials, reference, sandbox, webhooks,
usage, settlements, Postman. The largest single block of routes and the most
self-contained; also client-facing. A reasonable candidate to defer if we want
value earlier.
*Routes:* corporate `$org.developers.*`.

**13. Motivation and recognition.** Streaks, challenges, milestones, Species IQ,
wishlist, the shareable poster. Caretaker-only and mostly independent of the
rest, so it can slot in wherever there is room.
*Routes:* caretaker `streaks`, `challenges`, `milestone`, `species-iq`,
`wishlist`, `poster`.

**14. Running the programme.** Programme settings, roles and the permissions
matrix, staff users, the audit trail. Last because it is the least urgent to a
reader and the most likely to churn.
*Routes:* admin `settings`, `settings.programme`, `settings.roles`,
`settings.account`, `users`.

## English only

Fred's brief asks for EN and SW parity. **We are not doing Kiswahili** — the
audience for these manuals is English-speaking for now (decided 17 Sep 2026).

Worth recording why that is a relief rather than a deferral: docs-viewer has no
language support of any kind, so parity would have meant building one — separate
builds per language, a switcher, or a filename convention with sidebar
filtering. None of that is hard, but all of it is much harder to retrofit across
eighty pages than to design in at six, which is why it needed deciding before
module 1 rather than after.

If Kiswahili is ever wanted, the shape to reach for is a second audience
alongside `internal` and `external` in `src/audience/` — the machinery for
building two sites from one tree already exists and is tested.

## Not modules

Two things cut across every module and should not become phases of their own —
a module is only done when it has handled them:

- **Notifications.** SMS and email land inside other flows — a code, a payout, an
  order. Document them where they occur.
- **Working offline.** Real for the caretaker app throughout. It gets one page of
  its own in module 7 and a sentence wherever else it changes what a reader sees.

## Definition of done, per module

Proposed, so a phase closes on a checklist rather than a judgement:

1. Every page's seven parts filled — no stubs left in the module.
2. Every figure captured from a **pinned ref per app**, recorded in
   `capture/provenance/`, with its callout notes carried into the alt text, and
   a committed shot list behind it.
3. Cross-links added in both directions, resolving in both builds.
4. `npm run check` green — all eight.
5. Walkthrough recorded and reviewed.

---

# Progress

**Keep this section current.** It is the part of this file that goes stale
fastest and the only part anybody reads to find out where things are. Update it
when a module opens, when it closes, and when a decision is made — not in a
batch at the end.

## Where things stand

*Updated 17 Sep 2026.*

Phase 0 done. **Module 1 done.** All four apps captured from `origin/main`.

Twenty-four pages, eleven figures, every one rebuildable from a committed shot
list. All eight checks green. Three pages left over from the trial belong to
modules 2, 7 and 11 and are not counted as those modules' progress — they are
where the trial left us, not a head start.

## Modules

`—` not started · `▶` open · `✓` done · `✕` dropped

| # | Module | Status | Pages | Closed |
|---|---|---|---|---|
| 0 | Phase 0 — refs, shot lists, deep links | ✓ | — | 17 Sep 2026 |
| 1 | Getting in | ✓ | 6 / 6 | 17 Sep 2026 |
| 2 | Caretaker onboarding & standing | ✓ | 4 / 4 | 18 Sep 2026 |
| 3 | Zones, clusters and the rota | ✓ | 4 / 4 | 18 Sep 2026 |
| 4 | Species, pricing and the nursery | ✓ | 5 / 5 | 18 Sep 2026 |
| 5 | Sponsoring a tree | ✓ | 5 / 5 | 18 Sep 2026 |
| 6 | Gifting a tree | ✕ | — | dropped 18 Sep 2026 |
| 7 | The daily round | ✓ | 5 / 5 | 18 Sep 2026 |
| 8 | Caretaker pay | ✓ | 5 / 5 | 18 Sep 2026 |
| 9 | Watching your tree | ✓ | 3 / 6 | 18 Sep 2026 |
| 10 | Money and invoices | — | 0 / 3 | |
| 11 | Corporate partnership | — | 1 / 7 | |
| 12 | The developer platform | — | 0 / 8 | |
| 13 | Motivation and recognition | — | 0 / 5 | |
| 14 | Running the programme | — | 0 / 6 | |

A page counts once it meets the definition of done above — seven parts filled,
figures captured from a pinned ref with a shot list behind them, links
resolving, checks green. A page with prose and no figure is not done.

## Decisions

Recorded with the reason, because in six months the reason is the part nobody
can reconstruct.

| Date | Decision | Why |
|---|---|---|
| 17 Sep 2026 | **One repository, four manuals** | They share the capture pipeline, the viewer, cross-links and one search index. Four repos means four of everything and four chances to drift. |
| 17 Sep 2026 | **Two builds, not two repositories** | The corporate manual goes to clients; the admin manual describes payout release. That is a build question. `DOCS_AUDIENCE=external` ships a bundle the internal manuals are absent from — filtering in code leaves the text in `index-*.js`. |
| 17 Sep 2026 | **Filed per app, phased per module** | A reader arrives holding a phone or sitting at a console, so navigation stays app-shaped. But the payout page and the earnings page are two ends of one event, and written months apart they drift — so they get written together. |
| 17 Sep 2026 | **Prose is written, not generated** | Figures regenerate from recipes. What a reader needs told — which control matters, what an error means — is judgement, and generating it produces descriptions of screenshots rather than instructions. |
| 17 Sep 2026 | ~~`origin/main` is the documented ref~~ | **Reversed 18 Sep.** I decided this per module and checked only the apps module 1 touched, concluding the difference was "module 12's problem". It was module 1's: `staging` already had a second sign-in door. |
| 18 Sep 2026 | **`origin/staging` is the documented ref** | `main` is built by merging `staging` — every recent merge into it is a PR *from* staging — so staging holds the decisions on their way to users and main is a trailing snapshot. Documenting main produced manuals for gifts and subscriptions the team had already deferred, while omitting the email sign-in it had already added. The caretaker app is the exception: it has no staging branch, so `main` is the only ref it has. |
| 17 Sep 2026 | **English only** | The audience is English-speaking for now. docs-viewer has no language support at all, so parity would have meant building one first — see "English only" above. |

## Module 9 shipped at half size

Six pages were planned; three shipped. The three that did not are not deferred
for tidiness, they are blocked, and the reasons are worth keeping:

**The customer side has no subject.** `customer/tree-detail` — a sponsor looking
at their own tree — cannot be captured because in the seeded database *no
customer owns a tree*. All 306 trees belong to Kilima Bank, a corporate account.
Creating one by hand would mean completing a sponsorship, and the mock payment
provider only settles through a signed webhook, so a capture cannot get past
checkout. Unblocking this needs a seed that gives some customer a tree, not a
change to the capture tooling.

**The corporate map is still the Mapbox hole.** Same missing `MAPBOX_TOKEN` that
stubbed a page in module 3. Photographing an error box is worse than shipping
nothing.

What the three pages that did ship gave us was the module's best find anyway:
the corporate tree dialog says *"No photographs of this tree yet. Caretakers add
them from the field as they tend it."* That is module 7's optional photo step
seen from the other end of the programme — the sponsor is told, in the product's
own words, that the absence of a photo is not evidence of neglect.

## The checker caught a cross-audience link, at last

Module 9 was the first time a corporate page wanted to link into the admin
manual — "see how sections are assigned". The external build does not ship the
admin manual, so that link would have been a dead end for the only reader the
corporate manual is written for. `check-links` failed the build, as designed in
phase 0, and the sentence was rewritten to state the fact rather than link to it.

Two id collisions went with it: corporate wanted `trees` and `tree`, both
already owned by the caretaker manual. They became `tree-register` and
`tree-history`. Third time that check has paid for itself.

## Where the manuals are hosted

<https://kazzigroup.github.io/otesha-docs/> — all five manuals, deployed from
`main` by `.github/workflows/pages.yml` on every push.

Three decisions worth remembering, because each one had an alternative:

**The repo is public.** KazziGroup is on GitHub's free plan, and free-plan Pages
only serves from a public repo. The alternatives were a second repo holding just
the built site, Cloudflare Pages building from a private repo, or a paid plan.
Public was chosen deliberately: the docs source, the capture recipes and these
notes are all readable on github.com.

**The site serves the internal build, not the client build.** While the manuals
are still being written the team needs one link that reaches everything. The
audience split is still wired up and still checked — `DOCS_AUDIENCE=external`
produces the nine-page client manual and `npm run check` proves each build
carries what it should — so pointing the workflow at the client build later is a
one-word change.

**The site is unlisted, not gated.** Anyone with the address can read the admin
and caretaker manuals. If that needs to change, it needs a different host:
Cloudflare Access in front of the site, or GitHub Enterprise.

Two things a subpath deploy needed, both of which would have shipped broken and
looked fine locally. Vite's `base` comes from `DOCS_BASE`, because a project-repo
Pages site is served at `/otesha-docs/` rather than the root. And figure paths
are rebased at load time in `buildDocsConfig`: the pages write `/img/name.png`,
which is correct in the source, correct in the bundle, and a 404 the moment the
site is not at the root — Vite never sees those paths because they live inside
markdown loaded `?raw`.

Which is what `npm run check:live` exists for. The other eight checks run
against the source and against `dist`; this one opens the deployed URL, loads
all 43 pages, waits for every figure, and clicks all 124 cross-links. It clicks
rather than reading hrefs, because docs-viewer renders cross-links as
`button.page-link` with an onClick — an href check finds nothing and reports
success.


## What switching to staging cost

Recorded because the cost is the argument for checking sooner rather than for
avoiding the switch.

Every admin, corporate and caretaker figure rebuilt unchanged. **All ten
customer figures failed**, and the cause was one rename: the sign-in field is
`destination` now that the screen offers a phone *or* an email. Two further
changes surfaced only by walking it — the welcome screen's email hint now offers
to become a second sign-in method, and "Skip for now" is a submit button in a
form whose name field is required, so it cannot actually skip.

Two pages needed rewriting (sign-in, welcome), two stub pages were deleted with
the module that would have filled them, and module 10 lost subscriptions and
invoices. Modules 2, 3 and 4 came through untouched.

## What module 1 taught the pipeline

Each of these was a capture that failed, and each fix is in the runner rather
than in a note somebody has to remember:

- **`{{uniquePhone}}`.** The customer welcome screen exists only on a first
  sign-in — `/welcome` redirects for an account that already exists. A recipe
  with a fixed number would work once and then silently document a different
  screen. The screen never shows the number, so a fresh one each run gives an
  identical figure.
- **Maestro launches the phone app, not `simctl`.** `simctl launch` returns as
  soon as the process exists; sleeping afterwards is a guess, and it was wrong
  often enough to capture the simulator's home screen.
- **`scroll` and `pick: "largest"`.** Signing out is three screens down a
  settings page, and the sign-in field shares its accessibility label with the
  caption above it — where "smallest match wins" frames the caption and looks
  entirely deliberate.
- **The static-demo build cannot document signing in.** It opens already signed
  in, by design. The live dev client is registered separately as
  `caretaker-mobile-app-live`, and the recipe signs out first so it works from
  either state.

## A stray click, and what it cost

On 18 Sep a payout run was approved by accident. Commands meant for the customer
app ran while the browse session had drifted to the admin console, and
`button[type=submit]` on that page is **Approve**. The run moved from *Awaiting
approval* to *Approved*; nothing was disbursed, and all 31 rows stayed
`PENDING`.

Two things went wrong and both are worth keeping:

- **A generic selector was clicked without asserting the page.** `submit` means
  something different on every screen. Exploration should name what it expects
  to be looking at before it touches anything — the capture recipes do this
  (`wait` before `click`), and the ad-hoc exploration around them did not.
- **A recipe depended on shared state.** `admin/release-payout` needed the
  seeded run to still be unapproved, so one click elsewhere invalidated a
  figure. It now reads what the page says whatever state its runs are in, the
  same way the customer recipes moved to fresh accounts rather than the seeded
  one.

The underlying lesson is the one from phase 0 in a new coat: assume nothing
about where the browser is, and depend on nothing a second party can advance.

## Open questions

Things deliberately not decided, so they are not quietly forgotten:

- **docs-viewer's `figure-blocks` is uncommitted.** Image support, figure
  rendering, alt-text indexing and the deep-link scroll exist only in a working
  tree, reached by `file:../docs-viewer`. Not blocking — the site builds and the
  checks pass — but it is unversioned and nobody else can build the site.
- **Seeded data is not pinned.** Shot lists hardcode fixtures
  (`admin@otesha.co.tz`, `+255717763373`, `0700 000 012`). A reseed with
  different data breaks recipes in a way that reads as a UI change.
- **Whether module 12 defers.** The developer platform is the largest block and
  the most self-contained; nothing depends on it. An obvious candidate to move
  late if value is wanted sooner.

