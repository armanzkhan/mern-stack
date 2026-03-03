# User & Customer Credentials (Ressichem / Testing DB)

This file describes how to get **user/customer contact info** and how to use **known passwords** for development or testing.

---

## Important: Passwords Are Not Stored in Plain Text

- Passwords in the database are **hashed** (one-way) with bcrypt.
- **The system cannot retrieve or display the “current” password** for any existing user.
- To have “actual credentials” (email/phone + password) that you can write down, you must **set** a password yourself and then document it here.

---

## 1. List All Users and Customers (email, phone)

From the **backend** folder:

```bash
node scripts/list-users-and-customers.js
```

- **Users:** login accounts with email, phone, name. Passwords are not shown (hashed).
- **Customers:** company contacts with email, phone, company name. Customer records do not store a login password; customers sign in via their linked **User** account.

To save the list to a file:

```bash
node scripts/list-users-and-customers.js > users-and-customers-list.txt
```

---

## 2. Use a Single Known Password for All Users (dev/test only)

If you want one password that works for **every** user (e.g. for testing or handover), set it with:

```bash
node scripts/set-all-users-known-password.js "YourChosenPassword123"
```

Replace `YourChosenPassword123` with a strong password you choose. After this:

- **Every user** in the database will have that password.
- You can log in with any user’s **email** or **phone** (from the list script) and this password.

**Document the password you used below** so it’s the “actual credential” for all users.

---

## 3. Credentials After Setting a Known Password

**Use this section only after you have run the script in section 2.**

| Item | Value |
|------|--------|
| **Password (all users)** | `________________` ← fill in the password you used in the script above |

**User list (email & phone):**  
Run `node scripts/list-users-and-customers.js` to print every user’s email and phone.  
Example logins:

- **Super Admin:** email `superadmin@ressichem.com` — password: *(same as above)*
- **Company Admin:** email `companyadmin@samplecompany.com` — password: *(same as above)*
- **Managers:** e.g. `tileadhesive@gmail.com`, `managerbcm@gmail.com`, `managerzepoxy@gmail.com` — password: *(same as above)*
- **Customer users:** use the email or phone from the list script — password: *(same as above)*

Customers (company contacts) do not have a separate password; they use the linked User account’s email/phone and the same password.

---

## 4. Reset One User’s Password

To set a new password for a **single** user (by email):

```bash
node scripts/reset-user-password.js "user@example.com" "NewPassword123"
```

Then you can document that user’s password in this README or in your own notes.

---

## 5. Summary

| Goal | What to do |
|------|------------|
| See all users/customers (email, phone) | `node scripts/list-users-and-customers.js` |
| Have one known password for every user | `node scripts/set-all-users-known-password.js "YourPassword123"` then fill in section 3 above |
| Change one user’s password | `node scripts/reset-user-password.js "email@example.com" "NewPassword"` |

**Actual credentials** (email, phone, password) for all users can be: **(1)** email/phone from the list script, **(2)** password = the single value you set with `set-all-users-known-password.js`, documented in section 3. The database does not store the original passwords, so “current password” cannot be read back—only set and then documented.
