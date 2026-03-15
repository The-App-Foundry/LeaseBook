use std::collections::{HashMap, HashSet};

use chrono::{DateTime, NaiveDate, NaiveDateTime, Timelike, Utc};

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
        _ => None,
    }
}

fn parse_datetime_from_string(value: &str) -> Option<DateTime<Utc>> {
    if let Ok(parsed) = DateTime::parse_from_rfc3339(value) {
        return Some(parsed.with_timezone(&Utc));
    }

    if let Ok(parsed) = NaiveDate::parse_from_str(value, "%Y-%m-%d") {
        return parsed
            .and_hms_opt(0, 0, 0)
            .map(|naive| DateTime::from_naive_utc_and_offset(naive, Utc));
    }

    NaiveDateTime::parse_from_str(value, "%Y-%m-%d %H:%M:%S")
        .ok()
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
