// src/app/calendar/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon, ClockIcon, BellIcon, TrashIcon, UserGroupIcon, CakeIcon, PaperAirplaneIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';

const EVENT_TYPE_ICONS: Record<string, React.ComponentType<any>> = { meeting: UserGroupIcon, birthday: CakeIcon, trip: PaperAirplaneIcon, deadline: ExclamationCircleIcon, reminder: BellIcon, other: CalendarDaysIcon };
const EVENT_TYPE_COLORS: Record<string, string> = { meeting: '#3B82F6', birthday: '#EC4899', trip: '#14B8A6', deadline: '#EF4444', reminder: '#F97316', other: '#8B5CF6' };
const EVENT_TYPE_LABELS = { ru: { meeting: 'Встреча', birthday: 'День рождения', trip: 'Поездка', deadline: 'Дедлайн', reminder: 'Напоминание', other: 'Другое' }, en: { meeting: 'Meeting', birthday: 'Birthday', trip: 'Trip', deadline: 'Deadline', reminder: 'Reminder', other: 'Other' } };

export default function CalendarPage() {
  const { hapticFeedback } = useTelegram();
  const profile = useStore((s) => s.profile);
  const events = useStore((s) => s.events);
  const deleteEvent = useStore((s) => s.deleteEvent);
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  const addToast = useStore((s) => s.addToast);
  
  const language = profile?.settings?.language || 'ru';
  const dateLocale = language === 'ru' ? ru : enUS;
  const typeLabels = language === 'ru' ? EVENT_TYPE_LABELS.ru : EVENT_TYPE_LABELS.en;
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);
  
  const eventsMap = useMemo(() => {
    const map = new Map<string, typeof events>();
    events.forEach(event => { const key = event.date; if (!map.has(key)) map.set(key, []); map.get(key)!.push(event); });
    return map;
  }, [events]);
  
  const selectedDayEvents = useMemo(() => { if (!selectedDate) return []; return eventsMap.get(format(selectedDate, 'yyyy-MM-dd')) || []; }, [selectedDate, eventsMap]);
  
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    return events.filter(e => { const diff = Math.ceil((parseISO(e.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)); return diff >= 0 && diff <= 7; }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);
  }, [events]);
  
  const handleDeleteEvent = (id: string) => { hapticFeedback?.('notification', 'warning'); deleteEvent(id); addToast({ type: 'info', message: language === 'ru' ? 'Событие удалено' : 'Event deleted' }); };
  const weekDays = language === 'ru' ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="" >
      <div className="">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[50%]" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(168, 85, 247, 0.15) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/3" style={{ background: 'radial-gradient(ellipse at bottom right, rgba(59, 130, 246, 0.1) 0%, transparent 50%)' }} />
      </div>
      
      <div className="page-scrollable">
        <header className="px-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2"><CalendarDaysIcon className="w-6 h-6" style={{ color: '#A855F7' }} /><h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'Календарь' : 'Calendar'}</h1></div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{events.length} {language === 'ru' ? 'событий' : 'events'}</p>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { hapticFeedback?.('medium'); openBottomSheet('add-event'); }} className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)' }}><PlusIcon className="w-5 h-5 text-white" /></motion.button>
          </div>
        </header>
        
        <main className="px-4 space-y-4 pb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => { hapticFeedback?.('selection'); setCurrentMonth(subMonths(currentMonth, 1)); }} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-dim)' }}><ChevronLeftIcon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} /></motion.button>
            <p className="text-base font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{format(currentMonth, 'LLLL yyyy', { locale: dateLocale })}</p>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => { hapticFeedback?.('selection'); setCurrentMonth(addMonths(currentMonth, 1)); }} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-dim)' }}><ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} /></motion.button>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <div className="grid grid-cols-7 mb-2">{weekDays.map((day) => (<div key={day} className="text-center py-2"><span className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>{day}</span></div>))}</div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const dayKey = format(day, 'yyyy-MM-dd'); const dayEvents = eventsMap.get(dayKey) || []; const isCurrentMonth = isSameMonth(day, currentMonth); const isSelected = selectedDate && isSameDay(day, selectedDate); const isTodayDate = isToday(day);
                return (
                  <motion.button key={day.toISOString()} whileTap={{ scale: 0.95 }} onClick={() => { hapticFeedback?.('selection'); setSelectedDate(day); }} className="aspect-square rounded-lg flex flex-col items-center justify-center relative" style={{ background: isSelected ? 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)' : isTodayDate ? 'var(--primary-subtle)' : 'transparent', opacity: isCurrentMonth ? 1 : 0.3 }}>
                    <span className="text-sm font-medium" style={{ color: isSelected ? 'white' : isTodayDate ? 'var(--primary)' : 'var(--text-primary)' }}>{format(day, 'd')}</span>
                    {dayEvents.length > 0 && (<div className="flex gap-0.5 absolute bottom-1">{dayEvents.slice(0, 3).map((event, i) => (<div key={i} className="w-1 h-1 rounded-full" style={{ background: EVENT_TYPE_COLORS[event.type] || '#A855F7' }} />))}</div>)}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
          
          <AnimatePresence mode="wait">
            {selectedDate && (
              <motion.div key={selectedDate.toISOString()} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 rounded-xl" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{format(selectedDate, 'd MMMM, EEEE', { locale: dateLocale })}</h3>{isToday(selectedDate) && (<span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>{language === 'ru' ? 'Сегодня' : 'Today'}</span>)}</div>
                {selectedDayEvents.length > 0 ? (
                  <div className="space-y-2">{selectedDayEvents.map((event, index) => { const Icon = EVENT_TYPE_ICONS[event.type] || CalendarDaysIcon; const color = EVENT_TYPE_COLORS[event.type] || '#A855F7'; return (
                    <motion.div key={event.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center justify-between p-3 rounded-lg" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}25` }}><Icon className="w-5 h-5" style={{ color }} /></div><div><p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{event.title}</p><div className="flex items-center gap-2 mt-0.5">{event.startTime && (<span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}><ClockIcon className="w-3 h-3" />{event.startTime}</span>)}<span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${color}20`, color }}>{typeLabels[event.type as keyof typeof typeLabels]}</span></div></div></div>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDeleteEvent(event.id)} className="w-8 h-8 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100" style={{ background: 'var(--error-subtle)' }}><TrashIcon className="w-4 h-4" style={{ color: 'var(--error)' }} /></motion.button>
                    </motion.div>); })}</div>
                ) : (<p className="text-center py-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Нет событий' : 'No events'}</p>)}
              </motion.div>
            )}
          </AnimatePresence>
          
          {upcomingEvents.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'Ближайшие события' : 'Upcoming Events'}</h3>
              <div className="space-y-2">{upcomingEvents.map((event, index) => { const Icon = EVENT_TYPE_ICONS[event.type] || CalendarDaysIcon; const color = EVENT_TYPE_COLORS[event.type] || '#A855F7'; const eventDate = parseISO(event.date); const daysUntil = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)); return (
                <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--surface-secondary)' }}>
                  <div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}><Icon className="w-4 h-4" style={{ color }} /></div><div><p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{event.title}</p><p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{format(eventDate, 'd MMM', { locale: dateLocale })}{event.startTime && ` • ${event.startTime}`}</p></div></div>
                  <span className="text-[10px] px-2 py-1 rounded-full font-medium" style={{ background: daysUntil === 0 ? `${color}30` : `${color}15`, color }}>{daysUntil === 0 ? (language === 'ru' ? 'Сегодня' : 'Today') : daysUntil === 1 ? (language === 'ru' ? 'Завтра' : 'Tomorrow') : `${daysUntil} ${language === 'ru' ? 'дн.' : 'days'}`}</span>
                </motion.div>); })}</div>
            </motion.div>
          )}
          
          {events.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-xl text-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)', boxShadow: '0 8px 30px rgba(168, 85, 247, 0.3)' }}><CalendarDaysIcon className="w-10 h-10" style={{ color: '#A855F7' }} /></div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'Нет событий' : 'No Events'}</h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Добавьте первое событие' : 'Add your first event'}</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => openBottomSheet('add-event')} className="px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mx-auto" style={{ background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)', color: 'white', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)' }}><PlusIcon className="w-5 h-5" />{language === 'ru' ? 'Добавить событие' : 'Add Event'}</motion.button>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}