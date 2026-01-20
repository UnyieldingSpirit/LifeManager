// src/store/taskStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  Task, 
  TaskCategory, 
  TaskPriority, 
  TaskStatus, 
  RepeatType,
  TaskFilters,
  Subtask
} from '@/types';

interface TaskState {
  tasks: Task[];
  filters: TaskFilters;
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;  // Добавлен правильный метод
  toggleTaskStatus: (id: string) => void;
  
  // Subtasks
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  
  // Filters
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  
  // Getters
  getTasksByDate: (date: string) => Task[];
  getTasksByCategory: (category: TaskCategory) => Task[];
  getTodayTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getUpcomingTasks: (days: number) => Task[];
}

const defaultFilters: TaskFilters = {
  status: 'all',
  category: 'all',
  priority: 'all',
  searchQuery: '',
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      filters: defaultFilters,
      
      addTask: (taskData) => {
        const id = uuidv4();
        const now = new Date().toISOString();
        
        const newTask: Task = {
          ...taskData,
          id,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));
        
        return id;
      },
      
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
      },
      
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },
      
      // Основной метод для переключения статуса задачи
      toggleTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;
            
            const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
            
            return {
              ...task,
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
      
      // Алиас для совместимости
      toggleTaskStatus: (id) => {
        get().toggleTask(id);
      },
      
      addSubtask: (taskId, title) => {
        const subtask: Subtask = {
          id: uuidv4(),
          title,
          completed: false,
        };
        
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: [...(task.subtasks || []), subtask],
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },
      
      toggleSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks?.map((st) =>
                    st.id === subtaskId ? { ...st, completed: !st.completed } : st
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },
      
      deleteSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks?.filter((st) => st.id !== subtaskId),
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },
      
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },
      
      clearFilters: () => {
        set({ filters: defaultFilters });
      },
      
      getTasksByDate: (dateStr) => {
        const { tasks } = get();
        return tasks.filter((task) => {
          if (!task.dueDate) return false;
          return task.dueDate.split('T')[0] === dateStr;
        });
      },
      
      getTasksByCategory: (category) => {
        const { tasks } = get();
        return tasks.filter((task) => task.category === category);
      },
      
      getTodayTasks: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().getTasksByDate(today);
      },
      
      getOverdueTasks: () => {
        const { tasks } = get();
        const now = new Date();
        
        return tasks.filter((task) => {
          if (task.status === 'completed' || !task.dueDate) return false;
          return new Date(task.dueDate) < now;
        });
      },
      
      getUpcomingTasks: (days) => {
        const { tasks } = get();
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        
        return tasks.filter((task) => {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate);
          return taskDate >= now && taskDate <= futureDate;
        });
      },
    }),
    {
      name: 'taskflow-tasks',
    }
  )
);