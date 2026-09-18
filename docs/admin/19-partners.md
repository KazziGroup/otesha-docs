---
id: partners
number: 19
title: Find a corporate account or a partner
category: admin
categoryTitle: Admin portal
description: The organisations Otesha deals with, and why they are two lists rather than one.
---

## Who can do this

Staff with `corporate:write` see and edit corporate accounts; `partners:write`
covers integration partners. The tabs are drawn from what your account holds.

## Before you start

The organisation's name, or its TIN.

## Steps

**1. Open Corporate partners.**

![The admin corporate partners page, with the integration partners tab and the tier column marked. Marked on the screenshot: A different relationship: partners embed Otesha through the API. The tier that sets the discount on their orders.](/img/admin-partners-01-en.png "Two kinds of organisation, kept on separate tabs.")

**2. Pick the right tab.**

**Corporate accounts** buy trees: CSR programmes, bulk orders, tiers, invoices.
**Integration partners** embed Otesha through the API: credentials, commission,
settlements. Different relationships behind different scopes, which is why they
are two lists rather than one that quietly means two things.

**3. Search, or filter by status.**

## How you know it worked

The row shows the organisation's TIN, tier, trees, members, status and the date
the account was opened.

## If it goes wrong

> **Note:** The tab you are not looking at still shows a count. Only the open
> tab is fetched in full — the other is fetched for its number alone, so a tab
> can tell you how many there are without loading a list nobody asked to see.

> **Note:** **Trees** reads as *living / ordered*. A gap between the two is an
> order that is paid for and not yet fully planted, which is the same number the
> client sees as *outstanding* on their own orders page.

> **Note:** Unfiltered, this list is mostly test fixtures in a development
> database. Search before you judge how many customers there are.

## Related tasks

- [[link:admin/transactions|Find a payment]]
- [[link:admin/fulfilment|Plant what has been bought]]
