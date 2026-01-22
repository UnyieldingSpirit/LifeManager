// src/components/layout/EnhancedMainWrapper.tsx
'use client';

import { ReactNode, useRef, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  MinusCircleIcon,
  PlusCircleIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  CheckIcon,
  ClockIcon,
  FlagIcon,
  FireIcon,
  TagIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import TelegramWebAppInitializer from './TelegramWebAppInitializer';
import OnboardingProvider from '@/components/providers/OnboardingProvider';

// Layout компоненты
import BottomNav from './BottomNav';
import FAB from './FAB';

// UI компоненты
import ToastContainer from '@/components/ui/Toast';
import BottomSheet from '@/components/ui/BottomSheet';

// Единый стор и хуки
import { useStore } from '@/store';
import { useTelegram } from '@/hooks/useTelegram';
import { useTranslation } from '@/hooks/useTranslation';

// ============================================================================
// КОНСТАНТЫ КАТЕГОРИЙ
// ============================================================================

const EXPENSE_CATEGORIES = [
  { id: 'food', icon: '🍔', label: { ru: 'Еда', en: 'Food' }, color: '#F97316' },
  { id: 'transport', icon: '🚗', label: { ru: 'Транспорт', en: 'Transport' }, color: '#3B82F6' },
  { id: 'shopping', icon: '🛒', label: { ru: 'Покупки', en: 'Shopping' }, color: '#EC4899' },
  { id: 'entertainment', icon: '🎬', label: { ru: 'Развлечения', en: 'Entertainment' }, color: '#A855F7' },
  { id: 'health', icon: '💊', label: { ru: 'Здоровье', en: 'Health' }, color: '#10B981' },
  { id: 'bills', icon: '📄', label: { ru: 'Счета', en: 'Bills' }, color: '#EF4444' },
  { id: 'education', icon: '📚', label: { ru: 'Образование', en: 'Education' }, color: '#6366F1' },
  { id: 'other', icon: '📦', label: { ru: 'Другое', en: 'Other' }, color: '#6B7280' },
];

const INCOME_CATEGORIES = [
  { id: 'salary', icon: '💼', label: { ru: 'Зарплата', en: 'Salary' }, color: '#22C55E' },
  { id: 'freelance', icon: '💻', label: { ru: 'Фриланс', en: 'Freelance' }, color: '#14B8A6' },
  { id: 'investment', icon: '📈', label: { ru: 'Инвестиции', en: 'Investment' }, color: '#F59E0B' },
  { id: 'gift', icon: '🎁', label: { ru: 'Подарок', en: 'Gift' }, color: '#EC4899' },
  { id: 'other', icon: '💰', label: { ru: 'Другое', en: 'Other' }, color: '#6B7280' },
];

const HABIT_ICONS = [
  { id: '🏃', label: 'Бег' },
  { id: '💧', label: 'Вода' },
  { id: '📚', label: 'Чтение' },
  { id: '🧘', label: 'Медитация' },
  { id: '💪', label: 'Спорт' },
  { id: '🚭', label: 'Не курить' },
  { id: '🥗', label: 'Питание' },
  { id: '😴', label: 'Сон' },
];

const PRIORITY_OPTIONS = [
  { id: 'urgent', label: { ru: 'Срочно', en: 'Urgent' }, color: '#EF4444' },
  { id: 'high', label: { ru: 'Высокий', en: 'High' }, color: '#F97316' },
  { id: 'medium', label: { ru: 'Средний', en: 'Medium' }, color: '#FBBF24' },
  { id: 'low', label: { ru: 'Низкий', en: 'Low' }, color: '#22C55E' },
];

const CONTACT_GROUPS = [
  { id: 'family', icon: '👨‍👩‍👧', label: { ru: 'Семья', en: 'Family' } },
  { id: 'friends', icon: '👥', label: { ru: 'Друзья', en: 'Friends' } },
  { id: 'work', icon: '💼', label: { ru: 'Работа', en: 'Work' } },
  { id: 'business', icon: '🏢', label: { ru: 'Бизнес', en: 'Business' } },
  { id: 'other', icon: '👤', label: { ru: 'Другое', en: 'Other' } },
];

interface EnhancedMainWrapperProps {
  children: ReactNode;
}

export default function EnhancedMainWrapper({ children }: EnhancedMainWrapperProps) {
  const mainRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prevPath, setPrevPath] = useState('');
  const pathname = usePathname();

  // Хуки
  const { t } = useTranslation();
  const { colorScheme, isReady, hapticFeedback } = useTelegram();
  
  // Единый стор
  const setTheme = useStore((state) => state.setTheme);
  const theme = useStore((state) => state.profile?.settings.theme || 'system');
  const profile = useStore((state) => state.profile);
  const bottomSheet = useStore((state) => state.bottomSheet);
  const closeBottomSheet = useStore((state) => state.closeBottomSheet);
  const addTransaction = useStore((state) => state.addTransaction);
  const addTask = useStore((state) => state.addTask);
  const addHabit = useStore((state) => state.addHabit);
  const addNote = useStore((state) => state.addNote);
  const addContact = useStore((state) => state.addContact);
  const addEvent = useStore((state) => state.addEvent);
  const addToast = useStore((state) => state.addToast);
  
  const language = profile?.settings?.language || 'ru';
  const currency = profile?.finance?.currency || 'UZS';

  // ============================================================================
  // СОСТОЯНИЯ ФОРМ
  // ============================================================================
  
  // Transaction Form
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txDate, setTxDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  
  // Habit Form
  const [habitName, setHabitName] = useState('');
  const [habitIcon, setHabitIcon] = useState('🏃');
  const [habitColor, setHabitColor] = useState('#F97316');
  const [habitGoal, setHabitGoal] = useState('1');
  
  // Note Form
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [notePinned, setNotePinned] = useState(false);
  
  // Contact Form
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactGroup, setContactGroup] = useState('friends');
  const [contactBirthday, setContactBirthday] = useState('');
  
  // Event Form
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [eventTime, setEventTime] = useState('');
  const [eventType, setEventType] = useState<'meeting' | 'birthday' | 'reminder' | 'deadline' | 'trip' | 'other'>('meeting');

  // Reset forms when bottomSheet closes
  useEffect(() => {
    if (!bottomSheet.isOpen) {
      setTxAmount('');
      setTxCategory('');
      setTxDescription('');
      setTxDate(format(new Date(), 'yyyy-MM-dd'));
      setTaskTitle('');
      setTaskPriority('medium');
      setTaskDueDate('');
      setTaskDescription('');
      setHabitName('');
      setHabitIcon('🏃');
      setHabitGoal('1');
      setNoteTitle('');
      setNoteContent('');
      setNotePinned(false);
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setContactGroup('friends');
      setContactBirthday('');
      setEventTitle('');
      setEventDate(format(new Date(), 'yyyy-MM-dd'));
      setEventTime('');
      setEventType('meeting');
    }
  }, [bottomSheet.isOpen]);

  // === TaskFlow: Sync Telegram theme ===
  useEffect(() => {
    if (isReady && theme === 'system') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(colorScheme);
    }
  }, [colorScheme, isReady, theme]);

  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  // === Оригинальная логика: Отслеживаем изменение пути ===
  useEffect(() => {
    if (prevPath && prevPath !== pathname) {
      handleRouteChange();
    }
    
    setPrevPath(pathname);
    
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    
    document.addEventListener('click', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [pathname]);

  // Функция для обработки клика по ссылке или кнопке навигации
  const handleUserInteraction = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' || 
        target.tagName === 'BUTTON' ||
        target.closest('a') || 
        target.closest('button')) {
      
      const link = target.closest('a');
      if (link && link.href && !link.href.startsWith('#') && 
          !link.href.includes('mailto:') && !link.href.includes('tel:') &&
          link.target !== '_blank') {
        handleRouteChange();
      }
    }
  };

  // Функция для обработки изменения маршрута
  const handleRouteChange = () => {
    setIsLoading(true);
    
    // Сбрасываем скролл вверх
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    
    // Скрываем лоадер после перехода
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  // ============================================================================
  // ОБРАБОТЧИКИ ФОРМ
  // ============================================================================
  
  const formatAmount = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (!numbers) return '';
    return parseInt(numbers).toLocaleString('ru-RU');
  };
  
  const handleSubmitTransaction = () => {
    if (!txAmount || !txCategory) {
      hapticFeedback?.('error');
      addToast({ type: 'warning', message: language === 'ru' ? 'Заполните все поля' : 'Fill all fields' });
      return;
    }
    
    const numAmount = parseFloat(txAmount.replace(/[^0-9.]/g, ''));
    if (isNaN(numAmount) || numAmount <= 0) {
      hapticFeedback?.('error');
      return;
    }
    
    hapticFeedback?.('success');
    addTransaction({
      type: txType,
      amount: numAmount,
      category: txCategory,
      description: txDescription || txCategory,
      date: txDate,
      isRecurring: false,
    });
    
    addToast({ type: 'success', message: txType === 'expense' ? (language === 'ru' ? 'Расход добавлен' : 'Expense added') : (language === 'ru' ? 'Доход добавлен' : 'Income added') });
    closeBottomSheet();
  };
  
  const handleSubmitTask = () => {
    if (!taskTitle.trim()) {
      hapticFeedback?.('error');
      addToast({ type: 'warning', message: language === 'ru' ? 'Введите название задачи' : 'Enter task title' });
      return;
    }
    
    hapticFeedback?.('success');
    addTask({
      title: taskTitle,
      description: taskDescription,
      completed: false,
      priority: taskPriority as any,
      dueDate: taskDueDate || undefined,
      isRecurring: false,
    });
    
    addToast({ type: 'success', message: language === 'ru' ? 'Задача добавлена' : 'Task added' });
    closeBottomSheet();
  };
  
  const handleSubmitHabit = () => {
    if (!habitName.trim()) {
      hapticFeedback?.('error');
      addToast({ type: 'warning', message: language === 'ru' ? 'Введите название привычки' : 'Enter habit name' });
      return;
    }
    
    hapticFeedback?.('success');
    addHabit({
      name: habitName,
      icon: habitIcon,
      color: habitColor,
      goalType: 'binary',
      goalValue: parseInt(habitGoal) || 1,
      frequency: 'daily',
      habitType: 'build',
    });
    
    addToast({ type: 'success', message: language === 'ru' ? 'Привычка добавлена' : 'Habit added' });
    closeBottomSheet();
  };
  
  const handleSubmitNote = () => {
    if (!noteContent.trim() && !noteTitle.trim()) {
      hapticFeedback?.('error');
      addToast({ type: 'warning', message: language === 'ru' ? 'Введите текст заметки' : 'Enter note text' });
      return;
    }
    
    hapticFeedback?.('success');
    addNote({
      title: noteTitle || (language === 'ru' ? 'Без названия' : 'Untitled'),
      content: noteContent,
      type: 'text',
      isPinned: notePinned,
    });
    
    addToast({ type: 'success', message: language === 'ru' ? 'Заметка добавлена' : 'Note added' });
    closeBottomSheet();
  };
  
  const handleSubmitContact = () => {
    if (!contactName.trim()) {
      hapticFeedback?.('error');
      addToast({ type: 'warning', message: language === 'ru' ? 'Введите имя контакта' : 'Enter contact name' });
      return;
    }
    
    hapticFeedback?.('success');
    addContact({
      name: contactName,
      phone: contactPhone || undefined,
      email: contactEmail || undefined,
      group: contactGroup as any,
      isFavorite: false,
      birthday: contactBirthday || undefined,
      linkedEventIds: [],
      linkedTransactionIds: [],
      linkedNoteIds: [],
      owesMe: 0,
      iOwe: 0,
    });
    
    addToast({ type: 'success', message: language === 'ru' ? 'Контакт добавлен' : 'Contact added' });
    closeBottomSheet();
  };
  
  const handleSubmitEvent = () => {
    if (!eventTitle.trim()) {
      hapticFeedback?.('error');
      addToast({ type: 'warning', message: language === 'ru' ? 'Введите название события' : 'Enter event title' });
      return;
    }
    
    hapticFeedback?.('success');
    addEvent({
      title: eventTitle,
      date: eventDate,
      startTime: eventTime || undefined,
      allDay: !eventTime,
      type: eventType,
      color: '#C9A962',
      isRecurring: false,
    });
    
    addToast({ type: 'success', message: language === 'ru' ? 'Событие добавлено' : 'Event added' });
    closeBottomSheet();
  };

  // ============================================================================
  // КОНТЕНТ BOTTOMSHEET
  // ============================================================================

  const renderBottomSheetContent = () => {
    const content = bottomSheet.content;
    
    if (content === 'add-transaction') {
      const categories = txType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
      
      return (
        <div className="space-y-5 pb-6">
          {/* Type Toggle */}
          <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--surface-dim)' }}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { hapticFeedback?.('selection'); setTxType('expense'); setTxCategory(''); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all"
              style={{ background: txType === 'expense' ? 'var(--error)' : 'transparent', color: txType === 'expense' ? 'white' : 'var(--text-secondary)' }}
            >
              <MinusCircleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{language === 'ru' ? 'Расход' : 'Expense'}</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { hapticFeedback?.('selection'); setTxType('income'); setTxCategory(''); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all"
              style={{ background: txType === 'income' ? 'var(--success)' : 'transparent', color: txType === 'income' ? 'white' : 'var(--text-secondary)' }}
            >
              <PlusCircleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{language === 'ru' ? 'Доход' : 'Income'}</span>
            </motion.button>
          </div>
          
          {/* Amount */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Сумма' : 'Amount'}</label>
            <div className="relative">
              <input type="text" inputMode="numeric" value={txAmount} onChange={(e) => setTxAmount(formatAmount(e.target.value))} placeholder="0"
                className="w-full px-4 py-4 rounded-xl text-2xl font-bold text-center"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: txType === 'expense' ? 'var(--error)' : 'var(--success)' }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>{currency}</span>
            </div>
          </div>
          
          {/* Category */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Категория' : 'Category'}</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <motion.button key={cat.id} whileTap={{ scale: 0.95 }} onClick={() => { hapticFeedback?.('selection'); setTxCategory(cat.id); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                  style={{ background: txCategory === cat.id ? `${cat.color}20` : 'var(--surface)', border: `1px solid ${txCategory === cat.id ? cat.color : 'var(--border)'}` }}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-[10px] font-medium" style={{ color: txCategory === cat.id ? cat.color : 'var(--text-secondary)' }}>{cat.label[language as 'ru' | 'en']}</span>
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Description */}
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
              <DocumentTextIcon className="w-4 h-4" />{language === 'ru' ? 'Описание' : 'Description'}
            </label>
            <input type="text" value={txDescription} onChange={(e) => setTxDescription(e.target.value)} placeholder={language === 'ru' ? 'Например: Обед в кафе' : 'e.g. Lunch at cafe'}
              className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          
          {/* Date */}
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
              <CalendarDaysIcon className="w-4 h-4" />{language === 'ru' ? 'Дата' : 'Date'}
            </label>
            <input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark' }}
            />
          </div>
          
          {/* Submit */}
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleSubmitTransaction}
            className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{ background: txType === 'expense' ? 'linear-gradient(135deg, var(--error) 0%, #FF8A80 100%)' : 'linear-gradient(135deg, var(--success) 0%, #86EFAC 100%)', color: 'white' }}
          >
            <CheckIcon className="w-5 h-5" />
            {txType === 'expense' ? (language === 'ru' ? 'Добавить расход' : 'Add Expense') : (language === 'ru' ? 'Добавить доход' : 'Add Income')}
          </motion.button>
        </div>
      );
    }
    
    if (content === 'add-task') {
      return (
        <div className="space-y-5 pb-6">
          {/* Title */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Название задачи' : 'Task Title'}</label>
            <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder={language === 'ru' ? 'Что нужно сделать?' : 'What needs to be done?'}
              className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          
          {/* Priority */}
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
              <FlagIcon className="w-4 h-4" />{language === 'ru' ? 'Приоритет' : 'Priority'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITY_OPTIONS.map((p) => (
                <motion.button key={p.id} whileTap={{ scale: 0.95 }} onClick={() => { hapticFeedback?.('selection'); setTaskPriority(p.id); }}
                  className="py-2 px-3 rounded-lg text-xs font-medium transition-all"
                  style={{ background: taskPriority === p.id ? `${p.color}20` : 'var(--surface)', border: `1px solid ${taskPriority === p.id ? p.color : 'var(--border)'}`, color: taskPriority === p.id ? p.color : 'var(--text-secondary)' }}
                >
                  {p.label[language as 'ru' | 'en']}
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Due Date */}
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
              <CalendarDaysIcon className="w-4 h-4" />{language === 'ru' ? 'Срок выполнения' : 'Due Date'}
            </label>
            <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark' }}
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Описание' : 'Description'}</label>
            <textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} placeholder={language === 'ru' ? 'Дополнительные детали...' : 'Additional details...'} rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          
          {/* Submit */}
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleSubmitTask}
            className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, var(--info) 0%, #93C5FD 100%)', color: 'white' }}
          >
            <CheckIcon className="w-5 h-5" />
            {language === 'ru' ? 'Добавить задачу' : 'Add Task'}
          </motion.button>
        </div>
      );
    }
    
    if (content === 'add-habit') {
      return (
        <div className="space-y-5 pb-6">
          {/* Name */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Название привычки' : 'Habit Name'}</label>
            <input type="text" value={habitName} onChange={(e) => setHabitName(e.target.value)} placeholder={language === 'ru' ? 'Например: Бег' : 'e.g. Running'}
              className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          
          {/* Icon */}
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
              <FireIcon className="w-4 h-4" />{language === 'ru' ? 'Иконка' : 'Icon'}
            </label>
            <div className="grid grid-cols-8 gap-2">
              {HABIT_ICONS.map((icon) => (
                <motion.button key={icon.id} whileTap={{ scale: 0.95 }} onClick={() => { hapticFeedback?.('selection'); setHabitIcon(icon.id); }}
                  className="p-3 rounded-xl text-xl transition-all"
                  style={{ background: habitIcon === icon.id ? 'var(--primary-subtle)' : 'var(--surface)', border: `1px solid ${habitIcon === icon.id ? 'var(--primary)' : 'var(--border)'}` }}
                >
                  {icon.id}
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Color */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Цвет' : 'Color'}</label>
            <div className="flex gap-2">
              {['#F97316', '#22C55E', '#3B82F6', '#A855F7', '#EC4899', '#FBBF24'].map((color) => (
                <motion.button key={color} whileTap={{ scale: 0.95 }} onClick={() => { hapticFeedback?.('selection'); setHabitColor(color); }}
                  className="w-10 h-10 rounded-full transition-all" style={{ background: color, border: habitColor === color ? '3px solid white' : 'none', boxShadow: habitColor === color ? `0 0 0 2px ${color}` : 'none' }}
                />
              ))}
            </div>
          </div>
          
          {/* Goal */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Цель в день' : 'Daily Goal'}</label>
            <input type="number" value={habitGoal} onChange={(e) => setHabitGoal(e.target.value)} min="1"
              className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          
          {/* Submit */}
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleSubmitHabit}
            className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${habitColor} 0%, ${habitColor}99 100%)`, color: 'white' }}
          >
            <CheckIcon className="w-5 h-5" />
            {language === 'ru' ? 'Добавить привычку' : 'Add Habit'}
          </motion.button>
        </div>
      );
    }
    
    if (content === 'add-note') {
      return (
        <div className="space-y-5 pb-6">
          {/* Title */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Заголовок' : 'Title'}</label>
            <input type="text" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder={language === 'ru' ? 'Заголовок заметки' : 'Note title'}
              className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          
          {/* Content */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Текст заметки' : 'Note Content'}</label>
            <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder={language === 'ru' ? 'Введите текст...' : 'Enter text...'} rows={5}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          
          {/* Pin */}
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => { hapticFeedback?.('selection'); setNotePinned(!notePinned); }}
            className="w-full flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <BookmarkIcon className="w-5 h-5" style={{ color: notePinned ? 'var(--primary)' : 'var(--text-tertiary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'Закрепить заметку' : 'Pin Note'}</span>
            </div>
            <div className={`w-10 h-6 rounded-full p-1 transition-all ${notePinned ? 'bg-primary' : ''}`} style={{ background: notePinned ? 'var(--primary)' : 'var(--surface-dim)' }}>
              <motion.div animate={{ x: notePinned ? 16 : 0 }} className="w-4 h-4 rounded-full bg-white" />
            </div>
          </motion.button>
          
          {/* Submit */}
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleSubmitNote}
            className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, var(--warning) 0%, #FDE047 100%)', color: '#0A0A0A' }}
          >
            <CheckIcon className="w-5 h-5" />
            {language === 'ru' ? 'Сохранить заметку' : 'Save Note'}
          </motion.button>
        </div>
      );
    }
    
    if (content === 'add-contact') {
      return (
        <div className="space-y-5 pb-6">
          {/* Name */}
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
              <UserIcon className="w-4 h-4" />{language === 'ru' ? 'Имя' : 'Name'}
            </label>
            <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder={language === 'ru' ? 'Имя контакта' : 'Contact name'}
              className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          
          {/* Phone */}
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
              <PhoneIcon className="w-4 h-4" />{language === 'ru' ? 'Телефон' : 'Phone'}
            </label>
            <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+998 90 123 45 67"
              className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          
          {/* Email */}
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
              <EnvelopeIcon className="w-4 h-4" />{language === 'ru' ? 'Email' : 'Email'}
            </label>
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="email@example.com"
              className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          
          {/* Group */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Группа' : 'Group'}</label>
            <div className="grid grid-cols-5 gap-2">
              {CONTACT_GROUPS.map((g) => (
                <motion.button key={g.id} whileTap={{ scale: 0.95 }} onClick={() => { hapticFeedback?.('selection'); setContactGroup(g.id); }}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                  style={{ background: contactGroup === g.id ? 'var(--primary-subtle)' : 'var(--surface)', border: `1px solid ${contactGroup === g.id ? 'var(--primary)' : 'var(--border)'}` }}
                >
                  <span className="text-lg">{g.icon}</span>
                  <span className="text-[9px]" style={{ color: contactGroup === g.id ? 'var(--primary)' : 'var(--text-tertiary)' }}>{g.label[language as 'ru' | 'en']}</span>
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Birthday */}
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
              <CalendarDaysIcon className="w-4 h-4" />{language === 'ru' ? 'День рождения' : 'Birthday'}
            </label>
            <input type="date" value={contactBirthday} onChange={(e) => setContactBirthday(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark' }}
            />
          </div>
          
          {/* Submit */}
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleSubmitContact}
            className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)', color: 'white' }}
          >
            <CheckIcon className="w-5 h-5" />
            {language === 'ru' ? 'Добавить контакт' : 'Add Contact'}
          </motion.button>
        </div>
      );
    }
    
    if (content === 'add-event') {
      const eventTypes = [
        { id: 'meeting', icon: '👥', label: { ru: 'Встреча', en: 'Meeting' } },
        { id: 'birthday', icon: '🎂', label: { ru: 'День рождения', en: 'Birthday' } },
        { id: 'reminder', icon: '🔔', label: { ru: 'Напоминание', en: 'Reminder' } },
        { id: 'deadline', icon: '⏰', label: { ru: 'Дедлайн', en: 'Deadline' } },
        { id: 'trip', icon: '✈️', label: { ru: 'Поездка', en: 'Trip' } },
        { id: 'other', icon: '📅', label: { ru: 'Другое', en: 'Other' } },
      ];
      
      return (
        <div className="space-y-5 pb-6">
          {/* Title */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Название события' : 'Event Title'}</label>
            <input type="text" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder={language === 'ru' ? 'Название события' : 'Event name'}
              className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          
          {/* Type */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Тип события' : 'Event Type'}</label>
            <div className="grid grid-cols-3 gap-2">
              {eventTypes.map((et) => (
                <motion.button key={et.id} whileTap={{ scale: 0.95 }} onClick={() => { hapticFeedback?.('selection'); setEventType(et.id as any); }}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all"
                  style={{ background: eventType === et.id ? 'var(--primary-subtle)' : 'var(--surface)', border: `1px solid ${eventType === et.id ? 'var(--primary)' : 'var(--border)'}` }}
                >
                  <span className="text-xl">{et.icon}</span>
                  <span className="text-[10px]" style={{ color: eventType === et.id ? 'var(--primary)' : 'var(--text-tertiary)' }}>{et.label[language as 'ru' | 'en']}</span>
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Date */}
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
              <CalendarDaysIcon className="w-4 h-4" />{language === 'ru' ? 'Дата' : 'Date'}
            </label>
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark' }}
            />
          </div>
          
          {/* Time */}
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
              <ClockIcon className="w-4 h-4" />{language === 'ru' ? 'Время' : 'Time'}
            </label>
            <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark' }}
            />
          </div>
          
          {/* Submit */}
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleSubmitEvent}
            className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)', color: 'white' }}
          >
            <CheckIcon className="w-5 h-5" />
            {language === 'ru' ? 'Добавить событие' : 'Add Event'}
          </motion.button>
        </div>
      );
    }
    
    return null;
  };
  
  const getBottomSheetTitle = () => {
    const content = bottomSheet.content;
    if (content === 'add-transaction') return language === 'ru' ? 'Новая операция' : 'New Transaction';
    if (content === 'add-task') return language === 'ru' ? 'Новая задача' : 'New Task';
    if (content === 'add-habit') return language === 'ru' ? 'Новая привычка' : 'New Habit';
    if (content === 'add-note') return language === 'ru' ? 'Новая заметка' : 'New Note';
    if (content === 'add-contact') return language === 'ru' ? 'Новый контакт' : 'New Contact';
    if (content === 'add-event') return language === 'ru' ? 'Новое событие' : 'New Event';
    return '';
  };

  // Проверяем, находимся ли на странице онбординга
  const isOnboardingPage = pathname.startsWith('/onboarding') || pathname.startsWith('/welcome');

  return (
    <OnboardingProvider>
      {/* Основной контент с поддержкой скроллинга */}
      <main 
        ref={mainRef}
        className="main-content scrollbar-none relative"
        style={{ 
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          height: '100vh',
        }}
      >
        <TelegramWebAppInitializer />
        {children}
        
        {/* Минималистичный лоадер переходов между страницами */}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="loader">
              <svg width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="loaderGradient">
                    <stop stopColor="#C9A962" stopOpacity="0" offset="0%"/>
                    <stop stopColor="#C9A962" stopOpacity=".631" offset="63.146%"/>
                    <stop stopColor="#C9A962" offset="100%"/>
                  </linearGradient>
                </defs>
                <g fill="none" fillRule="evenodd">
                  <g transform="translate(1 1)">
                    <path d="M36 18c0-9.94-8.06-18-18-18" stroke="url(#loaderGradient)" strokeWidth="3">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 18 18"
                        to="360 18 18"
                        dur="0.9s"
                        repeatCount="indefinite" />
                    </path>
                  </g>
                </g>
              </svg>
            </div>
          </div>
        )}
      </main>

      {/* === TaskFlow компоненты (скрываем на онбординге) === */}
      {!isOnboardingPage && (
        <>
          <BottomNav />
          <FAB />
        </>
      )}
      
      <ToastContainer />
      
      <BottomSheet
        isOpen={bottomSheet.isOpen}
        onClose={closeBottomSheet}
        title={getBottomSheetTitle()}
      >
        {renderBottomSheetContent()}
      </BottomSheet>
    </OnboardingProvider>
  );
}