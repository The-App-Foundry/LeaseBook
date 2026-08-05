-- Plain ADD COLUMN, deliberately NOT the table-rebuild convention used by
-- 2026-04-03-144001-0000_add_size_column: that rebuild SELECTed a literal NULL
-- into `address` and nulled every address in the database.
--
-- ADD COLUMN cannot carry a CHECK constraint, so the six-value stage enum is
-- enforced in Rust (models::Stage) rather than by the DB. That is accepted.
ALTER TABLE leases ADD COLUMN stage TEXT NOT NULL DEFAULT 'new';

-- Backfill from expiration so the existing Contacted/Qualified pill counts do
-- not regress to zero on upgrade. Mirrors the derivation being deleted from
-- get_stage_counts.
UPDATE leases
SET stage = CASE
  WHEN expiration_date IS NOT NULL AND expiration_date < unixepoch()
    THEN 'contacted'
  ELSE 'qualified'
END;

CREATE INDEX idx_leases_stage ON leases(stage);
