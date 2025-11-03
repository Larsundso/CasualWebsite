/**
 * Todo List Store
 * Manages tasks with categories, filtering, and persistence
 */

import type { Todo, TodoCategory, TodoFilter, TodoStats, Subtask, PriorityLevel } from '$lib/types/todo';

const TODO_STATE_KEY = 'todos-state';
const TODO_CATEGORIES_KEY = 'todos-categories';
const TODO_PRIORITIES_KEY = 'todos-priorities';

// ============================================
// STATE
// ============================================

let todos = $state<Todo[]>(loadTodos());
let categories = $state<TodoCategory[]>(loadCategories());
let priorities = $state<PriorityLevel[]>(loadPriorities());
let filter = $state<TodoFilter>({ showCompleted: false });

// ============================================
// DERIVED STATE
// ============================================

const filteredTodos = $derived.by(() => {
 let result = [...todos];

 if (!filter.showCompleted) {
  result = result.filter((t) => !t.completed);
 }

 if (filter.categoryId) {
  result = result.filter((t) => t.categoryId === filter.categoryId);
 }

 if (filter.priority) {
  result = result.filter((t) => t.priority === filter.priority);
 }

 if (filter.tag) {
  const tag = filter.tag;
  result = result.filter((t) => t.tags.includes(tag));
 }

 if (filter.search) {
  const search = filter.search.toLowerCase();
  result = result.filter(
   (t) =>
    t.text.toLowerCase().includes(search) || t.notes?.toLowerCase().includes(search)
  );
 }

 return result.sort((a, b) => {
  if (a.completed !== b.completed) {
   return a.completed ? 1 : -1;
  }

  const aPriority = priorities.find((p) => p.id === a.priority);
  const bPriority = priorities.find((p) => p.id === b.priority);
  const priorityDiff = (aPriority?.order || 999) - (bPriority?.order || 999);
  if (priorityDiff !== 0) return priorityDiff;

  if (a.dueDate && b.dueDate) {
   return a.dueDate - b.dueDate;
  }
  if (a.dueDate) return -1;
  if (b.dueDate) return 1;

  return b.createdAt - a.createdAt;
 });
});

const todoStats = $derived.by((): TodoStats => {
 const total = todos.length;
 const completed = todos.filter((t) => t.completed).length;
 return { total, completed, overdue: 0, dueToday: 0 };
});

export function addTodo(text: string, options?: Partial<Todo>): Todo {
 const todo: Todo = {
  id: crypto.randomUUID(),
  text,
  completed: false,
  createdAt: Date.now(),
  priority: options?.priority || 'medium',
  categoryId: options?.categoryId,
  dueDate: options?.dueDate,
  tags: options?.tags || [],
  subtasks: [],
  notes: options?.notes,
  pomodoroCount: 0
 };

 todos = [todo, ...todos];
 saveTodos();

 return todo;
}

export function toggleTodo(id: string) {
 todos = todos.map((t) => {
  if (t.id !== id) return t;
  return {
   ...t,
   completed: !t.completed,
   completedAt: !t.completed ? Date.now() : undefined
  };
 });
 saveTodos();
}

export function updateTodo(id: string, updates: Partial<Todo>) {
 todos = todos.map((t) => (t.id === id ? { ...t, ...updates } : t));
 saveTodos();
}

export function deleteTodo(id: string) {
 todos = todos.filter((t) => t.id !== id);
 saveTodos();
}

// ============================================
// SUBTASK OPERATIONS
// ============================================

export function addSubtask(todoId: string, text: string) {
 const subtask: Subtask = {
  id: crypto.randomUUID(),
  text,
  completed: false
 };

 todos = todos.map((t) =>
  t.id === todoId ? { ...t, subtasks: [...t.subtasks, subtask] } : t
 );
 saveTodos();
}

export function toggleSubtask(todoId: string, subtaskId: string) {
 todos = todos.map((t) => {
  if (t.id !== todoId) return t;

  const updatedSubtasks = t.subtasks.map((s) =>
   s.id === subtaskId ? { ...s, completed: !s.completed } : s
  );

  const allSubtasksComplete = updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.completed);

  return {
   ...t,
   subtasks: updatedSubtasks,
   completed: allSubtasksComplete ? true : t.completed,
   completedAt: allSubtasksComplete ? Date.now() : t.completedAt
  };
 });
 saveTodos();
}

export function deleteSubtask(todoId: string, subtaskId: string) {
 todos = todos.map((t) =>
  t.id === todoId ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) } : t
 );
 saveTodos();
}

// ============================================
// CATEGORY OPERATIONS
// ============================================

function getDefaultCategories(): TodoCategory[] {
 return [
  { id: 'work', name: 'Work', icon: '💼', color: '137, 180, 250', preset: true },
  { id: 'personal', name: 'Personal', icon: '🏠', color: '166, 227, 161', preset: true },
  { id: 'learning', name: 'Learning', icon: '📚', color: '245, 194, 231', preset: true },
  { id: 'projects', name: 'Projects', icon: '🚀', color: '250, 179, 135', preset: true }
 ];
}

export function addCategory(name: string, icon: string, color: string) {
 const category: TodoCategory = {
  id: crypto.randomUUID(),
  name,
  icon,
  color
 };

 categories = [...categories, category];
 saveCategories();
}

