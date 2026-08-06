use super::operations::*;
use crate::MIGRATIONS;
use crate::models::{Lease, Stage, UpdateLease};
use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use diesel_migrations::MigrationHarness;

fn setup_db() -> SqliteConnection {
    let mut conn = SqliteConnection::establish(":memory:").unwrap();
    conn.run_pending_migrations(MIGRATIONS).unwrap();
    conn
}

/// Creates a lease with only a name and a stage — the fields most stage tests
/// care about.
fn seed_stage(conn: &mut SqliteConnection, name: &str, stage: Stage) -> Lease {
    create_lease(conn, name, None, None, None, None, stage).unwrap()
}

/// Returns `(manager_id, is_primary)` for a lease, ordered by manager id.
fn junction_rows(conn: &mut SqliteConnection, lease_id: i32) -> Vec<(i32, i32)> {
    use crate::schema::leases_managers;

    leases_managers::table
        .filter(leases_managers::lease_id.eq(lease_id))
        .select((leases_managers::manager_id, leases_managers::is_primary))
        .order(leases_managers::manager_id.asc())
        .load(conn)
        .unwrap()
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
        Stage::New,
    )
    .unwrap();

    let fetched = get_lease(&mut conn, lease.id).unwrap();
    assert_eq!(fetched.name, "Test Lease");
    assert_eq!(fetched.address.as_deref(), Some("123 Main St"));
    assert_eq!(fetched.stage, "new");
}

#[test]
fn clear_all_records_removes_leases_managers_and_relationships() {
    let mut conn = setup_db();
    let lease = seed_stage(&mut conn, "Clear me", Stage::New);
    let manager = create_manager(&mut conn, "Clear manager", lease.id).unwrap();

    clear_all_records(&mut conn).unwrap();

    assert_eq!(count_leases(&mut conn, None, None).unwrap(), 0);
    assert!(get_lease(&mut conn, lease.id).is_err());
    assert!(get_manager(&mut conn, manager.id).is_err());
    assert!(junction_rows(&mut conn, lease.id).is_empty());
}

#[test]
fn test_create_lease_persists_stage() {
    let mut conn = setup_db();

    for stage in Stage::ALL {
        let lease = seed_stage(&mut conn, "Staged", stage);
        let fetched = get_lease(&mut conn, lease.id).unwrap();
        assert_eq!(fetched.stage, stage.as_str());
    }
}

#[test]
fn test_update_lease_persists_stage() {
    let mut conn = setup_db();
    let lease = seed_stage(&mut conn, "Movable", Stage::New);

    let changes = UpdateLease {
        name: None,
        address: None,
        size: None,
        expiration_date: None,
        notes: None,
        misc_data: None,
        last_modified: None,
        stage: Some(Stage::Won.as_str()),
    };

    let updated = update_lease(&mut conn, lease.id, changes).unwrap();
    assert_eq!(updated.stage, "won");
    assert_eq!(get_lease(&mut conn, lease.id).unwrap().stage, "won");
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
        Stage::New,
    )
    .unwrap();
    create_lease(
        &mut conn,
        "Microsoft Store",
        Some("1 Redmond Way"),
        None,
        None,
        None,
        Stage::New,
    )
    .unwrap();

    let count_all = count_leases(&mut conn, None, None).unwrap();
    assert_eq!(count_all, 2);

    let count_apple = count_leases(&mut conn, Some("Apple"), None).unwrap();
    assert_eq!(count_apple, 1);

    let results =
        get_leases_paginated(&mut conn, 10, 0, Some("Redmond"), None, None, None).unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].name, "Microsoft Store");
}

