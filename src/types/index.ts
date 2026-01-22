// src/types/index.ts

// === TASK TYPES ===
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export type TaskCategory = 
  | 'work' 
  | 'personal' 
  | 'shopping' 
  | 'health' 
  | 'finance' 
  | 'birthday' 
  | 'call'
  | 'other';

export type TaskStatus = 'pending' | 'completed' | 'overdue';

export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string; // ISO string
  dueTime?: string; // HH:mm format
  reminder?: string; // ISO string for reminder time
  repeat: RepeatType;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  subtasks?: Subtask[];
  tags?: string[];
  listId?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

// === LIST/CATEGORY TYPES ===
export interface TaskList {
  id: string;
  name: string;
  icon: string;
  color: string;
  taskCount: number;
  completedCount: number;
  createdAt: string;
}

// === USER TYPES ===
export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  telegramId?: number;
  createdAt: string;
  settings: UserSettings;
  stats: UserStats;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'ru' | 'en' | 'uz';
  notifications: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  defaultPriority: TaskPriority;
  defaultCategory: TaskCategory;
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  streak: number; // days in a row with completed tasks
  longestStreak: number;
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  tasksCompletedThisMonth: number;
}

// === CALENDAR TYPES ===
export interface CalendarDay {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  isSelected: boolean;
  tasks: Task[];
  hasEvents: boolean;
}

// === FILTER TYPES ===
export interface TaskFilters {
  status?: TaskStatus | 'all';
  category?: TaskCategory | 'all';
  priority?: TaskPriority | 'all';
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
  listId?: string;
}

// === UI TYPES ===
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  type: 'addTask' | 'editTask' | 'taskDetails' | 'confirm' | null;
  data?: any;
}

// === LOCALIZATION ===
export type Locale = 'ru' | 'en' | 'uz';

export interface LocaleMessages {
  [key: string]: string | LocaleMessages;
}

