#![cfg(test)]

use std::fs;
use std::time::{SystemTime, UNIX_EPOCH};

use rust_xlsxwriter::{ExcelDateTime, Format, Workbook};

use crate::parser::{
    MAX_IMPORT_CELL_TEXT_CHARS, MAX_IMPORT_COLUMNS, MAX_IMPORT_DATA_ROWS, MAX_IMPORT_FILE_BYTES,
    MAX_IMPORT_SHEETS, ParserError, parse_spreadsheet_from_path,
};
use crate::spreadsheet::Cell;

#[test]
fn parses_complex_workbook_from_unknown_extension() {
    let file_path = build_complex_workbook_file();
    let parsed = parse_spreadsheet_from_path(&file_path)
        .expect("parser should detect and read workbook with unknown extension");

    assert_eq!(parsed.sheets.len(), 2);

    let leases_sheet = parsed
        .sheets
        .iter()
        .find(|sheet| sheet.name == "Leases")
        .expect("Leases sheet should exist");

    assert_eq!(
        leases_sheet.headers,
        vec!["Property", "Rent", "Active", "StartDate"]
    );
    assert_eq!(leases_sheet.rows.len(), 2);
    assert!(matches!(leases_sheet.rows[0].cells[0], Cell::String(ref v) if v == "Sunset Villas"));
    assert!(matches!(leases_sheet.rows[0].cells[1], Cell::Float(v) if (v - 1250.75).abs() < 0.001));
    assert!(matches!(leases_sheet.rows[0].cells[2], Cell::Bool(true)));
    assert!(matches!(leases_sheet.rows[0].cells[3], Cell::Date(_)));
    assert!(matches!(leases_sheet.rows[1].cells[2], Cell::Bool(false)));

    let metadata_sheet = parsed
        .sheets
        .iter()
        .find(|sheet| sheet.name == "Metadata")
        .expect("Metadata sheet should exist");

    assert_eq!(metadata_sheet.headers, vec!["Version", "v0.1.0"]);
    assert_eq!(metadata_sheet.rows.len(), 1);
    assert!(matches!(metadata_sheet.rows[0].cells[0], Cell::String(ref v) if v == "Records"));
    assert!(matches!(metadata_sheet.rows[0].cells[1], Cell::Float(v) if (v - 42.0).abs() < 0.001));

    fs::remove_file(file_path).expect("test workbook should be removed");
}

#[test]
fn returns_open_workbook_error_for_non_spreadsheet_bytes() {
    let file_path = unique_temp_path("invalid-spreadsheet", "bin");
    fs::write(&file_path, b"not an excel file").expect("invalid bytes should be written");

    let result = parse_spreadsheet_from_path(&file_path);
    assert!(
        matches!(result, Err(ParserError::OpenWorkbook(_))),
        "expected OpenWorkbook error for invalid spreadsheet bytes"
    );

    fs::remove_file(file_path).expect("invalid workbook should be removed");
}

#[test]
fn returns_open_workbook_error_for_missing_file() {
    let missing_file = unique_temp_path("missing-spreadsheet", "xlsx");
    let result = parse_spreadsheet_from_path(&missing_file);

    assert!(
        matches!(result, Err(ParserError::OpenWorkbook(_))),
        "expected OpenWorkbook error for missing file path"
    );
}

#[test]
fn rejects_spreadsheets_larger_than_import_limit() {
    let file_path = unique_temp_path("oversized-spreadsheet", "xlsx");
    fs::write(&file_path, vec![0; MAX_IMPORT_FILE_BYTES as usize + 1])
        .expect("oversized bytes should be written");

    let result = parse_spreadsheet_from_path(&file_path);
    assert!(
        matches!(result, Err(ParserError::InputLimit(_))),
        "expected InputLimit error for oversized spreadsheet"
    );

    fs::remove_file(file_path).expect("oversized workbook should be removed");
}

#[test]
fn rejects_spreadsheets_with_too_many_sheets() {
    let mut workbook = Workbook::new();

    for index in 0..=MAX_IMPORT_SHEETS {
        let sheet = workbook.add_worksheet();
        sheet
            .set_name(format!("Sheet{index}"))
            .expect("sheet name should be valid");
        sheet
            .write_string(0, 0, "Property")
            .expect("write string should succeed");
    }

    let bytes = workbook
        .save_to_buffer()
        .expect("workbook should serialize to bytes");
    let file_path = unique_temp_path("too-many-sheets", "xlsx");
    fs::write(&file_path, bytes).expect("workbook bytes should be written");

    let result = parse_spreadsheet_from_path(&file_path);
    assert!(
        matches!(result, Err(ParserError::InputLimit(_))),
        "expected InputLimit error for spreadsheet with too many sheets"
    );

    fs::remove_file(file_path).expect("test workbook should be removed");
}