#[test]
fn test_name_sort_places_blank_company_names_last() {
    let mut conn = setup_db();
    create_lease(
        &mut conn,
        "",
        Some("1 Empty Way"),
        None,
        None,
        None,
        Stage::New,
    )
    .unwrap();
    create_lease(
        &mut conn,
        "Beta Office",
        Some("2 Beta Way"),
        None,
        None,
        None,
        Stage::New,
    )
    .unwrap();
    create_lease(
        &mut conn,
        "Acme Office",
        Some("3 Acme Way"),
        None,
        None,
        None,
        Stage::New,
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
    create_lease(
        &mut conn,
        "",
        Some("1 Empty Way"),
        None,
        None,
        None,
        Stage::New,
    )
    .unwrap();
    create_lease(
        &mut conn,
        "Beta Office",
        Some("2 Beta Way"),
        None,
        None,
        None,
        Stage::New,
    )
    .unwrap();
    create_lease(
        &mut conn,
        "Acme Office",
        Some("3 Acme Way"),
        None,
        None,
        None,
        Stage::New,
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
fn test_stage_filter_round_trips_every_stage() {
    let mut conn = setup_db();

    // Distinct population per stage so a mixed-up filter is visible in counts.
    let expected = [
        (Stage::New, 1_usize),
        (Stage::Contacted, 2),
        (Stage::Qualified, 3),
        (Stage::Negotiating, 4),
        (Stage::Won, 5),
        (Stage::Lost, 6),
    ];

    for (stage, n) in expected {
        for i in 0..n {
            seed_stage(&mut conn, &format!("{stage}-{i}"), stage);
        }
    }

    let total: usize = expected.iter().map(|(_, n)| n).sum();
    assert_eq!(count_leases(&mut conn, None, None).unwrap(), total as i64);

    for (stage, n) in expected {
        let filter = stage.as_str();

        let counted = count_leases(&mut conn, None, Some(filter)).unwrap();
        let page = get_leases_paginated(&mut conn, 100, 0, None, Some(filter), None, None).unwrap();

        assert_eq!(counted, n as i64, "count_leases mismatch for {stage}");
        assert_eq!(page.len(), n, "get_leases_paginated mismatch for {stage}");

        // count_leases and get_leases_paginated must agree, or pagination
        // renders page counts that disagree with the rows on screen.
        assert_eq!(counted, page.len() as i64, "disagreement for {stage}");

        // Every returned row actually carries the requested stage.
        assert!(
            page.iter().all(|lease| lease.stage == filter),
            "leaked a foreign stage into the {stage} filter"
        );
    }
}

#[test]
fn test_stage_filter_accepts_display_casing() {
    let mut conn = setup_db();
    seed_stage(&mut conn, "A", Stage::Contacted);
    seed_stage(&mut conn, "B", Stage::Qualified);

    // The wire contract mandates lowercase, but `Stage::from_str` is tolerant so
    // a display-cased value canonicalizes rather than silently matching nothing.
    for filter in ["contacted", "Contacted", "  CONTACTED  "] {
        assert_eq!(
            count_leases(&mut conn, None, Some(filter)).unwrap(),
            1,
            "casing variant {filter:?} did not canonicalize"
        );
    }
}

#[test]
fn test_unknown_stage_matches_nothing_rather_than_everything() {
    let mut conn = setup_db();
    seed_stage(&mut conn, "A", Stage::New);
    seed_stage(&mut conn, "B", Stage::Won);

    // The old `_ => {}` arm returned every lease for an unrecognized stage,
    // silently showing an unfiltered list. It must now return nothing.
    assert_eq!(count_leases(&mut conn, None, Some("banana")).unwrap(), 0);
    assert_eq!(
        get_leases_paginated(&mut conn, 10, 0, None, Some("banana"), None, None)
            .unwrap()
            .len(),
        0
    );

    // An empty/whitespace stage means "no filter", matching the search guard.
    assert_eq!(count_leases(&mut conn, None, Some("   ")).unwrap(), 2);
}

#[test]
fn test_get_stage_counts_groups_by_real_stage_column() {
    let mut conn = setup_db();

    seed_stage(&mut conn, "n1", Stage::New);
    seed_stage(&mut conn, "c1", Stage::Contacted);
    seed_stage(&mut conn, "c2", Stage::Contacted);
    seed_stage(&mut conn, "q1", Stage::Qualified);
    seed_stage(&mut conn, "g1", Stage::Negotiating);
    seed_stage(&mut conn, "g2", Stage::Negotiating);
    seed_stage(&mut conn, "g3", Stage::Negotiating);
    seed_stage(&mut conn, "w1", Stage::Won);
    seed_stage(&mut conn, "l1", Stage::Lost);

    let counts = get_stage_counts(&mut conn, None).unwrap();

    assert_eq!(counts.new, 1);
    assert_eq!(counts.contacted, 2);
    assert_eq!(counts.qualified, 1);
    assert_eq!(counts.negotiating, 3);
    assert_eq!(counts.won, 1);
    assert_eq!(counts.lost, 1);
    assert_eq!(counts.total, 9);

    // Total is the sum of the pills, so the "All" pill stays honest.
    let summed = counts.new
        + counts.contacted
        + counts.qualified
        + counts.negotiating
        + counts.won
        + counts.lost;
    assert_eq!(counts.total, summed);
}

#[test]
fn test_get_stage_counts_zero_fills_absent_stages() {
    let mut conn = setup_db();

    // Seed ONLY qualified. GROUP BY returns a single row, so the other five
    // stages have no row at all — they must still come back as 0.
    seed_stage(&mut conn, "q1", Stage::Qualified);
    seed_stage(&mut conn, "q2", Stage::Qualified);

    let counts = get_stage_counts(&mut conn, None).unwrap();

    assert_eq!(counts.qualified, 2);
    assert_eq!(counts.total, 2);

    assert_eq!(counts.new, 0, "new must be 0, never absent");
    assert_eq!(counts.contacted, 0, "contacted must be 0, never absent");
    assert_eq!(counts.negotiating, 0, "negotiating must be 0, never absent");
    assert_eq!(counts.won, 0, "won must be 0, never absent");
    assert_eq!(counts.lost, 0, "lost must be 0, never absent");
}

#[test]
fn test_get_stage_counts_respects_search_filter() {
    let mut conn = setup_db();

    create_lease(
        &mut conn,
        "Acme Holdings",
        Some("1 Acme Way"),
        None,
        None,
        None,
        Stage::Won,
    )
    .unwrap();
    create_lease(
        &mut conn,
        "Beta Holdings",
        Some("2 Beta Way"),
        None,
        None,
        None,
        Stage::Won,
    )
    .unwrap();
    create_lease(
        &mut conn,
        "Acme Storage",
        Some("3 Acme Way"),
        None,
        None,
        None,
        Stage::Lost,
    )
    .unwrap();

    let counts = get_stage_counts(&mut conn, Some("Acme")).unwrap();

    assert_eq!(counts.won, 1);
    assert_eq!(counts.lost, 1);
    assert_eq!(counts.total, 2);
    assert_eq!(counts.qualified, 0);
}

#[test]
fn test_manager_assignment() {
    let mut conn = setup_db();
    let lease = create_lease(
        &mut conn,
        "Manager Test Lease",
        None,
        None,
        None,
        None,
        Stage::New,
    )
    .unwrap();
    let _manager = create_manager(&mut conn, "John Doe", lease.id).unwrap();

    let managers = get_managers(&mut conn, lease.id).unwrap();
    assert_eq!(managers.len(), 1);
    assert_eq!(managers[0].manager.name, "John Doe");
    // `get_managers` backs the `managers` command, which shares the frontend's
    // `DbManager` type with the paginated payload — so it must carry the flag too.
    assert_eq!(managers[0].is_primary, 1);
}

/// KNOWN GAP — documents current behavior, not desired behavior.
///
/// `create_manager` promotes the first manager so a lease with managers always
/// has a primary, but `remove_manager` and `reassign_manager` delete the join
/// row without reassigning the flag. Removing the primary therefore leaves the
/// lease with managers and no primary, and DECISION MAKER renders blank — the
/// state the add_manager_primary backfill existed to eliminate.
///
/// If this test starts failing, the gap was fixed: assert the new invariant
/// (exactly one primary remains) instead of deleting the test.
#[test]
fn test_removing_the_primary_manager_currently_orphans_the_flag() {
    let mut conn = setup_db();
    let lease = seed_stage(&mut conn, "Orphan", Stage::New);

    let first = create_manager(&mut conn, "First", lease.id).unwrap();
    let second = create_manager(&mut conn, "Second", lease.id).unwrap();
    assert_eq!(
        junction_rows(&mut conn, lease.id),
        vec![(first.id, 1), (second.id, 0)]
    );

    remove_manager(&mut conn, lease.id, first.id).unwrap();

    let remaining = junction_rows(&mut conn, lease.id);
    assert_eq!(remaining, vec![(second.id, 0)]);
    assert_eq!(
        remaining
            .iter()
            .filter(|(_, primary)| *primary == 1)
            .count(),
        0,
        "lease still has a manager but no primary — see doc comment"
    );
}

#[test]
fn test_first_manager_becomes_primary_and_later_ones_do_not() {
    let mut conn = setup_db();
    let lease = seed_stage(&mut conn, "Primary Test", Stage::New);

    let first = create_manager(&mut conn, "First", lease.id).unwrap();
    assert_eq!(junction_rows(&mut conn, lease.id), vec![(first.id, 1)]);

    let second = create_manager(&mut conn, "Second", lease.id).unwrap();
    assert_eq!(
        junction_rows(&mut conn, lease.id),
        vec![(first.id, 1), (second.id, 0)],
        "adding a second manager must not steal primary"
    );
}

#[test]
fn test_set_primary_manager_moves_the_flag_and_is_idempotent() {
    let mut conn = setup_db();
    let lease = seed_stage(&mut conn, "Primary Move", Stage::New);

    let first = create_manager(&mut conn, "First", lease.id).unwrap();
    let second = create_manager(&mut conn, "Second", lease.id).unwrap();

    // Promote the second: it is set, and the previous primary is cleared.
    set_primary_manager(&mut conn, lease.id, second.id).unwrap();
    assert_eq!(
        junction_rows(&mut conn, lease.id),
        vec![(first.id, 0), (second.id, 1)]
    );

    // Idempotent: repeating leaves exactly one primary, still the second.
    set_primary_manager(&mut conn, lease.id, second.id).unwrap();
    assert_eq!(
        junction_rows(&mut conn, lease.id),
        vec![(first.id, 0), (second.id, 1)]
    );

    // And it can move back.
    set_primary_manager(&mut conn, lease.id, first.id).unwrap();
    assert_eq!(
        junction_rows(&mut conn, lease.id),
        vec![(first.id, 1), (second.id, 0)]
    );
}

#[test]
fn test_set_primary_manager_errors_on_unlinked_pair_without_clearing() {
    let mut conn = setup_db();
    let lease = seed_stage(&mut conn, "Lease A", Stage::New);
    let other_lease = seed_stage(&mut conn, "Lease B", Stage::New);

    let mine = create_manager(&mut conn, "Mine", lease.id).unwrap();
    let theirs = create_manager(&mut conn, "Theirs", other_lease.id).unwrap();

    // Manager exists, but is not linked to this lease.
    assert!(set_primary_manager(&mut conn, lease.id, theirs.id).is_err());

    // Manager does not exist at all.
    assert!(set_primary_manager(&mut conn, lease.id, 999_999).is_err());

    // The transaction rolled back, so the original primary survives both.
    assert_eq!(junction_rows(&mut conn, lease.id), vec![(mine.id, 1)]);
}

/// Pins the JSON both tracks implement against (`.claude/list-view-wire-contract.md`).
/// A mismatch between the Rust and TypeScript tracks otherwise surfaces at
/// runtime, not at compile time.
#[test]
fn test_wire_contract_json_shape() {
    let mut conn = setup_db();
    let lease = create_lease(
        &mut conn,
        "Acme Corp",
        Some("123 Main St"),
        Some(1_793_827_200),
        Some("<p>html</p>"),
        None,
        Stage::Qualified,
    )
    .unwrap();
    let manager = create_manager(&mut conn, "Jane Doe", lease.id).unwrap();

    let (rows, total_count) =
        get_paginated_leases_with_managers(&mut conn, 10, 0, None, None, None, None).unwrap();
    let (returned_lease, managers) = rows.into_iter().next().unwrap();

    let payload = crate::commands::PaginatedResponse {
        leases: vec![crate::commands::LeaseWithManagers {
            lease: returned_lease,
            managers,
        }],
        total_count,
    };

    let json = serde_json::to_value(&payload).unwrap();
    println!(
        "leases_with_managers_paginated => {}",
        serde_json::to_string_pretty(&json).unwrap()
    );

    let row = &json["leases"][0];
    // Lease fields are flattened onto the row, not nested under "lease".
    assert_eq!(row["id"], lease.id);
    assert_eq!(row["name"], "Acme Corp");
    assert_eq!(row["address"], "123 Main St");
    assert_eq!(row["expiration_date"], 1_793_827_200_i64);
    assert_eq!(row["notes"], "<p>html</p>");
    assert!(row["size"].is_null());
    assert!(row["misc_data"].is_null());
    assert_eq!(row["stage"], "qualified");
    assert_eq!(json["total_count"], 1);

    let mgr = &row["managers"][0];
    assert_eq!(mgr["id"], manager.id);
    assert_eq!(mgr["name"], "Jane Doe");
    assert!(mgr["phone_numbers"].is_null());
    assert!(mgr["email"].is_null());
    // Integer 0/1, not a JSON bool.
    assert_eq!(mgr["is_primary"], 1);
    assert!(mgr["is_primary"].is_number());

    let counts = get_stage_counts(&mut conn, None).unwrap();
    let counts_json = serde_json::to_value(crate::commands::StageCountsResponse {
        total: counts.total,
        new: counts.new,
        contacted: counts.contacted,
        qualified: counts.qualified,
        negotiating: counts.negotiating,
        won: counts.won,
        lost: counts.lost,
    })
    .unwrap();
    println!(
        "lease_stage_counts => {}",
        serde_json::to_string(&counts_json).unwrap()
    );

    // All seven keys must be present even though only `qualified` has rows.
    for key in [
        "total",
        "new",
        "contacted",
        "qualified",
        "negotiating",
        "won",
        "lost",
    ] {
        assert!(
            counts_json.get(key).is_some(),
            "stage counts payload is missing '{key}'"
        );
    }
    assert_eq!(counts_json["qualified"], 1);
    assert_eq!(counts_json["new"], 0);
}

#[test]
fn test_paginated_payload_carries_is_primary_from_the_join_row() {
    let mut conn = setup_db();
    let lease = seed_stage(&mut conn, "Payload", Stage::Qualified);

    let first = create_manager(&mut conn, "First", lease.id).unwrap();
    let second = create_manager(&mut conn, "Second", lease.id).unwrap();
    set_primary_manager(&mut conn, lease.id, second.id).unwrap();

    let (rows, total) =
        get_paginated_leases_with_managers(&mut conn, 10, 0, None, None, None, None).unwrap();

    assert_eq!(total, 1);
    let (returned_lease, managers) = &rows[0];
    assert_eq!(returned_lease.stage, "qualified");
    assert_eq!(managers.len(), 2);

    let flag = |id: i32| {
        managers
            .iter()
            .find(|m| m.manager.id == id)
            .map(|m| m.is_primary)
            .unwrap()
    };
    assert_eq!(flag(first.id), 0);
    assert_eq!(flag(second.id), 1);
}
