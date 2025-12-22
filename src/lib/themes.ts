export interface Theme {
  name: string;
  displayName: string;
  colors: {
    background: string;
    backgroundAlt: string;
    foreground: string;
    foregroundMuted: string;
    accent: string;
    accentAlt: string;
    border: string;
    selection: string;
  };
}

export const themes: Record<string, Theme> = {
  // Tokyo Night - Most popular Omarchy theme
  "tokyo-night": {
    name: "tokyo-night",
    displayName: "Tokyo Night",
    colors: {
      background: "#1a1b26",
      backgroundAlt: "#24283b",
      foreground: "#c0caf5",
      foregroundMuted: "#565f89",
      accent: "#7aa2f7",
      accentAlt: "#bb9af7",
      border: "#3b4261",
      selection: "#33467c",
    },
  },

  // Catppuccin Mocha
  "catppuccin-mocha": {
    name: "catppuccin-mocha",
    displayName: "Catppuccin Mocha",
    colors: {
      background: "#1e1e2e",
      backgroundAlt: "#313244",
      foreground: "#cdd6f4",
      foregroundMuted: "#6c7086",
      accent: "#cba6f7",
      accentAlt: "#f5c2e7",
      border: "#45475a",
      selection: "#45475a",
    },
  },

  // Catppuccin Macchiato
  "catppuccin-macchiato": {
    name: "catppuccin-macchiato",
    displayName: "Catppuccin Macchiato",
    colors: {
      background: "#24273a",
      backgroundAlt: "#363a4f",
      foreground: "#cad3f5",
      foregroundMuted: "#6e738d",
      accent: "#c6a0f6",
      accentAlt: "#f5bde6",
      border: "#494d64",
      selection: "#494d64",
    },
  },

  // Catppuccin Frappe
  "catppuccin-frappe": {
    name: "catppuccin-frappe",
    displayName: "Catppuccin Frappé",
    colors: {
      background: "#303446",
      backgroundAlt: "#414559",
      foreground: "#c6d0f5",
      foregroundMuted: "#737994",
      accent: "#ca9ee6",
      accentAlt: "#f4b8e4",
      border: "#51576d",
      selection: "#51576d",
    },
  },

  // Catppuccin Latte (light)
  "catppuccin-latte": {
    name: "catppuccin-latte",
    displayName: "Catppuccin Latte",
    colors: {
      background: "#eff1f5",
      backgroundAlt: "#e6e9ef",
      foreground: "#4c4f69",
      foregroundMuted: "#8c8fa1",
      accent: "#8839ef",
      accentAlt: "#ea76cb",
      border: "#ccd0da",
      selection: "#ccd0da",
    },
  },

  // Gruvbox Dark
  "gruvbox-dark": {
    name: "gruvbox-dark",
    displayName: "Gruvbox Dark",
    colors: {
      background: "#282828",
      backgroundAlt: "#3c3836",
      foreground: "#ebdbb2",
      foregroundMuted: "#928374",
      accent: "#fabd2f",
      accentAlt: "#fe8019",
      border: "#504945",
      selection: "#504945",
    },
  },

  // Gruvbox Light
  "gruvbox-light": {
    name: "gruvbox-light",
    displayName: "Gruvbox Light",
    colors: {
      background: "#fbf1c7",
      backgroundAlt: "#ebdbb2",
      foreground: "#3c3836",
      foregroundMuted: "#7c6f64",
      accent: "#d65d0e",
      accentAlt: "#af3a03",
      border: "#d5c4a1",
      selection: "#d5c4a1",
    },
  },

  // Dracula
  dracula: {
    name: "dracula",
    displayName: "Dracula",
    colors: {
      background: "#282a36",
      backgroundAlt: "#44475a",
      foreground: "#f8f8f2",
      foregroundMuted: "#6272a4",
      accent: "#bd93f9",
      accentAlt: "#ff79c6",
      border: "#44475a",
      selection: "#44475a",
    },
  },

  // Rose Pine
  "rose-pine": {
    name: "rose-pine",
    displayName: "Rosé Pine",
    colors: {
      background: "#191724",
      backgroundAlt: "#1f1d2e",
      foreground: "#e0def4",
      foregroundMuted: "#6e6a86",
      accent: "#c4a7e7",
      accentAlt: "#ebbcba",
      border: "#26233a",
      selection: "#26233a",
    },
  },

  // Rose Pine Moon
  "rose-pine-moon": {
    name: "rose-pine-moon",
    displayName: "Rosé Pine Moon",
    colors: {
      background: "#232136",
      backgroundAlt: "#2a273f",
      foreground: "#e0def4",
      foregroundMuted: "#6e6a86",
      accent: "#c4a7e7",
      accentAlt: "#ea9a97",
      border: "#393552",
      selection: "#393552",
    },
  },

  // Rose Pine Dawn (light)
  "rose-pine-dawn": {
    name: "rose-pine-dawn",
    displayName: "Rosé Pine Dawn",
    colors: {
      background: "#faf4ed",
      backgroundAlt: "#fffaf3",
      foreground: "#575279",
      foregroundMuted: "#9893a5",
      accent: "#907aa9",
      accentAlt: "#d7827e",
      border: "#dfdad9",
      selection: "#dfdad9",
    },
  },

  // Everforest Dark
  "everforest-dark": {
    name: "everforest-dark",
    displayName: "Everforest Dark",
    colors: {
      background: "#2d353b",
      backgroundAlt: "#343f44",
      foreground: "#d3c6aa",
      foregroundMuted: "#859289",
      accent: "#a7c080",
      accentAlt: "#83c092",
      border: "#475258",
      selection: "#475258",
    },
  },

  // Everforest Light
  "everforest-light": {
    name: "everforest-light",
    displayName: "Everforest Light",
    colors: {
      background: "#fdf6e3",
      backgroundAlt: "#f4f0d9",
      foreground: "#5c6a72",
      foregroundMuted: "#829181",
      accent: "#8da101",
      accentAlt: "#35a77c",
      border: "#e0dcc7",
      selection: "#e0dcc7",
    },
  },

  // Nord
  nord: {
    name: "nord",
    displayName: "Nord",
    colors: {
      background: "#2e3440",
      backgroundAlt: "#3b4252",
      foreground: "#eceff4",
      foregroundMuted: "#4c566a",
      accent: "#88c0d0",
      accentAlt: "#81a1c1",
      border: "#434c5e",
      selection: "#434c5e",
    },
  },

  // One Dark
  "one-dark": {
    name: "one-dark",
    displayName: "One Dark",
    colors: {
      background: "#282c34",
      backgroundAlt: "#21252b",
      foreground: "#abb2bf",
      foregroundMuted: "#5c6370",
      accent: "#61afef",
      accentAlt: "#c678dd",
      border: "#3e4451",
      selection: "#3e4451",
    },
  },

  // Aura
  aura: {
    name: "aura",
    displayName: "Aura",
    colors: {
      background: "#15141b",
      backgroundAlt: "#1c1b22",
      foreground: "#edecee",
      foregroundMuted: "#6d6d6d",
      accent: "#a277ff",
      accentAlt: "#ffca85",
      border: "#29263c",
      selection: "#29263c",
    },
  },

  // Synthwave '84
  synthwave84: {
    name: "synthwave84",
    displayName: "Synthwave '84",
    colors: {
      background: "#262335",
      backgroundAlt: "#34294f",
      foreground: "#ffffff",
      foregroundMuted: "#848bbd",
      accent: "#ff7edb",
      accentAlt: "#36f9f6",
      border: "#495495",
      selection: "#463465",
    },
  },

  // Monokai Pro
  "monokai-pro": {
    name: "monokai-pro",
    displayName: "Monokai Pro",
    colors: {
      background: "#2d2a2e",
      backgroundAlt: "#403e41",
      foreground: "#fcfcfa",
      foregroundMuted: "#727072",
      accent: "#ffd866",
      accentAlt: "#ff6188",
      border: "#525053",
      selection: "#525053",
    },
  },

  // Kanagawa
  kanagawa: {
    name: "kanagawa",
    displayName: "Kanagawa",
    colors: {
      background: "#1f1f28",
      backgroundAlt: "#2a2a37",
      foreground: "#dcd7ba",
      foregroundMuted: "#727169",
      accent: "#7e9cd8",
      accentAlt: "#957fb8",
      border: "#363646",
      selection: "#363646",
    },
  },

  // Solarized Dark
  "solarized-dark": {
    name: "solarized-dark",
    displayName: "Solarized Dark",
    colors: {
      background: "#002b36",
      backgroundAlt: "#073642",
      foreground: "#839496",
      foregroundMuted: "#586e75",
      accent: "#268bd2",
      accentAlt: "#2aa198",
      border: "#094959",
      selection: "#094959",
    },
  },

  // Solarized Light
  "solarized-light": {
    name: "solarized-light",
    displayName: "Solarized Light",
    colors: {
      background: "#fdf6e3",
      backgroundAlt: "#eee8d5",
      foreground: "#657b83",
      foregroundMuted: "#93a1a1",
      accent: "#268bd2",
      accentAlt: "#2aa198",
      border: "#d3cbb7",
      selection: "#d3cbb7",
    },
  },

  // Felix (minimal black & white)
  felix: {
    name: "felix",
    displayName: "Felix",
    colors: {
      background: "#0a0a0a",
      backgroundAlt: "#141414",
      foreground: "#e8e8e8",
      foregroundMuted: "#6e6e6e",
      accent: "#ffffff",
      accentAlt: "#50fa7b",
      border: "#2a2a2a",
      selection: "#2a2a2a",
    },
  },

  // Material Ocean
  "material-ocean": {
    name: "material-ocean",
    displayName: "Material Ocean",
    colors: {
      background: "#0f111a",
      backgroundAlt: "#1a1c25",
      foreground: "#8f93a2",
      foregroundMuted: "#464b5d",
      accent: "#84ffff",
      accentAlt: "#c792ea",
      border: "#1f2233",
      selection: "#1f2233",
    },
  },

  // Midnight
  midnight: {
    name: "midnight",
    displayName: "Midnight",
    colors: {
      background: "#0d1117",
      backgroundAlt: "#161b22",
      foreground: "#c9d1d9",
      foregroundMuted: "#8b949e",
      accent: "#58a6ff",
      accentAlt: "#a371f7",
      border: "#30363d",
      selection: "#30363d",
    },
  },

  // Light theme for daytime use
  light: {
    name: "light",
    displayName: "Light",
    colors: {
      background: "#ffffff",
      backgroundAlt: "#f5f5f5",
      foreground: "#1a1a1a",
      foregroundMuted: "#6b6b6b",
      accent: "#0066cc",
      accentAlt: "#0052a3",
      border: "#e0e0e0",
      selection: "#cce5ff",
    },
  },
};

