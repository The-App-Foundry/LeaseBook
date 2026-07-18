use super::operations::*;
use crate::MIGRATIONS;
use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use diesel_migrations::MigrationHarness;

fn setup_db() -> SqliteConnection {
    let mut conn = SqliteConnection::establish(":memory:").unwrap();
    conn.run_pending_migrations(MIGRATIONS).unwrap();
    conn
}

#[test]
fn test_create_and_get_lease() {
    let mut conn = setup_db();
    let lease = create_lease(
        &mut conn,
        "Test Lease",
        Some("123 Main St"),
        None,
        None,
        None,
    )
    .unwrap();

    let fetched = get_lease(&mut conn, lease.id).unwrap();
    assert_eq!(fetched.name, "Test Lease");
    assert_eq!(fetched.address.as_deref(), Some("123 Main St"));
}

#[test]
fn test_search_leases() {
    let mut conn = setup_db();
    create_lease(
        &mut conn,
        "Apple Store",
        Some("1 Cupertino Way"),
        None,
        None,
        None,
    )
    .unwrap();
    create_lease(
        &mut conn,
        "Microsoft Store",
        Some("1 Redmond Way"),
        None,
        None,
        None,
    )
    .unwrap();

    let count_all = count_leases(&mut conn, None, None).unwrap();
    assert_eq!(count_all, 2);

    let count_apple = count_leases(&mut conn, Some("Apple"), None).unwrap();
    assert_eq!(count_apple, 1);

    let results = get_leases_paginated(&mut conn, 10, 0, Some("Redmond"), None, None, None).unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].name, "Microsoft Store");
}

#[test]
fn test_name_sort_places_blank_company_names_last() {
    let mut conn = setup_db();
    create_lease(&mut conn, "", Some("1 Empty Way"), None, None, None).unwrap();
    create_lease(
        &mut conn,
        "Beta Office",
        Some("2 Beta Way"),
        None,
        None,
        None,
    )
    .unwrap();
    create_lease(
        &mut conn,
        "Acme Office",
        Some("3 Acme Way"),
        None,
        None,
        None,
    )
    .unwrap();

    let results = get_leases_paginated(&mut conn, 10, 0, None, None, Some("name"), None).unwrap();

    assert_eq!(
        results
            .iter()
            .map(|lease| lease.name.as_str())
            .collect::<Vec<_>>(),
        vec!["Acme Office", "Beta Office", "",]
    );
}

#[test]
fn test_name_sort_can_descend_while_placing_blank_company_names_last() {
    let mut conn = setup_db();
    create_lease(&mut conn, "", Some("1 Empty Way"), None, None, None).unwrap();
    create_lease(
        &mut conn,
        "Beta Office",
        Some("2 Beta Way"),
        None,
        None,
        None,
    )
    .unwrap();
    create_lease(
        &mut conn,
        "Acme Office",
        Some("3 Acme Way"),
        None,
        None,
        None,
    )
    .unwrap();

    let results =
        get_leases_paginated(&mut conn, 10, 0, None, None, Some("name"), Some("desc")).unwrap();

    assert_eq!(
        results
            .iter()
            .map(|lease| lease.name.as_str())
            .collect::<Vec<_>>(),
        vec!["Beta Office", "Acme Office", "",]
    );
}

#[test]
fn test_stage_filter_uses_derived_expiration_status() {
    let mut conn = setup_db();
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs() as i32;

    create_lease(
        &mut conn,
        "Expired Office",
        Some("1 Past Way"),
        Some(now - 86_400),
        None,
        None,
    )
    .unwrap();
    create_lease(
        &mut conn,
        "Active Office",
        Some("1 Future Way"),
        Some(now + 86_400),
        None,
        None,
    )
    .unwrap();
    create_lease(
        &mut conn,
        "No Expiration Office",
        Some("1 Open Way"),
        None,
        None,
        None,
    )
    .unwrap();

    let contacted = get_leases_paginated(&mut conn, 10, 0, None, Some("Contacted"), None, None)
        .unwrap();
    let qualified = get_leases_paginated(&mut conn, 10, 0, None, Some("Qualified"), None, None)
        .unwrap();

    assert_eq!(
        contacted
            .iter()
            .map(|lease| lease.name.as_str())
            .collect::<Vec<_>>(),
        vec!["Expired Office"]
    );
    assert_eq!(
        qualified
            .iter()
            .map(|lease| lease.name.as_str())
            .collect::<Vec<_>>(),
        vec!["Active Office", "No Expiration Office"]
    );
}

#[test]
fn test_manager_assignment() {
    let mut conn = setup_db();
    let lease = create_lease(&mut conn, "Manager Test Lease", None, None, None, None).unwrap();
    let _manager = create_manager(&mut conn, "John Doe", lease.id).unwrap();

    let managers = get_managers(&mut conn, lease.id).unwrap();
    assert_eq!(managers.len(), 1);
    assert_eq!(managers[0].name, "John Doe");
}
