---
id: reference
number: 20
title: Read the API reference
category: corporate
categoryTitle: Corporate portal
description: Every endpoint, the two tokens, and a Postman collection.
---

## Who can do this

Anybody on an organisation that holds Otesha Connect.

## Before you start

Nothing. The reference is readable before you have a key.

## Steps

**1. Open Developers, then API reference.**

![The API reference in the developer console, with the token endpoint and the catalogue endpoint marked. Marked on the screenshot: The call every other call depends on. What the catalogue exposes to a partner, which is not everything Otesha sells.](/img/corporate-reference-01-en.png "The API reference: contents down the left, the endpoint on the right.")

**2. Read *Your two tokens* before any endpoint.**

One token is your integration's; the other is a customer's link token. Which
signs what is the thing that makes the rest of the reference make sense.

**3. Use the contents to find the endpoint.**

Authentication, catalogue, orders and payment, your customers and trees.

**4. Download the Postman collection.**

The **Postman** button, top right, hands back a file rather than opening a
screen.

## How you know it worked

The base URL shown top right is the one your calls should go to.

## If it goes wrong

> **Note:** The catalogue endpoint returns *"species a partner may sell"*, which
> is not everything Otesha sells. What a partner may offer is a decision, not an
> oversight.

> **Note:** In sandbox, linking a customer always uses the code **123456** and
> no SMS is sent.

## Related tasks

- [[link:corporate/credentials|Create an API key]]
- [[link:corporate/webhooks|Receive webhooks]]
