'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  LanguageIcon,
  BellIcon,
  SpeakerWaveIcon,
  DevicePhoneMobileIcon,
  CalendarIcon,
  CheckCircleIcon,
  FireIcon,
  TrophyIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useUserStore } from '@/store/userStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useTelegram } from '@/hooks/useTelegram';

type Theme = 'light' | 'dark' | 'system';
type Language = 'ru' | 'en' | 'uz';

const themes: { id: Theme; icon: React.ElementType; label: string }[] = [
  { id: 'light', icon: SunIcon, label: 'profile.themeLight' },
  { id: 'dark', icon: MoonIcon, label: 'profile.themeDark' },
  { id: 'system', icon: ComputerDesktopIcon, label: 'profile.themeSystem' },
];

const languages: { id: Language; label: string; native: string }[] = [
  { id: 'ru', label: 'Русский', native: 'Русский' },
  { id: 'en', label: 'English', native: 'English' },
  { id: 'uz', label: 'O\'zbek', native: 'O\'zbekcha' },
];

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  const { t, language: currentLanguage } = useTranslation();
  const { hapticFeedback, user: telegramUser } = useTelegram();
  
  const profile = useUserStore((state) => state.profile);
  const setTheme = useUserStore((state) => state.setTheme);
  const setLanguage = useUserStore((state) => state.setLanguage);
  const toggleNotifications = useUserStore((state) => state.toggleNotifications);
  const toggleSound = useUserStore((state) => state.toggleSound);
  const toggleHaptic = useUserStore((state) => state.toggleHaptic);
  const setWeekStartsOn = useUserStore((state) => state.setWeekStartsOn);

  useEffect(() => {
    setMounted(true);
  }, []);

  const settings = profile?.settings;
  const stats = profile?.stats;

  // Имя пользователя из Telegram или дефолтное
  const userName = telegramUser?.first_name || profile?.name || 'User';

  // Статистика для отображения
  const displayStats = useMemo(() => [
    {
      icon: CheckCircleIcon,
      value: stats?.completedTasks || 0,
      label: t('profile.completedTasks'),
      color: 'var(--success)',
      bgColor: 'var(--success-subtle)',
    },
    {
      icon: FireIcon,
      value: stats?.streak || 0,
      label: t('profile.currentStreak'),
      color: 'var(--error)',
      bgColor: 'var(--error-subtle)',
    },
    {
      icon: TrophyIcon,
      value: stats?.longestStreak || 0,
      label: t('profile.longestStreak'),
      color: 'var(--warning)',
      bgColor: 'var(--warning-subtle)',
    },
    {
      icon: CalendarIcon,
      value: stats?.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0,
      label: t('profile.completionRate'),
      color: 'var(--primary)',
      bgColor: 'var(--primary-subtle)',
      suffix: '%',
    },
  ], [stats, t]);

  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
    hapticFeedback?.('selection');
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setShowLanguageModal(false);
    hapticFeedback?.('selection');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--primary-subtle)' }}
          >
            <UserCircleIcon className="w-10 h-10" style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {userName}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {telegramUser?.username ? `@${telegramUser.username}` : t('profile.taskflowUser')}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          {displayStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl p-4"
                style={{ backgroundColor: 'var(--surface)' }}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: stat.bgColor }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {stat.value}{stat.suffix || ''}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Theme Selection */}
      <div className="px-4 mb-6">
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          {t('profile.theme')}
        </h3>
        <div 
          className="rounded-2xl p-2 flex gap-2"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          {themes.map((theme) => {
            const Icon = theme.icon;
            const isSelected = settings?.theme === theme.id;
            return (
              <motion.button
                key={theme.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleThemeChange(theme.id)}
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                style={{
                  backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{t(theme.label)}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Settings List */}
      <div className="px-4">
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          {t('profile.settings')}
        </h3>
        
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--surface)' }}>
          {/* Language */}
          <button
            onClick={() => {
              setShowLanguageModal(true);
              hapticFeedback?.('selection');
            }}
            className="w-full flex items-center justify-between p-4 active:opacity-70"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--primary-subtle)' }}
              >
                <LanguageIcon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              </div>
              <span style={{ color: 'var(--text-primary)' }}>{t('profile.language')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--text-tertiary)' }}>
                {languages.find(l => l.id === currentLanguage)?.native}
              </span>
              <ChevronRightIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
            </div>
          </button>

          <div className="h-px mx-4" style={{ backgroundColor: 'var(--border)' }} />

          {/* Week Starts On */}
          <button
            onClick={() => {
              const newValue = settings?.weekStartsOn === 1 ? 0 : 1;
              setWeekStartsOn(newValue);
              hapticFeedback?.('selection');
            }}
            className="w-full flex items-center justify-between p-4 active:opacity-70"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--info-subtle)' }}
              >
                <CalendarIcon className="w-5 h-5" style={{ color: 'var(--info)' }} />
              </div>
              <span style={{ color: 'var(--text-primary)' }}>{t('profile.weekStartsOn')}</span>
            </div>
            <span style={{ color: 'var(--text-tertiary)' }}>
              {settings?.weekStartsOn === 1 ? t('profile.monday') : t('profile.sunday')}
            </span>
          </button>

          <div className="h-px mx-4" style={{ backgroundColor: 'var(--border)' }} />

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--warning-subtle)' }}
              >
                <BellIcon className="w-5 h-5" style={{ color: 'var(--warning)' }} />
              </div>
              <span style={{ color: 'var(--text-primary)' }}>{t('profile.notifications')}</span>
            </div>
            <ToggleSwitch
              enabled={settings?.notifications ?? true}
              onChange={() => {
                toggleNotifications();
                hapticFeedback?.('selection');
              }}
            />
          </div>

          <div className="h-px mx-4" style={{ backgroundColor: 'var(--border)' }} />

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--success-subtle)' }}
              >
                <SpeakerWaveIcon className="w-5 h-5" style={{ color: 'var(--success)' }} />
              </div>
              <span style={{ color: 'var(--text-primary)' }}>{t('profile.sound')}</span>
            </div>
            <ToggleSwitch
              enabled={settings?.soundEnabled ?? true}
              onChange={() => {
                toggleSound();
                hapticFeedback?.('selection');
              }}
            />
          </div>

          <div className="h-px mx-4" style={{ backgroundColor: 'var(--border)' }} />

          {/* Haptic Toggle */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--error-subtle)' }}
              >
                <DevicePhoneMobileIcon className="w-5 h-5" style={{ color: 'var(--error)' }} />
              </div>
              <span style={{ color: 'var(--text-primary)' }}>{t('profile.haptic')}</span>
            </div>
            <ToggleSwitch
              enabled={settings?.hapticEnabled ?? true}
              onChange={() => {
                toggleHaptic();
                hapticFeedback?.('impact');
              }}
            />
          </div>
        </div>
      </div>

      {/* App Version */}
      <div className="px-4 mt-8 text-center">
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          TaskFlow v1.0.0
        </p>
      </div>

      {/* Language Modal */}
      {showLanguageModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowLanguageModal(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-t-3xl p-6"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ backgroundColor: 'var(--border)' }} />
            
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              {t('profile.selectLanguage')}
            </h2>
            
            <div className="space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id)}
                  className="w-full flex items-center justify-between p-4 rounded-xl transition-all"
                  style={{
                    backgroundColor: currentLanguage === lang.id ? 'var(--primary-subtle)' : 'var(--surface-secondary)',
                  }}
                >
                  <span 
                    className="font-medium"
                    style={{ 
                      color: currentLanguage === lang.id ? 'var(--primary)' : 'var(--text-primary)' 
                    }}
                  >
                    {lang.native}
                  </span>
                  {currentLanguage === lang.id && (
                    <CheckCircleIcon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// Toggle Switch Component
function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <motion.button
      onClick={onChange}
      className="relative w-12 h-7 rounded-full transition-colors"
      style={{ backgroundColor: enabled ? 'var(--primary)' : 'var(--border)' }}
    >
      <motion.div
        animate={{ x: enabled ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
      />
    </motion.button>
  );
}