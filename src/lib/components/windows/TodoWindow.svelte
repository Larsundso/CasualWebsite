<svelte:options runes={true} />

<script lang="ts">
 import {
  todoState,
  addTodo,
  toggleTodo,
  deleteTodo,
  updateTodo,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  setFilter,
  deleteCompletedTodos,
  addCategory,
  deleteCategory,
  addPriority,
  deletePriority,
 } from "$lib/stores/todoStore.svelte";
 import { startSession } from "$lib/stores/focusStore.svelte";
 import type { Todo, TodoPriority } from "$lib/types/todo";
 import IconPlus from "@tabler/icons-svelte/icons/plus";
 import IconCheck from "@tabler/icons-svelte/icons/check";
 import IconTrash from "@tabler/icons-svelte/icons/trash";
 import IconClock from "@tabler/icons-svelte/icons/clock";
 import IconFlag from "@tabler/icons-svelte/icons/flag";
 import IconChevronDown from "@tabler/icons-svelte/icons/chevron-down";
 import IconChevronRight from "@tabler/icons-svelte/icons/chevron-right";
 import IconPlayerPlay from "@tabler/icons-svelte/icons/player-play";
 import IconDots from "@tabler/icons-svelte/icons/dots";
 import IconEdit from "@tabler/icons-svelte/icons/edit";
 import IconX from "@tabler/icons-svelte/icons/x";

 const todos = $derived(todoState.filteredTodos);
 const stats = $derived(todoState.stats);
 const categories = $derived(todoState.categories);
 const priorities = $derived(todoState.priorities);
 const filter = $derived(todoState.filter);

 let newTodoText = $state("");
 let newTodoPriority = $state<TodoPriority>("medium");
 let newTodoCategoryId = $state<string | undefined>(undefined);
 let expandedTodos = $state<Set<string>>(new Set());
 let showCategoryFilter = $state(false);
 let showCategoryManager = $state(false);
 let showPriorityManager = $state(false);
 let editingTodoId = $state<string | null>(null);
 let editingText = $state("");
 let editingPriority = $state<TodoPriority>("medium");
 let editingCategoryId = $state<string | undefined>(undefined);
 let newCategoryName = $state("");
 let newCategoryIcon = $state("");
 let newCategoryColor = $state("#cba6f7");
 let newPriorityLabel = $state("");
 let newPriorityColor = $state("#cba6f7");
 let newPriorityOrder = $state(10);

 function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "203, 166, 247";
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
 }

 function handleAddTodo() {
  if (!newTodoText.trim()) return;
  addTodo(newTodoText, {
   priority: newTodoPriority,
   categoryId: newTodoCategoryId,
  });
  newTodoText = "";
  newTodoPriority = "medium";
  newTodoCategoryId = undefined;
 }

 function startEditing(todo: Todo) {
  editingTodoId = todo.id;
  editingText = todo.text;
  editingPriority = todo.priority;
  editingCategoryId = todo.categoryId;
 }

 function cancelEditing() {
  editingTodoId = null;
  editingText = "";
  editingPriority = "medium";
  editingCategoryId = undefined;
 }

 function saveEditing(todoId: string) {
  if (!editingText.trim()) return;
  updateTodo(todoId, {
   text: editingText,
   priority: editingPriority,
   categoryId: editingCategoryId,
  });
  cancelEditing();
 }

 function handleAddCategory() {
  if (!newCategoryName.trim() || !newCategoryIcon.trim()) return;
  addCategory(newCategoryName, newCategoryIcon, hexToRgb(newCategoryColor));
  newCategoryName = "";
  newCategoryIcon = "";
  newCategoryColor = "#cba6f7";
 }

 function handleDeleteCategory(id: string) {
  if (confirm("Delete this category? Todos using it will have no category.")) {
   deleteCategory(id);
  }
 }

 function handleAddPriority() {
  if (!newPriorityLabel.trim()) return;
  addPriority(newPriorityLabel, hexToRgb(newPriorityColor), newPriorityOrder);
  newPriorityLabel = "";
  newPriorityColor = "#cba6f7";
  newPriorityOrder = 10;
 }

 function handleDeletePriority(id: string) {
  if (confirm("Delete this priority? Todos using it will be reassigned.")) {
   deletePriority(id);
  }
 }

 function toggleExpanded(id: string) {
  if (expandedTodos.has(id)) {
   expandedTodos.delete(id);
  } else {
   expandedTodos.add(id);
  }
  expandedTodos = new Set(expandedTodos);
 }

 function handleStartFocus(todo: Todo) {
  startSession("focus", todo.text);
 }

 function getPriorityColor(priority: TodoPriority): string {
  const priorityObj = priorities.find((p) => p.id === priority);
  return priorityObj?.color || "203, 166, 247";
 }

 function getPriorityLabel(priority: TodoPriority): string {
  const priorityObj = priorities.find((p) => p.id === priority);
  return priorityObj?.label || priority;
 }

 function formatDueDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
 }

 function isOverdue(timestamp: number): boolean {
  return timestamp < Date.now();
 }
