---
id: release-payout
number: 16
title: Release a payout run
category: admin
categoryTitle: Admin portal
description: Compile what is owed, have somebody else approve it, then disburse.
---

## Who can do this

Operations staff and above — and **not the same person for every step**. The
console enforces that.

## Before you start

Decide the period. Settle anything in
[[link:admin/flagged-work|flagged work]] first: it cannot be paid until it is
decided, so a run compiled before those decisions leaves people short.

## Steps

**1. Compile a run.**

![The payouts page in the admin console, with the nothing-paid-yet note and the run status marked. Marked on the screenshot: Compiling only works out what is owed. A compiled run waits for somebody else.](/img/admin-release-payout-01-en.png "Payouts. Compile a run, approve it, then disburse it.")

Compiling *"reads the rates in force, sums the work in the period and subtracts
anything held. **Nothing is paid yet.**"* It is arithmetic, not money.

**2. Have somebody else approve it.**

![A compiled payout run in the admin console, with the separation-of-duties note and the held total marked. Marked on the screenshot: The person who compiles cannot approve. Anything held back is subtracted before the net.](/img/admin-release-payout-02-en.png "A run: gross, held, net, and everybody in it.")

*"A run has to be approved by somebody other than whoever compiled it."* That is
the whole reason this is three steps rather than one button.

The run shows **Gross**, **Held** and **Net**, and every caretaker in it with
their zone and amount.

**3. Disburse.**

## How you know it worked

The run stops saying **Awaiting approval**, and each caretaker's row moves off
**Pending**. Their phones show the money under
[[link:caretaker/earnings|Earnings]].

## If it goes wrong

> **Warning:** Compiling twice does not pay twice, but it does move the
> arithmetic. A run compiled before flagged work was decided, and a run compiled
> after, are different runs — check which one you are approving.

> **Note:** **Held TZS 0** is not the same as nothing being held. It means
> nothing is on hold *for this run's subjects* — see
> [[link:admin/payment-holds|payment holds]].

## Related tasks

- [[link:admin/payment-holds|Hold money back]]
- [[link:admin/flagged-work|Decide on flagged work]]
