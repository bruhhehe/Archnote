<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { onMount } from "svelte";
  import { themes, themeList, getTheme, applyTheme, type Theme } from "$lib/themes";

  interface Note {
    id: string;
    content: string;
    created_at: number;
    updated_at: number;
  }

  let notes = $state<Note[]>([]);
  let currentNote = $state<Note | null>(null);
  let currentNoteIndex = $state(0);
  let currentTheme = $state<Theme>(themes["tokyo-night"]);
  let alwaysOnTop = $state(false);
  let useOmarchyTheme = $state(true);
  let omarchyInstalled = $state(false);
  let showThemeSelector = $state(false);
  let showSettings = $state(false);
  let textareaElement: HTMLTextAreaElement;
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;
  let isDragging = $state(false);
  let editorMode = $state<'edit' | 'view'>('edit');

  // Checklist regex patterns
  const checkboxPattern = /^(\s*)\[([ xX])\]\s?(.*)$/;

  // Parse content into lines with checkbox info
  function parseLines(content: string): Array<{text: string, isCheckbox: boolean, checked: boolean, indent: string, label: string, lineIndex: number}> {
    return content.split('\n').map((line, lineIndex) => {
      const match = line.match(checkboxPattern);
      if (match) {
        return {
          text: line,
          isCheckbox: true,
          checked: match[2].toLowerCase() === 'x',
          indent: match[1],
          label: match[3],
          lineIndex
        };
      }
      return {
        text: line,
        isCheckbox: false,
        checked: false,
        indent: '',
        label: line,
        lineIndex
      };
    });
  }

  // Toggle checkbox at line index
  function toggleCheckbox(lineIndex: number) {
    if (!currentNote) return;

    const lines = currentNote.content.split('\n');
    const line = lines[lineIndex];
    const match = line.match(checkboxPattern);

    if (match) {
      const indent = match[1];
      const checked = match[2].toLowerCase() === 'x';
      const label = match[3];
      lines[lineIndex] = `${indent}[${checked ? ' ' : 'x'}] ${label}`;
      currentNote.content = lines.join('\n');
      debouncedSave(currentNote.content);
    }
  }

  // Insert checkbox at cursor or current line
  function insertCheckbox() {
    if (!textareaElement || !currentNote) return;

    const start = textareaElement.selectionStart;
    const end = textareaElement.selectionEnd;
    const content = currentNote.content;

    // Find the start of the current line
    let lineStart = start;
    while (lineStart > 0 && content[lineStart - 1] !== '\n') {
      lineStart--;
    }

    // Check if line already has a checkbox
    const lineEnd = content.indexOf('\n', start);
    const line = content.substring(lineStart, lineEnd === -1 ? content.length : lineEnd);

    if (checkboxPattern.test(line)) {
      // Already a checkbox, just focus
      return;
    }

    // Insert checkbox at start of line
    const before = content.substring(0, lineStart);
    const after = content.substring(lineStart);
    currentNote.content = before + '[ ] ' + after;
    debouncedSave(currentNote.content);

    // Move cursor after checkbox
    setTimeout(() => {
      textareaElement.selectionStart = textareaElement.selectionEnd = lineStart + 4;
      textareaElement.focus();
    }, 0);
  }

  // Debounced save
  function debouncedSave(content: string) {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      saveTimeout = null;
      if (currentNote) {
        await invoke("update_note", { id: currentNote.id, content });
      }
    }, 300);
  }

  // Write any pending debounced save immediately
  async function flushSave() {
    if (!saveTimeout) return;
    clearTimeout(saveTimeout);
    saveTimeout = null;
    if (currentNote) {
      await invoke("update_note", { id: currentNote.id, content: currentNote.content });
    }
  }

  // Handle content change
  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    if (currentNote) {
      currentNote.content = target.value;
      debouncedSave(target.value);
    }
  }

  // Strip formatting on paste
  function handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData?.getData("text/plain") || "";
    document.execCommand("insertText", false, text);
  }

  // Navigate between notes
  async function navigateNote(direction: number) {
    const note = await invoke<Note | null>("navigate_note", { direction });
    if (note) {
      currentNote = note;
      currentNoteIndex = await invoke<number>("get_current_note_index");
      await loadNotes();
    }
  }

  // Create new note
  async function createNote() {
    const note = await invoke<Note>("create_note");
    currentNote = note;
    await loadNotes();
    currentNoteIndex = notes.length - 1;
    textareaElement?.focus();
  }

  // Delete current note
  async function deleteNote() {
    if (!currentNote || notes.length <= 1) return;
    const note = await invoke<Note | null>("delete_note", { id: currentNote.id });
    if (note) {
      currentNote = note;
      await loadNotes();
      currentNoteIndex = await invoke<number>("get_current_note_index");
    }
  }

  // Load all notes
  async function loadNotes() {
    notes = await invoke<Note[]>("get_notes");
  }

  // Switch to specific note
  async function switchToNote(index: number) {
    await invoke("set_current_note", { index });
    currentNote = notes[index];
    currentNoteIndex = index;
  }

  // Toggle always on top
  async function toggleAlwaysOnTop() {
    alwaysOnTop = await invoke<boolean>("toggle_always_on_top");
  }

  // Set theme
  async function setTheme(themeName: string) {
    const theme = getTheme(themeName);
    currentTheme = theme;
    applyTheme(theme);
    await invoke("set_theme", { theme: themeName });
    showThemeSelector = false;
  }

  // Check and apply Omarchy theme
  async function checkOmarchyTheme() {
    omarchyInstalled = await invoke<boolean>("is_omarchy_installed");
    useOmarchyTheme = await invoke<boolean>("get_use_omarchy_theme");

    if (omarchyInstalled && useOmarchyTheme) {
      const omarchyThemeName = await invoke<string | null>("get_omarchy_theme");
      if (omarchyThemeName) {
        const theme = getTheme(omarchyThemeName);
        currentTheme = theme;
        applyTheme(theme);
        return;
      }
    }

    // Fallback to saved theme
    const savedTheme = await invoke<string>("get_theme");
    const theme = getTheme(savedTheme);
    currentTheme = theme;
    applyTheme(theme);
  }

  // Toggle Omarchy theme usage
  async function toggleOmarchyTheme() {
    useOmarchyTheme = !useOmarchyTheme;
    await invoke("set_use_omarchy_theme", { useOmarchy: useOmarchyTheme });
    await checkOmarchyTheme();
  }

  // Window controls
  async function minimizeWindow() {
    await invoke("minimize_window");
  }

  // Closing quits the app (the close-requested handler saves first)
  async function closeWindow() {
    await getCurrentWindow().close();
  }

  // Drag window
  async function startDrag(e: MouseEvent) {
    // Only drag with the primary button, and not when clicking a titlebar button
    if (e.button !== 0 || (e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    await getCurrentWindow().startDragging();
  }

  // Keyboard shortcuts
  function handleKeydown(e: KeyboardEvent) {
    // Ctrl/Cmd + N - New note
    if ((e.ctrlKey || e.metaKey) && e.key === "n") {
      e.preventDefault();
      createNote();
    }
    // Ctrl/Cmd + W - Delete note
    if ((e.ctrlKey || e.metaKey) && e.key === "w") {
      e.preventDefault();
      deleteNote();
    }
    // Ctrl/Cmd + Left/Right - Navigate notes
    if ((e.ctrlKey || e.metaKey) && e.key === "ArrowLeft") {
      e.preventDefault();
      navigateNote(-1);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "ArrowRight") {
      e.preventDefault();
      navigateNote(1);
    }
    // Ctrl/Cmd + T - Toggle theme selector
    if ((e.ctrlKey || e.metaKey) && e.key === "t") {
      e.preventDefault();
      showThemeSelector = !showThemeSelector;
      showSettings = false;
    }
    // Ctrl/Cmd + P - Toggle pin
    if ((e.ctrlKey || e.metaKey) && e.key === "p") {
      e.preventDefault();
      toggleAlwaysOnTop();
    }
    // Escape - Close modals
    if (e.key === "Escape") {
      showThemeSelector = false;
      showSettings = false;
    }
  }

  // Swipe handling
  let touchStartX = 0;
  let touchEndX = 0;

  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.changedTouches[0].screenX;
  }

  function handleTouchEnd(e: TouchEvent) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        navigateNote(1); // Swipe left - next note
      } else {
        navigateNote(-1); // Swipe right - previous note
      }
    }
  }

  // Poll for Omarchy theme changes (like hibob-tui)
  let themePollingInterval: ReturnType<typeof setInterval>;

  onMount(async () => {
    // Save pending edits before the window closes (✕ button or compositor close).
    // Closing the window quits the app.
    getCurrentWindow().onCloseRequested(async () => {
      try {
        await flushSave();
      } catch (e) {
        console.error("Failed to save before closing", e);
      }
    });

    // Load initial state
    await loadNotes();
    currentNote = await invoke<Note | null>("get_current_note");
    currentNoteIndex = await invoke<number>("get_current_note_index");
    alwaysOnTop = await invoke<boolean>("get_always_on_top");
    await checkOmarchyTheme();

    // Poll for Omarchy theme changes every 2 seconds
    themePollingInterval = setInterval(async () => {
      if (omarchyInstalled && useOmarchyTheme) {
        const omarchyThemeName = await invoke<string | null>("get_omarchy_theme");
        if (omarchyThemeName) {
          const theme = getTheme(omarchyThemeName);
          if (theme.name !== currentTheme.name) {
            currentTheme = theme;
            applyTheme(theme);
          }
        }
      }
    }, 2000);

    // Focus textarea
    textareaElement?.focus();

    return () => {
      if (themePollingInterval) clearInterval(themePollingInterval);
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<main
  class="app"
  ontouchstart={handleTouchStart}
  ontouchend={handleTouchEnd}
>
  <!-- Title bar -->
  <div
    class="titlebar"
    onmousedown={startDrag}
    role="banner"
  >
    <div class="titlebar-left">
      <span class="app-title">Archnote</span>
      {#if omarchyInstalled && useOmarchyTheme}
        <span class="omarchy-badge" title="Using Omarchy theme">O</span>
      {/if}
    </div>
    <div class="titlebar-center">
      <!-- Note navigation dots -->
      <div class="note-dots">
        {#each notes as note, i}
          <button
            class="dot"
            class:active={i === currentNoteIndex}
            onclick={() => switchToNote(i)}
            title={`Note ${i + 1}`}
          ></button>
        {/each}
        <button class="dot add-dot" onclick={createNote} title="New note (Ctrl+N)">
          +
        </button>
      </div>
    </div>
    <div class="titlebar-right">
      <button
        class="titlebar-btn"
        class:active={alwaysOnTop}
        onclick={toggleAlwaysOnTop}
        title="Pin to top (Ctrl+P)"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
        </svg>
      </button>
      <button
        class="titlebar-btn"
        onclick={() => { showThemeSelector = !showThemeSelector; showSettings = false; }}
        title="Theme (Ctrl+T)"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3M12,19A7,7 0 0,1 5,12A7,7 0 0,1 12,5A7,7 0 0,1 19,12A7,7 0 0,1 12,19M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15Z" />
        </svg>
      </button>
      <button
        class="titlebar-btn"
        onclick={() => { showSettings = !showSettings; showThemeSelector = false; }}
        title="Settings"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
        </svg>
      </button>
      <button class="titlebar-btn" onclick={minimizeWindow} title="Minimize">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M19,13H5V11H19V13Z" />
        </svg>
      </button>
      <button class="titlebar-btn close" onclick={closeWindow} title="Close">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Theme selector -->
  {#if showThemeSelector}
    <div class="modal theme-selector">
      <div class="modal-header">
        <span>Theme</span>
        <button class="modal-close" onclick={() => showThemeSelector = false}>×</button>
      </div>
      <div class="theme-grid">
        {#each themeList as theme}
          <button
            class="theme-option"
            class:active={theme.name === currentTheme.name}
            onclick={() => setTheme(theme.name)}
            style="--preview-bg: {theme.colors.background}; --preview-accent: {theme.colors.accent}"
          >
            <div class="theme-preview">
              <div class="preview-dot"></div>
            </div>
            <span class="theme-name">{theme.displayName}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Settings modal -->
  {#if showSettings}
    <div class="modal settings">
      <div class="modal-header">
        <span>Settings</span>
        <button class="modal-close" onclick={() => showSettings = false}>×</button>
      </div>
      <div class="settings-content">
        {#if omarchyInstalled}
          <label class="setting-row">
            <span>Use Omarchy theme</span>
            <input type="checkbox" checked={useOmarchyTheme} onchange={toggleOmarchyTheme} />
          </label>
        {/if}
        <div class="setting-row">
          <span>Current theme</span>
          <span class="setting-value">{currentTheme.displayName}</span>
        </div>
        <div class="setting-row">
          <span>Notes</span>
          <span class="setting-value">{notes.length}</span>
        </div>
        <div class="shortcuts-section">
          <div class="shortcuts-title">Keyboard shortcuts</div>
          <div class="shortcut-row"><kbd>Super+N</kbd> Show/hide</div>
          <div class="shortcut-row"><kbd>Ctrl+N</kbd> New note</div>
          <div class="shortcut-row"><kbd>Ctrl+W</kbd> Delete note</div>
          <div class="shortcut-row"><kbd>Ctrl+←/→</kbd> Navigate</div>
          <div class="shortcut-row"><kbd>Ctrl+T</kbd> Themes</div>
          <div class="shortcut-row"><kbd>Ctrl+P</kbd> Pin to top</div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Editor -->
  <div class="editor-container">
    {#if currentNote}
      <textarea
        bind:this={textareaElement}
        class="editor"
        placeholder="Start typing..."
        value={currentNote.content}
        oninput={handleInput}
        onpaste={handlePaste}
        spellcheck="false"
      ></textarea>
    {/if}
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="nav-buttons">
      <button
        class="nav-btn"
        onclick={() => navigateNote(-1)}
        disabled={notes.length <= 1}
        title="Previous note"
      >
        ←
      </button>
      <span class="note-counter">{currentNoteIndex + 1} / {notes.length}</span>
      <button
        class="nav-btn"
        onclick={() => navigateNote(1)}
        disabled={notes.length <= 1}
        title="Next note"
      >
        →
      </button>
    </div>
    {#if currentNote}
      <button
        class="delete-btn"
        onclick={deleteNote}
        disabled={notes.length <= 1}
        title="Delete note (Ctrl+W)"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
        </svg>
      </button>
    {/if}
  </div>
</main>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    overflow: hidden;
    background: transparent;
  }

  :global(::selection) {
    background: var(--selection);
  }

  .app {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    color: var(--fg);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border);
  }

  /* Titlebar */
  .titlebar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--bg-alt);
    border-bottom: 1px solid var(--border);
    -webkit-user-select: none;
    user-select: none;
    cursor: grab;
  }

  .titlebar:active {
    cursor: grabbing;
  }

  .titlebar-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .app-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--fg);
  }

  .omarchy-badge {
    font-size: 10px;
    font-weight: bold;
    padding: 2px 5px;
    background: var(--accent);
    color: var(--bg);
    border-radius: 4px;
  }

  .titlebar-center {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .note-dots {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--fg-muted);
    border: none;
    cursor: pointer;
    padding: 0;
    transition: all 0.15s ease;
  }

  .dot:hover {
    background: var(--fg);
    transform: scale(1.2);
  }

  .dot.active {
    background: var(--accent);
  }

  .dot.add-dot {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    color: var(--fg-muted);
    background: transparent;
    border: 1px dashed var(--fg-muted);
  }

  .dot.add-dot:hover {
    color: var(--accent);
    border-color: var(--accent);
    background: transparent;
  }

  .titlebar-right {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .titlebar-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: var(--fg-muted);
    cursor: pointer;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .titlebar-btn:hover {
    background: var(--border);
    color: var(--fg);
  }

  .titlebar-btn.active {
    color: var(--accent);
  }

  .titlebar-btn.close:hover {
    background: #e53935;
    color: white;
  }

  /* Modal */
  .modal {
    position: absolute;
    top: 48px;
    right: 12px;
    background: var(--bg-alt);
    border: 1px solid var(--border);
    border-radius: 8px;
    z-index: 100;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    max-height: calc(100vh - 120px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    font-weight: 600;
    font-size: 13px;
  }

  .modal-close {
    background: transparent;
    border: none;
    color: var(--fg-muted);
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .modal-close:hover {
    color: var(--fg);
  }

  /* Theme selector */
  .theme-selector {
    width: 340px;
  }

  .theme-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 12px;
    overflow-y: auto;
    max-height: 400px;
  }

  .theme-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .theme-option:hover {
    border-color: var(--fg-muted);
  }

  .theme-option.active {
    border-color: var(--accent);
    background: var(--selection);
  }

  .theme-preview {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--preview-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .preview-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--preview-accent);
  }

  .theme-name {
    font-size: 11px;
    color: var(--fg);
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Settings */
  .settings {
    width: 260px;
  }

  .settings-content {
    padding: 12px 16px;
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 13px;
    border-bottom: 1px solid var(--border);
  }

  .setting-row:last-child {
    border-bottom: none;
  }

  .setting-value {
    color: var(--fg-muted);
  }

  .setting-row input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: var(--accent);
  }

  .shortcuts-section {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }

  .shortcuts-title {
    font-size: 11px;
    color: var(--fg-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .shortcut-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--fg-muted);
    margin-bottom: 4px;
  }

  .shortcut-row kbd {
    font-family: monospace;
    font-size: 10px;
    padding: 2px 6px;
    background: var(--border);
    border-radius: 4px;
    color: var(--fg);
  }

  /* Editor */
  .editor-container {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .editor {
    width: 100%;
    height: 100%;
    padding: 16px 20px;
    background: transparent;
    border: none;
    resize: none;
    font-family: inherit;
    font-size: 15px;
    line-height: 1.6;
    color: var(--fg);
    outline: none;
  }

  .editor::placeholder {
    color: var(--fg-muted);
  }

  /* Footer */
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--bg-alt);
    border-top: 1px solid var(--border);
  }

  .nav-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .nav-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: var(--fg-muted);
    cursor: pointer;
    border-radius: 6px;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .nav-btn:hover:not(:disabled) {
    background: var(--border);
    color: var(--fg);
  }

  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .note-counter {
    font-size: 12px;
    color: var(--fg-muted);
    min-width: 40px;
    text-align: center;
  }

  .delete-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: var(--fg-muted);
    cursor: pointer;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .delete-btn:hover:not(:disabled) {
    background: #e53935;
    color: white;
  }

  .delete-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
</style>
