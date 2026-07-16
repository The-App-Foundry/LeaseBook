use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Selectable, Identifiable, PartialEq, Debug, Serialize)]
#[diesel(table_name = crate::schema::leases)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Lease {
  pub id: i32,
  pub name: String,
  pub address: Option<String>,
  pub size: Option<i32>,
  pub expiration_date: Option<i32>,
  pub notes: Option<String>,
  pub misc_data: Option<String>,
  pub created_on: i32,
  pub last_modified: Option<i32>
}

#[derive(Queryable, Selectable, Identifiable, PartialEq, Debug, Serialize, Clone)]
#[diesel(table_name = crate::schema::lease_managers)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct LeaseManager {
  pub id: i32,
  pub name: String,
  pub phone_numbers: Option<String>,
  pub email: Option<String>,
  pub created_on: i32,
  pub last_modified: Option<i32>
}

#[derive(Identifiable, Selectable, Queryable, Associations, Debug, Insertable)]
#[diesel(belongs_to(Lease, foreign_key = lease_id))]
#[diesel(belongs_to(LeaseManager, foreign_key = manager_id))]
#[diesel(table_name = crate::schema::leases_managers)]
#[diesel(primary_key(lease_id, manager_id))]
pub struct LeasesManagers {
  pub lease_id: i32,
  pub manager_id: i32
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::leases)]
pub struct NewLease<'a> {
  pub name: &'a str,
  pub address: Option<&'a str>,
  pub expiration_date: Option<i32>,
  pub notes: Option<&'a str>,
  pub misc_data: Option<&'a str>,
  pub created_on: i32,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::lease_managers)]
pub struct NewManager<'a> {
  pub name: &'a str,
  pub created_on: i32,
}

#[derive(AsChangeset)]
#[diesel(table_name = crate::schema::leases)]
pub struct UpdateLease<'a> {
  pub name: Option<&'a str>,
  pub address: Option<&'a str>,
  pub size: Option<&'a i32>,
  pub expiration_date: Option<&'a i32>,
  pub notes: Option<&'a str>,
  pub misc_data: Option<&'a str>,
  pub last_modified: Option<&'a i32>
}

#[derive(AsChangeset)]
#[diesel(table_name = crate::schema::lease_managers)]
pub struct UpdateManager<'a> {
  pub phone_numbers: Option<&'a str>,
  pub email: Option<&'a str>,
  pub last_modified: Option<&'a i32>,
  pub name: Option<&'a str>
}

/// Owned equivalent of [`UpdateLease`] used as a Tauri command argument.
#[derive(Deserialize)]
pub struct UpdateLeaseInput {
  pub name: Option<String>,
  pub address: Option<String>,
  pub size: Option<i32>,
  pub expiration_date: Option<i32>,
  pub notes: Option<String>,
  pub misc_data: Option<String>,
  pub last_modified: Option<i32>,
}

/// Owned equivalent of [`UpdateManager`] used as a Tauri command argument.
#[derive(Deserialize)]
pub struct UpdateManagerInput {
  pub phone_numbers: Option<String>,
  pub email: Option<String>,
  pub last_modified: Option<i32>,
  pub name: Option<String>,
}