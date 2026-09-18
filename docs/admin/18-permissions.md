---
id: permissions
number: 18
title: Edit the permissions matrix
category: admin
categoryTitle: Admin portal
description: What each role may do, changed without a deploy — and the parts that cannot be changed.
---

## Who can do this

Staff holding `admin:write`. In practice, Super Admin.

## Before you start

Know which **role** you are changing, and how many accounts hold it. The list
says — *Site Supervisor · 15 permissions · 9 accounts* — and that number is how
many people your change reaches.

## Steps

**1. Open Settings, then Roles & permissions.**

![The roles and permissions matrix in the admin console, with the explanation and the account types note marked. Marked on the screenshot: Changing a role changes what people can do, with no deploy. Account types are a separate list from staff roles.](/img/admin-permissions-01-en.png "Roles down the middle, the chosen role's permissions on the right.")

**2. Choose a role.**

**3. Tick or untick permissions.**

Each one names the scope the API checks — `alerts:read`, `assignments:write` —
so what you see here is what the API enforces, not a description of it.

**4. It saves as you go.**

The panel says **Saved**, and the count above it — *34 of 36 granted* — moves.

## How you know it worked

The role's summary updates, and anybody holding it has the new permissions on
their next request.

## If it goes wrong

> **Note:** Permissions **are what the API actually checks**. Changing them here
> changes what people can do with no deploy, which cuts both ways: there is no
> release to catch a mistake.

> **Note:** Some permissions are marked **Required** and cannot be removed —
> *"Super Admin's app is built on this"*. **System roles cannot be deleted**
> either, because sign-in and the seed data both depend on them.

> **Note:** **Account types** — caretaker, corporate user, customer, partner —
> are a separate list. They describe *what an account is, not a job*, and they
> are editable only within what their app needs.

## Related tasks

- [[link:admin/find-a-caretaker|Find a caretaker]]
- [[link:admin/api-access|Give an organisation API access]]
