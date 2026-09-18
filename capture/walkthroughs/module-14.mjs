/**
 * Module 14 — Running the programme.
 *
 * The last module, and the one whose best material is about what a screen
 * chooses to say: a default that admits it is a default, and a scope that is
 * not a role.
 */

export const title = "Module 14 — Running the programme";

export const lines = [
  ["open", "Module fourteen, and the last. Programme settings, the permissions matrix, staff users, and your own account."],
  ["audit", "Every change is recorded with who made it and what it was before — and that is the audit trail. Not a screen you go to, but the setting's own history, shown on the field."],
  ["default", "This is the detail worth keeping. A field reading using the default — nobody has set this — is not the same as a field somebody chose, and the console says which."],
  ["permissions", "Permissions are what the API actually checks, so changing a role here changes what people can do with no deploy. Which cuts both ways: there is no release to catch a mistake."],
  ["system", "Some cannot be changed. System roles cannot be deleted, because sign-in and the seed data both depend on them."],
  ["scope", "On the users list, scope is not role. Two site supervisors can hold identical permissions and reach different zones — the role answers what, the scope answers where."],
  ["invite", "And no password yet, next to a last seen of never, is an invitation nobody took up. A person to chase, not an account to re-create."],
  ["password", "Your own account asks for your current password even though you are already signed in. The reason given is an unattended laptop, not distrust."],
  ["notpages", "Two planned pages are not pages. The settings index is a menu, and the audit trail is not a screen at all. Documenting either would send a reader looking for something that does not exist."],
  ["close", "Four pages. Fourteen modules. Sixty pages, sixty-one figures, and nine checks that all have to pass."],
];

export async function beats(ctx) {
  const { say, scrollBy, overlay, page, sleep, INTERNAL } = ctx;
  let visit = 0;
  const open = async (path) => {
    await page.goto(`${INTERNAL}/?v=${++visit}#${path}`, { waitUntil: "networkidle" });
    await overlay();
    await sleep(900);
  };
  await open("/admin/programme");
  await say("open");
  await scrollBy(420);
  await say("audit");
  await say("default");
  await open("/admin/permissions");
  await scrollBy(420);
  await say("permissions");
  await scrollBy(500);
  await say("system");
  await open("/admin/users");
  await scrollBy(420);
  await say("scope");
  await say("invite");
  await open("/admin/account");
  await scrollBy(420);
  await say("password");
  await say("notpages");
  await say("close");
}
