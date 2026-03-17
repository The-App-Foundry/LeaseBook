use std::collections::HashMap;

use serde::Serialize;

use crate::parser::parse_spreadsheet_from_path;
use crate::prop_map::map_spreadsheet_to_leases;
use crate::property::Lease;
use crate::spreadsheet::Spreadsheet;

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
pub fn parse_spreadsheet(path: String) -> Result<SpreadsheetPreview, String> {
    parse_spreadsheet_from_path(&path)
        .map(SpreadsheetPreview::from)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn parse_spreadsheet_to_leases(
    path: String,
    column_mapping: HashMap<String, String>,
    sheet_name: Option<String>,
) -> Result<Vec<Lease>, String> {
    let spreadsheet = parse_spreadsheet_from_path(&path).map_err(|error| error.to_string())?;
    Ok(map_spreadsheet_to_leases(
        &spreadsheet,
        &column_mapping,
        sheet_name.as_deref(),
    ))
}
