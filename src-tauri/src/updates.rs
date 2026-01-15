use dotenvy::dotenv;
use semver::Version;
use serde_json::Value;
use std::env;
use tracing::error;
use tracing::info;

const CURRENT_VERSION: &str = env!("CARGO_PKG_VERSION");
// const API_URL: &str = "https://api.github.com/repos/rhino78/payrollapp/releases/latest";
const API_URL: &str = "https://github.com/rhino78/payrollapp/releases/latest/download/latest.json";

struct AppVersion {
    current_rev: String,
    release_notes: String,
    online_rev: String,
}

// Command to update the system
#[tauri::command]
pub fn perform_update_tauri() -> Result<String, String> {
    info!("begining update");

    match self_update::backends::github::Update::configure()
        .repo_owner("rhino78")
        .repo_name("payrollapp")
        .bin_name("payroll")
        .show_download_progress(true)
        .current_version(CURRENT_VERSION)
        .build()
        .and_then(|u| u.update())
    {
        Ok(status) => {
            let msg = format!("✅ Updated to version {}", status.version());
            Ok(msg)
        }
        Err(err) => {
            let err_msg = format!("❌ Update failed: {}", err);
            println!("{}", err_msg);
            error!("{}", err_msg);
            Err(err_msg)
        }
    }
}
///updates
fn check_for_updates_blocking() -> Result<AppVersion, String> {
    dotenv().ok();

    match dotenvy::var("GITHUB_PAT") {
        Ok(s) => _ = s,
        Err(e) => {
            error!("No token: {}", e);
            println!("github err: {}", e);
            return Err(format!("No token: {}", e).into());
        }
    }

    let client = reqwest::blocking::Client::new();
    let response = client
        .get(API_URL)
        .header("User-Agent", "payroll/1.0(rshave@gmail.com)")
        .header(
            "Authorization",
            format!("token {}", dotenvy::var("GITHUB_PAT").unwrap()),
        )
        .send()
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        let error_text = response.text().unwrap_or_default();
        println!("Request error: {}", error_text);
        error!("Request error: {}", error_text);
        return Err(format!("Request failed: {}", error_text));
    }

    let body = response.text().map_err(|e| e.to_string())?;
    let json: Value = serde_json::from_str(&body).map_err(|e| e.to_string())?;

    let release_notes = json
        .get("notes")
        .and_then(Value::as_str)
        .unwrap_or("No release notes available")
        .to_string();

    let latest_version_str = match json.get("version") {
        Some(Value::String(s)) => s.to_string(),
        _ => return Err("Could not find a version field  or it's missing".into()),
    };

    let current_version = Version::parse(CURRENT_VERSION).map_err(|e| e.to_string())?;
    let latest_version = Version::parse(&latest_version_str).map_err(|e| e.to_string())?;

    Ok(AppVersion {
        release_notes,
        current_rev: current_version.to_string(),
        online_rev: latest_version.to_string(),
    })
}

/// check for updates
#[tauri::command]
pub fn check_for_updates_tauri() -> Result<(Option<String>, String), String> {
    match check_for_updates_blocking() {
        Ok(app_version) => {
            if app_version.online_rev != app_version.current_rev {
                Ok((Some(app_version.online_rev), app_version.release_notes))
            } else {
                Ok((None, app_version.release_notes))
            }
        }
        Err(e) => Err(e),
    }
}

// In updates.rs
#[cfg(test)]
mod tests {
    use semver::Version;

    #[test]
    fn test_version_comparison() {
        let current = Version::parse("1.2.3").unwrap();
        let newer = Version::parse("1.3.0").unwrap();
        let older = Version::parse("1.2.2").unwrap();

        assert!(newer > current);
        assert!(older < current);
    }
}
