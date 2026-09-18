---
id: transactions
number: 12
title: Find a payment
category: admin
categoryTitle: Admin portal
description: Every customer payment, what it bought, and what the provider said about it.
---

## Who can do this

Operations staff and above. Payments are money; access follows the
[[link:admin/permissions|permissions matrix]].

## Before you start

Whatever you have — a reference, a date range, a channel, or just a status.

## Steps

**1. Open Transactions.**

![The transactions list in the admin console, with the filter note and the needs-review control marked. Marked on the screenshot: A filtered view is a link you can send. Payments the system could not settle on its own.](/img/admin-transactions-01-en.png "Transactions. Every customer payment, with what the provider said.")

**2. Narrow by status.**

The statuses describe where a payment stopped, not merely whether it worked:
**Awaiting the customer** means the prompt was sent and nobody has entered a
PIN. **With the provider** means it is out of Otesha's hands. **Paid**,
**Refused**, **Not answered** and **Declined** are ends of the line.

**3. Share the view rather than describing it.**

*"Filters live in the address bar, so a view is a link."* Send the URL and the
other person sees exactly the same rows.

## How you know it worked

The list narrows and the address bar changes to match.

## If it goes wrong

> **Note:** **Needs review** is for payments the system could not settle on its
> own — a provider answer that does not match any order, or an amount that does
> not reconcile. They need a person, which is why they have their own filter.

> **Warning:** **Recorded by hand** is a channel like any other in this list. A
> payment entered manually looks settled but had no provider on the other end of
> it; treat it with the care you would treat cash.

## Related tasks

- [[link:admin/fulfilment|Plant what has been bought]]
- [[link:admin/release-payout|Release a payout run]]
