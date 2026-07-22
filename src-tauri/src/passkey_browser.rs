use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::thread;
use std::time::{Duration, Instant};

use serde::Serialize;
use serde_json::Value;
use webauthn_rs::prelude::{PublicKeyCredential, RegisterPublicKeyCredential};

use crate::auth::{AuthManager, AuthStatus};
use crate::error::AppError;

const CEREMONY_TIMEOUT: Duration = Duration::from_secs(300);
const REQUEST_READ_TIMEOUT: Duration = Duration::from_secs(5);
const MAX_REQUEST_BYTES: usize = 128 * 1024;

pub type CeremonyCleanup = Box<dyn FnOnce() + Send + 'static>;

enum CeremonyMode {
    Register,
    Login,
}

enum CeremonyResult {
    Credential(Value),
    ClientError(String),
}

pub fn register(
    auth: &AuthManager,
    open_browser: impl FnOnce(&str) -> Result<CeremonyCleanup, AppError>,
) -> Result<AuthStatus, AppError> {
    let challenge = auth.start_passkey_registration()?;
    let credential = run_ceremony(CeremonyMode::Register, &challenge, open_browser)?;
    let credential: RegisterPublicKeyCredential = serde_json::from_value(credential)
        .map_err(|error| AppError::validation(error.to_string()))?;

    auth.finish_passkey_registration(credential)
}

pub fn login(
    auth: &AuthManager,
    open_browser: impl FnOnce(&str) -> Result<CeremonyCleanup, AppError>,
) -> Result<AuthStatus, AppError> {
    let challenge = auth.start_passkey_login()?;
    let credential = run_ceremony(CeremonyMode::Login, &challenge, open_browser)?;
    let credential: PublicKeyCredential = serde_json::from_value(credential)
        .map_err(|error| AppError::validation(error.to_string()))?;

    auth.finish_passkey_login(credential)
}

fn run_ceremony<T: Serialize>(
    mode: CeremonyMode,
    challenge: &T,
    open_browser: impl FnOnce(&str) -> Result<CeremonyCleanup, AppError>,
) -> Result<Value, AppError> {
    let listener = TcpListener::bind(("127.0.0.1", 0))
        .map_err(|error| AppError::internal(error.to_string()))?;
    listener
        .set_nonblocking(true)
        .map_err(|error| AppError::internal(error.to_string()))?;

    let port = listener
        .local_addr()
        .map_err(|error| AppError::internal(error.to_string()))?
        .port();
    let url = format!("http://localhost:{port}/");
    let page = ceremony_page(mode, challenge)?;

    let _cleanup = CleanupGuard::new(open_browser(&url)?);

    let deadline = Instant::now() + CEREMONY_TIMEOUT;
    while Instant::now() < deadline {
        match listener.accept() {
            Ok((stream, address)) => {
                if !address.ip().is_loopback() {
                    continue;
                }

                match handle_connection(stream, &page)? {
                    Some(CeremonyResult::Credential(credential)) => return Ok(credential),
                    Some(CeremonyResult::ClientError(message)) => {
                        return Err(AppError::validation(message));
                    }
                    None => {}
                }
            }
            Err(error) if error.kind() == std::io::ErrorKind::WouldBlock => {
                thread::sleep(Duration::from_millis(50));
            }
            Err(error) => return Err(AppError::internal(error.to_string())),
        }
    }

    Err(AppError::validation("Passkey browser ceremony timed out."))
}

struct CleanupGuard(Option<CeremonyCleanup>);

impl CleanupGuard {
    fn new(cleanup: CeremonyCleanup) -> Self {
        Self(Some(cleanup))
    }
}

impl Drop for CleanupGuard {
    fn drop(&mut self) {
        if let Some(cleanup) = self.0.take() {
            cleanup();
        }
    }
}

