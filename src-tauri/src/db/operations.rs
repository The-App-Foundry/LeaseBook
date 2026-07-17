use diesel::{prelude::*};

use crate::models::{Lease, LeaseManager, LeasesManagers, NewLease, NewManager, UpdateLease, UpdateManager};

pub fn create_lease(
  conn: &mut SqliteConnection,
  name: &str,
  address: Option<&str>,
  expiration_date: Option<i32>,
  notes: Option<&str>,
  misc_data: Option<&str>,
) -> Result<Lease, diesel::result::Error> {
  use crate::schema::leases;

  let now = std::time::SystemTime::now()
    .duration_since(std::time::UNIX_EPOCH)
    .unwrap_or_default()
    .as_secs() as i32;

  let new_lease = NewLease { 
    name,
    address,
    expiration_date,
    notes,
    misc_data,
    created_on: now,
  };

  diesel::insert_into(leases::table)
    .values(&new_lease)
    .returning(Lease::as_returning())
    .get_result(conn)
}

pub fn create_manager(conn: &mut SqliteConnection, name: &str, lease_id: i32) -> Result<LeaseManager, diesel::result::Error> {
  use crate::schema::lease_managers;
  use crate::schema::leases_managers;

  let now = std::time::SystemTime::now()
    .duration_since(std::time::UNIX_EPOCH)
    .unwrap_or_default()
    .as_secs() as i32;

  let new_mgr = NewManager { name, created_on: now };

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

  Ok(manager)
}

pub fn get_leases(conn: &mut SqliteConnection) -> Result<Vec<crate::models::Lease>, diesel::result::Error> {
  use crate::schema::leases;

  let leases = leases::table
    .select(Lease::as_select())
    .get_results(conn)?;

  Ok(leases)
}

pub fn get_lease(conn: &mut SqliteConnection, lease_id: i32) -> Result<Lease, diesel::result::Error> {
  use crate::schema::leases::dsl::*;

  let lease = leases
    .find(lease_id)
    .select(Lease::as_select())
    .get_result(conn)?;

  Ok(lease)
}

pub fn get_managers(conn: &mut SqliteConnection, lease_id: i32) -> Result<Vec<LeaseManager>, diesel::result::Error> {
  use crate::schema::leases;
  use crate::schema::lease_managers;

  let lease = leases::table
    .find(lease_id)
    .select(Lease::as_select())
    .get_result(conn)?;

  let managers = LeasesManagers::belonging_to(&lease)
    .inner_join(lease_managers::table)
    .select(LeaseManager::as_select())
    .get_results(conn)?;

  Ok(managers)
}

/// Returns all leases paired with their managers in a single call (avoids N+1 queries).
pub fn get_all_leases_with_managers(conn: &mut SqliteConnection) -> Result<Vec<(Lease, Vec<LeaseManager>)>, diesel::result::Error> {
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
      let managers: Vec<LeaseManager> = junctions
        .iter()
        .filter_map(|j| mgr_map.get(&j.manager_id).map(|m| (*m).clone()))
        .collect();
      (lease, managers)
    })
    .collect();

  Ok(result)
}

pub fn get_manager(conn: &mut SqliteConnection, manager_id: i32) -> Result<LeaseManager, diesel::result::Error> {
  use crate::schema::lease_managers::dsl::*;

  let manager = lease_managers
    .find(manager_id)
    .select(LeaseManager::as_select())
    .get_result(conn)?;

  Ok(manager)
}

pub fn get_last_manager_id(conn: &mut SqliteConnection) -> Result<Option<i32>, diesel::result::Error> {
  use crate::schema::lease_managers::dsl::*;
  use diesel::dsl::max;

  lease_managers
    .select(max(id))
    .get_result(conn)
}

pub fn update_lease(conn: &mut SqliteConnection, lease_id: i32, changes: UpdateLease<'_>) -> Result<Lease, diesel::result::Error> {
  use crate::schema::leases::dsl::*;

  diesel::update(leases.find(lease_id))
    .set(changes)
    .returning(Lease::as_returning())
    .get_result(conn)
}

pub fn update_manager(conn: &mut SqliteConnection, manager_id: i32, changes: UpdateManager<'_>) -> Result<LeaseManager, diesel::result::Error> {
  use crate::schema::lease_managers::dsl::*;

  diesel::update(lease_managers.find(manager_id))
    .set(changes)
    .returning(LeaseManager::as_returning())
    .get_result(conn)
}

pub fn delete_lease(conn: &mut SqliteConnection, lease_id: i32) -> Result<usize, diesel::result::Error> {
  use crate::schema::leases;
  use crate::schema::leases_managers;

  conn.transaction(|conn| {
    diesel::delete(
      leases_managers::table
      .filter(
        leases_managers::lease_id
        .eq(lease_id)
      )
    ).execute(conn)?;

    diesel::delete(
      leases::table
      .filter(
        leases::id
        .eq(lease_id)
      )
    ).execute(conn)
  })
}

