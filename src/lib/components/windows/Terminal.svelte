<svelte:options runes={true} />

<script lang="ts">
 import { onMount } from "svelte";
 import {
  ls,
  cd,
  pwd,
  cat,
  help,
  neofetch,
  handleTabCompletion,
 } from "$lib/utils/terminalCommands";

 let terminalInput = $state("");
 let terminalOutput = $state<string[]>([]);
 let terminalHistory = $state<string[]>([]);
 let historyIndex = $state(-1);
 let currentPath = $state("/home/lolo/website");
 let terminalOutputEl: HTMLDivElement | null = null;

 let soundEnabled = $state(true);
 let typingAudioContext: AudioContext | null = null;
 let typingMasterGain: GainNode | null = null;

 function ensureAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!typingAudioContext) {
   typingAudioContext = new AudioContext();
   typingMasterGain = typingAudioContext.createGain();
   typingMasterGain.gain.value = 0.65;
   typingMasterGain.connect(typingAudioContext.destination);
  }
  if (typingAudioContext.state === "suspended") {
   typingAudioContext.resume().catch(() => {});
  }
  return typingAudioContext;
 }

 function playClickLayer(
  ctx: AudioContext,
  dest: AudioNode,
  startTime: number,
  centerFreq: number,
  amplitude: number
 ) {
  // Sharp sine burst — the "tick" frequency component
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(centerFreq, startTime);
  osc.frequency.exponentialRampToValueAtTime(centerFreq * 0.55, startTime + 0.01);
  oscGain.gain.setValueAtTime(0, startTime);
  oscGain.gain.linearRampToValueAtTime(amplitude, startTime + 0.001);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.018);
  osc.connect(oscGain).connect(dest);
  osc.start(startTime);
  osc.stop(startTime + 0.022);

  // Bandpass-filtered noise burst — the actual "click" metal-on-metal
  const noiseLen = Math.floor(ctx.sampleRate * 0.015);
  const noiseBuffer = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseLen; i++) {
   // Decaying white noise for organic bite
   data[i] = (Math.random() * 2 - 1) * (1 - i / noiseLen) ** 1.5;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 3100 + (Math.random() * 400 - 200);
  bandpass.Q.value = 3.5;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(amplitude * 1.2, startTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.013);

  noise.connect(bandpass).connect(noiseGain).connect(dest);
  noise.start(startTime);
  noise.stop(startTime + 0.016);
 }

 function playThockLayer(
  ctx: AudioContext,
  dest: AudioNode,
  startTime: number,
  bodyFreq: number,
  amplitude: number,
  duration: number
 ) {
  // Triangle wave for the warm body tone
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = "triangle";
  // Pitch drops slightly as the stem settles
  osc.frequency.setValueAtTime(bodyFreq * 1.6, startTime);
  osc.frequency.exponentialRampToValueAtTime(bodyFreq, startTime + 0.025);

  // Lowpass filter shapes the thock — removes harsh harmonics
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 650;
  lowpass.Q.value = 2.5;

  oscGain.gain.setValueAtTime(0, startTime);
  oscGain.gain.linearRampToValueAtTime(amplitude, startTime + 0.003);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(lowpass).connect(oscGain).connect(dest);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
 }

 function playMetallicLayer(
  ctx: AudioContext,
  dest: AudioNode,
  startTime: number,
  amplitude: number
 ) {
  // Three harmonically-related sines = metallic "ping" resonance
  const frequencies = [1250, 2400, 4800];
  frequencies.forEach((freq, i) => {
   const osc = ctx.createOscillator();
   const gain = ctx.createGain();
   osc.type = "sine";
   osc.frequency.value = freq + (Math.random() * 30 - 15);

   // Harmonics decrease in amplitude
   const amp = amplitude / (i + 1);
   gain.gain.setValueAtTime(0, startTime);
   gain.gain.linearRampToValueAtTime(amp, startTime + 0.002);
   gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.028);

   osc.connect(gain).connect(dest);
   osc.start(startTime);
   osc.stop(startTime + 0.032);
  });
 }

 function playKeySound(
  keyType: "normal" | "enter" | "backspace" | "space" = "normal"
 ) {
  if (!soundEnabled) return;
  const ctx = ensureAudioContext();
  if (!ctx || !typingMasterGain) return;

  try {
   const now = ctx.currentTime;
   const dest = typingMasterGain;

   // Large keys (Enter, Space) have deeper body and louder impact
   const isLargeKey = keyType === "enter" || keyType === "space";

   // Per-keystroke randomization prevents "robot typing" feel
   const pitchJitter = 1 + (Math.random() * 0.1 - 0.05);
   const ampJitter = 1 + (Math.random() * 0.2 - 0.1);

   const bodyFreq = (isLargeKey ? 95 : 145) * pitchJitter;
   const clickFreq = (2800 + Math.random() * 300) * pitchJitter;
   const overallAmp = ampJitter * (isLargeKey ? 1.15 : 1);

   // === LAYER 1: Click transient (actuation) ===
   playClickLayer(ctx, dest, now, clickFreq, 0.22 * overallAmp);

   // === LAYER 2: Body thock (bottom-out) ===
   playThockLayer(
    ctx,
    dest,
    now + 0.001,
    bodyFreq,
    0.28 * overallAmp,
    isLargeKey ? 0.095 : 0.065
   );

   // === LAYER 3: Metallic spring ring ===
   playMetallicLayer(ctx, dest, now + 0.002, 0.06 * overallAmp);

   // === LAYER 4: Release click (key returning up) ===
   // Slightly delayed, slightly pitched down, quieter
   playClickLayer(
    ctx,
    dest,
    now + 0.068 + Math.random() * 0.008,
    clickFreq * 0.85,
    0.11 * overallAmp
   );

   // Backspace gets an extra low thock "clunk" for weight
   if (keyType === "backspace") {
    playThockLayer(ctx, dest, now + 0.005, 110 * pitchJitter, 0.1, 0.05);
   }
  } catch {
   // Audio synthesis is non-critical — silently swallow errors
  }
 }

 onMount(() => {
  terminalOutput = [
   "Arch Linux 6.6.10-arch1-1 (tty1)",
   "",
   "lolo@arch login: lolo",
   "Password: ",
   "",
   "Welcome to Arch Linux!",
   "",
   `Last login: ${new Date().toLocaleString()}`,
   "",
   'Type "help" for available commands, or "neofetch" for system info.',
   "",
  ];
 });

 /**
  * Execute a terminal command
  */
 async function executeCommand(cmd: string) {
  const trimmed = cmd.trim();
  if (!trimmed) return;

  terminalOutput = [
   ...terminalOutput,
   `[lolo@arch ${currentPath.split("/").pop() || "/"}]$ ${trimmed}`,
  ];

  terminalHistory = [...terminalHistory, trimmed];
  historyIndex = terminalHistory.length;

  const parts = trimmed.split(" ").filter((p) => p);
  const command = parts[0];
  const args = parts.slice(1);

  let output = "";

  try {
   switch (command) {
    case "ls":
     output = ls(args, currentPath);
     break;
    case "cd":
     const cdResult = cd(args, currentPath);
     output = cdResult.output;
     currentPath = cdResult.newPath;
     break;
    case "pwd":
     output = pwd(currentPath);
     break;
    case "cat":
     output = await cat(args, currentPath);
     break;
    case "clear":
     terminalOutput = [];
     terminalInput = "";
     return;
    case "help":
     output = help();
     break;
    case "neofetch":
     output = neofetch();
     break;
    case "uname":
     output = "Linux arch 6.6.10-arch1-1 x86_64 GNU/Linux";
     break;
    case "whoami":
     output = "lolo";
     break;
    case "date":
     output = new Date().toString();
     break;
    case "echo":
     output = args.join(" ");
     break;
    case "hostname":
     output = "arch";
     break;
    default:
     output = `${command}: command not found`;
   }
  } catch (e) {
   output = `Error executing command: ${e}`;
  }

  if (output) {
   terminalOutput = [...terminalOutput, output];
  }

  terminalInput = "";

  setTimeout(() => {
   if (terminalOutputEl) {
    terminalOutputEl.scrollTop = terminalOutputEl.scrollHeight;
   }
  }, 10);
 }

 /**
  * Handle keyboard input
  */
 function handleKeydown(e: KeyboardEvent) {
  // Ctrl+L — clear screen like real bash (keeps current input intact)
  if (e.ctrlKey && e.key.toLowerCase() === "l") {
   e.preventDefault();
   terminalOutput = [];
   playKeySound("enter");
   return;
  }

  // Ctrl+C — cancel current line (prints ^C, clears input)
  if (e.ctrlKey && e.key.toLowerCase() === "c") {
   e.preventDefault();
   terminalOutput = [
    ...terminalOutput,
    `[lolo@arch ${currentPath.split("/").pop() || "/"}]$ ${terminalInput}^C`,
   ];
   terminalInput = "";
   playKeySound("enter");
   return;
  }

  if (e.key === "Enter") {
   e.preventDefault();
   playKeySound("enter");
   executeCommand(terminalInput);
  } else if (e.key === "Backspace") {
   playKeySound("backspace");
  } else if (e.key === "ArrowUp") {
   e.preventDefault();
   playKeySound("normal");
   if (historyIndex > 0) {
    historyIndex--;
    terminalInput = terminalHistory[historyIndex] || "";
   }
  } else if (e.key === "ArrowDown") {
   e.preventDefault();
   playKeySound("normal");
   if (historyIndex < terminalHistory.length - 1) {
    historyIndex++;
    terminalInput = terminalHistory[historyIndex] || "";
   } else {
    historyIndex = terminalHistory.length;
    terminalInput = "";
   }
  } else if (e.key === "Tab") {
   e.preventDefault();
   playKeySound("normal");
   const result = handleTabCompletion(terminalInput, currentPath);
   if (result.newInput !== undefined) {
    terminalInput = result.newInput;
   } else if (result.output) {
    terminalOutput = [...terminalOutput, terminalInput, result.output];
   }
  } else if (e.key.length === 1) {
   // Only play sound on visible character keys (ignore Shift, Ctrl, etc.)
   // Space gets the deeper thock of a larger keycap
   playKeySound(e.key === " " ? "space" : "normal");
  }
 }

 /**
  * Focus terminal input when clicking on terminal
  */
 function focusInput() {
  const input = document.querySelector(".terminal-input") as HTMLInputElement;
  if (input) {
   input.focus();
  }
 }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="terminal-container" onclick={focusInput}>
 <div class="terminal-header">
  <span class="terminal-title">lolo@arch: ~</span>
  <button
   class="sound-toggle"
   class:enabled={soundEnabled}
   onclick={(e) => {
    e.stopPropagation();
    soundEnabled = !soundEnabled;
   }}
   title={soundEnabled ? "Mute typing sounds" : "Enable typing sounds"}
   aria-label={soundEnabled ? "Mute typing sounds" : "Enable typing sounds"}
  >
   {soundEnabled ? "♪" : "♪̸"}
  </button>
 </div>
 <div
  class="terminal-output interactive-terminal-output"
  bind:this={terminalOutputEl}
 >
  {#each terminalOutput as line, i (i)}
   <div class="terminal-line">{line}</div>
  {/each}
 </div>
 <div class="terminal-input-line">
  <span class="terminal-prompt"
   >[lolo@arch {currentPath.split("/").pop() || "/"}]$</span
  >
  <input
   type="text"
   class="terminal-input"
   bind:value={terminalInput}
   onkeydown={handleKeydown}
   spellcheck="false"
   autocomplete="off"
  />
 </div>
</div>

<style>
 .terminal-container {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  flex-direction: column;
  font-family: "JetBrains Mono", "Courier New", monospace;
  color: #00ff41;
 }

 .terminal-header {
  padding: 8px 12px;
  background: rgba(0, 255, 65, 0.1);
  border-bottom: 1px solid rgba(0, 255, 65, 0.3);
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
 }

 .terminal-title {
  color: #00ff41;
  text-shadow: 0 0 8px rgba(0, 255, 65, 0.8);
 }

 .sound-toggle {
  background: transparent;
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 4px;
  color: rgba(0, 255, 65, 0.5);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 3px 8px;
  transition: all 0.2s;
  font-family: inherit;
 }

 .sound-toggle:hover {
  background: rgba(0, 255, 65, 0.1);
  border-color: rgba(0, 255, 65, 0.6);
 }

 .sound-toggle.enabled {
  color: #00ff41;
  text-shadow: 0 0 6px rgba(0, 255, 65, 0.8);
  border-color: rgba(0, 255, 65, 0.6);
 }

 .terminal-output {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.6;
 }

 .terminal-output::-webkit-scrollbar {
  width: 8px;
 }

 .terminal-output::-webkit-scrollbar-track {
  background: rgba(0, 255, 65, 0.05);
 }

 .terminal-output::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 65, 0.3);
  border-radius: 4px;
 }

 .terminal-output::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 65, 0.5);
 }

 .terminal-line {
  margin: 2px 0;
  white-space: pre-wrap;
  word-wrap: break-word;
 }

 .terminal-input-line {
  padding: 8px 12px;
  background: rgba(0, 255, 65, 0.05);
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid rgba(0, 255, 65, 0.2);
 }

 .terminal-prompt {
  color: #00ffff;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.8);
  font-weight: 600;
  white-space: nowrap;
  font-size: 13px;
 }

 .terminal-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #00ff41;
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: 13px;
  caret-color: #00ff41;
 }

 .terminal-input::selection {
  background: rgba(0, 255, 65, 0.3);
 }
</style>
