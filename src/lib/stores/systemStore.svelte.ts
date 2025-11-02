/**
 * System Store
 * Manages system stats, time, and hardware information
 */

import { detectHardware } from "$lib/utils/hardware-detector";

let cpuUsage = $state(23);
let ramUsage = $state(45);
let uptime = $state("2h 34m");
let currentTime = $state(new Date());

const hardware = detectHardware();
let hwCPU = $state(hardware.cpu);
let hwCores = $state(hardware.cores);
let hwRAM = $state(hardware.ram);
let hwGPU = $state(hardware.gpu);
let hwResolution = $state(hardware.resolution);

const formattedTime = $derived(() => {
 const hours = currentTime.getHours().toString().padStart(2, "0");
 const minutes = currentTime.getMinutes().toString().padStart(2, "0");
 return `${hours}:${minutes}`;
});

const formattedDate = $derived(() => {
 return currentTime.toLocaleDateString("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
 });
});

/**
 * Initialize system stats timer
 * Call this once when the app starts
 */
export function initSystemStats() {
 const timer = setInterval(() => {
  currentTime = new Date();

  cpuUsage = Math.floor(Math.random() * 30) + 20;
  ramUsage = Math.floor(Math.random() * 20) + 40;
 }, 1000);

 return () => clearInterval(timer);
}

export const systemState = {
 get cpuUsage() {
  return cpuUsage;
 },
 get ramUsage() {
  return ramUsage;
 },
 get uptime() {
  return uptime;
 },
 get currentTime() {
  return currentTime;
 },
 get formattedTime() {
  return formattedTime();
 },
 get formattedDate() {
  return formattedDate();
 },
 get hardware() {
  return {
   cpu: hwCPU,
   cores: hwCores,
   ram: hwRAM,
   gpu: hwGPU,
   resolution: hwResolution,
  };
 },
};
