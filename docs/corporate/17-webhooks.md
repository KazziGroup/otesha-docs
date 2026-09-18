---
id: webhooks
number: 17
title: Receive webhooks
category: corporate
categoryTitle: Corporate portal
description: Where Otesha calls you when something happens to a tree.
---

## Who can do this

Anybody on an organisation that holds Otesha Connect.

## Before you start

An **HTTPS** endpoint you control. For local development, a tunnel.

## Steps

**1. Open Developers, then Webhooks.**

![The webhooks page in the developer console, with the HTTPS warning and an event marked. Marked on the screenshot: Over plain HTTP the payload and its signature are readable in transit. The events Otesha will send you.](/img/corporate-webhooks-01-en.png "Webhooks: your endpoint, and the events you want it told about.")

**2. Enter the endpoint URL.**

**3. Choose the events.**

*order.confirmed*, *tree.planted*, *tree.health_updated*,
*tree.milestone_reached*, *tree.photo_added*, and the subscription and payment
events. Pick the ones your integration reacts to.

**4. Save, and verify the signature on a test event from the sandbox.**

## How you know it worked

Your endpoint receives a signed test event.

## If it goes wrong

> **Note:** **HTTPS only.** Over plain HTTP the payload *and its signature* are
> readable by anything on the path, which makes the signature pointless.

> **Note:** Selecting nothing registers nothing — the API refuses an endpoint
> with no events. At least one is required.

> **Note:** Three events are marked **no producer yet**. They are declared so
> your integration can be written against them, but nothing raises them today.
> The list tells you which, rather than letting you wait on a call that never
> comes.

## Related tasks

- [[link:corporate/sandbox|Use the sandbox]]
- [[link:corporate/reference|Read the API reference]]
