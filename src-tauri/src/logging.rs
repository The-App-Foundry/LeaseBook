use std::error::Error;
use std::fmt;
use std::fs;
use std::path::{Path, PathBuf};

pub const DEFAULT_LOG_FILTER: &str = "leasebook=info,leasebook_lib=info,tauri=warn,wry=warn";
pub const LOG_FILE_PREFIX: &str = "leasebook";
pub const LOG_FILE_SUFFIX: &str = "jsonl";

pub struct LogGuard {
    _guard: tracing_appender::non_blocking::WorkerGuard,
}

#[derive(Debug)]
pub enum InitLoggingError {
    Io(std::io::Error),
    Appender(tracing_appender::rolling::InitError),
    Subscriber(tracing_subscriber::util::TryInitError),
}

impl fmt::Display for InitLoggingError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Io(error) => write!(formatter, "failed to initialize log file: {error}"),
            Self::Appender(error) => {
                write!(
                    formatter,
                    "failed to initialize rolling log appender: {error}"
                )
            }
            Self::Subscriber(error) => {
                write!(formatter, "failed to initialize log subscriber: {error}")
            }
        }
    }
}

impl Error for InitLoggingError {}

impl From<std::io::Error> for InitLoggingError {
    fn from(error: std::io::Error) -> Self {
        Self::Io(error)
    }
}

impl From<tracing_appender::rolling::InitError> for InitLoggingError {
    fn from(error: tracing_appender::rolling::InitError) -> Self {
        Self::Appender(error)
    }
}

impl From<tracing_subscriber::util::TryInitError> for InitLoggingError {
    fn from(error: tracing_subscriber::util::TryInitError) -> Self {
        Self::Subscriber(error)
    }
}

pub fn log_dir(app_data_dir: &Path) -> PathBuf {
    app_data_dir.join("logs")
}

pub fn init(app_data_dir: &Path) -> Result<LogGuard, InitLoggingError> {
    let log_dir = log_dir(app_data_dir);
    fs::create_dir_all(&log_dir)?;

    let file_appender = tracing_appender::rolling::RollingFileAppender::builder()
        .rotation(tracing_appender::rolling::Rotation::DAILY)
        .filename_prefix(LOG_FILE_PREFIX)
        .filename_suffix(LOG_FILE_SUFFIX)
        .build(log_dir)?;
    let (writer, guard) = tracing_appender::non_blocking(file_appender);

    let file_layer = tracing_subscriber::fmt::layer()
        .json()
        .flatten_event(true)
        .with_current_span(true)
        .with_span_list(true)
        .with_target(true)
        .with_thread_ids(true)
        .with_thread_names(true)
        .with_writer(writer);

    use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new(DEFAULT_LOG_FILTER)),
        )
        .with(file_layer)
        .try_init()?;

    Ok(LogGuard { _guard: guard })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn log_dir_lives_below_app_data() {
        let app_data_dir = Path::new("/tmp/leasebook-data");

        assert_eq!(log_dir(app_data_dir), Path::new("/tmp/leasebook-data/logs"));
    }

    #[test]
    fn log_file_prefix_is_json_lines() {
        assert_eq!(LOG_FILE_PREFIX, "leasebook");
        assert_eq!(LOG_FILE_SUFFIX, "jsonl");
    }

    #[test]
    fn default_filter_keeps_application_info_and_dependency_warnings() {
        assert!(DEFAULT_LOG_FILTER.contains("leasebook=info"));
        assert!(DEFAULT_LOG_FILTER.contains("leasebook_lib=info"));
        assert!(DEFAULT_LOG_FILTER.contains("tauri=warn"));
        assert!(DEFAULT_LOG_FILTER.contains("wry=warn"));
    }
}
