<svelte:options runes={true} />

<script lang="ts">
 import { fade, scale } from "svelte/transition";
 import { quintOut } from "svelte/easing";
 import { onMount } from "svelte";
 import {
  windowState,
  closeWindow,
  minimizeWindow,
  maximizeWindow,
  bringToFront,
  startDrag,
  startResize,
  handleMouseMove,
  handleMouseUp,
 } from "$lib/stores/windowStore.svelte";

 let isMobile = $state(false);

 import Terminal from "$lib/components/windows/Terminal.svelte";
 import MusicPlayer from "$lib/components/windows/MusicPlayer.svelte";
 import ProfileWindow from "$lib/components/windows/ProfileWindow.svelte";
 import GamesWindow from "$lib/components/windows/GamesWindow.svelte";
 import ServersWindow from "$lib/components/windows/ServersWindow.svelte";
 import AppsWindow from "$lib/components/windows/AppsWindow.svelte";
 import SettingsWindow from "$lib/components/windows/SettingsWindow.svelte";
 import FocusWindow from "$lib/components/windows/FocusWindow.svelte";
 import TodoWindow from "$lib/components/windows/TodoWindow.svelte";

 import IconUser from "@tabler/icons-svelte/icons/user";
 import IconDeviceGamepad2 from "@tabler/icons-svelte/icons/device-gamepad-2";
 import IconMusic from "@tabler/icons-svelte/icons/music";
 import IconMessage from "@tabler/icons-svelte/icons/message";
 import IconApps from "@tabler/icons-svelte/icons/apps";
 import IconTerminal from "@tabler/icons-svelte/icons/terminal";
 import IconSettings from "@tabler/icons-svelte/icons/settings";
 import IconClock from "@tabler/icons-svelte/icons/clock";
 import IconCheckbox from "@tabler/icons-svelte/icons/checkbox";
 import type { ComponentType } from "svelte";

 const visibleWindows = $derived(windowState.visibleWindows);
 const draggingWindow = $derived(windowState.draggingWindow);
 const resizingWindow = $derived(windowState.resizingWindow);

 const windowComponents: Record<string, any> = {
  terminal: Terminal,
  music: MusicPlayer,
  profile: ProfileWindow,
  focus: FocusWindow,
  todos: TodoWindow,
  games: GamesWindow,
  servers: ServersWindow,
  apps: AppsWindow,
  settings: SettingsWindow,
 };

 const iconMap: Record<string, ComponentType> = {
  user: IconUser,
  clock: IconClock,
  checkbox: IconCheckbox,
  gamepad: IconDeviceGamepad2,
  music: IconMusic,
  message: IconMessage,
  apps: IconApps,
  terminal: IconTerminal,
  settings: IconSettings,
 };

 function getWindowIcon(iconName: string): ComponentType {
  return iconMap[iconName] || IconTerminal;
 }

 onMount(() => {
  isMobile = window.innerWidth <= 768;

  const handleResize = () => {
   isMobile = window.innerWidth <= 768;
  };

  window.addEventListener("resize", handleResize);

  const handleMove = (e: MouseEvent) => handleMouseMove(e);
  const handleUp = () => handleMouseUp();

  window.addEventListener("mousemove", handleMove);
  window.addEventListener("mouseup", handleUp);

  // Add touch event handlers for mobile
  const handleTouchMove = (e: TouchEvent) => {
   if (e.touches.length > 0) {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
     clientX: touch.clientX,
     clientY: touch.clientY,
     bubbles: true,
     cancelable: true,
    });
    handleMouseMove(mouseEvent);
   }
  };

  const handleTouchEnd = () => {
   handleMouseUp();
  };

  window.addEventListener("touchmove", handleTouchMove, { passive: false });
  window.addEventListener("touchend", handleTouchEnd);
  window.addEventListener("touchcancel", handleTouchEnd);

  return () => {
   window.removeEventListener("resize", handleResize);
   window.removeEventListener("mousemove", handleMove);
   window.removeEventListener("mouseup", handleUp);
   window.removeEventListener("touchmove", handleTouchMove);
   window.removeEventListener("touchend", handleTouchEnd);
   window.removeEventListener("touchcancel", handleTouchEnd);
  };
 });
