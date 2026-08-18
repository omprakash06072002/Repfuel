# RepFuel — Permanent Account Fix

This package fixes the anonymous → permanent account flow without creating a second user.

## 1. Replace only these files

- `app.js`
- `index.html` is included for reference and is unchanged from the Stage 2.1 account build.

Keep your existing:
- `styles.css`
- `assets/`
- `supabase-config.js`

## 2. REQUIRED Supabase settings

Open Supabase → Authentication → Settings.

Turn ON:

- Anonymous Sign-Ins
- Email provider
- **Manual Linking**

Manual Linking is required because RepFuel converts the current anonymous user into a permanent email identity. Supabase keeps the same user ID, so existing workout rows remain attached.

## 3. REQUIRED Redirect URL

Open Supabase → Authentication → URL Configuration → Redirect URLs.

Add exactly:

https://omprakash06072002.github.io/Repfuel/

Also make sure the Site URL is your RepFuel GitHub Pages URL.

## 4. Account flow after this fix

Guest
→ Create permanent account
→ enter name + email
→ verification email
→ click verification link
→ return to RepFuel
→ press "I've verified my email"
→ set password
→ permanent account

The fix refreshes the Supabase session after the email link and explicitly verifies that the user is no longer anonymous before accepting the password setup.

## 5. Important

Do NOT put a service_role / secret key in the browser.

Do NOT delete `repfuel_workouts` or change the `user_id` values.
