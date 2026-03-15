use std::fmt;
use std::path::Path;

use calamine::{open_workbook_auto, Data, Reader, Sheets};

use crate::spreadsheet::{Cell, Row, Sheet, Spreadsheet};

#[derive(Debug)]
pub enum ParserError {
    OpenWorkbook(calamine::Error),
    ReadSheet {
        name: String,
        source: calamine::Error,
    },
}

impl fmt::Display for ParserError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::OpenWorkbook(source) => write!(f, "failed to open spreadsheet: {source}"),
            Self::ReadSheet { name, source } => {
                write!(f, "failed to read worksheet '{name}': {source}")
            }
        }
    }
}

impl std::error::Error for ParserError {}

pub fn parse_spreadsheet_from_path(path: impl AsRef<Path>) -> Result<Spreadsheet, ParserError> {
    let mut workbook = open_workbook_auto(path).map_err(ParserError::OpenWorkbook)?;
    parse_workbook(&mut workbook)
}

fn parse_workbook<RS>(workbook: &mut Sheets<RS>) -> Result<Spreadsheet, ParserError>
where
    RS: std::io::Read + std::io::Seek,
{
    let sheet_names = workbook.sheet_names().to_owned();
    let mut sheets = Vec::with_capacity(sheet_names.len());

    for sheet_name in sheet_names {
        let range = workbook
            .worksheet_range(&sheet_name)
            .map_err(|source| ParserError::ReadSheet {
                name: sheet_name.clone(),
                source,
            })?;

        let header_row_index = detect_header_row_index(&range);
        let headers = range
            .rows()
            .nth(header_row_index)
            .map(|cells| {
                let mut headers: Vec<String> = cells.iter().map(cell_to_header).collect();
                // Some workbooks report header rows with trailing empty cells when later rows are wider.
                while headers.last().is_some_and(|header| header.trim().is_empty()) {
                    headers.pop();
                }
                headers
            })
            .unwrap_or_default();

        let rows = range
            .rows()
            .skip(header_row_index.saturating_add(1))
            .map(|cells| Row {
                cells: cells.iter().map(convert_cell).collect(),
            })
            .collect();

        sheets.push(Sheet {
            name: sheet_name,
            headers,
            rows,
        });
    }

    Ok(Spreadsheet { sheets })
}

fn detect_header_row_index(range: &calamine::Range<Data>) -> usize {
    let mut first_non_empty_row_index = None;

    for (row_index, row) in range.rows().enumerate() {
        let non_empty_count = row.iter().filter(|cell| !cell_is_empty(cell)).count();
        if non_empty_count == 0 {
            continue;
        }

        if first_non_empty_row_index.is_none() {
            first_non_empty_row_index = Some(row_index);
        }

        let string_count = row
            .iter()
            .filter(|cell| matches!(cell, Data::String(value) if !value.trim().is_empty()))
            .count();

        // Prefer the first row that looks like headers: mostly text and at least two values.
        if non_empty_count >= 2 && string_count * 2 >= non_empty_count {
            return row_index;
        }
    }

    first_non_empty_row_index.unwrap_or(0)
}

fn cell_is_empty(cell: &Data) -> bool {
    match cell {
        Data::Empty => true,
        Data::String(value) => value.trim().is_empty(),
        _ => false,
    }
}

fn cell_to_header(cell: &Data) -> String {
    match convert_cell(cell) {
        Cell::Empty => String::new(),
        Cell::String(value) => value,
        Cell::Float(value) => value.to_string(),
        Cell::Int(value) => value.to_string(),
        Cell::Bool(value) => value.to_string(),
        Cell::Date(value) => value.format("%Y-%m-%d %H:%M:%S").to_string(),
    }
}

fn convert_cell(cell: &Data) -> Cell {
    match cell {
        Data::Empty => Cell::Empty,
        Data::String(value) => Cell::String(value.clone()),
        Data::Float(value) => Cell::Float(*value),
        Data::Int(value) => Cell::Int(*value),
        Data::Bool(value) => Cell::Bool(*value),
        Data::DateTime(value) => value
            .as_datetime()
            .map(Cell::Date)
            .unwrap_or_else(|| Cell::Float(value.as_f64())),
        Data::DateTimeIso(value) => Cell::String(value.clone()),
        Data::DurationIso(value) => Cell::String(value.clone()),
        Data::Error(value) => Cell::String(format!("#ERROR({value:?})")),
    }
}
