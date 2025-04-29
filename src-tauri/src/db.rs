use rusqlite::{Connection, Result as SqlResult};
use std::path::PathBuf;
use std::sync::Mutex;

// Define a struct to represent the database connection
pub struct AppState {
    pub db_connection: Mutex<Connection>,
}

// Initialize the database connection and create tables
pub fn init_database(app_dir: PathBuf) -> SqlResult<Connection> {
    let db_path = app_dir.join("payroll.db");
    println!("the database is in here: {:?}", db_path);
    let conn = Connection::open(db_path)?;

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
            wage REAL NOT NULL,
            number_of_dependents INTEGER NOT NULL,
            filing_status TEXT NOT NULL
        )",
        [],
    )?;

    Ok(conn)
}