fn handle_connection(
    mut stream: TcpStream,
    page: &str,
) -> Result<Option<CeremonyResult>, AppError> {
    stream
        .set_read_timeout(Some(REQUEST_READ_TIMEOUT))
        .map_err(|error| AppError::internal(error.to_string()))?;
    let request = read_request(&mut stream)?;
    let Some((head, body)) = split_request(&request) else {
        write_response(&mut stream, 400, "text/plain; charset=utf-8", "Bad request")?;
        return Ok(None);
    };
    let request_line = head.lines().next().unwrap_or_default();

    if request_line.starts_with("GET / ") {
        write_response(&mut stream, 200, "text/html; charset=utf-8", page)?;
        return Ok(None);
    }

    if request_line.starts_with("GET /favicon.ico ") {
        write_response(&mut stream, 204, "text/plain; charset=utf-8", "")?;
        return Ok(None);
    }

    if request_line.starts_with("POST /credential ") {
        write_response(
            &mut stream,
            200,
            "text/html; charset=utf-8",
            completion_page("Passkey complete. You can close this tab."),
        )?;
        let credential = serde_json::from_slice(body)
            .map_err(|error| AppError::validation(format!("Invalid passkey response: {error}")))?;
        return Ok(Some(CeremonyResult::Credential(credential)));
    }

    if request_line.starts_with("POST /error ") {
        write_response(
            &mut stream,
            200,
            "text/html; charset=utf-8",
            completion_page("Passkey was not completed. You can close this tab."),
        )?;
        let value: Value = serde_json::from_slice(body)
            .map_err(|error| AppError::validation(format!("Invalid passkey error: {error}")))?;
        let message = value
            .get("message")
            .and_then(Value::as_str)
            .unwrap_or("Passkey ceremony was canceled.")
            .to_string();
        return Ok(Some(CeremonyResult::ClientError(message)));
    }

    write_response(&mut stream, 404, "text/plain; charset=utf-8", "Not found")?;
    Ok(None)
}

fn read_request(stream: &mut TcpStream) -> Result<Vec<u8>, AppError> {
    let mut request = Vec::new();
    let mut buffer = [0_u8; 4096];

    loop {
        let count = stream
            .read(&mut buffer)
            .map_err(|error| AppError::internal(error.to_string()))?;
        if count == 0 {
            break;
        }
        request.extend_from_slice(&buffer[..count]);
        if request.len() > MAX_REQUEST_BYTES {
            return Err(AppError::validation("Passkey response is too large."));
        }
        if let Some((head, body)) = split_request(&request) {
            let content_length = content_length(head)?;
            if body.len() >= content_length {
                break;
            }
        }
    }

    Ok(request)
}

fn split_request(request: &[u8]) -> Option<(&str, &[u8])> {
    let header_end = request
        .windows(4)
        .position(|window| window == b"\r\n\r\n")?;
    let head = std::str::from_utf8(&request[..header_end]).ok()?;
    Some((head, &request[header_end + 4..]))
}

fn content_length(head: &str) -> Result<usize, AppError> {
    let Some(value) = head.lines().find_map(|line| {
        line.split_once(':').and_then(|(name, value)| {
            name.eq_ignore_ascii_case("content-length")
                .then(|| value.trim())
        })
    }) else {
        return Ok(0);
    };

    let length = value
        .parse::<usize>()
        .map_err(|error| AppError::validation(format!("Invalid content length: {error}")))?;
    if length > MAX_REQUEST_BYTES {
        return Err(AppError::validation("Passkey response is too large."));
    }

    Ok(length)
}

fn write_response(
    stream: &mut TcpStream,
    status: u16,
    content_type: &str,
    body: &str,
) -> Result<(), AppError> {
    let reason = match status {
        200 => "OK",
        204 => "No Content",
        400 => "Bad Request",
        404 => "Not Found",
        _ => "OK",
    };
    let response = format!(
        "HTTP/1.1 {status} {reason}\r\nContent-Type: {content_type}\r\nContent-Length: {}\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n{body}",
        body.len()
    );
    stream
        .write_all(response.as_bytes())
        .map_err(|error| AppError::internal(error.to_string()))
}

