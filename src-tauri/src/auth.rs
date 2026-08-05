use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use argon2::password_hash::{PasswordHash, SaltString};
use argon2::{Argon2, PasswordHasher, PasswordVerifier};
use rand_core::OsRng;
use serde::{Deserialize, Serialize};
use webauthn_rs::prelude::{
    CreationChallengeResponse, Passkey, PasskeyAuthentication, PasskeyRegistration,
    PublicKeyCredential, RegisterPublicKeyCredential, RequestChallengeResponse, Url, Uuid,
    Webauthn, WebauthnBuilder,
};

use crate::error::AppError;

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct AuthStatus {
    pub password_enabled: bool,
    pub passkey_enabled: bool,
    pub authenticated: bool,
    pub next_factor: Option<AuthFactor>,
}

#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum AuthFactor {
    Password,
    Passkey,
}

#[derive(Debug, Deserialize, Serialize)]
struct AuthConfig {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    password_hash: Option<String>,
    #[serde(default = "new_user_id")]
    user_id: Uuid,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    passkeys: Vec<Passkey>,
    #[cfg(test)]
    #[serde(default, skip_serializing_if = "std::ops::Not::not")]
    test_passkey_enabled: bool,
}

pub struct AuthManager {
    path: PathBuf,
    authenticated: Mutex<bool>,
    password_factor_verified: Mutex<bool>,
    passkey_factor_verified: Mutex<bool>,
    webauthn: Webauthn,
    passkey_registration: Mutex<Option<PasskeyRegistration>>,
    passkey_authentication: Mutex<Option<PasskeyAuthentication>>,
}

impl AuthManager {
    pub fn new(path: PathBuf) -> Self {
        let authenticated = !path.exists();
        Self {
            path,
            authenticated: Mutex::new(authenticated),
            password_factor_verified: Mutex::new(false),
            passkey_factor_verified: Mutex::new(false),
            webauthn: build_webauthn(),
            passkey_registration: Mutex::new(None),
            passkey_authentication: Mutex::new(None),
        }
    }

    pub fn status(&self) -> Result<AuthStatus, AppError> {
        let config = self.read_config()?;
        let password_enabled = config
            .as_ref()
            .and_then(|config| config.password_hash.as_ref())
            .is_some();
        let passkey_enabled = config.as_ref().is_some_and(AuthConfig::has_passkey_factor);
        let authenticated = self.is_authenticated()?;

        Ok(AuthStatus {
            password_enabled,
            passkey_enabled,
            authenticated,
            next_factor: self.next_factor(password_enabled, passkey_enabled, authenticated)?,
        })
    }

    pub fn create_password(&self, password: &str) -> Result<AuthStatus, AppError> {
        validate_password(password)?;
        let mut config = self.read_config()?.unwrap_or_default();
        config.password_hash = Some(hash_password(password)?);
        self.write_config(&config)?;
        self.complete_authentication()?;
        self.status()
    }

    pub fn change_password(
        &self,
        current_password: &str,
        new_password: &str,
    ) -> Result<AuthStatus, AppError> {
        self.verify_password(current_password)?;
        validate_password(new_password)?;
        let mut config = self.read_config()?.unwrap_or_default();
        config.password_hash = Some(hash_password(new_password)?);
        self.write_config(&config)?;
        self.status()
    }

    pub fn disable_password(&self, current_password: &str) -> Result<AuthStatus, AppError> {
        let mut config = self.read_config()?.unwrap_or_default();
        if config.password_hash.is_some() {
            self.verify_password(current_password)?;
            config.password_hash = None;
            self.write_or_remove_config(&config)?;
        }

        self.complete_authentication()?;
        self.status()
    }

    pub fn verify_password_factor(&self, password: &str) -> Result<AuthStatus, AppError> {
        self.verify_password(password)?;
        self.set_password_factor_verified(true)?;
        self.status()
    }

