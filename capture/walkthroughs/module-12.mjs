/**
 * Module 12 — The developer platform.
 *
 * Otesha Connect, from the grant that makes it exist to the statement at the
 * end of the month. Ends on what the module found rather than what it built:
 * six pages that had been saying "Placeholder" on a live site.
 */

export const title = "Module 12 — The developer platform";

export const lines = [
  ["open", "Module twelve. Otesha Connect — the API a partner builds against."],
  ["grant", "None of it existed until somebody granted it. A partner is not a second organisation: it is a corporate account with API access, so granting creates the partner identity, issues sandbox credentials and links them in one call."],
  ["withdraw", "And withdrawing keeps the settlement history. It suspends the partner and unlinks it — a statement about who may call the API, not a reason to lose what they were owed."],
  ["console", "On the client's side, a console with six steps in the order they have to happen. Create a sandbox key, get a token, link a test customer, place an order, listen for webhooks, go live."],
  ["secret", "The key's secret is shown once, when the key is created. Lose it and you make another — that is the intended path, not a failure of it."],
  ["sandbox", "The sandbox is a world you can break. Reset wipes it and re-seeds two hundred trees across all ten lifecycle states, five caretakers, five customers, and a year of back-dated visits."],
  ["clock", "And you can move a tree's clock — ninety days, a year — to exercise milestones in an afternoon. The tree's clock, not the server's: a shared clock would mean your test changed somebody else's data."],
  ["webhooks", "Webhooks are HTTPS only, because over plain HTTP the payload and its signature are both readable by anything on the path, which makes the signature pointless."],
  ["producer", "Three of the events are marked no producer yet. They are declared so an integration can be written against them, and marked so nobody waits on a call that never comes."],
  ["usage", "Usage separates two questions people conflate. New accounts are the ones your integration opened; customers linked includes people who already had Otesha before they met your app."],
  ["settlement", "And a settlement statement is compiled from the same basis as that usage report, so the two agree. Once issued it is never edited — a correction is issued beside it, because somebody has already filed the original."],
  ["stubs", "Writing this module found something worse than a missing page. Six pages were still saying Placeholder — this page is a stub for the structural trial — on the live site."],
  ["passed", "All eight checks had passed the whole time. They ask whether links resolve and whether figures rebuild. A stub has neither, so it sails through every one of them."],
  ["fixed", "Two are now written, one was deleted for restating another page, one became this module's credentials page, and two are genuinely blocked — so they say so, in the words of the thing blocking them."],
  ["close", "Eight pages, and a ninth check that would have caught the other six."],
];

export async function beats(ctx) {
  const { say, scrollBy, overlay, page, sleep, INTERNAL } = ctx;
  let visit = 0;
  const open = async (path) => {
    await page.goto(`${INTERNAL}/?v=${++visit}#${path}`, { waitUntil: "networkidle" });
    await overlay();
    await sleep(900);
  };

  await open("/admin/api-access");
  await say("open");
  await scrollBy(420);
  await say("grant");
  await scrollBy(600);
  await say("withdraw");

  await open("/corporate/developers");
  await scrollBy(420);
  await say("console");

  await open("/corporate/credentials");
  await scrollBy(420);
  await say("secret");

  await open("/corporate/sandbox");
  await scrollBy(420);
  await say("sandbox");
  await say("clock");

  await open("/corporate/webhooks");
  await scrollBy(420);
  await say("webhooks");
  await scrollBy(500);
  await say("producer");

  await open("/corporate/usage");
  await scrollBy(420);
  await say("usage");

  await open("/corporate/settlements");
  await scrollBy(420);
  await say("settlement");

  await open("/customer/tree-detail");
  await scrollBy(420);
  await say("stubs");
  await say("passed");
  await say("fixed");
  await say("close");
}
