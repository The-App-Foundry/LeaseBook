use std::collections::{HashMap, HashSet};

use chrono::{DateTime, Datelike, NaiveDate, NaiveDateTime, Timelike, Utc};

use crate::property::Lease;
use crate::spreadsheet::{Cell, Sheet, Spreadsheet};

pub fn map_spreadsheet_to_leases(
    spreadsheet: &Spreadsheet,
    column_mapping: &HashMap<String, String>,
    selected_sheet_name: Option<&str>,
) -> Vec<Lease> {
    spreadsheet
        .sheets
        .iter()
        .filter(|sheet| {
            selected_sheet_name
                .map(|name| normalize_key(&sheet.name) == normalize_key(name))
                .unwrap_or(true)
        })
        .flat_map(|sheet| map_sheet_to_leases(sheet, column_mapping))
        .collect()
}

fn map_sheet_to_leases(sheet: &Sheet, column_mapping: &HashMap<String, String>) -> Vec<Lease> {
    let name_header = resolve_header_for_field(sheet, column_mapping, &["name", "property", "company name", "company_name"]);
    let address_header = resolve_header_for_field(
        sheet,
        column_mapping,
        &["address", "location", "business_addr", "business_address"],
    );
    let manager_header = resolve_header_for_field(
        sheet,
        column_mapping,
        &["manager", "decision maker", "lease_manager", "contact"],
    );
    let manager_email_header =
        resolve_header_for_field(sheet, column_mapping, &["manager_email", "email"]);
    let manager_phone_header = resolve_header_for_field(
        sheet,
        column_mapping,
        &["manager_phone_number", "manager_phone", "phone", "phone_number"],
    );
    let expiration_header = resolve_header_for_field(
        sheet,
        column_mapping,
        &["expiration_date", "lease_expiration", "expiration", "expiry_date"],
    );
    let days_to_expire_header = resolve_header_for_field(
        sheet,
        column_mapping,
        &["days_to_expire", "days_until_expiry"],
    );
    let expired_header = resolve_header_for_field(sheet, column_mapping, &["expired", "is_expired"]);
    let notes_header =
        resolve_header_for_field(sheet, column_mapping, &["notes", "note", "comments"]);

    let mapped_headers: HashSet<String> = [
        name_header.as_deref(),
        address_header.as_deref(),
        manager_header.as_deref(),
        manager_email_header.as_deref(),
        manager_phone_header.as_deref(),
        expiration_header.as_deref(),
        days_to_expire_header.as_deref(),
        expired_header.as_deref(),
        notes_header.as_deref(),
    ]
    .into_iter()
    .flatten()
    .map(normalize_key)
    .collect();

    sheet
        .rows
        .iter()
        .map(|row| {
            let mut lease = Lease::default();

            lease.name = read_cell_by_header(row.cells.as_slice(), sheet, name_header.as_deref());
            lease.address = read_cell_by_header(row.cells.as_slice(), sheet, address_header.as_deref());
            lease.lease_manager.name =
                read_cell_by_header(row.cells.as_slice(), sheet, manager_header.as_deref());
            lease.lease_manager.email =
                read_cell_by_header(row.cells.as_slice(), sheet, manager_email_header.as_deref());
            lease.lease_manager.phone_number =
                read_cell_by_header(row.cells.as_slice(), sheet, manager_phone_header.as_deref());
            lease.notes = read_cell_by_header(row.cells.as_slice(), sheet, notes_header.as_deref());

            let expiration_cell = read_raw_cell_by_header(row.cells.as_slice(), sheet, expiration_header.as_deref());
            lease.expiration_date = expiration_cell.and_then(parse_datetime_from_cell);

            let days_cell = read_raw_cell_by_header(
                row.cells.as_slice(),
                sheet,
                days_to_expire_header.as_deref(),
            );
            lease.days_to_expire = days_cell.and_then(parse_days_to_expire);

            let expired_cell =
                read_raw_cell_by_header(row.cells.as_slice(), sheet, expired_header.as_deref());
            lease.expired = expired_cell.and_then(parse_bool_from_cell);

            if lease.days_to_expire.is_none() {
                lease.days_to_expire = lease
                    .expiration_date
                    .map(|expiry| expiry.signed_duration_since(Utc::now()).num_days());
            }

            if lease.expired.is_none() {
                lease.expired = lease.days_to_expire.map(|days| days < 0);
            }

            lease.misc_data = collect_misc_data(row.cells.as_slice(), sheet, &mapped_headers);
            lease
        })
        .collect()
}

fn resolve_header_for_field(
    sheet: &Sheet,
    column_mapping: &HashMap<String, String>,
    aliases: &[&str],
) -> Option<String> {
    for alias in aliases {
        let normalized_alias = normalize_key(alias);

        for (key, value) in column_mapping {
            if normalize_key(key) == normalized_alias {
                return Some(value.clone());
            }
        }

        for (key, value) in column_mapping {
            if normalize_key(value) == normalized_alias {
                return Some(key.clone());
            }
        }

        if let Some(found) = sheet
            .headers
            .iter()
            .find(|header| normalize_key(header) == normalized_alias)
        {
            return Some(found.clone());
        }
    }

    None
}

