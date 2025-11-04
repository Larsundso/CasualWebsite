/**
 * Focus Session Store
 * Manages Pomodoro timer and productivity tracking
 */

import type { FocusSession, SessionType, SessionPreset } from '$lib/types/focus';

const FOCUS_STATE_KEY = 'focus-state';
const FOCUS_SETTINGS_KEY = 'focus-settings';

// ============================================
// STATE
// ============================================

let currentSession = $state<FocusSession | null>(null);
let timerInterval: number | null = null;
let currentPreset = $state<SessionPreset>(loadPreset());
let pomodoroCount = $state(0);
let focusModeActive = $state(false);

// ============================================
// PRESETS
// ============================================

function getDefaultPreset(): SessionPreset {
 return {
  id: 'classic',
  name: 'Classic Pomodoro',
  icon: '🍅',
  focusDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  pomodorosUntilLongBreak: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  notifications: {
   sound: true,
   desktop: true
  }
 };
}

// ============================================
// SESSION MANAGEMENT
// ============================================

export function startSession(type: SessionType, task?: string) {
 if (currentSession?.state === 'running') {
  pauseSession();
 }

 const duration = getSessionDuration(type);

 currentSession = {
  id: crypto.randomUUID(),
  type,
  duration,
  remaining: duration,
  state: 'running',
  startedAt: Date.now(),
  pausedAt: null,
  completedAt: null,
  task,
  pomodoroCount: type === 'focus' ? pomodoroCount + 1 : undefined
 };

 startTimer();
 applyEnvironment(type);
 saveState();
}

export function pauseSession() {
 if (!currentSession || currentSession.state !== 'running') return;

 currentSession.state = 'paused';
 currentSession.pausedAt = Date.now();
 stopTimer();
 saveState();
}

export function resumeSession() {
 if (!currentSession || currentSession.state !== 'paused') return;

 currentSession.state = 'running';
 currentSession.pausedAt = null;
 startTimer();
 saveState();
}

export function skipSession() {
 if (!currentSession) return;
 completeSession(true);
}

export function stopSession() {
 if (!currentSession) return;

 stopTimer();
 currentSession = null;
 exitFocusMode();
 saveState();
}

function completeSession(skipped: boolean = false) {
 if (!currentSession) return;

 stopTimer();

 currentSession.state = 'completed';
 currentSession.completedAt = Date.now();

 showSessionCompleteNotification(currentSession);

 handleSessionTransition(currentSession.type);

 saveState();
}

function handleSessionTransition(completedType: SessionType) {
 if (completedType === 'focus') {
  pomodoroCount++;

  const isLongBreak = pomodoroCount % currentPreset.pomodorosUntilLongBreak === 0;
  const nextBreakType: SessionType = isLongBreak ? 'long-break' : 'short-break';

  if (currentPreset.autoStartBreaks) {
   setTimeout(() => startSession(nextBreakType), 2000);
  } else {
   currentSession = null;
  }
 } else {
  if (currentPreset.autoStartPomodoros) {
   setTimeout(() => startSession('focus'), 2000);
  } else {
   currentSession = null;
  }
 }
}

// ============================================
// TIMER ENGINE
// ============================================

function startTimer() {
 stopTimer();

 timerInterval = window.setInterval(() => {
  if (!currentSession || currentSession.state !== 'running') {
   stopTimer();
   return;
  }

  currentSession.remaining--;

  if (currentSession.remaining <= 0) {
   completeSession();
  }

  if (currentSession.remaining % 10 === 0) saveState();
 }, 1000);
}

function stopTimer() {
 if (timerInterval !== null) {
  clearInterval(timerInterval);
  timerInterval = null;
 }
}

// ============================================
// ENVIRONMENT CONTROL
// ============================================

function applyEnvironment(sessionType: SessionType) {
 if (sessionType === 'focus') {
  enterFocusMode();
 } else {
  exitFocusMode();
 }
}

function enterFocusMode() {
 focusModeActive = true;
 document.body.classList.add('focus-mode');
}

function exitFocusMode() {
 focusModeActive = false;
 document.body.classList.remove('focus-mode');
}


// ============================================
// NOTIFICATIONS
// ============================================

function showSessionCompleteNotification(session: FocusSession) {
 if (!currentPreset.notifications.desktop) return;

 const messages: Record<SessionType, string[]> = {
  focus: [
   '🎉 Focus session complete! Time for a break.',
   '💪 Great work! You earned a break.',
   '✅ Session done! Stretch and relax.'
  ],
  'short-break': ['⏰ Break over! Ready to focus again?', '🚀 Recharged! Back to work.'],
  'long-break': ['🌟 Long break complete! Feeling refreshed?', '💯 Great session streak!']
 };

 const typeMessages = messages[session.type];
 const message = typeMessages[Math.floor(Math.random() * typeMessages.length)];

 if ('Notification' in window && Notification.permission === 'granted') {
  new Notification('Focus Session', {
   body: message,
   icon: '/favicon.png'
  });
 } else if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
 }
}

// ============================================
// PERSISTENCE
// ============================================

function loadState() {
 if (typeof localStorage === 'undefined') return;

 try {
  const saved = localStorage.getItem(FOCUS_STATE_KEY);
  if (!saved) return;

  const state = JSON.parse(saved);

  if (state.currentSession?.state === 'running') {
   state.currentSession.state = 'paused';
  }

  currentSession = state.currentSession;
  pomodoroCount = state.pomodoroCount || 0;
 } catch (error) {
  console.error('Failed to load focus state:', error);
 }
}

function saveState() {
 if (typeof localStorage === 'undefined') return;

 try {
  const state = {
   currentSession,
   pomodoroCount,
   lastSaved: Date.now()
  };
  localStorage.setItem(FOCUS_STATE_KEY, JSON.stringify(state));
 } catch (error) {
  console.error('Failed to save focus state:', error);
 }
}

function loadPreset(): SessionPreset {
 if (typeof localStorage === 'undefined') {
  return getDefaultPreset();
 }

 try {
  const saved = localStorage.getItem(FOCUS_SETTINGS_KEY);
  if (!saved) return getDefaultPreset();

  return JSON.parse(saved);
 } catch (error) {
  console.error('Failed to load preset:', error);
  return getDefaultPreset();
 }
}

export function savePreset(preset: SessionPreset) {
 currentPreset = preset;

 if (typeof localStorage === 'undefined') return;

 try {
  localStorage.setItem(FOCUS_SETTINGS_KEY, JSON.stringify(preset));
 } catch (error) {
  console.error('Failed to save preset:', error);
 }
}


// ============================================
// UTILITIES
// ============================================

function getSessionDuration(type: SessionType): number {
 switch (type) {
  case 'focus':
   return currentPreset.focusDuration;
  case 'short-break':
   return currentPreset.shortBreakDuration;
  case 'long-break':
   return currentPreset.longBreakDuration;
 }
}

export function formatTime(seconds: number): string {
 const mins = Math.floor(seconds / 60);
 const secs = seconds % 60;
 return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// EXPORTS
// ============================================

export const focusState = {
 get currentSession() {
  return currentSession;
 },
 get pomodoroCount() {
  return pomodoroCount;
 },
 get focusModeActive() {
  return focusModeActive;
 },
 get currentPreset() {
  return currentPreset;
 }
};

if (typeof window !== 'undefined') {
 loadState();
}
