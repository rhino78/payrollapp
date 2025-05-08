use crate::AppState;
use rusqlite::{params, Connection, Result as SqlResult};
use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::State;
use tracing::info;

#[derive(Debug, Serialize, Deserialize)]
struct ReleaseInfo {
    tag_name: Option<String>,
}

fn import_file(conn: &mut Connection, file_path: &str, filing_status: &str) -> SqlResult<()> {
    use quick_xml::events::Event;
    use quick_xml::Reader;
    use std::fs::File;
    use std::io::BufReader;

    let file =
        File::open(file_path).map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
    let reader = BufReader::new(file);
    let mut xml = Reader::from_reader(reader);

    info!("begining import");
    let mut buf = Vec::new();
    let mut current_row: Vec<String> = Vec::new();
    let mut entries: Vec<(f64, f64, [f64; 11])> = Vec::new();

    while let Ok(event) = xml.read_event_into(&mut buf) {
        match event {
            Event::Start(ref e) if e.name().as_ref() == b"row" => {
                current_row.clear();
            }
            Event::Text(e) => {
                let text = e.unescape().unwrap_or_default().to_string();
                current_row.push(text);
            }
            Event::End(ref e) if e.name().as_ref() == b"row" => {
                let filtered: Vec<String> = current_row
                    .iter()
                    .map(|s| s.trim())
                    .filter(|s| !s.is_empty())
                    .map(|s| s.to_string())
                    .collect();

                if filtered.len() >= 13 {
                    let wage_min = filtered[0]
                        .replace("$", "")
                        .replace(",", "")
                        .parse()
                        .unwrap_or(0.0);
                    let wage_max = filtered[1]
                        .replace("$", "")
                        .replace(",", "")
                        .parse()
                        .unwrap_or(0.0);
                    let mut withholding = [0.0; 11];
                    for i in 0..11 {
                        withholding[i] = filtered[i + 2]
                            .replace("$", "")
                            .replace(",", "")
                            .parse()
                            .unwrap_or(0.0);
                    }
                    entries.push((wage_min, wage_max, withholding));
                }
            }
            Event::Eof => {
                break;
            }
            _ => (),
        }
        buf.clear();
    }

    let status = filing_status.to_string();
    let tx = conn.transaction()?;

    for (_i, (wage_min, wage_max, withholding)) in entries.iter().enumerate() {
        tx.execute(
            "INSERT INTO withholding (
                filing_status, pay_period, wage_min, wage_max,
                dependents_0, dependents_1, dependents_2, dependents_3, dependents_4,
                dependents_5, dependents_6, dependents_7, dependents_8, dependents_9, dependents_10
            ) VALUES (
                ?1, 'biweekly', ?2, ?3,
                ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14
            )",
            params![
                status,
                wage_min,
                wage_max,
                withholding[0],
                withholding[1],
                withholding[2],
                withholding[3],
                withholding[4],
                withholding[5],
                withholding[6],
                withholding[7],
                withholding[8],
                withholding[9],
                withholding[10]
            ],
        )?;
    }

    tx.commit()?;
    info!("Import complete");
    Ok(())
}

fn clear_withholding_table(state: State<'_, AppState>) -> SqlResult<()> {
    let conn = &state.db_connection.lock().unwrap();
    let _ = conn.execute("DELETE FROM withholding", params![])?;
    info!("Withholding table cleared");
    Ok(())
}

#[tauri::command]
pub fn start_withholding_import(
    state: State<'_, AppState>,
    married_path: &str,
    single_path: &str,
) -> Result<(), String> {
    let _ = clear_withholding_table(state.clone()).map_err(|e| e.to_string())?;
    check_import_files(state, married_path, single_path).map_err(|e| e.to_string())
}

///check the import files location and import the data if needed
fn check_import_files(
    state: State<'_, AppState>,
    married_path: &str,
    single_path: &str,
) -> SqlResult<()> {
    let mut conn = state.db_connection.lock().unwrap();

    if Path::new(married_path).exists() && Path::new(single_path).exists() {
        import_file(&mut *conn, married_path, "married")?;
        import_file(&mut *conn, single_path, "single")?;
    } else {
        println!("One of both of the files are missing");
    }

    Ok(())
}

#[cfg(test)]
pub mod tests {
    use super::*;
    use crate::db::init_database;
    use tempfile::tempdir;

    #[test]
    pub fn quick_import() {
        let dir = tempdir().expect("Failed to create temp dir");
        let mut conn = init_database(dir.path().to_path_buf()).expect("DB init failed");
        quick_import_with_conn(&mut conn);
    }

    pub fn quick_import_with_conn(conn: &mut Connection) {
        let married_path = "../biweekly_Married.xml";
        let single_path = "../biweekly_Single.xml";
        assert!(Path::new(married_path).exists(), "Married XML not found!");
        assert!(Path::new(single_path).exists(), "Single XML not found!");

        let _ = conn
            .execute("DELETE FROM withholding", params![])
            .map_err(|e| e.to_string());

        let _result_1 = import_file(conn, married_path, "married");
        let _result_2 = import_file(conn, single_path, "single");
        let mut stmt = conn.prepare("SELECT COUNT(*) FROM withholding").unwrap();
        let count: i64 = stmt.query_row([], |row| row.get(0)).unwrap();
        assert_eq!(count, 263);
    }
}
