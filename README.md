# SchoolRide

Multi-tenant school transport, attendance and fee management. Next.js 15, React 19, TypeScript, Tailwind 4, Supabase.

## Local development
```bash
nvm use 22
npm install
cp .env.example .env.local   # fill in the public Supabase URL and publishable key
npm run dev                  # http://localhost:3000
```

## Checks
```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Database
Migrations live in `supabase/migrations`, each with a matching script in `supabase/rollback`.
They are **not** applied automatically. Before applying: take a backup
(`pg_dump --schema-only` and a data dump), review existing policies, then run each file in order with `psql "$SUPABASE_DB_URL" -f <file>` and the verification queries in the file.

Tenant isolation check (needs a second school's test user):
```bash
SB_URL=... SB_KEY=... SB_SECRET=... SCHOOL_A_ID=... B_EMAIL=... B_PASSWORD=... node scripts/tenant-isolation-check.mjs
```

## Security notes
- Never put `SUPABASE_SECRET_KEY` or `SUPABASE_DB_URL` in a `NEXT_PUBLIC_` variable or in client code.
- Hidden navigation is not a security control; every page and server action re-checks the role, and RLS enforces school boundaries.

See `docs/AUDIT.md`, `docs/CHECKLIST.md` and `CHANGELOG.md`.
