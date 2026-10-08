# Archnote

A beautiful, minimal scratchpad note-taking app for Arch Linux with native Omarchy theme support. Inspired by [Antinote](https://antinote.io/) for macOS.

## Features

- **Multiple Notes** - Swipe or click to navigate between notes
- **Omarchy Theme Support** - Automatically detects and applies your system Omarchy theme
- **25+ Built-in Themes** - Tokyo Night, Catppuccin, Gruvbox, Dracula, Nord, and more
- **Live Theme Sync** - Polls for Omarchy theme changes every 2 seconds
- **Plain Text** - Formatting stripped on paste for clean notes
- **Auto-Save** - Notes saved automatically as you type
- **System Tray** - Runs in background, click tray icon to show/hide
- **Single Instance** - Launching Archnote again brings up the existing window
- **Pin to Top** - Keep Archnote above other windows
- **Keyboard Shortcuts** - Fast navigation and control
- **Minimal & Fast** - Built with Tauri + Svelte for low memory usage

## Installation

### Build and Install from Source (Recommended)

#### Prerequisites

```bash
sudo pacman -S webkit2gtk-4.1 gtk3 cairo gdk-pixbuf2 glib2 base-devel rust nodejs npm
```

#### Install

```bash
git clone https://github.com/bruhhehe/Archnote.git
cd Archnote
./install.sh
```

The script builds the app, installs it to `/usr/local/bin/archnote`, and adds an
Archnote entry to your app launcher. It stops any running Archnote first.

To update later:

```bash
cd Archnote
git pull
./install.sh
```

To uninstall (your notes are kept):

```bash
./install.sh uninstall
```

### From AUR

```bash
yay -S archnote
```

> **Note:** The AUR package builds the upstream [dannymcc/Archnote](https://github.com/dannymcc/Archnote)
> repository, which doesn't include the fixes in this fork. Don't install both, or
> `sudo pacman -R archnote` before running `./install.sh`.

### Manual Build

```bash
npm install
npm run tauri build -- --no-bundle

# The built app will be in src-tauri/target/release/archnote
```

A plain `npm run tauri build` also tries to package an AppImage, which often fails
on Arch with `failed to run linuxdeploy`. Either use `--no-bundle` as above or run
`NO_STRIP=true npm run tauri build`.

### Development

```bash
# Run in development mode with hot reload
npm run tauri dev
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Super+N` | Show/hide Archnote (X11; on Hyprland bind it yourself, see below) |
| `Ctrl+N` | Create new note |
| `Ctrl+W` | Delete current note |
| `Ctrl+←/→` | Navigate between notes |
| `Ctrl+T` | Open theme selector |
| `Ctrl+P` | Toggle pin to top |
| `Escape` | Close modals |

## Window Behavior

- **Closing** the window (✕ button or your compositor's close key) hides it to the
  system tray. Archnote keeps running so you can bring it back instantly.
- **Reopen** it by clicking the tray icon, choosing *Show Archnote*, pressing
  `Super+N`, or just launching Archnote again.
- **Quit** completely with *Quit Archnote* in the tray menu.
- **Move** the window by dragging the title bar.

### Hyprland / Omarchy

Archnote is meant to float. Add the rules from [`archnote.conf`](archnote.conf) to
your Hyprland config (for example `source = ~/Archnote/archnote.conf` in
`~/.config/hypr/hyprland.conf`). A tiled window can't be dragged around.

Global shortcuts registered by apps don't work on most Wayland compositors, so add
a Hyprland keybinding instead. Launching Archnote while it's already running just
shows the existing window, so this works as a "show Archnote" key (pick any free
combination if `SUPER, N` is already taken):

```
bind = SUPER, N, exec, archnote
```

## Troubleshooting

- **`Gtk-WARNING ... gtk_window_set_titlebar() called on a realized window`** when
  running from a terminal is harmless.
- **The old version still opens** after updating: an AUR copy may still be
  installed (`pacman -Qo $(which archnote)`), or an old instance is still running
  (`pkill archnote`).

## Omarchy Theme Support

Archnote automatically integrates with [Omarchy](https://omarchy.org/) themes. When Omarchy is installed:

1. The app detects your current Omarchy theme from `~/.config/omarchy/current/theme`
2. Matches the theme name to a built-in color scheme
3. Polls for theme changes every 2 seconds
4. Instantly updates when you switch themes in Omarchy

You can disable Omarchy theme sync in Settings if you prefer to use a manual theme selection.

### Supported Themes

- **Tokyo Night** - Popular dark blue theme
- **Catppuccin** - Mocha, Macchiato, Frappé, Latte
- **Gruvbox** - Dark and Light variants
- **Dracula** - Classic dark purple theme
- **Rosé Pine** - Main, Moon, Dawn variants
- **Everforest** - Dark and Light variants
- **Nord** - Arctic blue theme
- **One Dark** - Atom-inspired dark theme
- **Aura** - Deep purple theme
- **Synthwave '84** - Retro neon theme
- **Monokai Pro** - Classic editor theme
- **Kanagawa** - Japanese wave-inspired
- **Solarized** - Dark and Light variants
- **Felix** - Minimal black & white
- **Material Ocean** - Material design dark
- **Midnight** - GitHub-inspired dark theme
- **Light** - Clean light theme

## Data Storage

Notes are stored locally at:
- `~/.local/share/archnote/state.json`

No cloud sync, no accounts, your data stays on your machine.

## Built With

- [Tauri](https://tauri.app/) - Lightweight Rust-based desktop framework
- [Svelte](https://svelte.dev/) - Reactive UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript

## License

MIT License - See [LICENSE](LICENSE) for details.

## Credits

- Inspired by [Antinote](https://antinote.io/) by Noteplan
- Built for the [Omarchy](https://omarchy.org/) Linux desktop environment
- Theme colors from various community color schemes
