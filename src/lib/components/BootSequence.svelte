<svelte:options runes={true} />

<script lang="ts">
 import { onMount } from "svelte";
 import { detectHardware } from "$lib/utils/hardware-detector";
 import { bootState as importedBootState } from "$lib/stores/bootStore.svelte";
 import type { BootStage, HardwareInfo } from "$lib/types";

 interface Props {
  onBootComplete?: () => void;
 }

 let { onBootComplete }: Props = $props();

 let bootStage = $state<BootStage>("booting");
 let bootMessages = $state<string[]>([]);
 let bootProgress = $state(0);

 let shutdownMessages = $state<string[]>([]);
 let shutdownProgress = $state(100);

 let hardware = $state<HardwareInfo>({
  cpu: "Unknown CPU",
  cores: 4,
  ram: 8,
  gpu: "Unknown GPU",
  platform: "Unknown",
  resolution: "1920x1080",
 });

 let terminalOutputElement = $state<HTMLDivElement | null>(null);

 const bootStateFromStore = $derived(importedBootState.stage);
 const shutdownMessagesFromStore = $derived(importedBootState.shutdownMessages);
 const shutdownProgressFromStore = $derived(importedBootState.shutdownProgress);

 function getBootSequence(): string[] {
  return [
   "ARCH//LINUX KERNEL v6.6.10 INITIALIZING...",
   "BIOS: 0x0000F000 - 0x0000FFFF | UEFI v2.70",
   `CPU: ${hardware.cpu} | Cores: ${hardware.cores} Threads`,
   `Memory: 0x00000000 - 0x${(hardware.ram * 1024).toString(16).toUpperCase().padStart(8, "0")} | Total: ${hardware.ram * 1024} MB DDR4`,
   `Platform: ${hardware.platform} | Display: ${hardware.resolution}`,
   "",
   "[  0.000000] Initializing cgroup subsys cpuset",
   "[  0.000000] Initializing cgroup subsys cpu",
   "[  0.000000] Linux version 6.6.10-arch1-1 (linux@archlinux)",
   "[  0.001234] Command line: BOOT_IMAGE=/vmlinuz-linux root=UUID=a3f2-4bd9",
   "[  0.002456] KERNEL supported cpus: AMD64 Intel64",
   "[  0.003891] x86/fpu: Supporting XSAVE feature 0x001: FP",
   "[  0.004123] x86/fpu: Supporting XSAVE feature 0x002: SSE",
   "[  0.004567] x86/fpu: Supporting XSAVE feature 0x004: YMM",
   "[  0.005012] x86/fpu: Supporting XSAVE feature 0x008: BNDREGS",
   "[  0.005678] BIOS-provided physical RAM map:",
   "[  0.006234] BIOS-e820: [mem 0x0000000000000000-0x000000000009ffff] usable",
   `[  0.006789] BIOS-e820: [mem 0x0000000000100000-0x${(hardware.ram * 1024 * 1024 * 1024).toString(16)}] usable`,
   "[  0.007345] NX (Execute Disable) protection: active",
   "[  0.007891] SMBIOS 3.3.0 present",
   "[  0.008456] DMI: System manufacturer / System product name",
   "[  0.009123] Hypervisor detected: KVM",
   "[  0.009789] tsc: Fast TSC calibration using PIT",
   "[  0.010456] tsc: Detected 2400.000 MHz processor",
   "",
   "▰▰▰▰▰░░░░░░░░░░░░░░ 25% INITIALIZING HARDWARE",
   "",
   "[  0.123456] PCIe: Scanning bus 0000:00",
   "[  0.134567] ACPI: Core revision 20230628",
   `[  0.156789] ACPI: Interpreter enabled with ${hardware.cores} CPUs`,
   "[  0.167890] ACPI: PM: (supports S0 S3 S4 S5)",
   "",
   "▰▰▰▰▰▰▰▰▰░░░░░░░░░░ 45% LOADING SYSTEM MODULES",
   "",
   "[  0.334567] PCI: Using configuration type 1 for base access",
   "[  0.389012] usbcore: registered new interface driver usbfs",
   "[  0.567890] NVME: Detected storage device | /dev/nvme0n1",
   `[  0.578901] GPU: ${hardware.gpu}`,
   "[  0.589012] DRM: Detected display driver",
   "",
   "▰▰▰▰▰▰▰▰▰▰▰▰▰░░░░░░ 65% INITIALIZING DRIVERS",
   "",
   "[  0.701234] ahci 0000:00:17.0: AHCI 0001.0301 32 slots 6 ports",
   "[  0.756789] xhci_hcd 0000:00:14.0: xHCI Host Controller",
   "",
   "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰░░░░ 75% LOADING GRAPHICS",
   "",
   "[  1.123456] WINDOWLAND: Compositor initialization started",
   `[  1.134567] WINDOWLAND: Detected ${hardware.cores} CPU cores for rendering`,
   "[  1.145678] WAYLAND: Display server protocol v1.22 loaded",
   `[  1.178901] DRM: Detected GPU - ${hardware.gpu}`,
   "[  1.201234] MESA: OpenGL 4.6 (Core Profile) loaded",
   "[  1.223456] VULKAN: Instance v1.3.269 initialized",
   `[  1.234567] VULKAN: Physical device: ${hardware.gpu}`,
   "",
   "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰░░ 85% LOADING DESKTOP ENVIRONMENT",
   "",
   "[  1.501234] WINDOWLAND: Configuration file loaded",
   "[  1.512345] WINDOWLAND: Workspace manager initialized | Workspaces: 1-10",
   `[  1.534567] WINDOWLAND: Animations engine started | Display: ${hardware.resolution}`,
   "[  1.601234] AUDIO: PipeWire v1.0.0 multimedia server started",
   "[  1.634567] NETWORK: NetworkManager v1.44.2 daemon started",
   "",
   "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ 95% FINALIZING SYSTEM",
   "",
   "[  1.801234] systemd[1]: Reached target Multi-User System",
   "[  1.812345] systemd[1]: Reached target Graphical Interface",
   "",
   "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ 100% SYSTEM READY",
   "",
   "[ ✓ ] BOOT SEQUENCE COMPLETE | TIME: 1.891s",
   `[ ✓ ] SYSTEM: ${hardware.platform} | CPU: ${hardware.cores}C | RAM: ${hardware.ram}GB`,
   "[ ✓ ] ALL SERVICES OPERATIONAL",
   "[ ✓ ] LAUNCHING GRAPHICAL INTERFACE...",
  ];
 }

 onMount(() => {
  hardware = detectHardware();

  const bootSequence = getBootSequence();

  let messageIndex = 0;

  function addNextMessage() {
   if (messageIndex < bootSequence.length) {
    bootMessages = [...bootMessages, bootSequence[messageIndex]];
    bootProgress = Math.floor((messageIndex / bootSequence.length) * 100);
    messageIndex++;

    requestAnimationFrame(() => {
     if (terminalOutputElement) {
      terminalOutputElement.scrollTop = terminalOutputElement.scrollHeight;
     }
    });

    setTimeout(addNextMessage, 50);
   } else {
    bootProgress = 100;
    setTimeout(() => {
     bootStage = "ready";
     if (onBootComplete) {
      onBootComplete();
     }
    }, 1000);
   }
  }

  addNextMessage();
 });

 $effect(() => {
  bootStage = bootStateFromStore;

  if (bootStage === "shutting-down" && shutdownMessagesFromStore.length > 0) {
   let messageIndex = 0;
   shutdownMessages = [];

   function addNextShutdownMessage() {
    if (messageIndex < shutdownMessagesFromStore.length) {
     shutdownMessages = [
      ...shutdownMessages,
      shutdownMessagesFromStore[messageIndex],
     ];

     shutdownProgress = Math.max(
      0,
      100 - Math.floor((messageIndex / shutdownMessagesFromStore.length) * 100)
     );
     messageIndex++;

     requestAnimationFrame(() => {
      if (terminalOutputElement) {
       terminalOutputElement.scrollTop = terminalOutputElement.scrollHeight;
      }
     });

     setTimeout(addNextShutdownMessage, 40);
    } else {
     shutdownProgress = 0;

     setTimeout(() => {
      window.close();

      setTimeout(() => {
       document.body.innerHTML =
        '<div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #000; color: #666; font-family: monospace; font-size: 14px;">System powered off. Safe to close this window.</div>';
      }, 500);
     }, 1500);
    }
   }

   setTimeout(addNextShutdownMessage, 100);
  }
 });
