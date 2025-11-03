/**
 * Todo List Types
 */

export type TodoPriority = string;

export interface PriorityLevel {
	id: string;
	label: string;
	color: string;
	order: number;
	preset?: boolean;
}

export interface Subtask {
	id: string;
	text: string;
	completed: boolean;
}

export interface Todo {
	id: string;
	text: string;
	completed: boolean;
	createdAt: number;
	completedAt?: number;
	priority: TodoPriority;
	categoryId?: string;
	dueDate?: number;
	tags: string[];
	subtasks: Subtask[];
	notes?: string;
	pomodoroCount?: number;
}

export interface TodoCategory {
	id: string;
	name: string;
	icon: string;
	color: string;
	preset?: boolean;
}

export interface TodoFilter {
	showCompleted: boolean;
	categoryId?: string;
	priority?: TodoPriority;
	tag?: string;
	search?: string;
}

export interface TodoStats {
	total: number;
	completed: number;
	overdue: number;
	dueToday: number;
}
