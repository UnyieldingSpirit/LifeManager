// src/app/goals/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import {
  FlagIcon, TrophyIcon, TrashIcon, ChartBarIcon,
  PlusCircleIcon, PlusIcon, CalendarDaysIcon,
  PencilSquareIcon, CheckIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';
import { formatCurrency } from '@/lib/utils';
import { syncGoals, deleteGoalApi, contributeToGoalApi, updateGoalApi } from '@/store/apiActions';
import type { GoalDto } from '@/services/types';

// ─── Иконки и цвета для целей ─────────────────────────────────────────────

const GOAL_PRESETS = [
  { icon: '🚗', label: { ru: 'Машина',       en: 'Car'          }, color: '#3B82F6' },
  { icon: '🏠', label: { ru: 'Жильё',        en: 'Housing'      }, color: '#8B5CF6' },
  { icon: '✈️', label: { ru: 'Путешествие',  en: 'Travel'       }, color: '#0EA5E9' },
  { icon: '📱', label: { ru: 'Гаджет',       en: 'Gadget'       }, color: '#EC4899' },
  { icon: '🎓', label: { ru: 'Образование',  en: 'Education'    }, color: '#6366F1' },
  { icon: '💎', label: { ru: 'Роскошь',      en: 'Luxury'       }, color: '#C9A962' },
  { icon: '🏥', label: { ru: 'Здоровье',     en: 'Health'       }, color: '#10B981' },
  { icon: '💍', label: { ru: 'Украшение',    en: 'Jewelry'      }, color: '#F59E0B' },
  { icon: '🐕', label: { ru: 'Питомец',      en: 'Pet'          }, color: '#F97316' },
  { icon: '🎯', label: { ru: 'Цель',         en: 'Goal'         }, color: '#EF4444' },
  { icon: '💰', label: { ru: 'Накопления',   en: 'Savings'      }, color: '#22C55E' },
  { icon: '🎁', label: { ru: 'Подарок',      en: 'Gift'         }, color: '#F43F5E' },
];

const PRIORITY_CONFIG = {
  urgent: { label: { ru: 'Срочно',   en: 'Urgent' },  color: '#EF4444' },
  high:   { label: { ru: 'Высокий',  en: 'High' },    color: '#F97316' },
  medium: { label: { ru: 'Средний',  en: 'Medium' },  color: '#FBBF24' },
  low:    { label: { ru: 'Низкий',   en: 'Low' },     color: '#22C55E' },
};

// ─── Edit Goal Sheet ───────────────────────────────────────────────────────

interface EditGoalSheetProps {
  goal: GoalDto;
  currency: string;
  language: string;
  onClose: () => void;
  onSaved: () => void;
}

