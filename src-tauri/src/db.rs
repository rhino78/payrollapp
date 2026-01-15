use chrono::prelude::*;
use rusqlite::{params, Connection, OptionalExtension, Result as SqlResult};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::State;
use tracing::info;

const DB_NAME: &str = "payroll.db";

// Define a struct to represent the database connection
pub struct AppState {
    pub db_connection: Mutex<Connection>,
    pub db_path: PathBuf,
}

// returns the path of the database
#[tauri::command]
pub fn get_last_backup_time(state: State<'_, AppState>) -> Result<u64, String> {
    let conn = state.db_connection.lock().map_err(|e| e.to_string())?;
    let last_backup_time = get_last_backup_timestamp(&conn).map_err(|e| e.to_string())?;
    Ok(last_backup_time.unwrap_or(0))
}
// returns the path of the database
#[tauri::command]
pub fn get_db_path(state: State<'_, AppState>) -> String {
    let db_path = state.db_path.join(DB_NAME);
    db_path.display().to_string()
}

#[tauri::command]
pub fn count_backups(state: State<AppState>) -> Result<usize, String> {
    let backup_dir = state.db_path.join("backups");

    let count = std::fs::read_dir(backup_dir)
        .map_err(|e| e.to_string())?
        .filter_map(|entry| entry.ok())
        .filter(|e| {
            e.file_name()
                .to_string_lossy()
                .starts_with("payroll_backup")
        })
        .count();

    Ok(count)
}

// auto run of backup cleanup
#[tauri::command]
pub fn cleanup_old_backups(keep_days: usize, state: State<'_, AppState>) {
    let backup_dir = state.db_path.clone();
    let mut files: Vec<_> = match fs::read_dir(backup_dir) {
        Ok(read_dir) => read_dir
            .filter_map(|entry| entry.ok())
            .filter(|e| {
                e.file_name()
                    .to_string_lossy()
                    .starts_with("payroll_backup")
            })
            .collect(),
        Err(_) => return,
    };

    files.sort_by_key(|e| {
        e.metadata()
            .ok()
            .and_then(|m| m.modified().ok())
            .unwrap_or(UNIX_EPOCH)
    });

    files.reverse();

    for file in files.iter().skip(keep_days) {
        info!(event = "backup", result = "skipped");
        let _ = fs::remove_file(file.path());
    }
}

fn get_last_backup_timestamp(conn: &Connection) -> SqlResult<Option<u64>> {
    let mut stmt = conn.prepare("SELECT value FROM schema_data WHERE key = 'last_backup'")?;
    let result: Option<String> = stmt.query_row([], |row| row.get(0)).optional()?;
    Ok(result.and_then(|val| val.parse::<u64>().ok()))
}

fn set_last_backup_timestamp(conn: &Connection, timestamp: u64) -> SqlResult<()> {
    conn.execute(
        "INSERT INTO schema_data (key, value)
        VALUES ('last_backup', ?1)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        params![timestamp.to_string()],
    )?;
    Ok(())
}

#[tauri::command]
pub fn auto_backup(state: State<AppState>) -> Result<(), String> {
    let app_dir = state.db_path.clone();
    backup_db(&app_dir).map_err(|e| e.to_string())
}

fn backup_db(app_dir: &PathBuf) -> SqlResult<()> {
    let src_path = app_dir.join(DB_NAME);
    let backup_dir = app_dir.join("backups");

    fs::create_dir_all(&backup_dir).ok();

    let src_conn = Connection::open(&src_path)?;

    let last_backup_time = get_last_backup_timestamp(&src_conn)?.unwrap_or(0);
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();
    let age = now.saturating_sub(last_backup_time);

    if age > 60 * 60 * 24 {
        let date_str = Local::now().format("%Y-%m-%d").to_string();
        let backup_path = backup_dir.join(format!("payroll_backup_{}.db", date_str));

        println!("Created dates backup at {:?}", backup_path);
        info!("Created dates backup at {:?}", backup_path);

        let mut dest_conn = Connection::open(&backup_path)?;
        let backup = rusqlite::backup::Backup::new(&src_conn, &mut dest_conn)?;
        backup.step(-1)?;

        set_last_backup_timestamp(&src_conn, now)?;
        info!("Backup completed")
    } else {
        info!(event = "backup", result = "skipped");
    }

    Ok(())
}

// Initialize the database connection and create tables
pub fn init_database(app_dir: PathBuf) -> SqlResult<Connection> {
    info!(event = "init", result = "inititalized");
    let db_path = app_dir.join(DB_NAME);
    let conn = Connection::open(&db_path)?;
    println!("the db is in: {:?}", &db_path);

    conn.execute(
        "CREATE TABLE IF NOT EXISTS withholding (
                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                      filing_status TEXT,
                      pay_period TEXT,
                      wage_min REAL,
                      wage_max REAL,
                      dependents_0 REAL,
                      dependents_1 REAL,
                      dependents_2 REAL,
                      dependents_3 REAL,
                      dependents_4 REAL,
                      dependents_5 REAL,
                      dependents_6 REAL,
                      dependents_7 REAL,
                      dependents_8 REAL,
                      dependents_9 REAL,
                      dependents_10 REAL );
",
        [],
    )?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS schema_data (
            key TEXT PRIMARY KEY,
            value TEXT)",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS payroll (
            id INTEGER PRIMARY KEY,
            emp_id INTEGER,
            hours_worked REAL,
            date_of_pay TEXT,
            gross REAL,
            withholding REAL,
            social_security REAL,
            roth_ira REAL,
            net REAL)",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            address TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            zip TEXT NOT NULL,
            phone TEXT NOT NULL,
            ssn TEXT NOT NULL,
            hired_date TEXT NOT NULL,
            birthdate TEXT NOT NULL,
            notes BLOB NOT NULL,
            wage REAL NOT NULL,
            number_of_dependents INTEGER NOT NULL,
            filing_status TEXT NOT NULL
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS schema_data (
            key TEXT PRIMARY KEY,
            value TEXT
        )",
        [],
    )?;

    Ok(conn)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_init_database_creates_schema_data_table() {
        let dir = tempdir().unwrap();
        let conn = init_database(dir.path().to_path_buf()).expect("DB init failed");

        let table_exists: bool = conn
            .prepare("SELECT name from sqlite_master WHERE type='table' AND name='schema_data'")
            .unwrap()
            .exists([])
            .unwrap();

        assert!(table_exists);
    }
}
