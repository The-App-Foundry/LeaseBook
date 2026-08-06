use diesel::prelude::*;

use crate::models::{
    Lease, LeaseManager, LeasesManagers, ManagerWithPrimary, NewLease, NewManager, Stage,
    UpdateLease, UpdateManager,
};

fn current_unix_timestamp() -> i32 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i32
}

pub fn create_lease(
    conn: &mut SqliteConnection,
    name: &str,
    address: Option<&str>,
    expiration_date: Option<i32>,
    notes: Option<&str>,
    misc_data: Option<&str>,
    stage: Stage,
) -> Result<Lease, diesel::result::Error> {
    use crate::schema::leases;

    let now = current_unix_timestamp();

    let new_lease = NewLease {
        name,
        address,
        size: None,
        expiration_date,
        notes,
        misc_data,
        created_on: now,
        stage: stage.as_str(),
    };

    diesel::insert_into(leases::table)
        .values(&new_lease)
        .returning(Lease::as_returning())
        .get_result(conn)
}

pub fn create_manager(
    conn: &mut SqliteConnection,
    name: &str,
    lease_id: i32,
) -> Result<LeaseManager, diesel::result::Error> {
    use crate::schema::lease_managers;
    use crate::schema::leases_managers;
    use diesel::dsl::exists;
    use diesel::select;

    let now = current_unix_timestamp();

    let new_mgr = NewManager {
        name,
        created_on: now,
    };

    let manager = diesel::insert_into(lease_managers::table)
        .values(&new_mgr)
        .returning(LeaseManager::as_returning())
        .get_result(conn)?;

    let manager_id = manager.id;

    diesel::insert_into(leases_managers::table)
        .values((
            leases_managers::lease_id.eq(lease_id),
            leases_managers::manager_id.eq(manager_id),
        ))
        .execute(conn)?;

    // Preserve the invariant the add_manager_primary backfill establishes: a
    // lease that has any managers has exactly one primary. Without this the
    // first manager attached to a lease would leave DECISION MAKER blank.
    let has_primary: bool = select(exists(
        leases_managers::table
            .filter(leases_managers::lease_id.eq(lease_id))
            .filter(leases_managers::is_primary.eq(1)),
    ))
    .get_result(conn)?;

    if !has_primary {
        diesel::update(
            leases_managers::table
                .filter(leases_managers::lease_id.eq(lease_id))
                .filter(leases_managers::manager_id.eq(manager_id)),
        )
        .set(leases_managers::is_primary.eq(1))
        .execute(conn)?;
    }

    Ok(manager)
}

/// Marks `manager_id` as the primary decision maker for `lease_id`, clearing any
/// previous primary for that lease first.
///
/// Both statements run in one transaction, so if the target pair does not exist
/// the clear is rolled back and the lease keeps its previous primary. The
/// `NotFound` surfaces to the frontend as a 404 via `From<DieselError>`.
pub fn set_primary_manager(
    conn: &mut SqliteConnection,
    lease_id: i32,
    manager_id: i32,
) -> Result<(), diesel::result::Error> {
    use crate::schema::leases_managers;

    conn.transaction(|conn| {
        diesel::update(leases_managers::table.filter(leases_managers::lease_id.eq(lease_id)))
            .set(leases_managers::is_primary.eq(0))
            .execute(conn)?;

        let updated = diesel::update(
            leases_managers::table
                .filter(leases_managers::lease_id.eq(lease_id))
                .filter(leases_managers::manager_id.eq(manager_id)),
        )
        .set(leases_managers::is_primary.eq(1))
        .execute(conn)?;

        if updated == 0 {
            return Err(diesel::result::Error::NotFound);
        }

        Ok(())
    })
}

pub fn get_leases(
    conn: &mut SqliteConnection,
) -> Result<Vec<crate::models::Lease>, diesel::result::Error> {
    use crate::schema::leases;

    let leases = leases::table.select(Lease::as_select()).get_results(conn)?;

    Ok(leases)
}

pub fn get_lease(
    conn: &mut SqliteConnection,
    lease_id: i32,
) -> Result<Lease, diesel::result::Error> {
    use crate::schema::leases::dsl::*;

    let lease = leases
        .find(lease_id)
        .select(Lease::as_select())
        .get_result(conn)?;

    Ok(lease)
}

