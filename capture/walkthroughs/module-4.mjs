/**
 * Module 4 — Species, pricing and the nursery.
 *
 * What can be sponsored, and everything behind that being true: the record, the
 * price, the seedlings. Ends on the customer's view, because the point of the
 * whole module is that nothing appears there by accident.
 */

export const title = "Module 4 — Species, pricing and the nursery";

export const lines = [
  ["open", "Module four. What can be sponsored, what it costs, and the seedlings behind it."],
  ["catalogue", "Every species carries three names — English, Kiswahili and scientific — a category, and what has actually happened to trees of its kind."],
  ["names", "Two of those names can be edited. The scientific one cannot: every tree planted as this species points at it, so a correction is a new species and a decision about those trees."],
  ["withdraw", "Withdrawing a species stops it being offered, and nothing else. Trees already in the ground are unaffected — a catalogue decision, not a botanical one."],
  ["plans", "A care plan is what Otesha actually does for the tree. Thirty-six months, watering every three days, full care — with a monthly price."],
  ["date", "Every price carries the date it came into force, because a new price does not reprice what has already been sold."],
  ["nursery", "Behind all of it, the nursery. A batch of seedlings reserves a range of tree identifiers when it is sown, before anything is in the ground."],
  ["tags", "Which is what lets a tag be printed and carried to site. A batch cannot be planted against its identifiers until they have been."],
  ["customer", "And this is where it surfaces. Eight species, filtered by what the tree is for."],
  ["detail", "With the care plan spelled out, and the carbon figure marked as the estimate it is."],
  ["close", "Five pages. Nothing reaches this screen by accident."],
];

export async function beats(ctx) {
  const { say, scrollBy, overlay, page, sleep, INTERNAL } = ctx;

  let visit = 0;
  const open = async (path) => {
    await page.goto(`${INTERNAL}/?v=${++visit}#${path}`, { waitUntil: "networkidle" });
    await overlay();
    await sleep(900);
  };

  await open("/admin/species");
  await say("open");
  await scrollBy(420);
  await say("catalogue");

  await open("/admin/species-record");
  await scrollBy(420);
  await say("names");
  await scrollBy(500);
  await say("withdraw");

  await open("/admin/publish-price");
  await scrollBy(420);
  await say("plans");
  await say("date");

  await open("/admin/nursery");
  await scrollBy(420);
  await say("nursery");
  await say("tags");

  await open("/customer/browse-species");
  await scrollBy(420);
  await say("customer");
  await scrollBy(700);
  await say("detail");
  await say("close");
}
