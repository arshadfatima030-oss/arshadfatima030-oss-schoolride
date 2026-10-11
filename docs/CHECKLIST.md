# Feature checklist

Status: Implemented · Tested · Blocked · Pending

| Area | Item | Status |
|---|---|---|
| Auth | Email/password sign in, sign out | Implemented, Tested (HTTP smoke + API sign-in) |
| Auth | Password reset (email link → /auth/callback → /reset-password) | Implemented (email delivery not tested) |
| Auth | Protected routes via middleware; role checks on pages and server actions | Implemented, Tested (signed-out redirects) |
| Auth | Account-not-set-up and unauthorized screens | Implemented |
| UI | Responsive sidebar layout, role-based nav, focus states | Implemented |
| Dashboard | Live counts, all filtered by the user's school | Implemented |
| Students | Paginated list, add form, PK phone normalisation | Implemented; phone unit-tested |
| Buses/Drivers/Routes/Attendance | Read-only paginated lists | Implemented |
| Buses/Drivers/Routes/Attendance | Create/edit | Pending (unblocked) |
| DB | Tenant migrations + rollback scripts | Implemented, applied 2026-10-11 after backup + dry run |
| DB | Existing policy/trigger/function review | Done (see AUDIT.md) |
| Security | Cross-school isolation check script | Implemented, Tested: 29/29 pass after migration (8/12 before) |
| Bulk import, trips, QR, fees, parent portal, GPS, notifications, subscriptions, super admin | — | Pending |
| Repo | Push + PR | Done |
| Roles | Allow transport_manager/accountant/teacher/driver in `profiles_role_check` | Pending |
