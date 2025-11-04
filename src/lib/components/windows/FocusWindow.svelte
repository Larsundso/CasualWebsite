<script lang="ts">
 import {
  focusState,
  startSession,
  pauseSession,
  resumeSession,
  skipSession,
  stopSession,
  formatTime,
 } from "$lib/stores/focusStore.svelte";
 import type { SessionType } from "$lib/types/focus";
 import IconPlayerPlay from "@tabler/icons-svelte/icons/player-play";
 import IconPlayerPause from "@tabler/icons-svelte/icons/player-pause";
 import IconPlayerStop from "@tabler/icons-svelte/icons/player-stop";
 import IconPlayerSkipForward from "@tabler/icons-svelte/icons/player-skip-forward";

 let currentTask = $state("");

 const session = $derived(focusState.currentSession);
 const pomodoroCount = $derived(focusState.pomodoroCount);

 const isRunning = $derived(session?.state === "running");
 const isPaused = $derived(session?.state === "paused");
 const isIdle = $derived(!session || session.state === "idle");

 const formattedTime = $derived(
  session ? formatTime(session.remaining) : "25:00"
 );
 const progress = $derived(
  session
   ? ((session.duration - session.remaining) / session.duration) * 100
   : 0
 );

 function handleStart(type: SessionType) {
  startSession(type, currentTask || undefined);
  currentTask = "";
 }
</script>

