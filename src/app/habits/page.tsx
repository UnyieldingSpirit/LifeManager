'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { 
  PlusIcon, 
  FireIcon, 
  CheckCircleIcon, 
  TrophyIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  BoltIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';

export default function HabitsPage() {
  const { hapticFeedback } = useTelegram();
  
  const profile = useStore((s) => s.profile);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const logHabit = useStore((s) => s.logHabit);
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  const addToast = useStore((s) => s.addToast);
  
  const language = profile?.settings?.language || 'ru';
  const dateLocale = language === 'ru' ? ru : enUS;
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'stats'>('today');
  
  // Дни недели для отображения
  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, []);
  
  const habitsWithStatus = useMemo(() => {
    return habits.map(habit => {
      const todayLog = habitLogs.find(l => l.habitId === habit.id && l.date === today);
      
      // Статус по дням недели
      const weekStatus = weekDays.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const log = habitLogs.find(l => l.habitId === habit.id && l.date === dateStr);
        return { date: dateStr, completed: !!log?.completed };
      });
      
      return { ...habit, completedToday: !!todayLog?.completed, weekStatus };
    });
  }, [habits, habitLogs, today, weekDays]);
  
  const stats = useMemo(() => ({
    total: habits.length,
    completedToday: habitsWithStatus.filter(h => h.completedToday).length,
    longestStreak: Math.max(...habits.map(h => h.longestStreak), 0),
    totalCompletions: habits.reduce((sum, h) => sum + h.totalCompletions, 0),
  }), [habits, habitsWithStatus]);
  
  const handleLog = (habitId: string, habitName: string) => {
    hapticFeedback?.('notification', 'success')
    logHabit(habitId, 1);
    addToast({ 
      type: 'success', 
      message: language === 'ru' ? `${habitName} выполнено! 🔥` : `${habitName} completed! 🔥` 
    });
  };

  return (
    <div className="" >
      {/* ============================================================================
          УНИКАЛЬНЫЙ ФОН СТРАНИЦЫ ПРИВЫЧЕК
          Тема: Энергия, рост, прогресс, streak
          Оранжевое свечение снизу с эффектом огня
          ============================================================================ */}
      <div className="">
        {/* Основной градиент огня снизу */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[60%]"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(249, 115, 22, 0.25) 0%, rgba(251, 191, 36, 0.1) 30%, transparent 70%)',
          }}
        />
        
        {/* Частицы/искры */}
        <div className="absolute bottom-20 left-1/4 w-2 h-2 rounded-full bg-orange-400 opacity-60 animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-32 right-1/3 w-1.5 h-1.5 rounded-full bg-yellow-400 opacity-50 animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-40 left-1/2 w-1 h-1 rounded-full bg-orange-300 opacity-40 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-24 right-1/4 w-2 h-2 rounded-full bg-amber-400 opacity-50 animate-float" style={{ animationDelay: '1.5s' }} />
        
        {/* Свечение по краям */}
        <div 
          className="absolute bottom-0 left-0 w-1/3 h-1/2"
          style={{
            background: 'radial-gradient(ellipse at bottom left, rgba(249, 115, 22, 0.15) 0%, transparent 60%)',
          }}
        />
        <div 
          className="absolute bottom-0 right-0 w-1/3 h-1/2"
          style={{
            background: 'radial-gradient(ellipse at bottom right, rgba(251, 191, 36, 0.15) 0%, transparent 60%)',
          }}
        />
      </div>
      
      {/* Scrollable Content */}
      <div className="page-scrollable">
        {/* Header */}
        <header className="px-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FireIcon className="w-6 h-6" style={{ color: '#F97316' }} />
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {language === 'ru' ? 'Привычки' : 'Habits'}
                </h1>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {format(new Date(), 'EEEE, d MMMM', { locale: dateLocale })}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hapticFeedback?.('medium');
                openBottomSheet('add-habit');
              }}
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #F97316 0%, #FBBF24 100%)',
                boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)',
              }}
            >
              <PlusIcon className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </header>
        
        {/* Tabs */}
        <div className="px-4 mb-4">
          <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--surface-dim)' }}>
            {[
              { id: 'today', label: language === 'ru' ? 'Сегодня' : 'Today', icon: FireIcon },
              { id: 'week', label: language === 'ru' ? 'Неделя' : 'Week', icon: CalendarDaysIcon },
              { id: 'stats', label: language === 'ru' ? 'Статистика' : 'Stats', icon: ChartBarIcon },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  hapticFeedback?.('selection');
                  setActiveTab(tab.id as any);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: activeTab === tab.id 
                    ? 'linear-gradient(135deg, #F97316 0%, #FBBF24 100%)' 
                    : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
        
        <main className="px-4 space-y-4 pb-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: FireIcon, value: stats.total, label: language === 'ru' ? 'Привычек' : 'Habits', color: '#F97316', glow: 'rgba(249, 115, 22, 0.3)' },
              { icon: CheckCircleSolid, value: stats.completedToday, label: language === 'ru' ? 'Сегодня' : 'Today', color: '#22C55E', glow: 'rgba(34, 197, 94, 0.3)' },
              { icon: TrophyIcon, value: stats.longestStreak, label: language === 'ru' ? 'Рекорд' : 'Best', color: '#FBBF24', glow: 'rgba(251, 191, 36, 0.3)' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative p-3 rounded-xl text-center overflow-hidden"
                style={{ 
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  boxShadow: `0 4px 20px ${stat.glow}`,
                }}
              >
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{ background: `radial-gradient(circle at center, ${stat.color} 0%, transparent 70%)` }}
                />
                <stat.icon className="w-5 h-5 mx-auto mb-1 relative z-10" style={{ color: stat.color }} />
                <p className="text-2xl font-bold relative z-10" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                <p className="text-[10px] relative z-10" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
          
          {/* Today's Progress */}
          {activeTab === 'today' && stats.total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl"
              style={{ 
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(251, 191, 36, 0.1) 100%)',
                border: '1px solid rgba(249, 115, 22, 0.2)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'ru' ? 'Прогресс сегодня' : 'Today\'s Progress'}
                </span>
                <span className="text-sm font-bold" style={{ color: '#F97316' }}>
                  {Math.round((stats.completedToday / stats.total) * 100)}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.completedToday / stats.total) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #F97316, #FBBF24)' }}
                />
              </div>
              <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-tertiary)' }}>
                {stats.completedToday === stats.total 
                  ? (language === 'ru' ? '🎉 Все привычки выполнены!' : '🎉 All habits completed!')
                  : `${stats.total - stats.completedToday} ${language === 'ru' ? 'осталось' : 'remaining'}`
                }
              </p>
            </motion.div>
          )}
          
          {/* Habits List */}
          <AnimatePresence mode="wait">
            {activeTab === 'today' && (
              <motion.div
                key="today"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3"
              >
                {habitsWithStatus.map((habit, index) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileTap={{ scale: habit.completedToday ? 1 : 0.98 }}
                    onClick={() => !habit.completedToday && handleLog(habit.id, habit.name)}
                    className="p-4 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: habit.completedToday 
                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 100%)'
                        : 'var(--glass-bg)',
                      border: habit.completedToday 
                        ? '1px solid rgba(34, 197, 94, 0.4)' 
                        : '1px solid var(--glass-border)',
                      boxShadow: habit.completedToday 
                        ? '0 4px 20px rgba(34, 197, 94, 0.2)' 
                        : 'var(--glass-shadow)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ 
                            background: habit.completedToday ? 'var(--success)' : `${habit.color}20`,
                            boxShadow: habit.completedToday ? '0 4px 15px rgba(34, 197, 94, 0.4)' : 'none',
                          }}
                        >
                          {habit.completedToday ? (
                            <CheckCircleSolid className="w-6 h-6 text-white" />
                          ) : (
                            <span>{habit.icon}</span>
                          )}
                        </div>
                        <div>
                          <p className={`font-semibold ${habit.completedToday ? 'line-through opacity-70' : ''}`} style={{ color: 'var(--text-primary)' }}>
                            {habit.name}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <div className="flex items-center gap-1">
                              <BoltIcon className="w-3.5 h-3.5" style={{ color: '#F97316' }} />
                              <span className="text-xs font-medium" style={{ color: '#F97316' }}>
                                {habit.currentStreak} {language === 'ru' ? 'дн.' : 'days'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrophyIcon className="w-3.5 h-3.5" style={{ color: '#FBBF24' }} />
                              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                {habit.longestStreak}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {!habit.completedToday && (
                        <div 
                          className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110"
                          style={{ borderColor: habit.color, background: `${habit.color}15` }}
                        >
                          <CheckCircleIcon className="w-5 h-5" style={{ color: habit.color }} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            {activeTab === 'week' && (
              <motion.div
                key="week"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Week Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map((day) => (
                    <div key={day.toISOString()} className="text-center">
                      <p className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                        {format(day, 'EEE', { locale: dateLocale })}
                      </p>
                      <p 
                        className={`text-xs mt-0.5 ${format(day, 'yyyy-MM-dd') === today ? 'font-bold' : ''}`}
                        style={{ color: format(day, 'yyyy-MM-dd') === today ? '#F97316' : 'var(--text-secondary)' }}
                      >
                        {format(day, 'd')}
                      </p>
                    </div>
                  ))}
                </div>
                
                {habitsWithStatus.map((habit, index) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl"
                    style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{habit.icon}</span>
                      <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{habit.name}</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {habit.weekStatus.map((day, i) => (
                        <div
                          key={day.date}
                          className="aspect-square rounded-lg flex items-center justify-center transition-all"
                          style={{
                            background: day.completed ? habit.color : 'var(--surface-dim)',
                            opacity: day.date > today ? 0.3 : 1,
                          }}
                        >
                          {day.completed && <CheckCircleSolid className="w-4 h-4 text-white" />}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Total Stats Card */}
                <div className="p-5 rounded-xl" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <SparklesIcon className="w-5 h-5" style={{ color: '#FBBF24' }} />
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {language === 'ru' ? 'Общая статистика' : 'Overall Stats'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg" style={{ background: 'var(--surface-dim)' }}>
                      <p className="text-2xl font-bold" style={{ color: '#F97316' }}>{stats.totalCompletions}</p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {language === 'ru' ? 'Всего выполнено' : 'Total Completions'}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg" style={{ background: 'var(--surface-dim)' }}>
                      <p className="text-2xl font-bold" style={{ color: '#FBBF24' }}>{stats.longestStreak}</p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {language === 'ru' ? 'Лучшая серия' : 'Best Streak'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Per Habit Stats */}
                {habitsWithStatus.map((habit, index) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl"
                    style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{habit.icon}</span>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{habit.name}</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: `${habit.color}20` }}>
                        <BoltIcon className="w-3.5 h-3.5" style={{ color: habit.color }} />
                        <span className="text-xs font-medium" style={{ color: habit.color }}>{habit.currentStreak}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg" style={{ background: 'var(--surface-dim)' }}>
                        <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{habit.totalCompletions}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Всего' : 'Total'}</p>
                      </div>
                      <div className="p-2 rounded-lg" style={{ background: 'var(--surface-dim)' }}>
                        <p className="text-lg font-bold" style={{ color: habit.color }}>{habit.currentStreak}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Серия' : 'Streak'}</p>
                      </div>
                      <div className="p-2 rounded-lg" style={{ background: 'var(--surface-dim)' }}>
                        <p className="text-lg font-bold" style={{ color: '#FBBF24' }}>{habit.longestStreak}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Рекорд' : 'Best'}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Empty State */}
          {habits.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-xl text-center"
              style={{ 
                background: 'var(--glass-bg)', 
                border: '1px solid var(--glass-border)',
              }}
            >
              <div 
                className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(251, 191, 36, 0.2) 100%)',
                  boxShadow: '0 8px 30px rgba(249, 115, 22, 0.3)',
                }}
              >
                <FireIcon className="w-10 h-10" style={{ color: '#F97316' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {language === 'ru' ? 'Начните формировать привычки' : 'Start Building Habits'}
              </h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                {language === 'ru' 
                  ? 'Добавьте первую привычку и отслеживайте прогресс каждый день' 
                  : 'Add your first habit and track progress every day'
                }
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => openBottomSheet('add-habit')}
                className="px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mx-auto"
                style={{ 
                  background: 'linear-gradient(135deg, #F97316 0%, #FBBF24 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)',
                }}
              >
                <PlusIcon className="w-5 h-5" />
                {language === 'ru' ? 'Добавить привычку' : 'Add Habit'}
              </motion.button>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}