function EditGoalSheet({ goal, currency, language, onClose, onSaved }: EditGoalSheetProps) {
  const [name, setName]         = useState(goal.name);
  const [icon, setIcon]         = useState(goal.icon);
  const [color, setColor]       = useState(goal.color);
  const [target, setTarget]     = useState(String(goal.targetAmount));
  const [deadline, setDeadline] = useState(goal.deadline || '');
  const [priority, setPriority] = useState<keyof typeof PRIORITY_CONFIG>(goal.priority as any || 'medium');
  const [saving, setSaving]     = useState(false);
  const addToast = useStore(s => s.addToast);

  const handleSave = async () => {
    const num = parseFloat(target.replace(/\s/g, '').replace(',', '.'));
    if (!name.trim() || !num || num <= 0) return;
    setSaving(true);
    try {
      await updateGoalApi(goal.id, { name: name.trim(), icon, color, targetAmount: num, deadline: deadline || undefined, priority });
      addToast({ type: 'success', message: language === 'ru' ? 'Цель обновлена' : 'Goal updated' });
      onSaved();
    } catch {
      addToast({ type: 'error', message: language === 'ru' ? 'Ошибка' : 'Error' });
    } finally { setSaving(false); }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={onClose} />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-5"
        style={{ background: '#111', border: '1px solid var(--glass-border)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--border)' }} />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {language === 'ru' ? 'Редактировать цель' : 'Edit Goal'}
          </h3>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}>
            <XMarkIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
          </motion.button>
        </div>

        {/* Icon picker */}
        <div className="mb-3">
          <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Иконка' : 'Icon'}</p>
          <div className="flex flex-wrap gap-2">
            {GOAL_PRESETS.map(p => (
              <motion.button key={p.icon} whileTap={{ scale: 0.85 }}
                onClick={() => { setIcon(p.icon); setColor(p.color); }}
                className="w-12 h-12 rounded-xl text-2xl flex items-center justify-center"
                style={{ background: icon === p.icon ? `${p.color}25` : 'var(--surface)', border: `1px solid ${icon === p.icon ? p.color : 'var(--border)'}` }}>
                {p.icon}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="mb-3">
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Название' : 'Name'}</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} autoFocus
            className="w-full h-11 rounded-xl px-4 text-sm outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-focus)', color: 'var(--text-primary)', fontSize: 16 }} />
        </div>

        {/* Target */}
        <div className="mb-3">
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Сумма цели' : 'Target Amount'}</label>
          <input type="number" value={target} onChange={e => setTarget(e.target.value)}
            className="w-full h-11 rounded-xl px-4 text-sm outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 16 }} />
        </div>

        {/* Priority */}
        <div className="mb-3">
          <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Приоритет' : 'Priority'}</p>
          <div className="flex gap-2">
            {(Object.entries(PRIORITY_CONFIG) as [keyof typeof PRIORITY_CONFIG, typeof PRIORITY_CONFIG['urgent']][]).map(([key, cfg]) => (
              <motion.button key={key} whileTap={{ scale: 0.95 }}
                onClick={() => setPriority(key)}
                className="flex-1 py-2 rounded-lg text-xs font-medium"
                style={{
                  background: priority === key ? `${cfg.color}22` : 'var(--surface-dim)',
                  border: `1px solid ${priority === key ? cfg.color : 'var(--border)'}`,
                  color: priority === key ? cfg.color : 'var(--text-secondary)',
                }}>
                {cfg.label[language as 'ru' | 'en'] ?? cfg.label.ru}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Deadline */}
        <div className="mb-5">
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Дедлайн (необязательно)' : 'Deadline (optional)'}</label>
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
            className="w-full h-11 rounded-xl px-4 text-sm outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark', fontSize: 16 }} />
        </div>

        <div className="flex gap-3">
          <motion.button whileTap={{ scale: 0.95 }} onClick={onClose}
            className="flex-1 h-12 rounded-xl font-medium text-sm"
            style={{ background: 'var(--surface-dim)', color: 'var(--text-secondary)' }}>
            {language === 'ru' ? 'Отмена' : 'Cancel'}
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={saving || !name.trim()}
            className="flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #D4B86A 100%)', color: '#0A0A0A', opacity: saving ? 0.7 : 1 }}>
            {saving
              ? <motion.div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
              : <><CheckIcon className="w-4 h-4" />{language === 'ru' ? 'Сохранить' : 'Save'}</>}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────

export default function GoalsPage() {
  const { hapticFeedback } = useTelegram();

  const profile  = useStore(s => s.profile);
  const goals    = useStore(s => s.goals);
  const addToast = useStore(s => s.addToast);
  const openBottomSheet = useStore(s => s.openBottomSheet);

  const language   = profile?.settings?.language || 'ru';
  const currency   = profile?.finance?.currency || 'UZS';

  const [contributeId, setContributeId]       = useState<string | null>(null);
  const [contributeAmount, setContributeAmt]  = useState('');
  const [isContributing, setIsContributing]   = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [isLoading, setIsLoading]             = useState(true);

  useEffect(() => {
    syncGoals()
      .catch(e => console.warn('[Goals]', e?.message))
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
    const totalSaved  = goals.reduce((s, g) => s + g.currentAmount, 0);
    const completed   = goals.filter(g => g.currentAmount >= g.targetAmount).length;
    return {
      totalTarget, totalSaved, completed,
      active: goals.length - completed,
      progress: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0,
    };
  }, [goals]);

  const handleDelete = async (id: string, name: string) => {
    hapticFeedback?.('notification', 'warning');
    try {
      await deleteGoalApi(id);
      addToast({ type: 'info', message: `${language === 'ru' ? 'Удалено' : 'Deleted'}: ${name}` });
    } catch {
      addToast({ type: 'error', message: language === 'ru' ? 'Не удалось удалить' : 'Delete failed' });
    }
  };

  const handleContribute = async () => {
    const amount = parseFloat(contributeAmount.replace(/\s/g, '').replace(',', '.'));
    if (!amount || amount <= 0 || !contributeId) return;
    setIsContributing(true);
    try {
      await contributeToGoalApi(contributeId, amount);
      addToast({ type: 'success', message: language === 'ru' ? 'Пополнено!' : 'Contributed!' });
      setContributeId(null);
      setContributeAmt('');
    } catch {
      addToast({ type: 'error', message: language === 'ru' ? 'Ошибка' : 'Error' });
    } finally { setIsContributing(false); }
  };

  // Sort: active first, then by priority
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  const sortedGoals = [...goals].sort((a, b) => {
    const aComplete = a.currentAmount >= a.targetAmount;
    const bComplete = b.currentAmount >= b.targetAmount;
    if (aComplete !== bComplete) return aComplete ? 1 : -1;
    return (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) - (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2);
  });

  return (
    <div>
      {/* Bg */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-3/4 h-1/2" style={{ background: 'radial-gradient(ellipse 60% 50% at 100% 0%, rgba(251,191,36,0.12) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/3" style={{ background: 'radial-gradient(ellipse at bottom left, rgba(74,222,128,0.08) 0%, transparent 50%)' }} />
      </div>

      {/* Edit Goal Sheet */}
      <AnimatePresence>
        {editingGoal && (
          <EditGoalSheet
            goal={editingGoal}
            currency={currency}
            language={language}
            onClose={() => setEditingGoal(null)}
            onSaved={() => setEditingGoal(null)}
          />
        )}
      </AnimatePresence>

      {/* Contribute Sheet */}
      <AnimatePresence>
        {contributeId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
              onClick={() => setContributeId(null)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-5"
              style={{ background: '#111', border: '1px solid var(--glass-border)' }}>
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border)' }} />
              {(() => {
                const goal = goals.find(g => g.id === contributeId);
                const remaining = goal ? goal.targetAmount - goal.currentAmount : 0;
                return (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${goal?.color}20` }}>
                        {goal?.icon}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {language === 'ru' ? 'Пополнить цель' : 'Contribute'}
                        </h3>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {language === 'ru' ? 'Осталось' : 'Remaining'}: {formatCurrency(remaining, currency, true)}
                        </p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Сумма' : 'Amount'}</label>
                      <input type="number" value={contributeAmount} onChange={e => setContributeAmt(e.target.value)}
                        placeholder="0" autoFocus
                        className="w-full h-14 rounded-xl px-4 text-2xl font-bold outline-none"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border-focus)', color: 'var(--text-primary)', fontSize: 16 }} />
                      {/* Quick amounts */}
                      {remaining > 0 && (
                        <div className="flex gap-2 mt-2">
                          {[10, 25, 50, 100].map(pct => {
                            const val = Math.round(remaining * pct / 100);
                            if (val <= 0) return null;
                            return (
                              <motion.button key={pct} whileTap={{ scale: 0.9 }}
                                onClick={() => setContributeAmt(String(val))}
                                className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                                style={{ background: 'var(--surface-dim)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                                {pct}%
                              </motion.button>
                            );
                          })}
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => setContributeAmt(String(remaining))}
                            className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                            style={{ background: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid rgba(74,222,128,0.3)' }}>
                            100%
                          </motion.button>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setContributeId(null)}
                        className="flex-1 h-12 rounded-xl font-medium text-sm"
                        style={{ background: 'var(--surface-dim)', color: 'var(--text-secondary)' }}>
                        {language === 'ru' ? 'Отмена' : 'Cancel'}
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={handleContribute}
                        disabled={isContributing || !contributeAmount}
                        className="flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: 'white', opacity: isContributing ? 0.7 : 1 }}>
                        {isContributing
                          ? <motion.div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                          : (language === 'ru' ? 'Пополнить' : 'Contribute')}
                      </motion.button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="page-scrollable">
        <header className="px-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FlagIcon className="w-6 h-6" style={{ color: '#F97316' }} />
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {language === 'ru' ? 'Цели накоплений' : 'Saving Goals'}
                </h1>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {goals.length} {language === 'ru' ? 'целей' : 'goals'} · {stats.completed} {language === 'ru' ? 'достигнуто' : 'achieved'}
              </p>
            </div>
            <motion.button whileTap={{ scale: 0.92 }}
              onClick={() => { hapticFeedback?.('medium'); openBottomSheet('add-goal' as any); }}
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.3) 0%, rgba(251,191,36,0.2) 100%)', border: '1px solid rgba(249,115,22,0.4)' }}>
              <PlusIcon className="w-5 h-5" style={{ color: '#F97316' }} />
            </motion.button>
          </div>
        </header>

        <main className="px-4 space-y-4 pb-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: FlagIcon,     val: goals.length,    label: language === 'ru' ? 'Всего'     : 'Total',    color: '#F97316' },
              { icon: ChartBarIcon, val: stats.active,    label: language === 'ru' ? 'Активных'  : 'Active',   color: '#FBBF24' },
              { icon: TrophyIcon,   val: stats.completed, label: language === 'ru' ? 'Достигнуто': 'Achieved', color: '#22C55E' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-3 rounded-xl text-center"
                style={{ background: `${s.color}12`, border: `1px solid ${s.color}28` }}>
                <s.icon className="w-5 h-5 mx-auto mb-1" style={{ color: s.color }} />
                <p className="text-xl font-bold" style={{ color: s.color }}>{s.val}</p>
                <p className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Overall progress */}
          {goals.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl"
              style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, var(--glass-bg) 100%)', border: '1px solid rgba(251,191,36,0.2)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Общий прогресс' : 'Overall Progress'}</span>
                <span className="text-sm font-bold" style={{ color: '#F97316' }}>{Math.round(stats.progress)}%</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${stats.progress}%` }} transition={{ duration: 0.8 }}
                  className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #F97316, #FBBF24)' }} />
              </div>
              <div className="flex justify-between text-[10px]">
                <span style={{ color: 'var(--text-tertiary)' }}>
                  {language === 'ru' ? 'Накоплено' : 'Saved'}: <span style={{ color: 'var(--success)' }}>{formatCurrency(stats.totalSaved, currency, true)}</span>
                </span>
                <span style={{ color: 'var(--text-tertiary)' }}>
                  {language === 'ru' ? 'Цель' : 'Target'}: {formatCurrency(stats.totalTarget, currency, true)}
                </span>
              </div>
            </motion.div>
          )}

          {/* Goals list */}
          <div className="space-y-3">
            {sortedGoals.map((goal, i) => {
              const progress    = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              const isCompleted = progress >= 100;
              const remaining   = goal.targetAmount - goal.currentAmount;
              const daysLeft    = goal.deadline ? differenceInDays(parseISO(goal.deadline), new Date()) : null;
              const priCfg      = PRIORITY_CONFIG[goal.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium;

              return (
                <motion.div key={goal.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="rounded-xl p-4 relative overflow-hidden group"
                  style={{
                    background: isCompleted ? 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, var(--glass-bg) 100%)' : 'var(--glass-bg)',
                    border: isCompleted ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--glass-border)',
                  }}>
                  {/* Priority dot */}
                  <div className="absolute top-3 left-3 w-2 h-2 rounded-full" style={{ background: priCfg.color }} title={priCfg.label[language as 'ru' | 'en']} />

                  {isCompleted && (
                    <div className="absolute top-3 right-3">
                      <CheckCircleSolid className="w-5 h-5" style={{ color: 'var(--success)' }} />
                    </div>
                  )}

                  <div className="flex items-start gap-3 mb-3 pl-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${goal.color}20` }}>
                      {goal.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{goal.name}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {daysLeft !== null && !isCompleted && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{ background: daysLeft < 0 ? 'var(--error-subtle)' : daysLeft < 7 ? 'rgba(248,113,113,0.12)' : 'var(--surface-dim)', color: daysLeft < 7 ? 'var(--error)' : 'var(--text-tertiary)' }}>
                            <CalendarDaysIcon className="w-3 h-3" />
                            {daysLeft < 0 ? (language === 'ru' ? 'Просрочено' : 'Overdue') : `${daysLeft} ${language === 'ru' ? 'дн.' : 'd.'}`}
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--success-subtle)', color: 'var(--success)' }}>
                            {language === 'ru' ? '✓ Достигнуто' : '✓ Achieved'}
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${priCfg.color}18`, color: priCfg.color }}>
                          {priCfg.label[language as 'ru' | 'en'] ?? priCfg.label.ru}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(goal.currentAmount, currency, true)}</span>
                      <span style={{ color: 'var(--text-tertiary)' }}>{formatCurrency(goal.targetAmount, currency, true)}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 0.6, delay: i * 0.06 }}
                        className="h-full rounded-full"
                        style={{ background: isCompleted ? 'var(--success)' : `linear-gradient(90deg, ${goal.color}, ${goal.color}99)` }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {Math.round(Math.min(progress, 100))}%
                      {!isCompleted && remaining > 0 && ` · ${language === 'ru' ? 'ещё' : 'need'} ${formatCurrency(remaining, currency, true)}`}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {/* Contribute */}
                      {!isCompleted && (
                        <motion.button whileTap={{ scale: 0.9 }}
                          onClick={() => { hapticFeedback?.('light'); setContributeId(goal.id); setContributeAmt(''); }}
                          className="flex items-center gap-1 px-3 h-8 rounded-lg text-xs font-medium"
                          style={{ background: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid rgba(74,222,128,0.25)' }}>
                          <PlusCircleIcon className="w-3.5 h-3.5" />
                          {language === 'ru' ? 'Пополнить' : 'Add'}
                        </motion.button>
                      )}
                      {/* Edit */}
                      <motion.button whileTap={{ scale: 0.9 }}
                        onClick={() => { hapticFeedback?.('light'); setEditingGoal(goal); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--primary-subtle)' }}>
                        <PencilSquareIcon className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                      </motion.button>
                      {/* Delete */}
                      <motion.button whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(goal.id, goal.name)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
                        style={{ background: 'var(--error-subtle)' }}>
                        <TrashIcon className="w-3.5 h-3.5" style={{ color: 'var(--error)' }} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Empty state */}
          {goals.length === 0 && !isLoading && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="p-10 rounded-xl text-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-4xl"
                style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(251,191,36,0.2) 100%)', boxShadow: '0 8px 30px rgba(249,115,22,0.2)' }}>
                🎯
              </div>
              <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {language === 'ru' ? 'Нет целей накоплений' : 'No Saving Goals'}
              </h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                {language === 'ru' ? 'Создайте первую цель, чтобы начать откладывать' : 'Create your first goal to start saving'}
              </p>
              <p className="text-xs mt-4" style={{ color: 'var(--text-tertiary)' }}>
                {language === 'ru' ? 'Нажмите + или используйте кнопку ниже' : 'Tap + or use the button below'}
              </p>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => { hapticFeedback?.('medium'); openBottomSheet('add-goal' as any); }}
                className="mt-4 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto"
                style={{ background: 'linear-gradient(135deg, #F97316 0%, #FBBF24 100%)', color: 'white', boxShadow: '0 4px 15px rgba(249,115,22,0.35)' }}>
                <PlusIcon className="w-5 h-5" />
                {language === 'ru' ? 'Создать цель' : 'Create Goal'}
              </motion.button>
            </motion.div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-40 rounded-xl animate-pulse" style={{ background: 'var(--surface-secondary)' }} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}