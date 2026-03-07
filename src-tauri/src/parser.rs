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

        let rows = range
            .rows()
            .map(|cells| Row {
                cells: cells.iter().map(convert_cell).collect(),
            })
            .collect();

        sheets.push(Sheet {
            name: sheet_name,
            rows,
        });
    }

    Ok(Spreadsheet { sheets })
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
