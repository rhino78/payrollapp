use rusqlite::params;
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::db::AppState;

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
// Command to get employee data by id
#[tauri::command]
pub fn get_employee_by_id(state: State<'_, AppState>, id: i64) -> Result<Option<Employee>, String> {
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

// Command to add a new employee
#[tauri::command]
pub fn add_employee(employee: Employee, state: State<'_, AppState>) -> Result<i64, String> {
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

// Command to delete an employee
#[tauri::command]
pub fn delete_employee(id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let conn = state.db_connection.lock().unwrap();

    conn.execute("DELETE FROM employees WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
// Command to update an existing employee
#[tauri::command]
pub fn update_employee(employee: Employee, state: State<'_, AppState>) -> Result<(), String> {
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

// Command to get all employees
#[tauri::command]
pub fn get_employees(state: State<'_, AppState>) -> Result<Vec<Employee>, String> {
    let conn = state.db_connection.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT * FROM employees ")
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

//get employees by paydates
#[tauri::command]
pub fn get_employees_by_pay_date(
    state: State<'_, AppState>,
    pay_date: String,
) -> Result<Vec<Employee>, String> {
    let conn = state.db_connection.lock().unwrap();

    let mut stmt = conn
        .prepare(
            "SELECT DISTINCT e.* FROM employees e
             INNER JOIN payroll p ON e.id = p.emp_id
             WHERE p.date_of_pay = ?1",
        )
        .map_err(|e| e.to_string())?;

    let employee_iter = stmt
        .query_map([pay_date], |row| {
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

#[cfg(test)]
mod tests {
    use rusqlite::Connection;

    fn create_test_db() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch(
            "CREATE TABLE employees (
                id INTEGER PRIMARY KEY,
                first_name TEXT,
                last_name TEXT,
                address TEXT,
                city TEXT,
                state TEXT,
                zip TEXT,
                phone TEXT,
                wage REAL,
                number_of_dependents INTEGER,
                filing_status TEXT
            );",
        )
        .unwrap();
        conn
    }

    #[test]
    fn test_add_and_fetch_employee() {
        let conn = create_test_db();
        let empoloyee = crate::employee::Employee {
            id: None,
            first_name: "Jane".into(),
            last_name: "Doe".into(),
            address: "123 main st ".into(),
            city: "Austin".into(),
            state: "Tx".into(),
            zip: "78681".into(),
            phone: "555-0000".into(),
            wage: 25.0,
            number_of_dependents: 1,
            filing_status: "single".into(),
        };

        let id = conn.execute(
            "INSERT INTO employees (
                first_name, last_name, address, city, state, zip, phone, wage, number_of_dependents, filing_status
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            rusqlite::params![
                empoloyee.first_name,
                empoloyee.last_name,
                empoloyee.address,
                empoloyee.city,
                empoloyee.state,
                empoloyee.zip,
                empoloyee.phone,
                empoloyee.wage,
                empoloyee.number_of_dependents,
                empoloyee.filing_status,
        ]).unwrap();
        assert!(id > 0);
    }
}
