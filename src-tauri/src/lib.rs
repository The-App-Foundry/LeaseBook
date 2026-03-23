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
use dotenvy::dotenv;
use std::env;

#[cfg(test)]
mod parser_tests;

#[cfg(test)]
mod prop_map_tests;

pub type DbPool = r2d2::Pool<ConnectionManager<SqliteConnection>>;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db_pool = establish_pool();

    tauri::Builder::default()
        .manage(db_pool)
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
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
            commands::unassign_manager,
            commands::delete_manager,
            commands::remove_lease,
            commands::parse_spreadsheet,
            commands::parse_spreadsheet_to_leases
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

pub fn establish_pool() -> DbPool {
  dotenv().ok();

  let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set.");
  let manager = ConnectionManager::<SqliteConnection>::new(db_url);

  r2d2::Pool::builder()
    .build(manager)
    .expect("Error creating database connection pool.")
}
