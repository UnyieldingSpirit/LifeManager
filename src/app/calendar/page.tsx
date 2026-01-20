'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  Locale,
} from 'date-fns';
import { ru, enUS, uz } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import TaskCard from '@/components/tasks/TaskCard';
import { useTaskStore } from '@/store/taskStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useTelegram } from '@/hooks/useTelegram';
import { Task } from '@/types';

const localesMap: Record<string, Locale> = {
  ru: ru,
  en: enUS,
  uz: uz,
};

const weekDaysRu = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const weekDaysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weekDaysUz = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

export default function CalendarPage() {
  const [mounted, setMounted] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [direction, setDirection] = useState(0);
  
  const { t, language } = useTranslation();
  const { hapticFeedback } = useTelegram();
  const tasks = useTaskStore((state) => state.tasks);
  const profile = useUserStore((state) => state.profile);
  const selectedDate = useUIStore((state) => state.selectedDate);
  const setSelectedDate = useUIStore((state) => state.setSelectedDate);
  
  const dateLocale = localesMap[language] || ru;
  const weekStartsOn = profile?.settings.weekStartsOn ?? 1;

  useEffect(() => {
    setMounted(true);
    if (!selectedDate) {
      setSelectedDate(new Date());
    }
  }, [selectedDate, setSelectedDate]);

  // Получаем дни недели в зависимости от языка
  const weekDays = useMemo(() => {
    const days = language === 'en' ? weekDaysEn : language === 'uz' ? weekDaysUz : weekDaysRu;
    if (weekStartsOn === 0) {
      // Воскресенье первый день
      return [days[6], ...days.slice(0, 6)];
    }
    return days;
  }, [language, weekStartsOn]);

  // Генерируем дни календаря
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: weekStartsOn as 0 | 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: weekStartsOn as 0 | 1 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth, weekStartsOn]);

  // Получаем задачи для даты
  const getTasksForDate = (date: Date): Task[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return task.dueDate.split('T')[0] === dateStr;
    });
  };

  // Задачи для выбранной даты
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    return getTasksForDate(selectedDate);
  }, [selectedDate, tasks]);

  const pendingTasks = selectedDateTasks.filter(t => t.status !== 'completed');
  const completedTasks = selectedDateTasks.filter(t => t.status === 'completed');

  const handlePrevMonth = () => {
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, 1));
    hapticFeedback?.('selection');
  };

  const handleNextMonth = () => {
    setDirection(1);
    setCurrentMonth(addMonths(currentMonth, 1));
    hapticFeedback?.('selection');
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    hapticFeedback?.('selection');
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
    hapticFeedback?.('impact');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {t('nav.calendar')}
          </h1>
          {!isToday(currentMonth) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={goToToday}
              className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{ 
                backgroundColor: 'var(--primary-subtle)', 
                color: 'var(--primary)' 
              }}
            >
              {t('calendar.today')}
            </motion.button>
          )}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handlePrevMonth}
            className="p-2 rounded-xl"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <ChevronLeftIcon className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </motion.button>
          
          <AnimatePresence mode="wait">
            <motion.h2
              key={format(currentMonth, 'yyyy-MM')}
              initial={{ opacity: 0, x: direction * 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -20 }}
              className="text-lg font-semibold capitalize"
              style={{ color: 'var(--text-primary)' }}
            >
              {format(currentMonth, 'LLLL yyyy', { locale: dateLocale })}
            </motion.h2>
          </AnimatePresence>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleNextMonth}
            className="p-2 rounded-xl"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </motion.button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="px-4 mb-6">
        <div 
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="text-center text-xs font-medium py-2"
                style={{ 
                  color: index >= 5 ? 'var(--error)' : 'var(--text-tertiary)' 
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={format(currentMonth, 'yyyy-MM')}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-7 gap-1"
            >
              {calendarDays.map((date, index) => {
                const dayTasks = getTasksForDate(date);
                const hasPending = dayTasks.some(t => t.status !== 'completed');
                const hasCompleted = dayTasks.some(t => t.status === 'completed');
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const isTodayDate = isToday(date);

                return (
                  <motion.button
                    key={date.toISOString()}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDateSelect(date)}
                    className="aspect-square p-1 rounded-xl flex flex-col items-center justify-center relative transition-all"
                    style={{
                      backgroundColor: isSelected 
                        ? 'var(--primary)' 
                        : isTodayDate 
                          ? 'var(--primary-subtle)' 
                          : 'transparent',
                    }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: isSelected 
                          ? '#FFFFFF' 
                          : !isCurrentMonth 
                            ? 'var(--text-tertiary)' 
                            : isTodayDate 
                              ? 'var(--primary)' 
                              : 'var(--text-primary)',
                      }}
                    >
                      {format(date, 'd')}
                    </span>
                    
                    {/* Task Indicators */}
                    {dayTasks.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {hasPending && (
                          <div 
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ 
                              backgroundColor: isSelected ? '#FFFFFF' : 'var(--primary)' 
                            }}
                          />
                        )}
                        {hasCompleted && (
                          <div 
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ 
                              backgroundColor: isSelected ? 'rgba(255,255,255,0.6)' : 'var(--success)' 
                            }}
                          />
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Selected Date Tasks */}
      <div className="px-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDaysIcon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {selectedDate && format(selectedDate, 'd MMMM', { locale: dateLocale })}
          </h3>
          <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            ({selectedDateTasks.length} {t('tasks.tasks')})
          </span>
        </div>

        {selectedDateTasks.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {pendingTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TaskCard task={task} />
                </motion.div>
              ))}
              {completedTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: (pendingTasks.length + index) * 0.05 }}
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
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <div 
              className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary-subtle)' }}
            >
              <CalendarDaysIcon className="w-7 h-7" style={{ color: 'var(--primary)' }} />
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('empty.noTasksForDate')}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}