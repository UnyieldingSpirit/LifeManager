// src/components/layout/EnhancedMainWrapper.tsx
'use client';

import { ReactNode, useRef, useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  MinusCircleIcon, PlusCircleIcon, CalendarDaysIcon, DocumentTextIcon,
  CheckIcon, ClockIcon, FlagIcon, FireIcon, UserIcon, PhoneIcon,
  EnvelopeIcon, BookmarkIcon, BanknotesIcon, CheckCircleIcon,
  CurrencyDollarIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import TelegramWebAppInitializer from './TelegramWebAppInitializer';
import OnboardingProvider from '@/components/providers/OnboardingProvider';
import BottomNav from './BottomNav';
import FAB from './FAB';
import ToastContainer from '@/components/ui/Toast';
import BottomSheet from '@/components/ui/BottomSheet';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks/useTelegram';
import { authService, setApiToken, transactionService, goalService } from '@/services';
import { createTransactionApi, createGoalApi, contributeToGoalApi } from '@/store/apiActions';
import { tokenStorage } from '@/lib/api';

// ============================================================================
// КОНСТАНТЫ КАТЕГОРИЙ
// Полный список — фильтрация по profile.finance.expenseCategories происходит
// динамически в renderBottomSheetContent
// ============================================================================

const EXPENSE_CATEGORIES = [
  { id: 'food',          icon: '🍔', label: { ru: 'Еда',          en: 'Food'          }, color: '#F97316' },
  { id: 'transport',     icon: '🚗', label: { ru: 'Транспорт',    en: 'Transport'     }, color: '#3B82F6' },
  { id: 'housing',       icon: '🏠', label: { ru: 'Жильё',        en: 'Housing'       }, color: '#8B5CF6' },
  { id: 'utilities',     icon: '💡', label: { ru: 'Коммуналка',   en: 'Utilities'     }, color: '#EF4444' },
  { id: 'shopping',      icon: '🛒', label: { ru: 'Покупки',      en: 'Shopping'      }, color: '#EC4899' },
  { id: 'entertainment', icon: '🎬', label: { ru: 'Развлечения',  en: 'Entertainment' }, color: '#A855F7' },
  { id: 'health',        icon: '💊', label: { ru: 'Здоровье',     en: 'Health'        }, color: '#10B981' },
  { id: 'bills',         icon: '📄', label: { ru: 'Счета',        en: 'Bills'         }, color: '#EF4444' },
  { id: 'education',     icon: '📚', label: { ru: 'Образование',  en: 'Education'     }, color: '#6366F1' },
  { id: 'other',         icon: '📦', label: { ru: 'Другое',       en: 'Other'         }, color: '#6B7280' },
];

const INCOME_CATEGORIES = [
  { id: 'salary',     icon: '💼', label: { ru: 'Зарплата',   en: 'Salary'     }, color: '#22C55E' },
  { id: 'freelance',  icon: '💻', label: { ru: 'Фриланс',    en: 'Freelance'  }, color: '#14B8A6' },
  { id: 'investment', icon: '📈', label: { ru: 'Инвестиции', en: 'Investment' }, color: '#F59E0B' },
  { id: 'gift',       icon: '🎁', label: { ru: 'Подарок',    en: 'Gift'       }, color: '#EC4899' },
  { id: 'refund',     icon: '↩️', label: { ru: 'Возврат',    en: 'Refund'     }, color: '#6366F1' },
  { id: 'other',      icon: '💰', label: { ru: 'Другое',     en: 'Other'      }, color: '#6B7280' },
];

const HABIT_ICONS = [
  { id: '🏃' }, { id: '💧' }, { id: '📚' }, { id: '🧘' },
  { id: '💪' }, { id: '🚭' }, { id: '🥗' }, { id: '😴' },
];

const HABIT_COLORS = ['#F97316','#3B82F6','#22C55E','#A855F7','#EF4444','#F59E0B','#14B8A6','#EC4899'];

const PRIORITY_OPTIONS = [
  { id: 'urgent', label: { ru: 'Срочно',  en: 'Urgent' }, color: '#EF4444' },
  { id: 'high',   label: { ru: 'Высокий', en: 'High'   }, color: '#F97316' },
  { id: 'medium', label: { ru: 'Средний', en: 'Medium' }, color: '#FBBF24' },
  { id: 'low',    label: { ru: 'Низкий',  en: 'Low'    }, color: '#22C55E' },
];

const CONTACT_GROUPS = [
  { id: 'family',   icon: '👨‍👩‍👧', label: { ru: 'Семья',   en: 'Family'   } },
  { id: 'friends',  icon: '👥',    label: { ru: 'Друзья',  en: 'Friends'  } },
  { id: 'work',     icon: '💼',    label: { ru: 'Работа',  en: 'Work'     } },
  { id: 'business', icon: '🏢',    label: { ru: 'Бизнес',  en: 'Business' } },
  { id: 'other',    icon: '👤',    label: { ru: 'Другое',  en: 'Other'    } },
];

const GOAL_ICONS = [
  { id: '🏠' }, { id: '🚗' }, { id: '✈️' }, { id: '💻' },
  { id: '🎓' }, { id: '💍' }, { id: '🏥' }, { id: '💰' },
];

const DEBT_TYPES = [
  { id: 'credit',   label: { ru: 'Кредит',     en: 'Credit'   }, icon: '💳' },
  { id: 'loan',     label: { ru: 'Займ',        en: 'Loan'     }, icon: '🏦' },
  { id: 'mortgage', label: { ru: 'Ипотека',     en: 'Mortgage' }, icon: '🏠' },
  { id: 'lent',     label: { ru: 'Дал в долг',  en: 'Lent'     }, icon: '📤' },
  { id: 'borrowed', label: { ru: 'Взял в долг', en: 'Borrowed' }, icon: '📥' },
];

const EVENT_TYPES = [
  { id: 'meeting',  icon: '👥', label: { ru: 'Встреча',       en: 'Meeting'  } },
  { id: 'birthday', icon: '🎂', label: { ru: 'День рождения', en: 'Birthday' } },
  { id: 'reminder', icon: '🔔', label: { ru: 'Напоминание',   en: 'Reminder' } },
  { id: 'deadline', icon: '⏰', label: { ru: 'Дедлайн',       en: 'Deadline' } },
  { id: 'trip',     icon: '✈️', label: { ru: 'Поездка',       en: 'Trip'     } },
  { id: 'other',    icon: '📅', label: { ru: 'Другое',        en: 'Other'    } },
];

type BottomSheetContentType =
  | 'quick-add' | 'add-transaction' | 'add-task' | 'add-event'
  | 'add-habit'  | 'add-note'        | 'add-contact' | 'add-goal' | 'add-debt' | null;

const QUICK_ADD_ITEMS: Array<{
  id: string; icon: typeof MinusCircleIcon;
  label: { ru: string; en: string }; color: string; content: BottomSheetContentType;
}> = [
  { id: 'expense', icon: MinusCircleIcon,  label: { ru: 'Расход',   en: 'Expense'  }, color: '#EF4444', content: 'add-transaction' },
  { id: 'income',  icon: PlusCircleIcon,   label: { ru: 'Доход',    en: 'Income'   }, color: '#22C55E', content: 'add-transaction' },
  { id: 'task',    icon: CheckCircleIcon,  label: { ru: 'Задача',   en: 'Task'     }, color: '#3B82F6', content: 'add-task'        },
  { id: 'event',   icon: CalendarDaysIcon, label: { ru: 'Событие',  en: 'Event'    }, color: '#A855F7', content: 'add-event'       },
  { id: 'habit',   icon: FireIcon,         label: { ru: 'Привычка', en: 'Habit'    }, color: '#F97316', content: 'add-habit'       },
  { id: 'note',    icon: DocumentTextIcon, label: { ru: 'Заметка',  en: 'Note'     }, color: '#FBBF24', content: 'add-note'        },
  { id: 'contact', icon: UserIcon,         label: { ru: 'Контакт',  en: 'Contact'  }, color: '#EC4899', content: 'add-contact'     },
  { id: 'goal',    icon: FlagIcon,         label: { ru: 'Цель',     en: 'Goal'     }, color: '#14B8A6', content: 'add-goal'        },
];

const inputStyle: React.CSSProperties = { fontSize: '16px' };

interface EnhancedMainWrapperProps { children: ReactNode; }

export default function EnhancedMainWrapper({ children }: EnhancedMainWrapperProps) {
  const mainRef   = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prevPath, setPrevPath]   = useState('');
  const pathname  = usePathname();

  const { colorScheme, isReady, hapticFeedback } = useTelegram();

  const setTheme         = useStore((s) => s.setTheme);
  const theme            = useStore((s) => s.profile?.settings.theme || 'system');
  const profile          = useStore((s) => s.profile);
  const bottomSheet      = useStore((s) => s.bottomSheet);
  const closeBottomSheet = useStore((s) => s.closeBottomSheet);
  const openBottomSheet  = useStore((s) => s.openBottomSheet);
  const addTransaction   = useStore((s) => s.addTransaction);
  const addTask          = useStore((s) => s.addTask);
  const addHabit         = useStore((s) => s.addHabit);
  const addNote          = useStore((s) => s.addNote);
  const addContact       = useStore((s) => s.addContact);
  const addEvent         = useStore((s) => s.addEvent);
  const addGoal          = useStore((s) => s.addGoal);
  const addDebt          = useStore((s) => s.addDebt);
  const addToast         = useStore((s) => s.addToast);

  const language = profile?.settings?.language || 'ru';
  const currency = profile?.finance?.currency  || 'UZS';

  // ── AUTH ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const login = async () => {
      const existing = tokenStorage.get();
      if (existing) {
        try { setApiToken(existing); await authService.me(); return; } catch { /* expired */ }
      }
      const tgInitData = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initData : undefined;
      const isTelegram = Boolean(tgInitData && tgInitData.length > 0);
      const devInitData = process.env.NEXT_PUBLIC_DEV_INIT_DATA;
      try {
        if (isTelegram) {
          await authService.loginTelegram({ initData: tgInitData });
        } else if (devInitData) {
          await authService.loginTelegram({ initData: devInitData });
        } else {
          await authService.loginTelegram({ testUser: { id: 123456789, first_name: 'Test', last_name: 'User', username: 'testuser' } });
        }
      } catch (e) { console.error('[Auth]', e); }
    };
    login();
  }, []);

  // ── FORM STATES ────────────────────────────────────────────────────────────
  const [txType,        setTxType]        = useState<'expense'|'income'>('expense');
  const [txAmount,      setTxAmount]      = useState('');
  const [txCategory,    setTxCategory]    = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txDate,        setTxDate]        = useState(format(new Date(),'yyyy-MM-dd'));

  const [taskTitle,       setTaskTitle]       = useState('');
  const [taskPriority,    setTaskPriority]    = useState('medium');
  const [taskDueDate,     setTaskDueDate]     = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  const [habitName,  setHabitName]  = useState('');
  const [habitIcon,  setHabitIcon]  = useState('🏃');
  const [habitColor, setHabitColor] = useState('#F97316');
  const [habitGoal,  setHabitGoal]  = useState('1');

  const [noteTitle,   setNoteTitle]   = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [notePinned,  setNotePinned]  = useState(false);

  const [contactName,     setContactName]     = useState('');
  const [contactPhone,    setContactPhone]    = useState('');
  const [contactEmail,    setContactEmail]    = useState('');
  const [contactGroup,    setContactGroup]    = useState('friends');
  const [contactBirthday, setContactBirthday] = useState('');

  const [eventTitle, setEventTitle] = useState('');
  const [eventDate,  setEventDate]  = useState(format(new Date(),'yyyy-MM-dd'));
  const [eventTime,  setEventTime]  = useState('');
  const [eventType,  setEventType]  = useState<'meeting'|'birthday'|'reminder'|'deadline'|'trip'|'other'>('meeting');

  const [goalName,     setGoalName]     = useState('');
  const [goalIcon,     setGoalIcon]     = useState('💰');
  const [goalColor,    setGoalColor]    = useState('#14B8A6');
  const [goalTarget,   setGoalTarget]   = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalPriority, setGoalPriority] = useState<'high'|'medium'|'low'>('medium');

  const [debtName,        setDebtName]        = useState('');
  const [debtType,        setDebtType]        = useState<'credit'|'loan'|'mortgage'|'lent'|'borrowed'>('loan');
  const [debtAmount,      setDebtAmount]      = useState('');
  const [debtDueDate,     setDebtDueDate]     = useState('');
  const [debtContactName, setDebtContactName] = useState('');

  const resetAllForms = useCallback(() => {
    setTxAmount(''); setTxCategory(''); setTxDescription(''); setTxDate(format(new Date(),'yyyy-MM-dd'));
    setTaskTitle(''); setTaskPriority('medium'); setTaskDueDate(''); setTaskDescription('');
    setHabitName(''); setHabitIcon('🏃'); setHabitGoal('1');
    setNoteTitle(''); setNoteContent(''); setNotePinned(false);
    setContactName(''); setContactPhone(''); setContactEmail(''); setContactGroup('friends'); setContactBirthday('');
    setEventTitle(''); setEventDate(format(new Date(),'yyyy-MM-dd')); setEventTime(''); setEventType('meeting');
    setGoalName(''); setGoalIcon('💰'); setGoalColor('#14B8A6'); setGoalTarget(''); setGoalDeadline(''); setGoalPriority('medium');
    setDebtName(''); setDebtType('loan'); setDebtAmount(''); setDebtDueDate(''); setDebtContactName('');
  }, []);

  useEffect(() => { if (!bottomSheet.isOpen) resetAllForms(); }, [bottomSheet.isOpen, resetAllForms]);

  // ── Theme & route ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isReady && theme === 'system') {
      const root = document.documentElement;
      root.classList.remove('light','dark');
      root.classList.add(colorScheme);
    }
  }, [colorScheme, isReady, theme]);