</script>

<!-- Window Container -->
<div class="window-container">
 {#each visibleWindows as window (window.id)}
  {@const Component = windowComponents[window.id]}
  {@const Icon = getWindowIcon(window.icon)}
  <div
   class="window"
   class:maximized={window.maximized}
   class:dragging={draggingWindow === window || resizingWindow === window}
   role="dialog"
   aria-label={window.title}
   tabindex="0"
   style="
				left: {window.x}px;
				top: {window.y}px;
				width: {window.width}px;
				height: {window.height}px;
				z-index: {window.zIndex};
			"
   transition:scale={{ duration: 200, easing: quintOut }}
   onmousedown={!isMobile ? () => bringToFront(window) : undefined}
  >
   <!-- Titlebar -->
   <div
    class="titlebar"
    role="button"
    tabindex="0"
    onmousedown={!isMobile ? (e) => startDrag(e, window) : undefined}
   >
    <div class="window-title">
     <span class="window-icon">
      <Icon size={16} stroke={1.5} />
     </span>
     <span>{window.title}</span>
    </div>
    <div class="window-controls">
     <button
      class="window-btn minimize"
      onclick={(e) => {
       e.stopPropagation();
       minimizeWindow(window.id);
      }}
     >
      ─
     </button>
     <button
      class="window-btn maximize"
      onclick={(e) => {
       e.stopPropagation();
       maximizeWindow(window.id);
      }}
     >
      {window.maximized ? "❐" : "□"}
     </button>
     <button
      class="window-btn close"
      onclick={(e) => {
       e.stopPropagation();
       closeWindow(window.id);
      }}
     >
      ✕
     </button>
    </div>
   </div>

   <!-- Window Content -->
   <div class="window-content">
    <Component />
   </div>

   <!-- Resize Handles -->
   {#if !window.maximized}
    <div
     class="resize-handle n"
     role="button"
     tabindex="-1"
     aria-label="Resize north"
     onmousedown={!isMobile ? (e) => startResize(e, window, "n") : undefined}
    ></div>
    <div
     class="resize-handle s"
     role="button"
     tabindex="-1"
     aria-label="Resize south"
     onmousedown={!isMobile ? (e) => startResize(e, window, "s") : undefined}
    ></div>
    <div
     class="resize-handle e"
     role="button"
     tabindex="-1"
     aria-label="Resize east"
     onmousedown={!isMobile ? (e) => startResize(e, window, "e") : undefined}
    ></div>
    <div
     class="resize-handle w"
     role="button"
     tabindex="-1"
     aria-label="Resize west"
     onmousedown={!isMobile ? (e) => startResize(e, window, "w") : undefined}
    ></div>
    <div
     class="resize-handle ne"
     role="button"
     tabindex="-1"
     aria-label="Resize northeast"
     onmousedown={!isMobile ? (e) => startResize(e, window, "ne") : undefined}
    ></div>
    <div
     class="resize-handle nw"
     role="button"
     tabindex="-1"
     aria-label="Resize northwest"
     onmousedown={!isMobile ? (e) => startResize(e, window, "nw") : undefined}
    ></div>
    <div
     class="resize-handle se"
     role="button"
     tabindex="-1"
     aria-label="Resize southeast"
     onmousedown={!isMobile ? (e) => startResize(e, window, "se") : undefined}
    ></div>
    <div
     class="resize-handle sw"
     role="button"
     tabindex="-1"
     aria-label="Resize southwest"
     onmousedown={!isMobile ? (e) => startResize(e, window, "sw") : undefined}
    ></div>
   {/if}
  </div>
 {/each}
</div>

<style>
 .window-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
 }

 .window {
  position: absolute;
  background: rgba(30, 30, 46, 0.4);
  border: 1px solid rgba(203, 166, 247, 0.3);
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
   0 8px 32px 0 rgba(0, 0, 0, 0.37),
   inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  transition:
   box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
   border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
 }

 .window.dragging {
  transition: none;
 }

 .window:hover {
  box-shadow:
   0 12px 48px 0 rgba(203, 166, 247, 0.15),
   inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
  border-color: rgba(203, 166, 247, 0.5);
 }

 .window.maximized {
  border-radius: 0;
 }

 .titlebar {
  height: 40px;
  background: rgba(17, 17, 27, 0.3);
  border-bottom: 1px solid rgba(203, 166, 247, 0.2);
  backdrop-filter: blur(10px) saturate(150%);
  -webkit-backdrop-filter: blur(10px) saturate(150%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  cursor: move;
  user-select: none;
  box-shadow: inset 0 -1px 0 0 rgba(255, 255, 255, 0.05);
 }

 .window-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #cdd6f4;
 }

 .window-icon {
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #89b4fa;
 }

 .window-controls {
  display: flex;
  gap: 8px;
 }

 .window-btn {
  width: 32px;
  height: 32px;
  background: rgba(203, 166, 247, 0.1);
  border: 1px solid rgba(203, 166, 247, 0.2);
  border-radius: 6px;
  color: #cdd6f4;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
 }

 .window-btn:hover {
  background: rgba(203, 166, 247, 0.2);
 }

 .window-btn.close:hover {
  background: rgba(243, 139, 168, 0.3);
  border-color: #f38ba8;
  color: #f38ba8;
 }

 .window-content {
  flex: 1;
  overflow: hidden;
 }

 /* Resize Handles */
 .resize-handle {
  position: absolute;
  z-index: 10;
 }

 .resize-handle.n,
 .resize-handle.s {
  left: 0;
  right: 0;
  height: 8px;
  cursor: ns-resize;
 }

 .resize-handle.n {
  top: 0;
 }

 .resize-handle.s {
  bottom: 0;
 }

 .resize-handle.e,
 .resize-handle.w {
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: ew-resize;
 }

 .resize-handle.e {
  right: 0;
 }

 .resize-handle.w {
  left: 0;
 }

 .resize-handle.ne,
 .resize-handle.nw,
 .resize-handle.se,
 .resize-handle.sw {
  width: 12px;
  height: 12px;
 }

 .resize-handle.ne {
  top: 0;
  right: 0;
  cursor: nesw-resize;
 }

 .resize-handle.nw {
  top: 0;
  left: 0;
  cursor: nwse-resize;
 }

 .resize-handle.se {
  bottom: 0;
  right: 0;
  cursor: nwse-resize;
 }

 .resize-handle.sw {
  bottom: 0;
  left: 0;
  cursor: nesw-resize;
 }

 /* Mobile */
 @media (max-width: 768px) {
  .window-container {
   left: 0 !important;
   top: 0 !important;
   right: 0 !important;
   bottom: 70px !important;
   overflow: visible !important;
  }

  .window {
   left: 0 !important;
   top: 0 !important;
   width: 100% !important;
   height: 100% !important;
   border-radius: 0 !important;
   max-width: 100% !important;
   max-height: 100% !important;
   overflow: hidden;
  }

  .window.maximized {
   border-radius: 0 !important;
  }

  .titlebar {
   cursor: default !important;
   height: 50px;
  }

  .window-title {
   font-size: 16px;
  }

  .window-icon {
   font-size: 20px;
  }

  .window-btn {
   width: 40px;
   height: 40px;
   font-size: 16px;
  }

  .window-content {
   height: calc(100% - 50px);
   overflow-y: auto;
  }

  .resize-handle {
   display: none !important;
  }

  .window-btn.minimize,
  .window-btn.maximize {
   display: none;
  }
 }
</style>
