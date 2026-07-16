mod commands;
mod parser;
mod spreadsheet;
mod property;
mod prop_map;
mod db;

pub mod models;
pub mod schema;

use diesel::r2d2::{self, ConnectionManager};
use diesel::sqlite::SqliteConnection;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use std::fs;
use tauri::Manager;

#[cfg(test)]
mod parser_tests;

#[cfg(test)]
mod prop_map_tests;

pub type DbPool = r2d2::Pool<ConnectionManager<SqliteConnection>>;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let app_data = app.path().app_data_dir()
                .expect("failed to resolve app data directory");
            fs::create_dir_all(&app_data)
                .expect("failed to create app data directory");

            let db_path = app_data.join("database.sqlite");
            let db_url = db_path.to_string_lossy().to_string();

            let pool = establish_pool(&db_url);

            // Run embedded migrations on startup
            let mut conn = pool.get().expect("failed to get DB connection for migrations");
            conn.run_pending_migrations(MIGRATIONS)
                .expect("failed to run database migrations");

            app.manage(pool);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::new_lease,
            commands::new_manager,
            commands::lease,
            commands::leases,
            commands::manager,
            commands::managers,
            commands::edit_lease,
            commands::edit_manager,
            commands::move_manager,
            commands::last_manager_id,
            commands::unassign_manager,
            commands::prune,
            commands::delete,
            commands::remove_lease,
            commands::parse_spreadsheet,
            commands::parse_spreadsheet_to_leases,
            commands::import_parsed_leases,
            commands::leases_with_managers,
            commands::leases_with_managers_paginated
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

pub fn establish_pool(db_url: &str) -> DbPool {
  let manager = ConnectionManager::<SqliteConnection>::new(db_url);

  r2d2::Pool::builder()
    .build(manager)
    .expect("Error creating database connection pool.")
}
