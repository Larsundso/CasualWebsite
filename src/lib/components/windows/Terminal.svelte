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
  if (e.key === "Enter") {
   e.preventDefault();
   executeCommand(terminalInput);
  } else if (e.key === "ArrowUp") {
   e.preventDefault();
   if (historyIndex > 0) {
    historyIndex--;
    terminalInput = terminalHistory[historyIndex] || "";
   }
  } else if (e.key === "ArrowDown") {
   e.preventDefault();
   if (historyIndex < terminalHistory.length - 1) {
    historyIndex++;
    terminalInput = terminalHistory[historyIndex] || "";
   } else {
    historyIndex = terminalHistory.length;
    terminalInput = "";
   }
  } else if (e.key === "Tab") {
   e.preventDefault();
   const result = handleTabCompletion(terminalInput, currentPath);
   if (result.newInput !== undefined) {
    terminalInput = result.newInput;
   } else if (result.output) {
    terminalOutput = [...terminalOutput, terminalInput, result.output];
   }
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
 }

 .terminal-title {
  color: #00ff41;
  text-shadow: 0 0 8px rgba(0, 255, 65, 0.8);
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