// Aliases for Omarchy theme names that might differ
export const themeAliases: Record<string, string> = {
  catppuccin: "catppuccin-mocha",
  "catppuccin_mocha": "catppuccin-mocha",
  "catppuccin_macchiato": "catppuccin-macchiato",
  "catppuccin_frappe": "catppuccin-frappe",
  "catppuccin_latte": "catppuccin-latte",
  gruvbox: "gruvbox-dark",
  "gruvbox_dark": "gruvbox-dark",
  "gruvbox_light": "gruvbox-light",
  "rose_pine": "rose-pine",
  "rose-pine-main": "rose-pine",
  rosepine: "rose-pine",
  "rose_pine_moon": "rose-pine-moon",
  "rose_pine_dawn": "rose-pine-dawn",
  "tokyo_night": "tokyo-night",
  tokyonight: "tokyo-night",
  everforest: "everforest-dark",
  "everforest_dark": "everforest-dark",
  "everforest_light": "everforest-light",
  "one_dark": "one-dark",
  onedark: "one-dark",
  "monokai_pro": "monokai-pro",
  monoka: "monokai-pro",
  "synthwave_84": "synthwave84",
  synthwave: "synthwave84",
  "solarized_dark": "solarized-dark",
  "solarized_light": "solarized-light",
  solarized: "solarized-dark",
  "material_ocean": "material-ocean",
  material: "material-ocean",
};