export function deleteCategory(id: string) {
 categories = categories.filter((c) => c.id !== id);

 todos = todos.map((todo) =>
  todo.categoryId === id ? { ...todo, categoryId: undefined } : todo
 );

 saveCategories();
 saveTodos();
}

// ============================================
// PRIORITY OPERATIONS
// ============================================

function getDefaultPriorities(): PriorityLevel[] {
 return [
  { id: 'high', label: 'High', color: '243, 139, 168', order: 0, preset: true },
  { id: 'medium', label: 'Medium', color: '250, 179, 135', order: 1, preset: true },
  { id: 'low', label: 'Low', color: '137, 180, 250', order: 2, preset: true }
 ];
}

export function addPriority(label: string, color: string, order: number) {
 const priority: PriorityLevel = {
  id: crypto.randomUUID(),
  label,
  color,
  order,
  preset: false
 };

 priorities = [...priorities, priority];
 savePriorities();
}

export function deletePriority(id: string) {
 priorities = priorities.filter((p) => p.id !== id);

 const mediumPriority = priorities.find((p) => p.id === 'medium');
 const fallbackPriority = mediumPriority?.id || priorities[0]?.id || 'medium';
 todos = todos.map((todo) =>
  todo.priority === id ? { ...todo, priority: fallbackPriority } : todo
 );

 savePriorities();
 saveTodos();
}

export function restoreDefaultCategories() {
 const defaults = getDefaultCategories();
 const existingIds = new Set(categories.map((c) => c.id));

 const newPresets = defaults.filter((preset) => !existingIds.has(preset.id));

 if (newPresets.length > 0) {
  categories = [...categories, ...newPresets];
  saveCategories();
 }
}

export function restoreDefaultPriorities() {
 const defaults = getDefaultPriorities();
 const existingIds = new Set(priorities.map((p) => p.id));

 const newPresets = defaults.filter((preset) => !existingIds.has(preset.id));

 if (newPresets.length > 0) {
  priorities = [...priorities, ...newPresets];
  savePriorities();
 }
}

// ============================================
// FILTERING
// ============================================

export function setFilter(newFilter: Partial<TodoFilter>) {
 filter = { ...filter, ...newFilter };
}

export function clearFilter() {
 filter = { showCompleted: false };
}

// ============================================
// POMODORO INTEGRATION
// ============================================

export function incrementPomodoroCount(todoId: string) {
 const todo = todos.find((t) => t.id === todoId);
 if (!todo) return;

 todo.pomodoroCount = (todo.pomodoroCount || 0) + 1;
 todos = [...todos];
 saveTodos();
}

// ============================================
// PERSISTENCE
// ============================================

function loadTodos(): Todo[] {
 if (typeof localStorage === 'undefined') return [];

 try {
  const saved = localStorage.getItem(TODO_STATE_KEY);
  return saved ? JSON.parse(saved) : [];
 } catch (error) {
  console.error('Failed to load todos:', error);
  return [];
 }
}

function saveTodos() {
 if (typeof localStorage === 'undefined') return;

 try {
  localStorage.setItem(TODO_STATE_KEY, JSON.stringify(todos));
 } catch (error) {
  console.error('Failed to save todos:', error);
 }
}

function loadCategories(): TodoCategory[] {
 if (typeof localStorage === 'undefined') return getDefaultCategories();

 try {
  const saved = localStorage.getItem(TODO_CATEGORIES_KEY);
  if (saved) {
   return JSON.parse(saved);
  }
  const defaults = getDefaultCategories();
  saveCategories();
  return defaults;
 } catch (error) {
  console.error('Failed to load categories:', error);
  return getDefaultCategories();
 }
}

function saveCategories() {
 if (typeof localStorage === 'undefined') return;

 try {
  localStorage.setItem(TODO_CATEGORIES_KEY, JSON.stringify(categories));
 } catch (error) {
  console.error('Failed to save categories:', error);
 }
}

function loadPriorities(): PriorityLevel[] {
 if (typeof localStorage === 'undefined') return getDefaultPriorities();

 try {
  const saved = localStorage.getItem(TODO_PRIORITIES_KEY);
  if (saved) {
   return JSON.parse(saved);
  }

  const defaults = getDefaultPriorities();
  savePriorities();
  return defaults;
 } catch (error) {
  console.error('Failed to load priorities:', error);
  return getDefaultPriorities();
 }
}

function savePriorities() {
 if (typeof localStorage === 'undefined') return;

 try {
  localStorage.setItem(TODO_PRIORITIES_KEY, JSON.stringify(priorities));
 } catch (error) {
  console.error('Failed to save priorities:', error);
 }
}

// ============================================
// BULK OPERATIONS
// ============================================

export function deleteCompletedTodos() {
 todos = todos.filter((t) => !t.completed);
 saveTodos();
}

export function clearAllTodos() {
 if (confirm('Are you sure you want to delete all todos? This cannot be undone.')) {
  todos = [];
  saveTodos();
 }
}

// ============================================
// EXPORTS
// ============================================

export const todoState = {
 get todos() {
  return todos;
 },
 get filteredTodos() {
  return filteredTodos;
 },
 get categories() {
  return categories;
 },
 get priorities() {
  return priorities;
 },
 get filter() {
  return filter;
 },
 get stats() {
  return todoStats;
 }
};
