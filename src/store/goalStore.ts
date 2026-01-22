// src/store/goalStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  SavingGoal, 
  GoalInput, 
  GoalContribution,
  GoalStatus,
  GoalPriority 
} from '@/types/finance';

// ============================================================================
// ТИПЫ
// ============================================================================

interface GoalState {
  goals: SavingGoal[];
  
  // CRUD операции
  addGoal: (input: GoalInput) => SavingGoal;
  updateGoal: (id: string, updates: Partial<SavingGoal>) => void;
  deleteGoal: (id: string) => void;
  
  // Работа с накоплениями
  addContribution: (goalId: string, amount: number, note?: string) => void;
  withdrawContribution: (goalId: string, amount: number, note?: string) => void;
  
  // Геттеры
  getGoalById: (id: string) => SavingGoal | undefined;
  getGoalsByStatus: (status: GoalStatus) => SavingGoal[];
  getGoalsByPriority: (priority: GoalPriority) => SavingGoal[];
  getActiveGoals: () => SavingGoal[];
  getCompletedGoals: () => SavingGoal[];
  
  // Статистика
  getTotalSaved: () => number;
  getTotalTarget: () => number;
  getOverallProgress: () => number;
  getGoalStatus: (goal: SavingGoal) => GoalStatus;
  getRecommendedMonthlyContribution: (goal: SavingGoal) => number;
  
  // Утилиты
  reorderGoals: (goalIds: string[]) => void;
}

// ============================================================================
// ХЕЛПЕРЫ
// ============================================================================

const generateId = (): string => {
  return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const defaultColors = [
  '#F97316', // Orange
  '#0EA5E9', // Sky
  '#8B5CF6', // Violet  
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F59E0B', // Amber
];

const defaultIcons = ['🎯', '🏠', '✈️', '🚗', '💰', '📱', '🎓', '💍'];

// ============================================================================
// STORE
// ============================================================================

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: [],
      
      // ========== CRUD ==========
      addGoal: (input) => {
        const now = new Date().toISOString();
        const existingGoals = get().goals;
        
        const newGoal: SavingGoal = {
          id: generateId(),
          name: input.name,
          targetAmount: input.targetAmount,
          currentAmount: input.currentAmount || 0,
          deadline: input.deadline,
          icon: input.icon || defaultIcons[existingGoals.length % defaultIcons.length],
          color: input.color || defaultColors[existingGoals.length % defaultColors.length],
          priority: input.priority || 'medium',
          createdAt: now,
          updatedAt: now,
          contributions: [],
        };
        
        // Если есть начальная сумма, добавляем как первый взнос
        if (input.currentAmount && input.currentAmount > 0) {
          newGoal.contributions.push({
            id: generateId(),
            amount: input.currentAmount,
            date: now,
            note: 'Начальный взнос',
          });
        }
        
        set((state) => ({
          goals: [...state.goals, newGoal],
        }));
        
        return newGoal;
      },
      
      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id
              ? { ...g, ...updates, updatedAt: new Date().toISOString() }
              : g
          ),
        }));
      },
      
      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        }));
      },
      
      // ========== РАБОТА С НАКОПЛЕНИЯМИ ==========
      addContribution: (goalId, amount, note) => {
        const now = new Date().toISOString();
        const contribution: GoalContribution = {
          id: generateId(),
          amount,
          date: now,
          note,
        };
        
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  currentAmount: g.currentAmount + amount,
                  contributions: [...g.contributions, contribution],
                  updatedAt: now,
                }
              : g
          ),
        }));
      },
      
      withdrawContribution: (goalId, amount, note) => {
        const now = new Date().toISOString();
        const contribution: GoalContribution = {
          id: generateId(),
          amount: -amount,
          date: now,
          note: note || 'Снятие средств',
        };
        
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  currentAmount: Math.max(0, g.currentAmount - amount),
                  contributions: [...g.contributions, contribution],
                  updatedAt: now,
                }
              : g
          ),
        }));
      },
      
      // ========== ГЕТТЕРЫ ==========
      getGoalById: (id) => {
        return get().goals.find((g) => g.id === id);
      },
      
      getGoalsByStatus: (status) => {
        const { goals, getGoalStatus } = get();
        return goals.filter((g) => getGoalStatus(g) === status);
      },
      
      getGoalsByPriority: (priority) => {
        return get().goals.filter((g) => g.priority === priority);
      },
      
      getActiveGoals: () => {
        const { goals, getGoalStatus } = get();
        return goals.filter((g) => {
          const status = getGoalStatus(g);
          return status === 'active' || status === 'almost';
        });
      },
      
      getCompletedGoals: () => {
        const { goals, getGoalStatus } = get();
        return goals.filter((g) => getGoalStatus(g) === 'completed');
      },
      
      // ========== СТАТИСТИКА ==========
      getTotalSaved: () => {
        return get().goals.reduce((sum, g) => sum + g.currentAmount, 0);
      },
      
      getTotalTarget: () => {
        return get().goals.reduce((sum, g) => sum + g.targetAmount, 0);
      },
      
      getOverallProgress: () => {
        const { getTotalSaved, getTotalTarget } = get();
        const target = getTotalTarget();
        if (target === 0) return 0;
        return Math.round((getTotalSaved() / target) * 100);
      },
      
      getGoalStatus: (goal) => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        
        if (progress >= 100) return 'completed';
        
        if (goal.deadline) {
          const now = new Date();
          const deadline = new Date(goal.deadline);
          if (deadline < now && progress < 100) return 'overdue';
        }
        
        if (progress >= 90) return 'almost';
        
        return 'active';
      },
      
      getRecommendedMonthlyContribution: (goal) => {
        if (!goal.deadline) return 0;
        
        const now = new Date();
        const deadline = new Date(goal.deadline);
        const monthsRemaining = Math.max(
          1,
          (deadline.getFullYear() - now.getFullYear()) * 12 +
            deadline.getMonth() - now.getMonth()
        );
        
        const remaining = goal.targetAmount - goal.currentAmount;
        if (remaining <= 0) return 0;
        
        return Math.ceil(remaining / monthsRemaining);
      },
      
      // ========== УТИЛИТЫ ==========
      reorderGoals: (goalIds) => {
        set((state) => {
          const goalMap = new Map(state.goals.map((g) => [g.id, g]));
          const reordered = goalIds
            .map((id) => goalMap.get(id))
            .filter((g): g is SavingGoal => g !== undefined);
          
          // Добавляем цели, которые не были в списке
          const remainingGoals = state.goals.filter(
            (g) => !goalIds.includes(g.id)
          );
          
          return { goals: [...reordered, ...remainingGoals] };
        });
      },
    }),
    {
      name: 'lifeledger-goals',
    }
  )
);

// ============================================================================
// СЕЛЕКТОРЫ
// ============================================================================

export const selectGoals = (state: GoalState) => state.goals;
export const selectActiveGoals = (state: GoalState) => {
  return state.goals.filter((g) => {
    const progress = (g.currentAmount / g.targetAmount) * 100;
    return progress < 100;
  });
};
export const selectTotalSaved = (state: GoalState) => 
  state.goals.reduce((sum, g) => sum + g.currentAmount, 0);