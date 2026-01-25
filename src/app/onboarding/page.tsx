// src/app/onboarding/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, OnboardingFormData, EnabledModule } from '@/store';
import { useTelegram } from '@/hooks';
import { getAvailableLanguages, type Locale } from '@/locales';

// ============================================================================
// ЦВЕТОВАЯ СИСТЕМА
// ============================================================================

const colors = {
  gold: {
    primary: '#C9A962',
    light: '#E8D5A3',
    dark: '#A68B4B',
    subtle: 'rgba(201, 169, 98, 0.15)',
    muted: 'rgba(201, 169, 98, 0.10)',
    border: 'rgba(201, 169, 98, 0.40)',
    borderLight: 'rgba(201, 169, 98, 0.2)',
  },
  bg: {
    primary: '#0A0A0A',
  },
  text: {
    primary: '#F5F5F5',
    secondary: '#A3A3A3',
    tertiary: '#737373',
  },
  success: {
    primary: '#4ADE80',
  },
  modules: {
    finance: '#4ADE80',
    tasks: '#60A5FA',
    events: '#A855F7',
    habits: '#F97316',
    notes: '#FACC15',
    contacts: '#EC4899',
  },
};

const gradients = {
  gold: `linear-gradient(135deg, ${colors.gold.primary} 0%, ${colors.gold.light} 50%, ${colors.gold.primary} 100%)`,
  shimmer: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)`,
};

const glassStyles = {
  card: {
    background: 'rgba(0, 0, 0, 0.35)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  cardSelected: {
    background: 'rgba(201, 169, 98, 0.2)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: `1px solid ${colors.gold.border}`,
    boxShadow: `0 0 15px ${colors.gold.primary}25`,
  },
  input: {
    background: 'rgba(0, 0, 0, 0.35)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  inputActive: {
    background: 'rgba(0, 0, 0, 0.25)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: `1px solid ${colors.gold.border}`,
    boxShadow: `0 0 12px ${colors.gold.primary}15`,
  },
};

// ============================================================================
// ТИПЫ
// ============================================================================

type OnboardingStep = 
  | 'intro'
  | 'profile'
  | 'preferences'
  | 'modules'
  | 'lifestyle'
  | 'finance-setup'
  | 'finance-categories'
  | 'tasks-setup'
  | 'calendar-setup'
  | 'habits-setup'
  | 'notifications'
  | 'complete';

type ThemeMode = 'light' | 'dark' | 'system';
type OverlayIntensity = 'light' | 'medium' | 'heavy';

// ============================================================================
// ФОНЫ
// ============================================================================

const stepBackgrounds: Record<OnboardingStep, string> = {
  'intro': '/onboarding-welcome.jpg',
  'profile': '/onboarding-profile.jpg',
  'preferences': '/onboarding-preferences.jpg',
  'modules': '/onboarding-modules.jpg',
  'lifestyle': '/onboarding-lifestyle.jpg',
  'finance-setup': '/onboarding-finance.jpg',
  'finance-categories': '/onboarding-expenses.jpg',
  'tasks-setup': '/onboarding-tasks.jpg',
  'calendar-setup': '/onboarding-calendar.jpg',
  'habits-setup': '/onboarding-habits.jpg',
  'notifications': '/onboarding-notifications.jpg',
  'complete': '/onboarding-complete.jpg',
};

const stepOverlayIntensity: Record<OnboardingStep, OverlayIntensity> = {
  'intro': 'light',
  'profile': 'medium',
  'preferences': 'medium',
  'modules': 'medium',
  'lifestyle': 'light',
  'finance-setup': 'medium',
  'finance-categories': 'heavy',
  'tasks-setup': 'medium',
  'calendar-setup': 'medium',
  'habits-setup': 'medium',
  'notifications': 'medium',
  'complete': 'light',
};

const getOverlayGradient = (intensity: OverlayIntensity) => {
  switch (intensity) {
    case 'light':
      return 'linear-gradient(to bottom, rgba(10,10,10,0.1) 0%, rgba(10,10,10,0.25) 50%, rgba(10,10,10,0.5) 100%)';
    case 'medium':
      return 'linear-gradient(to bottom, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.4) 50%, rgba(10,10,10,0.65) 100%)';
    case 'heavy':
      return 'linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.5) 50%, rgba(10,10,10,0.75) 100%)';
  }
};

// ============================================================================
// ДАННЫЕ
// ============================================================================

const introSlides = [
  {
    id: 1,
    title: 'LifeLedger',
    subtitle: 'Ваш персональный ассистент',
    description: 'Всё для управления жизнью в одном приложении',
    background: '/onboarding-welcome.jpg',
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accent: colors.gold.primary,
  },
  {
    id: 2,
    title: 'Всё под контролем',
    subtitle: 'Финансы • Задачи • События',
    description: 'Привычки • Заметки • Контакты',
    background: '/onboarding-analytics.jpg',
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path d="M21 21H4.6c-.56 0-.84 0-1.054-.109a1 1 0 01-.437-.437C3 20.24 3 19.96 3 19.4V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 14l4-4 4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accent: colors.modules.finance,
  },
  {
    id: 3,
    title: 'Настройте под себя',
    subtitle: 'Выберите только нужное',
    description: 'Включайте модули которые вам важны',
    background: '/onboarding-modules.jpg',
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    accent: colors.modules.events,
  },
];

// Используем все 7 языков из i18n системы
const languages = getAvailableLanguages();

const themes = [
  { id: 'dark' as ThemeMode, name: 'Тёмная', icon: '🌙' },
  { id: 'light' as ThemeMode, name: 'Светлая', icon: '☀️' },
  { id: 'system' as ThemeMode, name: 'Авто', icon: '⚙️' },
];

const appModules: Array<{
  id: EnabledModule;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  examples: string;
}> = [
  { 
    id: 'finance', 
    name: 'Финансы', 
    description: 'Учёт денег',
    examples: 'Доходы, расходы, бюджет, цели',
    icon: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>,
    color: colors.modules.finance,
  },
  { 
    id: 'tasks', 
    name: 'Задачи', 
    description: 'Списки дел',
    examples: 'Проекты, чек-листы, дедлайны',
    icon: <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
    color: colors.modules.tasks,
  },
  { 
    id: 'events', 
    name: 'Календарь', 
    description: 'События',
    examples: 'Встречи, дни рождения, дела',
    icon: <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>,
    color: colors.modules.events,
  },
  { 
    id: 'habits', 
    name: 'Привычки', 
    description: 'Трекер',
    examples: 'Серии, напоминания, статистика',
    icon: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
    color: colors.modules.habits,
  },
  { 
    id: 'notes', 
    name: 'Заметки', 
    description: 'Записи',
    examples: 'Идеи, списки, документы',
    icon: <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>,
    color: colors.modules.notes,
  },
  { 
    id: 'contacts', 
    name: 'Контакты', 
    description: 'Люди',
    examples: 'Связи, долги, напоминания',
    icon: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>,
    color: colors.modules.contacts,
  },
];

const lifestyleOptions = [
  { id: 'single', name: 'Живу один(а)', icon: '👤' },
  { id: 'couple', name: 'В паре', icon: '👫' },
  { id: 'family', name: 'Семья', icon: '👨‍👩‍👧' },
  { id: 'roommates', name: 'С соседями', icon: '🏠' },
];

const currencies = [
  { code: 'UZS', name: 'Сум', symbol: "so'm", flag: '🇺🇿' },
  { code: 'USD', name: 'Доллар', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Евро', symbol: '€', flag: '🇪🇺' },
  { code: 'RUB', name: 'Рубль', symbol: '₽', flag: '🇷🇺' },
  { code: 'KZT', name: 'Тенге', symbol: '₸', flag: '🇰🇿' },
  { code: 'KGS', name: 'Сом', symbol: 'сом', flag: '🇰🇬' },
  { code: 'TJS', name: 'Сомони', symbol: 'с.', flag: '🇹🇯' },
  { code: 'TRY', name: 'Лира', symbol: '₺', flag: '🇹🇷' },
];

const expenseCategories = [
  { id: 'food', name: 'Продукты', icon: '🛒' },
  { id: 'transport', name: 'Транспорт', icon: '🚗' },
  { id: 'housing', name: 'Жильё', icon: '🏠' },
  { id: 'utilities', name: 'Коммуналка', icon: '💡' },
  { id: 'health', name: 'Здоровье', icon: '💊' },
  { id: 'entertainment', name: 'Развлечения', icon: '🎮' },
  { id: 'shopping', name: 'Покупки', icon: '🛍️' },
  { id: 'cafe', name: 'Кафе', icon: '☕' },
  { id: 'education', name: 'Образование', icon: '📚' },
  { id: 'subscriptions', name: 'Подписки', icon: '📱' },
  { id: 'other', name: 'Другое', icon: '📦' },
];

const incomeCategories = [
  { id: 'salary', name: 'Зарплата', icon: '💰' },
  { id: 'freelance', name: 'Фриланс', icon: '💻' },
  { id: 'business', name: 'Бизнес', icon: '🏢' },
  { id: 'investments', name: 'Инвестиции', icon: '📈' },
  { id: 'gifts', name: 'Подарки', icon: '🎁' },
  { id: 'other', name: 'Другое', icon: '📦' },
];

const defaultTaskProjects = [
  { id: 'inbox', name: 'Входящие', icon: '📥' },
  { id: 'personal', name: 'Личное', icon: '👤' },
  { id: 'work', name: 'Работа', icon: '💼' },
  { id: 'shopping', name: 'Покупки', icon: '🛒' },
];

const notificationOptions = [
  { id: 'all', name: 'Все', description: 'Напоминания обо всём', icon: '🔔' },
  { id: 'important', name: 'Важное', description: 'Только дедлайны и платежи', icon: '⭐' },
  { id: 'minimal', name: 'Минимум', description: 'Раз в день сводка', icon: '📋' },
  { id: 'off', name: 'Отключить', description: 'Без напоминаний', icon: '🔕' },
];

// ============================================================================
// КОМПОНЕНТ
// ============================================================================

export default function OnboardingPage() {
  const router = useRouter();
  const { hapticFeedback, user } = useTelegram();
  const saveOnboardingData = useStore((state) => state.saveOnboardingData);
  const isOnboarded = useStore((state) => state.isOnboarded);

  useEffect(() => {
    if (isOnboarded) {
      router.replace('/');
    }
  }, [isOnboarded, router]);

  const [step, setStep] = useState<OnboardingStep>('intro');
  const [introSlide, setIntroSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  
  const [formData, setFormData] = useState<OnboardingFormData>({
    name: user?.first_name || '',
    phone: '',
    birthday: '',
    language: 'ru',
    theme: 'dark',
    currency: 'UZS',
    initialBalance: 0,
    monthlyBudget: 0,
    salaryDay: 10,
    expenseCategories: ['food', 'transport', 'housing', 'utilities', 'entertainment'],
    incomeCategories: ['salary'],
    goals: [],
    lifestyle: '',
    notifications: 'important',
    enabledModules: ['finance'],
  });

  // Динамический список шагов
  const steps = useMemo((): OnboardingStep[] => {
    const baseSteps: OnboardingStep[] = ['intro', 'profile', 'preferences', 'modules', 'lifestyle'];
    const moduleSteps: OnboardingStep[] = [];
    
    if (formData.enabledModules.includes('finance')) {
      moduleSteps.push('finance-setup', 'finance-categories');
    }
    if (formData.enabledModules.includes('tasks')) {
      moduleSteps.push('tasks-setup');
    }
    if (formData.enabledModules.includes('events')) {
      moduleSteps.push('calendar-setup');
    }
    if (formData.enabledModules.includes('habits')) {
      moduleSteps.push('habits-setup');
    }
    
    return [...baseSteps, ...moduleSteps, 'notifications', 'complete'];
  }, [formData.enabledModules]);

  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex) / (steps.length - 1)) * 100;

  const goNext = () => {
    hapticFeedback?.('selection');
    setDirection(1);
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex]);
    }
  };

  const goBack = () => {
    hapticFeedback?.('selection');
    setDirection(-1);
    if (step === 'intro' && introSlide > 0) {
      setIntroSlide(prev => prev - 1);
    } else {
      const prevIndex = currentStepIndex - 1;
      if (prevIndex >= 0) {
        setStep(steps[prevIndex]);
      }
    }
  };

  const handleIntroNext = () => {
    hapticFeedback?.('selection');
    if (introSlide < introSlides.length - 1) {
      setDirection(1);
      setIntroSlide(prev => prev + 1);
    } else {
      goNext();
    }
  };

  const completeOnboarding = () => {
    hapticFeedback?.('notification', 'success');
    saveOnboardingData(formData);
    router.replace('/');
  };

  const toggleModule = (moduleId: EnabledModule) => {
    hapticFeedback?.('selection');
    setFormData(prev => ({
      ...prev,
      enabledModules: prev.enabledModules.includes(moduleId)
        ? prev.enabledModules.filter(id => id !== moduleId)
        : [...prev.enabledModules, moduleId]
    }));
  };

  const toggleExpenseCategory = (categoryId: string) => {
    hapticFeedback?.('selection');
    setFormData(prev => ({
      ...prev,
      expenseCategories: prev.expenseCategories.includes(categoryId)
        ? prev.expenseCategories.filter(id => id !== categoryId)
        : [...prev.expenseCategories, categoryId]
    }));
  };

  const toggleIncomeCategory = (categoryId: string) => {
    hapticFeedback?.('selection');
    setFormData(prev => ({
      ...prev,
      incomeCategories: prev.incomeCategories.includes(categoryId)
        ? prev.incomeCategories.filter(id => id !== categoryId)
        : [...prev.incomeCategories, categoryId]
    }));
  };

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
  };

  // ============ INTRO STEP ============
  const renderIntroStep = () => {
    const currentSlide = introSlides[introSlide];
    
    return (
      <div className="page-scrollable" style={{ background: colors.bg.primary }}>
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
          style={{ backgroundImage: `url(${currentSlide.background})`, zIndex: 0 }}
        />
        <div className="fixed inset-0" style={{ background: getOverlayGradient('light'), zIndex: 1 }} />
        
        <div className="relative min-h-full flex flex-col px-4 pb-24" style={{ zIndex: 2 }}>
          <div className="flex-1 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={introSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="flex flex-col items-center text-center p-6 rounded-2xl"
                style={{
                  background: 'rgba(10, 10, 10, 0.4)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${currentSlide.accent}20`, color: currentSlide.accent }}
                >
                  {currentSlide.icon}
                </motion.div>
                
                <h1 className="text-2xl font-bold mb-1" style={{ color: colors.text.primary }}>
                  {currentSlide.title}
                </h1>
                <p className="text-base mb-2" style={{ color: currentSlide.accent }}>
                  {currentSlide.subtitle}
                </p>
                <p className="text-sm" style={{ color: colors.text.secondary }}>
                  {currentSlide.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-2 mb-4">
            {introSlides.map((_, index) => (
              <div
                key={index}
                onClick={() => { setDirection(index > introSlide ? 1 : -1); setIntroSlide(index); }}
                className="transition-all duration-300 cursor-pointer"
                style={{
                  width: index === introSlide ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: index === introSlide ? currentSlide.accent : 'rgba(255, 255, 255, 0.3)',
                }}
              />
            ))}
          </div>
        </div>

        <div 
          className="fixed bottom-0 left-0 right-0 px-4 pb-5 pt-3"
          style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.9) 0%, transparent 100%)', zIndex: 10 }}
        >
          <motion.button
            onClick={handleIntroNext}
            className="w-full h-12 rounded-xl font-semibold"
            style={{ 
              background: introSlide === introSlides.length - 1 ? gradients.gold : 'rgba(255, 255, 255, 0.1)',
              border: introSlide === introSlides.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
              color: introSlide === introSlides.length - 1 ? colors.bg.primary : colors.text.primary,
            }}
            whileTap={{ scale: 0.98 }}
          >
            {introSlide === introSlides.length - 1 ? 'Начать' : 'Далее'}
          </motion.button>
        </div>
      </div>
    );
  };

  // ============ PROFILE STEP ============
  const renderProfileStep = () => (
    <StepWrapper
      title="Как вас зовут?"
      subtitle="Для персонализации"
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!formData.name.trim()}
      progress={progress}
      backgroundImage={stepBackgrounds['profile']}
      overlayIntensity={stepOverlayIntensity['profile']}
    >
      <div className="space-y-4">
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ваше имя"
          className="w-full h-14 px-4 rounded-xl text-lg outline-none transition-all"
          style={{
            ...(formData.name ? glassStyles.inputActive : glassStyles.input),
            color: colors.text.primary,
            fontSize: '16px', // Prevent iOS zoom
          }}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <p className="text-xs text-center" style={{ color: colors.text.tertiary }}>
          Можно изменить позже в настройках
        </p>
      </div>
    </StepWrapper>
  );

  // ============ PREFERENCES STEP (с 7 языками) ============
  const renderPreferencesStep = () => {
    const selectedLang = languages.find(l => l.code === formData.language);
    
    return (
      <StepWrapper
        title="Настройки"
        subtitle="Язык и тема"
        onBack={goBack}
        onNext={goNext}
        progress={progress}
        backgroundImage={stepBackgrounds['preferences']}
        overlayIntensity={stepOverlayIntensity['preferences']}
      >
        <div className="space-y-4">
          {/* Языки - компактная сетка */}
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
              Язык интерфейса
            </p>
            <div className="grid grid-cols-4 gap-2">
              {languages.map((lang) => {
                const isSelected = formData.language === lang.code;
                return (
                  <motion.button
                    key={lang.code}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, language: lang.code }));
                      hapticFeedback?.('selection');
                    }}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all"
                    style={isSelected ? glassStyles.cardSelected : glassStyles.card}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span 
                      className="text-[10px] font-medium truncate w-full text-center" 
                      style={{ color: isSelected ? colors.gold.primary : colors.text.primary }}
                    >
                      {lang.nativeName.length > 8 ? lang.nativeName.slice(0, 7) + '.' : lang.nativeName}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            
            {/* Показываем выбранный язык */}
            {selectedLang && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 px-3 py-2 rounded-lg flex items-center gap-2"
                style={{ background: colors.gold.subtle }}
              >
                <span className="text-lg">{selectedLang.flag}</span>
                <span className="text-sm" style={{ color: colors.gold.primary }}>
                  {selectedLang.nativeName}
                </span>
                <span className="text-xs" style={{ color: colors.text.tertiary }}>
                  • {selectedLang.name}
                </span>
              </motion.div>
            )}
          </div>

          {/* Тема */}
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>Тема</p>
            <div className="flex gap-2">
              {themes.map((theme) => {
                const isSelected = formData.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, theme: theme.id }));
                      hapticFeedback?.('selection');
                    }}
                    className="flex-1 flex flex-col items-center gap-1 p-3 rounded-xl transition-all"
                    style={isSelected ? glassStyles.cardSelected : glassStyles.card}
                  >
                    <span className="text-2xl">{theme.icon}</span>
                    <span className="text-xs" style={{ color: colors.text.primary }}>{theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </StepWrapper>
    );
  };

  // ============ MODULES STEP ============
  const renderModulesStep = () => (
    <StepWrapper
      title="Что будем отслеживать?"
      subtitle="Выберите нужные модули"
      onBack={goBack}
      onNext={goNext}
      nextDisabled={formData.enabledModules.length === 0}
      progress={progress}
      backgroundImage={stepBackgrounds['modules']}
      overlayIntensity={stepOverlayIntensity['modules']}
    >
      <div className="grid grid-cols-2 gap-2">
        {appModules.map((module) => {
          const isSelected = formData.enabledModules.includes(module.id);
          return (
            <motion.button
              key={module.id}
              onClick={() => toggleModule(module.id)}
              className="flex flex-col items-start p-3 rounded-xl transition-all text-left"
              style={{
                background: isSelected ? `${module.color}15` : 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                border: isSelected ? `1px solid ${module.color}50` : '1px solid rgba(255, 255, 255, 0.1)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: isSelected ? module.color : `${module.color}30`, color: isSelected ? '#000' : module.color }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">{module.icon}</svg>
                </div>
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: isSelected ? module.color : 'transparent', border: isSelected ? 'none' : '2px solid rgba(255,255,255,0.3)' }}
                >
                  {isSelected && <span className="text-xs">✓</span>}
                </div>
              </div>
              <p className="text-sm font-medium" style={{ color: colors.text.primary }}>{module.name}</p>
              <p className="text-[10px]" style={{ color: colors.text.tertiary }}>{module.examples}</p>
            </motion.button>
          );
        })}
      </div>
      <p className="text-xs text-center mt-3" style={{ color: colors.text.tertiary }}>
        Можно изменить позже • Минимум 1 модуль
      </p>
    </StepWrapper>
  );

  // ============ LIFESTYLE STEP ============
  const renderLifestyleStep = () => (
    <StepWrapper
      title="Ваш образ жизни"
      subtitle="Для точных рекомендаций"
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!formData.lifestyle}
      progress={progress}
      backgroundImage={stepBackgrounds['lifestyle']}
      overlayIntensity={stepOverlayIntensity['lifestyle']}
    >
      <div className="grid grid-cols-2 gap-2">
        {lifestyleOptions.map((option) => {
          const isSelected = formData.lifestyle === option.id;
          return (
            <motion.button
              key={option.id}
              onClick={() => {
                setFormData(prev => ({ ...prev, lifestyle: option.id as OnboardingFormData['lifestyle'] }));
                hapticFeedback?.('selection');
              }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
              style={isSelected ? glassStyles.cardSelected : glassStyles.card}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-3xl">{option.icon}</span>
              <span className="text-sm font-medium" style={{ color: colors.text.primary }}>{option.name}</span>
            </motion.button>
          );
        })}
      </div>
    </StepWrapper>
  );

  // ============ FINANCE SETUP STEP ============
  const renderFinanceSetupStep = () => {
    const selectedCurrency = currencies.find(c => c.code === formData.currency);
    
    return (
      <StepWrapper
        title="Настройка финансов"
        subtitle="Базовые параметры"
        onBack={goBack}
        onNext={goNext}
        progress={progress}
        backgroundImage={stepBackgrounds['finance-setup']}
        overlayIntensity={stepOverlayIntensity['finance-setup']}
      >
        <div className="space-y-4">
          {/* Валюты - расширенный список */}
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>Валюта</p>
            <div className="grid grid-cols-4 gap-2">
              {currencies.map((cur) => {
                const isSelected = formData.currency === cur.code;
                return (
                  <motion.button
                    key={cur.code}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, currency: cur.code }));
                      hapticFeedback?.('selection');
                    }}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-lg transition-all"
                    style={isSelected ? glassStyles.cardSelected : glassStyles.card}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-lg">{cur.flag}</span>
                    <span 
                      className="text-xs font-medium" 
                      style={{ color: isSelected ? colors.gold.primary : colors.text.primary }}
                    >
                      {cur.code}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
              Текущий баланс <span style={{ color: colors.text.tertiary }}>(необязательно)</span>
            </p>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                value={formData.initialBalance || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, initialBalance: Number(e.target.value) || 0 }))}
                placeholder="0"
                className="w-full h-12 px-4 pr-16 rounded-xl text-base outline-none"
                style={{ 
                  ...(formData.initialBalance ? glassStyles.inputActive : glassStyles.input), 
                  color: colors.text.primary,
                  fontSize: '16px',
                }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: colors.text.tertiary }}>
                {selectedCurrency?.symbol}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
              Месячный бюджет <span style={{ color: colors.text.tertiary }}>(необязательно)</span>
            </p>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                value={formData.monthlyBudget || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, monthlyBudget: Number(e.target.value) || 0 }))}
                placeholder="0"
                className="w-full h-12 px-4 pr-16 rounded-xl text-base outline-none"
                style={{ 
                  ...(formData.monthlyBudget ? glassStyles.inputActive : glassStyles.input), 
                  color: colors.text.primary,
                  fontSize: '16px',
                }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: colors.text.tertiary }}>
                {selectedCurrency?.symbol}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>День зарплаты</p>
            <div className="flex gap-2 flex-wrap">
              {[1, 5, 10, 15, 20, 25].map((day) => {
                const isSelected = formData.salaryDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, salaryDay: day }));
                      hapticFeedback?.('selection');
                    }}
                    className="w-11 h-11 rounded-lg flex items-center justify-center transition-all"
                    style={isSelected ? glassStyles.cardSelected : glassStyles.card}
                  >
                    <span className="text-sm font-medium" style={{ color: colors.text.primary }}>{day}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </StepWrapper>
    );
  };

  // ============ FINANCE CATEGORIES STEP ============
  const renderFinanceCategoriesStep = () => (
    <StepWrapper
      title="Категории"
      subtitle="Для учёта расходов и доходов"
      onBack={goBack}
      onNext={goNext}
      nextDisabled={formData.expenseCategories.length === 0}
      progress={progress}
      backgroundImage={stepBackgrounds['finance-categories']}
      overlayIntensity={stepOverlayIntensity['finance-categories']}
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
            Расходы <span style={{ color: colors.gold.primary }}>({formData.expenseCategories.length})</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {expenseCategories.map((cat) => {
              const isSelected = formData.expenseCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleExpenseCategory(cat.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all"
                  style={{
                    background: isSelected ? 'rgba(201,169,98,0.2)' : 'rgba(0,0,0,0.3)',
                    border: isSelected ? `1px solid ${colors.gold.border}` : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span className="text-xs" style={{ color: colors.text.primary }}>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
            Доходы <span style={{ color: colors.modules.finance }}>({formData.incomeCategories.length})</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {incomeCategories.map((cat) => {
              const isSelected = formData.incomeCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleIncomeCategory(cat.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all"
                  style={{
                    background: isSelected ? 'rgba(74,222,128,0.2)' : 'rgba(0,0,0,0.3)',
                    border: isSelected ? `1px solid ${colors.modules.finance}50` : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span className="text-xs" style={{ color: colors.text.primary }}>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepWrapper>
  );

  // ============ TASKS SETUP STEP ============
  const renderTasksSetupStep = () => (
    <StepWrapper
      title="Настройка задач"
      subtitle="Стартовые проекты"
      onBack={goBack}
      onNext={goNext}
      progress={progress}
      backgroundImage={stepBackgrounds['tasks-setup']}
      overlayIntensity={stepOverlayIntensity['tasks-setup']}
    >
      <div className="space-y-4">
        <p className="text-sm" style={{ color: colors.text.secondary }}>
          Создадим базовые папки для задач:
        </p>
        
        <div className="space-y-2">
          {defaultTaskProjects.map((project) => (
            <div key={project.id} className="flex items-center gap-3 p-3 rounded-xl" style={glassStyles.card}>
              <span className="text-xl">{project.icon}</span>
              <span className="text-sm font-medium" style={{ color: colors.text.primary }}>{project.name}</span>
              <div className="ml-auto">
                <span className="text-xs px-2 py-1 rounded" style={{ background: colors.modules.tasks + '20', color: colors.modules.tasks }}>
                  ✓
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-xs text-center" style={{ color: colors.text.tertiary }}>
          Добавить свои проекты можно позже
        </p>
      </div>
    </StepWrapper>
  );

  // ============ CALENDAR SETUP STEP ============
  const renderCalendarSetupStep = () => (
    <StepWrapper
      title="Настройка календаря"
      subtitle="Параметры отображения"
      onBack={goBack}
      onNext={goNext}
      progress={progress}
      backgroundImage={stepBackgrounds['calendar-setup']}
      overlayIntensity={stepOverlayIntensity['calendar-setup']}
    >
      <div className="space-y-4">
        <div 
          className="p-4 rounded-xl"
          style={{ background: `${colors.modules.events}15`, border: `1px solid ${colors.modules.events}30` }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: colors.modules.events }}>📅 Календарь готов!</p>
          <p className="text-xs" style={{ color: colors.text.secondary }}>
            Добавляйте события, встречи и дни рождения. Мы напомним вовремя!
          </p>
        </div>

        <div className="space-y-2">
          {[
            { icon: '📌', title: 'События', desc: 'Встречи, звонки, визиты' },
            { icon: '🎂', title: 'Дни рождения', desc: 'Напоминания заранее' },
            { icon: '🔄', title: 'Повторяющиеся', desc: 'Еженедельные, ежемесячные' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={glassStyles.card}>
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="text-sm font-medium" style={{ color: colors.text.primary }}>{item.title}</p>
                <p className="text-xs" style={{ color: colors.text.tertiary }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StepWrapper>
  );

  // ============ HABITS SETUP STEP ============
  const renderHabitsSetupStep = () => (
    <StepWrapper
      title="Привычки"
      subtitle="Как это работает"
      onBack={goBack}
      onNext={goNext}
      progress={progress}
      backgroundImage={stepBackgrounds['habits-setup']}
      overlayIntensity={stepOverlayIntensity['habits-setup']}
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          {[
            { icon: '🎯', title: 'Создавайте привычки', desc: 'Спорт, чтение, медитация...' },
            { icon: '🔥', title: 'Следите за серией', desc: 'Не прерывайте streak!' },
            { icon: '📊', title: 'Смотрите статистику', desc: 'Прогресс за неделю/месяц' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={glassStyles.card}>
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-sm font-medium" style={{ color: colors.text.primary }}>{item.title}</p>
                <p className="text-xs" style={{ color: colors.text.tertiary }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-center" style={{ color: colors.text.tertiary }}>
          Первую привычку создадите после онбординга
        </p>
      </div>
    </StepWrapper>
  );

  // ============ NOTIFICATIONS STEP ============
  const renderNotificationsStep = () => (
    <StepWrapper
      title="Уведомления"
      subtitle="Как часто напоминать?"
      onBack={goBack}
      onNext={goNext}
      nextLabel="Завершить"
      progress={progress}
      backgroundImage={stepBackgrounds['notifications']}
      overlayIntensity={stepOverlayIntensity['notifications']}
    >
      <div className="space-y-2">
        {notificationOptions.map((option) => {
          const isSelected = formData.notifications === option.id;
          return (
            <motion.button
              key={option.id}
              onClick={() => {
                setFormData(prev => ({ ...prev, notifications: option.id as OnboardingFormData['notifications'] }));
                hapticFeedback?.('selection');
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
              style={isSelected ? glassStyles.cardSelected : glassStyles.card}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl">{option.icon}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium" style={{ color: colors.text.primary }}>{option.name}</p>
                <p className="text-xs" style={{ color: colors.text.tertiary }}>{option.description}</p>
              </div>
              <div 
                className="w-5 h-5 rounded-full"
                style={{ border: isSelected ? `5px solid ${colors.gold.primary}` : '2px solid rgba(255,255,255,0.3)' }}
              />
            </motion.button>
          );
        })}
      </div>
    </StepWrapper>
  );

  // ============ COMPLETE STEP ============
  const renderCompleteStep = () => {
    const selectedCurrency = currencies.find(c => c.code === formData.currency);
    const selectedLang = languages.find(l => l.code === formData.language);
    
    return (
      <div className="page-scrollable" style={{ background: colors.bg.primary }}>
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${stepBackgrounds['complete']})`, zIndex: 0 }}
        />
        <div className="fixed inset-0" style={{ background: getOverlayGradient('light'), zIndex: 1 }} />
        
        <div className="relative min-h-full flex flex-col items-center justify-center px-4 pb-24" style={{ zIndex: 2 }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 rounded-2xl w-full max-w-sm text-center"
            style={{
              background: 'rgba(10, 10, 10, 0.4)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: colors.success.primary }}
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke={colors.bg.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>

            <h1 className="text-xl font-bold mb-1" style={{ color: colors.text.primary }}>
              Всё готово!
            </h1>
            <p className="text-sm mb-4" style={{ color: colors.text.secondary }}>
              {formData.name ? `${formData.name}, д` : 'Д'}обро пожаловать в LifeLedger
            </p>

            <div className="space-y-2 text-left">
              {/* Язык */}
              <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <span className="text-xs" style={{ color: colors.text.tertiary }}>Язык</span>
                <span className="text-sm flex items-center gap-1" style={{ color: colors.text.primary }}>
                  {selectedLang?.flag} {selectedLang?.nativeName}
                </span>
              </div>
              
              {/* Модули */}
              <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <span className="text-xs" style={{ color: colors.text.tertiary }}>Модули</span>
                <div className="flex gap-1">
                  {formData.enabledModules.map(m => {
                    const mod = appModules.find(am => am.id === m);
                    return (
                      <span 
                        key={m} 
                        className="w-6 h-6 rounded flex items-center justify-center"
                        style={{ background: mod?.color + '20' }}
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" style={{ color: mod?.color }}>
                          {mod?.icon}
                        </svg>
                      </span>
                    );
                  })}
                </div>
              </div>
              
              {/* Валюта */}
              {formData.enabledModules.includes('finance') && (
                <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-xs" style={{ color: colors.text.tertiary }}>Валюта</span>
                  <span className="text-sm" style={{ color: colors.text.primary }}>
                    {selectedCurrency?.flag} {formData.currency}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div 
          className="fixed bottom-0 left-0 right-0 px-4 pb-5 pt-3"
          style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.9) 0%, transparent 100%)', zIndex: 10 }}
        >
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={completeOnboarding}
            className="w-full h-12 rounded-xl font-semibold relative overflow-hidden"
            style={{ background: gradients.gold, color: colors.bg.primary }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ background: gradients.shimmer }}
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <span className="relative z-10">Начать использовать</span>
          </motion.button>
        </div>
      </div>
    );
  };

  // ============ RENDER ============
  const renderStepContent = () => {
    switch (step) {
      case 'intro': return renderIntroStep();
      case 'profile': return renderProfileStep();
      case 'preferences': return renderPreferencesStep();
      case 'modules': return renderModulesStep();
      case 'lifestyle': return renderLifestyleStep();
      case 'finance-setup': return renderFinanceSetupStep();
      case 'finance-categories': return renderFinanceCategoriesStep();
      case 'tasks-setup': return renderTasksSetupStep();
      case 'calendar-setup': return renderCalendarSetupStep();
      case 'habits-setup': return renderHabitsSetupStep();
      case 'notifications': return renderNotificationsStep();
      case 'complete': return renderCompleteStep();
      default: return null;
    }
  };

  return renderStepContent();
}

// ============================================================================
// STEP WRAPPER
// ============================================================================

interface StepWrapperProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  progress: number;
  backgroundImage?: string;
  overlayIntensity?: OverlayIntensity;
}

function StepWrapper({ 
  title, 
  subtitle, 
  children, 
  onBack, 
  onNext, 
  nextDisabled = false,
  nextLabel = 'Далее',
  progress,
  backgroundImage,
  overlayIntensity = 'medium',
}: StepWrapperProps) {
  return (
    <div className="page-scrollable" style={{ background: '#0A0A0A' }}>
      {backgroundImage && (
        <>
          <div 
            className="fixed inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})`, zIndex: 0 }}
          />
          <div 
            className="fixed inset-0"
            style={{ background: getOverlayGradient(overlayIntensity), zIndex: 1 }}
          />
        </>
      )}
      
      <div className="relative min-h-full px-4 pb-24" style={{ zIndex: 2 }}>
        <div className="pt-3 pb-4">
          <div className="h-1 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <motion.div 
              className="h-full rounded-full"
              style={{ background: `linear-gradient(135deg, #C9A962 0%, #E8D5A3 50%, #C9A962 100%)` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={onBack} 
              className="w-9 h-9 flex items-center justify-center rounded-lg"
              style={{ background: 'rgba(10,10,10,0.5)', color: '#F5F5F5', backdropFilter: 'blur(8px)' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold" style={{ color: '#F5F5F5', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                {title}
              </h1>
              <p className="text-sm" style={{ color: '#A3A3A3', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="pb-2">{children}</div>
      </div>

      <div 
        className="fixed bottom-0 left-0 right-0 px-4 pb-5 pt-3"
        style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.6) 60%, transparent 100%)', zIndex: 10 }}
      >
        <motion.button
          onClick={onNext}
          disabled={nextDisabled}
          className="w-full h-12 rounded-xl font-semibold transition-all"
          style={{ 
            background: nextDisabled ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, #C9A962 0%, #E8D5A3 50%, #C9A962 100%)`,
            color: nextDisabled ? '#737373' : '#0A0A0A',
            opacity: nextDisabled ? 0.5 : 1,
          }}
          whileTap={nextDisabled ? {} : { scale: 0.98 }}
        >
          {nextLabel}
        </motion.button>
      </div>
    </div>
  );
}