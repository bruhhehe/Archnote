use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    AppHandle, Manager,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Note {
    id: String,
    content: String,
    created_at: u64,
    updated_at: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppState {
    notes: Vec<Note>,
    current_note_index: usize,
    theme: String,
    always_on_top: bool,
    use_omarchy_theme: bool,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            notes: vec![Note {
                id: uuid(),
                content: String::new(),
                created_at: timestamp(),
                updated_at: timestamp(),
            }],
            current_note_index: 0,
            theme: "tokyo-night".to_string(),
            always_on_top: false,
            use_omarchy_theme: true, // Default to using Omarchy if available
        }
    }
}

fn uuid() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    format!("{:x}", now)
}

fn timestamp() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

fn get_data_dir() -> PathBuf {
    let data_dir = dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("archnote");
    fs::create_dir_all(&data_dir).ok();
    data_dir
}

fn get_state_path() -> PathBuf {
    get_data_dir().join("state.json")
}

fn load_state() -> AppState {
    let path = get_state_path();
    if path.exists() {
        let content = fs::read_to_string(&path).unwrap_or_default();
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        AppState::default()
    }
}

fn save_state(state: &AppState) {
    let path = get_state_path();
    if let Ok(content) = serde_json::to_string_pretty(state) {
        fs::write(path, content).ok();
    }
}

pub struct AppStateWrapper(pub Mutex<AppState>);

// Omarchy theme detection
fn get_omarchy_theme_path() -> Option<PathBuf> {
    let home = dirs::home_dir()?;
    let theme_path = home.join(".config/omarchy/current/theme");
    if theme_path.exists() || theme_path.is_symlink() {
        Some(theme_path)
    } else {
        None
    }
}

fn resolve_symlink(path: &PathBuf) -> Option<PathBuf> {
    fs::read_link(path).ok().or_else(|| {
        if path.exists() {
            Some(path.clone())
        } else {
            None
        }
    })
}

#[tauri::command]
fn is_omarchy_installed() -> bool {
    get_omarchy_theme_path().is_some()
}

#[tauri::command]
fn get_omarchy_theme() -> Option<String> {
    let theme_path = get_omarchy_theme_path()?;
    let resolved = resolve_symlink(&theme_path)?;

    // Extract theme name from path
    // Path might be like: /home/user/.config/omarchy/themes/tokyo-night/theme
    // Or: /home/user/.config/omarchy/themes//nord (note: double slash possible)
    let path_str = resolved.to_string_lossy();

    // Try to find theme name in path
    if path_str.contains("omarchy/themes") {
        let parts: Vec<&str> = path_str.split("omarchy/themes").collect();
        if parts.len() > 1 {
            let theme_part = parts[1];
            // Get the first non-empty directory/file name after themes/
            // Filter out empty strings from double slashes
            let theme_name = theme_part
                .split('/')
                .filter(|s| !s.is_empty())
                .next()?;
            return Some(theme_name.to_string());
        }
    }

    // Fallback: use the file/directory name
    resolved.file_name()?.to_str().map(|s| s.to_string())
}

#[tauri::command]
fn get_state(state: tauri::State<AppStateWrapper>) -> AppState {
    state.0.lock().unwrap().clone()
}

#[tauri::command]
fn get_notes(state: tauri::State<AppStateWrapper>) -> Vec<Note> {
    state.0.lock().unwrap().notes.clone()
}

#[tauri::command]
fn get_current_note(state: tauri::State<AppStateWrapper>) -> Option<Note> {
    let s = state.0.lock().unwrap();
    s.notes.get(s.current_note_index).cloned()
}

#[tauri::command]
fn get_current_note_index(state: tauri::State<AppStateWrapper>) -> usize {
    state.0.lock().unwrap().current_note_index
}

#[tauri::command]
fn update_note(state: tauri::State<AppStateWrapper>, id: String, content: String) {
    let mut s = state.0.lock().unwrap();
    if let Some(note) = s.notes.iter_mut().find(|n| n.id == id) {
        note.content = content;
        note.updated_at = timestamp();
    }
    save_state(&s);
}

#[tauri::command]
fn create_note(state: tauri::State<AppStateWrapper>) -> Note {
    let mut s = state.0.lock().unwrap();
    let note = Note {
        id: uuid(),
        content: String::new(),
        created_at: timestamp(),
        updated_at: timestamp(),
    };
    s.notes.push(note.clone());
    s.current_note_index = s.notes.len() - 1;
    save_state(&s);
    note
}