useEffect(() => {
  const handleEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      const el = e.target as HTMLElement;
      if (el.tagName === 'INPUT') {
        el.blur();
      }
    }
  };
  document.addEventListener('keydown', handleEnter);
  return () => document.removeEventListener('keydown', handleEnter);
}, []);

  useEffect(() => { setTheme(theme); }, [theme, setTheme]);

  useEffect(() => {
    if (prevPath && prevPath !== pathname) {
      setIsLoading(true);
      if (mainRef.current) mainRef.current.scrollTop = 0;
      setTimeout(() => setIsLoading(false), 600);
    }
    setPrevPath(pathname);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [pathname, prevPath]);

  // ── Utils ─────────────────────────────────────────────────────────────────
  const formatAmount = (v: string) => {
    const n = v.replace(/[^0-9]/g,'');
    return n ? parseInt(n).toLocaleString('ru-RU') : '';
  };
  const parseAmount = (v: string): number => {
    const n = parseFloat(v.replace(/[^0-9.]/g,''));
    return isNaN(n) ? 0 : n;
  };
  const getCategoryLabel = (id: string, type: 'expense'|'income') => {
    const cats = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    return cats.find(c => c.id === id)?.label[language as 'ru'|'en'] ?? id;
  };

  // ── Submit handlers ───────────────────────────────────────────────────────
  const handleSubmitTransaction = async () => {
    const num = parseAmount(txAmount);
    if (!num || num <= 0) { hapticFeedback?.('notification','error'); addToast({ type:'warning', message: language==='ru'?'Введите сумму':'Enter amount' }); return; }
    if (!txCategory)      { hapticFeedback?.('notification','error'); addToast({ type:'warning', message: language==='ru'?'Выберите категорию':'Select category' }); return; }
    hapticFeedback?.('notification','success');
    const description = txDescription.trim() || getCategoryLabel(txCategory, txType);
    closeBottomSheet();
    try {
      await createTransactionApi({ type:txType, amount:num, category:txCategory, description, date:txDate, isRecurring:false });
      addToast({ type:'success', message: txType==='expense'?(language==='ru'?'Расход добавлен':'Expense added'):(language==='ru'?'Доход добавлен':'Income added') });
    } catch {
      addToast({ type:'error', message: language==='ru'?'Не удалось сохранить':'Failed to save' });
    }
  };

  const handleSubmitTask = () => {
    if (!taskTitle.trim()) { hapticFeedback?.('notification','error'); addToast({ type:'warning', message: language==='ru'?'Введите название задачи':'Enter task title' }); return; }
    hapticFeedback?.('notification','success');
    addTask({ title:taskTitle.trim(), description:taskDescription.trim()||undefined, completed:false, priority:taskPriority as any, dueDate:taskDueDate||undefined, isRecurring:false });
    addToast({ type:'success', message: language==='ru'?'Задача добавлена':'Task added' });
    closeBottomSheet();
  };

  const handleSubmitHabit = () => {
    if (!habitName.trim()) { hapticFeedback?.('notification','error'); addToast({ type:'warning', message: language==='ru'?'Введите название привычки':'Enter habit name' }); return; }
    hapticFeedback?.('notification','success');
    addHabit({ name:habitName.trim(), icon:habitIcon, color:habitColor, goalType:'binary', goalValue:parseInt(habitGoal)||1, frequency:'daily', habitType:'build' });
    addToast({ type:'success', message: language==='ru'?'Привычка добавлена':'Habit added' });
    closeBottomSheet();
  };

  const handleSubmitNote = () => {
    if (!noteContent.trim() && !noteTitle.trim()) { hapticFeedback?.('notification','error'); addToast({ type:'warning', message: language==='ru'?'Введите текст заметки':'Enter note text' }); return; }
    hapticFeedback?.('notification','success');
    addNote({ title:noteTitle.trim()||(language==='ru'?'Без названия':'Untitled'), content:noteContent.trim(), type:'text', isPinned:notePinned });
    addToast({ type:'success', message: language==='ru'?'Заметка добавлена':'Note added' });
    closeBottomSheet();
  };

  const handleSubmitContact = () => {
    if (!contactName.trim()) { hapticFeedback?.('notification','error'); addToast({ type:'warning', message: language==='ru'?'Введите имя контакта':'Enter contact name' }); return; }
    hapticFeedback?.('notification','success');
    addContact({ name:contactName.trim(), phone:contactPhone.trim()||undefined, email:contactEmail.trim()||undefined, group:contactGroup as any, isFavorite:false, birthday:contactBirthday||undefined, linkedEventIds:[], linkedTransactionIds:[], linkedNoteIds:[], owesMe:0, iOwe:0 });
    addToast({ type:'success', message: language==='ru'?'Контакт добавлен':'Contact added' });
    closeBottomSheet();
  };

  const handleSubmitEvent = () => {
    if (!eventTitle.trim()) { hapticFeedback?.('notification','error'); addToast({ type:'warning', message: language==='ru'?'Введите название события':'Enter event title' }); return; }
    hapticFeedback?.('notification','success');
    addEvent({ title:eventTitle.trim(), date:eventDate, startTime:eventTime||undefined, allDay:!eventTime, type:eventType, color:'#C9A962', isRecurring:false });
    addToast({ type:'success', message: language==='ru'?'Событие добавлено':'Event added' });
    closeBottomSheet();
  };

  const handleSubmitGoal = async () => {
    const num = parseAmount(goalTarget);
    if (!goalName.trim()) { hapticFeedback?.('notification','error'); addToast({ type:'warning', message: language==='ru'?'Введите название цели':'Enter goal name' }); return; }
    if (!num||num<=0)     { hapticFeedback?.('notification','error'); addToast({ type:'warning', message: language==='ru'?'Введите сумму цели':'Enter goal amount' }); return; }
    hapticFeedback?.('notification','success');
    addGoal({ name:goalName.trim(), icon:goalIcon, color:goalColor, targetAmount:num, currentAmount:0, deadline:goalDeadline||undefined, priority:goalPriority, linkedTransactions:[] });
    addToast({ type:'success', message: language==='ru'?'Цель добавлена':'Goal added' });
    closeBottomSheet();
  };

  const handleSubmitDebt = () => {
    const num = parseAmount(debtAmount);
    if (!debtName.trim()) { hapticFeedback?.('notification','error'); addToast({ type:'warning', message: language==='ru'?'Введите название':'Enter name' }); return; }
    if (!num||num<=0)     { hapticFeedback?.('notification','error'); addToast({ type:'warning', message: language==='ru'?'Введите сумму':'Enter amount' }); return; }
    hapticFeedback?.('notification','success');
    addDebt({ name:debtName.trim(), type:debtType, direction:debtType==='lent'?'owe_me':'i_owe', totalAmount:num, remainingAmount:num, currency:currency as any, startDate:format(new Date(),'yyyy-MM-dd'), dueDate:debtDueDate||undefined, contactName:debtContactName.trim()||undefined });
    addToast({ type:'success', message: language==='ru'?'Долг добавлен':'Debt added' });
    closeBottomSheet();
  };

  // ── Quick add ─────────────────────────────────────────────────────────────
  const handleQuickAddSelect = (item: typeof QUICK_ADD_ITEMS[0]) => {
    hapticFeedback?.('selection');
    if (item.id==='expense') setTxType('expense');
    else if (item.id==='income') setTxType('income');
    if (item.content) openBottomSheet(item.content as any);
  };

  // ============================================================================
  // RENDER BOTTOM SHEET
  // ============================================================================
  const renderBottomSheetContent = () => {
    const content = bottomSheet.content;

    // ── QUICK ADD ──
    if (content === 'quick-add') {
      const enabledModules = profile?.settings?.enabledModules || ['finance'];
      const filteredItems = QUICK_ADD_ITEMS.filter(item => {
        if (item.id==='expense'||item.id==='income'||item.id==='goal') return enabledModules.includes('finance');
        if (item.id==='task')    return enabledModules.includes('tasks');
        if (item.id==='event')   return enabledModules.includes('events');
        if (item.id==='habit')   return enabledModules.includes('habits');
        if (item.id==='note')    return enabledModules.includes('notes');
        if (item.id==='contact') return enabledModules.includes('contacts');
        return true;
      });
      return (
        <div className="pb-6">
          <div className="grid grid-cols-4 gap-3">
            {filteredItems.map(item => {
              const Icon = item.icon;
              return (
                <motion.button key={item.id} whileTap={{ scale:0.92 }} onClick={()=>handleQuickAddSelect(item)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl"
                  style={{ background:`${item.color}15`, border:`1px solid ${item.color}30` }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:`${item.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color:item.color }}/>
                  </div>
                  <span className="text-xs font-medium" style={{ color:'var(--text-primary)' }}>{item.label[language as 'ru'|'en']}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      );
    }

    // ── TRANSACTION ──
    if (content === 'add-transaction') {
      // Фильтруем категории по тому, что разрешено для этого пользователя (из API)
      const userExpenseCatIds = profile?.finance?.expenseCategories ?? [];
      const userIncomeCatIds  = profile?.finance?.incomeCategories  ?? [];
      const categories = txType === 'expense'
        ? (userExpenseCatIds.length>0 ? EXPENSE_CATEGORIES.filter(c=>userExpenseCatIds.includes(c.id)) : EXPENSE_CATEGORIES)
        : (userIncomeCatIds.length>0  ? INCOME_CATEGORIES.filter(c=>userIncomeCatIds.includes(c.id))  : INCOME_CATEGORIES);

      const descPh = txType==='expense'
        ? (language==='ru'?'Например: Обед в кафе':'e.g. Lunch at cafe')
        : (language==='ru'?'Например: Зарплата за январь':'e.g. January salary');

      return (
        <div className="space-y-5 pb-6">
          {/* Type Toggle */}
          <div className="flex gap-2 p-1 rounded-xl" style={{ background:'var(--surface-dim)' }}>
            {(['expense','income'] as const).map(t => (
              <motion.button key={t} whileTap={{ scale:0.95 }}
                onClick={()=>{ hapticFeedback?.('selection'); setTxType(t); setTxCategory(''); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all"
                style={{ background:txType===t?(t==='expense'?'var(--error)':'var(--success)'):'transparent', color:txType===t?'white':'var(--text-secondary)' }}
              >
                {t==='expense'?<MinusCircleIcon className="w-5 h-5"/>:<PlusCircleIcon className="w-5 h-5"/>}
                <span className="text-sm font-medium">{t==='expense'?(language==='ru'?'Расход':'Expense'):(language==='ru'?'Доход':'Income')}</span>
              </motion.button>
            ))}
          </div>
          {/* Amount */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Сумма':'Amount'}</label>
            <div className="relative">
              <input type="text" inputMode="numeric" value={txAmount} onChange={e=>setTxAmount(formatAmount(e.target.value))} placeholder="0"
                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                className="w-full px-4 py-4 rounded-xl text-2xl font-bold text-center"
                style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:txType==='expense'?'var(--error)':'var(--success)' }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color:'var(--text-tertiary)' }}>{currency}</span>
            </div>
          </div>
          {/* Category */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Категория':'Category'}</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map(cat => (
                <motion.button key={cat.id} whileTap={{ scale:0.95 }}
                  onClick={()=>{ hapticFeedback?.('selection'); setTxCategory(cat.id); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                  style={{ background:txCategory===cat.id?`${cat.color}20`:'var(--surface)', border:`1px solid ${txCategory===cat.id?cat.color:'var(--border)'}` }}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-[10px] font-medium" style={{ color:txCategory===cat.id?cat.color:'var(--text-secondary)' }}>{cat.label[language as 'ru'|'en']}</span>
                </motion.button>
              ))}
            </div>
          </div>
          {/* Description */}
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color:'var(--text-secondary)' }}>
              <DocumentTextIcon className="w-4 h-4"/>
              {language==='ru'?'Описание':'Description'}
              <span className="text-[10px] opacity-60">({language==='ru'?'необязательно':'optional'})</span>
            </label>
            <input type="text" value={txDescription} onChange={e=>setTxDescription(e.target.value)} placeholder={descPh}
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)' }}
            />
          </div>
          {/* Date */}
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color:'var(--text-secondary)' }}>
              <CalendarDaysIcon className="w-4 h-4"/>{language==='ru'?'Дата':'Date'}
            </label>
            <input type="date" value={txDate} onChange={e=>setTxDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)', colorScheme:'dark' }}
            />
          </div>
          {/* Submit */}
          <motion.button whileTap={{ scale:0.98 }} onClick={handleSubmitTransaction}
            className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{ background:txType==='expense'?'linear-gradient(135deg,var(--error) 0%,#FF8A80 100%)':'linear-gradient(135deg,var(--success) 0%,#86EFAC 100%)', color:'white' }}
          >
            <CheckIcon className="w-5 h-5"/>
            {txType==='expense'?(language==='ru'?'Добавить расход':'Add Expense'):(language==='ru'?'Добавить доход':'Add Income')}
          </motion.button>
        </div>
      );
    }

    // ── TASK ──
    if (content === 'add-task') {
      return (
        <div className="space-y-5 pb-6">
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Название задачи':'Task Title'} *</label>
            <input type="text" value={taskTitle} onChange={e=>setTaskTitle(e.target.value)}
              placeholder={language==='ru'?'Что нужно сделать?':'What needs to be done?'}
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color:'var(--text-secondary)' }}>
              <FlagIcon className="w-4 h-4"/>{language==='ru'?'Приоритет':'Priority'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITY_OPTIONS.map(p => (
                <motion.button key={p.id} whileTap={{ scale:0.95 }}
                  onClick={()=>{ hapticFeedback?.('selection'); setTaskPriority(p.id); }}
                  className="py-2 px-3 rounded-lg text-xs font-medium transition-all"
                  style={{ background:taskPriority===p.id?`${p.color}20`:'var(--surface)', border:`1px solid ${taskPriority===p.id?p.color:'var(--border)'}`, color:taskPriority===p.id?p.color:'var(--text-secondary)' }}
                >{p.label[language as 'ru'|'en']}</motion.button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color:'var(--text-secondary)' }}>
              <CalendarDaysIcon className="w-4 h-4"/>{language==='ru'?'Срок выполнения':'Due Date'}
            </label>
            <input type="date" value={taskDueDate} onChange={e=>setTaskDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)', colorScheme:'dark' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Описание':'Description'}</label>
            <textarea value={taskDescription} onChange={e=>setTaskDescription(e.target.value)}
              placeholder={language==='ru'?'Дополнительные детали...':'Additional details...'} rows={3}
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none"
              style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)' }}
            />
          </div>
          <motion.button whileTap={{ scale:0.98 }} onClick={handleSubmitTask}
            className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{ background:'linear-gradient(135deg,var(--info) 0%,#93C5FD 100%)', color:'white' }}
          ><CheckIcon className="w-5 h-5"/>{language==='ru'?'Добавить задачу':'Add Task'}</motion.button>
        </div>
      );
    }

    // ── HABIT ──
    if (content === 'add-habit') {
      return (
        <div className="space-y-5 pb-6">
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Название':'Name'} *</label>
            <input type="text" value={habitName} onChange={e=>setHabitName(e.target.value)}
              placeholder={language==='ru'?'Например: Пить воду':'e.g. Drink water'}
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Иконка':'Icon'}</label>
            <div className="grid grid-cols-8 gap-2">
              {HABIT_ICONS.map(icon => (
                <motion.button key={icon.id} whileTap={{ scale:0.95 }}
                  onClick={()=>{ hapticFeedback?.('selection'); setHabitIcon(icon.id); }}
                  className="p-1 rounded-xl text-xl transition-all"
                  style={{ background:habitIcon===icon.id?'var(--primary-subtle)':'var(--surface)', border:`1px solid ${habitIcon===icon.id?'var(--primary)':'var(--border)'}` }}
                >{icon.id}</motion.button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Цвет':'Color'}</label>
            <div className="flex gap-2 flex-wrap">
              {HABIT_COLORS.map(color => (
                <motion.button key={color} whileTap={{ scale:0.9 }}
                  onClick={()=>{ hapticFeedback?.('selection'); setHabitColor(color); }}
                  className="w-10 h-10 rounded-full transition-all"
                  style={{ background:color, border:habitColor===color?'3px solid white':'none', boxShadow:habitColor===color?`0 0 0 2px ${color}`:'none' }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Цель в день':'Daily Goal'}</label>
            <input type="number" inputMode="numeric" value={habitGoal} onChange={e=>setHabitGoal(e.target.value)} min="1" autoComplete="off"
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)' }}
            />
          </div>
          <motion.button whileTap={{ scale:0.98 }} onClick={handleSubmitHabit}
            className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{ background:`linear-gradient(135deg,${habitColor} 0%,${habitColor}99 100%)`, color:'white' }}
          ><CheckIcon className="w-5 h-5"/>{language==='ru'?'Добавить привычку':'Add Habit'}</motion.button>
        </div>
      );
    }

    // ── NOTE ──
    if (content === 'add-note') {
      return (
        <div className="space-y-5 pb-6">
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Заголовок':'Title'}</label>
            <input type="text" value={noteTitle} onChange={e=>setNoteTitle(e.target.value)}
              placeholder={language==='ru'?'Заголовок заметки':'Note title'}
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Текст заметки':'Note Content'} *</label>
            <textarea value={noteContent} onChange={e=>setNoteContent(e.target.value)}
              placeholder={language==='ru'?'Напишите заметку...':'Write your note...'} rows={5}
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none"
              style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)' }}
            />
          </div>
          <motion.button whileTap={{ scale:0.98 }} onClick={handleSubmitNote}
            className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{ background:'linear-gradient(135deg,#FBBF24 0%,#F59E0B 100%)', color:'white' }}
          ><CheckIcon className="w-5 h-5"/>{language==='ru'?'Добавить заметку':'Add Note'}</motion.button>
        </div>
      );
    }

    // ── CONTACT ──
    if (content === 'add-contact') {
      return (
        <div className="space-y-5 pb-6">
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Имя':'Name'} *</label>
            <input type="text" value={contactName} onChange={e=>setContactName(e.target.value)}
              placeholder={language==='ru'?'Имя контакта':'Contact name'}
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color:'var(--text-secondary)' }}>
              <PhoneIcon className="w-4 h-4"/>{language==='ru'?'Телефон':'Phone'}
            </label>
            <input type="tel" value={contactPhone} onChange={e=>setContactPhone(e.target.value)} placeholder="+998 90 000 00 00" autoComplete="off"
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color:'var(--text-secondary)' }}>
              <EnvelopeIcon className="w-4 h-4"/>Email
            </label>
            <input type="email" value={contactEmail} onChange={e=>setContactEmail(e.target.value)} placeholder="email@example.com" autoComplete="off"
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Группа':'Group'}</label>
            <div className="grid grid-cols-3 gap-2">
              {CONTACT_GROUPS.map(g => (
                <motion.button key={g.id} whileTap={{ scale:0.95 }}
                  onClick={()=>{ hapticFeedback?.('selection'); setContactGroup(g.id); }}
                  className="flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all"
                  style={{ background:contactGroup===g.id?'rgba(201,169,98,0.2)':'var(--surface)', border:`1px solid ${contactGroup===g.id?'rgba(201,169,98,0.5)':'var(--border)'}`, color:contactGroup===g.id?'#C9A962':'var(--text-secondary)' }}
                ><span>{g.icon}</span><span>{g.label[language as 'ru'|'en']}</span></motion.button>
              ))}
            </div>
          </div>
          <motion.button whileTap={{ scale:0.98 }} onClick={handleSubmitContact}
            className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{ background:'linear-gradient(135deg,#EC4899 0%,#F472B6 100%)', color:'white' }}
          ><CheckIcon className="w-5 h-5"/>{language==='ru'?'Добавить контакт':'Add Contact'}</motion.button>
        </div>
      );
    }

    // ── EVENT ──
    if (content === 'add-event') {
      return (
        <div className="space-y-5 pb-6">
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Название события':'Event Title'} *</label>
            <input type="text" value={eventTitle} onChange={e=>setEventTitle(e.target.value)}
              placeholder={language==='ru'?'Название события':'Event title'}
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Тип':'Type'}</label>
            <div className="grid grid-cols-3 gap-2">
              {EVENT_TYPES.map(t => (
                <motion.button key={t.id} whileTap={{ scale:0.95 }}
                  onClick={()=>{ hapticFeedback?.('selection'); setEventType(t.id as any); }}
                  className="flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all"
                  style={{ background:eventType===t.id?'rgba(168,85,247,0.2)':'var(--surface)', border:`1px solid ${eventType===t.id?'#A855F7':'var(--border)'}`, color:eventType===t.id?'#A855F7':'var(--text-secondary)' }}
                ><span>{t.icon}</span><span>{t.label[language as 'ru'|'en']}</span></motion.button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color:'var(--text-secondary)' }}>
              <CalendarDaysIcon className="w-4 h-4"/>{language==='ru'?'Дата':'Date'}
            </label>
            <input type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)', colorScheme:'dark' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color:'var(--text-secondary)' }}>
              <ClockIcon className="w-4 h-4"/>{language==='ru'?'Время':'Time'}
            </label>
            <input type="time" value={eventTime} onChange={e=>setEventTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)', colorScheme:'dark' }}
            />
          </div>
          <motion.button whileTap={{ scale:0.98 }} onClick={handleSubmitEvent}
            className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{ background:'linear-gradient(135deg,#A855F7 0%,#C084FC 100%)', color:'white' }}
          ><CheckIcon className="w-5 h-5"/>{language==='ru'?'Добавить событие':'Add Event'}</motion.button>
        </div>
      );
    }

    // ── GOAL ──
    if (content === 'add-goal') {
      return (
        <div className="space-y-5 pb-6">
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Название цели':'Goal Name'} *</label>
            <input type="text" value={goalName} onChange={e=>setGoalName(e.target.value)}
              placeholder={language==='ru'?'Например: Купить авто':'e.g. Buy a car'}
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Иконка':'Icon'}</label>
            <div className="grid grid-cols-8 gap-2">
              {GOAL_ICONS.map(icon => (
                <motion.button key={icon.id} whileTap={{ scale:0.95 }}
                  onClick={()=>{ hapticFeedback?.('selection'); setGoalIcon(icon.id); }}
                  className="p-1 rounded-xl text-xl transition-all"
                  style={{ background:goalIcon===icon.id?'var(--primary-subtle)':'var(--surface)', border:`1px solid ${goalIcon===icon.id?'var(--primary)':'var(--border)'}` }}
                >{icon.id}</motion.button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color:'var(--text-secondary)' }}>
              <CurrencyDollarIcon className="w-4 h-4"/>{language==='ru'?'Целевая сумма':'Target Amount'} *
            </label>
            <div className="relative">
              <input type="text" inputMode="numeric" value={goalTarget} onChange={e=>setGoalTarget(formatAmount(e.target.value))} placeholder="0" autoComplete="off"
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)' }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm" style={{ color:'var(--text-tertiary)' }}>{currency}</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color:'var(--text-secondary)' }}>
              <CalendarDaysIcon className="w-4 h-4"/>{language==='ru'?'Срок достижения':'Deadline'}
            </label>
            <input type="date" value={goalDeadline} onChange={e=>setGoalDeadline(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)', colorScheme:'dark' }}
            />
          </div>
          <motion.button whileTap={{ scale:0.98 }} onClick={handleSubmitGoal}
            className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{ background:'linear-gradient(135deg,#14B8A6 0%,#2DD4BF 100%)', color:'white' }}
          ><CheckIcon className="w-5 h-5"/>{language==='ru'?'Добавить цель':'Add Goal'}</motion.button>
        </div>
      );
    }

    // ── DEBT ──
    if (content === 'add-debt') {
      return (
        <div className="space-y-5 pb-6">
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Название':'Name'} *</label>
            <input type="text" value={debtName} onChange={e=>setDebtName(e.target.value)}
              placeholder={language==='ru'?'Название долга':'Debt name'}
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Тип':'Type'}</label>
            <div className="grid grid-cols-3 gap-2">
              {DEBT_TYPES.map(t => (
                <motion.button key={t.id} whileTap={{ scale:0.95 }}
                  onClick={()=>{ hapticFeedback?.('selection'); setDebtType(t.id as any); }}
                  className="flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all"
                  style={{ background:debtType===t.id?'rgba(239,68,68,0.15)':'var(--surface)', border:`1px solid ${debtType===t.id?'#EF4444':'var(--border)'}`, color:debtType===t.id?'#EF4444':'var(--text-secondary)' }}
                ><span>{t.icon}</span><span>{t.label[language as 'ru'|'en']}</span></motion.button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Сумма':'Amount'} *</label>
            <div className="relative">
              <input type="text" inputMode="numeric" value={debtAmount} onChange={e=>setDebtAmount(formatAmount(e.target.value))} placeholder="0" autoComplete="off"
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)' }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm" style={{ color:'var(--text-tertiary)' }}>{currency}</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Контакт':'Contact'}</label>
            <input type="text" value={debtContactName} onChange={e=>setDebtContactName(e.target.value)}
              placeholder={language==='ru'?'Имя человека':'Person name'}
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color:'var(--text-secondary)' }}>{language==='ru'?'Срок погашения':'Due Date'}</label>
            <input type="date" value={debtDueDate} onChange={e=>setDebtDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ ...inputStyle, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-primary)', colorScheme:'dark' }}
            />
          </div>
          <motion.button whileTap={{ scale:0.98 }} onClick={handleSubmitDebt}
            className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{ background:'linear-gradient(135deg,#EF4444 0%,#F87171 100%)', color:'white' }}
          ><CheckIcon className="w-5 h-5"/>{language==='ru'?'Добавить долг':'Add Debt'}</motion.button>
        </div>
      );
    }

    return null;
  };

  const getBottomSheetTitle = () => {
    const titles: Record<string, { ru: string; en: string }> = {
      'quick-add':       { ru:'Быстрое добавление', en:'Quick Add'       },
      'add-transaction': { ru:'Новая операция',      en:'New Transaction' },
      'add-task':        { ru:'Новая задача',         en:'New Task'        },
      'add-habit':       { ru:'Новая привычка',       en:'New Habit'       },
      'add-note':        { ru:'Новая заметка',        en:'New Note'        },
      'add-contact':     { ru:'Новый контакт',        en:'New Contact'     },
      'add-event':       { ru:'Новое событие',        en:'New Event'       },
      'add-goal':        { ru:'Новая цель',           en:'New Goal'        },
      'add-debt':        { ru:'Новый долг',           en:'New Debt'        },
    };
    const c = bottomSheet.content;
    return (c && titles[c]) ? titles[c][language as 'ru'|'en'] : '';
  };

  const isOnboardingPage = pathname.startsWith('/onboarding') || pathname.startsWith('/welcome');

  return (
    <OnboardingProvider>
      <main ref={mainRef} className="main-content scrollbar-none relative"
        style={{ overflow:'auto', WebkitOverflowScrolling:'touch', height:'100vh' }}
      >
        <TelegramWebAppInitializer />
        {children}
        <AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
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
                        <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s" repeatCount="indefinite"/>
                      </path>
                    </g>
                  </g>
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {!isOnboardingPage && <><BottomNav />{/* <FAB /> */}</>}
      <ToastContainer />
      <BottomSheet isOpen={bottomSheet.isOpen} onClose={closeBottomSheet} title={getBottomSheetTitle()}>
        {renderBottomSheetContent()}
      </BottomSheet>
    </OnboardingProvider>
  );
}