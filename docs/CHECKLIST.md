# Feature checklist

Status: Implemented · Tested · Blocked · Pending

| Area | Item | Status |
|---|---|---|
| Auth | Email/password sign in, sign out | Implemented, Tested (HTTP smoke + API sign-in) |
| Auth | Password reset (email link → /auth/callback → /reset-password) | Implemented (email delivery not tested) |
| Auth | Protected routes via middleware; role checks on pages and server actions | Implemented, Tested (signed-out redirects) |
| Auth | Account-not-set-up and unauthorized screens | Implemented |
| UI | Responsive sidebar layout, role-based nav, focus states | Implemented |
| Dashboard | Live counts (students school-scoped; others pending migration) | Implemented |
| Students | Paginated list, add form, PK phone normalisation | Implemented; phone unit-tested |
| Buses/Drivers/Routes/Attendance | Read-only paginated lists | Implemented |
| Buses/Drivers/Routes/Attendance | Create/edit | Blocked on tenant migration |
| DB | Tenant migrations + rollback scripts | Implemented, **not applied** — Blocked on `SUPABASE_DB_URL` |
| DB | Existing policy/trigger/function review | Blocked on `SUPABASE_DB_URL` |
| Security | Cross-school isolation check script | Implemented, run: 8/12 pass (see AUDIT.md) |
| Bulk import, trips, QR, fees, parent portal, GPS, notifications, subscriptions, super admin | — | Pending |
| Repo | Push + PR | Blocked on GitHub repo access |
