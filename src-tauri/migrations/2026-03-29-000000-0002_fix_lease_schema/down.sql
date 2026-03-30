-- Revert: restore UNIQUE on address, remove DEFAULT from created_on.
CREATE TABLE leases_managers_bak AS SELECT * FROM leases_managers;
DROP TABLE leases_managers;

CREATE TABLE leases_old (
  id              INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name            TEXT    NOT NULL,
  address         TEXT    NOT NULL UNIQUE,
  expiration_date INTEGER,
  notes           TEXT,
  misc_data       TEXT,
  created_on      INTEGER NOT NULL,
  last_modified   INTEGER
) STRICT;

INSERT INTO leases_old (id, name, address, expiration_date, notes, misc_data, created_on, last_modified)
SELECT id, name, address, expiration_date, notes, misc_data, created_on, last_modified
FROM leases;

DROP TABLE leases;
ALTER TABLE leases_old RENAME TO leases;

CREATE TABLE lease_managers_old (
  id            INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  phone_numbers TEXT,
  email         TEXT UNIQUE,
  created_on    INTEGER NOT NULL,
  last_modified INTEGER
) STRICT;

INSERT INTO lease_managers_old (id, name, phone_numbers, email, created_on, last_modified)
SELECT id, name, phone_numbers, email, created_on, last_modified
FROM lease_managers;

DROP TABLE lease_managers;
ALTER TABLE lease_managers_old RENAME TO lease_managers;

CREATE TABLE leases_managers (
  manager_id INTEGER,
  lease_id   INTEGER,
  FOREIGN KEY (manager_id) REFERENCES lease_managers(id),
  FOREIGN KEY (lease_id)   REFERENCES leases(id),
  PRIMARY KEY (manager_id, lease_id)
) STRICT;

INSERT INTO leases_managers SELECT * FROM leases_managers_bak;
DROP TABLE leases_managers_bak;
