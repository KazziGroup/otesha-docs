---
id: payment-rates
number: 15
title: Read the payment rates
category: admin
categoryTitle: Admin portal
description: What each activity pays, and why a rate is published rather than edited.
---

## Who can do this

Anybody with access to the console can read them. Publishing a new version is
operations staff and above.

## Before you start

Nothing.

## Steps

**1. Open Payment rates.**

![The payment rates table in the admin console, with the versioning note and the in-force date marked. Marked on the screenshot: A rate change is a new version, not an edit. When this version came into force.](/img/admin-payment-rates-01-en.png "Payment rates. One row per activity, per version.")

Each row is one activity and what it pays — *Watering, piece rate, TZS 300* —
with the role it applies to and the date it came into force.

**2. Understand what "published as a version" means.**

Rates are *"published as a version, never edited in place."* Changing what
watering pays does not rewrite history: it adds a version from a date, and work
already compiled keeps the rate that was in force when it was done.

**3. Switch between In force and All versions.**

## How you know it worked

Nothing to confirm; this is a list. A
[[link:admin/release-payout|compiled run]] reads whatever was in force for the
period it covers.

## If it goes wrong

> **Warning:** The seeded rates in a development console carry the note
> *"Development seed — not a confirmed Otesha rate"*. Do not quote them to
> anybody.

> **Note:** A rate with no end date is *still open* — it is the one in force,
> and it stays so until a later version supersedes it.

## Related tasks

- [[link:admin/release-payout|Release a payout run]]
- [[link:admin/payment-holds|Hold money back]]