/// Managers for one lease, each carrying its join-row `is_primary` flag.
///
/// Shape must match the managers embedded in `get_paginated_leases_with_managers`
/// — the frontend's `DbManager` type is shared between both call sites.
pub fn get_managers(
    conn: &mut SqliteConnection,
    lease_id: i32,
) -> Result<Vec<ManagerWithPrimary>, diesel::result::Error> {
    use crate::schema::lease_managers;
    use crate::schema::leases;
    use crate::schema::leases_managers;

    let lease = leases::table
        .find(lease_id)
        .select(Lease::as_select())
        .get_result(conn)?;

    // Still one query: the flag is selected alongside the manager row.
    let rows: Vec<(LeaseManager, i32)> = LeasesManagers::belonging_to(&lease)
        .inner_join(lease_managers::table)
        .select((LeaseManager::as_select(), leases_managers::is_primary))
        .get_results(conn)?;

    Ok(rows
        .into_iter()
        .map(|(manager, is_primary)| ManagerWithPrimary {
            manager,
            is_primary,
        })
        .collect())
}

/// Returns all leases paired with their managers in a single call (avoids N+1 queries).
pub fn get_all_leases_with_managers(
    conn: &mut SqliteConnection,
) -> Result<Vec<(Lease, Vec<ManagerWithPrimary>)>, diesel::result::Error> {
    use crate::schema::lease_managers;

    let all_leases = get_leases(conn)?;

    let all_junctions: Vec<LeasesManagers> = LeasesManagers::belonging_to(&all_leases)
        .select(LeasesManagers::as_select())
        .load(conn)?;

    // Collect all unique manager IDs referenced
    let mgr_ids: Vec<i32> = all_junctions.iter().map(|j| j.manager_id).collect();

    let all_managers: Vec<LeaseManager> = lease_managers::table
        .filter(lease_managers::id.eq_any(&mgr_ids))
        .select(LeaseManager::as_select())
        .load(conn)?;

    // Build a map: manager_id -> LeaseManager
    let mgr_map: std::collections::HashMap<i32, &LeaseManager> =
        all_managers.iter().map(|m| (m.id, m)).collect();

    // Group junctions by lease_id
    let junctions_grouped = all_junctions.grouped_by(&all_leases);

    let result = all_leases
        .into_iter()
        .zip(junctions_grouped)
        .map(|(lease, junctions)| {
            // `is_primary` comes off the junction row, not the manager row.
            let managers: Vec<ManagerWithPrimary> = junctions
                .iter()
                .filter_map(|j| {
                    mgr_map.get(&j.manager_id).map(|m| ManagerWithPrimary {
                        manager: (*m).clone(),
                        is_primary: j.is_primary,
                    })
                })
                .collect();
            (lease, managers)
        })
        .collect();

    Ok(result)
}

pub fn get_manager(
    conn: &mut SqliteConnection,
    manager_id: i32,
) -> Result<LeaseManager, diesel::result::Error> {
    use crate::schema::lease_managers::dsl::*;

    let manager = lease_managers
        .find(manager_id)
        .select(LeaseManager::as_select())
        .get_result(conn)?;

    Ok(manager)
}

pub fn get_last_manager_id(
    conn: &mut SqliteConnection,
) -> Result<Option<i32>, diesel::result::Error> {
    use crate::schema::lease_managers::dsl::*;
    use diesel::dsl::max;

    lease_managers.select(max(id)).get_result(conn)
}

pub fn update_lease(
    conn: &mut SqliteConnection,
    lease_id: i32,
    changes: UpdateLease<'_>,
) -> Result<Lease, diesel::result::Error> {
    use crate::schema::leases::dsl::*;

    diesel::update(leases.find(lease_id))
        .set(changes)
        .returning(Lease::as_returning())
        .get_result(conn)
}

pub fn update_manager(
    conn: &mut SqliteConnection,
    manager_id: i32,
    changes: UpdateManager<'_>,
) -> Result<LeaseManager, diesel::result::Error> {
    use crate::schema::lease_managers::dsl::*;

    diesel::update(lease_managers.find(manager_id))
        .set(changes)
        .returning(LeaseManager::as_returning())
        .get_result(conn)
}

