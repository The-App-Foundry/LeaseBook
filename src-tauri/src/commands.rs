use std::collections::HashMap;

use serde::Serialize;
use tauri::State;

use crate::DbPool;
use crate::db::operations::*;
use crate::error::{AppError, CommandResult, ErrorResponse};
use crate::models::{
    Lease as DbLease, LeaseManager, UpdateLease, UpdateLeaseInput, UpdateManager,
    UpdateManagerInput,
};
use crate::parser::parse_spreadsheet_from_path;
use crate::prop_map::map_spreadsheet_to_leases;
use crate::property::Lease;
use crate::spreadsheet::Spreadsheet;

fn pool_error(error: impl std::fmt::Display) -> ErrorResponse {
    AppError::internal(error.to_string()).into()
}

#[derive(Serialize)]
pub struct SpreadsheetPreview {
    pub sheets: Vec<SheetPreview>,
}

#[derive(Serialize)]
pub struct SheetPreview {
    pub name: String,
    pub headers: Vec<String>,
}

impl From<Spreadsheet> for SpreadsheetPreview {
    fn from(spreadsheet: Spreadsheet) -> Self {
        Self {
            sheets: spreadsheet
                .sheets
                .into_iter()
                .map(|sheet| SheetPreview {
                    name: sheet.name,
                    headers: sheet.headers,
                })
                .collect(),
        }
    }
}

#[tauri::command]
pub fn parse_spreadsheet(path: String) -> CommandResult<SpreadsheetPreview> {
    parse_spreadsheet_from_path(&path)
        .map(SpreadsheetPreview::from)
        .map_err(Into::into)
}

#[tauri::command]
pub fn parse_spreadsheet_to_leases(
    path: String,
    column_mapping: HashMap<String, String>,
    sheet_name: Option<String>,
) -> CommandResult<Vec<Lease>> {
    let spreadsheet = parse_spreadsheet_from_path(&path)?;
    Ok(map_spreadsheet_to_leases(
        &spreadsheet,
        &column_mapping,
        sheet_name.as_deref(),
    ))
}

#[tauri::command]
pub fn new_lease(
    pool: State<'_, DbPool>,
    name: String,
    address: Option<String>,
    expiration_date: Option<i32>,
    notes: Option<String>,
    size: Option<String>,
) -> CommandResult<DbLease> {
    let mut conn = pool.get().map_err(pool_error)?;

    create_lease(
        &mut conn,
        &name,
        address.as_deref(),
        expiration_date,
        notes.as_deref(),
        size.as_deref(),
    )
    .map_err(Into::into)
}

#[tauri::command]
pub fn new_manager(
    pool: State<'_, DbPool>,
    name: String,
    lease_id: i32,
) -> CommandResult<LeaseManager> {
    let mut conn = pool.get().map_err(pool_error)?;

    create_manager(&mut conn, &name, lease_id).map_err(Into::into)
}

#[tauri::command]
pub fn lease(pool: State<'_, DbPool>, lease_id: i32) -> CommandResult<DbLease> {
    let mut conn = pool.get().map_err(pool_error)?;

    get_lease(&mut conn, lease_id).map_err(Into::into)
}

#[tauri::command]
pub fn leases(pool: State<'_, DbPool>) -> CommandResult<Vec<DbLease>> {
    let mut conn = pool.get().map_err(pool_error)?;

    get_leases(&mut conn).map_err(Into::into)
}

#[derive(Serialize)]
pub struct LeaseWithManagers {
    #[serde(flatten)]
    pub lease: DbLease,
    pub managers: Vec<LeaseManager>,
}

#[tauri::command]
pub fn leases_with_managers(pool: State<'_, DbPool>) -> CommandResult<Vec<LeaseWithManagers>> {
    let mut conn = pool.get().map_err(pool_error)?;
    let rows = get_all_leases_with_managers(&mut conn)?;
    Ok(rows
        .into_iter()
        .map(|(lease, managers)| LeaseWithManagers { lease, managers })
        .collect())
}

#[derive(Serialize)]
pub struct PaginatedResponse {
    pub leases: Vec<LeaseWithManagers>,
    pub total_count: i64,
}

