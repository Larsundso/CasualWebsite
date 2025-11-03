<script lang="ts">
 import { sidebarApps } from "$lib/data/sidebarApps";
 import { systemState } from "$lib/stores/systemStore.svelte";
 import {
  windowState,
  openWindow,
  switchWorkspace,
 } from "$lib/stores/windowStore.svelte";
 import { startShutdown } from "$lib/stores/bootStore.svelte";
 import { detectHardware } from "$lib/utils/hardware-detector";
 import IconCpu from "@tabler/icons-svelte/icons/cpu";
 import IconBrain from "@tabler/icons-svelte/icons/brain";
 import IconUser from "@tabler/icons-svelte/icons/user";
 import IconDeviceGamepad2 from "@tabler/icons-svelte/icons/device-gamepad-2";
 import IconMusic from "@tabler/icons-svelte/icons/music";
 import IconMessage from "@tabler/icons-svelte/icons/message";
 import IconApps from "@tabler/icons-svelte/icons/apps";
 import IconTerminal from "@tabler/icons-svelte/icons/terminal";
 import IconSettings from "@tabler/icons-svelte/icons/settings";
 import type { ComponentType } from "svelte";

 const iconMap: Record<string, ComponentType> = {
  user: IconUser,
  gamepad: IconDeviceGamepad2,
  music: IconMusic,
  message: IconMessage,
  apps: IconApps,
  terminal: IconTerminal,
  settings: IconSettings,
 };

 function getAppIcon(iconName: string): ComponentType {
  return iconMap[iconName] || IconUser;
 }

 function handleAppClick(appId: string) {
  const app = sidebarApps.find((a) => a.id === appId);
  if (app) {
   openWindow(appId, app.label, app.icon);
  }
 }

 function handleShutdown() {
  if (confirm("Are you sure you want to shutdown the system?")) {
   const hardware = detectHardware();
   startShutdown(hardware);
  }
 }
</script>

