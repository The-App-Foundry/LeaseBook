mod commands;
mod parser;
mod spreadsheet;

#[cfg(test)]
mod parser_tests;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![commands::parse_spreadsheet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
