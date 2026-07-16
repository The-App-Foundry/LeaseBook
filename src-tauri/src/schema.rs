// @generated automatically by Diesel CLI.

diesel::table! {
    lease_managers (id) {
        id -> Integer,
        name -> Text,
        phone_numbers -> Nullable<Text>,
        email -> Nullable<Text>,
        created_on -> Integer,
        last_modified -> Nullable<Integer>,
    }
}

diesel::table! {
    leases (id) {
        id -> Integer,
        name -> Text,
        address -> Nullable<Text>,
        size -> Nullable<Integer>,
        expiration_date -> Nullable<Integer>,
        notes -> Nullable<Text>,
        misc_data -> Nullable<Text>,
        created_on -> Integer,
        last_modified -> Nullable<Integer>,
    }
}

diesel::table! {
    leases_managers (manager_id, lease_id) {
        manager_id -> Integer,
        lease_id -> Integer,
    }
}

diesel::joinable!(leases_managers -> lease_managers (manager_id));
diesel::joinable!(leases_managers -> leases (lease_id));

diesel::allow_tables_to_appear_in_same_query!(lease_managers, leases, leases_managers,);
