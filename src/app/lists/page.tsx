'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BriefcaseIcon,
  UserIcon,
  ShoppingCartIcon,
  HeartIcon,
  BanknotesIcon,
  CakeIcon,
  PhoneIcon,
  EllipsisHorizontalIcon,
  RectangleStackIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useTaskStore } from '@/store/taskStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useTelegram } from '@/hooks/useTelegram';
import { TaskCategory } from '@/types';

interface CategoryConfig {
  id: TaskCategory;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const categoryConfigs: CategoryConfig[] = [
  { id: 'work', icon: BriefcaseIcon, color: '#6366F1', bgColor: 'rgba(99, 102, 241, 0.1)' },
  { id: 'personal', icon: UserIcon, color: '#EC4899', bgColor: 'rgba(236, 72, 153, 0.1)' },
  { id: 'shopping', icon: ShoppingCartIcon, color: '#14B8A6', bgColor: 'rgba(20, 184, 166, 0.1)' },
  { id: 'health', icon: HeartIcon, color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.1)' },
  { id: 'finance', icon: BanknotesIcon, color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' },
  { id: 'birthday', icon: CakeIcon, color: '#A855F7', bgColor: 'rgba(168, 85, 247, 0.1)' },
  { id: 'call', icon: PhoneIcon, color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  { id: 'other', icon: EllipsisHorizontalIcon, color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
];

export default function ListsPage() {
  const [mounted, setMounted] = useState(false);
  
  const { t } = useTranslation();
  const { hapticFeedback } = useTelegram();
  const tasks = useTaskStore((state) => state.tasks);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Статистика по категориям
  const categoryStats = useMemo(() => {
    const stats: Record<TaskCategory, { total: number; pending: number; completed: number }> = {
      work: { total: 0, pending: 0, completed: 0 },
      personal: { total: 0, pending: 0, completed: 0 },
      shopping: { total: 0, pending: 0, completed: 0 },
      health: { total: 0, pending: 0, completed: 0 },
      finance: { total: 0, pending: 0, completed: 0 },
      birthday: { total: 0, pending: 0, completed: 0 },
      call: { total: 0, pending: 0, completed: 0 },
      other: { total: 0, pending: 0, completed: 0 },
    };

    tasks.forEach((task) => {
      const cat = task.category;
      stats[cat].total++;
      if (task.status === 'completed') {
        stats[cat].completed++;
      } else {
        stats[cat].pending++;
      }
    });

    return stats;
  }, [tasks]);

  // Общая статистика
  const totalStats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status !== 'completed').length,
      completed: tasks.filter(t => t.status === 'completed').length,
    };
  }, [tasks]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {t('nav.lists')}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {t('lists.subtitle')}
        </p>
      </div>

      {/* All Tasks Card */}
      <div className="px-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => hapticFeedback?.('selection')}
          className="rounded-2xl p-5 cursor-pointer"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <RectangleStackIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {t('lists.allTasks')}
                </h2>
                <p className="text-sm text-white/70">
                  {totalStats.pending} {t('lists.active')} · {totalStats.completed} {t('lists.done')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{totalStats.total}</p>
              <p className="text-xs text-white/70">{t('lists.total')}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Categories Grid */}
      <div className="px-4">
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          {t('lists.byCategory')}
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {categoryConfigs.map((config, index) => {
            const Icon = config.icon;
            const stats = categoryStats[config.id];
            
            return (
              <motion.div
                key={config.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => hapticFeedback?.('selection')}
                className="rounded-2xl p-4 cursor-pointer transition-all"
                style={{ backgroundColor: 'var(--surface)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: config.bgColor }}
                  >
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                  </div>
                  {stats.pending > 0 && (
                    <span 
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: config.bgColor,
                        color: config.color,
                      }}
                    >
                      {stats.pending}
                    </span>
                  )}
                </div>
                
                <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {t(`categories.${config.id}`)}
                </h4>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {stats.total} {t('lists.tasks')}
                </p>
                
                {/* Progress Bar */}
                {stats.total > 0 && (
                  <div 
                    className="h-1.5 rounded-full mt-3 overflow-hidden"
                    style={{ backgroundColor: config.bgColor }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.completed / stats.total) * 100}%` }}
                      transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
            {t('lists.quickStats')}
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                {totalStats.total}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {t('lists.total')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--warning)' }}>
                {totalStats.pending}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {t('lists.pending')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>
                {totalStats.completed}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {t('lists.completed')}
              </p>
            </div>
          </div>
          
          {/* Overall Progress */}
          {totalStats.total > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'var(--text-secondary)' }}>{t('lists.progress')}</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {Math.round((totalStats.completed / totalStats.total) * 100)}%
                </span>
              </div>
              <div 
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--surface-secondary)' }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalStats.completed / totalStats.total) * 100}%` }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: 'var(--primary)' }}
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}