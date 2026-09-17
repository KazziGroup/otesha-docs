---
id: new-caretaker
number: 1
title: Register a caretaker
category: admin
categoryTitle: Admin portal
description: Add somebody to the programme, and decide whether you are approving them yourself.
---

## Who can do this

Operations staff and above. A caretaker cannot register themselves — their
account has to exist before they can [[link:caretaker/app-sign-in|sign in]] at
all, which is the opposite of how the customer app works.

## Before you start

Their full name, the phone number they will sign in with, and which zone they
work in. A photo and a national ID scan are optional and can follow later.

## Steps

**1. Open Caretakers and choose New caretaker.**

![The New caretaker dialog, with the phone field and the approval choice marked. Marked on the screenshot: The number they sign in with. Written any way; it is the same number. Active immediately, and you are recorded as the approver.](/img/admin-new-caretaker-01-en.png "New caretaker. Name, phone and zone are required; the rest can follow.")

**2. Enter their name, number and zone.**

The number is the one they will sign in with. Write it however you have it —
the form says so: `0712…`, `255712…` and `+255712…` are the same number.

**3. Decide whether you are approving them.**

This is the question worth slowing down for, because the two answers differ in
who is accountable rather than in how much work they are:

- **Yes, enrol them now.** Active immediately, *with you recorded as the
  approver*.
- **Not yet — file for review.** They go to the
  [[link:admin/approve-caretaker|review queue]] for somebody to decide on, and
  nobody is recorded as approving.

Either way they cannot log work until they are inducted, and that induction is
recorded on their profile.

## How you know it worked

They appear in the directory — as **Active** if you enrolled them, or as
**Pending** in the review queue if you did not.

## If it goes wrong

> **Note:** A national ID scan goes to a restricted bucket and is never
> displayed — not on this form, not in the directory, not through the API. The
> profile says only that one is on file. Do not expect to be able to look at it
> again.

> **Warning:** Suspending somebody later is a separate decision and takes a
> reason. It is not the same as rejecting them here, and it is not undone by
> re-registering them.

## Related tasks

- [[link:admin/approve-caretaker|Approve a caretaker]]
- [[link:admin/find-a-caretaker|Find a caretaker]]
