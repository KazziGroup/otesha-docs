/**
 * Module 3 — Zones, clusters and the rota.
 *
 * The module that finishes module 2. An approved caretaker still has nothing
 * until somebody gives them a section, and the console says so in amber at the
 * top of the rota — so the walkthrough follows that banner to where it is
 * cleared, and then to the phone where the result shows up.
 */

export const title = "Module 3 — Zones, clusters and the rota";

export const lines = [
  ["open", "Module three. Where the trees are, and who tends them."],
  ["zone", "A zone is a site — a school, a woodlot, a strip of open land — with its area, its trees, and the survival rate that follows from those."],
  ["provisional", "Some boundaries were drawn rather than walked. They are marked, and the warning says what that costs: their hectares overstate the real site."],
  ["esg", "That matters beyond this page. A provisional area that reaches an ESG figure overstates what Otesha actually manages."],
  ["rota", "The rota is per zone. One row per caretaker, and the section they tend."],
  ["nosection", "This is the row the amber banner is about. Approved, active, and holding no section."],
  ["cost", "Which costs more than it sounds. Their app lists no trees, the six o'clock compiler gives them no tasks, and the evening sweep then holds their pay for work nobody assigned."],
  ["clusters", "The same rota read the other way round. By block rather than by person, with the date each caretaker took it on — useful for finding a cluster nobody is on."],
  ["phone", "And on the phone, that assignment is simply the list. Every tree in your section, and a filter for the ones asking for something."],
  ["map", "One page is deliberately missing. Tracing a boundary needs a map, and there is no Mapbox token here — so rather than photograph an error, it stays a stub."],
  ["close", "Four pages. The banner from module two, followed to where it is cleared."],
];

export async function beats(ctx) {
  const { say, scrollBy, overlay, page, sleep, INTERNAL } = ctx;

  let visit = 0;
  const open = async (path) => {
    await page.goto(`${INTERNAL}/?v=${++visit}#${path}`, { waitUntil: "networkidle" });
    await overlay();
    await sleep(900);
  };

  await open("/admin/zones");
  await say("open");
  await scrollBy(420);
  await say("zone");
  await say("provisional");
  await scrollBy(600);
  await say("esg");

  await open("/admin/assign-cluster");
  await scrollBy(420);
  await say("rota");
  await say("nosection");
  await scrollBy(600);
  await say("cost");

  await open("/admin/clusters");
  await scrollBy(420);
  await say("clusters");

  await open("/caretaker/trees");
  await scrollBy(420);
  await say("phone");
  await say("map");
  await say("close");
}
