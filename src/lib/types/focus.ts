/**
 * Focus Session Types
 * For Pomodoro timer and productivity tracking
 */

export type SessionType = 'focus' | 'short-break' | 'long-break';
export type SessionState = 'idle' | 'running' | 'paused' | 'completed';

export interface FocusSession {
	id: string;
	type: SessionType;
	duration: number; // seconds
	remaining: number; // seconds
	state: SessionState;
	startedAt: number | null;
	pausedAt: number | null;
	completedAt: number | null;
	task?: string;
	pomodoroCount?: number;
}

export interface SessionPreset {
	id: string;
	name: string;
	icon: string;
	focusDuration: number; // seconds
	shortBreakDuration: number;
	longBreakDuration: number;
	pomodorosUntilLongBreak: number;
	autoStartBreaks: boolean;
	autoStartPomodoros: boolean;
	soundPresetId?: string;
	notifications: {
		sound: boolean;
		desktop: boolean;
	};
}

export interface SessionStats {
	date: string; // YYYY-MM-DD
	totalFocusTime: number; // seconds
	totalBreakTime: number;
	completedSessions: number;
	completedPomodoros: number;
	interruptedSessions: number;
	longestStreak: number;
}

export interface DailyGoal {
	targetPomodoros: number;
	targetFocusMinutes: number;
	achieved: boolean;
	date: string;
}
