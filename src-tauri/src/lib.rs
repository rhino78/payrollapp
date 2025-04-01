use rusqlite::{params, Connection, Result as SqlResult};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{Manager, State};

// Define a struct to represent the database connection
struct AppState {
    db_connection: Mutex<Connection>,
}

// Define Payroll struct for serialization
#[derive(Debug, Serialize, Deserialize)]
pub struct Payroll {
    id: Option<i64>,
    emp_id: i64,
    date_of_pay: String,
    hours_worked: f64,
    gross: f64,
    withholding: f64,
    social_security: f64,
    ira: f64,
    net: f64,
}

// Define Employee struct for serialization
#[derive(Debug, Serialize, Deserialize)]
pub struct Employee {
    id: Option<i64>,
    first_name: String,
    last_name: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    phone: String,
    wage: f64,
    number_of_dependents: i32,
    filing_status: String,
}

// Initialize the database connection and create tables
fn init_database(app_dir: PathBuf) -> SqlResult<Connection> {
    let db_path = app_dir.join("payroll.db");
    println!("the database is in here: {:?}", db_path);
    let conn = Connection::open(db_path)?;

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


//command to get all payroll for an employee
#[tauri::command]
fn get_payroll_by_id(state: State<'_, AppState>, emp_id: i64) -> Result<Vec<Payroll>, String> {
    let conn = state.db_connection.lock().unwrap();

    let mut stmt = conn
        .prepare("SELECT id, emp_id, date_of_pay, hours_worked, gross, withholding, social_security, roth_ira, net
             FROM payroll WHERE emp_id = ? ORDER BY date_of_pay DESC",
        )
        .map_err(|e| e.to_string())?;

    let payroll_iter  = stmt
        .query_map([emp_id], |row| {
            Ok(Payroll {
                id: Some(row.get(0)?),
                emp_id: row.get(1)?,
                date_of_pay: row.get(2)?,
                hours_worked: row.get(3)?,  
                gross: row.get(4)?,
                withholding: row.get(5)?,
                social_security: row.get(6)?,
                ira: row.get(7)?,
                net: row.get(8)?
            })
        })
    .map_err(|e| e.to_string())?;

    let payrolls: Vec<Payroll> = payroll_iter
        .collect::<Result<Vec<Payroll>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(payrolls)
}

// Command to get employee data by id
#[tauri::command]
fn get_employee_by_id(state: State<'_, AppState>, id: i64) -> Result<Option<Employee>, String> {
    let conn = state.db_connection.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT * FROM employees WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let mut employee_iter = stmt
        .query_map([id], |row| {
            Ok(Employee {
                id: Some(row.get(0)?),
                first_name: row.get(1)?,
                last_name: row.get(2)?,
                address: row.get(3)?,
                city: row.get(4)?,
                state: row.get(5)?,
                zip: row.get(6)?,
                phone: row.get(7)?,
                wage: row.get(8)?,
                number_of_dependents: row.get(9)?,
                filing_status: row.get(10)?,
            })
        })
        .map_err(|e| e.to_string())?;

    employee_iter.next().transpose().map_err(|e| e.to_string())
}

// Command to get all employees
#[tauri::command]
fn get_employees(state: State<'_, AppState>) -> Result<Vec<Employee>, String> {
    let conn = state.db_connection.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT * FROM employees")
        .map_err(|e| e.to_string())?;

    let employee_iter = stmt
        .query_map([], |row| {
            Ok(Employee {
                id: Some(row.get(0)?),
                first_name: row.get(1)?,
                last_name: row.get(2)?,
                address: row.get(3)?,
                city: row.get(4)?,
                state: row.get(5)?,
                zip: row.get(6)?,
                phone: row.get(7)?,
                wage: row.get(8)?,
                number_of_dependents: row.get(9)?,
                filing_status: row.get(10)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let employees: Vec<Employee> = employee_iter
        .collect::<Result<Vec<Employee>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(employees)
}

// Command to add a new payroll record
#[tauri::command]
fn add_payroll(payroll: Payroll, state: State<'_, AppState>) -> Result<i64, String> {
    let conn = state.db_connection.lock().unwrap();

    let _employee_id = conn
        .execute(
            "INSERT INTO payroll (
            emp_id, date_of_pay, hours_worked, gross, withholding, social_security, roth_ira, net
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                payroll.emp_id,
                payroll.date_of_pay,
                payroll.hours_worked,
                payroll.gross,
                payroll.withholding,
                payroll.social_security,
                payroll.ira,
                payroll.net,
            ],
        )
        .map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
}

// Command to add a new employee
#[tauri::command]
fn add_employee(employee: Employee, state: State<'_, AppState>) -> Result<i64, String> {
    let conn = state.db_connection.lock().unwrap();

    let _employee_id = conn.execute(
        "INSERT INTO employees (
            first_name, last_name, address, city, state, zip, phone, wage, number_of_dependents, filing_status
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![
            employee.first_name,
            employee.last_name,
            employee.address,
            employee.city,
            employee.state,
            employee.zip,
            employee.phone,
            employee.wage,
            employee.number_of_dependents,
            employee.filing_status,
        ],
    ).map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
}

// Command to update an existing employee
#[tauri::command]
fn update_employee(employee: Employee, state: State<'_, AppState>) -> Result<(), String> {
    let conn = state.db_connection.lock().unwrap();

    conn.execute(
        "UPDATE employees SET 
            first_name = ?1, 
            last_name = ?2, 
            address = ?3, 
            city = ?4, 
            state = ?5, 
            zip = ?6, 
            phone = ?7, 
            wage = ?8, 
            number_of_dependents = ?9, 
            filing_status = ?10 
        WHERE id = ?11",
        params![
            employee.first_name,
            employee.last_name,
            employee.address,
            employee.city,
            employee.state,
            employee.zip,
            employee.phone,
            employee.wage,
            employee.number_of_dependents,
            employee.filing_status,
            employee.id,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

// Command to delete an employee
#[tauri::command]
fn delete_employee(id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let conn = state.db_connection.lock().unwrap();

    conn.execute("DELETE FROM employees WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

// Setup the application state
fn setup_app(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    std::fs::create_dir_all(&app_dir)?;
    let conn = init_database(app_dir)?;
    app.manage(AppState {
        db_connection: Mutex::new(conn),
    });

    Ok(())
}

///main
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(setup_app)
        .invoke_handler(tauri::generate_handler![
            get_employees,
            get_employee_by_id,
            add_employee,
            update_employee,
            delete_employee,
            add_payroll,
            get_payroll_by_id
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
