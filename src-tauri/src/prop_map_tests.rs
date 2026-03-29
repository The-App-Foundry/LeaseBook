#![cfg(test)]

use std::collections::HashMap;

use chrono::{Datelike, TimeZone, Utc};

use crate::prop_map::map_spreadsheet_to_leases;
use crate::spreadsheet::{Cell, Row, Sheet, Spreadsheet};

#[test]
fn maps_headers_to_lease_fields_and_collects_misc_data() {
    let spreadsheet = Spreadsheet {
        sheets: vec![Sheet {
            name: "Leases".to_string(),
            headers: vec![
                "name".to_string(),
                "location".to_string(),
                "Decision Maker".to_string(),
                "portfolio".to_string(),
            ],
            rows: vec![Row {
                cells: vec![
                    Cell::String("Sunset Villas".to_string()),
                    Cell::String("120 Maple Ave".to_string()),
                    Cell::String("Alicia Gomez".to_string()),
                    Cell::String("West".to_string()),
                ],
            }],
        }],
    };

    let mut mapping = HashMap::new();
    mapping.insert("name".to_string(), "name".to_string());
    mapping.insert("location".to_string(), "address".to_string());
    mapping.insert("Decision Maker".to_string(), "manager".to_string());

    let leases = map_spreadsheet_to_leases(&spreadsheet, &mapping, None);
    assert_eq!(leases.len(), 1);

    let lease = &leases[0];
    assert_eq!(lease.name, "Sunset Villas");
    assert_eq!(lease.address, "120 Maple Ave");
    assert_eq!(lease.lease_manager.name, "Alicia Gomez");
    assert_eq!(lease.misc_data, "portfolio: West");
}

#[test]
fn supports_field_to_header_mapping_direction() {
    let spreadsheet = Spreadsheet {
        sheets: vec![Sheet {
            name: "Leases".to_string(),
            headers: vec!["Property Name".to_string(), "Addr".to_string()],
            rows: vec![Row {
                cells: vec![
                    Cell::String("Oakridge".to_string()),
                    Cell::String("455 River St".to_string()),
                ],
            }],
        }],
    };

    let mut mapping = HashMap::new();
    mapping.insert("name".to_string(), "Property Name".to_string());
    mapping.insert("address".to_string(), "Addr".to_string());

    let leases = map_spreadsheet_to_leases(&spreadsheet, &mapping, None);
    assert_eq!(leases.len(), 1);

    let lease = &leases[0];
    assert_eq!(lease.name, "Oakridge");
    assert_eq!(lease.address, "455 River St");
    assert_eq!(lease.misc_data, "");
}

#[test]
fn filters_to_selected_sheet_name() {
    let spreadsheet = Spreadsheet {
        sheets: vec![
            Sheet {
                name: "IgnoreMe".to_string(),
                headers: vec!["name".to_string()],
                rows: vec![Row {
                    cells: vec![Cell::String("Wrong".to_string())],
                }],
            },
            Sheet {
                name: "Leases".to_string(),
                headers: vec!["name".to_string()],
                rows: vec![Row {
                    cells: vec![Cell::String("Right".to_string())],
                }],
            },
        ],
    };

    let mut mapping = HashMap::new();
    mapping.insert("name".to_string(), "name".to_string());

    let leases = map_spreadsheet_to_leases(&spreadsheet, &mapping, Some("Leases"));
    assert_eq!(leases.len(), 1);
    assert_eq!(leases[0].name, "Right");
}

#[test]
fn parses_expiration_date_from_mm_dd_yyyy_string() {
    let spreadsheet = Spreadsheet {
        sheets: vec![Sheet {
            name: "Leases".to_string(),
            headers: vec!["name".to_string(), "expiration_date".to_string()],
            rows: vec![Row {
                cells: vec![
                    Cell::String("Test Property".to_string()),
                    Cell::String("12/31/2099".to_string()),
                ],
            }],
        }],
    };

    let mut mapping = HashMap::new();
    mapping.insert("expiration_date".to_string(), "expiration_date".to_string());

    let leases = map_spreadsheet_to_leases(&spreadsheet, &mapping, None);
    assert_eq!(leases.len(), 1);

    let lease = &leases[0];
    let expiry = lease.expiration_date.expect("expiration_date should be parsed");
    let expected = Utc.with_ymd_and_hms(2099, 12, 31, 0, 0, 0).unwrap();
    assert_eq!(expiry.year(), expected.year());
    assert_eq!(expiry.month(), expected.month());
    assert_eq!(expiry.day(), expected.day());
    assert_eq!(lease.expired, Some(false), "a far-future date should not be expired");
}

