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
| 2 | Caretaker onboarding & standing | `identity`, `fieldops` | admin, caretaker | 5 |
| 3 | Zones, clusters and the rota | `geography`, `fieldops` | admin, caretaker | 5 |
| 4 | Species, pricing and the nursery | `catalogue`, `nursery` | admin, customer | 5 |
| 5 | Sponsoring a tree | `orders`, `payments` | customer, admin | 7 |
| 6 | Gifting a tree | `orders` | customer | 3 |
| 7 | The daily round | `fieldops` | caretaker, admin | 7 |
| 8 | Caretaker pay | `payouts`, `ledger` | caretaker, admin | 5 |
| 9 | Watching your tree | `registry`, `impact` | customer, corporate, caretaker | 6 |
| 10 | Money and invoices | `payments`, `ledger` | customer, corporate, admin | 5 |
| 11 | Corporate partnership | `corporate`, `reporting` | corporate, admin | 7 |
| 12 | The developer platform | `partner`, `webhooks` | corporate | 8 |
| 13 | Motivation and recognition | — (client-side) | caretaker | 5 |
| 14 | Running the programme | `identity`, `audit`, `catalogue` | admin | 6 |

Roughly 80 pages, against the ~70 the brief estimated — close enough that the
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

**2. Caretaker onboarding & standing.** The review queue, approving somebody,
issuing kit, and what the caretaker sees of their own profile and
certifications. Ends with an active caretaker who can be given work.
*Routes:* admin `caretakers`, `kit`, `invite`; caretaker `profile`,
`edit-profile`, `certifications`.

**3. Zones, clusters and the rota.** Where trees live and who tends them.
Directly downstream of 2 — an approved caretaker with no section is the warning
banner the admin console already shows.
*Routes:* admin `zones`, `map`, `assignments`.

**4. Species, pricing and the nursery.** What can be sponsored, what it costs,
and the seedlings behind it. Must precede sponsorship: you cannot buy what is
not published.
*Routes:* admin `species`, `nursery`; customer `species`, `species.detail`.

**5. Sponsoring a tree.** The money path: browse, cart, checkout, pay, and what
the order looks like from the fulfilment side.
*Routes:* customer `cart`, `checkout`, `checkout.pay`, `checkout.status`,
`orders`; admin `fulfilment`, `transactions`.

**6. Gifting a tree.** Sending one and redeeming a code. Small and separable.
*Routes:* customer `gifts`, `gifts.redeem`.

**7. The daily round.** The caretaker's actual job: Today, logging a watering or
a health check, working with no signal, and how flagged work reaches an admin.
The offline round trip is the one flow Maestro cannot drive alone — the existing
`offline-sync.sh` stops and starts the API around it.
*Routes:* caretaker `(tabs)/today`, `(tabs)/activities`, `log/watering`,
`log/health-check`, `scan`; admin `review`.

**8. Caretaker pay.** Earnings on the phone, and releasing a payout run from the
console — two ends of one event, and the clearest argument for doing this
module-wise. Requires 7, since there must be logged work to pay for.
*Routes:* caretaker `earnings`, `earn-more`; admin `transactions`.

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