pub fn prune_manager(conn: &mut SqliteConnection, manager_id: i32) -> Result<(), diesel::result::Error> {
  use crate::schema::lease_managers;
  use crate::schema::leases_managers;

  use diesel::select;
  use diesel::dsl::exists;

  let exists: bool = select(exists(
    leases_managers::table
    .filter(leases_managers::manager_id.eq(manager_id))
  )).get_result(conn)?;

  if !exists {
    diesel::delete(
      lease_managers::table
        .filter(lease_managers::id.eq(manager_id)))
        .execute(conn)?;
  }

  Ok(())
}

pub fn remove_manager(conn: &mut SqliteConnection, lease_id: i32, manager_id: i32) -> Result<usize, diesel::result::Error> {
  use crate::schema::leases_managers;

  conn.transaction(|conn| {
    diesel::delete(
      leases_managers::table
        .filter(leases_managers::lease_id.eq(lease_id))
        .filter(leases_managers::manager_id.eq(manager_id))
    ).execute(conn)
  })
}

pub fn reassign_manager(conn: &mut SqliteConnection, new_lease_id: i32, old_lease_id: i32, manager_id: i32) -> Result<(), diesel::result::Error> {
  use crate::schema::leases_managers;

  conn.transaction(|conn| {
    diesel::delete(
      leases_managers::table
        .filter(leases_managers::manager_id.eq(manager_id))
        .filter(leases_managers::lease_id.eq(old_lease_id))
    )
    .execute(conn)?;

    diesel::insert_into(leases_managers::table)
        .values((
          leases_managers::manager_id.eq(manager_id),
          leases_managers::lease_id.eq(new_lease_id)
        ))
        .execute(conn)?;

    Ok(())
  })
}

pub fn delete_manager(conn: &mut SqliteConnection, manager_id: &i32) -> Result<usize, diesel::result::Error> {
  use crate::schema::lease_managers;
  use crate::schema::leases_managers;

  conn.transaction(|conn| {
    diesel::delete(
      leases_managers::table
        .filter(
          leases_managers::manager_id
          .eq(manager_id)
        )
      ).execute(conn)?;

    diesel::delete(
      lease_managers::table
      .filter(
        lease_managers::id
        .eq(manager_id),
      )
    ).execute(conn)
  })
}

/// Returns the total number of leases in the database.
pub fn count_leases(conn: &mut SqliteConnection, search_query: Option<&str>) -> Result<i64, diesel::result::Error> {
  use crate::schema::leases;
  use diesel::dsl::count_star;

  let mut query = leases::table.into_boxed();

  if let Some(q) = search_query {
    if !q.trim().is_empty() {
      let pattern = format!("%{}%", q);
      query = query.filter(
        leases::name.like(pattern.clone()).or(leases::address.like(pattern))
      );
    }
  }

  query
    .select(count_star())
    .get_result(conn)
}

/// Returns a single page of leases ordered by id.
pub fn get_leases_paginated(
  conn: &mut SqliteConnection,
  limit: i64,
  offset: i64,
  search_query: Option<&str>,
  sort_by: Option<&str>,
) -> Result<Vec<Lease>, diesel::result::Error> {
  use crate::schema::leases;

  let mut query = leases::table.into_boxed();

  if let Some(q) = search_query {
    if !q.trim().is_empty() {
      let pattern = format!("%{}%", q);
      query = query.filter(
        leases::name.like(pattern.clone()).or(leases::address.like(pattern))
      );
    }
  }

  match sort_by {
    Some("name") => query = query.order(leases::name.asc()),
    Some("size") => query = query.order(leases::size.desc()),
    Some("expiration") => query = query.order(leases::expiration_date.asc()),
    _ => query = query.order(leases::id.asc()),
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
  sort_by: Option<&str>,
) -> Result<(Vec<(Lease, Vec<LeaseManager>)>, i64), diesel::result::Error> {
  use crate::schema::lease_managers;

  let total = count_leases(conn, search_query)?;
  let page_leases = get_leases_paginated(conn, limit, offset, search_query, sort_by)?;

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
      let managers: Vec<LeaseManager> = junctions
        .iter()
        .filter_map(|j| mgr_map.get(&j.manager_id).map(|m| (*m).clone()))
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
        leases.iter().map(|lease| {
            let now = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs() as i32;

            let new_lease = NewLease {
                name: &lease.name,
                address: Some(lease.address.as_str()),
                expiration_date: lease.expiration_date.map(|dt| dt.timestamp() as i32),
                notes: Some(&lease.notes).filter(|s| !s.is_empty()).map(|s| s.as_str()),
                misc_data: Some(&lease.misc_data).filter(|s| !s.is_empty()).map(|s| s.as_str()),
                created_on: now,
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
        }).collect()
    })
}