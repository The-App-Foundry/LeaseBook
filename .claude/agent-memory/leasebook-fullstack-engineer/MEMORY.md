# LeaseBook Agent Memory

- [Bootstrap Migration (April 2026)](feedback_bootstrap_migration.md) — App fully migrated from styled-components to Bootstrap 5 + `lb-*` CSS classes in `App.css`; all new UI must use this pattern
- [SQLite migration style](project_sqlite_migrations.md) — Use `ALTER TABLE ADD COLUMN`, never the old table-rebuild pattern (it nulled every address); prove down.sql with `redo -n`
- [Diesel query gotchas](diesel_query_gotchas.md) — `GROUP BY` can't be boxed; zero-fill per-bucket counts; join-row attrs go on a flattened payload struct
