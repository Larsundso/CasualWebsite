/**
 * Boot Sequence Store
 * Manages boot and shutdown state
 */

import type { BootStage } from "$lib/types";
import type { HardwareInfo } from "$lib/types";

let bootStage = $state<BootStage>("booting");
let bootProgress = $state(0);
let shutdownMessages = $state<string[]>([]);
let shutdownProgress = $state(100);

/**
 * Complete the boot sequence
 */
export function completeBoot() {
 bootStage = "ready";
 bootProgress = 100;
}

/**
 * Generate comprehensive shutdown sequence based on hardware
 */
function generateShutdownSequence(hardware?: HardwareInfo): string[] {
 const hw = hardware || {
  cpu: "Unknown CPU",
  cores: 4,
  ram: 8,
  gpu: "Unknown GPU",
  platform: "Unknown",
  resolution: "1920x1080",
 };

 return [
  "[ ⚠ ] SHUTDOWN SIGNAL RECEIVED",
  "[ ⚠ ] INITIATING GRACEFUL SHUTDOWN SEQUENCE...",
  "",
  "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ 100% STOPPING USER SERVICES",
  "",
  "[  0.001234] systemd[1]: Stopping user services...",
  "[  0.012345] systemd[1]: Stopped target Graphical Interface",
  "[  0.023456] systemd[1]: Stopping session manager...",
  "[  0.034567] WINDOWLAND: Compositor shutdown initiated",
  `[  0.045678] WINDOWLAND: Closing ${hw.cores} rendering threads`,
  "[  0.056789] WINDOWLAND: Destroying workspace manager",
  "[  0.067890] WAYLAND: Terminating display server",
  "",
  "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰░░ 90% STOPPING MULTIMEDIA",
  "",
  "[  0.123456] AUDIO: PipeWire multimedia server stopping",
  "[  0.134567] AUDIO: Releasing audio devices",
  "[  0.145678] AUDIO: Closing ALSA interfaces",
  "",
  "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰░░░ 85% STOPPING NETWORK",
  "",
  "[  0.234567] NETWORK: NetworkManager daemon stopping",
  "[  0.245678] NETWORK: Closing active connections",
  "[  0.256789] NETWORK: Releasing network interfaces",
  "",
  "▰▰▰▰▰▰▰▰▰▰▰▰▰▰░░░░ 75% UNMOUNTING FILESYSTEMS",
  "",
  "[  0.334567] FS: Syncing filesystem buffers",
  "[  0.345678] FS: Flushing disk caches",
  "[  0.356789] FS: Unmounting /home",
  "[  0.367890] FS: Unmounting /var",
  "[  0.378901] FS: Unmounting /tmp",
  "[  0.389012] FS: All filesystems unmounted safely",
  "",
  "▰▰▰▰▰▰▰▰▰▰▰▰░░░░░░ 65% STOPPING GRAPHICS",
  "",
  `[  0.456789] DRM: Releasing GPU - ${hw.gpu}`,
  "[  0.467890] VULKAN: Destroying instance v1.3.269",
  "[  0.478901] MESA: Unloading OpenGL 4.6",
  "[  0.489012] DRM: GPU driver unloaded",
  "",
  "▰▰▰▰▰▰▰▰▰▰░░░░░░░░ 55% RELEASING DRIVERS",
  "",
  "[  0.567890] xhci_hcd: Releasing USB controllers",
  "[  0.578901] ahci: Stopping SATA controllers",
  "[  0.589012] NVME: Flushing storage buffers",
  "[  0.600123] NVME: Storage device released",
  "",
  "▰▰▰▰▰▰▰▰░░░░░░░░░░ 45% STOPPING SYSTEM SERVICES",
  "",
  "[  0.678901] systemd[1]: Reached target Shutdown",
  "[  0.689012] systemd[1]: Stopping remaining services...",
  "[  0.700123] systemd[1]: Killing user processes",
  "[  0.711234] systemd[1]: All processes terminated",
  "",
  "▰▰▰▰▰▰░░░░░░░░░░░░ 35% PREPARING HARDWARE",
  "",
  "[  0.789012] ACPI: Preparing for power state S5",
  "[  0.800123] ACPI: Disabling wake-on-events",
  `[  0.811234] ACPI: Releasing ${hw.cores} CPU cores`,
  "",
  "▰▰▰▰░░░░░░░░░░░░░░ 25% POWERING DOWN RAM",
  "",
  `[  0.889012] Memory: Clearing ${hw.ram}GB RAM`,
  "[  0.900123] Memory: Entering self-refresh mode",
  "[  0.911234] Memory: All memory cleared",
  "",
  "▰▰░░░░░░░░░░░░░░░░ 15% POWERING DOWN CPU",
  "",
  `[  0.956789] CPU: Stopping ${hw.cpu}`,
  `[  0.967890] CPU: Halting ${hw.cores} cores`,
  "[  0.978901] CPU: All cores stopped",
  "",
  "▰░░░░░░░░░░░░░░░░░ 5% FINAL SHUTDOWN",
  "",
  "[  1.001234] BIOS: Transferring control",
  "[  1.012345] ACPI: Entering power state S5",
  "[  1.023456] System: Powering off...",
  "",
  "[ ✓ ] SHUTDOWN COMPLETE",
  `[ ✓ ] HARDWARE: ${hw.platform} | ${hw.cores}C | ${hw.ram}GB`,
  "[ ✓ ] ALL SYSTEMS HALTED",
  "[ ✓ ] POWER OFF SEQUENCE INITIATED...",
 ];
}

/**
 * Start shutdown sequence with hardware info
 */
export function startShutdown(hardware?: HardwareInfo) {
 bootStage = "shutting-down";
 shutdownProgress = 100;
 shutdownMessages = generateShutdownSequence(hardware);
}

/**
 * Update shutdown progress
 */
export function updateShutdownProgress(progress: number) {
 shutdownProgress = progress;
}

/**
 * Update boot progress
 */
export function updateBootProgress(progress: number) {
 bootProgress = progress;
}

/**
 * Check if system is ready
 */
export function isSystemReady(): boolean {
 return bootStage === "ready";
}

export const bootState = {
 get stage() {
  return bootStage;
 },
 get progress() {
  return bootProgress;
 },
 get shutdownMessages() {
  return shutdownMessages;
 },
 get shutdownProgress() {
  return shutdownProgress;
 },
 get isBooting() {
  return bootStage === "booting";
 },
 get isReady() {
  return bootStage === "ready";
 },
 get isShuttingDown() {
  return bootStage === "shutting-down";
 },
};
