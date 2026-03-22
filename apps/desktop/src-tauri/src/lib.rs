use enigo::{Direction, Enigo, Key, Keyboard, Settings};

#[tauri::command]
fn inject_text(text: String, suffix: String) -> Result<(), String> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;
    if !text.is_empty() {
        enigo.text(&text).map_err(|e| e.to_string())?;
    }
    match suffix.as_str() {
        "enter" => {
            enigo
                .key(Key::Return, Direction::Click)
                .map_err(|e| e.to_string())?;
        }
        "tab" => {
            enigo.key(Key::Tab, Direction::Click).map_err(|e| e.to_string())?;
        }
        "none" | _ => {}
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![inject_text])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
