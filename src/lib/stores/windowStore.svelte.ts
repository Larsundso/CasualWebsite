/**
 * Window Management Store
 * Manages window state, z-index, workspaces, and window operations
 */

import type { Window } from "$lib/types";

let windows = $state<Window[]>([]);
let highestZIndex = $state(1000);
let currentWorkspace = $state(1);

let draggingWindow: Window | null = null;
let dragOffset = { x: 0, y: 0 };

let resizingWindow: Window | null = null;
let resizeHandle = "";
let resizeStart = { x: 0, y: 0, width: 0, height: 0, windowX: 0, windowY: 0 };

const visibleWindows = $derived(
 windows.filter((w) => w.workspace === currentWorkspace && !w.minimized)
);

function isMobile(): boolean {
 return globalThis.innerWidth <= 768;
}

/**
 * Open a window (or bring to front if already open)
 */
export function openWindow(appId: string, title: string, icon: string) {
 const existingWindow = windows.find((w) => w.id === appId);
 if (existingWindow) {
  existingWindow.minimized = false;
  existingWindow.workspace = currentWorkspace;
  existingWindow.zIndex = ++highestZIndex;
  windows = [...windows];
  return;
 }

 const mobile = isMobile();
 const gap = 16;
 const baseX = mobile ? 0 : 100 + gap;
 const baseY = mobile ? 0 : 20 + gap;

 const defaultWidth = mobile ? globalThis.innerWidth : 640;
 const defaultHeight = mobile ? globalThis.innerHeight - 70 : 520;

 const newWindow: Window = {
  id: appId,
  title,
  icon,
  minimized: false,
  maximized: mobile,
  x: mobile ? 0 : baseX + windows.length * 40,
  y: mobile ? 0 : baseY + windows.length * 40,
  width: mobile
   ? globalThis.innerWidth
   : appId === "profile" || appId === "servers" || appId === "apps"
   ? 520
   : appId === "games"
   ? 700
   : defaultWidth,
  height: mobile
   ? globalThis.innerHeight - 70
   : appId === "profile" || appId === "servers" || appId === "apps"
   ? 600
   : appId === "games"
   ? 650
   : defaultHeight,
  zIndex: ++highestZIndex,
  workspace: currentWorkspace,
 };

 windows = [...windows, newWindow];
}

/**
 * Close a window
 */
export function closeWindow(appId: string) {
 windows = windows.filter((w) => w.id !== appId);
}

/**
 * Minimize a window
 */
export function minimizeWindow(appId: string) {
 const window = windows.find((w) => w.id === appId);
 if (window) {
  window.minimized = true;
  windows = [...windows];
 }
}

/**
 * Maximize or restore a window
 */
export function maximizeWindow(appId: string) {
 const window = windows.find((w) => w.id === appId);
 if (!window) return;

 const mobile = isMobile();

 if (window.maximized) {
  window.x = window.prevX || window.x;
  window.y = window.prevY || window.y;
  window.width = window.prevWidth || window.width;
  window.height = window.prevHeight || window.height;
  window.maximized = false;
 } else {
  window.prevX = window.x;
  window.prevY = window.y;
  window.prevWidth = window.width;
  window.prevHeight = window.height;

  if (mobile) {
   window.x = 0;
   window.y = 0;
   window.width = globalThis.innerWidth;
   window.height = globalThis.innerHeight - 70;
  } else {
   window.x = 96;
   window.y = 16;
   window.width = globalThis.innerWidth - 112;
   window.height = globalThis.innerHeight - 32;
  }
  window.maximized = true;
 }
 windows = [...windows];
}

/**
 * Bring window to front
 */
export function bringToFront(window: Window) {
 if (window.zIndex !== highestZIndex) {
  window.zIndex = ++highestZIndex;
  windows = [...windows];
 }
}

/**
 * Start dragging a window
 */
export function startDrag(event: MouseEvent, window: Window) {
 if (window.maximized) return;
 draggingWindow = window;
 dragOffset = {
  x: event.clientX - window.x,
  y: event.clientY - window.y,
 };
 bringToFront(window);
}

/**
 * Start resizing a window
 */
export function startResize(event: MouseEvent, window: Window, handle: string) {
 event.stopPropagation();
 resizingWindow = window;
 resizeHandle = handle;
 resizeStart = {
  x: event.clientX,
  y: event.clientY,
  width: window.width,
  height: window.height,
  windowX: window.x,
  windowY: window.y,
 };
 bringToFront(window);
}

/**
 * Handle mouse move for drag and resize
 */
export function handleMouseMove(event: MouseEvent) {
 if (draggingWindow) {
  draggingWindow.x = event.clientX - dragOffset.x;
  draggingWindow.y = event.clientY - dragOffset.y;
  windows = [...windows];
 } else if (resizingWindow && resizeHandle) {
  const deltaX = event.clientX - resizeStart.x;
  const deltaY = event.clientY - resizeStart.y;

  const minWidth = 320;
  const minHeight = 240;

  if (resizeHandle.includes("e")) {
   resizingWindow.width = Math.max(minWidth, resizeStart.width + deltaX);
  }
  if (resizeHandle.includes("w")) {
   const newWidth = Math.max(minWidth, resizeStart.width - deltaX);
   if (newWidth > minWidth) {
    resizingWindow.x = resizeStart.windowX + deltaX;
    resizingWindow.width = newWidth;
   }
  }
  if (resizeHandle.includes("s")) {
   resizingWindow.height = Math.max(minHeight, resizeStart.height + deltaY);
  }
  if (resizeHandle.includes("n")) {
   const newHeight = Math.max(minHeight, resizeStart.height - deltaY);
   if (newHeight > minHeight) {
    resizingWindow.y = resizeStart.windowY + deltaY;
    resizingWindow.height = newHeight;
   }
  }

  windows = [...windows];
 }
}

/**
 * Handle mouse up - end drag/resize
 */
export function handleMouseUp() {
 draggingWindow = null;
 resizingWindow = null;
 resizeHandle = "";
}

/**
 * Switch workspace
 */
export function switchWorkspace(workspace: number) {
 currentWorkspace = workspace;
}

/**
 * Get window by ID
 */
export function getWindow(id: string): Window | undefined {
 return windows.find((w) => w.id === id);
}

export const windowState = {
 get windows() {
  return windows;
 },
 get visibleWindows() {
  return visibleWindows;
 },
 get currentWorkspace() {
  return currentWorkspace;
 },
 get highestZIndex() {
  return highestZIndex;
 },
};
