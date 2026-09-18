/**
 * Module 11 — Corporate partnership.
 *
 * The administrative half of being a client: who may see the account, what the
 * organisation may change about itself, what its tier is worth, and what a
 * certificate actually is. Ends on the admin console, because the module's best
 * find is a number that means the same thing on both sides of the programme.
 */

export const title = "Module 11 — Corporate partnership";

export const lines = [
  ["open", "Module eleven. The administrative half of being a client."],
  ["roles", "Three roles. Owners administer; administrators and viewers read. And they are per organisation — the same colleague can own one account and merely view another."],
  ["number", "A colleague is added by number, not by email, because the number is what they sign in with."],
  ["lockout", "Two removals are simply refused, and the table says so rather than offering a button. Your own row reads You; a sole owner reads Only owner. Locking every human out of an account is a support request, not a click."],
  ["settings", "Settings splits the same way. Your name, your email, your language — yours to change."],
  ["ask", "The organisation's name and tax number are not. They are how finance and an auditor identify this account, so they change by asking us, with a record of who asked. An organisation cannot change its own status at all."],
  ["tier", "Underneath, the tier. Sapling, and a discount of nothing — which is the answer to a question module ten left open."],
  ["stamped", "Because a discount is stamped on an order when it is placed. Reaching a new tier does not reprice what you already bought, and losing trees claws nothing back."],
  ["certificate", "A certificate is the last of them, and the definition is the whole page: a certificate is a period, signed."],
  ["preparing", "The record is immediate and the document follows — the column reads Preparing while the file is made."],
  ["admin", "And the staff side. Two kinds of organisation kept on separate tabs: accounts that buy trees, and partners that embed Otesha through the API."],
  ["living", "With one number worth stopping on. Trees reads living over ordered — three hundred and six of three hundred and forty-six. The forty is the order placed while writing module ten, and it is the same outstanding figure the client sees on their own orders page."],
  ["cut", "One planned page is missing on purpose. The phone's More screen is navigation overflow, computed from the same config as the tab bar. There is no task on it."],
  ["close", "Five pages. The account behind the trees."],
];

export async function beats(ctx) {
  const { say, scrollBy, overlay, page, sleep, INTERNAL } = ctx;

  let visit = 0;
  const open = async (path) => {
    await page.goto(`${INTERNAL}/?v=${++visit}#${path}`, { waitUntil: "networkidle" });
    await overlay();
    await sleep(900);
  };

  await open("/corporate/team");
  await say("open");
  await scrollBy(420);
  await say("roles");
  await say("number");
  await scrollBy(500);
  await say("lockout");

  await open("/corporate/settings");
  await scrollBy(420);
  await say("settings");
  await say("ask");

  await open("/corporate/tier");
  await scrollBy(420);
  await say("tier");
  await say("stamped");

  await open("/corporate/certificate");
  await scrollBy(420);
  await say("certificate");
  await scrollBy(500);
  await say("preparing");

  await open("/admin/partners");
  await scrollBy(420);
  await say("admin");
  await say("living");
  await say("cut");
  await say("close");
}
