/**
 * Module 2 — Caretaker onboarding & standing.
 *
 * One person's path into the programme, followed across both surfaces: the
 * console that registers and approves them, and the phone where they see what
 * that decision made of them.
 */

export const title = "Module 2 — Caretaker onboarding and standing";

export const lines = [
  ["open", "Module two. How somebody becomes a caretaker, and what they see of it afterwards."],
  ["register", "Registering is a form: name, the number they will sign in with, and a zone."],
  ["choice", "Then a question worth slowing down for. Enrol them now, and you are recorded as the approver. Or file them for review, and nobody is."],
  ["id", "A national ID scan goes to a restricted bucket and is never displayed — not on the form, not in the directory, not through the API. The record says only that one is on file."],
  ["queue", "Whoever was filed for review waits here. Each card is one person, with when they registered — some have been waiting months."],
  ["approve", "Approving records who decided. That is the whole reason this queue exists rather than everyone being enrolled on sight."],
  ["section", "And approving is not the end of it. A caretaker with no section has an app listing no trees, and the evening sweep then holds their pay for not logging work nobody assigned."],
  ["directory", "The directory is everybody, whatever their status — searchable by name or by the number they sign in with."],
  ["standing", "On the phone, the same decision reads as one line: your zone, and whether you are active."],
  ["counts", "Under it, what the month adds up to. Trees in your care, logs recorded, days worked."],
  ["cut", "One screen was deliberately left out. The certification ladder is mock data — a level nobody can reach and badges nobody can earn — so documenting it would describe a feature that does not exist."],
  ["close", "Four pages, two surfaces, one person's path into the programme."],
];

export async function beats(ctx) {
  const { say, scrollBy, overlay, page, sleep, INTERNAL } = ctx;

  let visit = 0;
  const open = async (path) => {
    await page.goto(`${INTERNAL}/?v=${++visit}#${path}`, { waitUntil: "networkidle" });
    await overlay();
    await sleep(900);
  };

  await open("/admin/new-caretaker");
  await say("open");
  await scrollBy(420);
  await say("register");
  await say("choice");
  await say("id");

  await open("/admin/approve-caretaker");
  await scrollBy(420);
  await say("queue");
  await say("approve");
  await scrollBy(600);
  await say("section");

  await open("/admin/find-a-caretaker");
  await scrollBy(420);
  await say("directory");

  await open("/caretaker/profile");
  await scrollBy(420);
  await say("standing");
  await say("counts");
  await say("cut");
  await say("close");
}
