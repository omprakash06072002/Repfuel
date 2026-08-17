# RepFuel Cloud MVP

1. Enable Supabase Authentication -> Anonymous Sign-Ins.
2. Run `supabase-schema.sql` in Supabase SQL Editor.
3. Put your Project URL and Publishable key in `supabase-config.js`.
4. Commit `app.js`, `index.html`, and `supabase-config.js` to GitHub.
5. Wait for GitHub Pages to redeploy.
6. Open RepFuel, enter the profile, and finish a workout.
7. Check Supabase Table Editor -> `repfuel_profiles` and `repfuel_workouts`.

This MVP uses a Supabase anonymous user so RepFuel can store a cloud user ID without collecting an email. Supabase documents that anonymous users use the authenticated role and can be protected with RLS. The session persists in the browser, but anonymous users cannot recover the same identity on another device after losing the session. Account linking (email/Google) should be the next authentication stage.

Never put a service_role/secret Supabase key in GitHub Pages.
