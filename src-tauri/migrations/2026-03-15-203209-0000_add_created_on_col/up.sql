ALTER TABLE leases ADD COLUMN created_on INTEGER NOT NULL;
ALTER TABLE leases ADD COLUMN last_modified INTEGER;
ALTER TABLE lease_managers ADD COLUMN created_on INTEGER NOT NULL;
ALTER TABLE lease_managers ADD COLUMN last_modified INTEGER;