</script>

<div class="todo-window">
 <!-- Header -->
 <div class="todo-header">
  <div class="header-top">
   <h2 class="title">
    <span class="icon">✅</span>
    Tasks
   </h2>
   <div class="count">
    <span class="count-value">{stats.completed}</span>
    <span class="count-label">/{stats.total}</span>
   </div>
  </div>

  <!-- Add todo form -->
  <div class="add-todo-section">
   <div class="add-todo">
    <input
     type="text"
     bind:value={newTodoText}
     placeholder="What needs to be done?"
     onkeydown={(e) => e.key === "Enter" && handleAddTodo()}
     class="todo-input"
    />
    <button onclick={handleAddTodo} class="add-button" aria-label="Add todo">
     <IconPlus size={20} stroke={2} />
    </button>
   </div>
   <div class="add-options">
    <select bind:value={newTodoPriority} class="priority-select">
     {#each [...priorities].sort((a, b) => a.order - b.order) as priority}
      <option value={priority.id}>{priority.label}</option>
     {/each}
    </select>
    <select bind:value={newTodoCategoryId} class="category-select">
     <option value={undefined}>No Category</option>
     {#each categories as category}
      <option value={category.id}>{category.icon} {category.name}</option>
     {/each}
    </select>
   </div>
  </div>

  <!-- Filters -->
  <div class="filters">
   <button
    class="filter-btn"
    class:active={showCategoryFilter}
    onclick={() => (showCategoryFilter = !showCategoryFilter)}
   >
    <span>Categories</span>
    <IconChevronDown size={16} stroke={1.5} />
   </button>

   <button
    class="filter-btn"
    class:active={showCategoryManager}
    onclick={() => (showCategoryManager = !showCategoryManager)}
   >
    <span>Categories</span>
    <IconDots size={16} stroke={1.5} />
   </button>

   <button
    class="filter-btn"
    class:active={showPriorityManager}
    onclick={() => (showPriorityManager = !showPriorityManager)}
   >
    <span>Priorities</span>
    <IconDots size={16} stroke={1.5} />
   </button>

   <label class="checkbox-label">
    <input
     type="checkbox"
     checked={filter.showCompleted}
     onchange={(e) => setFilter({ showCompleted: e.currentTarget.checked })}
    />
    <span>Show completed</span>
   </label>

   {#if stats.completed > 0}
    <button class="filter-btn danger" onclick={deleteCompletedTodos}>
     <IconTrash size={16} stroke={1.5} />
     <span>Clear completed</span>
    </button>
   {/if}
  </div>

  <!-- Category filter dropdown -->
  {#if showCategoryFilter}
   <div class="category-filter">
    <button
     class="category-chip"
     class:active={!filter.categoryId}
     onclick={() => setFilter({ categoryId: undefined })}
    >
     <span>All</span>
    </button>
    {#each categories as category}
     <button
      class="category-chip"
      class:active={filter.categoryId === category.id}
      style="--category-color: {category.color}"
      onclick={() => setFilter({ categoryId: category.id })}
     >
      <span>{category.icon}</span>
      <span>{category.name}</span>
     </button>
    {/each}
   </div>
  {/if}

  <!-- Category manager -->
  {#if showCategoryManager}
   <div class="category-manager">
    <h3 class="manager-title">Manage Categories</h3>

    <!-- Add new category -->
    <div class="add-category-form">
     <input
      type="text"
      bind:value={newCategoryName}
      placeholder="Category name"
      class="manager-input"
     />
     <input
      type="text"
      bind:value={newCategoryIcon}
      placeholder="Icon (emoji)"
      class="manager-input icon-input"
      maxlength="2"
     />
     <input
      type="color"
      bind:value={newCategoryColor}
      class="manager-input color-input"
      title="Pick a color"
     />
     <button class="add-category-btn" onclick={handleAddCategory}>
      <IconPlus size={16} stroke={2} />
     </button>
    </div>

    <!-- Category list -->
    <div class="category-list">
     {#each categories as category}
      <div class="category-item" style="--category-color: {category.color}">
       <span class="category-item-icon">{category.icon}</span>
       <span class="category-item-name">{category.name}</span>
       {#if category.preset}
        <span class="preset-badge">Preset</span>
       {/if}
       <button
        class="delete-category-btn"
        onclick={() => handleDeleteCategory(category.id)}
       >
        <IconTrash size={14} stroke={1.5} />
       </button>
      </div>
     {/each}
    </div>
   </div>
  {/if}

  <!-- Priority manager -->
  {#if showPriorityManager}
   <div class="priority-manager">
    <h3 class="manager-title">Manage Priorities</h3>

    <!-- Add new priority -->
    <div class="add-priority-form">
     <input
      type="text"
      bind:value={newPriorityLabel}
      placeholder="Priority label"
      class="manager-input"
     />
     <input
      type="color"
      bind:value={newPriorityColor}
      class="manager-input color-input"
      title="Pick a color"
     />
     <input
      type="number"
      bind:value={newPriorityOrder}
      placeholder="Order"
      class="manager-input order-input"
      min="0"
     />
     <button class="add-priority-btn" onclick={handleAddPriority}>
      <IconPlus size={16} stroke={2} />
     </button>
    </div>

    <!-- Priority list -->
    <div class="priority-list">
     {#each [...priorities].sort((a, b) => a.order - b.order) as priority}
      <div class="priority-item" style="--priority-color: {priority.color}">
       <span class="priority-item-order">#{priority.order}</span>
       <span class="priority-item-name">{priority.label}</span>
       {#if priority.preset}
        <span class="preset-badge">Preset</span>
       {/if}
       <button
        class="delete-priority-btn"
        onclick={() => handleDeletePriority(priority.id)}
       >
        <IconTrash size={14} stroke={1.5} />
       </button>
      </div>
     {/each}
    </div>
   </div>
  {/if}
 </div>

 <!-- Todo list -->
 <div class="todo-list">
  {#if todos.length === 0}
   <div class="empty-state">
    <span class="empty-icon">📝</span>
    <p>
     {#if filter.showCompleted || filter.categoryId || filter.search}
      No tasks match your filters
     {:else}
      No tasks yet. Add one above!
     {/if}
    </p>
   </div>
  {:else}
   {#each todos as todo (todo.id)}
    {@const isExpanded = expandedTodos.has(todo.id)}
    {@const category = categories.find((c) => c.id === todo.categoryId)}
    <div class="todo-item" class:completed={todo.completed}>
     <div class="todo-main">
      <!-- Checkbox -->
      <button
       class="todo-checkbox"
       onclick={() => toggleTodo(todo.id)}
       aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
      >
       {#if todo.completed}
        <IconCheck size={18} stroke={2.5} />
       {/if}
      </button>

      <!-- Content -->
      <div class="todo-content">
       {#if editingTodoId === todo.id}
        <!-- Edit Mode -->
        <div class="edit-form">
         <input
          type="text"
          bind:value={editingText}
          class="edit-input"
          onkeydown={(e) => {
           if (e.key === "Enter") saveEditing(todo.id);
           if (e.key === "Escape") cancelEditing();
          }}
          autofocus
         />
         <div class="edit-options">
          <select bind:value={editingPriority} class="edit-priority-select">
           {#each [...priorities].sort((a, b) => a.order - b.order) as priority}
            <option value={priority.id}>{priority.label}</option>
           {/each}
          </select>
          <select bind:value={editingCategoryId} class="edit-category-select">
           <option value={undefined}>None</option>
           {#each categories as category}
            <option value={category.id}>{category.icon} {category.name}</option>
           {/each}
          </select>
         </div>
         <div class="edit-actions">
          <button class="edit-save-btn" onclick={() => saveEditing(todo.id)}>
           <IconCheck size={14} stroke={2} />
           Save
          </button>
          <button class="edit-cancel-btn" onclick={cancelEditing}>
           <IconX size={14} stroke={2} />
           Cancel
          </button>
         </div>
        </div>
       {:else}
        <!-- View Mode -->
        <div class="todo-text-row">
         <span class="todo-text">{todo.text}</span>
         {#if todo.subtasks.length > 0}
          <button
           class="expand-btn"
           onclick={() => toggleExpanded(todo.id)}
           aria-label={isExpanded ? "Collapse" : "Expand"}
          >
           {#if isExpanded}
            <IconChevronDown size={16} stroke={1.5} />
           {:else}
            <IconChevronRight size={16} stroke={1.5} />
           {/if}
          </button>
         {/if}
        </div>
       {/if}

       <div class="todo-meta">
        <!-- Priority -->
        <span
         class="priority-badge"
         style="--priority-color: {getPriorityColor(todo.priority)}"
        >
         <IconFlag size={12} stroke={2} />
         <span>{getPriorityLabel(todo.priority)}</span>
        </span>

        <!-- Category -->
        {#if category}
         <span
          class="category-badge"
          style="--category-color: {category.color}"
         >
          <span>{category.icon}</span>
          <span>{category.name}</span>
         </span>
        {/if}

        <!-- Due date -->
        {#if todo.dueDate}
         <span class="due-badge" class:overdue={isOverdue(todo.dueDate)}>
          <IconClock size={12} stroke={2} />
          <span>{formatDueDate(todo.dueDate)}</span>
         </span>
        {/if}

        <!-- Pomodoro count -->
        {#if todo.pomodoroCount && todo.pomodoroCount > 0}
         <span class="pomodoro-badge">
          🍅 {todo.pomodoroCount}
         </span>
        {/if}

        <!-- Subtask progress -->
        {#if todo.subtasks.length > 0}
         <span class="subtask-badge">
          {todo.subtasks.filter((s) => s.completed).length}/{todo.subtasks
           .length}
         </span>
        {/if}
       </div>
      </div>

      <!-- Actions -->
      <div class="todo-actions">
       {#if editingTodoId !== todo.id}
        <button
         class="action-btn"
         onclick={() => startEditing(todo)}
         title="Edit todo"
        >
         <IconEdit size={16} stroke={1.5} />
        </button>
        <button
         class="action-btn"
         onclick={() => handleStartFocus(todo)}
         title="Start focus session"
        >
         <IconPlayerPlay size={16} stroke={1.5} />
        </button>
        <button
         class="action-btn danger"
         onclick={() => deleteTodo(todo.id)}
         title="Delete todo"
        >
         <IconTrash size={16} stroke={1.5} />
        </button>
       {/if}
      </div>
     </div>

     <!-- Subtasks -->
     {#if isExpanded && todo.subtasks.length > 0}
      <div class="subtasks">
       {#each todo.subtasks as subtask (subtask.id)}
        <div class="subtask-item">
         <button
          class="subtask-checkbox"
          onclick={() => toggleSubtask(todo.id, subtask.id)}
         >
          {#if subtask.completed}
           <IconCheck size={14} stroke={2.5} />
          {/if}
         </button>
         <span class="subtask-text" class:completed={subtask.completed}>
          {subtask.text}
         </span>
         <button
          class="subtask-delete"
          onclick={() => deleteSubtask(todo.id, subtask.id)}
         >
          <IconTrash size={14} stroke={1.5} />
         </button>
        </div>
       {/each}
      </div>
     {/if}
    </div>
   {/each}
  {/if}
 </div>
</div>

<style>
 .todo-window {
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

 .todo-header {
  padding: 20px;
  border-bottom: 2px solid rgba(203, 166, 247, 0.2);
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: rgba(17, 17, 27, 0.3);
  flex: 0 1 auto;
  max-height: 50%;
  overflow-y: auto;
 }

 .todo-header::-webkit-scrollbar {
  width: 8px;
 }

 .todo-header::-webkit-scrollbar-track {
  background: rgba(17, 17, 27, 0.4);
  border-radius: 4px;
 }

 .todo-header::-webkit-scrollbar-thumb {
  background: rgba(203, 166, 247, 0.3);
  border-radius: 4px;
 }

 .todo-header::-webkit-scrollbar-thumb:hover {
  background: rgba(203, 166, 247, 0.5);
 }

 .header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
 }

 .title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: 700;
  color: #cba6f7;
  margin: 0;
 }

 .count {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 14px;
  padding: 6px 12px;
  background: rgba(203, 166, 247, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(203, 166, 247, 0.2);
 }

 .count-value {
  font-weight: 700;
  font-size: 18px;
  color: #cba6f7;
 }

 .count-label {
  color: #9399b2;
  font-size: 16px;
 }

 .add-todo-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .add-todo {
  display: flex;
  gap: 10px;
 }

 .add-options {
  display: flex;
  gap: 8px;
 }

 .priority-select,
 .category-select {
  flex: 1;
  padding: 8px 12px;
  background: rgba(17, 17, 27, 0.6);
  border: 1px solid rgba(203, 166, 247, 0.3);
  border-radius: 8px;
  color: #cdd6f4;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
 }

 .priority-select:focus,
 .category-select:focus {
  outline: none;
  border-color: #cba6f7;
  box-shadow: 0 0 15px rgba(203, 166, 247, 0.2);
 }

 .todo-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(17, 17, 27, 0.6);
  border: 2px solid rgba(203, 166, 247, 0.3);
  border-radius: 10px;
  color: #cdd6f4;
  font-size: 14px;
  transition: all 0.3s;
 }

 .todo-input:focus {
  outline: none;
  border-color: #cba6f7;
  box-shadow: 0 0 20px rgba(203, 166, 247, 0.3);
 }

 .add-button {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #cba6f7, #f5c2e7);
  border: none;
  border-radius: 10px;
  color: #1e1e2e;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
 }

 .add-button:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(203, 166, 247, 0.4);
 }

 .filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
 }

 .filter-btn {
  padding: 8px 12px;
  background: rgba(203, 166, 247, 0.1);
  border: 1px solid rgba(203, 166, 247, 0.3);
  border-radius: 8px;
  color: #cdd6f4;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
 }

 .filter-btn:hover {
  background: rgba(203, 166, 247, 0.2);
 }

 .filter-btn.active {
  background: rgba(203, 166, 247, 0.3);
  border-color: #cba6f7;
 }

 .filter-btn.danger {
  background: rgba(243, 139, 168, 0.1);
  border-color: rgba(243, 139, 168, 0.3);
  color: #f38ba8;
 }

 .checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
 }

 .checkbox-label input {
  cursor: pointer;
 }

 .category-filter {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px;
  background: rgba(17, 17, 27, 0.6);
  border-radius: 8px;
 }

 .category-chip {
  padding: 6px 12px;
  background: rgba(var(--category-color, 203, 166, 247), 0.1);
  border: 1px solid rgba(var(--category-color, 203, 166, 247), 0.3);
  border-radius: 20px;
  color: #cdd6f4;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;
 }

 .category-chip:hover {
  background: rgba(var(--category-color, 203, 166, 247), 0.2);
 }

 .category-chip.active {
  background: rgba(var(--category-color, 203, 166, 247), 0.3);
  border-width: 2px;
 }

 .category-manager {
  padding: 15px;
  background: rgba(17, 17, 27, 0.6);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
 }

 .manager-title {
  font-size: 14px;
  font-weight: 600;
  color: #cba6f7;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
 }

 .add-category-form {
  display: flex;
  gap: 6px;
 }

 .manager-input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(17, 17, 27, 0.6);
  border: 1px solid rgba(203, 166, 247, 0.3);
  border-radius: 6px;
  color: #cdd6f4;
  font-size: 12px;
 }

 .manager-input:focus {
  outline: none;
  border-color: #cba6f7;
  box-shadow: 0 0 10px rgba(203, 166, 247, 0.2);
 }

 .manager-input.icon-input {
  max-width: 60px;
  text-align: center;
 }

 .manager-input.color-input {
  width: 60px;
  padding: 4px;
  cursor: pointer;
  height: 36px;
 }

 .add-category-btn {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #cba6f7, #f5c2e7);
  border: none;
  border-radius: 6px;
  color: #1e1e2e;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
 }

 .add-category-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(203, 166, 247, 0.4);
 }

 .category-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
 }

 .category-list::-webkit-scrollbar {
  width: 6px;
 }

 .category-list::-webkit-scrollbar-track {
  background: rgba(17, 17, 27, 0.4);
  border-radius: 3px;
 }

 .category-list::-webkit-scrollbar-thumb {
  background: rgba(203, 166, 247, 0.3);
  border-radius: 3px;
 }

 .category-list::-webkit-scrollbar-thumb:hover {
  background: rgba(203, 166, 247, 0.5);
 }

 .category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(var(--category-color), 0.1);
  border: 1px solid rgba(var(--category-color), 0.3);
  border-radius: 6px;
 }

 .category-item-icon {
  font-size: 16px;
 }

 .category-item-name {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: #cdd6f4;
 }

 .preset-badge {
  padding: 2px 8px;
  background: rgba(137, 180, 250, 0.2);
  border: 1px solid rgba(137, 180, 250, 0.3);
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  color: #89b4fa;
  text-transform: uppercase;
 }

 .delete-category-btn {
  background: rgba(243, 139, 168, 0.1);
  border: 1px solid rgba(243, 139, 168, 0.3);
  border-radius: 4px;
  color: #f38ba8;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
 }

 .delete-category-btn:hover {
  background: rgba(243, 139, 168, 0.2);
  transform: scale(1.1);
 }

 .priority-manager {
  padding: 15px;
  background: rgba(17, 17, 27, 0.6);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
 }

 .add-priority-form {
  display: flex;
  gap: 6px;
 }

 .manager-input.order-input {
  max-width: 80px;
 }

 .add-priority-btn {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #cba6f7, #f5c2e7);
  border: none;
  border-radius: 6px;
  color: #1e1e2e;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
 }

 .add-priority-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(203, 166, 247, 0.4);
 }

 .priority-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
 }

 .priority-list::-webkit-scrollbar {
  width: 6px;
 }

 .priority-list::-webkit-scrollbar-track {
  background: rgba(17, 17, 27, 0.4);
  border-radius: 3px;
 }

 .priority-list::-webkit-scrollbar-thumb {
  background: rgba(203, 166, 247, 0.3);
  border-radius: 3px;
 }

 .priority-list::-webkit-scrollbar-thumb:hover {
  background: rgba(203, 166, 247, 0.5);
 }

 .priority-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(var(--priority-color), 0.1);
  border: 1px solid rgba(var(--priority-color), 0.3);
  border-radius: 6px;
 }

 .priority-item-order {
  font-size: 12px;
  font-weight: 600;
  color: #9399b2;
  font-family: monospace;
 }

 .priority-item-name {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: #cdd6f4;
 }

 .delete-priority-btn {
  background: rgba(243, 139, 168, 0.1);
  border: 1px solid rgba(243, 139, 168, 0.3);
  border-radius: 4px;
  color: #f38ba8;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
 }

 .delete-priority-btn:hover {
  background: rgba(243, 139, 168, 0.2);
  transform: scale(1.1);
 }

 .todo-list {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .todo-list::-webkit-scrollbar {
  width: 8px;
 }

 .todo-list::-webkit-scrollbar-track {
  background: rgba(17, 17, 27, 0.4);
  border-radius: 4px;
 }

 .todo-list::-webkit-scrollbar-thumb {
  background: rgba(203, 166, 247, 0.3);
  border-radius: 4px;
 }

 .todo-list::-webkit-scrollbar-thumb:hover {
  background: rgba(203, 166, 247, 0.5);
 }

 .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c7086;
 }

 .empty-icon {
  font-size: 64px;
  margin-bottom: 15px;
  opacity: 0.5;
 }

 .todo-item {
  background: rgba(203, 166, 247, 0.05);
  border: 1px solid rgba(203, 166, 247, 0.2);
  border-radius: 10px;
  transition: all 0.3s;
 }

 .todo-item:hover {
  background: rgba(203, 166, 247, 0.1);
  border-color: rgba(203, 166, 247, 0.3);
  transform: translateX(4px);
 }

 .todo-item.completed {
  opacity: 0.6;
 }

 .todo-main {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
 }

 .todo-checkbox {
  width: 22px;
  height: 22px;
  min-width: 22px;
  border: 2px solid rgba(203, 166, 247, 0.5);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e1e2e;
  margin-top: 2px;
 }

 .todo-checkbox:hover {
  border-color: #cba6f7;
  background: rgba(203, 166, 247, 0.2);
 }

 .todo-checkbox:has(svg) {
  background: linear-gradient(135deg, #cba6f7, #f5c2e7);
  border-color: #cba6f7;
 }

 .todo-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
 }

 .todo-text-row {
  display: flex;
  align-items: center;
  gap: 8px;
 }

 .todo-text {
  font-size: 14px;
  color: #cdd6f4;
  line-height: 1.5;
 }

 .todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #6c7086;
 }

 .edit-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
 }

 .edit-input {
  padding: 8px 12px;
  background: rgba(17, 17, 27, 0.6);
  border: 2px solid #cba6f7;
  border-radius: 6px;
  color: #cdd6f4;
  font-size: 14px;
  transition: all 0.3s;
 }

 .edit-input:focus {
  outline: none;
  box-shadow: 0 0 15px rgba(203, 166, 247, 0.3);
 }

 .edit-options {
  display: flex;
  gap: 6px;
 }

 .edit-priority-select,
 .edit-category-select {
  flex: 1;
  padding: 6px 10px;
  background: rgba(17, 17, 27, 0.6);
  border: 1px solid rgba(203, 166, 247, 0.3);
  border-radius: 6px;
  color: #cdd6f4;
  font-size: 12px;
  cursor: pointer;
 }

 .edit-actions {
  display: flex;
  gap: 6px;
 }

 .edit-save-btn,
 .edit-cancel-btn {
  flex: 1;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
 }

 .edit-save-btn {
  background: linear-gradient(135deg, #a6e3a1, #94e2d5);
  color: #1e1e2e;
 }

 .edit-save-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(166, 227, 161, 0.4);
 }

 .edit-cancel-btn {
  background: rgba(243, 139, 168, 0.2);
  border: 1px solid rgba(243, 139, 168, 0.3);
  color: #f38ba8;
 }

 .edit-cancel-btn:hover {
  background: rgba(243, 139, 168, 0.3);
 }

 .expand-btn {
  background: transparent;
  border: none;
  color: #9399b2;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
 }

 .expand-btn:hover {
  color: #cba6f7;
 }

 .todo-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
 }

 .priority-badge,
 .category-badge,
 .due-badge,
 .pomodoro-badge,
 .subtask-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
 }

 .priority-badge {
  background: rgba(var(--priority-color), 0.2);
  border: 1px solid rgba(var(--priority-color), 0.4);
  color: rgb(var(--priority-color));
 }

 .category-badge {
  background: rgba(var(--category-color), 0.2);
  border: 1px solid rgba(var(--category-color), 0.4);
 }

 .due-badge {
  background: rgba(137, 180, 250, 0.2);
  border: 1px solid rgba(137, 180, 250, 0.4);
  color: #89b4fa;
 }

 .due-badge.overdue {
  background: rgba(243, 139, 168, 0.2);
  border-color: rgba(243, 139, 168, 0.4);
  color: #f38ba8;
 }

 .pomodoro-badge {
  background: rgba(243, 139, 168, 0.2);
  border: 1px solid rgba(243, 139, 168, 0.4);
 }

 .subtask-badge {
  background: rgba(166, 227, 161, 0.2);
  border: 1px solid rgba(166, 227, 161, 0.4);
  color: #a6e3a1;
 }

 .todo-actions {
  display: flex;
  gap: 6px;
 }

 .action-btn {
  width: 32px;
  height: 32px;
  background: rgba(203, 166, 247, 0.1);
  border: 1px solid rgba(203, 166, 247, 0.3);
  border-radius: 6px;
  color: #cdd6f4;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
 }

 .action-btn:hover {
  background: rgba(203, 166, 247, 0.2);
  transform: scale(1.1);
 }

 .action-btn.danger {
  background: rgba(243, 139, 168, 0.1);
  border-color: rgba(243, 139, 168, 0.3);
  color: #f38ba8;
 }

 .subtasks {
  padding: 0 15px 15px 49px;
  display: flex;
  flex-direction: column;
  gap: 8px;
 }

 .subtask-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(17, 17, 27, 0.4);
  border-radius: 6px;
 }

 .subtask-checkbox {
  width: 18px;
  height: 18px;
  min-width: 18px;
  border: 2px solid rgba(203, 166, 247, 0.5);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e1e2e;
 }

 .subtask-checkbox:has(svg) {
  background: linear-gradient(135deg, #cba6f7, #f5c2e7);
  border-color: #cba6f7;
 }

 .subtask-text {
  flex: 1;
  font-size: 13px;
  color: #cdd6f4;
 }

 .subtask-text.completed {
  text-decoration: line-through;
  color: #6c7086;
 }

 .subtask-delete {
  background: transparent;
  border: none;
  color: #9399b2;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
 }

 .subtask-delete:hover {
  color: #f38ba8;
 }

 /* Mobile */
 @media (max-width: 768px) {
  .todo-header {
   padding: 15px;
  }

  .title {
   font-size: 20px;
  }

  .todo-list {
   padding: 15px;
  }

  .todo-actions {
   flex-direction: column;
  }
 }
</style>
