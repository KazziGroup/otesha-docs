---
id: assign-cluster
number: 5
title: Give a caretaker a section
category: admin
categoryTitle: Admin portal
description: The rota, and why an approved caretaker with no section is worse off than a pending one.
---

## Who can do this

Operations staff and above. This is the step that finishes
[[link:admin/approve-caretaker|approving somebody]] — until it is done, being
approved has changed nothing they can see.

## Before you start

Know which zone they work in. The rota is per zone.

## Steps

**1. Open Rota and choose the zone.**

![The rota in the admin console, by caretaker, with the caretaker and section columns marked and an unassigned caretaker highlighted. Marked on the screenshot: Everybody working this zone. Which cluster each caretaker tends. An active caretaker with no section gets no tasks and no pay.](/img/admin-assign-cluster-01-en.png "Rota · Caretakers. One row per caretaker in the chosen zone.")

**2. Read the Section column.**

A caretaker may hold one cluster, several, or none. Several is normal —
`Cluster 1  Cluster 2  Cluster 3` on one row means they tend all three.

**3. Give a section to anybody showing no section.**

## How you know it worked

Their row shows the cluster instead of **no section**, and the amber banner at
the top of the page counts one fewer.

## If it goes wrong

> **Warning:** *"1 active caretaker(s) at this site hold no section."* This is
> the failure this page exists to prevent, and it compounds: their app lists no
> trees, the 06:00 compiler gives them no tasks, and the evening sweep then
> raises a missing-log alert and **holds the piece rate for work nobody
> assigned**. An approved caretaker with no section is worse off than one still
> pending, because nothing about their status suggests anything is wrong.

> **Note:** **Last active: never** with logs at zero usually means this, not
> idleness.

## Related tasks

- [[link:admin/clusters|See who is on each cluster]]
- [[link:caretaker/trees|What a section looks like on the phone]]
