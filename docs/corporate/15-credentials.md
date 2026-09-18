---
id: credentials
number: 15
title: Create an API key
category: corporate
categoryTitle: Corporate portal
description: The keys your servers call Otesha with, and the one moment you can read a secret.
---

## Who can do this

Anybody on an organisation that holds Otesha Connect.

## Before you start

Decide whether you want a **sandbox** or a **live** key. A live key needs the IP
addresses your servers call from.

## Steps

**1. Open Developers, then Credentials.**

![The credentials page in the developer console, with the secret warning and the environment column marked. Marked on the screenshot: Copy it now; Otesha cannot show it again. Sandbox and live keys are separate, and both live here.](/img/corporate-credentials-01-en.png "API keys: the key id, its environment, and when it was last used.")

**2. Create key.**

**3. Copy the secret.**

It is shown **once**, at the moment the key is created. After that the list
holds only the key id and the last four characters.

## How you know it worked

The key appears in the table with its environment and a **last used** of
*never*, which becomes a date the first time your servers authenticate.

## If it goes wrong

> **Note:** Lost the secret? There is no way to see it again. Create another key
> and retire the old one — that is the intended path, not a failure of it.

> **Note:** A key can read **expired**. It still lists, because the history of
> which key was used when is worth more than a tidy table.

> **Note:** Sandbox keys reach test data only — no real customers and no real
> money. The two environments never see each other's data.

## Related tasks

- [[link:corporate/developers|Open the developer console]]
- [[link:corporate/sandbox|Use the sandbox]]
- [[link:corporate/usage|See your usage]]
