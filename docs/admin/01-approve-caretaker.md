---
id: approve-caretaker
number: 1
title: Approve a caretaker
category: admin
categoryTitle: Admin portal
description: Move somebody from pending to active so they can be given trees and be paid.
---

## Who can do this

Operations staff and above. A caretaker sitting in the review queue cannot be
given a section, so nothing reaches their phone until this is done.

## Before you start

Nothing. The queue is on the Caretakers page and tells you how many are waiting.

## Steps

**1. Open Caretakers and switch to the review queue.**

![The Caretakers page in the admin console, with the Review queue tab and the status filter marked. Marked on the screenshot: Caretakers waiting to be approved. The number is how many. Filter the directory by status.](/img/admin-approve-caretaker-01-en.png "Caretakers · Review queue. The badge is the number waiting.")

**Directory** is every caretaker; **Review queue** is only those waiting on you.
The number beside the tab is how many, so you can see from here whether the
queue needs attention without opening it.

**2. Open the person and check their details.**

Their phone number is the one they will sign in with, so a typo here is somebody
who cannot get into the app at all.

**3. Approve them, then give them a section.**

Approving is not enough on its own. A caretaker with no section is the warning
banner at the top of this page: their app lists no trees, the 06:00 compile gives
them no tasks, and the evening sweep then holds their pay for not logging work
nobody assigned them.

## How you know it worked

Their status reads **Active** in the directory, and the review queue count drops
by one. Once they have a section, trees appear on their phone at the next compile.

## If it goes wrong

> **Warning:** Approving somebody and stopping there is worse than leaving them
> pending, because pending is visible and an active caretaker with no section
> looks finished. Set the rota in the same sitting.

## Related tasks

- [[link:admin/assign-cluster|Assign a caretaker to a cluster]]
- [[link:admin/permissions|Edit the permissions matrix]]
