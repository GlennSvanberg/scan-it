use enigo::{Direction, Enigo, Key, Keyboard, Settings};

#[tauri::command]
fn inject_text(text: String, suffix: String) -> Result<(), String> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;
    if !text.is_empty() {
        enigo.text(&text).map_err(|e| e.to_string())?;
    }
    apply_inject_suffix(&mut enigo, &suffix)?;
    Ok(())
}

#[tauri::command]
fn inject_sequence(parts: Vec<String>, final_suffix: String) -> Result<(), String> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;
    let len = parts.len();
    for (i, part) in parts.iter().enumerate() {
        if !part.is_empty() {
            enigo.text(part).map_err(|e| e.to_string())?;
        }
        if i + 1 < len {
            enigo
                .key(Key::Tab, Direction::Click)
                .map_err(|e| e.to_string())?;
        }
    }
    apply_inject_suffix(&mut enigo, &final_suffix)?;
    Ok(())
}

fn apply_inject_suffix(enigo: &mut Enigo, suffix: &str) -> Result<(), String> {
    match suffix {
        "enter" => enigo
            .key(Key::Return, Direction::Click)
            .map_err(|e| e.to_string()),
        "tab" => enigo.key(Key::Tab, Direction::Click).map_err(|e| e.to_string()),
        "none" | _ => Ok(()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![inject_text, inject_sequence])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
