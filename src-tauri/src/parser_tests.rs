#![cfg(test)]

use std::fs;
use std::time::{SystemTime, UNIX_EPOCH};

use rust_xlsxwriter::{ExcelDateTime, Format, Workbook};

use crate::parser::{parse_spreadsheet_from_path, ParserError};
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

    assert!(matches!(leases_sheet.rows[0].cells[0], Cell::String(ref v) if v == "Property"));
    assert!(matches!(leases_sheet.rows[1].cells[0], Cell::String(ref v) if v == "Sunset Villas"));
    assert!(matches!(leases_sheet.rows[1].cells[1], Cell::Float(v) if (v - 1250.75).abs() < 0.001));
    assert!(matches!(leases_sheet.rows[1].cells[2], Cell::Bool(true)));
    assert!(matches!(leases_sheet.rows[1].cells[3], Cell::Date(_)));
    assert!(matches!(leases_sheet.rows[2].cells[2], Cell::Bool(false)));

    let metadata_sheet = parsed
        .sheets
        .iter()
        .find(|sheet| sheet.name == "Metadata")
        .expect("Metadata sheet should exist");

    assert!(matches!(metadata_sheet.rows[0].cells[0], Cell::String(ref v) if v == "Version"));
    assert!(matches!(metadata_sheet.rows[0].cells[1], Cell::String(ref v) if v == "v0.1.0"));
    assert!(matches!(metadata_sheet.rows[1].cells[1], Cell::Float(v) if (v - 42.0).abs() < 0.001));

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

fn build_complex_workbook_file() -> std::path::PathBuf {
    let mut workbook = Workbook::new();

    let leases = workbook.add_worksheet();
    leases.set_name("Leases").expect("sheet name should be valid");
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
