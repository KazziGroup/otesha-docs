---
id: api-access
number: 20
title: Give an organisation API access
category: admin
categoryTitle: Admin portal
description: Turning a corporate account into an Otesha Connect partner, and what withdrawing does not undo.
---

## Who can do this

Staff with `partners:write`.

## Before you start

The account needs a **billing email** — the partner record is created from it.
Agree the **commission** and the **settlement cycle** first; both are set at the
moment you grant, and both are commercial decisions rather than technical ones.

## Steps

**1. Open Corporate partners and find the account.**

**2. Open it, and scroll to Otesha Connect.**

![The Otesha Connect section of a corporate account in the admin console, with the explanation and the grant button marked. Marked on the screenshot: Granting issues sandbox credentials and draws the developer console. One call: the partner identity, the keys and the link.](/img/admin-api-access-01-en.png "Otesha Connect, as a section of the account rather than a second register.")

**3. Set the type, commission and settlement cycle.**

Commission is in **basis points** — 250 is 2.5%.

**4. Grant API access.**

## How you know it worked

The section is replaced by the partner's slug, status and terms. Everybody in
the organisation gets the developer console the next time they sign in, and a
sandbox credential already exists for them to use.

## If it goes wrong

> **Note:** A partner **is** a corporate account with API access, not a second
> organisation. Granting here creates the partner identity, issues sandbox
> credentials and links them in one call — the alternative, registering the same
> organisation twice in two registers, is how two records drift until a
> settlement goes to the wrong place.

> **Note:** The slug is derived from the name, because it is the identity the
> partner signs every assertion with. It is part of an authentication contract,
> not a label to invent.

> **Note:** **Withdrawing keeps the settlement history.** It suspends the
> partner and unlinks it — a statement about who may call the API, not a reason
> to lose what they were owed for calls they already made.

> **Note:** Credentials, webhooks and settlements are managed by the
> organisation itself, in its own portal. This screen grants access; it does not
> administer it.

## Related tasks

- [[link:admin/partners|Find a corporate account or a partner]]