</script>

{#if bootStage !== "ready"}
 <div class="boot-screen" class:shutdown={bootStage === "shutting-down"}>
  <!-- Hexagonal Grid Background -->
  <div class="hex-grid"></div>

  <!-- Scanlines Effect -->
  <div class="scanlines" class:intense={bootStage === "shutting-down"}></div>

  <!-- CRT Vignette -->
  <div class="crt-vignette" class:closing={bootStage === "shutting-down"}></div>

  <!-- Static Noise (shutdown only) -->
  {#if bootStage === "shutting-down"}
   <div class="static-noise"></div>
  {/if}

  <!-- Glitch Overlay (shutdown only) -->
  {#if bootStage === "shutting-down" && shutdownProgress < 50}
   <div class="glitch-overlay"></div>
  {/if}

  <div class="boot-container">
   <!-- Top System Info Bar -->
   <div class="system-bar">
    <div class="system-info">
     <span class="sys-label">KERNEL</span>
     <span class="sys-value">6.6.10-arch1-1</span>
    </div>
    <div class="system-info">
     <span class="sys-label">ARCH</span>
     <span class="sys-value">x86_64</span>
    </div>
    <div class="system-info">
     <span class="sys-label">MEM</span>
     <span class="sys-value">{hardware.ram}GB</span>
    </div>
    <div class="system-info">
     <span class="sys-label">CPU</span>
     <span class="sys-value">{hardware.cores}C</span>
    </div>
   </div>

   <!-- Main Content -->
   <div class="boot-main">
    <!-- Left Panel - Logo and Status -->
    <div class="boot-left">
     <div class="arch-logo-cyber">
      <svg viewBox="0 0 65 65" width="120" height="120">
       <defs>
        <filter id="glow">
         <feGaussianBlur stdDeviation="4" result="coloredBlur" />
         <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
         </feMerge>
        </filter>
       </defs>
       <path
        fill="currentColor"
        filter="url(#glow)"
        d="M32.253.432S16.777 29.735 11.2 41.187c-5.577 11.451.647 15.975 6.096 17.65 5.448 1.675 9.338-3.093 12.957-10.259 3.619-7.165 2.063-10.63 2.063-10.63s-2.028 6.271-6.958 8.863c-4.93 2.592-7.148.109-5.144-4.93 2.005-5.039 12.37-25.316 12.37-25.316l11.91 24.424s-2.428-1.453-3.983-.326c-1.556 1.126-1.772 2.79-.866 4.563.906 1.772 3.136 2.807 5.581 2.807 2.446 0 4.676-2.159 4.676-5.074 0-2.915-3.353-11.558-3.353-11.558s1.556 2.373 3.245 2.59c1.69.217 2.698-1.237 2.698-3.136 0-1.9-2.59-6.054-2.59-6.054s1.556 1.556 2.914 1.664c1.359.109 2.155-.975 2.155-2.264 0-1.29-1.881-4.127-1.881-4.127s1.125.758 1.99.65c.866-.107 1.448-.758 1.448-1.663 0-.906-1.125-2.482-1.125-2.482s.758.217 1.125.108c.368-.108.65-.325.65-.758 0-.434-.65-1.99-.65-1.99L32.253.432z"
       />
      </svg>
     </div>
     <div class="boot-title-cyber">
      <div class="title-main">ARCH//LINUX</div>
      <div class="title-sub">WINDOWLAND COMPOSITOR</div>
     </div>
     <div class="boot-status">
      <div class="status-text">
       {bootStage === "booting" ? "> INITIALIZING SYSTEM" : "> POWERING DOWN"}
      </div>
      <div class="status-progress">
       <div class="progress-bar">
        <div
         class="progress-fill"
         style="width: {bootStage === 'booting'
          ? bootProgress
          : shutdownProgress}%"
        ></div>
        <div
         class="progress-glow"
         style="width: {bootStage === 'booting'
          ? bootProgress
          : shutdownProgress}%"
        ></div>
       </div>
       <div class="progress-text">
        {bootStage === "booting" ? bootProgress : shutdownProgress}%
       </div>
      </div>
     </div>
    </div>

    <!-- Right Panel - Terminal Output -->
    <div class="boot-right">
     <div class="terminal-header">
      <span class="terminal-prompt">[root@archlinux ~]#</span>
      <span class="terminal-cursor">_</span>
     </div>
     <div class="terminal-output" bind:this={terminalOutputElement}>
      {#if bootStage === "booting"}
       {#each bootMessages as message, i (i)}
        {@const isProgress = message.includes("▰")}
        {@const isHeader =
         message.includes("ARCH//") ||
         message.includes("BIOS:") ||
         message.includes("CPU:") ||
         message.includes("Memory:")}
        {@const isSuccess = message.includes("✓")}
        {@const isWarning = message.includes("⚠")}
        <div
         class="terminal-line"
         class:progress-line={isProgress}
         class:header-line={isHeader}
         class:success-line={isSuccess}
         class:warning-line={isWarning}
        >
         {message}
        </div>
       {/each}
      {:else}
       {#each shutdownMessages as message, i (i)}
        {@const isProgress = message.includes("▰")}
        {@const isHeader =
         message.includes("ARCH//") ||
         message.includes("BIOS:") ||
         message.includes("CPU:") ||
         message.includes("Memory:")}
        {@const isSuccess = message.includes("✓")}
        {@const isWarning = message.includes("⚠")}
        <div
         class="terminal-line"
         class:progress-line={isProgress}
         class:header-line={isHeader}
         class:success-line={isSuccess}
         class:warning-line={isWarning}
        >
         {message}
        </div>
       {/each}
      {/if}
     </div>
    </div>
   </div>

   <!-- Bottom Stats Bar -->
   <div class="stats-bar">
    <div class="stat-item">
     <span class="stat-icon">▰▰▰▰▰</span>
     <span class="stat-text"
      >DISK I/O: {bootProgress > 50 ? "HIGH" : "NORMAL"}</span
     >
    </div>
    <div class="stat-item">
     <span class="stat-icon">◆◆◆◆◆</span>
     <span class="stat-text">NET: {bootProgress > 70 ? "ACTIVE" : "IDLE"}</span>
    </div>
    <div class="stat-item">
     <span class="stat-icon">◈◈◈◈◈</span>
     <span class="stat-text">GPU: {bootProgress > 80 ? "LOADED" : "INIT"}</span>
    </div>
   </div>
  </div>
 </div>
{/if}

<style>
 .boot-screen {
  position: fixed;
  inset: 0;
  background: #000000;
  color: #00ff41;
  font-family: "JetBrains Mono", "Courier New", monospace;
  z-index: 9999;
  overflow: hidden;
 }

 .hex-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
    30deg,
    transparent 24%,
    rgba(0, 255, 255, 0.03) 25%,
    rgba(0, 255, 255, 0.03) 26%,
    transparent 27%,
    transparent 74%,
    rgba(0, 255, 255, 0.03) 75%,
    rgba(0, 255, 255, 0.03) 76%,
    transparent 77%,
    transparent
   ),
   linear-gradient(
    90deg,
    transparent 24%,
    rgba(0, 255, 255, 0.03) 25%,
    rgba(0, 255, 255, 0.03) 26%,
    transparent 27%,
    transparent 74%,
    rgba(0, 255, 255, 0.03) 75%,
    rgba(0, 255, 255, 0.03) 76%,
    transparent 77%,
    transparent
   );
  background-size: 50px 87px;
  animation: hexScroll 20s linear infinite;
 }

 @keyframes hexScroll {
  0% {
   background-position: 0 0;
  }
  100% {
   background-position: 50px 87px;
  }
 }

 .scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
   0deg,
   rgba(0, 255, 255, 0.03) 0px,
   transparent 1px,
   transparent 2px,
   rgba(0, 255, 255, 0.03) 3px
  );
  pointer-events: none;
  animation: scanlineMove 8s linear infinite;
 }

 @keyframes scanlineMove {
  0% {
   transform: translateY(0);
  }
  100% {
   transform: translateY(10px);
  }
 }

 .crt-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, transparent 60%, rgba(0, 0, 0, 0.6) 100%);
  pointer-events: none;
 }

 .boot-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
  animation: containerFadeIn 0.8s ease-out 0.3s backwards;
 }

 @keyframes containerFadeIn {
  from {
   opacity: 0;
   filter: blur(10px);
  }
  to {
   opacity: 1;
   filter: blur(0);
  }
 }

 .system-bar {
  display: flex;
  gap: 40px;
  padding: 15px 20px;
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  margin-bottom: 20px;
  animation: barSlideIn 0.6s ease-out 0.5s backwards;
 }

 @keyframes barSlideIn {
  from {
   opacity: 0;
   transform: translateY(-20px);
  }
  to {
   opacity: 1;
   transform: translateY(0);
  }
 }

 .system-info {
  display: flex;
  gap: 12px;
  align-items: center;
 }

 .sys-label {
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  font-weight: 700;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
  letter-spacing: 2px;
 }

 .sys-value {
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  color: #00ff41;
  text-shadow: 0 0 8px rgba(0, 255, 65, 0.6);
 }

 .boot-main {
  flex: 1;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 20px;
  overflow: hidden;
 }

 .boot-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  padding: 40px;
  background: rgba(0, 255, 255, 0.03);
  border: 2px solid rgba(0, 255, 255, 0.2);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  animation: panelSlideIn 0.8s ease-out 0.6s backwards;
 }

 @keyframes panelSlideIn {
  from {
   opacity: 0;
   transform: translateX(-50px);
  }
  to {
   opacity: 1;
   transform: translateX(0);
  }
 }

 .boot-left::before {
  content: "";
  position: absolute;
  inset: -50%;
  background: linear-gradient(
   90deg,
   transparent,
   rgba(0, 255, 255, 0.1),
   transparent
  );
  animation: shimmer 3s linear infinite;
 }

 @keyframes shimmer {
  0% {
   transform: translateX(-100%);
  }
  100% {
   transform: translateX(100%);
  }
 }

 .arch-logo-cyber {
  color: #00ffff;
  filter: drop-shadow(0 0 20px rgba(0, 255, 255, 1))
   drop-shadow(0 0 40px rgba(0, 255, 255, 0.6));
  animation:
   logoFloat 4s ease-in-out infinite,
   logoPulse 2s ease-in-out infinite;
  position: relative;
  z-index: 1;
 }

 @keyframes logoFloat {
  0%,
  100% {
   transform: translateY(0px);
  }
  50% {
   transform: translateY(-10px);
  }
 }

 @keyframes logoPulse {
  0%,
  100% {
   filter: drop-shadow(0 0 20px rgba(0, 255, 255, 1))
    drop-shadow(0 0 40px rgba(0, 255, 255, 0.6));
  }
  50% {
   filter: drop-shadow(0 0 30px rgba(0, 255, 255, 1))
    drop-shadow(0 0 60px rgba(0, 255, 255, 0.8));
  }
 }

 .boot-title-cyber {
  text-align: center;
  position: relative;
  z-index: 1;
 }

 .title-main {
  font-family: "JetBrains Mono", monospace;
  font-size: 36px;
  font-weight: 900;
  color: #00ffff;
  text-shadow:
   0 0 10px rgba(0, 255, 255, 1),
   0 0 20px rgba(0, 255, 255, 0.8),
   0 0 30px rgba(0, 255, 255, 0.6),
   0 0 40px rgba(0, 255, 255, 0.4);
  letter-spacing: 4px;
  margin-bottom: 8px;
  animation: titleGlitch 5s linear infinite;
 }

 @keyframes titleGlitch {
  0%,
  90%,
  100% {
   transform: translate(0);
  }
  91% {
   transform: translate(-2px, 2px);
  }
  92% {
   transform: translate(2px, -2px);
  }
  93% {
   transform: translate(0);
  }
 }

 .title-sub {
  font-family: "JetBrains Mono", monospace;
  font-size: 14px;
  font-weight: 600;
  color: #00ff41;
  text-shadow: 0 0 10px rgba(0, 255, 65, 0.8);
  letter-spacing: 3px;
  opacity: 0.8;
 }

 .boot-status {
  width: 100%;
  position: relative;
  z-index: 1;
 }

 .status-text {
  font-family: "JetBrains Mono", monospace;
  font-size: 14px;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
  margin-bottom: 15px;
  letter-spacing: 2px;
 }

 .status-progress {
  display: flex;
  align-items: center;
  gap: 15px;
 }

 .progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.4);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
 }

 .progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #00ff41);
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
 }

 .progress-glow {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4));
  transition: width 0.3s ease;
  animation: progressShine 1.5s linear infinite;
 }

 @keyframes progressShine {
  0% {
   transform: translateX(-100%);
  }
  100% {
   transform: translateX(400%);
  }
 }

 .progress-text {
  font-family: "JetBrains Mono", monospace;
  font-size: 16px;
  font-weight: 700;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 1);
  min-width: 50px;
  text-align: right;
 }

 .boot-right {
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(0, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  animation: panelSlideIn 0.8s ease-out 0.7s backwards;
 }

 .terminal-header {
  padding: 12px 20px;
  background: rgba(0, 255, 255, 0.1);
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
 }

 .terminal-prompt {
  font-family: "JetBrains Mono", monospace;
  font-size: 13px;
  color: #00ff41;
  text-shadow: 0 0 8px rgba(0, 255, 65, 0.8);
 }

 .terminal-cursor {
  font-family: "JetBrains Mono", monospace;
  color: #00ffff;
  animation: cursorBlink 1s step-end infinite;
 }

 @keyframes cursorBlink {
  0%,
  50% {
   opacity: 1;
  }
  51%,
  100% {
   opacity: 0;
  }
 }

 .terminal-output {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  /* Instant scroll (not smooth) so scroll keeps up with rapid message additions */
 }

 .terminal-output::-webkit-scrollbar {
  width: 8px;
 }

 .terminal-output::-webkit-scrollbar-track {
  background: rgba(0, 255, 255, 0.05);
 }

 .terminal-output::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 4px;
 }

 .terminal-output::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
 }

 .terminal-line {
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #00ff41;
  text-shadow: 0 0 5px rgba(0, 255, 65, 0.5);
  opacity: 0;
  animation: lineAppear 0.2s ease-out forwards;
  white-space: pre;
 }

 @keyframes lineAppear {
  from {
   opacity: 0;
   transform: translateX(-10px);
  }
  to {
   opacity: 1;
   transform: translateX(0);
  }
 }

 .terminal-line.header-line {
  color: #00ffff;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.8);
  font-weight: 700;
  margin-top: 8px;
 }

 .terminal-line.progress-line {
  color: #ffaa00;
  text-shadow: 0 0 10px rgba(255, 170, 0, 0.8);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1px;
  margin: 8px 0;
 }

 .terminal-line.success-line {
  color: #00ff41;
  text-shadow: 0 0 10px rgba(0, 255, 65, 1);
  font-weight: 700;
 }

 .terminal-line.warning-line {
  color: #ff0066;
  text-shadow: 0 0 10px rgba(255, 0, 102, 1);
  font-weight: 700;
 }

 .stats-bar {
  display: flex;
  justify-content: space-around;
  padding: 15px 20px;
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  margin-top: 20px;
  animation: barSlideIn 0.6s ease-out 0.9s backwards;
 }

 .stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
 }

 .stat-icon {
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  color: #00ffff;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.8);
  letter-spacing: 2px;
 }

 .stat-text {
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  font-weight: 600;
  color: #00ff41;
  text-shadow: 0 0 6px rgba(0, 255, 65, 0.6);
  letter-spacing: 1px;
 }

 /* ====================================
	   SHUTDOWN VISUAL EFFECTS
	   ==================================== */

 /* Shutdown Color Overrides */
 .boot-screen.shutdown {
  background: #000000;
 }

 .boot-screen.shutdown .sys-label {
  color: #ff6600;
  text-shadow: 0 0 10px rgba(255, 102, 0, 0.8);
 }

 .boot-screen.shutdown .sys-value {
  color: #ff3300;
  text-shadow: 0 0 8px rgba(255, 51, 0, 0.6);
 }

 .boot-screen.shutdown .arch-logo-cyber {
  color: #ff3300;
  filter: drop-shadow(0 0 20px rgba(255, 51, 0, 1))
   drop-shadow(0 0 40px rgba(255, 51, 0, 0.6));
  animation:
   logoFloat 4s ease-in-out infinite,
   logoPulseShutdown 2s ease-in-out infinite;
 }

 @keyframes logoPulseShutdown {
  0%,
  100% {
   filter: drop-shadow(0 0 20px rgba(255, 51, 0, 1))
    drop-shadow(0 0 40px rgba(255, 51, 0, 0.6));
  }
  50% {
   filter: drop-shadow(0 0 30px rgba(255, 51, 0, 1))
    drop-shadow(0 0 60px rgba(255, 51, 0, 0.8));
  }
 }

 .boot-screen.shutdown .title-main {
  color: #ff6600;
  text-shadow:
   0 0 10px rgba(255, 102, 0, 1),
   0 0 20px rgba(255, 102, 0, 0.8),
   0 0 30px rgba(255, 102, 0, 0.6),
   0 0 40px rgba(255, 102, 0, 0.4);
  animation:
   titleGlitch 5s linear infinite,
   shutdownFlicker 3s linear infinite;
 }

 @keyframes shutdownFlicker {
  0%,
  94%,
  96%,
  100% {
   opacity: 1;
  }
  95% {
   opacity: 0.6;
  }
  97% {
   opacity: 0.8;
  }
 }

 .boot-screen.shutdown .title-sub {
  color: #ff3300;
  text-shadow: 0 0 10px rgba(255, 51, 0, 0.8);
 }

 .boot-screen.shutdown .status-text {
  color: #ff6600;
  text-shadow: 0 0 10px rgba(255, 102, 0, 0.8);
 }

 .boot-screen.shutdown .progress-fill {
  background: linear-gradient(90deg, #ff3300, #ff6600);
  box-shadow: 0 0 10px rgba(255, 51, 0, 0.8);
 }

 .boot-screen.shutdown .progress-text {
  color: #ff6600;
  text-shadow: 0 0 10px rgba(255, 102, 0, 1);
 }

 .boot-screen.shutdown .terminal-prompt {
  color: #ff3300;
  text-shadow: 0 0 8px rgba(255, 51, 0, 0.8);
 }

 .boot-screen.shutdown .terminal-line {
  color: #ff6600;
  text-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
 }

 .boot-screen.shutdown .terminal-line.header-line {
  color: #ff9900;
  text-shadow: 0 0 8px rgba(255, 153, 0, 0.8);
 }

 .boot-screen.shutdown .terminal-line.progress-line {
  color: #ff3300;
  text-shadow: 0 0 10px rgba(255, 51, 0, 0.8);
 }

 .boot-screen.shutdown .stat-icon {
  color: #ff6600;
  text-shadow: 0 0 8px rgba(255, 102, 0, 0.8);
 }

 .boot-screen.shutdown .stat-text {
  color: #ff3300;
  text-shadow: 0 0 6px rgba(255, 51, 0, 0.6);
 }

 /* Static Noise Effect */
 .static-noise {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0;
  animation: staticFadeIn 2s ease-in forwards;
  pointer-events: none;
  mix-blend-mode: overlay;
 }

 @keyframes staticFadeIn {
  to {
   opacity: 0.15;
  }
 }

 /* Glitch Overlay Effect */
 .glitch-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
   90deg,
   transparent,
   rgba(255, 51, 0, 0.1),
   transparent
  );
  animation: glitchSweep 0.3s infinite;
  pointer-events: none;
 }

 @keyframes glitchSweep {
  0%,
  100% {
   transform: translateX(-100%);
   opacity: 0;
  }
  50% {
   transform: translateX(100%);
   opacity: 1;
  }
 }

 /* Intense Scanlines */
 .scanlines.intense {
  background: repeating-linear-gradient(
   0deg,
   rgba(255, 51, 0, 0.05) 0px,
   transparent 1px,
   transparent 2px,
   rgba(255, 51, 0, 0.05) 3px
  );
  animation: scanlineMove 4s linear infinite;
 }

 /* Closing Vignette */
 .crt-vignette.closing {
  background: radial-gradient(circle, transparent 40%, rgba(0, 0, 0, 0.8) 100%);
  animation: vignetteClose 3s ease-in forwards;
 }

 @keyframes vignetteClose {
  to {
   background: radial-gradient(circle, transparent 10%, rgba(0, 0, 0, 1) 60%);
  }
 }

 /* Fade to black after shutdown completes */
 .boot-screen.shutdown {
  animation: fadeToBlack 1.5s ease-in 3s forwards;
 }

 @keyframes fadeToBlack {
  to {
   opacity: 0;
   background: #000000;
  }
 }

 /* mobile */

 @media (max-width: 768px) {
  .boot-container {
   padding: 12px;
  }

  .system-bar {
   gap: 12px;
   padding: 10px 12px;
   flex-wrap: wrap;
   justify-content: center;
  }

  .system-info {
   gap: 8px;
  }

  .sys-label {
   font-size: 9px;
   letter-spacing: 1px;
  }

  .sys-value {
   font-size: 9px;
  }

  .boot-main {
   grid-template-columns: 1fr;
   grid-template-rows: auto 1fr;
   gap: 16px;
  }

  .boot-left {
   padding: 20px;
   gap: 20px;
  }

  .arch-logo-cyber {
   width: 80px;
   height: 80px;
  }

  .arch-logo-cyber svg {
   width: 80px;
   height: 80px;
  }

  .title-main {
   font-size: 24px;
   letter-spacing: 2px;
  }

  .title-sub {
   font-size: 11px;
   letter-spacing: 2px;
  }

  .status-text {
   font-size: 12px;
   letter-spacing: 1px;
  }

  .progress-text {
   font-size: 14px;
  }

  .boot-right {
   min-height: 300px;
  }

  .terminal-header {
   padding: 10px 12px;
  }

  .terminal-prompt {
   font-size: 11px;
  }

  .terminal-output {
   padding: 12px;
  }

  .terminal-line {
   font-size: 10px;
   line-height: 1.5;
  }

  .terminal-line.progress-line {
   font-size: 11px;
  }

  .stats-bar {
   padding: 10px 12px;
   flex-wrap: wrap;
   gap: 8px;
   justify-content: center;
  }

  .stat-item {
   gap: 8px;
  }

  .stat-icon {
   font-size: 8px;
   letter-spacing: 1px;
  }

  .stat-text {
   font-size: 9px;
  }
 }
</style>
