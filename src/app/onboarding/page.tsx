// src/app/onboarding/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, EnabledModule } from '@/store';
import { useTelegram } from '@/hooks';

// ============================================================================
// ЦВЕТОВАЯ СИСТЕМА
// ============================================================================

const colors = {
  gold: {
    primary: '#C9A962',
    light: '#E8D5A3',
    border: 'rgba(201, 169, 98, 0.40)',
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

// ============================================================================
// ДАННЫЕ — INTRO SLIDES (Showcase возможностей)
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
    title: 'Финансы под контролем',
    subtitle: 'Доходы • Расходы • Бюджет',
    description: 'Отслеживайте каждую транзакцию и достигайте финансовых целей',
    background: '/onboarding-analytics.jpg',
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    accent: colors.modules.finance,
  },
  {
    id: 3,
    title: 'Задачи и привычки',
    subtitle: 'Проекты • Чек-листы • Стрики',
    description: 'Организуйте дела и формируйте полезные привычки',
    background: '/onboarding-tasks.jpg',
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accent: colors.modules.tasks,
  },
  {
    id: 4,
    title: 'Календарь и заметки',
    subtitle: 'События • Контакты • Записи',
    description: 'Храните всё важное в одном месте',
    background: '/onboarding-modules.jpg',
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    accent: colors.modules.events,
  },
];

// ============================================================================
// ДАННЫЕ — МОДУЛИ
// ============================================================================

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

// ============================================================================
// OVERLAY HELPERS
// ============================================================================

const getOverlayGradient = (intensity: 'light' | 'medium') => {
  switch (intensity) {
    case 'light':
      return 'linear-gradient(to bottom, rgba(10,10,10,0.1) 0%, rgba(10,10,10,0.25) 50%, rgba(10,10,10,0.5) 100%)';
    case 'medium':
      return 'linear-gradient(to bottom, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.4) 50%, rgba(10,10,10,0.65) 100%)';
  }
};

// ============================================================================
// ONBOARDING: 3 шага — Intro Slides → Модули → Готово
// ============================================================================

