-- Remove UNIQUE constraint from leases.address and add DEFAULT to created_on columns.
-- Because Diesel wraps migrations in a transaction, PRAGMA foreign_keys = OFF has no
-- effect; instead we back up and recreate leases_managers ourselves.

-- 1. Back up and drop the FK junction table first
CREATE TABLE leases_managers_bak AS SELECT * FROM leases_managers;
DROP TABLE leases_managers;

-- 2. Rebuild leases without UNIQUE on address, with DEFAULT on created_on
CREATE TABLE leases_new (
  id              INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name            TEXT    NOT NULL,
  address         TEXT    NOT NULL,
  expiration_date INTEGER,
  notes           TEXT,
  misc_data       TEXT,
  created_on      INTEGER NOT NULL DEFAULT (unixepoch()),
  last_modified   INTEGER
) STRICT;

INSERT INTO leases_new (id, name, address, expiration_date, notes, misc_data, created_on, last_modified)
SELECT id, name, address, expiration_date, notes, misc_data, COALESCE(created_on, unixepoch()), last_modified
FROM leases;

DROP TABLE leases;
ALTER TABLE leases_new RENAME TO leases;

-- 3. Rebuild lease_managers with DEFAULT on created_on
CREATE TABLE lease_managers_new (
  id            INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  phone_numbers TEXT,
  email         TEXT UNIQUE,
  created_on    INTEGER NOT NULL DEFAULT (unixepoch()),
  last_modified INTEGER
) STRICT;

INSERT INTO lease_managers_new (id, name, phone_numbers, email, created_on, last_modified)
SELECT id, name, phone_numbers, email, COALESCE(created_on, unixepoch()), last_modified
FROM lease_managers;

DROP TABLE lease_managers;
ALTER TABLE lease_managers_new RENAME TO lease_managers;

-- 4. Restore the junction table with proper FK references
CREATE TABLE leases_managers (
  manager_id INTEGER,
  lease_id   INTEGER,
  FOREIGN KEY (manager_id) REFERENCES lease_managers(id),
  FOREIGN KEY (lease_id)   REFERENCES leases(id),
  PRIMARY KEY (manager_id, lease_id)
) STRICT;

INSERT INTO leases_managers SELECT * FROM leases_managers_bak;
DROP TABLE leases_managers_bak;
