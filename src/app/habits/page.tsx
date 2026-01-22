'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { PlusIcon, FireIcon, CheckCircleIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';

export default function HabitsPage() {
  const { hapticFeedback } = useTelegram();
  
  const profile = useStore((s) => s.profile);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const logHabit = useStore((s) => s.logHabit);
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  
  const language = profile?.settings?.language || 'ru';
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const habitsWithStatus = useMemo(() => {
    return habits.map(habit => {
      const todayLog = habitLogs.find(l => l.habitId === habit.id && l.date === today);
      return { ...habit, completedToday: !!todayLog?.completed };
    });
  }, [habits, habitLogs, today]);
  
  const stats = useMemo(() => ({
    total: habits.length,
    completedToday: habitsWithStatus.filter(h => h.completedToday).length,
    longestStreak: Math.max(...habits.map(h => h.longestStreak), 0),
  }), [habits, habitsWithStatus]);
  
  const handleLog = (habitId: string) => {
    hapticFeedback?.('medium');
    logHabit(habitId, 1);
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--background)' }}>
      <header className="px-4 pt-safe">
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {language === 'ru' ? 'Привычки' : 'Habits'}
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {stats.completedToday}/{stats.total} {language === 'ru' ? 'сегодня' : 'today'}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              hapticFeedback?.('medium');
              openBottomSheet('add-habit');
            }}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--primary)' }}
          >
            <PlusIcon className="w-5 h-5" style={{ color: '#0A0A0A' }} />
          </motion.button>
        </div>
      </header>
      
      <main className="px-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: FireIcon, value: stats.total, label: language === 'ru' ? 'Привычек' : 'Habits', color: '#F97316' },
            { icon: CheckCircleIcon, value: stats.completedToday, label: language === 'ru' ? 'Сегодня' : 'Today', color: '#22C55E' },
            { icon: TrophyIcon, value: stats.longestStreak, label: language === 'ru' ? 'Рекорд' : 'Best', color: '#FBBF24' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-3 text-center"
            >
              <stat.icon className="w-5 h-5 mx-auto mb-1" style={{ color: stat.color }} />
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Habits List */}
        <div className="space-y-3">
          {habitsWithStatus.map((habit, index) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !habit.completedToday && handleLog(habit.id)}
              className="glass-card p-4 cursor-pointer"
              style={{
                background: habit.completedToday 
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, var(--surface) 100%)'
                  : 'var(--surface)',
                border: habit.completedToday ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--glass-border)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{habit.icon}</span>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{habit.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        🔥 {habit.currentStreak} {language === 'ru' ? 'дней' : 'days'}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        • {language === 'ru' ? 'Лучшая' : 'Best'}: {habit.longestStreak}
                      </span>
                    </div>
                  </div>
                </div>
                
                {habit.completedToday ? (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--success)' }}>
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <div 
                    className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: habit.color, background: `${habit.color}20` }}
                  >
                    <span className="text-lg">{habit.icon}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Empty State */}
        {habits.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center"
          >
            <span className="text-4xl mb-4 block">🔥</span>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {language === 'ru' ? 'Нет привычек' : 'No Habits'}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {language === 'ru' ? 'Создайте первую привычку' : 'Create your first habit'}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => openBottomSheet('add-habit')}
              className="px-6 py-3 rounded-xl font-semibold"
              style={{ background: 'var(--primary)', color: '#0A0A0A' }}
            >
              {language === 'ru' ? 'Добавить привычку' : 'Add Habit'}
            </motion.button>
          </motion.div>
        )}
      </main>
    </div>
  );
}