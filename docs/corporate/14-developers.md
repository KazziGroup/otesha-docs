---
id: developers
number: 14
title: Open the developer console
category: corporate
categoryTitle: Corporate portal
description: Where Otesha Connect lives, and the six steps from nothing to a live integration.
---

## Who can do this

Anybody on an organisation that has been granted **Otesha Connect**. If your
sidebar has no **Developers**, the account does not have it yet — ask us.

## Before you start

Nothing. The console is where the keys come from.

## Steps

**1. Open Developers.**

![The developer console overview, with the getting-started checklist and the sandbox warning marked. Marked on the screenshot: Six steps, in the order they have to happen. Sandbox keys reach test data only.](/img/corporate-developers-01-en.png "The developer console: your partner identity, and the six steps to a live integration.")

**2. Read the card at the top.**

Your **slug** — `kilima_bank_plc` — is the identity your servers sign with, along
with your status, type, commission and settlement cycle.

**3. Work down the checklist.**

Create a sandbox key, get a token with it, link a test customer, place an order,
listen for webhooks, go live. The order matters: each step needs the one before.

## How you know it worked

The counter at the top right moves — *1 of 6 done*.

## If it goes wrong

> **Note:** Linking a test customer in sandbox uses the code **123456** and
> sends no SMS. That is the sandbox, not a backdoor: live keys text a real code
> to a real handset.

> **Note:** Your status reads **onboarding** until Otesha certifies the
> integration. Sandbox works throughout; live keys are the thing that waits.

## Related tasks

- [[link:corporate/credentials|Create an API key]]
- [[link:corporate/reference|Read the API reference]]
- [[link:corporate/sandbox|Use the sandbox]]
