/**
 * Phase 0 — the machinery, before any module was written.
 *
 * What a walkthrough is: the narration and the beats it plays over, together in
 * one file. They were separate once, and a line added to one without the other
 * fails at record time with the picture halfway through a scroll.
 */

export const title = "Phase 0 — one repo, two builds, every picture rebuildable";

export const lines = [
  ["open", "These are the Otesha manuals. Four of them, in one repository."],
  ["repo", "One for each person who uses Otesha: the sponsor, the operations console, the corporate portal, and the caretaker's phone."],
  ["template", "Every task page follows the same seven parts. Who can do this. What you need first. The steps. How you know it worked. And what to do when it does not."],
  ["shots", "The screenshots are generated, not taken by hand."],
  ["callouts", "Markers sit in the margin and never cover a control, and the legend is drawn into the picture, so a screenshot still explains itself when somebody pastes it into a chat."],
  ["mobile", "The caretaker's app is a real phone build. Its markers are anchored to accessibility labels, the same way the web ones are anchored to elements."],
  ["recipe", "Every figure has a recipe committed beside it: which app, which commit, the steps to reach the screen, and what each marker means."],
  ["rebuilt", "To prove it, every screenshot in these manuals was deleted and rebuilt from those recipes alone."],
  ["refs", "And a capture refuses to run against an app on the wrong branch. One of these figures once came from a stray server and documented a screen that does not exist."],
  ["search", "Now the part that matters for pictures. These words appear on no page. They are a callout inside a screenshot."],
  ["found", "Search finds them anyway. The figure is indexed, so an image is not a hole in the documentation."],
  ["ai", "The same text is what the built-in assistant reads. It never receives the image itself, only the words attached to it."],
  ["external", "Same repository, second build. This is what a client outside Otesha gets."],
  ["absent", "The admin and caretaker manuals are not hidden here. They are not in the bundle at all."],
  ["close", "One repository, two builds, and every picture rebuildable on demand."],
];

export async function beats(ctx) {
  const { say, click, scrollBy, overlay, page, sleep, INTERNAL, EXTERNAL } = ctx;

  await page.goto(`${INTERNAL}/#/overview/intro`, { waitUntil: "networkidle" });
  await overlay();
  await say("open");

  for (const manual of ["Customer app", "Admin portal", "Corporate portal", "Caretaker app"]) {
    await click(`text=${manual}`);
    await sleep(300);
  }
  await say("repo");

  await click("text=Sign in to your account");
  await overlay();
  await say("template");

  await scrollBy(420);
  await say("shots");
  await say("callouts");

  // The caretaker manual: a real phone build, annotated the same way. The groups
  // were all opened at the top, so these are page links, not group headers —
  // clicking a header again would fold the manual shut.
  await click("text=Start your day on Today");
  await overlay();
  await scrollBy(380);
  await say("mobile");

  // The console manuals, and the recipe behind every figure.
  await click("text=Approve a caretaker");
  await overlay();
  await scrollBy(400);
  await say("recipe");
  await say("rebuilt");
  await say("refs");

  // The search proof. These words are written on no page — they are a callout
  // inside a screenshot.
  await click('button:has-text("Search docs")');
  await overlay();
  await page.keyboard.type("where signing in lands you", { delay: 70 });
  await sleep(900);
  await say("search");
  await say("found");
  await say("ai");
  await page.keyboard.press("Escape");
  await sleep(400);

  await page.goto(`${EXTERNAL}/#/overview/intro`, { waitUntil: "networkidle" });
  await overlay();
  await say("external");
  await say("absent");
  await say("close");
}
