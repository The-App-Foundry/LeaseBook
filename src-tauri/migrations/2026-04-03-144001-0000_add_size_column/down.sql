-- Back up the join table so we can drop the FK dependency
CREATE TABLE leases_managers_bak AS SELECT * FROM leases_managers;
DROP TABLE leases_managers;

-- Rebuild leases without size
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
SELECT id, name, address, expiration_date, notes, misc_data, created_on, last_modified
FROM leases;

DROP TABLE leases;
ALTER TABLE leases_new RENAME TO leases;

-- Restore the join table with FKs
CREATE TABLE leases_managers (
  manager_id INTEGER,
  lease_id   INTEGER,
  FOREIGN KEY (manager_id) REFERENCES lease_managers(id),
  FOREIGN KEY (lease_id)   REFERENCES leases(id),
  PRIMARY KEY (manager_id, lease_id)
) STRICT;

INSERT INTO leases_managers SELECT * FROM leases_managers_bak;
DROP TABLE leases_managers_bak;