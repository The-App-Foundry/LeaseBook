use std::fmt;
use std::path::Path;

use calamine::{Data, Reader, Sheets, open_workbook_auto};

use crate::spreadsheet::{Cell, Row, Sheet, Spreadsheet};

const MAX_IMPORT_FILE_BYTES: u64 = 25 * 1024 * 1024;
const MAX_IMPORT_SHEETS: usize = 32;
const MAX_IMPORT_COLUMNS: usize = 256;
const MAX_IMPORT_DATA_ROWS: usize = 10_000;
const MAX_IMPORT_CELL_TEXT_CHARS: usize = 4_096;

#[derive(Debug)]
pub enum ParserError {
    OpenWorkbook(calamine::Error),
    ReadSheet {
        name: String,
        source: calamine::Error,
    },
    InputLimit(String),
}

impl fmt::Display for ParserError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::OpenWorkbook(source) => write!(f, "failed to open spreadsheet: {source}"),
            Self::ReadSheet { name, source } => {
                write!(f, "failed to read worksheet '{name}': {source}")
            }
            Self::InputLimit(message) => write!(f, "{message}"),
        }
    }
}

impl std::error::Error for ParserError {}

pub fn parse_spreadsheet_from_path(path: impl AsRef<Path>) -> Result<Spreadsheet, ParserError> {
    let path = path.as_ref();
    if let Ok(metadata) = std::fs::metadata(path) {
        if metadata.len() > MAX_IMPORT_FILE_BYTES {
            return Err(ParserError::InputLimit(format!(
                "spreadsheet exceeds the {} MiB import limit",
                MAX_IMPORT_FILE_BYTES / 1024 / 1024
            )));
        }
    }

    let mut workbook = open_workbook_auto(path).map_err(ParserError::OpenWorkbook)?;
    parse_workbook(&mut workbook)
}

fn parse_workbook<RS>(workbook: &mut Sheets<RS>) -> Result<Spreadsheet, ParserError>
where
    RS: std::io::Read + std::io::Seek,
{
    let sheet_names = workbook.sheet_names().to_owned();
    if sheet_names.len() > MAX_IMPORT_SHEETS {
        return Err(ParserError::InputLimit(format!(
            "spreadsheet has too many sheets; maximum is {MAX_IMPORT_SHEETS}"
        )));
    }

    let mut sheets = Vec::with_capacity(sheet_names.len());

    for sheet_name in sheet_names {
        let range =
            workbook
                .worksheet_range(&sheet_name)
                .map_err(|source| ParserError::ReadSheet {
                    name: sanitize_text(&sheet_name, false)
                        .unwrap_or_else(|_| "<invalid sheet name>".to_string()),
                    source,
                })?;

        let (height, width) = range.get_size();
        if width > MAX_IMPORT_COLUMNS {
            return Err(ParserError::InputLimit(format!(
                "worksheet '{}' has too many columns; maximum is {MAX_IMPORT_COLUMNS}",
                sanitize_text(&sheet_name, false)
                    .unwrap_or_else(|_| "<invalid sheet name>".to_string())
            )));
        }

        let header_row_index = detect_header_row_index(&range);
        let data_row_count = height.saturating_sub(header_row_index.saturating_add(1));
        if data_row_count > MAX_IMPORT_DATA_ROWS {
            return Err(ParserError::InputLimit(format!(
                "worksheet '{}' has too many data rows; maximum is {MAX_IMPORT_DATA_ROWS}",
                sanitize_text(&sheet_name, false)
                    .unwrap_or_else(|_| "<invalid sheet name>".to_string())
            )));
        }

        let headers = range
            .rows()
            .nth(header_row_index)
            .map(|cells| {
                let headers_result: Result<Vec<String>, ParserError> =
                    cells.iter().map(cell_to_header).collect();
                let mut headers = headers_result?;
                // Some workbooks report header rows with trailing empty cells when later rows are wider.
                while headers
                    .last()
                    .is_some_and(|header| header.trim().is_empty())
                {
                    headers.pop();
                }
                Ok(headers)
            })
            .transpose()?
            .unwrap_or_default();

        let rows = range
            .rows()
            .skip(header_row_index.saturating_add(1))
            .map(|cells| {
                let cells = cells
                    .iter()
                    .map(convert_cell)
                    .collect::<Result<Vec<_>, ParserError>>()?;
                Ok(Row { cells })
            })
            .collect::<Result<Vec<_>, ParserError>>()?;

        sheets.push(Sheet {
            name: sanitize_text(&sheet_name, false)?,
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

fn cell_to_header(cell: &Data) -> Result<String, ParserError> {
    match convert_cell(cell)? {
        Cell::Empty => Ok(String::new()),
        Cell::String(value) => Ok(value),
        Cell::Float(value) => Ok(value.to_string()),
        Cell::Int(value) => Ok(value.to_string()),
        Cell::Bool(value) => Ok(value.to_string()),
        Cell::Date(value) => Ok(value.format("%Y-%m-%d %H:%M:%S").to_string()),
    }
}

fn convert_cell(cell: &Data) -> Result<Cell, ParserError> {
    let converted = match cell {
        Data::Empty => Cell::Empty,
        Data::String(value) => Cell::String(sanitize_text(value, true)?),
        Data::Float(value) => Cell::Float(*value),
        Data::Int(value) => Cell::Int(*value),
        Data::Bool(value) => Cell::Bool(*value),
        Data::DateTime(value) => value
            .as_datetime()
            .map(Cell::Date)
            .unwrap_or_else(|| Cell::Float(value.as_f64())),
        Data::DateTimeIso(value) => Cell::String(sanitize_text(value, true)?),
        Data::DurationIso(value) => Cell::String(sanitize_text(value, true)?),
        Data::Error(_) => Cell::Empty,
    };

    Ok(converted)
}

fn sanitize_text(value: &str, neutralize_formula: bool) -> Result<String, ParserError> {
    if value
        .chars()
        .take(MAX_IMPORT_CELL_TEXT_CHARS.saturating_add(1))
        .count()
        > MAX_IMPORT_CELL_TEXT_CHARS
    {
        return Err(ParserError::InputLimit(format!(
            "spreadsheet text values must be {MAX_IMPORT_CELL_TEXT_CHARS} characters or fewer"
        )));
    }

    let mut sanitized = String::with_capacity(value.len());
    let mut previous_was_space = false;

    for ch in value.chars() {
        let replacement = match ch {
            '\r' | '\n' | '\t' => Some(' '),
            _ if ch.is_control() => None,
            _ => Some(ch),
        };

        if let Some(ch) = replacement {
            if ch.is_whitespace() {
                if !previous_was_space {
                    sanitized.push(' ');
                    previous_was_space = true;
                }
            } else {
                sanitized.push(ch);
                previous_was_space = false;
            }
        }
    }

    let sanitized = sanitized.trim().to_string();
    if neutralize_formula
        && sanitized
            .chars()
            .next()
            .is_some_and(|ch| matches!(ch, '=' | '+' | '-' | '@'))
    {
        return Ok(format!("'{sanitized}"));
    }

    Ok(sanitized)
}