<div class="focus-window">
 <div class="timer-view">
  <!-- Task Input -->
  {#if isIdle}
   <div class="task-input-section">
    <label for="task-input" class="task-label">What are you working on?</label>
    <input
     id="task-input"
     type="text"
     bind:value={currentTask}
     placeholder="e.g., Write documentation"
     class="task-input"
     maxlength="100"
    />
   </div>
  {:else if session?.task}
   <div class="current-task">
    <span class="task-label">Working on:</span>
    <span class="task-text">{session.task}</span>
   </div>
  {/if}

  <!-- Timer Display -->
  <div class="timer-display" class:running={isRunning}>
   <svg class="timer-ring" viewBox="0 0 280 280">
    <circle class="timer-ring-bg" cx="140" cy="140" r="120" />
    <circle
     class="timer-ring-progress"
     cx="140"
     cy="140"
     r="120"
     style="stroke-dashoffset: {753.98 * (1 - progress / 100)}"
    />
   </svg>
   <div class="timer-content">
    <div class="timer-time">{formattedTime}</div>
    <div class="timer-label">
     {#if session?.type === "focus"}
      Focus Session
     {:else if session?.type === "short-break"}
      Short Break
     {:else if session?.type === "long-break"}
      Long Break
     {:else}
      Ready to focus?
     {/if}
    </div>
    {#if session?.pomodoroCount}
     <div class="pomodoro-indicator">
      🍅 Pomodoro #{session.pomodoroCount}
     </div>
    {/if}
   </div>
  </div>

  <!-- Controls -->
  <div class="controls">
   {#if isIdle}
    <button type="button" class="control-btn primary" onclick={() => handleStart("focus")}>
     <IconPlayerPlay size={24} stroke={1.5} />
     <span>Start Focus</span>
    </button>
    <button
     type="button"
     class="control-btn secondary"
     onclick={() => handleStart("short-break")}
    >
     <span>Short Break</span>
    </button>
    <button
     type="button"
     class="control-btn secondary"
     onclick={() => handleStart("long-break")}
    >
     <span>Long Break</span>
    </button>
   {:else if isRunning}
    <button type="button" class="control-btn" onclick={pauseSession}>
     <IconPlayerPause size={24} stroke={1.5} />
     <span>Pause</span>
    </button>
    <button type="button" class="control-btn" onclick={skipSession}>
     <IconPlayerSkipForward size={24} stroke={1.5} />
     <span>Skip</span>
    </button>
    <button type="button" class="control-btn danger" onclick={stopSession}>
     <IconPlayerStop size={24} stroke={1.5} />
     <span>Stop</span>
    </button>
   {:else if isPaused}
    <button type="button" class="control-btn primary" onclick={resumeSession}>
     <IconPlayerPlay size={24} stroke={1.5} />
     <span>Resume</span>
    </button>
    <button type="button" class="control-btn danger" onclick={stopSession}>
     <IconPlayerStop size={24} stroke={1.5} />
     <span>Stop</span>
    </button>
   {/if}
  </div>

  <!-- Session counter -->
  <div class="session-info">
   <div class="info-item">
    <span class="info-icon">🍅</span>
    <span class="info-text">Session #{pomodoroCount + 1}</span>
   </div>
  </div>
 </div>
</div>

<style>
 .focus-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(
   135deg,
   rgba(30, 30, 46, 0.95),
   rgba(24, 24, 37, 0.95)
  );
  color: #cdd6f4;
  overflow: hidden;
 }

 .timer-view {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: flex-start;
  min-height: min-content;
 }

 .task-input-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 500px;
 }

 .task-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #9399b2;
 }

 .task-input {
  padding: 12px 16px;
  background: rgba(17, 17, 27, 0.6);
  border: 2px solid rgba(203, 166, 247, 0.3);
  border-radius: 10px;
  color: #cdd6f4;
  font-size: 14px;
  transition: all 0.3s;
 }

 .task-input:focus {
  outline: none;
  border-color: #cba6f7;
  box-shadow: 0 0 20px rgba(203, 166, 247, 0.3);
 }

 .current-task {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  background: rgba(203, 166, 247, 0.1);
  border: 1px solid rgba(203, 166, 247, 0.3);
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
 }

 .current-task .task-text {
  font-size: 16px;
  font-weight: 600;
  color: #cba6f7;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
 }

 .timer-display {
  position: relative;
  width: 280px;
  height: 280px;
 }

 .timer-ring {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
  display: block;
 }

 .timer-ring-bg {
  fill: none;
  stroke: rgba(203, 166, 247, 0.1);
  stroke-width: 12;
 }

 .timer-ring-progress {
  fill: none;
  stroke: #cba6f7;
  stroke-width: 12;
  stroke-linecap: round;
  stroke-dasharray: 753.98;
  transition: stroke-dashoffset 1s linear;
 }

 .timer-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
 }

 .timer-time {
  font-size: 56px;
  font-weight: 700;
  color: #cba6f7;
  text-shadow: 0 0 20px rgba(203, 166, 247, 0.5);
  font-variant-numeric: tabular-nums;
 }

 .timer-label {
  font-size: 14px;
  color: #9399b2;
  text-transform: uppercase;
  letter-spacing: 1px;
 }

 .pomodoro-indicator {
  font-size: 12px;
  color: #f38ba8;
  font-weight: 600;
 }

 .controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
 }

 .control-btn {
  padding: 12px 24px;
  background: rgba(203, 166, 247, 0.1);
  border: 2px solid rgba(203, 166, 247, 0.3);
  border-radius: 10px;
  color: #cdd6f4;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
 }

 .control-btn:hover {
  background: rgba(203, 166, 247, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(203, 166, 247, 0.3);
 }

 .control-btn:active {
  transform: translateY(0);
  opacity: 0.8;
 }

 .control-btn.primary {
  background: linear-gradient(135deg, #cba6f7, #f5c2e7);
  color: #1e1e2e;
  border: none;
 }

 .control-btn.primary:hover {
  box-shadow: 0 8px 25px rgba(203, 166, 247, 0.5);
 }

 .control-btn.secondary {
  background: rgba(137, 180, 250, 0.1);
  border-color: rgba(137, 180, 250, 0.3);
 }

 .control-btn.danger {
  background: rgba(243, 139, 168, 0.1);
  border-color: rgba(243, 139, 168, 0.3);
  color: #f38ba8;
 }

 .session-info {
  display: flex;
  gap: 15px;
  padding: 16px 24px;
  background: rgba(203, 166, 247, 0.1);
  border: 1px solid rgba(203, 166, 247, 0.3);
  border-radius: 12px;
 }

 .info-item {
  display: flex;
  align-items: center;
  gap: 8px;
 }

 .info-icon {
  font-size: 20px;
 }

 .info-text {
  font-size: 14px;
  font-weight: 600;
  color: #cdd6f4;
 }

 /* Mobile */
 @media (max-width: 768px) {
  .timer-view {
   padding: 20px 15px;
  }

  .timer-display {
   width: 240px;
   height: 240px;
  }

  .timer-time {
   font-size: 48px;
  }

  .controls {
   flex-direction: column;
   width: 100%;
   gap: 12px;
  }

  .control-btn {
   width: 100%;
   justify-content: center;
   min-height: 48px;
   padding: 14px 24px;
   font-size: 16px;
  }

  .control-btn:active {
   background: rgba(203, 166, 247, 0.3);
  }

  .control-btn.primary:active {
   opacity: 0.9;
  }
 }
</style>
