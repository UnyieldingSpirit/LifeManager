// src/app/goals/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { ArrowLeftIcon, PlusIcon, FlagIcon, TrophyIcon, SparklesIcon, CalendarDaysIcon, TrashIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';
import { formatCurrency } from '@/lib/utils';

export default function GoalsPage() {
  const router = useRouter();
  const { hapticFeedback } = useTelegram();
  
  const profile = useStore((s) => s.profile);
  const goals = useStore((s) => s.goals);
  const deleteGoal = useStore((s) => s.deleteGoal);
  const addToast = useStore((s) => s.addToast);
  
  const language = profile?.settings?.language || 'ru';
  const currency = profile?.finance?.currency || 'UZS';
  const dateLocale = language === 'ru' ? ru : enUS;
  
  const stats = useMemo(() => {
    const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
    const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
    const completed = goals.filter(g => g.currentAmount >= g.targetAmount).length;
    return { totalTarget, totalSaved, completed, active: goals.length - completed, progress: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0 };
  }, [goals]);
  
  const handleDelete = (id: string, name: string) => {
    hapticFeedback?.('warning');
    deleteGoal(id);
    addToast({ type: 'info', message: `${language === 'ru' ? 'Удалено:' : 'Deleted:'} ${name}` });
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0A0A0A' }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[70%] h-[50%]" style={{ background: 'radial-gradient(ellipse 60% 50% at 100% 0%, rgba(251, 191, 36, 0.15) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/3" style={{ background: 'radial-gradient(ellipse at bottom left, rgba(74, 222, 128, 0.1) 0%, transparent 50%)' }} />
        <div className="absolute top-24 left-8 w-1.5 h-1.5 rounded-full bg-yellow-400 opacity-40 animate-float" />
        <div className="absolute top-40 right-12 w-1 h-1 rounded-full bg-green-400 opacity-30 animate-float" style={{ animationDelay: '0.5s' }} />
      </div>
      
      <div className="page-scrollable">
        <header className="px-4 mb-4">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { hapticFeedback?.('light'); router.back(); }} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}><ArrowLeftIcon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} /></motion.button>
            <div>
              <div className="flex items-center gap-2"><FlagIcon className="w-6 h-6" style={{ color: '#F97316' }} /><h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'Цели накоплений' : 'Saving Goals'}</h1></div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{goals.length} {language === 'ru' ? 'целей' : 'goals'}</p>
            </div>
          </div>
        </header>
        
        <main className="px-4 space-y-4 pb-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: FlagIcon, value: goals.length, label: language === 'ru' ? 'Всего' : 'Total', color: '#F97316' },
              { icon: ChartBarIcon, value: stats.active, label: language === 'ru' ? 'Активных' : 'Active', color: '#FBBF24' },
              { icon: TrophyIcon, value: stats.completed, label: language === 'ru' ? 'Достигнуто' : 'Achieved', color: '#22C55E' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-3 rounded-xl text-center" style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}>
                <stat.icon className="w-5 h-5 mx-auto mb-1" style={{ color: stat.color }} />
                <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
          
          {/* Total Progress */}
          {goals.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Общий прогресс' : 'Total Progress'}</span>
                <span className="text-sm font-bold" style={{ color: '#F97316' }}>{Math.round(stats.progress)}%</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${stats.progress}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #F97316, #FBBF24)' }} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Накоплено' : 'Saved'}: <span style={{ color: 'var(--success)' }}>{formatCurrency(stats.totalSaved, currency, true)}</span></span>
                <span style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Цель' : 'Target'}: {formatCurrency(stats.totalTarget, currency, true)}</span>
              </div>
            </motion.div>
          )}
          
          {/* Goals List */}
          <div className="space-y-3">
            {goals.map((goal, index) => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              const isCompleted = progress >= 100;
              const remaining = goal.targetAmount - goal.currentAmount;
              const daysLeft = goal.deadline ? differenceInDays(parseISO(goal.deadline), new Date()) : null;
              
              return (
                <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="p-4 rounded-xl relative overflow-hidden" style={{ background: isCompleted ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, var(--glass-bg) 100%)' : 'var(--glass-bg)', border: isCompleted ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--glass-border)' }}>
                  {isCompleted && (<div className="absolute top-3 right-3"><CheckCircleSolid className="w-6 h-6" style={{ color: 'var(--success)' }} /></div>)}
                  
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${goal.color}20` }}>{goal.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{goal.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {daysLeft !== null && daysLeft >= 0 && !isCompleted && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: daysLeft < 7 ? 'var(--error-subtle)' : 'var(--surface-dim)', color: daysLeft < 7 ? 'var(--error)' : 'var(--text-tertiary)' }}>
                            <CalendarDaysIcon className="w-3 h-3" />{daysLeft} {language === 'ru' ? 'дн.' : 'days'}
                          </span>
                        )}
                        {isCompleted && (<span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--success-subtle)', color: 'var(--success)' }}>{language === 'ru' ? 'Достигнуто!' : 'Achieved!'}</span>)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(goal.currentAmount, currency, true)}</span>
                      <span style={{ color: 'var(--text-tertiary)' }}>{formatCurrency(goal.targetAmount, currency, true)}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 0.5, delay: index * 0.1 }} className="h-full rounded-full" style={{ background: isCompleted ? 'var(--success)' : goal.color }} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{Math.round(progress)}% {!isCompleted && `• ${language === 'ru' ? 'Осталось' : 'Left'}: ${formatCurrency(remaining, currency, true)}`}</span>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(goal.id, goal.name)} className="w-8 h-8 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100" style={{ background: 'var(--error-subtle)' }}><TrashIcon className="w-4 h-4" style={{ color: 'var(--error)' }} /></motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Empty State */}
          {goals.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-xl text-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(251, 191, 36, 0.2) 100%)', boxShadow: '0 8px 30px rgba(249, 115, 22, 0.3)' }}><FlagIcon className="w-10 h-10" style={{ color: '#F97316' }} /></div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'Нет целей накоплений' : 'No Saving Goals'}</h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Создайте первую цель для отслеживания накоплений' : 'Create your first goal to track savings'}</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => { hapticFeedback?.('medium'); }} className="px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mx-auto" style={{ background: 'linear-gradient(135deg, #F97316 0%, #FBBF24 100%)', color: 'white', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)' }}><PlusIcon className="w-5 h-5" />{language === 'ru' ? 'Добавить цель' : 'Add Goal'}</motion.button>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}