fn read_cell_by_header(cells: &[Cell], sheet: &Sheet, header: Option<&str>) -> String {
    read_raw_cell_by_header(cells, sheet, header)
        .map(cell_to_string)
        .unwrap_or_default()
}

fn read_raw_cell_by_header<'a>(cells: &'a [Cell], sheet: &Sheet, header: Option<&str>) -> Option<&'a Cell> {
    let header = header?;
    let target = normalize_key(header);
    let index = sheet
        .headers
        .iter()
        .position(|candidate| normalize_key(candidate) == target)?;
    cells.get(index)
}

fn parse_days_to_expire(cell: &Cell) -> Option<i64> {
    match cell {
        Cell::Int(value) => Some(*value),
        Cell::Float(value) => Some(*value as i64),
        Cell::String(value) => value.trim().parse::<i64>().ok(),
        _ => None,
    }
}

fn parse_bool_from_cell(cell: &Cell) -> Option<bool> {
    match cell {
        Cell::Bool(value) => Some(*value),
        Cell::Int(value) => Some(*value != 0),
        Cell::Float(value) => Some(*value != 0.0),
        Cell::String(value) => {
            let normalized = normalize_key(value);
            match normalized.as_str() {
                "true" | "yes" | "y" | "1" => Some(true),
                "false" | "no" | "n" | "0" => Some(false),
                _ => None,
            }
        }
        _ => None,
    }
}

fn parse_datetime_from_cell(cell: &Cell) -> Option<DateTime<Utc>> {
    match cell {
        Cell::Date(value) => Some(DateTime::from_naive_utc_and_offset(*value, Utc)),
        Cell::String(value) => parse_datetime_from_string(value),
        Cell::Float(value) => parse_excel_serial_date(*value),
        Cell::Int(value) => {
            if *value >= 1900 && *value <= 2200 {
                NaiveDate::from_ymd_opt(*value as i32, 1, 1)
                    .and_then(|d| d.and_hms_opt(0, 0, 0))
                    .map(|naive| DateTime::from_naive_utc_and_offset(naive, Utc))
            } else if *value > 0 {
                parse_excel_serial_date(*value as f64)
            } else {
                None
            }
        }
        _ => None,
    }
}

fn parse_datetime_from_string(value: &str) -> Option<DateTime<Utc>> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return None;
    }

    if let Ok(parsed) = DateTime::parse_from_rfc3339(trimmed) {
        return Some(parsed.with_timezone(&Utc));
    }

    if let Ok(parsed) = NaiveDate::parse_from_str(trimmed, "%Y-%m-%d") {
        return parsed
            .and_hms_opt(0, 0, 0)
            .map(|naive| DateTime::from_naive_utc_and_offset(naive, Utc));
    }

    // MM/DD/YY (e.g., "03/15/26") — must check before MM/DD/YYYY since chrono's
    // %Y happily consumes 2-digit years as year 0028 etc.
    if let Some(date) = parse_mm_dd_yy(trimmed) {
        return date
            .and_hms_opt(0, 0, 0)
            .map(|naive| DateTime::from_naive_utc_and_offset(naive, Utc));
    }

    if let Ok(parsed) = NaiveDate::parse_from_str(trimmed, "%m/%d/%Y") {
        return parsed
            .and_hms_opt(0, 0, 0)
            .map(|naive| DateTime::from_naive_utc_and_offset(naive, Utc));
    }

    if let Ok(parsed) = NaiveDateTime::parse_from_str(trimmed, "%Y-%m-%d %H:%M:%S") {
        return Some(DateTime::from_naive_utc_and_offset(parsed, Utc));
    }

    // MM/YYYY (e.g., "03/2026") — must check before MM/DD since both have 2 slash-parts
    if let Some(date) = parse_mm_yyyy(trimmed) {
        return date
            .and_hms_opt(0, 0, 0)
            .map(|naive| DateTime::from_naive_utc_and_offset(naive, Utc));
    }

    // MM/DD (e.g., "03/15") — assumes current year
    if let Some(date) = parse_mm_dd(trimmed) {
        return date
            .and_hms_opt(0, 0, 0)
            .map(|naive| DateTime::from_naive_utc_and_offset(naive, Utc));
    }

    // Quarter notation: Q1 2026, Q2 2026, etc.
    if let Some(date) = parse_quarter_year(trimmed) {
        return date
            .and_hms_opt(0, 0, 0)
            .map(|naive| DateTime::from_naive_utc_and_offset(naive, Utc));
    }

    // Bare year: "2026"
    if let Some(date) = parse_bare_year(trimmed) {
        return date
            .and_hms_opt(0, 0, 0)
            .map(|naive| DateTime::from_naive_utc_and_offset(naive, Utc));
    }

    None
}

