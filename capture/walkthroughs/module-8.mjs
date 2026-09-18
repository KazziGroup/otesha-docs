/**
 * Module 8 — Caretaker pay.
 *
 * The sequel to module 7: that one explains why flagged work is not paid, this
 * one explains what "paid" actually means. Three steps, two people, and a
 * caretaker looking at an empty screen who needs to know why.
 */

export const title = "Module 8 — Caretaker pay";

export const lines = [
  ["open", "Module eight. What happens between doing the work and being paid for it."],
  ["rates", "It starts with the rates. What each activity pays — watering, mulching — and the date each version came into force."],
  ["version", "Rates are published as a version, never edited in place. Changing what watering pays does not rewrite history: work keeps the rate that was in force when it was done."],
  ["compile", "Then a run is compiled. It reads the rates in force, sums the work in the period, and subtracts anything held. Nothing is paid yet — it is arithmetic, not money."],
  ["approve", "And a run has to be approved by somebody other than whoever compiled it. That is the whole reason this is three steps rather than one button."],
  ["holds", "Money can also be held back, from one caretaker or a whole zone, with a reason recorded against it."],
  ["lift", "A hold withholds everything for that subject from every run, and only a person can lift it. It does not expire when the problem is fixed."],
  ["phone", "On the phone, all of that arrives as one screen. Paid monthly, via M-Pesa."],
  ["empty", "And here it is empty — while the same caretaker's profile shows forty-five logs this month."],
  ["why", "Which is the thing worth telling somebody plainly. Logged work is not paid work. The money appears when a run covering it has been compiled, approved and disbursed."],
  ["close", "Five pages. Three steps, two people, and one screen that has to explain a wait."],
];

export async function beats(ctx) {
  const { say, scrollBy, overlay, page, sleep, INTERNAL } = ctx;
  let visit = 0;
  const open = async (path) => {
    await page.goto(`${INTERNAL}/?v=${++visit}#${path}`, { waitUntil: "networkidle" });
    await overlay();
    await sleep(900);
  };

  await open("/admin/payment-rates");
  await say("open");
  await scrollBy(420);
  await say("rates");
  await say("version");

  await open("/admin/release-payout");
  await scrollBy(420);
  await say("compile");
  await scrollBy(700);
  await say("approve");

  await open("/admin/payment-holds");
  await scrollBy(420);
  await say("holds");
  await say("lift");

  await open("/caretaker/earnings");
  await scrollBy(420);
  await say("phone");
  await say("empty");
  await scrollBy(600);
  await say("why");
  await say("close");
}
