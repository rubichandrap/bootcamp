# 08 — Set up Drizzle Kit schema push and clean the schema

**What to build:** Replace the dual-source-of-truth for database tables (raw `CREATE TABLE` DDL in `progress.ts` plus Drizzle schema objects in `schema.ts`) with a single source of truth via Drizzle schema objects, applied via `drizzle-kit push`. Delete the phantom `modules`, `chapters`, and `users` tables that exist in both places but are never read from or written to (content comes from the filesystem; no auth system exists yet).

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Add `db:push` script to `package.json` running `drizzle-kit push:sqlite`
- [ ] Create `drizzle.config.ts` pointing at `db/schema.ts` and `.data/app.db`
- [ ] Delete the raw `CREATE TABLE IF NOT EXISTS` DDL block from `progress.ts`
- [ ] Delete `modules`, `chapters`, and `users` table definitions from `schema.ts`
- [ ] Run `npm run db:push` to create the cleaned tables in SQLite
- [ ] Verify existing progress tests still pass (tables `user_progress` and `submissions` are unchanged in structure)