pub fn delete_lease(
    conn: &mut SqliteConnection,
    lease_id: i32,
) -> Result<usize, diesel::result::Error> {
    use crate::schema::leases;
    use crate::schema::leases_managers;

    conn.transaction(|conn| {
        diesel::delete(leases_managers::table.filter(leases_managers::lease_id.eq(lease_id)))
            .execute(conn)?;

        diesel::delete(leases::table.filter(leases::id.eq(lease_id))).execute(conn)
    })
}

pub fn prune_manager(
    conn: &mut SqliteConnection,
    manager_id: i32,
) -> Result<(), diesel::result::Error> {
    use crate::schema::lease_managers;
    use crate::schema::leases_managers;

    use diesel::dsl::exists;
    use diesel::select;

    let exists: bool = select(exists(
        leases_managers::table.filter(leases_managers::manager_id.eq(manager_id)),
    ))
    .get_result(conn)?;

    if !exists {
        diesel::delete(lease_managers::table.filter(lease_managers::id.eq(manager_id)))
            .execute(conn)?;
    }

    Ok(())
}

pub fn remove_manager(
    conn: &mut SqliteConnection,
    lease_id: i32,
    manager_id: i32,
) -> Result<usize, diesel::result::Error> {
    use crate::schema::leases_managers;

    conn.transaction(|conn| {
        diesel::delete(
            leases_managers::table
                .filter(leases_managers::lease_id.eq(lease_id))
                .filter(leases_managers::manager_id.eq(manager_id)),
        )
        .execute(conn)
    })
}

pub fn reassign_manager(
    conn: &mut SqliteConnection,
    new_lease_id: i32,
    old_lease_id: i32,
    manager_id: i32,
) -> Result<(), diesel::result::Error> {
    use crate::schema::leases_managers;

    conn.transaction(|conn| {
        diesel::delete(
            leases_managers::table
                .filter(leases_managers::manager_id.eq(manager_id))
                .filter(leases_managers::lease_id.eq(old_lease_id)),
        )
        .execute(conn)?;

        diesel::insert_into(leases_managers::table)
            .values((
                leases_managers::manager_id.eq(manager_id),
                leases_managers::lease_id.eq(new_lease_id),
            ))
            .execute(conn)?;

        Ok(())
    })
}

pub fn delete_manager(
    conn: &mut SqliteConnection,
    manager_id: &i32,
) -> Result<usize, diesel::result::Error> {
    use crate::schema::lease_managers;
    use crate::schema::leases_managers;

    conn.transaction(|conn| {
        diesel::delete(leases_managers::table.filter(leases_managers::manager_id.eq(manager_id)))
            .execute(conn)?;

        diesel::delete(lease_managers::table.filter(lease_managers::id.eq(manager_id)))
            .execute(conn)
    })
}

/// Removes every user-owned record while preserving the migration history and
/// database structure needed to start using the app again.
pub fn clear_all_records(conn: &mut SqliteConnection) -> Result<(), diesel::result::Error> {
    use crate::schema::{lease_managers, leases, leases_managers};

    conn.transaction(|conn| {
        diesel::delete(leases_managers::table).execute(conn)?;
        diesel::delete(lease_managers::table).execute(conn)?;
        diesel::delete(leases::table).execute(conn)?;
        Ok(())
    })
}

/// Per-stage lease counts, one field per filter pill.
///
/// Being a fixed-field struct rather than a map is what guarantees the wire
/// contract's "all seven keys always present" rule: every field serializes
/// whether or not the query returned a row for that stage.
#[derive(Debug, Default, Clone, Copy)]
pub struct StageCounts {
    pub total: i64,
    pub new: i64,
    pub contacted: i64,
    pub qualified: i64,
    pub negotiating: i64,
    pub won: i64,
    pub lost: i64,
}

