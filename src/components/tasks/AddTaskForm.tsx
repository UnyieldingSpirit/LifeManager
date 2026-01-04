// src/components/tasks/AddTaskForm.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
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
  Locale,
} from 'date-fns';
import { ru, enUS, uz } from 'date-fns/locale';
import { useTaskStore } from '@/store/taskStore';
import { useUIStore } from '@/store/uiStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useTelegram } from '@/hooks/useTelegram';
import { TaskCategory, TaskPriority, RepeatType } from '@/types';

const localesMap: Record<string, Locale> = { ru, en: enUS, uz };

// === ИКОНКИ ===
const Icons = {
  task: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  event: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  reminder: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  habit: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  purchase: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  call: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  birthday: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18z" /></svg>,
  health: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  finance: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  other: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>,
  calendar: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  clock: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  back: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>,
  forward: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
  check: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  mic: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
  stop: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>,
  edit: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  sparkles: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
};

// Категории
type TaskType = 'task' | 'event' | 'reminder' | 'habit' | 'purchase' | 'call' | 'birthday' | 'health' | 'finance' | 'other';

const taskTypes: { id: TaskType; label: string; category: TaskCategory; color: string }[] = [
  { id: 'task', label: 'Задача', category: 'personal', color: '#6366F1' },
  { id: 'event', label: 'Событие', category: 'work', color: '#3B82F6' },
  { id: 'reminder', label: 'Напоминание', category: 'personal', color: '#F59E0B' },
  { id: 'habit', label: 'Привычка', category: 'health', color: '#10B981' },
  { id: 'purchase', label: 'Покупка', category: 'shopping', color: '#EC4899' },
  { id: 'call', label: 'Звонок', category: 'call', color: '#8B5CF6' },
  { id: 'birthday', label: 'День рождения', category: 'birthday', color: '#F43F5E' },
  { id: 'health', label: 'Здоровье', category: 'health', color: '#EF4444' },
  { id: 'finance', label: 'Финансы', category: 'finance', color: '#22C55E' },
  { id: 'other', label: 'Другое', category: 'other', color: '#64748B' },
];

const priorities: { id: TaskPriority; color: string; label: string }[] = [
  { id: 'low', color: '#10B981', label: 'Низкий' },
  { id: 'medium', color: '#F59E0B', label: 'Средний' },
  { id: 'high', color: '#F97316', label: 'Высокий' },
  { id: 'urgent', color: '#EF4444', label: 'Срочно' },
];

const repeatOptions: { id: RepeatType; label: string }[] = [
  { id: 'none', label: 'Нет' },
  { id: 'daily', label: 'День' },
  { id: 'weekly', label: 'Неделя' },
  { id: 'monthly', label: 'Месяц' },
];

const quickDates = (() => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  return [
    { label: 'Сегодня', date: today },
    { label: 'Завтра', date: tomorrow },
    { label: 'Неделя', date: nextWeek },
  ];
})();

// Моковые результаты распознавания голоса с полными данными
const mockVoiceResults = [
  { title: 'Купить продукты в магазине', type: 'purchase' as TaskType, priority: 'medium' as TaskPriority, time: '14:00', daysOffset: 0 },
  { title: 'Позвонить маме', type: 'call' as TaskType, priority: 'high' as TaskPriority, time: '18:00', daysOffset: 0 },
  { title: 'Сходить в спортзал', type: 'health' as TaskType, priority: 'medium' as TaskPriority, time: '10:00', daysOffset: 1 },
  { title: 'Оплатить счета за квартиру', type: 'finance' as TaskType, priority: 'high' as TaskPriority, time: '12:00', daysOffset: 3 },
  { title: 'Подготовить презентацию к встрече', type: 'task' as TaskType, priority: 'urgent' as TaskPriority, time: '09:00', daysOffset: 1 },
  { title: 'Записаться к врачу', type: 'health' as TaskType, priority: 'high' as TaskPriority, time: '11:00', daysOffset: 2 },
  { title: 'Встреча с командой', type: 'event' as TaskType, priority: 'high' as TaskPriority, time: '15:00', daysOffset: 0 },
  { title: 'Поздравить Сашу с днём рождения', type: 'birthday' as TaskType, priority: 'medium' as TaskPriority, time: '10:00', daysOffset: 5 },
];

