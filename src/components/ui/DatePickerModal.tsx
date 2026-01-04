// src/components/ui/DatePickerModal.tsx
'use client';

import { useState, useMemo } from 'react';
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
  isBefore,
  startOfDay,
} from 'date-fns';
import { ru, enUS, uz } from 'date-fns/locale';
import { useTranslation } from '@/hooks/useTranslation';
import { useTelegram } from '@/hooks/useTelegram';

const localesMap: Record<string, Locale> = { ru, en: enUS, uz };

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  minDate?: Date;
}

// Быстрые опции выбора даты
const quickOptions = [
  { labelKey: 'datePicker.today', getValue: () => new Date() },
  { labelKey: 'datePicker.tomorrow', getValue: () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }},
  { labelKey: 'datePicker.nextWeek', getValue: () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  }},
  { labelKey: 'datePicker.nextMonth', getValue: () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d;
  }},
];

export default function DatePickerModal({
  isOpen,
  onClose,
  selectedDate,
  onSelect,
  minDate,
}: DatePickerModalProps) {
  const { t, language } = useTranslation();
  const { hapticFeedback } = useTelegram();
  const locale = localesMap[language] || ru;
  
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [viewDate, setViewDate] = useState<Date | null>(selectedDate);
  
  const weekDays = useMemo(() => {
    const days = language === 'en' 
      ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
      : language === 'uz'
      ? ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh']
      : ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    // Начало с понедельника
    return [...days.slice(1), days[0]];
  }, [language]);
  
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);
  
  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    hapticFeedback('selection');
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    hapticFeedback('selection');
  };
  
  const handleDateSelect = (date: Date) => {
    if (minDate && isBefore(date, startOfDay(minDate))) return;
    setViewDate(date);
    hapticFeedback('selection');
  };
  
  const handleConfirm = () => {
    if (viewDate) {
      onSelect(viewDate);
      hapticFeedback('notification', 'success');
    }
    onClose();
  };
  
  const handleQuickSelect = (date: Date) => {
    setViewDate(date);
    setCurrentMonth(date);
    hapticFeedback('impact', 'light');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed left-3 right-3 z-[61] max-w-sm mx-auto rounded-2xl overflow-hidden"
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'var(--glass-bg-heavy)',
              backdropFilter: 'blur(var(--glass-blur-heavy))',
              WebkitBackdropFilter: 'blur(var(--glass-blur-heavy))',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--glass-shadow-lg)',
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <button
                onClick={handlePrevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h3 
                className="text-sm font-semibold capitalize"
                style={{ color: 'var(--text-primary)' }}
              >
                {format(currentMonth, 'LLLL yyyy', { locale })}
              </h3>
              
              <button
                onClick={handleNextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Quick Options */}
            <div 
              className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-hide"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              {quickOptions.map((option, index) => {
                const optionDate = option.getValue();
                const isSelected = viewDate && isSameDay(viewDate, optionDate);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleQuickSelect(optionDate)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: isSelected ? 'var(--primary)' : 'var(--surface-dim)',
                      color: isSelected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    }}
                  >
                    {t(option.labelKey)}
                  </button>
                );
              })}
            </div>
            
            {/* Week Days */}
            <div className="grid grid-cols-7 gap-0 px-2 pt-2">
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className="text-center text-[10px] font-medium py-1"
                  style={{ 
                    color: index >= 5 ? 'var(--error)' : 'var(--text-tertiary)' 
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0.5 p-2">
              {calendarDays.map((date) => {
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const isSelected = viewDate && isSameDay(date, viewDate);
                const isTodayDate = isToday(date);
                const isDisabled = minDate && isBefore(date, startOfDay(minDate));
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => !isDisabled && handleDateSelect(date)}
                    disabled={isDisabled}
                    className="aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all relative"
                    style={{
                      background: isSelected 
                        ? 'var(--primary)' 
                        : isTodayDate 
                        ? 'var(--primary-subtle)' 
                        : 'transparent',
                      color: isSelected 
                        ? 'var(--text-inverse)' 
                        : isDisabled
                        ? 'var(--text-tertiary)'
                        : !isCurrentMonth 
                        ? 'var(--text-tertiary)' 
                        : isTodayDate 
                        ? 'var(--primary)' 
                        : isWeekend
                        ? 'var(--error)'
                        : 'var(--text-primary)',
                      opacity: isDisabled ? 0.4 : 1,
                    }}
                  >
                    {format(date, 'd')}
                    {isTodayDate && !isSelected && (
                      <div 
                        className="absolute bottom-1 w-1 h-1 rounded-full"
                        style={{ background: 'var(--primary)' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Selected Date Display */}
            {viewDate && (
              <div 
                className="mx-3 mb-2 px-3 py-2 rounded-xl text-center"
                style={{ background: 'var(--surface-dim)' }}
              >
                <span 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {format(viewDate, 'EEEE, d MMMM yyyy', { locale })}
                </span>
              </div>
            )}
            
            {/* Actions */}
            <div 
              className="flex gap-2 p-3"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ 
                  background: 'var(--surface-dim)',
                  color: 'var(--text-secondary)',
                }}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleConfirm}
                disabled={!viewDate}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ 
                  background: viewDate ? 'var(--primary)' : 'var(--surface-dim)',
                  color: viewDate ? 'var(--text-inverse)' : 'var(--text-tertiary)',
                  opacity: viewDate ? 1 : 0.6,
                }}
              >
                {t('common.done')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}