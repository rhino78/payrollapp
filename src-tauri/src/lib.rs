use dotenvy::dotenv;
use std::env;
use std::sync::Mutex;
use tauri::Manager;
use tracing::{error, info};
use tracing_appender::rolling;
use tracing_subscriber::EnvFilter;

mod db;
mod employee;
mod import;
mod payroll;
mod updates;

use db::{
    auto_backup, cleanup_old_backups, count_backups, get_db_path, get_last_backup_time,
    init_database, AppState,
};
use employee::{
    add_employee, delete_employee, get_employee_by_id, get_employees, get_employees_by_pay_date,
    update_employee,
};
use import::start_withholding_import;
use payroll::{
    add_payroll, calculate_withholding, check_withholding_data, delete_payroll, get_date_of_pay,
    get_payroll_by_id, get_payroll_report,
};
use updates::{check_for_updates_tauri, perform_update_tauri};

//check env vars before doing anything
#[tauri::command]
fn check_env_vars() -> Result<(), String> {
    dotenv().ok();
    if env::var("TWELVE_KEY").is_err() {
        error!("TWELVE_KEY not set");
        return Err("Missing enviornment variable: TWELVE_KEY".into());
    }

    Ok(())
}

//get api key for chart api
#[tauri::command]
fn get_api_key() -> Result<String, String> {
    dotenv().ok();
    let api_key = env::var("TWELVE_KEY").expect("TWELVE_KEY not set");
    Ok(api_key)
}

// Setup the application state
fn setup_app(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    std::fs::create_dir_all(&app_dir)?;
    let conn = init_database(app_dir.clone())?;
    app.manage(AppState {
        db_connection: Mutex::new(conn),
        db_path: app_dir,
    });

    Ok(())
}

///main
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let file_appender = rolling::daily("logs", "pharmacy.log");
    let (non_blocking, _guard) = tracing_appender::non_blocking(file_appender);

    tracing_subscriber::fmt()
        .with_writer(non_blocking)
        .with_env_filter(EnvFilter::new("trace"))
        .with_ansi(false)
        .compact()
        .init();

    info!("logging system initialized");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(setup_app)
        .invoke_handler(tauri::generate_handler![
            get_employees,
            get_employee_by_id,
            add_employee,
            update_employee,
            delete_employee,
            add_payroll,
            get_payroll_by_id,
            delete_payroll,
            get_date_of_pay,
            check_for_updates_tauri,
            perform_update_tauri,
            get_employees_by_pay_date,
            get_api_key,
            get_payroll_report,
            get_db_path,
            auto_backup,
            cleanup_old_backups,
            calculate_withholding,
            check_withholding_data,
            check_env_vars,
            count_backups,
            get_last_backup_time,
            start_withholding_import
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
