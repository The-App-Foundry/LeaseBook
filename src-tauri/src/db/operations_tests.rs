use super::operations::*;
use diesel::sqlite::SqliteConnection;
use diesel::prelude::*;
use diesel_migrations::MigrationHarness;
use crate::MIGRATIONS;

fn setup_db() -> SqliteConnection {
    let mut conn = SqliteConnection::establish(":memory:").unwrap();
    conn.run_pending_migrations(MIGRATIONS).unwrap();
    conn
}

#[test]
fn test_create_and_get_lease() {
    let mut conn = setup_db();
    let lease = create_lease(&mut conn, "Test Lease", Some("123 Main St"), None, None, None).unwrap();
    
    let fetched = get_lease(&mut conn, lease.id).unwrap();
    assert_eq!(fetched.name, "Test Lease");
    assert_eq!(fetched.address.as_deref(), Some("123 Main St"));
}

#[test]
fn test_search_leases() {
    let mut conn = setup_db();
    create_lease(&mut conn, "Apple Store", Some("1 Cupertino Way"), None, None, None).unwrap();
    create_lease(&mut conn, "Microsoft Store", Some("1 Redmond Way"), None, None, None).unwrap();
    
    let count_all = count_leases(&mut conn, None).unwrap();
    assert_eq!(count_all, 2);
    
    let count_apple = count_leases(&mut conn, Some("Apple")).unwrap();
    assert_eq!(count_apple, 1);
    
    let results = get_leases_paginated(&mut conn, 10, 0, Some("Redmond"), None).unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].name, "Microsoft Store");
}

#[test]
fn test_manager_assignment() {
    let mut conn = setup_db();
    let lease = create_lease(&mut conn, "Manager Test Lease", None, None, None, None).unwrap();
    let manager = create_manager(&mut conn, "John Doe", lease.id).unwrap();
    
    let managers = get_managers(&mut conn, lease.id).unwrap();
    assert_eq!(managers.len(), 1);
    assert_eq!(managers[0].name, "John Doe");
}
