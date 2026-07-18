use diesel::result::Error as DieselError;

use crate::error::AppError;

#[test]
fn diesel_not_found_maps_to_404_response() {
    let response = AppError::from(DieselError::NotFound).to_http_response();

    assert_eq!(response.status, 404);
    assert_eq!(response.code, "not_found");
    assert_eq!(response.message, "The requested resource was not found.");
}

#[test]
fn validation_errors_map_to_400_response() {
    let response = AppError::validation("page must be greater than zero").to_http_response();

    assert_eq!(response.status, 400);
    assert_eq!(response.code, "validation_error");
    assert_eq!(response.message, "page must be greater than zero");
}

#[test]
fn internal_errors_do_not_leak_source_details() {
    let response = AppError::internal("database password leaked in detail").to_http_response();

    assert_eq!(response.status, 500);
    assert_eq!(response.code, "internal_error");
    assert_eq!(response.message, "An internal error occurred.");
}
