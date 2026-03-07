use crate::parser::parse_spreadsheet_from_path;
use crate::spreadsheet::Spreadsheet;

#[tauri::command]
pub fn parse_spreadsheet(path: String) -> Result<Spreadsheet, String> {
    parse_spreadsheet_from_path(&path).map_err(|error| error.to_string())
}