#[test]
fn rejects_spreadsheets_with_too_many_columns() {
    let mut workbook = Workbook::new();
    let sheet = workbook.add_worksheet();
    sheet
        .set_name("TooManyColumns")
        .expect("sheet name should be valid");

    for column in 0..=MAX_IMPORT_COLUMNS as u16 {
        sheet
            .write_string(0, column, "Property")
            .expect("write string should succeed");
    }

    let bytes = workbook
        .save_to_buffer()
        .expect("workbook should serialize to bytes");
    let file_path = unique_temp_path("too-many-columns", "xlsx");
    fs::write(&file_path, bytes).expect("workbook bytes should be written");

    let result = parse_spreadsheet_from_path(&file_path);
    assert!(
        matches!(result, Err(ParserError::InputLimit(_))),
        "expected InputLimit error for spreadsheet with too many columns"
    );

    fs::remove_file(file_path).expect("test workbook should be removed");
}

#[test]
fn rejects_spreadsheets_with_too_many_data_rows() {
    let mut workbook = Workbook::new();
    let sheet = workbook.add_worksheet();
    sheet
        .set_name("TooManyRows")
        .expect("sheet name should be valid");
    sheet
        .write_string(0, 0, "Property")
        .expect("write string should succeed");

    for row in 1..=(MAX_IMPORT_DATA_ROWS as u32 + 1) {
        sheet
            .write_string(row, 0, "Sunset Villas")
            .expect("write string should succeed");
    }

    let bytes = workbook
        .save_to_buffer()
        .expect("workbook should serialize to bytes");
    let file_path = unique_temp_path("too-many-rows", "xlsx");
    fs::write(&file_path, bytes).expect("workbook bytes should be written");

    let result = parse_spreadsheet_from_path(&file_path);
    assert!(
        matches!(result, Err(ParserError::InputLimit(_))),
        "expected InputLimit error for spreadsheet with too many rows"
    );

    fs::remove_file(file_path).expect("test workbook should be removed");
}

#[test]
fn rejects_spreadsheets_with_cell_text_longer_than_import_limit() {
    let mut workbook = Workbook::new();
    let sheet = workbook.add_worksheet();
    sheet
        .set_name("TooMuchText")
        .expect("sheet name should be valid");
    sheet
        .write_string(0, 0, "Property")
        .expect("write string should succeed");
    sheet
        .write_string(1, 0, "A".repeat(MAX_IMPORT_CELL_TEXT_CHARS + 1))
        .expect("write string should succeed");

    let bytes = workbook
        .save_to_buffer()
        .expect("workbook should serialize to bytes");
    let file_path = unique_temp_path("too-much-text", "xlsx");
    fs::write(&file_path, bytes).expect("workbook bytes should be written");

    let result = parse_spreadsheet_from_path(&file_path);
    assert!(
        matches!(result, Err(ParserError::InputLimit(_))),
        "expected InputLimit error for spreadsheet with too much cell text"
    );

    fs::remove_file(file_path).expect("test workbook should be removed");
}

#[test]
fn sanitizes_imported_text_and_formula_like_values() {
    let mut workbook = Workbook::new();
    let sheet = workbook.add_worksheet();
    sheet
        .set_name("Sanitize")
        .expect("sheet name should be valid");
    sheet
        .write_string(0, 0, "Property\0\nName")
        .expect("write string should succeed");
    sheet
        .write_string(0, 1, "Notes")
        .expect("write string should succeed");
    sheet
        .write_string(1, 0, "=cmd|' /C calc'!A0")
        .expect("write string should succeed");
    sheet
        .write_string(1, 1, "Line one\u{0007}\r\n\tLine two")
        .expect("write string should succeed");

    let bytes = workbook
        .save_to_buffer()
        .expect("workbook should serialize to bytes");
    let file_path = unique_temp_path("sanitize-text", "xlsx");
    fs::write(&file_path, bytes).expect("workbook bytes should be written");

    let parsed = parse_spreadsheet_from_path(&file_path).expect("parser should sanitize workbook");
    let sheet = parsed
        .sheets
        .iter()
        .find(|sheet| sheet.name == "Sanitize")
        .expect("sheet should exist");

    assert_eq!(sheet.headers, vec!["Property\nName", "Notes"]);
    assert!(
        matches!(sheet.rows[0].cells[0], Cell::String(ref value) if value == "'=cmd|' /C calc'!A0")
    );
    assert!(
        matches!(sheet.rows[0].cells[1], Cell::String(ref value) if value == "Line one\n\tLine two")
    );

    fs::remove_file(file_path).expect("test workbook should be removed");
}