#[tauri::command]
fn delete_note(state: tauri::State<AppStateWrapper>, id: String) -> Option<Note> {
    let mut s = state.0.lock().unwrap();
    if s.notes.len() <= 1 {
        return None;
    }
    if let Some(pos) = s.notes.iter().position(|n| n.id == id) {
        s.notes.remove(pos);
        if s.current_note_index >= s.notes.len() {
            s.current_note_index = s.notes.len() - 1;
        }
        save_state(&s);
        return s.notes.get(s.current_note_index).cloned();
    }
    None
}

#[tauri::command]
fn set_current_note(state: tauri::State<AppStateWrapper>, index: usize) {
    let mut s = state.0.lock().unwrap();
    if index < s.notes.len() {
        s.current_note_index = index;
        save_state(&s);
    }
}

#[tauri::command]
fn navigate_note(state: tauri::State<AppStateWrapper>, direction: i32) -> Option<Note> {
    let mut s = state.0.lock().unwrap();
    let len = s.notes.len();
    if len == 0 {
        return None;
    }
    let new_index = if direction > 0 {
        (s.current_note_index + 1) % len
    } else {
        if s.current_note_index == 0 {
            len - 1
        } else {
            s.current_note_index - 1
        }
    };
    s.current_note_index = new_index;
    save_state(&s);
    s.notes.get(new_index).cloned()
}

#[tauri::command]
fn set_theme(state: tauri::State<AppStateWrapper>, theme: String) {
    let mut s = state.0.lock().unwrap();
    s.theme = theme;
    save_state(&s);
}

#[tauri::command]
fn get_theme(state: tauri::State<AppStateWrapper>) -> String {
    state.0.lock().unwrap().theme.clone()
}

#[tauri::command]
fn set_use_omarchy_theme(state: tauri::State<AppStateWrapper>, use_omarchy: bool) {
    let mut s = state.0.lock().unwrap();
    s.use_omarchy_theme = use_omarchy;
    save_state(&s);
}

#[tauri::command]
fn get_use_omarchy_theme(state: tauri::State<AppStateWrapper>) -> bool {
    state.0.lock().unwrap().use_omarchy_theme
}

#[tauri::command]
fn toggle_always_on_top(app: AppHandle, state: tauri::State<AppStateWrapper>) -> bool {
    let mut s = state.0.lock().unwrap();
    s.always_on_top = !s.always_on_top;
    if let Some(window) = app.get_webview_window("main") {
        window.set_always_on_top(s.always_on_top).ok();
    }
    save_state(&s);
    s.always_on_top
}

#[tauri::command]
fn get_always_on_top(state: tauri::State<AppStateWrapper>) -> bool {
    state.0.lock().unwrap().always_on_top
}

#[tauri::command]
fn close_window(app: AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        window.hide().ok();
    }
}

#[tauri::command]
fn minimize_window(app: AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        window.minimize().ok();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let state = load_state();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .manage(AppStateWrapper(Mutex::new(state)))
        .setup(|app| {
            // Create system tray
            let quit = MenuItem::with_id(app, "quit", "Quit Archnote", true, None::<&str>)?;
            let show = MenuItem::with_id(app, "show", "Show Archnote", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("Archnote")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            window.show().ok();
                            window.set_focus().ok();
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let tauri::tray::TrayIconEvent::Click { .. } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_visible().unwrap_or(false) {
                                window.hide().ok();
                            } else {
                                window.show().ok();
                                window.set_focus().ok();
                            }
                        }
                    }
                })
                .build(app)?;

            // Register global shortcut Super+N to toggle window
            let shortcut = Shortcut::new(Some(Modifiers::SUPER), Code::KeyN);
            app.global_shortcut().on_shortcut(shortcut, |app, _shortcut, _event| {
                if let Some(window) = app.get_webview_window("main") {
                    if window.is_visible().unwrap_or(false) {
                        window.hide().ok();
                    } else {
                        window.show().ok();
                        window.set_focus().ok();
                    }
                }
            })?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_state,
            get_notes,
            get_current_note,
            get_current_note_index,
            update_note,
            create_note,
            delete_note,
            set_current_note,
            navigate_note,
            set_theme,
            get_theme,
            set_use_omarchy_theme,
            get_use_omarchy_theme,
            toggle_always_on_top,
            get_always_on_top,
            close_window,
            minimize_window,
            is_omarchy_installed,
            get_omarchy_theme,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