<aside class="sidebar">
 <!-- Arch Logo -->
 <div class="sidebar-header">
  <div class="arch-logo">
   <svg viewBox="0 0 65 65" width="40" height="40">
    <path
     fill="currentColor"
     d="M32.253.432S16.777 29.735 11.2 41.187c-5.577 11.451.647 15.975 6.096 17.65 5.448 1.675 9.338-3.093 12.957-10.259 3.619-7.165 2.063-10.63 2.063-10.63s-2.028 6.271-6.958 8.863c-4.93 2.592-7.148.109-5.144-4.93 2.005-5.039 12.37-25.316 12.37-25.316l11.91 24.424s-2.428-1.453-3.983-.326c-1.556 1.126-1.772 2.79-.866 4.563.906 1.772 3.136 2.807 5.581 2.807 2.446 0 4.676-2.159 4.676-5.074 0-2.915-3.353-11.558-3.353-11.558s1.556 2.373 3.245 2.59c1.69.217 2.698-1.237 2.698-3.136 0-1.9-2.59-6.054-2.59-6.054s1.556 1.556 2.914 1.664c1.359.109 2.155-.975 2.155-2.264 0-1.29-1.881-4.127-1.881-4.127s1.125.758 1.99.65c.866-.107 1.448-.758 1.448-1.663 0-.906-1.125-2.482-1.125-2.482s.758.217 1.125.108c.368-.108.65-.325.65-.758 0-.434-.65-1.99-.65-1.99L32.253.432z"
    />
   </svg>
  </div>
 </div>

 <!-- App Launcher -->
 <div class="sidebar-apps">
  {#each sidebarApps as app (app.id)}
   {@const Icon = getAppIcon(app.icon)}
   <button
    class="sidebar-app"
    style="--app-color: {app.color}"
    onclick={() => handleAppClick(app.id)}
    title={app.label}
   >
    <span class="app-icon">
     <Icon size={24} stroke={1.5} />
    </span>
   </button>
  {/each}
 </div>

 <!-- Workspace Switcher -->
 <div class="sidebar-workspaces">
  {#each Array(4) as _, i}
   <button
    class="workspace-btn"
    class:active={windowState.currentWorkspace === i + 1}
    onclick={() => switchWorkspace(i + 1)}
   >
    {i + 1}
   </button>
  {/each}
 </div>

 <!-- System Stats -->
 <div class="sidebar-stats">
  <div class="stat-item">
   <div class="stat-icon">
    <IconCpu size={18} stroke={1.5} />
   </div>
   <div class="stat-bar">
    <div class="stat-fill" style="width: {systemState.cpuUsage}%"></div>
   </div>
   <div class="stat-value">{systemState.cpuUsage}%</div>
  </div>
  <div class="stat-item">
   <div class="stat-icon">
    <IconBrain size={18} stroke={1.5} />
   </div>
   <div class="stat-bar">
    <div class="stat-fill" style="width: {systemState.ramUsage}%"></div>
   </div>
   <div class="stat-value">{systemState.ramUsage}%</div>
  </div>
 </div>

 <!-- Clock -->
 <div class="sidebar-clock">
  <div class="clock-time">{systemState.formattedTime}</div>
  <div class="clock-date">{systemState.formattedDate}</div>
 </div>

 <!-- Shutdown Button -->
 <button
  class="shutdown-button"
  onclick={handleShutdown}
  title="Shutdown System"
 >
  <svg
   width="24"
   height="24"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   stroke-width="2"
   stroke-linecap="round"
   stroke-linejoin="round"
  >
   <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
   <line x1="12" y1="2" x2="12" y2="12"></line>
  </svg>
 </button>
</aside>

<style>
 .sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 80px;
  background: linear-gradient(
   180deg,
   rgba(30, 30, 46, 0.95),
   rgba(24, 24, 37, 0.95)
  );
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(205, 214, 244, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  gap: 20px;
  z-index: 100;
 }

 .sidebar-header {
  display: flex;
  justify-content: center;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(205, 214, 244, 0.1);
 }

 .arch-logo {
  color: #89b4fa;
  filter: drop-shadow(0 0 10px rgba(137, 180, 250, 0.5));
  transition: all 0.3s;
 }

 .arch-logo:hover {
  filter: drop-shadow(0 0 15px rgba(137, 180, 250, 0.8));
  transform: scale(1.1);
 }

 .sidebar-apps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
 }

 .sidebar-app {
  width: 50px;
  height: 50px;
  background: linear-gradient(
   135deg,
   rgba(var(--app-color), 0.2),
   rgba(var(--app-color), 0.1)
  );
  border: 2px solid rgba(var(--app-color), 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
  color: #cdd6f4;
 }

 .sidebar-app::before {
  content: "";
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, rgba(var(--app-color), 0.4), transparent);
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.3s;
 }

 .sidebar-app:hover {
  transform: scale(1.15);
  box-shadow: 0 8px 25px rgba(var(--app-color), 0.4);
 }

 .sidebar-app:hover::before {
  opacity: 1;
 }

 .app-icon {
  position: relative;
  z-index: 1;
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
 }

 .sidebar-workspaces {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
 }

 .workspace-btn {
  width: 28px;
  height: 28px;
  background: rgba(137, 180, 250, 0.1);
  border: 1px solid rgba(137, 180, 250, 0.3);
  border-radius: 6px;
  color: #89b4fa;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
 }

 .workspace-btn:hover {
  background: rgba(137, 180, 250, 0.2);
  transform: scale(1.1);
 }

 .workspace-btn.active {
  background: rgba(137, 180, 250, 0.4);
  border-color: #89b4fa;
  box-shadow: 0 0 10px rgba(137, 180, 250, 0.5);
 }

 .sidebar-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
 }

 .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
 }

 .stat-icon {
  font-size: 18px;
 }

 .stat-bar {
  width: 50px;
  height: 4px;
  background: rgba(137, 180, 250, 0.2);
  border-radius: 2px;
  overflow: hidden;
 }

 .stat-fill {
  height: 100%;
  background: linear-gradient(90deg, #89b4fa, #cba6f7);
  transition: width 0.5s;
 }

 .stat-value {
  font-size: 10px;
  font-weight: 600;
  color: #89b4fa;
 }

 .sidebar-clock {
  text-align: center;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
 }

 .clock-time {
  font-size: 16px;
  font-weight: 700;
  color: #cba6f7;
  text-shadow: 0 0 10px rgba(203, 166, 247, 0.5);
 }

 .clock-date {
  font-size: 10px;
  color: #cdd6f4;
  margin-top: 4px;
 }

 .shutdown-button {
  width: 50px;
  height: 50px;
  background: linear-gradient(
   135deg,
   rgba(248, 113, 113, 0.2),
   rgba(239, 68, 68, 0.1)
  );
  border: 2px solid rgba(248, 113, 113, 0.3);
  border-radius: 12px;
  color: #f87171;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
  margin-top: 10px;
 }

 .shutdown-button::before {
  content: "";
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, rgba(248, 113, 113, 0.4), transparent);
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.3s;
 }

 .shutdown-button:hover {
  transform: scale(1.15);
  box-shadow: 0 8px 25px rgba(248, 113, 113, 0.5);
  border-color: #f87171;
  background: linear-gradient(
   135deg,
   rgba(248, 113, 113, 0.3),
   rgba(239, 68, 68, 0.2)
  );
 }

 .shutdown-button:hover::before {
  opacity: 1;
 }

 .shutdown-button:active {
  transform: scale(0.95);
 }

 .shutdown-button svg {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 0 8px rgba(248, 113, 113, 0.6));
 }

 /* Mobile */
 @media (max-width: 768px) {
  .sidebar {
   left: 0;
   right: 0;
   top: auto;
   bottom: 0;
   width: 100%;
   height: 70px;
   flex-direction: row;
   justify-content: flex-start;
   align-items: center;
   padding: 8px 12px;
   gap: 12px;
   border-right: none;
   border-top: 1px solid rgba(205, 214, 244, 0.1);
   background: linear-gradient(
    0deg,
    rgba(30, 30, 46, 0.98),
    rgba(24, 24, 37, 0.98)
   );
   overflow-x: auto;
   overflow-y: hidden;
   scrollbar-width: none;
  }

  .sidebar::-webkit-scrollbar {
   display: none;
  }

  .sidebar-header {
   display: none;
  }

  .sidebar-apps {
   display: flex;
   flex-direction: row;
   gap: 12px;
   flex: 1;
   overflow-x: auto;
   overflow-y: hidden;
   scrollbar-width: none;
   align-items: center;
  }

  .sidebar-apps::-webkit-scrollbar {
   display: none;
  }

  .sidebar-app {
   width: 48px;
   height: 48px;
   flex-shrink: 0;
  }

  .sidebar-workspaces {
   display: none;
  }

  .sidebar-stats {
   display: none;
  }

  .sidebar-clock {
   display: none;
  }

  .shutdown-button {
   width: 48px;
   height: 48px;
   margin-top: 0;
   flex-shrink: 0;
  }
 }
</style>
