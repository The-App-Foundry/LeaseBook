use std::fmt;

use diesel::result::{DatabaseErrorKind, Error as DieselError};
use serde::Serialize;

use crate::parser::ParserError;

#[derive(Debug)]
pub enum AppError {
    NotFound,
    Validation(String),
    Conflict(String),
    Parse(String),
    Internal(String),
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct ErrorResponse {
    pub status: u16,
    pub code: &'static str,
    pub message: String,
}

pub type CommandResult<T> = Result<T, ErrorResponse>;

impl AppError {
    pub fn validation(message: impl Into<String>) -> Self {
        Self::Validation(message.into())
    }

    pub fn internal(message: impl Into<String>) -> Self {
        Self::Internal(message.into())
    }

    pub fn to_http_response(&self) -> ErrorResponse {
        match self {
            Self::NotFound => ErrorResponse {
                status: 404,
                code: "not_found",
                message: "The requested resource was not found.".to_string(),
            },
            Self::Validation(message) => ErrorResponse {
                status: 400,
                code: "validation_error",
                message: message.clone(),
            },
            Self::Conflict(message) => ErrorResponse {
                status: 409,
                code: "conflict",
                message: message.clone(),
            },
            Self::Parse(message) => ErrorResponse {
                status: 422,
                code: "parse_error",
                message: message.clone(),
            },
            Self::Internal(_) => ErrorResponse {
                status: 500,
                code: "internal_error",
                message: "An internal error occurred.".to_string(),
            },
        }
    }
}

impl From<AppError> for ErrorResponse {
    fn from(error: AppError) -> Self {
        error.to_http_response()
    }
}

impl From<DieselError> for AppError {
    fn from(error: DieselError) -> Self {
        match error {
            DieselError::NotFound => Self::NotFound,
            DieselError::DatabaseError(DatabaseErrorKind::UniqueViolation, _) => {
                Self::Conflict("A record with those values already exists.".to_string())
            }
            DieselError::DatabaseError(DatabaseErrorKind::ForeignKeyViolation, _) => {
                Self::Validation("The request references a missing related record.".to_string())
            }
            other => Self::Internal(other.to_string()),
        }
    }
}

impl From<DieselError> for ErrorResponse {
    fn from(error: DieselError) -> Self {
        AppError::from(error).into()
    }
}

impl From<diesel::r2d2::Error> for AppError {
    fn from(error: diesel::r2d2::Error) -> Self {
        Self::Internal(error.to_string())
    }
}

impl From<diesel::r2d2::Error> for ErrorResponse {
    fn from(error: diesel::r2d2::Error) -> Self {
        AppError::from(error).into()
    }
}

impl From<ParserError> for AppError {
    fn from(error: ParserError) -> Self {
        Self::Parse(error.to_string())
    }
}

impl From<ParserError> for ErrorResponse {
    fn from(error: ParserError) -> Self {
        AppError::from(error).into()
    }
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::NotFound => write!(f, "not found"),
            Self::Validation(message)
            | Self::Conflict(message)
            | Self::Parse(message)
            | Self::Internal(message) => write!(f, "{message}"),
        }
    }
}

impl std::error::Error for AppError {}