#[test]
fn prefers_top_text_header_over_late_dense_data_row() {
    let mut workbook = Workbook::new();
    let sheet = workbook.add_worksheet();
    sheet
        .set_name("Imported")
        .expect("sheet name should be valid");

    sheet
        .write_string(1, 0, "Property")
        .expect("write string should succeed");
    sheet
        .write_string(1, 1, "Address")
        .expect("write string should succeed");
    sheet
        .write_string(1, 2, "Manager")
        .expect("write string should succeed");

    sheet
        .write_string(2, 0, "Sunset Villas")
        .expect("write string should succeed");
    sheet
        .write_string(2, 1, "120 Maple Ave")
        .expect("write string should succeed");
    sheet
        .write_string(2, 2, "Alicia Gomez")
        .expect("write string should succeed");

    // Simulate a very dense data row much later in the sheet.
    for col in 0..20 {
        sheet
            .write_number(2767, col, f64::from(col))
            .expect("write number should succeed");
    }

    let bytes = workbook
        .save_to_buffer()
        .expect("workbook should serialize to bytes");

    let file_path = unique_temp_path("header-detection", "xlsx");
    fs::write(&file_path, bytes).expect("workbook bytes should be written");

    let parsed = parse_spreadsheet_from_path(&file_path).expect("parser should parse workbook");
    let imported = parsed
        .sheets
        .iter()
        .find(|s| s.name == "Imported")
        .expect("sheet should exist");

    assert_eq!(imported.headers, vec!["Property", "Address", "Manager"]);
    assert!(
        imported.rows.iter().any(|row| {
            matches!(row.cells.first(), Some(Cell::String(value)) if value == "Sunset Villas")
        }),
        "expected parsed data rows to start after the detected header"
    );

    fs::remove_file(file_path).expect("test workbook should be removed");
}

fn build_complex_workbook_file() -> std::path::PathBuf {
    let mut workbook = Workbook::new();

    let leases = workbook.add_worksheet();
    leases
        .set_name("Leases")
        .expect("sheet name should be valid");
    leases
        .write_string(0, 0, "Property")
        .expect("write string should succeed");
    leases
        .write_string(0, 1, "Rent")
        .expect("write string should succeed");
    leases
        .write_string(0, 2, "Active")
        .expect("write string should succeed");
    leases
        .write_string(0, 3, "StartDate")
        .expect("write string should succeed");

    leases
        .write_string(1, 0, "Sunset Villas")
        .expect("write string should succeed");
    leases
        .write_number(1, 1, 1250.75)
        .expect("write number should succeed");
    leases
        .write_boolean(1, 2, true)
        .expect("write bool should succeed");

    let date_format = Format::new().set_num_format("yyyy-mm-dd hh:mm:ss");
    let start_date = ExcelDateTime::from_ymd(2026, 3, 7)
        .expect("date should be valid")
        .and_hms(9, 30, 0)
        .expect("time should be valid");
    leases
        .write_datetime_with_format(1, 3, &start_date, &date_format)
        .expect("write datetime should succeed");

    leases
        .write_string(2, 0, "Oakridge")
        .expect("write string should succeed");
    leases
        .write_number(2, 1, 980.0)
        .expect("write number should succeed");
    leases
        .write_boolean(2, 2, false)
        .expect("write bool should succeed");

    let metadata = workbook.add_worksheet();
    metadata
        .set_name("Metadata")
        .expect("sheet name should be valid");
    metadata
        .write_string(0, 0, "Version")
        .expect("write string should succeed");
    metadata
        .write_string(0, 1, "v0.1.0")
        .expect("write string should succeed");
    metadata
        .write_string(1, 0, "Records")
        .expect("write string should succeed");
    metadata
        .write_number(1, 1, 42.0)
        .expect("write number should succeed");

    let bytes = workbook
        .save_to_buffer()
        .expect("workbook should serialize to bytes");

    let file_path = unique_temp_path("leases-upload", "bin");
    fs::write(&file_path, bytes).expect("workbook bytes should be written");

    file_path
}

fn unique_temp_path(prefix: &str, extension: &str) -> std::path::PathBuf {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system time should be after unix epoch")
        .as_nanos();
    std::env::temp_dir().join(format!("{prefix}-{timestamp}.{extension}"))
}
