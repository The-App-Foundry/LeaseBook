use diesel::{prelude::*};

use crate::models::{Lease, LeaseManager, LeasesManagers, NewLease, NewManager, UpdateLease, UpdateManager};

pub fn create_lease(conn: &mut SqliteConnection, name: &str, address: &str) -> Result<Lease, diesel::result::Error> {
  use crate::schema::leases;

  let new_lease = NewLease { 
    name,
    address,
    expiration_date: None,
    notes: None,
    misc_data: None
  };

  diesel::insert_into(leases::table)
    .values(&new_lease)
    .returning(Lease::as_returning())
    .get_result(conn)
}

pub fn create_manager(conn: &mut SqliteConnection, name: &str, lease_id: i32) -> Result<LeaseManager, diesel::result::Error> {
  use crate::schema::lease_managers;
  use crate::schema::leases_managers;

  let new_mgr = NewManager { name };

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

pub fn get_manager(conn: &mut SqliteConnection, manager_id: i32) -> Result<LeaseManager, diesel::result::Error> {
  use crate::schema::lease_managers::dsl::*;

  let manager = lease_managers
    .find(manager_id)
    .select(LeaseManager::as_select())
    .get_result(conn)?;

  Ok(manager)
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

pub fn import_leases(
    conn: &mut SqliteConnection,
    leases: &[crate::property::Lease],
) -> Result<Vec<Lease>, diesel::result::Error> {
    conn.transaction(|conn| {
        leases.iter().map(|lease| {
            let new_lease = NewLease {
                name: &lease.name,
                address: &lease.address,
                expiration_date: lease.expiration_date.map(|dt| dt.timestamp() as i32),
                notes: Some(&lease.notes).filter(|s| !s.is_empty()).map(|s| s.as_str()),
                misc_data: Some(&lease.misc_data).filter(|s| !s.is_empty()).map(|s| s.as_str()),
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