#[tauri::command]
pub fn leases_with_managers_paginated(
    pool: State<'_, DbPool>,
    page: i64,
    page_size: i64,
    search_query: Option<String>,
    stage: Option<String>,
    sort_by: Option<String>,
    sort_direction: Option<String>,
) -> CommandResult<PaginatedResponse> {
    if page < 1 {
        return Err(AppError::validation("page must be greater than zero").into());
    }

    if page_size < 1 {
        return Err(AppError::validation("page_size must be greater than zero").into());
    }

    let mut conn = pool.get().map_err(pool_error)?;
    let offset = (page - 1) * page_size;
    let (rows, total_count) = get_paginated_leases_with_managers(
        &mut conn,
        page_size,
        offset,
        search_query.as_deref(),
        stage.as_deref(),
        sort_by.as_deref(),
        sort_direction.as_deref(),
    )?;
    let leases = rows
        .into_iter()
        .map(|(lease, managers)| LeaseWithManagers { lease, managers })
        .collect();
    Ok(PaginatedResponse {
        leases,
        total_count,
    })
}

#[tauri::command]
pub fn manager(pool: State<'_, DbPool>, manager_id: i32) -> CommandResult<LeaseManager> {
    let mut conn = pool.get().map_err(pool_error)?;

    get_manager(&mut conn, manager_id).map_err(Into::into)
}

#[tauri::command]
pub fn managers(pool: State<'_, DbPool>, lease_id: i32) -> CommandResult<Vec<LeaseManager>> {
    let mut conn = pool.get().map_err(pool_error)?;

    get_managers(&mut conn, lease_id).map_err(Into::into)
}

#[tauri::command]
pub fn last_manager_id(pool: State<'_, DbPool>) -> CommandResult<Option<i32>> {
    let mut conn = pool.inner().get().map_err(pool_error)?;

    get_last_manager_id(&mut conn).map_err(Into::into)
}

#[tauri::command]
pub fn edit_lease(
    pool: State<'_, DbPool>,
    lease_id: i32,
    changes: UpdateLeaseInput,
) -> CommandResult<DbLease> {
    let mut conn = pool.get().map_err(pool_error)?;
    let diesel_changes = UpdateLease {
        name: changes.name.as_deref(),
        address: changes.address.as_deref(),
        size: changes.size.as_ref(),
        expiration_date: changes.expiration_date.as_ref(),
        notes: changes.notes.as_deref(),
        misc_data: changes.misc_data.as_deref(),
        last_modified: changes.last_modified.as_ref(),
    };
    update_lease(&mut conn, lease_id, diesel_changes).map_err(Into::into)
}

#[tauri::command]
pub fn edit_manager(
    pool: State<'_, DbPool>,
    manager_id: i32,
    changes: UpdateManagerInput,
) -> CommandResult<LeaseManager> {
    let mut conn = pool.get().map_err(pool_error)?;
    let diesel_changes = UpdateManager {
        phone_numbers: changes.phone_numbers.as_deref(),
        email: changes.email.as_deref(),
        last_modified: changes.last_modified.as_ref(),
        name: changes.name.as_deref(),
    };
    update_manager(&mut conn, manager_id, diesel_changes).map_err(Into::into)
}

#[tauri::command]
pub fn unassign_manager(
    pool: State<'_, DbPool>,
    lease_id: i32,
    manager_id: i32,
) -> CommandResult<()> {
    let mut conn = pool.get().map_err(pool_error)?;

    remove_manager(&mut conn, lease_id, manager_id)?;

    Ok(())
}

#[tauri::command]
pub fn move_manager(
    pool: State<'_, DbPool>,
    old_lease_id: i32,
    new_lease_id: i32,
    manager_id: i32,
) -> CommandResult<()> {
    let mut conn = pool.get().map_err(pool_error)?;

    reassign_manager(&mut conn, new_lease_id, old_lease_id, manager_id)?;

    Ok(())
}

#[tauri::command]
pub fn prune(pool: State<'_, DbPool>, manager_id: i32) -> CommandResult<()> {
    let mut conn = pool.get().map_err(pool_error)?;

    prune_manager(&mut conn, manager_id)?;

    Ok(())
}

#[tauri::command]
pub fn remove_lease(pool: State<'_, DbPool>, lease_id: i32) -> CommandResult<()> {
    let mut conn = pool.get().map_err(pool_error)?;

    delete_lease(&mut conn, lease_id)?;

    Ok(())
}

#[tauri::command]
pub fn delete(pool: State<'_, DbPool>, manager_id: i32) -> CommandResult<()> {
    let mut conn = pool.get().map_err(pool_error)?;

    delete_manager(&mut conn, &manager_id)?;

    Ok(())
}

#[tauri::command]
pub fn import_parsed_leases(
    pool: State<'_, DbPool>,
    leases: Vec<crate::property::Lease>,
) -> CommandResult<Vec<crate::models::Lease>> {
    let mut conn = pool.get().map_err(pool_error)?;

    import_leases(&mut conn, &leases).map_err(Into::into)
}
