// src/app/habits/page.tsx
'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';

const DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function HabitsPage() {
  const { hapticFeedback } = useTelegram();
  const profile = useStore((s) => s.profile);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const toggleHabitLog = useStore((s) => s.toggleHabitLog);
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  const language = profile?.settings?.language || 'ru';
  const isRu = language === 'ru';

  const todayStr = new Date().toISOString().split('T')[0];

  // Проверка выполнения привычки сегодня
  const isCompletedToday = (habitId: string) => {
    return habitLogs.some(log => log.habitId === habitId && log.date === todayStr && log.completed);
  };

  // Подсчёт текущей серии (streak)
  const getStreak = (habitId: string) => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = habitLogs.find(l => l.habitId === habitId && l.date === dateStr && l.completed);
      if (log) streak++;
      else if (i > 0) break; // Серия прервалась (не считаем сегодня если не сделал)
    }
    return streak;
  };

  // Неделя: выполнение за последние 7 дней
  const getWeekData = (habitId: string) => {
    const result: boolean[] = [];
    const today = new Date();
    // Найти понедельник текущей недели
    const dayOfWeek = today.getDay() || 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      result.push(habitLogs.some(l => l.habitId === habitId && l.date === dateStr && l.completed));
    }
    return result;
  };

  const handleToggle = (habitId: string) => {
    hapticFeedback?.('medium');
    toggleHabitLog(habitId, todayStr);
  };

  // Общий streak (max из всех привычек)
  const totalStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map(h => getStreak(h.id)));
  }, [habits, habitLogs]);

  if (habits.length === 0) {
    return (
      <div className="page-scrollable" style={{ background: '#0A0A0A' }}>
        <div className="page-content px-4">
          <header className="pt-3 pb-4">
            <h1 className="text-xl font-bold" style={{ color: '#F5F5F5' }}>
              {isRu ? 'Привычки' : 'Habits'}
            </h1>
          </header>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <span className="text-5xl mb-4 block">🎯</span>
            <h2 className="text-lg font-bold mb-2" style={{ color: '#F5F5F5' }}>
              {isRu ? 'Формируйте привычки' : 'Build Habits'}
            </h2>
            <p className="text-sm mb-6 max-w-[260px] mx-auto" style={{ color: '#737373' }}>
              {isRu 
                ? 'Спорт, чтение, медитация — отслеживайте прогресс каждый день' 
                : 'Sports, reading, meditation — track progress daily'}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { hapticFeedback?.('medium'); openBottomSheet('add-habit'); }}
              className="px-6 py-3 rounded-xl text-sm font-semibold"
              style={{ background: '#F97316', color: 'white', boxShadow: '0 4px 15px rgba(249,115,22,0.4)' }}
            >
              {isRu ? 'Создать первую привычку' : 'Create First Habit'}
            </motion.button>
            <div className="flex justify-center gap-3 mt-6">
              {['🏃 Спорт', '📖 Чтение', '💧 Вода', '🧘 Медитация'].map(ex => (
                <span key={ex} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: '#525252' }}>{ex}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-scrollable" style={{ background: '#0A0A0A' }}>
      <div className="page-content px-4">
        {/* Header */}
        <header className="pt-3 pb-2 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#F5F5F5' }}>
              {isRu ? 'Привычки' : 'Habits'}
            </h1>
            {totalStreak > 0 && (
              <p className="text-xs" style={{ color: '#F97316' }}>
                🔥 {isRu ? `Серия: ${totalStreak} дн.` : `Streak: ${totalStreak}d`}
              </p>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { hapticFeedback?.('medium'); openBottomSheet('add-habit'); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#F9731620', border: '1px solid #F9731630' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" style={{ color: '#F97316' }}>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </motion.button>
        </header>

        {/* Habit List */}
        <div className="space-y-3 pt-2 pb-8">
          {habits.map((habit, i) => {
            const completed = isCompletedToday(habit.id);
            const streak = getStreak(habit.id);
            const weekData = getWeekData(habit.id);

            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{habit.icon || '🎯'}</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#F5F5F5' }}>{habit.name}</p>
                      <p className="text-[10px]" style={{ color: streak > 0 ? '#F97316' : '#525252' }}>
                        {streak > 0 ? `🔥 ${streak} ${isRu ? 'дн.' : 'd'}` : (isRu ? 'Начните серию!' : 'Start streak!')}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleToggle(habit.id)}
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{
                      background: completed ? '#F9731630' : 'rgba(255,255,255,0.05)',
                      border: completed ? '1px solid #F9731650' : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {completed ? (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" style={{ color: '#F97316' }}>
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <div className="w-5 h-5 rounded-md" style={{ border: '2px solid rgba(255,255,255,0.2)' }} />
                    )}
                  </motion.button>
                </div>

                {/* Week Heatmap */}
                <div className="flex gap-1">
                  {weekData.map((done, j) => (
                    <div key={j} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full h-1.5 rounded-full"
                        style={{ background: done ? '#F97316' : 'rgba(255,255,255,0.08)' }}
                      />
                      <span className="text-[8px]" style={{ color: '#404040' }}>{DAYS_SHORT[j]}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}