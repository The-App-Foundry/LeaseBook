use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Spreadsheet {
    pub sheets: Vec<Sheet>,
}

#[derive(Debug, Serialize)]
pub struct Sheet {
    pub name: String,
    pub rows: Vec<Row>,
}

#[derive(Debug, Serialize)]
pub struct Row {
    pub cells: Vec<Cell>,
}

#[derive(Debug, Serialize)]
pub enum Cell {
    Empty,
    String(String),
    Float(f64),
    Int(i64),
    Bool(bool),
    Date(chrono::NaiveDateTime),
}
