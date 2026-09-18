/**
 * Module 13 — Motivation and recognition.
 *
 * The shortest walkthrough in the set, because the module is one page. What it
 * documents is an absence, and the interesting part is how the codebase made
 * that absence checkable rather than arguable.
 */

export const title = "Module 13 — Motivation and recognition";

export const lines = [
  ["open", "Module thirteen. Streaks, challenges, milestones, Species IQ, a shareable poster. Five pages were planned and one was written."],
  ["mocks", "Because every one of those screens imports from a mocks folder and is wrapped in a marker called StaticOnly — which the app itself describes as the gate for everything in this app that is not real yet."],
  ["nowhere", "A screen behind it renders in a demo build and nowhere else. A caretaker on a real build is never shown a figure Otesha cannot compute."],
  ["inventory", "And the marker exists precisely so this is one command rather than a judgement. Grep for StaticOnly and you have the inventory — nineteen files."],
  ["page", "So the page lists what is fenced and what is real on the same screens, rather than the manual going quiet in five places. Your zone, your trees, your logs and your earnings are real. The ladder above them is not."],
  ["leak", "Writing it caught a leak. The profile figure is shot against the demo build, and the crop's padding had carried the certification ladder's heading into the bottom of the frame — a ladder no caretaker can see, in a manual about the build they use."],
  ["stop", "Figures can now say what they must stop above, and fail if that thing is not on the screen at all."],
  ["close", "One page. The most useful thing a manual can say about a feature is sometimes that it does not exist."],
];

export async function beats(ctx) {
  const { say, scrollBy, overlay, page, sleep, INTERNAL } = ctx;
  let visit = 0;
  const open = async (path) => {
    await page.goto(`${INTERNAL}/?v=${++visit}#${path}`, { waitUntil: "networkidle" });
    await overlay();
    await sleep(900);
  };
  await open("/caretaker/not-yet-real");
  await say("open");
  await scrollBy(420);
  await say("mocks");
  await say("nowhere");
  await scrollBy(500);
  await say("inventory");
  await say("page");
  await open("/caretaker/profile");
  await scrollBy(420);
  await say("leak");
  await say("stop");
  await say("close");
}
