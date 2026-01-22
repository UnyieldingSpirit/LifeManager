// src/app/tasks/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isTomorrow, isPast, parseISO, startOfDay } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import {
  PlusIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  FlagIcon,
  ChevronDownIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';
import type { Task, Priority } from '@/types';

const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: '#EF4444',
  high: '#F97316',
  medium: '#FBBF24',
  low: '#22C55E',
};

const PRIORITY_LABELS = {
  ru: { urgent: 'Срочно', high: 'Высокий', medium: 'Средний', low: 'Низкий' },
  en: { urgent: 'Urgent', high: 'High', medium: 'Medium', low: 'Low' },
};

export default function TasksPage() {
  const { hapticFeedback } = useTelegram();
  
  const profile = useStore((s) => s.profile);
  const tasks = useStore((s) => s.tasks);
  const toggleTaskComplete = useStore((s) => s.toggleTaskComplete);
  const deleteTask = useStore((s) => s.deleteTask);
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  const addToast = useStore((s) => s.addToast);
  
  const language = profile?.settings?.language || 'ru';
  const dateLocale = language === 'ru' ? ru : enUS;
  
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');
  
  // Группировка задач
  const groupedTasks = useMemo(() => {
    let filtered = tasks;
    
    // Фильтр по статусу
    if (filter === 'active') filtered = tasks.filter(t => !t.completed);
    if (filter === 'completed') filtered = tasks.filter(t => t.completed);
    
    // Фильтр по приоритету
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }
    
    // Фильтр по дате
    if (dateFilterStart && dateFilterEnd) {
      const start = startOfDay(parseISO(dateFilterStart));
      const end = startOfDay(parseISO(dateFilterEnd));
      filtered = filtered.filter(t => {
        if (!t.dueDate) return false;
        const taskDate = startOfDay(parseISO(t.dueDate));
        return taskDate >= start && taskDate <= end;
      });
    }
    
    const today: Task[] = [];
    const tomorrow: Task[] = [];
    const overdue: Task[] = [];
    const upcoming: Task[] = [];
    const noDate: Task[] = [];
    const completed: Task[] = [];
    
    filtered.forEach(task => {
      if (task.completed) {
        completed.push(task);
        return;
      }
      
      if (!task.dueDate) {
        noDate.push(task);
        return;
      }
      
      const dueDate = parseISO(task.dueDate);
      
      if (isPast(dueDate) && !isToday(dueDate)) {
        overdue.push(task);
      } else if (isToday(dueDate)) {
        today.push(task);
      } else if (isTomorrow(dueDate)) {
        tomorrow.push(task);
      } else {
        upcoming.push(task);
      }
    });
    
    // Сортировка по приоритету внутри групп
    const sortByPriority = (a: Task, b: Task) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    };
    
    return { 
      today: today.sort(sortByPriority), 
      tomorrow: tomorrow.sort(sortByPriority), 
      overdue: overdue.sort(sortByPriority), 
      upcoming: upcoming.sort(sortByPriority), 
      noDate: noDate.sort(sortByPriority), 
      completed 
    };
  }, [tasks, filter, priorityFilter, dateFilterStart, dateFilterEnd]);
  
  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active: tasks.filter(t => !t.completed).length,
    overdue: groupedTasks.overdue.length,
    todayCount: groupedTasks.today.length,
  }), [tasks, groupedTasks]);
  
  const handleToggle = (id: string, title: string, wasCompleted: boolean) => {
    hapticFeedback?.(wasCompleted ? 'selection' : 'success');
    toggleTaskComplete(id);
    if (!wasCompleted) {
      addToast({ type: 'success', message: `✅ ${title}` });
    }
  };
  
  const handleDelete = (id: string) => {
    hapticFeedback?.('warning');
    deleteTask(id);
    addToast({ type: 'info', message: language === 'ru' ? 'Задача удалена' : 'Task deleted' });
  };
  
  const filterLabels = {
    all: language === 'ru' ? 'Все' : 'All',
    active: language === 'ru' ? 'Активные' : 'Active',
    completed: language === 'ru' ? 'Выполненные' : 'Completed',
  };

  const clearDateFilter = () => {
    setDateFilterStart('');
    setDateFilterEnd('');
    setShowDateFilter(false);
  };

  return (
    <div className="" >
      {/* ============================================================================
          УНИКАЛЬНЫЙ ФОН СТРАНИЦЫ ЗАДАЧ
          Тема: Продуктивность, организация, чек-листы
          Синее свечение с эффектом фокуса
          ============================================================================ */}
      <div className="">
        {/* Основной градиент */}
        <div 
          className="absolute top-0 left-0 w-[70%] h-[50%]"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 0% 0%, rgba(96, 165, 250, 0.15) 0%, transparent 60%)',
          }}
        />
        
        {/* Акцент справа */}
        <div 
          className="absolute bottom-0 right-0 w-1/2 h-1/3"
          style={{
            background: 'radial-gradient(ellipse at bottom right, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
          }}
        />
        
        {/* Для просроченных - красный акцент */}
        {stats.overdue > 0 && (
          <div 
            className="absolute top-20 right-4 w-32 h-32"
            style={{
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)',
            }}
          />
        )}
        
        {/* Декоративные элементы */}
        <div className="absolute top-40 left-8 w-1 h-1 rounded-full bg-blue-400 opacity-40 animate-float" />
        <div className="absolute top-60 left-16 w-1.5 h-1.5 rounded-full bg-indigo-400 opacity-30 animate-float" style={{ animationDelay: '0.5s' }} />
      </div>
      
      {/* Date Filter Modal */}
      <AnimatePresence>
        {showDateFilter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowDateFilter(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm p-5 rounded-2xl"
              style={{ background: 'var(--glass-bg-heavy)', border: '1px solid var(--glass-border)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {language === 'ru' ? 'Фильтр по дате' : 'Date Filter'}
                </h3>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowDateFilter(false)}>
                  <XMarkIcon className="w-6 h-6" style={{ color: 'var(--text-tertiary)' }} />
                </motion.button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                    {language === 'ru' ? 'От' : 'From'}
                  </label>
                  <input
                    type="date"
                    value={dateFilterStart}
                    onChange={(e) => setDateFilterStart(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark' }}
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                    {language === 'ru' ? 'До' : 'To'}
                  </label>
                  <input
                    type="date"
                    value={dateFilterEnd}
                    onChange={(e) => setDateFilterEnd(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark' }}
                  />
                </div>
                
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={clearDateFilter}
                    className="flex-1 py-3 rounded-xl font-medium"
                    style={{ background: 'var(--surface-dim)', color: 'var(--text-secondary)' }}
                  >
                    {language === 'ru' ? 'Сбросить' : 'Clear'}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDateFilter(false)}
                    className="flex-1 py-3 rounded-xl font-semibold"
                    style={{ background: 'linear-gradient(135deg, var(--info) 0%, #93C5FD 100%)', color: 'white' }}
                  >
                    {language === 'ru' ? 'Применить' : 'Apply'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Scrollable Content */}
      <div className="page-scrollable">
        {/* Header */}
        <header className="px-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardDocumentListIcon className="w-6 h-6" style={{ color: 'var(--info)' }} />
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {language === 'ru' ? 'Задачи' : 'Tasks'}
                </h1>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {stats.completed}/{stats.total} {language === 'ru' ? 'выполнено' : 'completed'}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hapticFeedback?.('medium');
                openBottomSheet('add-task');
              }}
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, var(--info) 0%, #818CF8 100%)',
                boxShadow: '0 4px 15px rgba(96, 165, 250, 0.4)',
              }}
            >
              <PlusIcon className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </header>
        
        <main className="px-4 space-y-4 pb-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: stats.total, label: language === 'ru' ? 'Всего' : 'Total', color: '#60A5FA' },
              { value: stats.active, label: language === 'ru' ? 'Активных' : 'Active', color: '#FBBF24' },
              { value: stats.todayCount, label: language === 'ru' ? 'Сегодня' : 'Today', color: '#A855F7' },
              { value: stats.overdue, label: language === 'ru' ? 'Просрочено' : 'Overdue', color: '#EF4444' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-2.5 rounded-xl text-center"
                style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
              >
                <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-2">
            <div className="flex-1 flex gap-1.5 p-1 rounded-xl" style={{ background: 'var(--surface-dim)' }}>
              {(['all', 'active', 'completed'] as const).map((f) => (
                <motion.button
                  key={f}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    hapticFeedback?.('selection');
                    setFilter(f);
                  }}
                  className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: filter === f ? 'var(--info)' : 'transparent',
                    color: filter === f ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {filterLabels[f]}
                </motion.button>
              ))}
            </div>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hapticFeedback?.('light');
                setShowDateFilter(true);
              }}
              className="w-11 h-11 rounded-xl flex items-center justify-center relative"
              style={{ 
                background: dateFilterStart && dateFilterEnd ? 'var(--info)' : 'var(--surface)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <CalendarDaysIcon className="w-5 h-5" style={{ color: dateFilterStart && dateFilterEnd ? 'white' : 'var(--text-secondary)' }} />
              {dateFilterStart && dateFilterEnd && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500" />
              )}
            </motion.button>
          </div>
          
          {/* Priority Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hapticFeedback?.('selection');
                setPriorityFilter('all');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap"
              style={{
                background: priorityFilter === 'all' ? 'var(--primary-subtle)' : 'var(--surface)',
                border: `1px solid ${priorityFilter === 'all' ? 'var(--primary)' : 'var(--border)'}`,
                color: priorityFilter === 'all' ? 'var(--primary)' : 'var(--text-secondary)',
              }}
            >
              <FunnelIcon className="w-4 h-4" />
              <span className="text-xs font-medium">{language === 'ru' ? 'Все' : 'All'}</span>
            </motion.button>
            
            {(['urgent', 'high', 'medium', 'low'] as const).map((p) => (
              <motion.button
                key={p}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  hapticFeedback?.('selection');
                  setPriorityFilter(priorityFilter === p ? 'all' : p);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap"
                style={{
                  background: priorityFilter === p ? `${PRIORITY_COLORS[p]}20` : 'var(--surface)',
                  border: `1px solid ${priorityFilter === p ? PRIORITY_COLORS[p] : 'var(--border)'}`,
                  color: priorityFilter === p ? PRIORITY_COLORS[p] : 'var(--text-secondary)',
                }}
              >
                <FlagIcon className="w-4 h-4" />
                <span className="text-xs font-medium">{PRIORITY_LABELS[language as 'ru' | 'en'][p]}</span>
              </motion.button>
            ))}
          </div>
          
          {/* Progress */}
          {stats.total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl"
              style={{ 
                background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, var(--surface) 100%)',
                border: '1px solid rgba(96, 165, 250, 0.2)',
              }}
            >
              <div className="flex justify-between mb-2">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'ru' ? 'Прогресс' : 'Progress'}
                </span>
                <span className="text-xs font-semibold" style={{ color: 'var(--info)' }}>
                  {Math.round((stats.completed / stats.total) * 100)}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, var(--info), #818CF8)' }}
                />
              </div>
            </motion.div>
          )}
          
          {/* Task Groups */}
          <AnimatePresence mode="wait">
            <motion.div
              key={filter + priorityFilter + dateFilterStart + dateFilterEnd}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {groupedTasks.overdue.length > 0 && (
                <TaskGroup
                  title={language === 'ru' ? 'Просрочено' : 'Overdue'}
                  icon={ExclamationCircleIcon}
                  tasks={groupedTasks.overdue}
                  language={language}
                  dateLocale={dateLocale}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  accentColor="#EF4444"
                />
              )}
              
              {groupedTasks.today.length > 0 && (
                <TaskGroup
                  title={language === 'ru' ? 'Сегодня' : 'Today'}
                  icon={SparklesIcon}
                  tasks={groupedTasks.today}
                  language={language}
                  dateLocale={dateLocale}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  accentColor="var(--primary)"
                />
              )}
              
              {groupedTasks.tomorrow.length > 0 && (
                <TaskGroup
                  title={language === 'ru' ? 'Завтра' : 'Tomorrow'}
                  icon={CalendarDaysIcon}
                  tasks={groupedTasks.tomorrow}
                  language={language}
                  dateLocale={dateLocale}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  accentColor="var(--info)"
                />
              )}
              
              {groupedTasks.upcoming.length > 0 && (
                <TaskGroup
                  title={language === 'ru' ? 'Предстоящие' : 'Upcoming'}
                  icon={ClockIcon}
                  tasks={groupedTasks.upcoming}
                  language={language}
                  dateLocale={dateLocale}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  accentColor="#A855F7"
                />
              )}
              
              {groupedTasks.noDate.length > 0 && (
                <TaskGroup
                  title={language === 'ru' ? 'Без даты' : 'No Date'}
                  icon={ClipboardDocumentListIcon}
                  tasks={groupedTasks.noDate}
                  language={language}
                  dateLocale={dateLocale}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  accentColor="var(--text-tertiary)"
                />
              )}
              
              {/* Completed Section */}
              {filter !== 'active' && groupedTasks.completed.length > 0 && (
                <div>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="flex items-center gap-2 mb-3"
                  >
                    <motion.div animate={{ rotate: showCompleted ? 0 : -90 }}>
                      <ChevronDownIcon className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                    </motion.div>
                    <CheckCircleSolid className="w-4 h-4" style={{ color: 'var(--success)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
                      {language === 'ru' ? 'Выполнено' : 'Completed'} ({groupedTasks.completed.length})
                    </span>
                  </motion.button>
                  
                  <AnimatePresence>
                    {showCompleted && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        {groupedTasks.completed.map(task => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            language={language}
                            dateLocale={dateLocale}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Empty State */}
          {tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-xl text-center"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            >
              <div 
                className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                  boxShadow: '0 8px 30px rgba(96, 165, 250, 0.3)',
                }}
              >
                <ClipboardDocumentListIcon className="w-10 h-10" style={{ color: 'var(--info)' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {language === 'ru' ? 'Нет задач' : 'No Tasks'}
              </h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                {language === 'ru' ? 'Добавьте первую задачу для начала работы' : 'Add your first task to get started'}
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  hapticFeedback?.('medium');
                  openBottomSheet('add-task');
                }}
                className="px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mx-auto"
                style={{ 
                  background: 'linear-gradient(135deg, var(--info) 0%, #818CF8 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(96, 165, 250, 0.4)',
                }}
              >
                <PlusIcon className="w-5 h-5" />
                {language === 'ru' ? 'Добавить задачу' : 'Add Task'}
              </motion.button>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

// Task Group Component
function TaskGroup({ 
  title, 
  icon: Icon,
  tasks, 
  language,
  dateLocale,
  onToggle,
  onDelete,
  accentColor 
}: { 
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  tasks: Task[];
  language: string;
  dateLocale: typeof ru;
  onToggle: (id: string, title: string, wasCompleted: boolean) => void;
  onDelete: (id: string) => void;
  accentColor: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4" style={{ color: accentColor }} />
        <h3 className="text-sm font-semibold" style={{ color: accentColor }}>
          {title}
        </h3>
        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: `${accentColor}20`, color: accentColor }}>
          {tasks.length}
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            language={language}
            dateLocale={dateLocale}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

// Task Item Component
function TaskItem({ 
  task, 
  language,
  dateLocale,
  onToggle,
  onDelete,
}: { 
  task: Task;
  language: string;
  dateLocale: typeof ru;
  onToggle: (id: string, title: string, wasCompleted: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const priorityLabels = language === 'ru' ? PRIORITY_LABELS.ru : PRIORITY_LABELS.en;
  const [showActions, setShowActions] = useState(false);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex items-start gap-3 p-3.5 rounded-xl relative overflow-hidden"
      style={{ 
        background: task.completed ? 'var(--surface-dim)' : 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        opacity: task.completed ? 0.7 : 1,
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowActions(!showActions);
      }}
    >
      {/* Checkbox */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onToggle(task.id, task.title, task.completed)}
        className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
        style={{ 
          borderColor: task.completed ? 'var(--success)' : PRIORITY_COLORS[task.priority] || 'var(--border)',
          background: task.completed ? 'var(--success)' : 'transparent',
        }}
      >
        {task.completed && <CheckCircleSolid className="w-4 h-4 text-white" />}
      </motion.button>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p 
          className={`text-sm font-medium ${task.completed ? 'line-through' : ''}`}
          style={{ color: task.completed ? 'var(--text-tertiary)' : 'var(--text-primary)' }}
        >
          {task.title}
        </p>
        
        {task.description && (
          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-tertiary)' }}>
            {task.description}
          </p>
        )}
        
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {/* Priority */}
          {!task.completed && task.priority !== 'low' && (
            <span 
              className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
              style={{ 
                background: `${PRIORITY_COLORS[task.priority]}20`,
                color: PRIORITY_COLORS[task.priority],
              }}
            >
              <FlagIcon className="w-3 h-3" />
              {priorityLabels[task.priority]}
            </span>
          )}
          
          {/* Due Date */}
          {task.dueDate && (
            <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
              <ClockIcon className="w-3 h-3" />
              {format(parseISO(task.dueDate), 'd MMM', { locale: dateLocale })}
            </span>
          )}
        </div>
      </div>
      
      {/* Quick Delete */}
      {!task.completed && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onDelete(task.id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
          style={{ background: 'var(--error-subtle)' }}
        >
          <XMarkIcon className="w-4 h-4" style={{ color: 'var(--error)' }} />
        </motion.button>
      )}
    </motion.div>
  );
}