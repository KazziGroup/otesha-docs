/**
 * Module 5 — Sponsoring a tree.
 *
 * The money path, followed from the cart to the moment somebody has to go and
 * plant something. It ends on the fulfilment queue rather than on a receipt,
 * because a paid order is a promise and this is where the promise comes due.
 */

export const title = "Module 5 — Sponsoring a tree";

export const lines = [
  ["open", "Module five. The money path — from a tree in a cart to somebody having to go and plant it."],
  ["cart", "The cart holds care plans, not bare species. A tree and the looking-after that goes with it."],
  ["total", "And the subtotal here is arithmetic done on your phone. The amount you are actually asked for is worked out by Otesha when you check out."],
  ["confirm", "The confirmation says nothing has been charged yet, twice — above the total and below it. Placing the order takes no money."],
  ["pay", "Then six ways to pay. And the number charged need not be the one you signed in with — a parent's, or your own second line."],
  ["held", "If you stop here, nothing is lost. The order is held, nothing is charged, and no tree is planted until it is paid."],
  ["dontretry", "Which is the thing worth telling somebody plainly: pay the order that already exists. A second order is a second tree and a second charge."],
  ["transactions", "On the console, every payment and what the provider said about it. The statuses describe where a payment stopped, not merely whether it worked."],
  ["links", "Filters live in the address bar, so a filtered view is a link somebody can send."],
  ["fulfil", "And then the part that is not software. Paid orders, waiting on a planting site, counted in days late — against a date the customer was already given."],
  ["close", "Five pages. The promise, and where it comes due."],
];

export async function beats(ctx) {
  const { say, scrollBy, overlay, page, sleep, INTERNAL } = ctx;
  let visit = 0;
  const open = async (path) => {
    await page.goto(`${INTERNAL}/?v=${++visit}#${path}`, { waitUntil: "networkidle" });
    await overlay();
    await sleep(900);
  };

  await open("/customer/cart");
  await say("open");
  await scrollBy(420);
  await say("cart");
  await say("total");

  await open("/customer/checkout");
  await scrollBy(420);
  await say("confirm");
  await scrollBy(700);
  await say("pay");

  await open("/customer/orders");
  await scrollBy(420);
  await say("held");
  await scrollBy(600);
  await say("dontretry");

  await open("/admin/transactions");
  await scrollBy(420);
  await say("transactions");
  await say("links");

  await open("/admin/fulfilment");
  await scrollBy(420);
  await say("fulfil");
  await say("close");
}
