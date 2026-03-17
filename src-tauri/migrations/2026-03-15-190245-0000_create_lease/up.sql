PRAGMA foreign_keys = ON;

CREATE TABLE lease_managers (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone_numbers TEXT,
  email TEXT UNIQUE
) STRICT;

CREATE TABLE leases (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL UNIQUE,
  expiration_date INTEGER,
  notes TEXT,
  misc_data TEXT
) STRICT;

CREATE TABLE leases_managers (
  manager_id INTEGER,
  lease_id INTEGER,
  FOREIGN KEY (manager_id) REFERENCES lease_managers(id),
  FOREIGN KEY (lease_id) REFERENCES leases(id),
  PRIMARY KEY (manager_id, lease_id)
) STRICT;