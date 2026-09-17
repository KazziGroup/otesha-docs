---
id: find-a-caretaker
number: 3
title: Find a caretaker
category: admin
categoryTitle: Admin portal
description: Search the directory, filter by status, and read what each status means.
---

## Who can do this

Anybody with access to the console.

## Before you start

Their name, or the number they sign in with. Either will find them.

## Steps

**1. Open Caretakers.**

![The caretaker directory, with the search box and the status filter marked. Marked on the screenshot: Find somebody by name or by the number they sign in with. Filter by status — pending, active, suspended, rejected.](/img/admin-find-a-caretaker-01-en.png "The directory. Every caretaker, whatever their status.")

**Directory** is everybody; **Review queue** is only those waiting on a decision.
The number beside each tab is a count, so you can see whether the queue needs
attention without opening it.

**2. Search, or filter by status.**

Search takes a name or a phone number. The filter takes a status:

- **Pending** — registered, waiting on [[link:admin/approve-caretaker|a decision]]
- **Active** — approved, and able to be given trees
- **Suspended** — stopped, for a recorded reason
- **Rejected** — decided against

## How you know it worked

The table narrows. It shows their zone, their section, their status, when they
were last active, and how many logs and trees they have — which together are
usually enough to tell whether somebody is actually working.

## If it goes wrong

> **Note:** Somebody is Active but their **Last active** reads *never* and their
> logs are zero. That usually means no section rather than no effort — see the
> banner at the top of the page.

> **Warning:** A number that finds nobody may be written differently from how it
> was registered. The console treats `0712…`, `255712…` and `+255712…` as the
> same number, so if none of them match, the account is genuinely not there.

## Related tasks

- [[link:admin/new-caretaker|Register a caretaker]]
- [[link:admin/approve-caretaker|Approve a caretaker]]
