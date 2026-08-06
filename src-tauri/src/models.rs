use std::fmt;
use std::str::FromStr;

use diesel::prelude::*;
use serde::{Deserialize, Serialize};

/// The six pipeline stages a lease can occupy.
///
/// The backing column is plain SQLite `TEXT` with no `CHECK` constraint —
/// `ALTER TABLE ADD COLUMN` cannot carry one — so this enum is the single
/// point of enforcement. Values are canonically **lowercase** on the wire and
/// in the database; display casing happens only at render time in the frontend.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Stage {
    #[default]
    New,
    Contacted,
    Qualified,
    Negotiating,
    Won,
    Lost,
}

impl Stage {
    pub const ALL: [Stage; 6] = [
        Stage::New,
        Stage::Contacted,
        Stage::Qualified,
        Stage::Negotiating,
        Stage::Won,
        Stage::Lost,
    ];

    pub fn as_str(self) -> &'static str {
        match self {
            Stage::New => "new",
            Stage::Contacted => "contacted",
            Stage::Qualified => "qualified",
            Stage::Negotiating => "negotiating",
            Stage::Won => "won",
            Stage::Lost => "lost",
        }
    }
}

impl fmt::Display for Stage {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

/// Returned when a caller supplies a stage outside the six-value enum.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParseStageError(pub String);

impl fmt::Display for ParseStageError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "unknown lease stage '{}'; expected one of: new, contacted, qualified, negotiating, won, lost",
            self.0
        )
    }
}

impl std::error::Error for ParseStageError {}

impl FromStr for Stage {
    type Err = ParseStageError;

    /// Parsing is tolerant of surrounding whitespace and casing so that a
    /// display-cased value (`"Contacted"`) round-trips to the canonical
    /// lowercase form rather than being rejected. Only the canonical lowercase
    /// form is ever *written* back out.
    fn from_str(value: &str) -> Result<Self, Self::Err> {
        match value.trim().to_ascii_lowercase().as_str() {
            "new" => Ok(Stage::New),
            "contacted" => Ok(Stage::Contacted),
            "qualified" => Ok(Stage::Qualified),
            "negotiating" => Ok(Stage::Negotiating),
            "won" => Ok(Stage::Won),
            "lost" => Ok(Stage::Lost),
            _ => Err(ParseStageError(value.to_string())),
        }
    }
}

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
    pub last_modified: Option<i32>,
    pub stage: String,
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
    pub last_modified: Option<i32>,
}

#[derive(Identifiable, Selectable, Queryable, Associations, Debug, Insertable)]
#[diesel(belongs_to(Lease, foreign_key = lease_id))]
#[diesel(belongs_to(LeaseManager, foreign_key = manager_id))]
#[diesel(table_name = crate::schema::leases_managers)]
#[diesel(primary_key(lease_id, manager_id))]
pub struct LeasesManagers {
    pub lease_id: i32,
    pub manager_id: i32,
    pub is_primary: i32,
}

/// A manager as it appears inside a per-lease payload.
///
/// `is_primary` is a property of the *join row*, not of the manager — the same
/// manager can be primary for one lease and not another — so it is projected on
/// here at assembly time rather than living on [`LeaseManager`].
#[derive(Serialize, Debug, Clone, PartialEq)]
pub struct ManagerWithPrimary {
    #[serde(flatten)]
    pub manager: LeaseManager,
    pub is_primary: i32,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::leases)]
pub struct NewLease<'a> {
    pub name: &'a str,
    pub address: Option<&'a str>,
    pub size: Option<&'a i32>,
    pub expiration_date: Option<i32>,
    pub notes: Option<&'a str>,
    pub misc_data: Option<&'a str>,
    pub created_on: i32,
    pub stage: &'a str,
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
    pub last_modified: Option<&'a i32>,
    pub stage: Option<&'a str>,
}

#[derive(AsChangeset)]
#[diesel(table_name = crate::schema::lease_managers)]
pub struct UpdateManager<'a> {
    pub phone_numbers: Option<&'a str>,
    pub email: Option<&'a str>,
    pub last_modified: Option<&'a i32>,
    pub name: Option<&'a str>,
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
    pub stage: Option<String>,
}

/// Owned equivalent of [`UpdateManager`] used as a Tauri command argument.
#[derive(Deserialize)]
pub struct UpdateManagerInput {
    pub phone_numbers: Option<String>,
    pub email: Option<String>,
    pub last_modified: Option<i32>,
    pub name: Option<String>,
}
