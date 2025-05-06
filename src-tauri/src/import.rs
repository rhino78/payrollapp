use crate::AppState;
use rusqlite::{params, Connection, Result as SqlResult};
use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
struct ReleaseInfo {
    tag_name: Option<String>,
}

fn import_file(conn: &mut Connection, file_path: &str, filing_status: &str) -> SqlResult<()> {
    println!("importing file");
    use quick_xml::events::Event;
    use quick_xml::Reader;
    use std::fs::File;
    use std::io::BufReader;

    let file =
        File::open(file_path).map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
    let reader = BufReader::new(file);
    let mut xml = Reader::from_reader(reader);

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

                println!("raw current_row: {:?}", current_row);
                println!("filtered: {:?}", filtered);

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
    let total = entries.len();
    println!("the total is: {}", total);
    let tx = conn.transaction()?;
    println!("begining sql updates");

    for (_i, (wage_min, wage_max, withholding)) in entries.iter().enumerate() {
        // let _ = window.emit("import_progress", format!("{}:{}:{}", status, i + 1, total));
        println!("withholding 1 is {:?}", withholding[0]);
        println!("inserting: {}", _i);
        for k in withholding.iter().enumerate() {
            println!("{:?} | {:?}", k, withholding[0]);
        }

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

    println!("bruh");

    tx.commit()?;
    println!("Imported {} entries for {}", total, status);
    Ok(())
}

fn clear_withholding_table(state: State<'_, AppState>) -> SqlResult<()> {
    let conn = &state.db_connection.lock().unwrap();
    conn.execute("DELETE FROM withholding", params![])
        .map_err(|e| e.to_string());
    Ok(())
}

#[tauri::command]
pub fn start_withholding_import(
    state: State<'_, AppState>,
    married_path: &str,
    single_path: &str,
) -> Result<(), String> {
    let _ = clear_withholding_table(state.clone());
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
mod tests {
    use super::*;
    use rusqlite::Connection;

    #[test]
    fn quick_import() {
        let mut conn = Connection::open("../test.db").expect("failed to open database");
        conn.execute("DELETE FROM withholding", params![])
            .map_err(|e| e.to_string());
        println!("withholding deleted");
        let married_path = "../biweekly_Married.xml";
        assert!(Path::new(married_path).exists(), "Married XML not found!");
        let result_1 = import_file(&mut conn, married_path, "married");
        let single_path = "../biweekly_Single.xml";
        assert!(Path::new(single_path).exists(), "Single XML not found!");
        let result_2 = import_file(&mut conn, single_path, "single");
        let mut stmt = conn.prepare("SELECT COUNT(*) FROM withholding").unwrap();
        let count: i64 = stmt.query_row([], |row| row.get(0)).unwrap();
        println!("Withholding rows imported: {}", count);
    }
}
