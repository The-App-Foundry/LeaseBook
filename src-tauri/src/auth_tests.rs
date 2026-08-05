use std::fs;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::auth::{AuthFactor, AuthManager, AuthStatus};

fn test_auth_path(name: &str) -> std::path::PathBuf {
    let unique = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    std::env::temp_dir().join(format!("leasebook-auth-{name}-{unique}.json"))
}

#[test]
fn password_setup_starts_disabled() {
    let path = test_auth_path("disabled");
    let manager = AuthManager::new(path.clone());

    assert_eq!(
        manager.status().unwrap(),
        AuthStatus {
            password_enabled: false,
            passkey_enabled: false,
            authenticated: true,
            next_factor: None,
        }
    );

    let _ = fs::remove_file(path);
}

#[test]
fn create_password_persists_setup_without_storing_plaintext() {
    let path = test_auth_path("create");
    let manager = AuthManager::new(path.clone());

    manager
        .create_password("correct horse battery staple")
        .unwrap();

    let stored = fs::read_to_string(&path).unwrap();
    assert!(!stored.contains("correct horse battery staple"));
    assert_eq!(
        manager.status().unwrap(),
        AuthStatus {
            password_enabled: true,
            passkey_enabled: false,
            authenticated: true,
            next_factor: None,
        }
    );

    let reloaded = AuthManager::new(path.clone());
    assert_eq!(
        reloaded.status().unwrap(),
        AuthStatus {
            password_enabled: true,
            passkey_enabled: false,
            authenticated: false,
            next_factor: Some(AuthFactor::Password),
        }
    );

    let _ = fs::remove_file(path);
}

#[test]
fn login_requires_the_created_password_and_logout_clears_session() {
    let path = test_auth_path("login");
    let manager = AuthManager::new(path.clone());
    manager.create_password("correct password").unwrap();
    manager.logout().unwrap();

    assert!(manager.login("wrong password").is_err());
    assert_eq!(
        manager.status().unwrap(),
        AuthStatus {
            password_enabled: true,
            passkey_enabled: false,
            authenticated: false,
            next_factor: Some(AuthFactor::Password),
        }
    );

    manager.login("correct password").unwrap();
    assert_eq!(
        manager.status().unwrap(),
        AuthStatus {
            password_enabled: true,
            passkey_enabled: false,
            authenticated: true,
            next_factor: None,
        }
    );

    manager.logout().unwrap();
    assert_eq!(
        manager.status().unwrap(),
        AuthStatus {
            password_enabled: true,
            passkey_enabled: false,
            authenticated: false,
            next_factor: Some(AuthFactor::Password),
        }
    );

    let _ = fs::remove_file(path);
}

#[test]
fn change_password_requires_current_password_and_replaces_hash() {
    let path = test_auth_path("change");
    let manager = AuthManager::new(path.clone());
    manager.create_password("correct password").unwrap();
    let original = fs::read_to_string(&path).unwrap();

    assert!(
        manager
            .change_password("wrong password", "new password")
            .is_err()
    );
    assert_eq!(fs::read_to_string(&path).unwrap(), original);

    manager
        .change_password("correct password", "new password")
        .unwrap();
    let changed = fs::read_to_string(&path).unwrap();
    assert_ne!(changed, original);

    manager.logout().unwrap();
    assert!(manager.login("correct password").is_err());
    manager.login("new password").unwrap();

    let _ = fs::remove_file(path);
}

#[test]
fn disable_password_requires_current_password_and_removes_config() {
    let path = test_auth_path("disable");
    let manager = AuthManager::new(path.clone());
    manager.create_password("correct password").unwrap();

    assert!(manager.disable_password("wrong password").is_err());
    assert!(path.exists());

    assert_eq!(
        manager.disable_password("correct password").unwrap(),
        AuthStatus {
            password_enabled: false,
            passkey_enabled: false,
            authenticated: true,
            next_factor: None,
        }
    );
    assert!(!path.exists());

    let reloaded = AuthManager::new(path.clone());
    assert_eq!(
        reloaded.status().unwrap(),
        AuthStatus {
            password_enabled: false,
            passkey_enabled: false,
            authenticated: true,
            next_factor: None,
        }
    );

    let _ = fs::remove_file(path);
}