fn ceremony_page<T: Serialize>(mode: CeremonyMode, challenge: &T) -> Result<String, AppError> {
    let mode = match mode {
        CeremonyMode::Register => "register",
        CeremonyMode::Login => "login",
    };
    let challenge =
        serde_json::to_string(challenge).map_err(|error| AppError::internal(error.to_string()))?;

    Ok(format!(
        r#"<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>LeaseBook Passkey</title>
  <style>
    body {{
      align-items: center;
      background: #f4f5f7;
      color: #1c2333;
      display: flex;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      justify-content: center;
      margin: 0;
      min-height: 100vh;
      padding: 32px;
    }}
    main {{
      background: #ffffff;
      border: 1px solid #e4e6eb;
      border-radius: 8px;
      max-width: 420px;
      padding: 24px;
      width: 100%;
    }}
    h1 {{
      font-size: 20px;
      margin: 0 0 8px;
    }}
    p {{
      color: #4b5262;
      line-height: 1.5;
      margin: 0;
    }}
  </style>
</head>
<body>
  <main>
    <h1>LeaseBook passkey</h1>
    <p id="status">Waiting for your browser passkey prompt...</p>
  </main>
  <script>
    const mode = "{mode}";
    const challenge = {challenge};
    const status = document.getElementById("status");

    const base64UrlToBuffer = (value) => {{
      const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
      const binary = atob(padded);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) {{
        bytes[index] = binary.charCodeAt(index);
      }}
      return bytes.buffer;
    }};

    const bufferToBase64Url = (buffer) => {{
      if (buffer === null || buffer === undefined) {{
        return null;
      }}
      const bytes = new Uint8Array(buffer);
      let binary = "";
      bytes.forEach((byte) => {{
        binary += String.fromCharCode(byte);
      }});
      return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    }};

    const prepareCreationOptions = (input) => ({{
      publicKey: {{
        ...input.publicKey,
        challenge: base64UrlToBuffer(input.publicKey.challenge),
        user: {{
          ...input.publicKey.user,
          id: base64UrlToBuffer(input.publicKey.user.id),
        }},
        excludeCredentials: input.publicKey.excludeCredentials?.map((credential) => ({{
          ...credential,
          id: base64UrlToBuffer(credential.id),
        }})),
      }},
    }});

    const prepareRequestOptions = (input) => ({{
      publicKey: {{
        ...input.publicKey,
        challenge: base64UrlToBuffer(input.publicKey.challenge),
        allowCredentials: input.publicKey.allowCredentials?.map((credential) => ({{
          ...credential,
          id: base64UrlToBuffer(credential.id),
        }})),
      }},
    }});

    const serializeCredential = (credential) => {{
      const base = {{
        id: credential.id,
        rawId: bufferToBase64Url(credential.rawId),
        type: credential.type,
        authenticatorAttachment: credential.authenticatorAttachment,
        clientExtensionResults: credential.getClientExtensionResults(),
      }};

      if ("attestationObject" in credential.response) {{
        return {{
          ...base,
          response: {{
            attestationObject: bufferToBase64Url(credential.response.attestationObject),
            clientDataJSON: bufferToBase64Url(credential.response.clientDataJSON),
            transports: credential.response.getTransports?.() ?? [],
          }},
        }};
      }}

      return {{
        ...base,
        response: {{
          authenticatorData: bufferToBase64Url(credential.response.authenticatorData),
          clientDataJSON: bufferToBase64Url(credential.response.clientDataJSON),
          signature: bufferToBase64Url(credential.response.signature),
          userHandle: bufferToBase64Url(credential.response.userHandle),
        }},
      }};
    }};

    const postJson = (path, body) => fetch(path, {{
      method: "POST",
      headers: {{ "Content-Type": "application/json" }},
      body: JSON.stringify(body),
    }});

    (async () => {{
      try {{
        if (!window.PublicKeyCredential || !navigator.credentials) {{
          throw new Error("This browser does not support passkeys.");
        }}

        const credential = mode === "register"
          ? await navigator.credentials.create(prepareCreationOptions(challenge))
          : await navigator.credentials.get(prepareRequestOptions(challenge));

        if (!credential) {{
          throw new Error("Passkey ceremony was canceled.");
        }}

        await postJson("/credential", serializeCredential(credential));
        status.textContent = "Passkey complete. Closing...";
        window.setTimeout(() => window.close(), 350);
      }} catch (error) {{
        const message = error instanceof Error ? error.message : "Passkey ceremony failed.";
        await postJson("/error", {{ message }});
        status.textContent = message;
      }}
    }})();
  </script>
</body>
</html>"#
    ))
}

fn completion_page(message: &str) -> &str {
    message
}
