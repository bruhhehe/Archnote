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
- **Pin to Top** - Keep Archnote above other windows
- **Keyboard Shortcuts** - Fast navigation and control
- **Minimal & Fast** - Built with Tauri + Svelte for low memory usage

## Installation

### From AUR (Recommended)

```bash
# Using yay
yay -S archnote

# Using paru
paru -S archnote

# Manual AUR installation
git clone https://aur.archlinux.org/archnote.git
cd archnote
makepkg -si
```

### Build from Source

#### Prerequisites

```bash
# Install required system dependencies
sudo pacman -S webkit2gtk-4.1 gtk3 cairo gdk-pixbuf2 glib2 base-devel rust nodejs npm
```

#### Build

```bash
# Clone the repository
git clone https://github.com/dannymcc/Archnote.git
cd Archnote

# Install dependencies
npm install

# Build the app
npm run tauri build

# The built app will be in src-tauri/target/release/archnote
```

### Development

```bash
# Run in development mode with hot reload
npm run tauri dev
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | Create new note |
| `Ctrl+W` | Delete current note |
| `Ctrl+←/→` | Navigate between notes |
| `Ctrl+T` | Open theme selector |
| `Ctrl+P` | Toggle pin to top |
| `Escape` | Close modals |

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
