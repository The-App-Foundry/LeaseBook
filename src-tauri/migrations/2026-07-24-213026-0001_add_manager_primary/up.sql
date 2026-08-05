-- `is_primary` lives on the join row, not on the manager, because a manager can
-- be primary for one lease and not another.
ALTER TABLE leases_managers ADD COLUMN is_primary INTEGER NOT NULL DEFAULT 0;

-- Backfill: lowest manager_id per lease becomes primary, so the DECISION MAKER
-- column is non-blank for every existing lease. Row-value IN avoids the
-- ambiguous self-reference a correlated subquery on an unaliased outer table
-- would produce.
UPDATE leases_managers SET is_primary = 1
WHERE (lease_id, manager_id) IN (
  SELECT lease_id, MIN(manager_id) FROM leases_managers GROUP BY lease_id
);
