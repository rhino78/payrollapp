use rusqlite::params;
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::db::AppState;

#[derive(Serialize)]
pub struct PayrollExport {
    first_name: String,
    last_name: String,
    pay_date: String,
    hours: f64,
    gross: f64,
    wh: f64,
    ss: f64,
    ira: f64,
    net: f64,
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

#[tauri::command]
pub fn add_payroll(payroll: Payroll, state: State<'_, AppState>) -> Result<i64, String> {
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
// Command to delete a payroll record
#[tauri::command]
pub fn delete_payroll(payroll_id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let conn = state.db_connection.lock().unwrap();

    conn.execute("DELETE FROM payroll WHERE id = ?1", params![payroll_id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
//command to get all payroll for an employee
#[tauri::command]
pub fn get_payroll_by_id(state: State<'_, AppState>, emp_id: i64) -> Result<Vec<Payroll>, String> {
    let conn = state.db_connection.lock().unwrap();

    let mut stmt = conn
        .prepare("SELECT id, emp_id, date_of_pay, hours_worked, gross, withholding, social_security, roth_ira, net
             FROM payroll WHERE emp_id = ? ORDER BY date_of_pay DESC",
        )
        .map_err(|e| e.to_string())?;

    let payroll_iter = stmt
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
                net: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let payrolls: Vec<Payroll> = payroll_iter
        .collect::<Result<Vec<Payroll>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(payrolls)
}
//get date_of_pay by employee
#[tauri::command]
pub fn get_date_of_pay(state: State<'_, AppState>, emp_id: i64) -> Result<Vec<String>, String> {
    let conn = state.db_connection.lock().unwrap();

    let mut stmt = conn
        .prepare("SELECT date_of_pay FROM payroll WHERE emp_id = ? ORDER BY date_of_pay DESC")
        .map_err(|e| e.to_string())?;

    let date_of_pay_iter = stmt
        .query_map([emp_id], |row| Ok(row.get(0)?))
        .map_err(|e| e.to_string())?;

    let date_of_pays: Vec<String> = date_of_pay_iter
        .collect::<Result<Vec<String>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(date_of_pays)
}

//get payroll report
#[tauri::command]
pub fn get_payroll_report<'a>(
    state: State<'a, AppState>,
    employee_ids: Vec<i32>,
    pay_date: String,
) -> Result<Vec<PayrollExport>, String> {
    let conn = state.db_connection.lock().unwrap();

    if employee_ids.is_empty() {
        return Ok(vec![]);
    }

    let sql = "SELECT e.first_name, e.last_name, p.date_of_pay, p.hours_worked, p.gross, p.withholding, p.social_security, p.roth_ira, p.net
     FROM payroll p
     JOIN employees e ON p.emp_id = e.id
     WHERE p.date_of_pay = ?";

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([&pay_date as &dyn rusqlite::ToSql], |row| {
            Ok(PayrollExport {
                first_name: row.get(0)?,
                last_name: row.get(1)?,
                pay_date: row.get(2)?,
                hours: row.get(3)?,
                gross: row.get(4)?,
                wh: row.get(5)?,
                ss: row.get(6)?,
                ira: row.get(7)?,
                net: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let results: Vec<PayrollExport> = rows
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(results)
}