    pub fn start_passkey_registration(&self) -> Result<CreationChallengeResponse, AppError> {
        self.require_authenticated()?;
        let config = self.read_config()?.unwrap_or_default();
        let exclude_credentials = config
            .passkeys
            .iter()
            .map(|passkey| passkey.cred_id().clone())
            .collect::<Vec<_>>();
        let (challenge, state) = self
            .webauthn
            .start_passkey_registration(
                config.user_id,
                "LeaseBook",
                "LeaseBook",
                Some(exclude_credentials),
            )
            .map_err(auth_error)?;

        let mut registration = self
            .passkey_registration
            .lock()
            .map_err(|_| AppError::internal("passkey registration lock was poisoned"))?;
        *registration = Some(state);
        Ok(challenge)
    }

    pub fn finish_passkey_registration(
        &self,
        credential: RegisterPublicKeyCredential,
    ) -> Result<AuthStatus, AppError> {
        self.require_authenticated()?;
        let state = self
            .passkey_registration
            .lock()
            .map_err(|_| AppError::internal("passkey registration lock was poisoned"))?
            .take()
            .ok_or_else(|| AppError::validation("No passkey registration is in progress."))?;
        let passkey = self
            .webauthn
            .finish_passkey_registration(&credential, &state)
            .map_err(auth_error)?;
        let mut config = self.read_config()?.unwrap_or_default();
        config.passkeys.push(passkey);
        self.write_config(&config)?;
        self.set_authenticated(true)?;
        self.status()
    }

    pub fn disable_passkeys(&self) -> Result<AuthStatus, AppError> {
        let mut config = self.read_config()?.unwrap_or_default();
        if config.has_passkey_factor() {
            if config.password_hash.is_some() && !self.is_password_factor_verified()? {
                return Err(AppError::validation(
                    "Password is required before removing passkeys.",
                ));
            }
            if !self.is_passkey_factor_verified()? {
                return Err(AppError::validation(
                    "Passkey is required before removing passkeys.",
                ));
            }
        }

        self.require_authenticated()?;
        config.passkeys.clear();
        #[cfg(test)]
        {
            config.test_passkey_enabled = false;
        }
        self.write_or_remove_config(&config)?;
        self.set_passkey_factor_verified(false)?;
        self.status()
    }

    pub fn login(&self, password: &str) -> Result<AuthStatus, AppError> {
        let Some(config) = self.read_config()? else {
            self.set_authenticated(true)?;
            return self.status();
        };

        if config.password_hash.is_none() {
            return Err(AppError::validation("Password protection is not enabled."));
        }

        self.verify_password(password)?;
        if config.has_passkey_factor() {
            self.set_password_factor_verified(true)?;
            self.set_authenticated(false)?;
        } else {
            self.complete_authentication()?;
        }
        self.status()
    }

    fn verify_password(&self, password: &str) -> Result<(), AppError> {
        let Some(config) = self.read_config()? else {
            return Err(AppError::validation("Password protection is not enabled."));
        };
        let Some(password_hash) = config.password_hash else {
            return Err(AppError::validation("Password protection is not enabled."));
        };

        let parsed_hash = PasswordHash::new(&password_hash)
            .map_err(|error| AppError::internal(error.to_string()))?;

        Argon2::default()
            .verify_password(password.as_bytes(), &parsed_hash)
            .map_err(|_| AppError::validation("Password is incorrect."))
    }

    pub fn start_passkey_login(&self) -> Result<RequestChallengeResponse, AppError> {
        let Some(config) = self.read_config()? else {
            return Err(AppError::validation(
                "Passkey authentication is not enabled.",
            ));
        };
        if config.password_hash.is_some() && !self.is_password_factor_verified()? {
            return Err(AppError::validation("Password is required before passkey."));
        }
        if config.passkeys.is_empty() {
            return Err(AppError::validation(
                "Passkey authentication is not enabled.",
            ));
        }

        let (challenge, state) = self
            .webauthn
            .start_passkey_authentication(&config.passkeys)
            .map_err(auth_error)?;
        let mut authentication = self
            .passkey_authentication
            .lock()
            .map_err(|_| AppError::internal("passkey authentication lock was poisoned"))?;
        *authentication = Some(state);
        Ok(challenge)
    }