/// Returns lease counts for every filter pill in a single grouped query,
/// independent of the currently selected stage — so switching the active pill
/// never requires refetching the counts themselves (only the page's `stage`
/// changes; `search_query` is still applied since it narrows the visible set).
pub fn get_stage_counts(
    conn: &mut SqliteConnection,
    search_query: Option<&str>,
) -> Result<StageCounts, diesel::result::Error> {
    use crate::schema::leases;
    use diesel::dsl::count_star;

    let pattern = search_query
        .map(str::trim)
        .filter(|q| !q.is_empty())
        .map(|q| format!("%{}%", q));

    // A GROUP BY clause cannot be boxed in Diesel, so the optional search
    // filter is branched rather than applied to a single boxed query.
    let rows: Vec<(String, i64)> = match pattern {
        Some(pattern) => leases::table
            .filter(
                leases::name
                    .like(pattern.clone())
                    .or(leases::address.like(pattern)),
            )
            .group_by(leases::stage)
            .select((leases::stage, count_star()))
            .load(conn)?,
        None => leases::table
            .group_by(leases::stage)
            .select((leases::stage, count_star()))
            .load(conn)?,
    };

    // GROUP BY only returns rows for stages that have data, so start from a
    // zeroed struct and fill in what came back. Stages with no rows stay 0
    // rather than going missing — FilterBar renders an empty `( )` otherwise.
    let mut counts = StageCounts::default();

    for (stage_value, count) in rows {
        // `total` sums every row, including any value outside the enum, so the
        // "All Properties" pill stays honest.
        counts.total += count;

        match stage_value.parse::<Stage>() {
            Ok(Stage::New) => counts.new += count,
            Ok(Stage::Contacted) => counts.contacted += count,
            Ok(Stage::Qualified) => counts.qualified += count,
            Ok(Stage::Negotiating) => counts.negotiating += count,
            Ok(Stage::Won) => counts.won += count,
            Ok(Stage::Lost) => counts.lost += count,
            // No DB CHECK backs the column, so an unrecognized value is
            // possible. Count it in `total` but drop it rather than erroring.
            Err(_) => {}
        }
    }

    Ok(counts)
}

/// Returns the total number of leases in the database.
pub fn count_leases(
    conn: &mut SqliteConnection,
    search_query: Option<&str>,
    stage: Option<&str>,
) -> Result<i64, diesel::result::Error> {
    use crate::schema::leases;
    use diesel::dsl::count_star;

    let mut query = leases::table.into_boxed();

    if let Some(q) = search_query {
        if !q.trim().is_empty() {
            let pattern = format!("%{}%", q);
            query = query.filter(
                leases::name
                    .like(pattern.clone())
                    .or(leases::address.like(pattern)),
            );
        }
    }

    if let Some(raw) = stage.map(str::trim).filter(|s| !s.is_empty()) {
        // An unparseable stage canonicalizes to a value no row can hold (the
        // column is NOT NULL and only ever written from `Stage`), so a contract
        // violation surfaces as an empty result set instead of silently
        // returning every lease the way the old `_ => {}` arm did.
        let canonical = raw.parse::<Stage>().map(Stage::as_str).unwrap_or("");
        query = query.filter(leases::stage.eq(canonical));
    }

    query.select(count_star()).get_result(conn)
}

/// Returns a single page of leases ordered by id.
pub fn get_leases_paginated(
    conn: &mut SqliteConnection,
    limit: i64,
    offset: i64,
    search_query: Option<&str>,
    stage: Option<&str>,
    sort_by: Option<&str>,
    sort_direction: Option<&str>,
) -> Result<Vec<Lease>, diesel::result::Error> {
    use crate::schema::leases;
    use diesel::dsl::sql;
    use diesel::sql_types::Bool;

    let mut query = leases::table.into_boxed();

    if let Some(q) = search_query {
        if !q.trim().is_empty() {
            let pattern = format!("%{}%", q);
            query = query.filter(
                leases::name
                    .like(pattern.clone())
                    .or(leases::address.like(pattern)),
            );
        }
    }

    if let Some(raw) = stage.map(str::trim).filter(|s| !s.is_empty()) {
        // See `count_leases`: unparseable stages match nothing rather than
        // everything, keeping the two functions' totals in agreement.
        let canonical = raw.parse::<Stage>().map(Stage::as_str).unwrap_or("");
        query = query.filter(leases::stage.eq(canonical));
    }

    let is_descending = matches!(sort_direction, Some("desc"));

    match (sort_by, is_descending) {
        (Some("name"), true) => {
            query = query.order((sql::<Bool>("trim(name) = ''").asc(), leases::name.desc()))
        }
        (Some("name"), false) => {
            query = query.order((sql::<Bool>("trim(name) = ''").asc(), leases::name.asc()))
        }
        (Some("size"), true) => query = query.order(leases::size.desc()),
        (Some("size"), false) => query = query.order(leases::size.asc()),
        (Some("expiration"), true) => query = query.order(leases::expiration_date.desc()),
        (Some("expiration"), false) => query = query.order(leases::expiration_date.asc()),
        (_, true) => query = query.order(leases::id.desc()),
        (_, false) => query = query.order(leases::id.asc()),
    }

    query
        .select(Lease::as_select())
        .limit(limit)
        .offset(offset)
        .get_results(conn)
}