#[test]
fn parses_expiration_date_from_m_d_yyyy_string_without_leading_zeros() {
    let spreadsheet = Spreadsheet {
        sheets: vec![Sheet {
            name: "Leases".to_string(),
            headers: vec!["name".to_string(), "expiration_date".to_string()],
            rows: vec![Row {
                cells: vec![
                    Cell::String("Test Property".to_string()),
                    Cell::String("3/5/2099".to_string()),
                ],
            }],
        }],
    };

    let mut mapping = HashMap::new();
    mapping.insert("expiration_date".to_string(), "expiration_date".to_string());

    let leases = map_spreadsheet_to_leases(&spreadsheet, &mapping, None);
    assert_eq!(leases.len(), 1);

    let lease = &leases[0];
    let expiry = lease.expiration_date.expect("expiration_date should be parsed");
    assert_eq!(expiry.year(), 2099);
    assert_eq!(expiry.month(), 3);
    assert_eq!(expiry.day(), 5);
    assert_eq!(lease.expired, Some(false));
}

#[test]
fn parses_expiration_date_from_mm_dd_yy_string() {
    let spreadsheet = Spreadsheet {
        sheets: vec![Sheet {
            name: "Leases".to_string(),
            headers: vec!["name".to_string(), "expiration_date".to_string()],
            rows: vec![Row {
                cells: vec![
                    Cell::String("Test Property".to_string()),
                    Cell::String("12/31/28".to_string()),
                ],
            }],
        }],
    };

    let mapping = HashMap::from([
        ("expiration_date".to_string(), "expiration_date".to_string()),
    ]);

    let leases = map_spreadsheet_to_leases(&spreadsheet, &mapping, None);
    let lease = &leases[0];
    let expiry = lease.expiration_date.expect("mm/dd/yy should be parsed");
    assert_eq!(expiry.year(), 2028);
    assert_eq!(expiry.month(), 12);
    assert_eq!(expiry.day(), 31);
}

#[test]
fn parses_expiration_date_from_mm_dd_string_using_current_year() {
    let spreadsheet = Spreadsheet {
        sheets: vec![Sheet {
            name: "Leases".to_string(),
            headers: vec!["name".to_string(), "expiration_date".to_string()],
            rows: vec![Row {
                cells: vec![
                    Cell::String("Test Property".to_string()),
                    Cell::String("06/15".to_string()),
                ],
            }],
        }],
    };

    let mapping = HashMap::from([
        ("expiration_date".to_string(), "expiration_date".to_string()),
    ]);

    let leases = map_spreadsheet_to_leases(&spreadsheet, &mapping, None);
    let lease = &leases[0];
    let expiry = lease.expiration_date.expect("mm/dd should be parsed");
    assert_eq!(expiry.month(), 6);
    assert_eq!(expiry.day(), 15);
    assert_eq!(expiry.year(), Utc::now().year());
}

#[test]
fn parses_expiration_date_from_mm_yyyy_string() {
    let spreadsheet = Spreadsheet {
        sheets: vec![Sheet {
            name: "Leases".to_string(),
            headers: vec!["name".to_string(), "expiration_date".to_string()],
            rows: vec![Row {
                cells: vec![
                    Cell::String("Test Property".to_string()),
                    Cell::String("09/2028".to_string()),
                ],
            }],
        }],
    };

    let mapping = HashMap::from([
        ("expiration_date".to_string(), "expiration_date".to_string()),
    ]);

    let leases = map_spreadsheet_to_leases(&spreadsheet, &mapping, None);
    let lease = &leases[0];
    let expiry = lease.expiration_date.expect("mm/yyyy should be parsed");
    assert_eq!(expiry.year(), 2028);
    assert_eq!(expiry.month(), 9);
    assert_eq!(expiry.day(), 1);
}

#[test]
fn parses_expiration_date_from_quarter_year_string() {
    let spreadsheet = Spreadsheet {
        sheets: vec![Sheet {
            name: "Leases".to_string(),
            headers: vec!["name".to_string(), "expiration_date".to_string()],
            rows: vec![Row {
                cells: vec![
                    Cell::String("Test Property".to_string()),
                    Cell::String("Q2 2027".to_string()),
                ],
            }],
        }],
    };

    let mapping = HashMap::from([
        ("expiration_date".to_string(), "expiration_date".to_string()),
    ]);

    let leases = map_spreadsheet_to_leases(&spreadsheet, &mapping, None);
    let lease = &leases[0];
    let expiry = lease.expiration_date.expect("Q2 2027 should be parsed");
    assert_eq!(expiry.year(), 2027);
    assert_eq!(expiry.month(), 4); // Q2 starts in April
    assert_eq!(expiry.day(), 1);
}

