/**
 * Module 7 — The daily round.
 *
 * One fact told from both ends: a log is only worth anything if the handset
 * knew where it was. The phone promises it works offline; the console lists
 * what happens when the position could not be checked, under a heading that
 * says none of it can be paid.
 */

export const title = "Module 7 — The daily round";

export const lines = [
  ["open", "Module seven. The caretaker's actual job — and the one thread running through all of it."],
  ["today", "The day opens on Today. Work counted in trees rather than visits, so a tree needing both a watering and a check counts once."],
  ["overdue", "Anything past its date is marked overdue. That is a statement about the date, not about the person."],
  ["tree", "Tapping a task opens the tree. Its species, its age, and where it stands — to the metre."],
  ["log", "And then the form. The amount, how the water was carried, and a photo if there is something to show."],
  ["gps", "But the line that matters is at the top. GPS locked, five metres. That figure is the difference between a log that counts and one that does not."],
  ["offline", "Because position comes from the handset, not the network. Work with no signal and the log waits on the phone, carrying the same evidence, and goes up when you are back in range."],
  ["flagged", "When that fails, this is where it lands. Work that was recorded but could not be placed."],
  ["unpaid", "And the heading says the stake plainly: none of it can be paid until somebody decides."],
  ["reasons", "The reasons are about the handset, not the person. The position could not be checked. The handset never got a fix. Somebody under tree cover can do the work perfectly and still end up here."],
  ["close", "Five pages, two surfaces, one fact seen from both ends."],
];

export async function beats(ctx) {
  const { say, scrollBy, overlay, page, sleep, INTERNAL } = ctx;
  let visit = 0;
  const open = async (path) => {
    await page.goto(`${INTERNAL}/?v=${++visit}#${path}`, { waitUntil: "networkidle" });
    await overlay();
    await sleep(900);
  };

  await open("/caretaker/today");
  await say("open");
  await scrollBy(420);
  await say("today");
  await say("overdue");

  await open("/caretaker/tree");
  await scrollBy(420);
  await say("tree");

  await open("/caretaker/log-watering");
  await scrollBy(420);
  await say("log");
  await say("gps");

  await open("/caretaker/offline");
  await scrollBy(420);
  await say("offline");

  await open("/admin/flagged-work");
  await scrollBy(420);
  await say("flagged");
  await say("unpaid");
  await scrollBy(500);
  await say("reasons");
  await say("close");
}
