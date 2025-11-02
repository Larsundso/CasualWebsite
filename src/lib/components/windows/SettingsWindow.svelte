<script lang="ts">
 import IconSettings from "@tabler/icons-svelte/icons/settings";
 import IconKeyboard from "@tabler/icons-svelte/icons/keyboard";

 let theme = $state("dark");
 let animations = $state(true);
 let soundEffects = $state(true);

 const shortcuts = [
  { keys: "Click Sidebar Apps", description: "Open application windows" },
  { keys: "1-4 (Workspace Grid)", description: "Switch between workspaces" },
  { keys: "Drag Titlebar", description: "Move windows" },
  { keys: "Drag Window Edges", description: "Resize windows" },
  { keys: "Terminal: ↑/↓", description: "Navigate command history" },
  { keys: "Terminal: Tab", description: "Auto-complete commands" },
  { keys: "Terminal: clear", description: "Clear terminal output" },
  { keys: "Terminal: help", description: "Show available commands" },
  { keys: "Shutdown Button", description: "Power off system (confirmation)" },
 ];
</script>

<div class="settings-window">
 <h2 class="settings-title">
  <IconSettings
   size={24}
   stroke={1.5}
   style="display: inline-block; vertical-align: middle;"
  />
  Settings
 </h2>

 <div class="settings-section">
  <h3>Appearance</h3>
  <div class="setting-item">
   <label for="theme-select">Theme</label>
   <select id="theme-select" bind:value={theme} class="setting-select">
    <option value="dark">Dark</option>
    <option value="light">Light</option>
    <option value="catppuccin">Catppuccin</option>
   </select>
  </div>
 </div>

 <div class="settings-section">
  <h3>Performance</h3>
  <div class="setting-item">
   <label for="animations-toggle"> Enable Animations </label>
   <input
    id="animations-toggle"
    type="checkbox"
    bind:checked={animations}
    class="setting-checkbox"
   />
  </div>
  <div class="setting-item">
   <label for="sounds-toggle"> Sound Effects </label>
   <input
    id="sounds-toggle"
    type="checkbox"
    bind:checked={soundEffects}
    class="setting-checkbox"
   />
  </div>
 </div>

 <div class="settings-section keyboard-shortcuts">
  <h3>
   <IconKeyboard
    size={20}
    stroke={1.5}
    style="display: inline-block; vertical-align: middle; margin-right: 8px;"
   />
   Keyboard Shortcuts & Controls
  </h3>
  <div class="shortcuts-grid">
   {#each shortcuts as shortcut}
    <div class="shortcut-item">
     <kbd class="shortcut-key">{shortcut.keys}</kbd>
     <span class="shortcut-description">{shortcut.description}</span>
    </div>
   {/each}
  </div>
 </div>

 <div class="settings-info">
  <p>System Version: Arch Linux 6.6.10-arch1-1 | Hyprland Compositor</p>
  <p style="margin-top: 8px; opacity: 0.7;">Built with SvelteKit + Svelte 5</p>
 </div>
</div>

<style>
 .settings-window {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  background: linear-gradient(
   135deg,
   rgba(250, 179, 135, 0.05),
   rgba(243, 139, 168, 0.05)
  );
 }

 .settings-title {
  font-size: 24px;
  font-weight: 700;
  color: #fab387;
  margin: 0 0 24px 0;
  text-shadow: 0 0 10px rgba(250, 179, 135, 0.5);
 }

 .settings-section {
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(205, 214, 244, 0.1);
 }

 .settings-section h3 {
  font-size: 16px;
  font-weight: 700;
  color: #fab387;
  margin: 0 0 16px 0;
 }

 .setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(205, 214, 244, 0.1);
 }

 .setting-item:last-child {
  border-bottom: none;
 }

 .setting-item label {
  font-size: 14px;
  color: #cdd6f4;
 }

 .setting-select {
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(250, 179, 135, 0.3);
  border-radius: 6px;
  color: #fab387;
  font-size: 13px;
  outline: none;
  cursor: pointer;
 }

 .setting-select:focus {
  border-color: #fab387;
 }

 .setting-checkbox {
  width: 40px;
  height: 20px;
  cursor: pointer;
 }

 .settings-info {
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  text-align: center;
 }

 .settings-info p {
  color: #bac2de;
  font-size: 13px;
  margin: 0;
 }

 .keyboard-shortcuts {
  background: linear-gradient(
   135deg,
   rgba(137, 180, 250, 0.05),
   rgba(203, 166, 247, 0.05)
  );
 }

 .shortcuts-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
 }

 .shortcut-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(137, 180, 250, 0.1);
  transition: all 0.2s;
 }

 .shortcut-item:hover {
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(137, 180, 250, 0.3);
  transform: translateX(4px);
 }

 .shortcut-key {
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
  font-weight: 600;
  color: #89b4fa;
  background: rgba(137, 180, 250, 0.1);
  border: 1px solid rgba(137, 180, 250, 0.3);
  border-radius: 6px;
  padding: 6px 12px;
  min-width: 140px;
  text-align: center;
  box-shadow:
   0 2px 4px rgba(0, 0, 0, 0.2),
   inset 0 1px 0 rgba(255, 255, 255, 0.1);
  text-shadow: 0 0 8px rgba(137, 180, 250, 0.5);
 }

 .shortcut-description {
  font-size: 13px;
  color: #cdd6f4;
  flex: 1;
 }

 .settings-window::-webkit-scrollbar {
  width: 8px;
 }

 .settings-window::-webkit-scrollbar-track {
  background: rgba(250, 179, 135, 0.05);
 }

 .settings-window::-webkit-scrollbar-thumb {
  background: rgba(250, 179, 135, 0.3);
  border-radius: 4px;
 }

 .settings-window::-webkit-scrollbar-thumb:hover {
  background: rgba(250, 179, 135, 0.5);
 }
</style>