type Step = 1 | 2 | 3;
type InputMode = 'manual' | 'voice';
type VoiceState = 'idle' | 'recording' | 'processing' | 'result';
type Overlay = 'none' | 'calendar' | 'time';

// Популярные времена для быстрого выбора
const quickTimes = [
  { label: 'Утро', time: '09:00', icon: '🌅' },
  { label: 'День', time: '13:00', icon: '☀️' },
  { label: 'Вечер', time: '18:00', icon: '🌆' },
  { label: 'Ночь', time: '21:00', icon: '🌙' },
];

const springTransition = { type: "spring" as const, stiffness: 350, damping: 30 };

const contentVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -50 : 50, opacity: 0 }),
};

export default function AddTaskForm() {
  const { t, language } = useTranslation();
  const { hapticFeedback } = useTelegram();
  const locale = localesMap[language] || ru;
  
  const addTask = useTaskStore((state) => state.addTask);
  const closeBottomSheet = useUIStore((state) => state.closeBottomSheet);
  const showToast = useUIStore((state) => state.showToast);

  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(0);
  const [overlay, setOverlay] = useState<Overlay>('none');
  
  const [taskType, setTaskType] = useState<TaskType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueTime, setDueTime] = useState<string>('');
  const [repeat, setRepeat] = useState<RepeatType>('none');
  
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarMonth]);

  const selectedType = taskTypes.find(t => t.id === taskType);

  // Таймер записи
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (voiceState === 'recording') {
      interval = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [voiceState]);

  const startRecording = () => {
    setVoiceState('recording');
    hapticFeedback('impact', 'heavy');
  };

  const stopRecording = () => {
    setVoiceState('processing');
    hapticFeedback('selection');
    
    // Симуляция обработки с полными данными
    setTimeout(() => {
      const randomResult = mockVoiceResults[Math.floor(Math.random() * mockVoiceResults.length)];
      setTitle(randomResult.title);
      setTaskType(randomResult.type);
      setPriority(randomResult.priority);
      setDueTime(randomResult.time);
      
      // Устанавливаем дату с offset
      const resultDate = new Date();
      resultDate.setDate(resultDate.getDate() + randomResult.daysOffset);
      setDueDate(resultDate);
      
      // Устанавливаем время в picker
      const [h, m] = randomResult.time.split(':').map(Number);
      setSelectedHour(h);
      setSelectedMinute(m);
      
      setVoiceState('result');
      hapticFeedback('notification', 'success');
    }, 1500);
  };

  const cancelVoice = () => {
    setInputMode('manual');
    setVoiceState('idle');
    setRecordingTime(0);
    hapticFeedback('selection');
  };

  const acceptVoiceResult = () => {
    setInputMode('manual');
    setVoiceState('idle');
    setStep(2);
    hapticFeedback('selection');
  };

  const retryVoice = () => {
    setVoiceState('idle');
    setTitle('');
    setTaskType(null);
    setPriority('medium');
    setDueDate(null);
    setDueTime('');
    hapticFeedback('selection');
  };

  const goToStep = (newStep: Step) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
    hapticFeedback('selection');
  };

  const handleSubmit = () => {
    if (!title.trim() || !taskType) {
      hapticFeedback('notification', 'error');
      return;
    }
    const typeConfig = taskTypes.find(t => t.id === taskType);
    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      category: typeConfig?.category || 'personal',
      priority,
      dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
      dueTime: dueTime || undefined,
      repeat,
    });
    hapticFeedback('notification', 'success');
    showToast('success', t('messages.taskAdded'));
    closeBottomSheet();
  };

  const applyTime = () => {
    setDueTime(`${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`);
    setOverlay('none');
    hapticFeedback('selection');
  };

  const formattedDate = dueDate ? format(dueDate, 'd MMM', { locale }) : null;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="pb-safe" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 8px), 8px)' }}>
      {/* Прогресс */}
      <div className="flex gap-1 mb-2">
        {[1, 2, 3].map((s) => (
          <motion.div
            key={s}
            className="h-0.5 flex-1 rounded-full"
            animate={{ backgroundColor: step >= s ? 'var(--primary)' : 'var(--border)' }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>

      {/* ОСНОВНОЙ КОНТЕНТ - ФИКСИРОВАННАЯ МИНИМАЛЬНАЯ ВЫСОТА */}
      <div style={{ minHeight: '320px' }}>
        {/* Переключатель режимов (только на шаге 1 в ручном режиме или в голосовом) */}
        {step === 1 && overlay === 'none' && (inputMode === 'manual' || inputMode === 'voice') && (
          <motion.div 
            className="flex gap-1 p-0.5 rounded-lg mb-2"
            style={{ background: 'var(--surface-dim)' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => setInputMode('manual')}
              className="flex-1 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{ 
                background: inputMode === 'manual' ? 'var(--surface)' : 'transparent',
                color: inputMode === 'manual' ? 'var(--primary)' : 'var(--text-tertiary)',
                boxShadow: inputMode === 'manual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              ✏️ Вручную
            </button>
            <button
              onClick={() => { setInputMode('voice'); hapticFeedback('selection'); }}
              className="flex-1 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{ 
                background: inputMode === 'voice' ? 'var(--surface)' : 'transparent',
                color: inputMode === 'voice' ? 'var(--primary)' : 'var(--text-tertiary)',
                boxShadow: inputMode === 'voice' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              🎤 Голосом
            </button>
          </motion.div>
        )}

        {/* РЕЖИМ ГОЛОСОВОГО ВВОДА */}
        <AnimatePresence mode="wait">
          {inputMode === 'voice' && (
            <motion.div
              key="voice-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center py-4"
            >
              <AnimatePresence mode="wait">
                {voiceState === 'idle' && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <p className="text-sm mb-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                      Опишите задачу голосом,<br/>например: "Позвонить маме завтра в 6 вечера"
                    </p>
                    <motion.button
                      onClick={startRecording}
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
                      style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', color: 'white' }}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {Icons.mic}
                    </motion.button>
                    <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                      Нажмите для записи
                    </p>
                  </motion.div>
                )}

                {voiceState === 'recording' && (
                  <motion.div
                    key="recording"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-3 relative"
                      style={{ background: 'var(--error)' }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {/* Пульсирующие кольца */}
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ border: '2px solid var(--error)' }}
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ border: '2px solid var(--error)' }}
                        animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                      />
                      <span className="text-white text-xl font-bold">{formatTime(recordingTime)}</span>
                    </motion.div>
                    <p className="text-sm mb-4" style={{ color: 'var(--error)' }}>
                      🔴 Запись... Говорите
                    </p>
                    <button
                      onClick={stopRecording}
                      className="px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
                      style={{ background: 'var(--surface-dim)', color: 'var(--text-primary)' }}
                    >
                      {Icons.stop}
                      Остановить
                    </button>
                  </motion.div>
                )}

                {voiceState === 'processing' && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                      style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      {Icons.sparkles}
                    </motion.div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      ✨ Распознаю речь...
                    </p>
                  </motion.div>
                )}

                {voiceState === 'result' && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                  >
                    <div className="p-3 rounded-xl mb-3" style={{ background: 'var(--surface-dim)' }}>
                      <p className="text-[10px] mb-1" style={{ color: 'var(--text-tertiary)' }}>✅ Распознано:</p>
                      <p className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</p>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {selectedType && (
                          <span 
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ background: `${selectedType.color}20`, color: selectedType.color }}
                          >
                            {selectedType.label}
                          </span>
                        )}
                        <span 
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: `${priorities.find(p => p.id === priority)?.color}20`, color: priorities.find(p => p.id === priority)?.color }}
                        >
                          {priorities.find(p => p.id === priority)?.label}
                        </span>
                      </div>
                      
                      {/* Дата и время */}
                      <div className="flex gap-2">
                        {dueDate && (
                          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                            📅 {format(dueDate, 'd MMM', { locale })}
                          </span>
                        )}
                        {dueTime && (
                          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                            🕐 {dueTime}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={retryVoice}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                        style={{ background: 'var(--surface-dim)', color: 'var(--text-secondary)' }}
                      >
                        🔄 Заново
                      </button>
                      <button
                        onClick={acceptVoiceResult}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                        style={{ background: 'var(--primary)', color: 'white' }}
                      >
                        ✓ Продолжить
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* РУЧНОЙ РЕЖИМ */}
        <AnimatePresence mode="wait" custom={direction}>
          {inputMode === 'manual' && (
            <>
            {/* ШАГ 1 */}
            {step === 1 && overlay === 'none' && (
              <motion.div
                key="step1"
                custom={direction}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={springTransition}
              >
                {/* Сетка категорий */}
                <p className="text-[10px] text-center mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                  Выберите тип задачи
                </p>
                <div className="grid grid-cols-2 gap-1 mb-2">
                  {taskTypes.map((type) => {
                    const isSelected = taskType === type.id;
                    return (
                      <motion.button
                        key={type.id}
                        onClick={() => { setTaskType(type.id); hapticFeedback('selection'); }}
                        className="flex items-center gap-1.5 p-1.5 rounded-lg"
                        style={{
                          background: isSelected ? `${type.color}15` : 'var(--surface-dim)',
                          border: `1px solid ${isSelected ? type.color : 'transparent'}`,
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div 
                          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                          style={{ 
                            background: isSelected ? type.color : `${type.color}20`,
                            color: isSelected ? 'white' : type.color,
                          }}
                        >
                          {Icons[type.id]}
                        </div>
                        <span 
                          className="text-[11px] font-medium flex-1 text-left"
                          style={{ color: isSelected ? type.color : 'var(--text-primary)' }}
                        >
                          {type.label}
                        </span>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                            style={{ background: type.color, color: 'white' }}
                          >
                            {Icons.check}
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {taskType && (
                    <motion.button
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      onClick={() => goToStep(2)}
                      className="w-full py-2 rounded-xl text-sm font-semibold"
                      style={{ background: 'var(--primary)', color: 'white' }}
                    >
                      Далее
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ШАГ 2 */}
            {step === 2 && overlay === 'none' && (
              <motion.div
                key="step2"
                custom={direction}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={springTransition}
              >
                {selectedType && (
                  <div className="flex items-center gap-1.5 p-1 rounded-lg mb-1.5" style={{ background: `${selectedType.color}10` }}>
                    <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: selectedType.color, color: 'white' }}>
                      {Icons[selectedType.id]}
                    </div>
                    <span className="text-[10px] font-medium" style={{ color: selectedType.color }}>{selectedType.label}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Название"
                    autoFocus
                    className="w-full px-2.5 py-1.5 text-sm rounded-lg outline-none"
                    style={{
                      background: 'var(--surface-dim)',
                      border: `1px solid ${title ? 'var(--primary)' : 'var(--border)'}`,
                      color: 'var(--text-primary)',
                    }}
                  />

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Описание"
                    rows={2}
                    className="w-full px-2.5 py-1.5 text-sm rounded-lg outline-none resize-none"
                    style={{ background: 'var(--surface-dim)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />

                  <div className="flex gap-1">
                    {priorities.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setPriority(p.id); hapticFeedback('selection'); }}
                        className="flex-1 py-1 rounded-md text-[10px] font-medium"
                        style={{
                          background: priority === p.id ? `${p.color}20` : 'var(--surface-dim)',
                          border: `1px solid ${priority === p.id ? p.color : 'transparent'}`,
                          color: priority === p.id ? p.color : 'var(--text-tertiary)',
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {taskType === 'habit' && (
                    <div className="flex gap-1">
                      {repeatOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => { setRepeat(opt.id); hapticFeedback('selection'); }}
                          className="flex-1 py-1 rounded-md text-[10px] font-medium"
                          style={{
                            background: repeat === opt.id ? 'var(--primary)' : 'var(--surface-dim)',
                            color: repeat === opt.id ? 'white' : 'var(--text-tertiary)',
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-1.5 mt-2">
                  <button onClick={() => goToStep(1)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-dim)', color: 'var(--text-secondary)' }}>
                    {Icons.back}
                  </button>
                  <motion.button
                    onClick={() => title.trim() && goToStep(3)}
                    className="flex-1 py-1.5 rounded-lg text-sm font-semibold"
                    animate={{ background: title.trim() ? 'var(--primary)' : 'var(--surface-dim)', color: title.trim() ? 'white' : 'var(--text-tertiary)' }}
                    style={{ opacity: title.trim() ? 1 : 0.6 }}
                  >
                    Далее
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ШАГ 3 */}
            {step === 3 && overlay === 'none' && (
              <motion.div
                key="step3"
                custom={direction}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={springTransition}
              >
                {selectedType && (
                  <div className="flex items-center gap-2 p-2 rounded-lg mb-2" style={{ background: 'var(--surface-dim)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: selectedType.color, color: 'white' }}>
                      {Icons[selectedType.id]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{title}</p>
                      <p className="text-[10px]" style={{ color: priorities.find(p => p.id === priority)?.color }}>
                        {priorities.find(p => p.id === priority)?.label}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-1.5 mb-2">
                  {quickDates.map((qd, i) => {
                    const isSelected = dueDate && isSameDay(dueDate, qd.date);
                    return (
                      <button
                        key={i}
                        onClick={() => { setDueDate(qd.date); hapticFeedback('selection'); }}
                        className="flex-1 py-1.5 rounded-md text-xs font-medium"
                        style={{ background: isSelected ? 'var(--primary)' : 'var(--surface-dim)', color: isSelected ? 'white' : 'var(--text-secondary)' }}
                      >
                        {qd.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <button
                    onClick={() => { setOverlay('calendar'); hapticFeedback('selection'); }}
                    className="flex items-center justify-center gap-1 py-2 rounded-lg text-sm"
                    style={{ background: 'var(--surface-dim)', border: `1px solid ${dueDate ? 'var(--primary)' : 'var(--border)'}`, color: dueDate ? 'var(--primary)' : 'var(--text-tertiary)' }}
                  >
                    {Icons.calendar}
                    <span>{formattedDate || 'Дата'}</span>
                  </button>
                  <button
                    onClick={() => { setOverlay('time'); hapticFeedback('selection'); }}
                    className="flex items-center justify-center gap-1 py-2 rounded-lg text-sm"
                    style={{ background: 'var(--surface-dim)', border: `1px solid ${dueTime ? 'var(--primary)' : 'var(--border)'}`, color: dueTime ? 'var(--primary)' : 'var(--text-tertiary)' }}
                  >
                    {Icons.clock}
                    <span>{dueTime || 'Время'}</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => goToStep(2)} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-dim)', color: 'var(--text-secondary)' }}>
                    {Icons.back}
                  </button>
                  <button onClick={handleSubmit} className="flex-1 py-2 rounded-lg text-sm font-semibold" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', color: 'white' }}>
                    Создать
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* ОВЕРЛЕЙ КАЛЕНДАРЯ */}
      <AnimatePresence>
        {overlay === 'calendar' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-x-3 top-1/2 -translate-y-1/2 z-50 bg-[var(--surface)] rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => { setCalendarMonth(subMonths(calendarMonth, 1)); hapticFeedback('selection'); }} className="p-1.5" style={{ color: 'var(--text-secondary)' }}>{Icons.back}</button>
              <span className="text-sm font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{format(calendarMonth, 'LLLL yyyy', { locale })}</span>
              <button onClick={() => { setCalendarMonth(addMonths(calendarMonth, 1)); hapticFeedback('selection'); }} className="p-1.5" style={{ color: 'var(--text-secondary)' }}>{Icons.forward}</button>
            </div>
            <div className="grid grid-cols-7 px-2">
              {weekDays.map((d, i) => (
                <div key={i} className="text-center text-[10px] py-1" style={{ color: i >= 5 ? 'var(--error)' : 'var(--text-tertiary)' }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5 px-2 pb-2">
              {calendarDays.map((date) => {
                const isSelected = dueDate && isSameDay(date, dueDate);
                const isTodayDate = isToday(date);
                const isPast = isBefore(date, startOfDay(new Date())) && !isTodayDate;
                const isCurrentMonth = isSameMonth(date, calendarMonth);
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => { if (!isPast) { setDueDate(date); hapticFeedback('selection'); } }}
                    disabled={isPast}
                    className="aspect-square flex items-center justify-center rounded-md text-xs"
                    style={{
                      background: isSelected ? 'var(--primary)' : isTodayDate ? 'var(--primary-subtle)' : 'transparent',
                      color: isSelected ? 'white' : isPast || !isCurrentMonth ? 'var(--text-tertiary)' : isTodayDate ? 'var(--primary)' : 'var(--text-primary)',
                      opacity: isPast ? 0.4 : 1,
                    }}
                  >
                    {format(date, 'd')}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 px-3 py-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => { setDueDate(null); setOverlay('none'); }} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'var(--surface-dim)', color: 'var(--text-secondary)' }}>Очистить</button>
              <button onClick={() => setOverlay('none')} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'var(--primary)', color: 'white' }}>Готово</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ОВЕРЛЕЙ ВРЕМЕНИ - iOS style picker */}
      <AnimatePresence>
        {overlay === 'time' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-x-3 top-1/2 -translate-y-1/2 z-50 bg-[var(--surface)] rounded-2xl shadow-2xl overflow-hidden"
            style={{ maxWidth: '320px', margin: '0 auto', left: 0, right: 0 }}
          >
            {/* Текущее время */}
            <div className="pt-4 pb-2 text-center">
              <span className="text-4xl font-bold tracking-tight" style={{ color: 'var(--primary)' }}>
                {selectedHour.toString().padStart(2, '0')}
                <span className="animate-pulse">:</span>
                {selectedMinute.toString().padStart(2, '0')}
              </span>
            </div>
            
            {/* Быстрый выбор */}
            <div className="grid grid-cols-4 gap-1.5 px-3 py-2">
              {quickTimes.map((qt) => {
                const isSelected = dueTime === qt.time;
                return (
                  <button
                    key={qt.time}
                    onClick={() => { 
                      const [h, m] = qt.time.split(':').map(Number);
                      setSelectedHour(h);
                      setSelectedMinute(m);
                      setDueTime(qt.time);
                      hapticFeedback('selection'); 
                    }}
                    className="flex flex-col items-center py-2 rounded-xl"
                    style={{
                      background: isSelected ? 'var(--primary)' : 'var(--surface-dim)',
                      color: isSelected ? 'white' : 'var(--text-secondary)',
                    }}
                  >
                    <span className="text-base">{qt.icon}</span>
                    <span className="text-[10px] font-medium mt-0.5">{qt.label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Wheel picker */}
            <div className="relative px-3 py-2">
              {/* Выделение центра */}
              <div 
                className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-10 rounded-lg pointer-events-none"
                style={{ background: 'var(--primary-subtle)', border: '1px solid var(--primary)' }}
              />
              
              <div className="flex gap-2">
                {/* Часы */}
                <div className="flex-1 relative">
                  <div className="h-32 overflow-y-auto scrollbar-hide snap-y snap-mandatory" 
                    style={{ scrollSnapType: 'y mandatory' }}
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      const scrollTop = el.scrollTop;
                      const itemHeight = 40;
                      const hour = Math.round(scrollTop / itemHeight);
                      if (hour >= 0 && hour <= 23 && hour !== selectedHour) {
                        setSelectedHour(hour);
                        hapticFeedback('selection');
                      }
                    }}
                  >
                    <div className="h-11" /> {/* Spacer top */}
                    {Array.from({ length: 24 }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelectedHour(i); hapticFeedback('selection'); }}
                        className="w-full h-10 flex items-center justify-center snap-center"
                        style={{
                          color: selectedHour === i ? 'var(--primary)' : 'var(--text-tertiary)',
                          fontWeight: selectedHour === i ? 700 : 400,
                          fontSize: selectedHour === i ? '20px' : '16px',
                          transition: 'all 0.15s',
                        }}
                      >
                        {i.toString().padStart(2, '0')}
                      </button>
                    ))}
                    <div className="h-11" /> {/* Spacer bottom */}
                  </div>
                </div>
                
                {/* Разделитель */}
                <div className="flex items-center">
                  <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>:</span>
                </div>
                
                {/* Минуты */}
                <div className="flex-1 relative">
                  <div className="h-32 overflow-y-auto scrollbar-hide snap-y snap-mandatory"
                    style={{ scrollSnapType: 'y mandatory' }}
                  >
                    <div className="h-11" /> {/* Spacer top */}
                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                      <button
                        key={m}
                        onClick={() => { setSelectedMinute(m); hapticFeedback('selection'); }}
                        className="w-full h-10 flex items-center justify-center snap-center"
                        style={{
                          color: selectedMinute === m ? 'var(--primary)' : 'var(--text-tertiary)',
                          fontWeight: selectedMinute === m ? 700 : 400,
                          fontSize: selectedMinute === m ? '20px' : '16px',
                          transition: 'all 0.15s',
                        }}
                      >
                        {m.toString().padStart(2, '0')}
                      </button>
                    ))}
                    <div className="h-11" /> {/* Spacer bottom */}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 px-3 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <button 
                onClick={() => { setDueTime(''); setOverlay('none'); }} 
                className="flex-1 py-2.5 rounded-xl text-sm font-medium" 
                style={{ background: 'var(--surface-dim)', color: 'var(--text-secondary)' }}
              >
                Очистить
              </button>
              <button 
                onClick={applyTime} 
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold" 
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                Готово
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>{/* Конец minHeight контейнера */}

      {/* Затемнение */}
      <AnimatePresence>
        {overlay !== 'none' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setOverlay('none')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}