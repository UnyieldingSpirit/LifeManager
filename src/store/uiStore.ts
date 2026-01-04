// src/store/uiStore.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ModalState, Toast, Task } from '@/types';

interface UIState {
  // Modal
  modal: ModalState;
  openModal: (type: ModalState['type'], data?: any) => void;
  closeModal: () => void;
  
  // Toast
  toasts: Toast[];
  showToast: (type: Toast['type'], message: string, duration?: number) => void;
  addToast: (toast: { type: Toast['type']; message: string; duration?: number }) => void;
  removeToast: (id: string) => void;
  
  // Selected task for viewing/editing
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  
  // Selected date (for calendar)
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  
  // Bottom sheet
  isBottomSheetOpen: boolean;
  bottomSheetContent: 'addTask' | 'taskDetails' | 'filters' | null;
  openBottomSheet: (content: UIState['bottomSheetContent']) => void;
  closeBottomSheet: () => void;
  
  // Loading states
  isLoading: boolean;
  setLoading: (value: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Modal
  modal: { isOpen: false, type: null, data: null },
  
  openModal: (type, data = null) => {
    set({
      modal: { isOpen: true, type, data },
    });
  },
  
  closeModal: () => {
    set({
      modal: { isOpen: false, type: null, data: null },
    });
  },
  
  // Toast
  toasts: [],
  
  showToast: (type, message, duration = 3000) => {
    const id = uuidv4();
    const toast: Toast = { id, type, message, duration };
    
    set((state) => ({
      toasts: [...state.toasts, toast],
    }));
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },
  
  // Алиас для совместимости с AddTaskForm
  addToast: ({ type, message, duration = 3000 }) => {
    get().showToast(type, message, duration);
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  
  // Selected task
  selectedTask: null,
  setSelectedTask: (task) => set({ selectedTask: task }),
  
  // Selected date
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  // Bottom sheet
  isBottomSheetOpen: false,
  bottomSheetContent: null,
  
  openBottomSheet: (content) => {
    set({
      isBottomSheetOpen: true,
      bottomSheetContent: content,
    });
  },
  
  closeBottomSheet: () => {
    set({
      isBottomSheetOpen: false,
      bottomSheetContent: null,
    });
  },
  
  // Loading
  isLoading: false,
  setLoading: (value) => set({ isLoading: value }),
}));