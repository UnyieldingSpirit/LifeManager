// src/components/tasks/TaskCard.tsx
'use client';

import { motion } from 'framer-motion';
import { format, Locale } from 'date-fns';
import { ru, enUS, uz } from 'date-fns/locale';
import {
  BriefcaseIcon,
  UserIcon,
  ShoppingCartIcon,
  HeartIcon,
  BanknotesIcon,
  CakeIcon,
  PhoneIcon,
  EllipsisHorizontalIcon,
  ClockIcon,
  BellIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useTaskStore } from '@/store/taskStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useTelegram } from '@/hooks/useTelegram';
import { Task, TaskCategory, TaskPriority } from '@/types';

const categoryIcons: Record<TaskCategory, React.ElementType> = {
  work: BriefcaseIcon,
  personal: UserIcon,
  shopping: ShoppingCartIcon,
  health: HeartIcon,
  finance: BanknotesIcon,
  birthday: CakeIcon,
  call: PhoneIcon,
  other: EllipsisHorizontalIcon,
};

const categoryColors: Record<TaskCategory, string> = {
  work: '#6366F1',
  personal: '#EC4899',
  shopping: '#14B8A6',
  health: '#22C55E',
  finance: '#F59E0B',
  birthday: '#A855F7',
  call: '#3B82F6',
  other: '#6B7280',
};

const priorityColors: Record<TaskPriority, string> = {
  urgent: '#EF4444',
  high: '#F97316',
  medium: '#EAB308',
  low: '#22C55E',
};

const locales: Record<string, Locale> = {
  ru: ru,
  en: enUS,
  uz: uz,
};

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const { t, language } = useTranslation();
  const { hapticFeedback } = useTelegram();
  const toggleTask = useTaskStore((state) => state.toggleTask);
  
  const CategoryIcon = categoryIcons[task.category];
  const categoryColor = categoryColors[task.category];
  const priorityColor = priorityColors[task.priority];
  const isCompleted = task.status === 'completed';
  const dateLocale = locales[language] || ru;

  const handleToggle = () => {
    toggleTask(task.id);
    hapticFeedback?.(isCompleted ? 'selection' : 'notification');
  };

  // Форматируем дату/время
  const formattedDate = task.dueDate 
    ? format(new Date(task.dueDate), 'd MMM', { locale: dateLocale })
    : null;
  
  const formattedTime = task.dueTime || null;

  // Подсчет подзадач
  const subtaskCount = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden transition-all"
      style={{ 
        backgroundColor: 'var(--surface)',
        borderLeft: `4px solid ${priorityColor}`,
        opacity: isCompleted ? 0.7 : 1,
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleToggle}
            className="mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              borderColor: isCompleted ? 'var(--success)' : 'var(--border)',
              backgroundColor: isCompleted ? 'var(--success)' : 'transparent',
            }}
          >
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <CheckIcon className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </motion.button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 
              className={`font-medium mb-1 ${isCompleted ? 'line-through' : ''}`}
              style={{ color: isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)' }}
            >
              {task.title}
            </h3>

            {/* Description */}
            {task.description && (
              <p 
                className="text-sm mb-2 line-clamp-2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {task.description}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex items-center flex-wrap gap-2">
              {/* Category Badge */}
              <span 
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
                style={{ 
                  backgroundColor: `${categoryColor}15`,
                  color: categoryColor,
                }}
              >
                <CategoryIcon className="w-3 h-3" />
                {t(`categories.${task.category}`)}
              </span>

              {/* Date */}
              {formattedDate && (
                <span 
                  className="inline-flex items-center gap-1 text-xs"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <ClockIcon className="w-3 h-3" />
                  {formattedDate}
                  {formattedTime && ` · ${formattedTime}`}
                </span>
              )}

              {/* Reminder */}
              {task.reminder && (
                <span 
                  className="inline-flex items-center gap-1 text-xs"
                  style={{ color: 'var(--warning)' }}
                >
                  <BellIcon className="w-3 h-3" />
                </span>
              )}

              {/* Subtasks */}
              {subtaskCount > 0 && (
                <span 
                  className="text-xs"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {completedSubtasks}/{subtaskCount}
                </span>
              )}
            </div>

            {/* Subtask Progress */}
            {subtaskCount > 0 && (
              <div 
                className="h-1 rounded-full mt-2 overflow-hidden"
                style={{ backgroundColor: 'var(--surface-secondary)' }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedSubtasks / subtaskCount) * 100}%` }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: categoryColor }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}