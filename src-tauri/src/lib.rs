mod auth;
mod commands;
mod db;
mod error;
mod logging;
mod parser;
mod passkey_browser;
mod prop_map;
mod property;
mod spreadsheet;

pub mod models;
pub mod schema;

use diesel::r2d2::{self, ConnectionManager};
use diesel::sqlite::SqliteConnection;
use diesel_migrations::{EmbeddedMigrations, MigrationHarness, embed_migrations};
use std::fs;
use tauri::Manager;

#[cfg(test)]
mod parser_tests;

#[cfg(test)]
mod prop_map_tests;

#[cfg(test)]
mod error_tests;

#[cfg(test)]
mod auth_tests;

pub type DbPool = r2d2::Pool<ConnectionManager<SqliteConnection>>;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let app_data = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data directory");
            fs::create_dir_all(&app_data).expect("failed to create app data directory");
            let log_guard =
                logging::init(&app_data).expect("failed to initialize application logging");
            tracing::info!(
                log_dir = %logging::log_dir(&app_data).display(),
                "application logging initialized"
            );
            let auth_manager = auth::AuthManager::new(auth::auth_file_path(&app_data));

            let db_path = app_data.join("database.sqlite");
            let db_url = db_path.to_string_lossy().to_string();

            let pool = establish_pool(&db_url);

            // Run embedded migrations on startup
            let mut conn = pool
                .get()
                .expect("failed to get DB connection for migrations");
            conn.run_pending_migrations(MIGRATIONS)
                .expect("failed to run database migrations");
            tracing::info!("database migrations completed");

            app.manage(log_guard);
            app.manage(auth_manager);
            app.manage(pool);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::auth_status,
            commands::create_auth_password,
            commands::change_auth_password,
            commands::disable_auth_password,
            commands::start_passkey_registration,
            commands::finish_passkey_registration,
            commands::browser_passkey_registration,
            commands::disable_auth_passkeys,
            commands::auth_login,
            commands::start_passkey_login,
            commands::finish_passkey_login,
            commands::browser_passkey_login,
            commands::auth_logout,
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
