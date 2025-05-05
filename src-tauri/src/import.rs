use crate::AppState;
use rusqlite::{params, Connection, Result as SqlResult};
use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::Emitter;
use tauri::State;
use tauri::Window;

#[derive(Debug, Serialize, Deserialize)]
struct ReleaseInfo {
    tag_name: Option<String>,
}

fn import_file(
    conn: &mut Connection,
    file_path: &str,
    filing_status: &str,
    window: &Window,
) -> SqlResult<()> {
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
                if current_row.len() >= 13 {
                    let wage_min = current_row[0]
                        .replace("$", "")
                        .replace(",", "")
                        .parse()
                        .unwrap_or(0.0);
                    let wage_max = current_row[1]
                        .replace("$", "")
                        .replace(",", "")
                        .parse()
                        .unwrap_or(0.0);
                    let mut withholding = [0.0; 11];
                    for i in 0..11 {
                        withholding[i] = current_row[i + 2]
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
    let tx = conn.transaction()?;

    for (i, (wage_min, wage_max, withholding)) in entries.iter().enumerate() {
        let progress = ((i + 1) as f64 / total as f64 * 100.0) as u8;
        let msg = format!("{}:{}", filing_status, progress);
        let _ = window.emit("import_progress", msg);

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
    println!("Imported {} entries for {}", total, status);
    Ok(())
}

#[tauri::command]
pub fn start_withholding_import(
    state: State<'_, AppState>,
    married_path: &str,
    single_path: &str,
    window: tauri::Window,
) -> Result<(), String> {
    println!("starting withholing import");
    check_import_files(state, married_path, single_path, &window).map_err(|e| e.to_string())
}

///check the import files location and import the data if needed
fn check_import_files(
    state: State<'_, AppState>,
    married_path: &str,
    single_path: &str,
    window: &Window,
) -> SqlResult<()> {
    let mut conn = state.db_connection.lock().unwrap();

    if Path::new(married_path).exists() && Path::new(single_path).exists() {
        import_file(&mut *conn, married_path, "married", window)?;
        import_file(&mut *conn, single_path, "single", window)?;
    } else {
        println!("One of both of the files are missing");
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use rusqlite::{Connection, Result};

    #[test]
    fn test_parse_valid_xml_input() -> Result<()> {
        let xml_data = r#"
            <root>
                <row>
                    <column>$0</column><column>$100</column>
                    <column>$1</column><column>$2</column><column>$3</column><column>$4</column><column>$5</column>
                    <column>$6</column><column>$7</column><column>$8</column><column>$9</column><column>$10</column><column>$11</column>
                </row>
            </root>
        "#;
        let cursor = std::io::Cursor::new(xml_data);
        let mut reader = quick_xml::Reader::from_reader(cursor);
        let mut buf = Vec::new();
        let mut current_row = Vec::new();
        let mut count = 0;
        while let Ok(event) = reader.read_event_into(&mut buf) {
            match event {
                quick_xml::events::Event::Start(ref e) if e.name().as_ref() == b"row" => {
                    current_row.clear();
                }
                quick_xml::events::Event::Text(e) => {
                    current_row.push(e.unescape().unwrap_or_default().to_string());
                }
                quick_xml::events::Event::End(ref e) if e.name().as_ref() == b"row" => {
                    count += 1;
                    assert_eq!(current_row.len(), 13);
                }
                quick_xml::events::Event::Eof => break,
                _ => {}
            }
            buf.clear();
        }

        assert_eq!(count, 1);
        Ok(())
    }
}
