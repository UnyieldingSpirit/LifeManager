// src/store/transactionStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Transaction, 
  TransactionInput, 
  TransactionFilters,
  TransactionType 
} from '@/types/finance';

// ============================================================================
// ТИПЫ
// ============================================================================

interface TransactionState {
  transactions: Transaction[];
  filters: TransactionFilters;
  
  // CRUD операции
  addTransaction: (input: TransactionInput) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Фильтрация
  setFilters: (filters: TransactionFilters) => void;
  clearFilters: () => void;
  
  // Геттеры (вычисляемые значения)
  getFilteredTransactions: () => Transaction[];
  getTransactionsByDate: (date: string) => Transaction[];
  getTransactionsByCategory: (categoryId: string) => Transaction[];
  getTransactionsByPeriod: (start: string, end: string) => Transaction[];
  
  // Статистика
  getTotalByType: (type: TransactionType, period?: { start: string; end: string }) => number;
  getSpentThisMonth: () => number;
  getIncomeThisMonth: () => number;
  getDailyAverage: (days?: number) => number;
  getCategoryStats: (period?: { start: string; end: string }) => Map<string, number>;
  
  // Утилиты
  importTransactions: (transactions: Transaction[]) => void;
  exportTransactions: () => Transaction[];
  clearAllTransactions: () => void;
}

// ============================================================================
// ХЕЛПЕРЫ
// ============================================================================

const generateId = (): string => {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getStartOfMonth = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
};

const getEndOfMonth = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
};

const isWithinPeriod = (date: string, start: string, end: string): boolean => {
  const d = new Date(date).getTime();
  return d >= new Date(start).getTime() && d <= new Date(end).getTime();
};

const defaultFilters: TransactionFilters = {
  type: 'all',
  category: 'all',
  dateRange: undefined,
  searchQuery: '',
};

// ============================================================================
// STORE
// ============================================================================

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      filters: defaultFilters,
      
      // ========== CRUD ==========
      addTransaction: (input) => {
        const now = new Date().toISOString();
        const newTransaction: Transaction = {
          id: generateId(),
          type: input.type,
          amount: input.amount,
          category: input.category,
          description: input.description || '',
          date: input.date || now,
          isRecurring: input.isRecurring || false,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
        
        return newTransaction;
      },
      
      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },
      
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },
      
      // ========== ФИЛЬТРАЦИЯ ==========
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },
      
      clearFilters: () => {
        set({ filters: defaultFilters });
      },
      
      getFilteredTransactions: () => {
        const { transactions, filters } = get();
        
        return transactions.filter((t) => {
          // Фильтр по типу
          if (filters.type && filters.type !== 'all' && t.type !== filters.type) {
            return false;
          }
          
          // Фильтр по категории
          if (filters.category && filters.category !== 'all' && t.category !== filters.category) {
            return false;
          }
          
          // Фильтр по дате
          if (filters.dateRange) {
            if (!isWithinPeriod(t.date, filters.dateRange.start, filters.dateRange.end)) {
              return false;
            }
          }
          
          // Фильтр по поиску
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            const matchesDescription = t.description.toLowerCase().includes(query);
            const matchesCategory = t.category.toLowerCase().includes(query);
            if (!matchesDescription && !matchesCategory) {
              return false;
            }
          }
          
          // Фильтр по сумме
          if (filters.minAmount !== undefined && t.amount < filters.minAmount) {
            return false;
          }
          if (filters.maxAmount !== undefined && t.amount > filters.maxAmount) {
            return false;
          }
          
          return true;
        });
      },
      
      getTransactionsByDate: (date) => {
        const { transactions } = get();
        const targetDate = new Date(date).toDateString();
        return transactions.filter(
          (t) => new Date(t.date).toDateString() === targetDate
        );
      },
      
      getTransactionsByCategory: (categoryId) => {
        const { transactions } = get();
        return transactions.filter((t) => t.category === categoryId);
      },
      
      getTransactionsByPeriod: (start, end) => {
        const { transactions } = get();
        return transactions.filter((t) => isWithinPeriod(t.date, start, end));
      },
      
      // ========== СТАТИСТИКА ==========
      getTotalByType: (type, period) => {
        const { transactions } = get();
        
        let filtered = transactions.filter((t) => t.type === type);
        
        if (period) {
          filtered = filtered.filter((t) => 
            isWithinPeriod(t.date, period.start, period.end)
          );
        }
        
        return filtered.reduce((sum, t) => sum + t.amount, 0);
      },
      
      getSpentThisMonth: () => {
        const { getTotalByType } = get();
        return getTotalByType('expense', {
          start: getStartOfMonth(),
          end: getEndOfMonth(),
        });
      },
      
      getIncomeThisMonth: () => {
        const { getTotalByType } = get();
        return getTotalByType('income', {
          start: getStartOfMonth(),
          end: getEndOfMonth(),
        });
      },
      
      getDailyAverage: (days = 30) => {
        const { transactions } = get();
        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - days);
        
        const expenses = transactions.filter(
          (t) => 
            t.type === 'expense' && 
            isWithinPeriod(t.date, startDate.toISOString(), now.toISOString())
        );
        
        const total = expenses.reduce((sum, t) => sum + t.amount, 0);
        return Math.round(total / days);
      },
      
      getCategoryStats: (period) => {
        const { transactions } = get();
        const stats = new Map<string, number>();
        
        let filtered = transactions.filter((t) => t.type === 'expense');
        
        if (period) {
          filtered = filtered.filter((t) => 
            isWithinPeriod(t.date, period.start, period.end)
          );
        }
        
        filtered.forEach((t) => {
          const current = stats.get(t.category) || 0;
          stats.set(t.category, current + t.amount);
        });
        
        return stats;
      },
      
      // ========== УТИЛИТЫ ==========
      importTransactions: (newTransactions) => {
        set((state) => ({
          transactions: [...newTransactions, ...state.transactions],
        }));
      },
      
      exportTransactions: () => {
        return get().transactions;
      },
      
      clearAllTransactions: () => {
        set({ transactions: [] });
      },
    }),
    {
      name: 'lifeledger-transactions',
    }
  )
);

// ============================================================================
// СЕЛЕКТОРЫ (для оптимизации ре-рендеров)
// ============================================================================

export const selectTransactions = (state: TransactionState) => state.transactions;
export const selectFilters = (state: TransactionState) => state.filters;
export const selectRecentTransactions = (count: number) => 
  (state: TransactionState) => state.transactions.slice(0, count);