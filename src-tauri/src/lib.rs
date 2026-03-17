mod commands;
mod parser;
mod spreadsheet;
mod property;
mod prop_map;

pub mod models;
pub mod schema;

use diesel::{prelude::*};
use dotenvy::dotenv;
use std::env;

use self::models::{NewLease, Lease, NewManager, LeaseManager};

#[cfg(test)]
mod parser_tests;

#[cfg(test)]
mod prop_map_tests;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::parse_spreadsheet,
            commands::parse_spreadsheet_to_leases
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

pub fn establish_connection() -> SqliteConnection {
  dotenv().ok();

  let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set.");

  SqliteConnection::establish(&db_url)
    .unwrap_or_else(|_| panic!("Error connecting to {}", db_url))
}

pub fn create_lease(conn: &mut SqliteConnection, name: &str, address: &str) -> Lease {
  use crate::schema::leases;

  let new_lease = NewLease { name, address };

  diesel::insert_into(leases::table)
    .values(&new_lease)
    .returning(Lease::as_returning())
    .get_result(conn)
    .expect("Error saving new lease.")
}

pub fn create_manager(conn: &mut SqliteConnection, name: &str) -> LeaseManager {
  use crate::schema::lease_managers;

  let new_mgr = NewManager { name };

  diesel::insert_into(lease_managers::table)
    .values(&new_mgr)
    .returning(LeaseManager::as_returning())
    .get_result(conn)
    .expect("Error saving new manager.")
}

pub fn get_leases(conn: &mut SqliteConnection) -> Result<Vec<models::Lease>, diesel::result::Error> {
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

pub fn get_managers(conn: &mut SqliteConnection, lease_id: &i32) -> Result<Vec<models::LeaseManager>, diesel::result::Error> {
  use crate::schema::leases;
  use crate::schema::lease_managers;

  let lease = leases::table
    .find(lease_id)
    .select(models::Lease::as_select())
    .get_result(conn)?;

  let managers = models::LeasesManagers::belonging_to(&lease)
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

pub fn update_lease(conn: &mut SqliteConnection, lease_id: i32, changes: models::UpdateLease<'_>) -> Result<models::Lease, diesel::result::Error> {
  use crate::schema::leases::dsl::*;

  diesel::update(leases.find(lease_id))
    .set(changes)
    .returning(models::Lease::as_returning())
    .get_result(conn)
}

pub fn update_manager(conn: &mut SqliteConnection, manager_id: i32, changes: models::UpdateManager<'_>) -> Result<models::LeaseManager, diesel::result::Error> {
  use crate::schema::lease_managers::dsl::*;

  diesel::update(lease_managers.find(manager_id))
    .set(changes)
    .returning(models::LeaseManager::as_returning())
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