    pub fn finish_passkey_login(
        &self,
        credential: PublicKeyCredential,
    ) -> Result<AuthStatus, AppError> {
        let mut config = self
            .read_config()?
            .ok_or_else(|| AppError::validation("Passkey authentication is not enabled."))?;
        if config.password_hash.is_some() && !self.is_password_factor_verified()? {
            return Err(AppError::validation("Password is required before passkey."));
        }

        let state = self
            .passkey_authentication
            .lock()
            .map_err(|_| AppError::internal("passkey authentication lock was poisoned"))?
            .take()
            .ok_or_else(|| AppError::validation("No passkey authentication is in progress."))?;
        let result = self
            .webauthn
            .finish_passkey_authentication(&credential, &state)
            .map_err(auth_error)?;
        let updated = config
            .passkeys
            .iter_mut()
            .find_map(|passkey| passkey.update_credential(&result))
            .is_some();
        if !updated {
            return Err(AppError::validation("Passkey is not registered."));
        }

        self.write_config(&config)?;
        self.set_passkey_factor_verified(true)?;
        self.complete_authentication()?;
        self.status()
    }

    pub fn logout(&self) -> Result<AuthStatus, AppError> {
        self.set_password_factor_verified(false)?;
        self.set_passkey_factor_verified(false)?;
        self.set_authenticated(!self.auth_enabled()?)?;
        self.status()
    }

    #[cfg(test)]
    pub(crate) fn enable_test_passkey_factor(&self) -> Result<AuthStatus, AppError> {
        let mut config = self.read_config()?.unwrap_or_default();
        config.test_passkey_enabled = true;
        self.write_config(&config)?;
        self.status()
    }

    #[cfg(test)]
    pub(crate) fn verify_test_passkey_factor(&self) -> Result<AuthStatus, AppError> {
        self.set_passkey_factor_verified(true)?;
        self.complete_authentication()?;
        self.status()
    }

    fn read_config(&self) -> Result<Option<AuthConfig>, AppError> {
        if !self.config_exists() {
            return Ok(None);
        }

        let json = fs::read_to_string(&self.path)
            .map_err(|error| AppError::internal(error.to_string()))?;
        serde_json::from_str(&json).map(Some).map_err(|error| {
            AppError::internal(format!("failed to parse auth configuration: {error}"))
        })
    }

    fn write_or_remove_config(&self, config: &AuthConfig) -> Result<(), AppError> {
        if config.is_empty() {
            if self.path.exists() {
                fs::remove_file(&self.path)
                    .map_err(|error| AppError::internal(error.to_string()))?;
            }
            return Ok(());
        }

        self.write_config(config)
    }

    fn write_config(&self, config: &AuthConfig) -> Result<(), AppError> {
        let json = serde_json::to_string_pretty(config)
            .map_err(|error| AppError::internal(error.to_string()))?;

        if let Some(parent) = self.path.parent() {
            fs::create_dir_all(parent).map_err(|error| AppError::internal(error.to_string()))?;
        }

        fs::write(&self.path, json).map_err(|error| AppError::internal(error.to_string()))
    }

    fn auth_enabled(&self) -> Result<bool, AppError> {
        Ok(self.read_config()?.is_some_and(|config| !config.is_empty()))
    }

    fn config_exists(&self) -> bool {
        self.path.exists()
    }

    fn is_authenticated(&self) -> Result<bool, AppError> {
        self.authenticated
            .lock()
            .map(|guard| *guard)
            .map_err(|_| AppError::internal("auth session lock was poisoned"))
    }

    fn set_authenticated(&self, value: bool) -> Result<(), AppError> {
        let mut guard = self
            .authenticated
            .lock()
            .map_err(|_| AppError::internal("auth session lock was poisoned"))?;
        *guard = value;
        Ok(())
    }

