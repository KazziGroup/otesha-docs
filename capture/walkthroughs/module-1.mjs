/**
 * Module 1 — Getting in.
 *
 * The four front doors, which differ more than "sign in" suggests. That is the
 * argument for writing them together, so it is also the argument this
 * walkthrough makes: one screen after another, in the order a reader would meet
 * them, with the difference stated each time.
 */

export const title = "Module 1 — Getting in, across all four front doors";

export const lines = [
  ["open", "Module one. Getting in — the four front doors, written together."],
  ["why", "They differ more than the phrase suggests, which is exactly why they were documented in one sitting rather than four."],
  ["customer", "The sponsor signs in with a phone number and a six-digit code. There is no password anywhere in this flow."],
  ["creates", "A number Otesha has never seen creates an account. That matters, because on the caretaker's app the same action creates nothing at all."],
  ["welcome", "First time in, the sponsor meets this: a name, and an optional email. It was shipped and undocumented — a new sponsor met a screen the manual did not mention."],
  ["caretaker", "The caretaker's app looks similar and behaves oppositely. Only a number Otesha has already enrolled can sign in; if yours does not work, your supervisor registers it."],
  ["corporate", "The corporate portal also sends a code — to an account that has no password at all. That is deliberate: no shared secret to circulate when somebody joins or leaves."],
  ["admin", "And the operations console is the one door with a password. Staff accounts only, made for you by an administrator."],
  ["figures", "Eleven figures, every one captured from the main branch with a committed recipe behind it."],
  ["caught", "Two things only looking caught. A development banner reading TEST ENVIRONMENT sat in the middle of the corporate shot — in the manual that goes to clients."],
  ["close", "Six pages, four doors, one module. Checks green."],
];

export async function beats(ctx) {
  const { say, scrollBy, overlay, page, sleep, INTERNAL } = ctx;

  /*
   * Pages are reached by URL, not by clicking the sidebar.
   *
   * A manual's heading in the sidebar is a toggle, so clicking the four of them
   * to open them closes whichever was already open — and the recording then
   * hunts for a link that is folded away. Navigating directly says the same
   * thing on screen and cannot get out of step with sidebar state.
   */
  let visit = 0;
  const open = async (path) => {
    // The query string is what makes this a real navigation. Going to a URL
    // that differs only in its hash updates `location.hash` without HashRouter
    // noticing, so the address is right and the page on screen is the previous
    // one — which records perfectly and narrates the wrong screen.
    await page.goto(`${INTERNAL}/?v=${++visit}#${path}`, { waitUntil: "networkidle" });
    await overlay();
    await sleep(900);
  };

  await open("/customer/sign-in");
  await say("open");
  await say("why");

  await scrollBy(420);
  await say("customer");
  await say("creates");

  await open("/customer/welcome");
  await scrollBy(380);
  await say("welcome");

  await open("/caretaker/app-sign-in");
  await scrollBy(400);
  await say("caretaker");

  await open("/corporate/portal-sign-in");
  await scrollBy(400);
  await say("corporate");

  await open("/admin/console-sign-in");
  await scrollBy(400);
  await say("admin");
  await say("figures");
  await say("caught");
  await say("close");
}
