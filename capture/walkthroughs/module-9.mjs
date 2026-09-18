/**
 * Module 9 — Watching your tree.
 *
 * The sponsor's end of everything the earlier modules built. Deliberately the
 * shortest walkthrough so far, because the module shipped at half size and the
 * narration says why rather than hiding it: three of the six planned pages have
 * no subject to photograph.
 */

export const title = "Module 9 — Watching your tree";

export const lines = [
  ["open", "Module nine. What a sponsor sees of the trees they paid for."],
  ["headline", "Two figures, and they answer different questions. Trees is how many you have and how many are living. Survival is the share of trees ever in the ground that are still alive."],
  ["risk", "Which is why survival can read a hundred percent while twenty-six trees are at risk. At risk is alive — it is a caretaker saying this one needs attention, not a death."],
  ["register", "The same data listed rather than summarised. One row per tree, with the site it stands on and when it went in the ground."],
  ["statuses", "Seven states, and the last three are the ones nobody puts on a brochure. Deceased, replaced, refunded — what happens when a tree does not make it."],
  ["tree", "And one tree on its own. Its species, its site, the care level that was bought, and the caretaker who was there most recently."],
  ["photos", "This line is the whole module. No photographs of this tree yet — caretakers add them from the field as they tend it. A photograph is optional when work is logged, so their absence says nothing about the tree."],
  ["history", "Underneath, every state change with its date. Planted in September, flagged at risk in October. That is the audit trail behind the number on the dashboard."],
  ["cut", "Three pages, not the six that were planned. The customer's own tree page has no subject — every seeded tree belongs to a corporate account, and a capture cannot buy one, because the mock payment provider only settles through a signed webhook."],
  ["map", "And the map is the same Mapbox hole that stubbed a page in module three. Photographing an error box would be worse than shipping nothing."],
  ["close", "Three pages. Half a module, and honest about which half."],
];

export async function beats(ctx) {
  const { say, scrollBy, overlay, page, sleep, INTERNAL } = ctx;

  let visit = 0;
  const open = async (path) => {
    await page.goto(`${INTERNAL}/?v=${++visit}#${path}`, { waitUntil: "networkidle" });
    await overlay();
    await sleep(900);
  };

  await open("/corporate/dashboard");
  await say("open");
  await scrollBy(420);
  await say("headline");
  await say("risk");

  await open("/corporate/tree-register");
  await scrollBy(420);
  await say("register");
  await scrollBy(500);
  await say("statuses");

  await open("/corporate/tree-history");
  await scrollBy(420);
  await say("tree");
  await say("photos");
  await scrollBy(600);
  await say("history");
  await say("cut");
  await say("map");
  await say("close");
}
