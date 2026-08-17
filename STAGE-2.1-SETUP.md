# RepFuel Stage 2.1 — Permanent Accounts

## Supabase setting required

In Supabase Authentication settings:
- Anonymous Sign-Ins: ON
- Email provider: ON
- Manual identity linking: ON

The account flow uses the current anonymous Supabase user and links an email identity to it. This preserves the same user ID and therefore the existing workout rows.

## Website files

Replace:
- app.js
- index.html

Keep:
- supabase-config.js
- styles.css
- assets/

No new SQL is required.

## Flow

Guest -> Profile -> Create permanent account -> verification email -> return to RepFuel -> set password.

The current anonymous session remains attached to the same user while the email identity is linked.

## Important

Do not put a service_role/secret key in the frontend.

This version intentionally does not implement "sign in to an existing account from a guest session" because that requires an explicit merge policy for guest data. That is Stage 2.2.
