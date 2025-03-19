// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::Manager;
use serde::{Serialize, Deserialize};

const ALPHA_VANTAGE_API_KEY: &str = "F3ZZV8LPPY32GSA0";

#[derive(Serialize, Deserialize)]
struct HistoricalData {
    date: String,
    price: f64,
}

#[derive(Serialize, Deserialize)]
struct StockData {
    price: f64,
    historical: Vec<HistoricalData>,
}

#[tauri::command]
async fn fetch_stock_data(ticker: String) -> Result<StockData, String> {
    let url = format!("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={}&apikey={}", ticker, ALPHA_VANTAGE_API_KEY);
    //println!("Fetching Data from url: {}", url);

    let response = reqwest::get(url).await.map_err(|e| e.to_string())?;
    //println!("response: {}", response.status());

    let body = response.text().await.map_err(|e| e.to_string())?;
    println!("body: {}", body);

    let json: serde_json::Value = serde_json::from_str(&body).map_err(|e| e.to_string())?;

    let time_series = json.get("Time Series (Daily)")
        .and_then(|ts| ts.as_object())
        .ok_or("Invalid data format")?;

    let mut historical = Vec::new();

    for (date, data) in time_series {
        let price = data.get("4. close")
            .and_then(|p| p.as_str())
            .ok_or("Invalid data format")?
            .parse::<f64>()
            .map_err(|e| e.to_string())?;

        historical.push(HistoricalData {
            date: date.to_string(),
            price,
        });
    }

    historical.sort_by(|a, b| a.date.cmp(&b.date));

    let latest_price = historical
        .last()
        .ok_or("No data available")?
        .price;

    println!("Latest Price: {}", latest_price);
    Ok(StockData {
        price: latest_price,
        historical,
    })
}

#[derive(Debug, Serialize, Deserialize)]
struct Employee{
    first_name: String,
    last_name: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    phone_number: String,
    number_of_dependents: Option<u32>,
    marital_status: String,
    wage: Option<f64>,
}

#[tauri::command]
fn save_employee_data(employee: Employee)-> Result<String, String>{
    println!("Saving employee data: {:?}", employee);
    Ok("yay we saved it".to_string())
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![fetch_stock_data, save_employee_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
