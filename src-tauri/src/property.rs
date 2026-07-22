use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Lease {
    pub name: String,
    pub address: String,
    pub lease_manager: LeaseManager,
    pub expiration_date: Option<DateTime<Utc>>,
    pub days_to_expire: Option<i64>,
    pub expired: Option<bool>,
    pub notes: String,
    pub misc_data: String,
}

#[derive(Debug, Default, Serialize, Deserialize, Clone)]
pub struct LeaseManager {
    pub name: String,
    pub email: String,
    pub phone_number: String,
}

impl Default for Lease {
    fn default() -> Self {
        Self {
            name: String::new(),
            address: String::new(),
            lease_manager: LeaseManager::default(),
            expiration_date: None,
            days_to_expire: None,
            expired: None,
            notes: String::new(),
            misc_data: String::new(),
        }
    }
}