export const themeList = Object.values(themes);

export function getTheme(name: string): Theme {
  // Direct match
  if (themes[name]) {
    return themes[name];
  }

  // Try lowercase
  const lower = name.toLowerCase();
  if (themes[lower]) {
    return themes[lower];
  }

  // Check aliases
  if (themeAliases[lower]) {
    return themes[themeAliases[lower]];
  }

  // Partial match - check if the theme name contains any of our known themes
  for (const key of Object.keys(themes)) {
    if (lower.includes(key) || key.includes(lower)) {
      return themes[key];
    }
  }

  // Check aliases for partial match
  for (const [alias, themeName] of Object.entries(themeAliases)) {
    if (lower.includes(alias) || alias.includes(lower)) {
      return themes[themeName];
    }
  }

  // Default fallback
  return themes["tokyo-night"];
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.style.setProperty("--bg", theme.colors.background);
  root.style.setProperty("--bg-alt", theme.colors.backgroundAlt);
  root.style.setProperty("--fg", theme.colors.foreground);
  root.style.setProperty("--fg-muted", theme.colors.foregroundMuted);
  root.style.setProperty("--accent", theme.colors.accent);
  root.style.setProperty("--accent-alt", theme.colors.accentAlt);
  root.style.setProperty("--border", theme.colors.border);
  root.style.setProperty("--selection", theme.colors.selection);
}