/// Parse "MM/DD/YY" (e.g., "03/15/26") with a pivot: 00-99 → 2000-2099.
fn parse_mm_dd_yy(value: &str) -> Option<NaiveDate> {
    let parts: Vec<&str> = value.split('/').collect();
    if parts.len() != 3 {
        return None;
    }
    let month = parts[0].parse::<u32>().ok()?;
    let day = parts[1].parse::<u32>().ok()?;
    let short_year = parts[2].parse::<i32>().ok()?;
    // Only match 1- or 2-digit year values (0–99)
    if short_year < 0 || short_year > 99 {
        return None;
    }
    let year = 2000 + short_year;
    NaiveDate::from_ymd_opt(year, month, day)
}

/// Parse "MM/YYYY" (e.g., "03/2026") → 1st of that month.
fn parse_mm_yyyy(value: &str) -> Option<NaiveDate> {
    let parts: Vec<&str> = value.split('/').collect();
    if parts.len() != 2 {
        return None;
    }
    let month = parts[0].parse::<u32>().ok()?;
    let year = parts[1].parse::<i32>().ok()?;
    if year < 1900 || year > 2200 {
        return None;
    }
    NaiveDate::from_ymd_opt(year, month, 1)
}

/// Parse "MM/DD" (e.g., "03/15" or "3/5") → that date in the current year.
fn parse_mm_dd(value: &str) -> Option<NaiveDate> {
    let parts: Vec<&str> = value.split('/').collect();
    if parts.len() != 2 {
        return None;
    }
    let month = parts[0].parse::<u32>().ok()?;
    let day = parts[1].parse::<u32>().ok()?;
    if day > 31 {
        return None;
    }
    let year = Utc::now().year();
    NaiveDate::from_ymd_opt(year, month, day)
}

/// Parse quarter notation: "Q2 2026", "q1 2025", etc.
fn parse_quarter_year(value: &str) -> Option<NaiveDate> {
    let lower = value.to_lowercase();
    let lower = lower.trim();
    if !lower.starts_with('q') {
        return None;
    }
    let rest = lower[1..].trim();
    let mut parts = rest.split_whitespace();
    let quarter = parts.next()?.parse::<u32>().ok()?;
    let year = parts.next()?.parse::<i32>().ok()?;
    if parts.next().is_some() || quarter < 1 || quarter > 4 || year < 1900 || year > 2200 {
        return None;
    }
    let month = (quarter - 1) * 3 + 1; // Q1→Jan, Q2→Apr, Q3→Jul, Q4→Oct
    NaiveDate::from_ymd_opt(year, month, 1)
}

/// Parse a bare 4-digit year: "2026" → January 1 of that year.
fn parse_bare_year(value: &str) -> Option<NaiveDate> {
    let year = value.parse::<i32>().ok()?;
    if year < 1900 || year > 2200 {
        return None;
    }
    NaiveDate::from_ymd_opt(year, 1, 1)
}

/// Convert an Excel serial date number to a DateTime.
/// Excel epoch: serial 1 = January 1, 1900. Accounts for the 1900 leap-year bug.
fn parse_excel_serial_date(serial: f64) -> Option<DateTime<Utc>> {
    if serial < 1.0 || serial > 2_958_465.0 {
        return None;
    }
    let days = serial.floor() as i64;
    let base = NaiveDate::from_ymd_opt(1899, 12, 31)?;
    // Excel erroneously counts Feb 29, 1900.  For serial >= 60 subtract 1 to compensate.
    let adjusted = if days >= 60 { days - 1 } else { days };
    base.checked_add_signed(chrono::Duration::days(adjusted))
        .and_then(|d| d.and_hms_opt(0, 0, 0))
        .map(|naive| DateTime::from_naive_utc_and_offset(naive, Utc))
}

fn collect_misc_data(cells: &[Cell], sheet: &Sheet, mapped_headers: &HashSet<String>) -> String {
    sheet
        .headers
        .iter()
        .enumerate()
        .filter_map(|(index, header)| {
            let normalized_header = normalize_key(header);
            if normalized_header.is_empty() || mapped_headers.contains(&normalized_header) {
                return None;
            }

            let value = cells.get(index).map(cell_to_string).unwrap_or_default();
            if value.trim().is_empty() {
                return None;
            }

            Some(format!("{header}: {value}"))
        })
        .collect::<Vec<_>>()
        .join("; ")
}

fn cell_to_string(cell: &Cell) -> String {
    match cell {
        Cell::Empty => String::new(),
        Cell::String(value) => value.clone(),
        Cell::Float(value) => value.to_string(),
        Cell::Int(value) => value.to_string(),
        Cell::Bool(value) => value.to_string(),
        Cell::Date(value) => {
            if value.hour() == 0 && value.minute() == 0 && value.second() == 0 {
                value.format("%Y-%m-%d").to_string()
            } else {
                value.format("%Y-%m-%d %H:%M:%S").to_string()
            }
        }
    }
}

fn normalize_key(value: &str) -> String {
    value
        .to_lowercase()
        .chars()
        .filter(|ch| ch.is_ascii_alphanumeric())
        .collect()
}
