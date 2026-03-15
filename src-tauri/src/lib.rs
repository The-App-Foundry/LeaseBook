mod commands;
mod parser;
mod spreadsheet;
mod property;
mod prop_map;

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
