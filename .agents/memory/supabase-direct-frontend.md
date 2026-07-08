---
name: Supabase-direct frontend pattern
description: How to build React+Vite apps that use Supabase directly (no Express backend), including env vars, singleton profile, and install steps.
---

# Supabase-direct frontend pattern

**Rule:** When the app uses Supabase for all data (auth + DB + storage), skip the OpenAPI/codegen/Express workflow entirely. The design subagent owns everything.

**Why:** The generated API client hooks require an Express backend. Supabase apps call `supabase.from()` directly instead.

**How to apply:**
1. `pnpm add @supabase/supabase-js` inside the artifact dir.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` via `setEnvVars` (shared env, not secrets — they're public client-side values).
3. Create `src/lib/supabase.ts` with `createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)`.
4. Tell design subagent: "No generated API hooks. All data calls use the Supabase client directly."
5. Singleton profile table: use `.single()` on select; update by fetching cached ID from QueryClient, not by `session.user.id` (which won't match a seeded UUID).
6. Write a `supabase-setup.sql` file at the artifact root with all CREATE TABLE, RLS policies, and storage bucket setup for the user to run in Supabase SQL Editor.
7. App loading spinner while tables don't exist is expected — the user must run the SQL setup first.

**Common TS errors to watch:**
- `email?: string | undefined` vs `email: string | null` — convert with `data.email ?? null` before mutating.
- `return toast.error(...)` in arrow functions causes mixed return type — use `{ toast.error(...); return; }` instead.
- `useEffect` returning cleanup only in one branch — restructure to `if (condition <= 0) return; ... return cleanup;`.
- `@radix-ui/react-visually-hidden` not installed by default in react-vite scaffold — add manually if used.
