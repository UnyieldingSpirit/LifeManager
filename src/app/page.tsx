// src/app/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ru, enUS, uz } from 'date-fns/locale';
import TaskCard from '@/components/tasks/TaskCard';
import { useTaskStore } from '@/store/taskStore';
import { useUserStore } from '@/store/userStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useTelegram } from '@/hooks/useTelegram';
import { Task } from '@/types';

const localesMap: Record<string, Locale> = { ru, en: enUS, uz };

export default function TodayPage() {
  const [mounted, setMounted] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  
  const { t, language } = useTranslation();
  const { hapticFeedback, user } = useTelegram();
  const tasks = useTaskStore((state) => state.tasks);
  const profile = useUserStore((state) => state.profile);
  
  const locale = localesMap[language] || ru;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Приветствие по времени суток
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: t('greeting.morning'), emoji: '☀️' };
    if (hour >= 12 && hour < 17) return { text: t('greeting.afternoon'), emoji: '🌤️' };
    if (hour >= 17 && hour < 22) return { text: t('greeting.evening'), emoji: '🌅' };
    return { text: t('greeting.night'), emoji: '🌙' };
  }, [t]);

  // Фильтрация задач
  const { todayTasks, overdueTasks, completedToday, unscheduledTasks } = useMemo(() => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    const todayPending: Task[] = [];
    const overdue: Task[] = [];
    const completed: Task[] = [];
    const unscheduled: Task[] = [];
    
    tasks.forEach((task) => {
      if (task.status === 'completed') {
        if (task.completedAt && format(parseISO(task.completedAt), 'yyyy-MM-dd') === todayStr) {
          completed.push(task);
        }
        return;
      }
      
      if (!task.dueDate) {
        unscheduled.push(task);
        return;
      }
      
      const taskDate = task.dueDate.split('T')[0];
      
      if (taskDate === todayStr) {
        todayPending.push(task);
      } else if (taskDate < todayStr) {
        overdue.push(task);
      }
    });
    
    return {
      todayTasks: todayPending,
      overdueTasks: overdue,
      completedToday: completed,
      unscheduledTasks: unscheduled.slice(0, 3),
    };
  }, [tasks]);

  // Статистика
  const stats = useMemo(() => ({
    pending: todayTasks.length + overdueTasks.length,
    completed: completedToday.length,
    streak: profile?.stats.streak || 0,
  }), [todayTasks, overdueTasks, completedToday, profile]);

  const userName = user?.first_name || profile?.name || 'User';

  if (!mounted) return null;

  return (
    <div className="min-h-full px-3 pt-safe">
      {/* Header */}
      <header className="pt-4 pb-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <span className="text-3xl">{greeting.emoji}</span>
          <div>
            <h1 
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {greeting.text}, {userName}!
            </h1>
            <p 
              className="text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              {format(new Date(), 'EEEE, d MMMM', { locale })}
            </p>
          </div>
        </motion.div>
      </header>

      {/* Stats Cards */}
      <section className="mb-4">
        <div className="grid grid-cols-3 gap-2">
          {/* Pending */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-3 text-center"
          >
            <div 
              className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1.5"
              style={{ backgroundColor: 'var(--warning-subtle)' }}
            >
              <span className="text-base">⏳</span>
            </div>
            <p 
              className="text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {stats.pending}
            </p>
            <p 
              className="text-[10px]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {t('stats.pending')}
            </p>
          </motion.div>

          {/* Completed */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-3 text-center"
          >
            <div 
              className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1.5"
              style={{ backgroundColor: 'var(--success-subtle)' }}
            >
              <span className="text-base">✅</span>
            </div>
            <p 
              className="text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {stats.completed}
            </p>
            <p 
              className="text-[10px]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {t('stats.completed')}
            </p>
          </motion.div>

          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-3 text-center"
          >
            <div 
              className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1.5"
              style={{ backgroundColor: 'var(--error-subtle)' }}
            >
              <span className="text-base">🔥</span>
            </div>
            <p 
              className="text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {stats.streak}
            </p>
            <p 
              className="text-[10px]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {t('stats.streak')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <section className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">⚠️</span>
            <h2 
              className="text-sm font-semibold"
              style={{ color: 'var(--error)' }}
            >
              {t('tasks.overdue')} ({overdueTasks.length})
            </h2>
          </div>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {overdueTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TaskCard task={task} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Today's Tasks */}
      <section className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-sm">✨</span>
          <h2 
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('tasks.today')} ({todayTasks.length})
          </h2>
        </div>
        
        {todayTasks.length > 0 ? (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {todayTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TaskCard task={task} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-6 text-center"
          >
            <div className="text-4xl mb-2">🎉</div>
            <h3 
              className="text-base font-medium mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('empty.todayTitle')}
            </h3>
            <p 
              className="text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('empty.todayDescription')}
            </p>
          </motion.div>
        )}
      </section>

      {/* Unscheduled Tasks */}
      {unscheduledTasks.length > 0 && (
        <section className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">📋</span>
            <h2 
              className="text-sm font-semibold"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('tasks.unscheduled')}
            </h2>
          </div>
          <div className="space-y-2">
            {unscheduledTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TaskCard task={task} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Completed Today */}
      {completedToday.length > 0 && (
        <section className="mb-4">
          <button
            onClick={() => {
              setShowCompleted(!showCompleted);
              hapticFeedback?.('selection');
            }}
            className="flex items-center justify-between w-full mb-2"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm">✅</span>
              <h2 
                className="text-sm font-semibold"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('tasks.completedToday')} ({completedToday.length})
              </h2>
            </div>
            <motion.svg
              animate={{ rotate: showCompleted ? 180 : 0 }}
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
          
          <AnimatePresence>
            {showCompleted && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {completedToday.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TaskCard task={task} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}
    </div>
  );
}