/// Returns one page of leases paired with their managers, plus the total lease count.
pub fn get_paginated_leases_with_managers(
    conn: &mut SqliteConnection,
    limit: i64,
    offset: i64,
    search_query: Option<&str>,
    stage: Option<&str>,
    sort_by: Option<&str>,
    sort_direction: Option<&str>,
) -> Result<(Vec<(Lease, Vec<ManagerWithPrimary>)>, i64), diesel::result::Error> {
    use crate::schema::lease_managers;

    let total = count_leases(conn, search_query, stage)?;
    let page_leases = get_leases_paginated(
        conn,
        limit,
        offset,
        search_query,
        stage,
        sort_by,
        sort_direction,
    )?;

    if page_leases.is_empty() {
        return Ok((vec![], total));
    }

    let all_junctions: Vec<LeasesManagers> = LeasesManagers::belonging_to(&page_leases)
        .select(LeasesManagers::as_select())
        .load(conn)?;

    let mgr_ids: Vec<i32> = all_junctions.iter().map(|j| j.manager_id).collect();

    let all_managers: Vec<LeaseManager> = lease_managers::table
        .filter(lease_managers::id.eq_any(&mgr_ids))
        .select(LeaseManager::as_select())
        .load(conn)?;

    let mgr_map: std::collections::HashMap<i32, &LeaseManager> =
        all_managers.iter().map(|m| (m.id, m)).collect();

    let junctions_grouped = all_junctions.grouped_by(&page_leases);

    let result = page_leases
        .into_iter()
        .zip(junctions_grouped)
        .map(|(lease, junctions)| {
            // `is_primary` comes off the junction row, not the manager row.
            let managers: Vec<ManagerWithPrimary> = junctions
                .iter()
                .filter_map(|j| {
                    mgr_map.get(&j.manager_id).map(|m| ManagerWithPrimary {
                        manager: (*m).clone(),
                        is_primary: j.is_primary,
                    })
                })
                .collect();
            (lease, managers)
        })
        .collect();

    Ok((result, total))
}

pub fn import_leases(
    conn: &mut SqliteConnection,
    leases: &[crate::property::Lease],
) -> Result<Vec<Lease>, diesel::result::Error> {
    conn.transaction(|conn| {
        leases
            .iter()
            .map(|lease| {
                let now = current_unix_timestamp();

                let new_lease = NewLease {
                    name: &lease.name,
                    address: Some(lease.address.as_str()),
                    size: lease.size.as_ref(),
                    expiration_date: lease.expiration_date.map(|dt| dt.timestamp() as i32),
                    notes: Some(&lease.notes)
                        .filter(|s| !s.is_empty())
                        .map(|s| s.as_str()),
                    misc_data: Some(&lease.misc_data)
                        .filter(|s| !s.is_empty())
                        .map(|s| s.as_str()),
                    created_on: now,
                    // Imports land at the top of the pipeline. `property::Lease`
                    // carries no stage and the import command takes none, so
                    // this is fixed rather than plumbed through the parser.
                    stage: Stage::New.as_str(),
                };
                let db_lease = diesel::insert_into(crate::schema::leases::table)
                    .values(&new_lease)
                    .returning(Lease::as_returning())
                    .get_result(conn)?;

                // Insert manager if present
                if !lease.lease_manager.name.is_empty() {
                    create_manager(conn, &lease.lease_manager.name, db_lease.id)?;
                    // optionally update phone/email on the returned manager
                }
                Ok(db_lease)
            })
            .collect()
    })
}