#[test]
fn parses_expiration_date_from_lowercase_quarter_year() {
    let spreadsheet = Spreadsheet {
        sheets: vec![Sheet {
            name: "Leases".to_string(),
            headers: vec!["name".to_string(), "expiration_date".to_string()],
            rows: vec![Row {
                cells: vec![
                    Cell::String("Test Property".to_string()),
                    Cell::String("q4 2030".to_string()),
                ],
            }],
        }],
    };

    let mapping = HashMap::from([
        ("expiration_date".to_string(), "expiration_date".to_string()),
    ]);

    let leases = map_spreadsheet_to_leases(&spreadsheet, &mapping, None);
    let lease = &leases[0];
    let expiry = lease.expiration_date.expect("q4 2030 should be parsed");
    assert_eq!(expiry.year(), 2030);
    assert_eq!(expiry.month(), 10); // Q4 starts in October
    assert_eq!(expiry.day(), 1);
}

#[test]
fn parses_expiration_date_from_bare_year_string() {
    let spreadsheet = Spreadsheet {
        sheets: vec![Sheet {
            name: "Leases".to_string(),
            headers: vec!["name".to_string(), "expiration_date".to_string()],
            rows: vec![Row {
                cells: vec![
                    Cell::String("Test Property".to_string()),
                    Cell::String("2029".to_string()),
                ],
            }],
        }],
    };

    let mapping = HashMap::from([
        ("expiration_date".to_string(), "expiration_date".to_string()),
    ]);

    let leases = map_spreadsheet_to_leases(&spreadsheet, &mapping, None);
    let lease = &leases[0];
    let expiry = lease.expiration_date.expect("bare year should be parsed");
    assert_eq!(expiry.year(), 2029);
    assert_eq!(expiry.month(), 1);
    assert_eq!(expiry.day(), 1);
}

#[test]
fn parses_expiration_date_from_int_cell_as_year() {
    let spreadsheet = Spreadsheet {
        sheets: vec![Sheet {
            name: "Leases".to_string(),
            headers: vec!["name".to_string(), "expiration_date".to_string()],
            rows: vec![Row {
                cells: vec![
                    Cell::String("Test Property".to_string()),
                    Cell::Int(2027),
                ],
            }],
        }],
    };

    let mapping = HashMap::from([
        ("expiration_date".to_string(), "expiration_date".to_string()),
    ]);

    let leases = map_spreadsheet_to_leases(&spreadsheet, &mapping, None);
    let lease = &leases[0];
    let expiry = lease.expiration_date.expect("int year should be parsed");
    assert_eq!(expiry.year(), 2027);
    assert_eq!(expiry.month(), 1);
    assert_eq!(expiry.day(), 1);
}

#[test]
fn parses_expiration_date_from_excel_serial_float() {
    // 45658.0 is Excel serial for 2024-12-31
    let spreadsheet = Spreadsheet {
        sheets: vec![Sheet {
            name: "Leases".to_string(),
            headers: vec!["name".to_string(), "expiration_date".to_string()],
            rows: vec![Row {
                cells: vec![
                    Cell::String("Test Property".to_string()),
                    Cell::Float(45658.0),
                ],
            }],
        }],
    };

    let mapping = HashMap::from([
        ("expiration_date".to_string(), "expiration_date".to_string()),
    ]);

    let leases = map_spreadsheet_to_leases(&spreadsheet, &mapping, None);
    let lease = &leases[0];
    let expiry = lease.expiration_date.expect("excel serial should be parsed");
    // 45658 = 2025-01-01 in Excel
    assert_eq!(expiry.year(), 2025);
    assert_eq!(expiry.month(), 1);
    assert_eq!(expiry.day(), 1);
}

#[test]
fn none_and_empty_produce_no_expiration() {
    let spreadsheet = Spreadsheet {
        sheets: vec![Sheet {
            name: "Leases".to_string(),
            headers: vec!["name".to_string(), "expiration_date".to_string()],
            rows: vec![
                Row {
                    cells: vec![
                        Cell::String("Empty".to_string()),
                        Cell::Empty,
                    ],
                },
                Row {
                    cells: vec![
                        Cell::String("Blank".to_string()),
                        Cell::String("".to_string()),
                    ],
                },
                Row {
                    cells: vec![
                        Cell::String("None text".to_string()),
                        Cell::String("none".to_string()),
                    ],
                },
            ],
        }],
    };

    let mapping = HashMap::from([
        ("expiration_date".to_string(), "expiration_date".to_string()),
    ]);

    let leases = map_spreadsheet_to_leases(&spreadsheet, &mapping, None);
    assert!(leases[0].expiration_date.is_none(), "Empty cell should yield None");
    assert!(leases[1].expiration_date.is_none(), "Blank string should yield None");
    assert!(leases[2].expiration_date.is_none(), "\"none\" should yield None");
}