#[test]
fn passkey_registration_requires_authenticated_session() {
    let path = test_auth_path("passkey-locked");
    let manager = AuthManager::new(path.clone());
    manager.create_password("correct password").unwrap();
    manager.logout().unwrap();

    assert!(manager.start_passkey_registration().is_err());

    let _ = fs::remove_file(path);
}

#[test]
fn passkey_login_requires_a_registered_passkey() {
    let path = test_auth_path("passkey-missing");
    let manager = AuthManager::new(path.clone());

    assert!(manager.start_passkey_login().is_err());

    let _ = fs::remove_file(path);
}

#[test]
fn mfa_requires_password_then_passkey_when_both_local_methods_are_enabled() {
    let path = test_auth_path("mfa");
    let manager = AuthManager::new(path.clone());
    manager.create_password("correct password").unwrap();
    manager.enable_test_passkey_factor().unwrap();
    manager.logout().unwrap();

    assert_eq!(
        manager.status().unwrap(),
        AuthStatus {
            password_enabled: true,
            passkey_enabled: true,
            authenticated: false,
            next_factor: Some(AuthFactor::Password),
        }
    );
    assert!(manager.start_passkey_login().is_err());
    assert!(manager.login("wrong password").is_err());

    assert_eq!(
        manager.login("correct password").unwrap(),
        AuthStatus {
            password_enabled: true,
            passkey_enabled: true,
            authenticated: false,
            next_factor: Some(AuthFactor::Passkey),
        }
    );

    let _ = fs::remove_file(path);
}

#[test]
fn passkey_only_auth_prompts_for_passkey_first() {
    let path = test_auth_path("passkey-only");
    let manager = AuthManager::new(path.clone());
    manager.enable_test_passkey_factor().unwrap();
    manager.logout().unwrap();

    assert_eq!(
        manager.status().unwrap(),
        AuthStatus {
            password_enabled: false,
            passkey_enabled: true,
            authenticated: false,
            next_factor: Some(AuthFactor::Passkey),
        }
    );

    let _ = fs::remove_file(path);
}

#[test]
fn disabling_passkeys_requires_password_then_passkey_when_password_is_enabled() {
    let path = test_auth_path("disable-passkeys-mfa");
    let manager = AuthManager::new(path.clone());
    manager.create_password("correct password").unwrap();
    manager.enable_test_passkey_factor().unwrap();

    assert!(manager.disable_passkeys().is_err());
    manager.verify_password_factor("correct password").unwrap();
    assert!(manager.disable_passkeys().is_err());

    assert_eq!(
        manager.verify_test_passkey_factor().unwrap(),
        AuthStatus {
            password_enabled: true,
            passkey_enabled: true,
            authenticated: true,
            next_factor: None,
        }
    );
    assert_eq!(
        manager.disable_passkeys().unwrap(),
        AuthStatus {
            password_enabled: true,
            passkey_enabled: false,
            authenticated: true,
            next_factor: None,
        }
    );

    let _ = fs::remove_file(path);
}

#[test]
fn disabling_passkeys_requires_passkey_when_passkey_is_the_only_factor() {
    let path = test_auth_path("disable-passkey-only");
    let manager = AuthManager::new(path.clone());
    manager.enable_test_passkey_factor().unwrap();

    assert!(manager.disable_passkeys().is_err());

    manager.verify_test_passkey_factor().unwrap();
    assert_eq!(
        manager.disable_passkeys().unwrap(),
        AuthStatus {
            password_enabled: false,
            passkey_enabled: false,
            authenticated: true,
            next_factor: None,
        }
    );
    assert!(!path.exists());

    let _ = fs::remove_file(path);
}