    fn is_password_factor_verified(&self) -> Result<bool, AppError> {
        self.password_factor_verified
            .lock()
            .map(|guard| *guard)
            .map_err(|_| AppError::internal("auth factor lock was poisoned"))
    }

    fn set_password_factor_verified(&self, value: bool) -> Result<(), AppError> {
        let mut guard = self
            .password_factor_verified
            .lock()
            .map_err(|_| AppError::internal("auth factor lock was poisoned"))?;
        *guard = value;
        Ok(())
    }

    fn is_passkey_factor_verified(&self) -> Result<bool, AppError> {
        self.passkey_factor_verified
            .lock()
            .map(|guard| *guard)
            .map_err(|_| AppError::internal("auth factor lock was poisoned"))
    }

    fn set_passkey_factor_verified(&self, value: bool) -> Result<(), AppError> {
        let mut guard = self
            .passkey_factor_verified
            .lock()
            .map_err(|_| AppError::internal("auth factor lock was poisoned"))?;
        *guard = value;
        Ok(())
    }

    fn complete_authentication(&self) -> Result<(), AppError> {
        self.set_authenticated(true)
    }

    fn next_factor(
        &self,
        password_enabled: bool,
        passkey_enabled: bool,
        authenticated: bool,
    ) -> Result<Option<AuthFactor>, AppError> {
        if authenticated {
            return Ok(None);
        }

        if password_enabled && !self.is_password_factor_verified()? {
            return Ok(Some(AuthFactor::Password));
        }

        if passkey_enabled {
            return Ok(Some(AuthFactor::Passkey));
        }

        Ok(None)
    }

    fn require_authenticated(&self) -> Result<(), AppError> {
        if self.is_authenticated()? {
            Ok(())
        } else {
            Err(AppError::validation("Authentication is required."))
        }
    }
}

pub fn auth_file_path(app_data: &Path) -> PathBuf {
    app_data.join("auth.json")
}

fn validate_password(password: &str) -> Result<(), AppError> {
    if password.is_empty() {
        return Err(AppError::validation("Password is required."));
    }

    if password.len() < 8 {
        return Err(AppError::validation(
            "Password must be at least 8 characters.",
        ));
    }

    Ok(())
}

impl Default for AuthConfig {
    fn default() -> Self {
        Self {
            password_hash: None,
            user_id: new_user_id(),
            passkeys: Vec::new(),
            #[cfg(test)]
            test_passkey_enabled: false,
        }
    }
}

impl AuthConfig {
    fn is_empty(&self) -> bool {
        self.password_hash.is_none() && !self.has_passkey_factor()
    }

    fn has_passkey_factor(&self) -> bool {
        !self.passkeys.is_empty() || {
            #[cfg(test)]
            {
                self.test_passkey_enabled
            }
            #[cfg(not(test))]
            {
                false
            }
        }
    }
}

fn hash_password(password: &str) -> Result<String, AppError> {
    let salt = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map(|hash| hash.to_string())
        .map_err(|error| AppError::internal(error.to_string()))
}

fn new_user_id() -> Uuid {
    Uuid::new_v4()
}

fn auth_error(error: impl std::fmt::Display) -> AppError {
    AppError::validation(format!("Passkey verification failed: {error}"))
}

fn build_webauthn() -> Webauthn {
    let (rp_id, rp_origin) = webauthn_relying_party();
    let rp_origin = Url::parse(rp_origin).expect("invalid passkey relying party origin");
    WebauthnBuilder::new(rp_id, &rp_origin)
        .expect("invalid passkey relying party configuration")
        .rp_name("LeaseBook")
        .allow_any_port(true)
        .build()
        .expect("failed to build passkey verifier")
}

fn webauthn_relying_party() -> (&'static str, &'static str) {
    ("localhost", "http://localhost:1420")
}
