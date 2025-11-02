import type { HardwareInfo } from "$lib/types";

interface ExtendedNavigator extends Navigator {
 deviceMemory?: number;
 userAgentData?: {
  platform?: string;
  brands?: Array<{ brand: string; version: string }>;
 };
}

/**
 * Detects hardware information from the browser environment
 * @returns HardwareInfo object with detected system specs
 */
export function detectHardware(): HardwareInfo {
 if (typeof window === "undefined" || typeof navigator === "undefined") {
  return {
   cpu: "Unknown CPU",
   cores: 4,
   ram: 8,
   gpu: "Unknown GPU",
   platform: "Unknown",
   resolution: "1920x1080",
  };
 }

 const platform =
  (navigator as ExtendedNavigator).userAgentData?.platform ||
  navigator.platform ||
  "Unknown";

 const cores = navigator.hardwareConcurrency || 4;

 const ram = (navigator as ExtendedNavigator).deviceMemory || 8;

 const resolution = `${window.screen.width}x${window.screen.height}`;

 let cpu: string;
 const userAgent = navigator.userAgent;
 if (userAgent.includes("Intel")) {
  cpu = "Intel Core Processor";
 } else if (userAgent.includes("AMD")) {
  cpu = "AMD Ryzen Processor";
 } else if (userAgent.includes("ARM")) {
  cpu = "ARM Processor";
 } else if (userAgent.includes("Mac")) {
  cpu = "Apple Silicon";
 } else {
  cpu = "Generic x86_64 Processor";
 }

 let gpu = "Unknown GPU";
 try {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl") as WebGLRenderingContext | null;
  if (gl) {
   const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
   if (debugInfo) {
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    gpu = (renderer as string) || "WebGL Compatible GPU";
   } else {
    gpu = "WebGL Compatible GPU";
   }
  }
 } catch (e) {
  gpu = "WebGL Compatible GPU";
 }

 return {
  cpu,
  cores,
  ram,
  gpu,
  platform,
  resolution,
 };
}
