// src/app/calendar/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';

const DAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS_RU = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

export default function CalendarPage() {
  const { hapticFeedback } = useTelegram();
  const profile = useStore((s) => s.profile);
  const events = useStore((s) => s.events);
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  const language = profile?.settings?.language || 'ru';
  const isRu = language === 'ru';

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().split('T')[0]);

  // Генерация дней месяца
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    let startDay = firstDay.getDay() - 1; // Пн = 0
    if (startDay < 0) startDay = 6;

    const days: Array<{ date: string; day: number; isCurrentMonth: boolean; isToday: boolean; hasEvent: boolean }> = [];

    // Дни предыдущего месяца
    const prevMonthLast = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const d = prevMonthLast - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, day: d, isCurrentMonth: false, isToday: false, hasEvent: events.some(e => e.date === dateStr) });
    }

    // Дни текущего месяца
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = dateStr === today.toISOString().split('T')[0];
      days.push({ date: dateStr, day: d, isCurrentMonth: true, isToday, hasEvent: events.some(e => e.date === dateStr) });
    }

    // Заполнить до 42 (6 недель)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, day: d, isCurrentMonth: false, isToday: false, hasEvent: events.some(e => e.date === dateStr) });
    }

    return days;
  }, [currentMonth, currentYear, events]);

  const selectedEvents = useMemo(() => {
    return events.filter(e => e.date === selectedDate);
  }, [events, selectedDate]);

  const prevMonth = () => {
    hapticFeedback?.('selection');
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    hapticFeedback?.('selection');
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  return (
    <div className="page-scrollable" style={{ background: '#0A0A0A' }}>
      <div className="page-content px-4">
        {/* Header */}
        <header className="pt-3 pb-2 flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ color: '#F5F5F5' }}>
            {isRu ? 'Календарь' : 'Calendar'}
          </h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { hapticFeedback?.('medium'); openBottomSheet('add-event'); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#A855F720', border: '1px solid #A855F730' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" style={{ color: '#A855F7' }}>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </motion.button>
        </header>

        {/* Month Navigation */}
        <div className="flex items-center justify-between py-3">
          <button onClick={prevMonth} className="p-2 rounded-lg" style={{ color: '#A3A3A3' }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          <h2 className="text-base font-semibold" style={{ color: '#F5F5F5' }}>
            {MONTHS_RU[currentMonth]} {currentYear}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-lg" style={{ color: '#A3A3A3' }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS_RU.map(d => (
            <div key={d} className="text-center text-[10px] font-medium py-1" style={{ color: '#525252' }}>{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {calendarDays.map((day, i) => {
            const isSelected = day.date === selectedDate;
            return (
              <button
                key={i}
                onClick={() => { setSelectedDate(day.date); hapticFeedback?.('selection'); }}
                className="aspect-square flex flex-col items-center justify-center rounded-lg relative transition-all"
                style={{
                  background: isSelected ? '#A855F720' : day.isToday ? '#C9A96215' : 'transparent',
                  border: isSelected ? '1px solid #A855F750' : day.isToday ? '1px solid #C9A96230' : '1px solid transparent',
                  opacity: day.isCurrentMonth ? 1 : 0.3,
                }}
              >
                <span className="text-xs font-medium" style={{ color: isSelected ? '#A855F7' : day.isToday ? '#C9A962' : '#F5F5F5' }}>
                  {day.day}
                </span>
                {day.hasEvent && (
                  <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: '#A855F7' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Date Agenda */}
        <div className="pb-8">
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#A3A3A3' }}>
            {selectedDate === today.toISOString().split('T')[0] ? (isRu ? 'Сегодня' : 'Today') : selectedDate}
          </h3>

          {selectedEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <span className="text-4xl mb-3 block">📅</span>
              <p className="text-sm font-medium mb-1" style={{ color: '#A3A3A3' }}>
                {isRu ? 'Нет событий' : 'No events'}
              </p>
              <p className="text-xs mb-4" style={{ color: '#525252' }}>
                {isRu ? 'Добавьте встречу или напоминание' : 'Add a meeting or reminder'}
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { hapticFeedback?.('medium'); openBottomSheet('add-event'); }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: '#A855F7', color: 'white' }}
              >
                {isRu ? 'Создать событие' : 'Create Event'}
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-1 h-10 rounded-full" style={{ background: event.color || '#A855F7' }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#F5F5F5' }}>{event.title}</p>
                    {event.time && <p className="text-xs" style={{ color: '#737373' }}>{event.time}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}