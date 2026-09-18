---
id: users
number: 22
title: Add or find a staff user
category: admin
categoryTitle: Admin portal
description: Who can sign in to the console, what their role reaches, and who has never arrived.
---

## Who can do this

Staff with user-administration permissions.

## Before you start

Decide the **role** first. It is what the person can do, and
[[link:admin/permissions|the matrix]] is where roles are defined.

## Steps

**1. Open Users.**

![The staff users page in the admin console, with the heading and the scope column marked. Marked on the screenshot: People and roles are counted separately, and both are here. Which zones a person's role reaches.](/img/admin-users-01-en.png "Staff users: name, role, the zones it reaches, status and last seen.")

**2. Filter by role or status, or search by name, email or phone.**

**3. Add person.**

## How you know it worked

They appear in the list, **active**, marked **no password yet** until they set
one, and with a **last seen** of *never* until they first sign in.

## If it goes wrong

> **Note:** **Scope** is not the same as role. Two Site Supervisors can hold the
> same permissions and reach different zones — *all zones* or *1 zone* — so the
> role answers *what*, and the scope answers *where*.

> **Note:** **No password yet** and **never** seen together mean an invitation
> that has not been taken up. That is a person to chase, not an account to
> re-create.

> **Note:** This list is staff only. Caretakers are in
> [[link:admin/find-a-caretaker|the caretaker directory]], and customers are
> their own list.

> **Note:** In a development database this list is mostly E2E fixtures. Search
> before counting.

## Related tasks

- [[link:admin/permissions|Edit the permissions matrix]]
- [[link:admin/account|Change your own account]]