type OnboardingStep = 'intro' | 'modules' | 'complete';

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
  const [enabledModules, setEnabledModules] = useState<EnabledModule[]>(['finance']);

  // ───────── Навигация ─────────

  const goToModules = () => {
    hapticFeedback?.('selection');
    setStep('modules');
  };

  const goToComplete = () => {
    hapticFeedback?.('selection');
    setStep('complete');
  };

  const handleIntroNext = () => {
    hapticFeedback?.('selection');
    if (introSlide < introSlides.length - 1) {
      setDirection(1);
      setIntroSlide((prev) => prev + 1);
    } else {
      goToModules();
    }
  };

  const handleIntroSkip = () => {
    hapticFeedback?.('selection');
    goToModules();
  };

  const toggleModule = (moduleId: EnabledModule) => {
    hapticFeedback?.('selection');
    setEnabledModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const completeOnboarding = () => {
    hapticFeedback?.('notification', 'success');

    // Сохраняем ТОЛЬКО выбранные модули + smart defaults
    // Остальное пользователь настроит контекстно на нужных страницах
    saveOnboardingData({
      name: user?.first_name || '',
      phone: '',
      birthday: '',
      language: (navigator.language?.split('-')[0] as 'ru') || 'ru', // Auto-detect
      theme: 'dark', // Default dark (Carbon Black)
      currency: 'UZS', // Default по геолокации — будет уточнено на странице финансов
      initialBalance: 0,
      monthlyBudget: 0,
      salaryDay: 10,
      expenseCategories: ['food', 'transport', 'housing', 'utilities', 'entertainment'],
      incomeCategories: ['salary'],
      goals: [],
      lifestyle: '',
      notifications: 'important',
      enabledModules,
    });

    router.replace('/');
  };

  // ───────── Slide Variants ─────────

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  // ========================================================================
  // STEP 1: INTRO — Showcase слайды (что умеет приложение)
  // ========================================================================

  const renderIntroStep = () => {
    const currentSlide = introSlides[introSlide];

    return (
      <div className="page-scrollable" style={{ background: colors.bg.primary }}>
        {/* Фон */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
          style={{ backgroundImage: `url(${currentSlide.background})`, zIndex: 0 }}
        />
        <div
          className="fixed inset-0"
          style={{ background: getOverlayGradient('light'), zIndex: 1 }}
        />

        {/* Контент */}
        <div className="relative min-h-full flex flex-col px-4 pb-24" style={{ zIndex: 2 }}>
          {/* Skip */}
          {introSlide < introSlides.length - 1 && (
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleIntroSkip}
                className="text-sm px-3 py-1.5 rounded-lg"
                style={{ color: colors.text.secondary, background: 'rgba(0,0,0,0.3)' }}
              >
                Пропустить
              </button>
            </div>
          )}

          {/* Slide */}
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
                className="flex flex-col items-center text-center p-6 rounded-2xl max-w-sm"
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
                  style={{
                    background: `${currentSlide.accent}20`,
                    color: currentSlide.accent,
                  }}
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

          {/* Dots */}
          <div className="flex justify-center gap-2 mb-4">
            {introSlides.map((_, index) => (
              <div
                key={index}
                onClick={() => {
                  setDirection(index > introSlide ? 1 : -1);
                  setIntroSlide(index);
                }}
                className="transition-all duration-300 cursor-pointer"
                style={{
                  width: index === introSlide ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background:
                    index === introSlide
                      ? currentSlide.accent
                      : 'rgba(255, 255, 255, 0.3)',
                }}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="fixed bottom-0 left-0 right-0 px-4 pb-5 pt-3"
          style={{
            background: 'linear-gradient(to top, rgba(10,10,10,0.9) 0%, transparent 100%)',
            zIndex: 10,
          }}
        >
          <motion.button
            onClick={handleIntroNext}
            className="w-full h-12 rounded-xl font-semibold"
            style={{
              background:
                introSlide === introSlides.length - 1
                  ? gradients.gold
                  : 'rgba(255, 255, 255, 0.1)',
              border:
                introSlide === introSlides.length - 1
                  ? 'none'
                  : '1px solid rgba(255, 255, 255, 0.15)',
              color:
                introSlide === introSlides.length - 1
                  ? colors.bg.primary
                  : colors.text.primary,
            }}
            whileTap={{ scale: 0.98 }}
          >
            {introSlide === introSlides.length - 1 ? 'Начать настройку' : 'Далее'}
          </motion.button>
        </div>
      </div>
    );
  };

  // ========================================================================
  // STEP 2: MODULES — Выбор модулей (единственный вопрос)
  // ========================================================================

  const renderModulesStep = () => (
    <div className="page-scrollable" style={{ background: colors.bg.primary }}>
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/onboarding-modules.jpg)', zIndex: 0 }}
      />
      <div
        className="fixed inset-0"
        style={{ background: getOverlayGradient('medium'), zIndex: 1 }}
      />

      <div className="relative min-h-full px-4 pb-24" style={{ zIndex: 2 }}>
        {/* Header */}
        <div className="pt-4 pb-4">
          <h1
            className="text-xl font-bold"
            style={{ color: colors.text.primary, textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
          >
            Что будем отслеживать?
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: colors.text.secondary, textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
          >
            Выберите модули — остальное настроится автоматически
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-2 gap-2">
          {appModules.map((module) => {
            const isSelected = enabledModules.includes(module.id);
            return (
              <motion.button
                key={module.id}
                onClick={() => toggleModule(module.id)}
                className="flex flex-col items-start p-3 rounded-xl transition-all text-left"
                style={{
                  background: isSelected
                    ? `${module.color}15`
                    : 'rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(10px)',
                  border: isSelected
                    ? `1px solid ${module.color}50`
                    : '1px solid rgba(255, 255, 255, 0.1)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      background: isSelected ? module.color : `${module.color}30`,
                      color: isSelected ? '#000' : module.color,
                    }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      {module.icon}
                    </svg>
                  </div>
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      background: isSelected ? module.color : 'transparent',
                      border: isSelected
                        ? 'none'
                        : '2px solid rgba(255,255,255,0.3)',
                    }}
                  >
                    {isSelected && <span className="text-xs">✓</span>}
                  </div>
                </div>
                <p className="text-sm font-medium" style={{ color: colors.text.primary }}>
                  {module.name}
                </p>
                <p className="text-[10px]" style={{ color: colors.text.tertiary }}>
                  {module.examples}
                </p>
              </motion.button>
            );
          })}
        </div>

        <p className="text-xs text-center mt-3" style={{ color: colors.text.tertiary }}>
          Можно изменить позже в настройках
        </p>
      </div>

      {/* CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pb-5 pt-3"
        style={{
          background: 'linear-gradient(to top, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.6) 60%, transparent 100%)',
          zIndex: 10,
        }}
      >
        <motion.button
          onClick={goToComplete}
          disabled={enabledModules.length === 0}
          className="w-full h-12 rounded-xl font-semibold transition-all"
          style={{
            background:
              enabledModules.length === 0
                ? 'rgba(255,255,255,0.1)'
                : gradients.gold,
            color: enabledModules.length === 0 ? colors.text.tertiary : colors.bg.primary,
            opacity: enabledModules.length === 0 ? 0.5 : 1,
          }}
          whileTap={enabledModules.length === 0 ? {} : { scale: 0.98 }}
        >
          Продолжить
        </motion.button>
      </div>
    </div>
  );

  // ========================================================================
  // STEP 3: COMPLETE — Краткое саммари + запуск
  // ========================================================================

  const renderCompleteStep = () => (
    <div className="page-scrollable" style={{ background: colors.bg.primary }}>
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/onboarding-complete.jpg)', zIndex: 0 }}
      />
      <div
        className="fixed inset-0"
        style={{ background: getOverlayGradient('light'), zIndex: 1 }}
      />

      <div
        className="relative min-h-full flex flex-col items-center justify-center px-4 pb-24"
        style={{ zIndex: 2 }}
      >
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
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: colors.success.primary }}
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke={colors.bg.primary}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>

          <h1 className="text-xl font-bold mb-1" style={{ color: colors.text.primary }}>
            Всё готово!
          </h1>
          <p className="text-sm mb-4" style={{ color: colors.text.secondary }}>
            {user?.first_name ? `${user.first_name}, д` : 'Д'}обро пожаловать в LifeLedger
          </p>

          {/* Выбранные модули */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {enabledModules.map((m) => {
              const mod = appModules.find((am) => am.id === m);
              if (!mod) return null;
              return (
                <motion.div
                  key={m}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + enabledModules.indexOf(m) * 0.05 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{ background: `${mod.color}15`, border: `1px solid ${mod.color}30` }}
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ color: mod.color }}
                  >
                    {mod.icon}
                  </svg>
                  <span className="text-xs font-medium" style={{ color: mod.color }}>
                    {mod.name}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Подсказка */}
          <p className="text-xs" style={{ color: colors.text.tertiary }}>
            Остальное настроим по ходу дела — без лишних вопросов
          </p>
        </motion.div>
      </div>

      {/* CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pb-5 pt-3"
        style={{
          background: 'linear-gradient(to top, rgba(10,10,10,0.9) 0%, transparent 100%)',
          zIndex: 10,
        }}
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

  // ========================================================================
  // RENDER
  // ========================================================================

  switch (step) {
    case 'intro':
      return renderIntroStep();
    case 'modules':
      return renderModulesStep();
    case 'complete':
      return renderCompleteStep();
    default:
      return null;
  }
}