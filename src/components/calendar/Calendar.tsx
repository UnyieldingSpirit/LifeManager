// src/components/calendar/Calendar.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  Locale,
} from 'date-fns';
import { ru, enUS, uz } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useTaskStore } from '@/store/taskStore';
import { useUIStore } from '@/store/uiStore';
import { useUserStore } from '@/store/userStore';
import { useTelegram } from '@/hooks/useTelegram';
import { useTranslation } from '@/hooks/useTranslation';

const localesMap: Record<string, Locale> = {
  ru: ru,
  en: enUS,
  uz: uz,
};

export default function Calendar() {
  const { t, language } = useTranslation();
  const { hapticFeedback } = useTelegram();
  const tasks = useTaskStore((state) => state.tasks);
  const selectedDate = useUIStore((state) => state.selectedDate);
  const setSelectedDate = useUIStore((state) => state.setSelectedDate);
  const weekStartsOn = useUserStore((state) => state.profile?.settings.weekStartsOn ?? 1);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [direction, setDirection] = useState(0);

  const locale = localesMap[language] || ru;

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth, weekStartsOn]);

  const weekDays = useMemo(() => {
    const days = t('calendar.dayNames',) as unknown as string[];
    if (weekStartsOn === 1) {
      // Move Sunday to end
      return [...days.slice(1), days[0]];
    }
    return days;
  }, [t, weekStartsOn]);

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return task.dueDate.split('T')[0] === dateStr;
    });
  };

  const handlePrevMonth = () => {
    hapticFeedback('selection');
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    hapticFeedback('selection');
    setDirection(1);
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateSelect = (date: Date) => {
    hapticFeedback('selection');
    setSelectedDate(date);
  };

  const handleGoToToday = () => {
    hapticFeedback('impact', 'light');
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const today = new Date();

  return (
    <div className="bg-[var(--surface)] rounded-3xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-full hover:bg-[var(--surface-secondary)] transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5 text-[var(--text-secondary)]" />
        </button>

        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] capitalize">
            {format(currentMonth, 'LLLL yyyy', { locale })}
          </h2>
          {!isSameMonth(currentMonth, today) && (
            <button
              onClick={handleGoToToday}
              className="px-2 py-1 text-xs font-medium text-[var(--primary)] bg-[var(--primary-subtle)] rounded-full"
            >
              {t('calendar.today')}
            </button>
          )}
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-[var(--surface-secondary)] transition-colors"
        >
          <ChevronRightIcon className="w-5 h-5 text-[var(--text-secondary)]" />
        </button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="text-center text-xs font-medium text-[var(--text-tertiary)] py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentMonth.toISOString()}
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -50 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-1"
        >
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selectedDate);
            const dayTasks = getTasksForDate(day);
            const hasCompletedTasks = dayTasks.some((t) => t.status === 'completed');
            const hasPendingTasks = dayTasks.some((t) => t.status === 'pending');

            return (
              <motion.button
                key={day.toISOString()}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDateSelect(day)}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl transition-colors ${
                  !isCurrentMonth
                    ? 'text-[var(--text-tertiary)] opacity-40'
                    : isSelected
                    ? 'bg-[var(--primary)] text-white'
                    : isToday
                    ? 'bg-[var(--primary-subtle)] text-[var(--primary)]'
                    : 'text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                }`}
              >
                <span
                  className={`text-sm font-medium ${
                    isToday && !isSelected ? 'font-bold' : ''
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {/* Task indicators */}
                {dayTasks.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {hasPendingTasks && (
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-white/80' : 'bg-[var(--primary)]'
                        }`}
                      />
                    )}
                    {hasCompletedTasks && (
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-white/50' : 'bg-[var(--success)]'
                        }`}
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
  );
}