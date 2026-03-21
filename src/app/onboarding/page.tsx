// src/app/onboarding/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, EnabledModule } from '@/store';
import { useTelegram } from '@/hooks';
// ─── API ───────────────────────────────────────────────────────────────────
import { onboardingService, metaService, ApiError } from '@/services';

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
    accent: colors.gold.primary,
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Финансы под контролем',
    subtitle: 'Доходы, расходы, цели',
    description: 'Следите за балансом, планируйте бюджет и достигайте целей',
    background: '/onboarding-finance.jpg',
    accent: colors.modules.finance,
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Всё в одном месте',
    subtitle: 'Единая экосистема',
    description: 'Задачи, привычки, контакты и события — всё связано между собой',
    background: '/onboarding-all.jpg',
    accent: colors.gold.primary,
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

// ============================================================================
// ДАННЫЕ — МОДУЛИ
// ============================================================================

// Модули, заблокированные в текущей версии (будут доступны позже)
const LOCKED_MODULES: EnabledModule[] = ['tasks', 'events', 'habits', 'notes', 'contacts'];

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
// LOCK ICON
// ============================================================================
function LockIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="#525252" strokeWidth="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4" stroke="#525252" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

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
  // finance — обязательный, всегда включён
  const [enabledModules, setEnabledModules] = useState<EnabledModule[]>(['finance']);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

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

  // finance нельзя снять; locked модули не переключаются
  const toggleModule = (moduleId: EnabledModule) => {
    if (moduleId === 'finance') return;
    if (LOCKED_MODULES.includes(moduleId)) return;
    hapticFeedback?.('selection');
    setEnabledModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // ─── API: сохранение онбординга ──────────────────────────────────────────
  const completeOnboarding = async () => {
    hapticFeedback?.('notification', 'success');
    setSubmitting(true);
    setApiError('');

    const onboardingFormData = {
      name: user?.first_name || '',
      phone: '',
      birthday: '',
      language: (navigator.language?.split('-')[0] as 'ru') || 'ru',
      theme: 'dark' as const,
      currency: 'UZS',
      initialBalance: 0,
      monthlyBudget: 0,
      salaryDay: 10,
      expenseCategories: ['food', 'transport', 'housing', 'utilities', 'entertainment'],
      incomeCategories: ['salary'],
      goals: [],
      lifestyle: '' as '' | 'single' | 'couple' | 'family' | 'roommates',
      notifications: 'important' as const,
      enabledModules,
    };

    try {
      const { user: serverUser } = await onboardingService.complete({
        profile: {
          name: onboardingFormData.name || undefined,
        },
        settings: {
          language: onboardingFormData.language as 'ru' | 'uz',
          enabledModules,
          theme: 'dark',
        },
        finance: {
          currency: 'UZS',
          initialBalance: 0,
          monthlyBudget: 0,
          salaryDay: 10,
          expenseCategories: onboardingFormData.expenseCategories,
          incomeCategories: onboardingFormData.incomeCategories,
        },
      });

      saveOnboardingData({
        ...onboardingFormData,
        lifestyle: (serverUser.profile.lifestyle || onboardingFormData.lifestyle || '') as '' | 'single' | 'couple' | 'family' | 'roommates',
        name: serverUser.profile.name || onboardingFormData.name,
        currency: serverUser.finance.currency || 'UZS',
        initialBalance: serverUser.finance.initialBalance ?? 0,
        monthlyBudget: serverUser.finance.monthlyBudget ?? 0,
        salaryDay: serverUser.finance.salaryDay ?? 10,
        expenseCategories: serverUser.finance.expenseCategories.length
          ? serverUser.finance.expenseCategories
          : onboardingFormData.expenseCategories,
        incomeCategories: serverUser.finance.incomeCategories.length
          ? serverUser.finance.incomeCategories
          : onboardingFormData.incomeCategories,
      });

      router.replace('/');
    } catch (e) {
      console.warn('[Onboarding] API error, saving locally:', e);
      setApiError(e instanceof ApiError ? e.message : '');
      saveOnboardingData(onboardingFormData);
      router.replace('/');
    } finally {
      setSubmitting(false);
    }
  };

  // ───────── Slide Variants ─────────

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  // ========================================================================
  // STEP 1: INTRO
  // ========================================================================

  const renderIntroStep = () => {
    const currentSlide = introSlides[introSlide];

    return (
      <div className="page-scrollable" style={{ background: colors.bg.primary }}>
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
          style={{ backgroundImage: `url(${currentSlide.background})`, zIndex: 0 }}
        />
        <div
          className="fixed inset-0"
          style={{ background: getOverlayGradient('light'), zIndex: 1 }}
        />

        <div className="relative min-h-full flex flex-col px-4 pb-24" style={{ zIndex: 2 }}>
          {introSlide < introSlides.length - 1 && (
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleIntroSkip}
                className="text-sm px-3 py-1.5 rounded-lg"
                style={{
                  color: colors.text.secondary,
                  background: 'rgba(255,255,255,0.08)',
                }}
              >
                Пропустить
              </button>
            </div>
          )}

          <div className="flex-1 flex flex-col items-center justify-center text-center pt-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={introSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
                  style={{
                    background: `${currentSlide.accent}20`,
                    border: `1px solid ${currentSlide.accent}40`,
                    color: currentSlide.accent,
                  }}
                >
                  {currentSlide.icon}
                </div>

                <h1
                  className="text-3xl font-bold mb-2"
                  style={{ color: colors.text.primary, textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
                >
                  {currentSlide.title}
                </h1>
                <p
                  className="text-lg font-medium mb-3"
                  style={{ color: currentSlide.accent, textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}
                >
                  {currentSlide.subtitle}
                </p>
                <p
                  className="text-sm leading-relaxed max-w-xs"
                  style={{ color: colors.text.secondary, textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
                >
                  {currentSlide.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 pb-4">
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
  // STEP 2: MODULES
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

        <div className="grid grid-cols-2 gap-2">
          {appModules.map((module) => {
            const isLocked = LOCKED_MODULES.includes(module.id);
            const isFinance = module.id === 'finance';
            // Finance всегда selected; locked — никогда
            const isSelected = !isLocked && enabledModules.includes(module.id);

            return (
              <motion.button
                key={module.id}
                onClick={() => !isLocked && toggleModule(module.id)}
                className="flex flex-col items-start p-3 rounded-xl transition-all text-left relative"
                style={{
                  background: isLocked
                    ? 'rgba(0, 0, 0, 0.15)'
                    : isSelected
                    ? `${module.color}15`
                    : 'rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(10px)',
                  border: isLocked
                    ? '1px solid rgba(255, 255, 255, 0.04)'
                    : isSelected
                    ? `1px solid ${module.color}50`
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  opacity: isLocked ? 0.42 : 1,
                  cursor: isLocked ? 'default' : 'pointer',
                }}
                whileTap={isLocked ? {} : { scale: 0.98 }}
              >
                {/* Icon row */}
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      background: isLocked
                        ? 'rgba(255,255,255,0.05)'
                        : isSelected
                        ? module.color
                        : `${module.color}30`,
                      color: isLocked ? '#404040' : isSelected ? '#000' : module.color,
                    }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      {module.icon}
                    </svg>
                  </div>

                  {/* Lock icon for locked modules, checkbox for others */}
                  {isLocked ? (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      <LockIcon />
                    </div>
                  ) : (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center transition-all"
                      style={{
                        background: isSelected ? module.color : 'transparent',
                        border: isSelected
                          ? `2px solid ${module.color}`
                          : '2px solid rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M5 13l4 4L19 7"
                            stroke="#000"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  )}
                </div>

                <p
                  className="text-sm font-semibold mb-0.5"
                  style={{ color: isLocked ? '#404040' : colors.text.primary }}
                >
                  {module.name}
                </p>
                <p
                  className="text-xs"
                  style={{ color: isLocked ? '#303030' : colors.text.tertiary }}
                >
                  {isLocked ? 'Скоро' : module.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pb-5 pt-3"
        style={{
          background: 'linear-gradient(to top, rgba(10,10,10,0.95) 0%, transparent 100%)',
          zIndex: 10,
        }}
      >
        <motion.button
          onClick={goToComplete}
          className="w-full h-12 rounded-xl font-semibold"
          style={{
            background: gradients.gold,
            color: colors.bg.primary,
          }}
          whileTap={{ scale: 0.98 }}
        >
          Продолжить
        </motion.button>
      </div>
    </div>
  );

  // ========================================================================
  // STEP 3: COMPLETE
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
            {user?.first_name
              ? `Добро пожаловать, ${user.first_name}!`
              : 'Добро пожаловать в LifeLedger!'}
          </p>

          <div className="flex flex-wrap gap-1.5 justify-center mb-4">
            {enabledModules.map((moduleId) => {
              const mod = appModules.find((m) => m.id === moduleId);
              if (!mod) return null;
              return (
                <span
                  key={moduleId}
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    background: `${mod.color}20`,
                    color: mod.color,
                    border: `1px solid ${mod.color}40`,
                  }}
                >
                  {mod.name}
                </span>
              );
            })}
          </div>

          {apiError && (
            <p className="text-xs mb-3" style={{ color: '#F87171' }}>
              {apiError}
            </p>
          )}
        </motion.div>
      </div>

      {/* CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pb-5 pt-3"
        style={{
          background: 'linear-gradient(to top, rgba(10,10,10,0.95) 0%, transparent 100%)',
          zIndex: 10,
        }}
      >
        <motion.button
          onClick={completeOnboarding}
          disabled={submitting}
          className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2"
          style={{
            background: gradients.gold,
            color: colors.bg.primary,
            opacity: submitting ? 0.7 : 1,
          }}
          whileTap={submitting ? {} : { scale: 0.98 }}
        >
          {submitting && (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          <span>{submitting ? 'Сохраняем…' : 'Начать использовать'}</span>
        </motion.button>
      </div>
    </div>
  );

  switch (step) {
    case 'intro':    return renderIntroStep();
    case 'modules':  return renderModulesStep();
    case 'complete': return renderCompleteStep();
    default:         return null;
  }
}