-- SQLite refuses DROP COLUMN on an indexed column, so the index must go first.
DROP INDEX idx_leases_stage;
ALTER TABLE leases DROP COLUMN stage;
