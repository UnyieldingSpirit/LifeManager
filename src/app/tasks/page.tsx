// src/app/tasks/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import {
  PlusIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  FlagIcon,
  ChevronDownIcon,
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
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  
  const language = profile?.settings?.language || 'ru';
  const dateLocale = language === 'ru' ? ru : enUS;
  
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showCompleted, setShowCompleted] = useState(true);
  
  // Группировка задач
  const groupedTasks = useMemo(() => {
    let filtered = tasks;
    
    if (filter === 'active') filtered = tasks.filter(t => !t.completed);
    if (filter === 'completed') filtered = tasks.filter(t => t.completed);
    
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
      
      const dueDate = new Date(task.dueDate);
      
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
    
    return { today, tomorrow, overdue, upcoming, noDate, completed };
  }, [tasks, filter]);
  
  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active: tasks.filter(t => !t.completed).length,
  }), [tasks]);
  
  const handleToggle = (id: string) => {
    hapticFeedback?.('selection');
    toggleTaskComplete(id);
  };
  
  const filterLabels = {
    all: language === 'ru' ? 'Все' : 'All',
    active: language === 'ru' ? 'Активные' : 'Active',
    completed: language === 'ru' ? 'Выполненные' : 'Completed',
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header className="px-4 pt-safe">
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {language === 'ru' ? 'Задачи' : 'Tasks'}
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {stats.completed}/{stats.total} {language === 'ru' ? 'выполнено' : 'completed'}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              hapticFeedback?.('medium');
              openBottomSheet('add-task');
            }}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--primary)' }}
          >
            <PlusIcon className="w-5 h-5" style={{ color: '#0A0A0A' }} />
          </motion.button>
        </div>
      </header>
      
      <main className="px-4 space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--surface)' }}>
          {(['all', 'active', 'completed'] as const).map((f) => (
            <motion.button
              key={f}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hapticFeedback?.('selection');
                setFilter(f);
              }}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: filter === f ? 'var(--primary)' : 'transparent',
                color: filter === f ? '#0A0A0A' : 'var(--text-secondary)',
              }}
            >
              {filterLabels[f]}
            </motion.button>
          ))}
        </div>
        
        {/* Progress */}
        {stats.total > 0 && (
          <div className="glass-card p-4">
            <div className="flex justify-between mb-2">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {language === 'ru' ? 'Прогресс' : 'Progress'}
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                {Math.round((stats.completed / stats.total) * 100)}%
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stats.completed / stats.total) * 100}%` }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--primary), #E8D5A3)' }}
              />
            </div>
          </div>
        )}
        
        {/* Task Groups */}
        {groupedTasks.overdue.length > 0 && (
          <TaskGroup
            title={language === 'ru' ? '⚠️ Просрочено' : '⚠️ Overdue'}
            tasks={groupedTasks.overdue}
            language={language}
            dateLocale={dateLocale}
            onToggle={handleToggle}
            accentColor="var(--error)"
          />
        )}
        
        {groupedTasks.today.length > 0 && (
          <TaskGroup
            title={language === 'ru' ? '📅 Сегодня' : '📅 Today'}
            tasks={groupedTasks.today}
            language={language}
            dateLocale={dateLocale}
            onToggle={handleToggle}
            accentColor="var(--primary)"
          />
        )}
        
        {groupedTasks.tomorrow.length > 0 && (
          <TaskGroup
            title={language === 'ru' ? '🌅 Завтра' : '🌅 Tomorrow'}
            tasks={groupedTasks.tomorrow}
            language={language}
            dateLocale={dateLocale}
            onToggle={handleToggle}
            accentColor="var(--info)"
          />
        )}
        
        {groupedTasks.upcoming.length > 0 && (
          <TaskGroup
            title={language === 'ru' ? '📆 Предстоящие' : '📆 Upcoming'}
            tasks={groupedTasks.upcoming}
            language={language}
            dateLocale={dateLocale}
            onToggle={handleToggle}
            accentColor="var(--text-secondary)"
          />
        )}
        
        {groupedTasks.noDate.length > 0 && (
          <TaskGroup
            title={language === 'ru' ? '📝 Без даты' : '📝 No Date'}
            tasks={groupedTasks.noDate}
            language={language}
            dateLocale={dateLocale}
            onToggle={handleToggle}
            accentColor="var(--text-tertiary)"
          />
        )}
        
        {/* Completed Section */}
        {filter !== 'active' && groupedTasks.completed.length > 0 && (
          <div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 mb-2"
            >
              <motion.div animate={{ rotate: showCompleted ? 0 : -90 }}>
                <ChevronDownIcon className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
              </motion.div>
              <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
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
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        
        {/* Empty State */}
        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center"
          >
            <span className="text-4xl mb-4 block">✅</span>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {language === 'ru' ? 'Нет задач' : 'No Tasks'}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {language === 'ru' ? 'Добавьте первую задачу' : 'Add your first task'}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hapticFeedback?.('medium');
                openBottomSheet('add-task');
              }}
              className="px-6 py-3 rounded-xl font-semibold"
              style={{ background: 'var(--primary)', color: '#0A0A0A' }}
            >
              <PlusIcon className="w-5 h-5 inline mr-2" />
              {language === 'ru' ? 'Добавить задачу' : 'Add Task'}
            </motion.button>
          </motion.div>
        )}
      </main>
    </div>
  );
}

// Task Group Component
function TaskGroup({ 
  title, 
  tasks, 
  language,
  dateLocale,
  onToggle,
  accentColor 
}: { 
  title: string;
  tasks: Task[];
  language: string;
  dateLocale: typeof ru;
  onToggle: (id: string) => void;
  accentColor: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2" style={{ color: accentColor }}>
        {title}
      </h3>
      <div className="space-y-2">
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            language={language}
            dateLocale={dateLocale}
            onToggle={onToggle}
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
  onToggle 
}: { 
  task: Task;
  language: string;
  dateLocale: typeof ru;
  onToggle: (id: string) => void;
}) {
  const priorityLabels = language === 'ru' ? PRIORITY_LABELS.ru : PRIORITY_LABELS.en;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onToggle(task.id)}
      className="flex items-start gap-3 p-3 rounded-xl cursor-pointer"
      style={{ 
        background: task.completed ? 'var(--surface-dim)' : 'var(--surface)',
        opacity: task.completed ? 0.7 : 1,
      }}
    >
      {/* Checkbox */}
      <div 
        className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ 
          borderColor: task.completed ? 'var(--success)' : PRIORITY_COLORS[task.priority] || 'var(--border)',
          background: task.completed ? 'var(--success)' : 'transparent',
        }}
      >
        {task.completed && <CheckCircleSolid className="w-4 h-4 text-white" />}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p 
          className={`text-sm ${task.completed ? 'line-through' : ''}`}
          style={{ color: task.completed ? 'var(--text-tertiary)' : 'var(--text-primary)' }}
        >
          {task.title}
        </p>
        
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* Priority */}
          {!task.completed && task.priority !== 'low' && (
            <span 
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ 
                background: `${PRIORITY_COLORS[task.priority]}20`,
                color: PRIORITY_COLORS[task.priority],
              }}
            >
              {priorityLabels[task.priority]}
            </span>
          )}
          
          {/* Due Date */}
          {task.dueDate && (
            <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
              <ClockIcon className="w-3 h-3" />
              {format(new Date(task.dueDate), 'd MMM', { locale: dateLocale })}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}