#!/usr/bin/env bash
# Build Archnote from source and install it system-wide.
# Usage: ./install.sh            (build + install)
#        ./install.sh uninstall  (remove)
set -euo pipefail

BIN=/usr/local/bin/archnote
ICON=/usr/share/icons/hicolor/128x128/apps/archnote.png
DESKTOP="$HOME/.local/share/applications/archnote.desktop"

cd "$(dirname "$0")"

if [[ "${1:-}" == "uninstall" ]]; then
    pkill -x archnote || true
    sudo rm -f "$BIN" "$ICON"
    rm -f "$DESKTOP"
    echo "Archnote uninstalled. Notes are kept in ~/.local/share/archnote/"
    exit 0
fi

if pacman -Qq archnote &>/dev/null; then
    echo "The AUR 'archnote' package is installed and would shadow this build."
    echo "Remove it first with: sudo pacman -R archnote"
    exit 1
fi

npm install
# --no-bundle skips the AppImage/deb/rpm packaging, which isn't needed here
npm run tauri build -- --no-bundle

pkill -x archnote || true
sudo install -Dm755 src-tauri/target/release/archnote "$BIN"
sudo install -Dm644 src-tauri/icons/128x128.png "$ICON"

mkdir -p "$(dirname "$DESKTOP")"
cat > "$DESKTOP" <<DESKTOP_EOF
[Desktop Entry]
Name=Archnote
Comment=Scratchpad notes
Exec=$BIN
Icon=archnote
Type=Application
Categories=Utility;
StartupWMClass=archnote
DESKTOP_EOF

echo "Archnote installed. Launch it from your app launcher or run: archnote"
