// src/app/lists/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  TrashIcon,
  ChevronRightIcon,
  SparklesIcon,
  XMarkIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';

// Тип списка
interface ListItem {
  id: string;
  text: string;
  completed: boolean;
  quantity?: number;
  unit?: string;
}

interface ShoppingList {
  id: string;
  name: string;
  items: ListItem[];
  color: string;
  icon: 'shopping' | 'checklist' | 'custom';
  createdAt: string;
  completedAt?: string;
}

// Цвета списков
const LIST_COLORS = [
  '#4ADE80', '#60A5FA', '#F97316', '#FBBF24',
  '#A855F7', '#EC4899', '#14B8A6', '#EF4444',
];

export default function ListsPage() {
  const { hapticFeedback } = useTelegram();
  const profile = useStore((s) => s.profile);
  const addToast = useStore((s) => s.addToast);
  
  const language = profile?.settings?.language || 'ru';
  
  // Demo data
  const [lists, setLists] = useState<ShoppingList[]>([
    {
      id: '1',
      name: language === 'ru' ? 'Продукты' : 'Groceries',
      items: [
        { id: '1-1', text: language === 'ru' ? 'Молоко' : 'Milk', completed: false, quantity: 2, unit: language === 'ru' ? 'л' : 'L' },
        { id: '1-2', text: language === 'ru' ? 'Хлеб' : 'Bread', completed: true },
        { id: '1-3', text: language === 'ru' ? 'Яйца' : 'Eggs', completed: false, quantity: 10, unit: language === 'ru' ? 'шт' : 'pcs' },
        { id: '1-4', text: language === 'ru' ? 'Сыр' : 'Cheese', completed: false },
      ],
      color: '#4ADE80',
      icon: 'shopping',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: language === 'ru' ? 'Для дома' : 'Home supplies',
      items: [
        { id: '2-1', text: language === 'ru' ? 'Моющее средство' : 'Dish soap', completed: true },
        { id: '2-2', text: language === 'ru' ? 'Губки' : 'Sponges', completed: true },
        { id: '2-3', text: language === 'ru' ? 'Мусорные пакеты' : 'Trash bags', completed: false },
      ],
      color: '#60A5FA',
      icon: 'shopping',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '3',
      name: language === 'ru' ? 'Перед поездкой' : 'Before trip',
      items: [
        { id: '3-1', text: language === 'ru' ? 'Зарядить повербанк' : 'Charge powerbank', completed: true },
        { id: '3-2', text: language === 'ru' ? 'Взять документы' : 'Take documents', completed: false },
        { id: '3-3', text: language === 'ru' ? 'Проверить билеты' : 'Check tickets', completed: false },
        { id: '3-4', text: language === 'ru' ? 'Упаковать вещи' : 'Pack clothes', completed: false },
      ],
      color: '#A855F7',
      icon: 'checklist',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);
  
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState(LIST_COLORS[0]);
  const [newItemText, setNewItemText] = useState('');
  
  const activeLists = lists.filter(l => !l.completedAt);
  const completedLists = lists.filter(l => l.completedAt);
  
  const stats = useMemo(() => {
    const totalItems = lists.reduce((acc, list) => acc + list.items.length, 0);
    const completedItems = lists.reduce((acc, list) => acc + list.items.filter(i => i.completed).length, 0);
    return { totalLists: lists.length, activeLists: activeLists.length, totalItems, completedItems };
  }, [lists, activeLists]);
  
  const toggleItem = (listId: string, itemId: string) => {
    hapticFeedback?.('selection');
    setLists(prev => prev.map(list => {
      if (list.id === listId) {
        return { ...list, items: list.items.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item) };
      }
      return list;
    }));
    if (selectedList?.id === listId) {
      setSelectedList(prev => prev ? { ...prev, items: prev.items.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item) } : null);
    }
  };
  
  const addItemToList = () => {
    if (!selectedList || !newItemText.trim()) return;
    hapticFeedback?.('medium');
    const newItem: ListItem = { id: `${selectedList.id}-${Date.now()}`, text: newItemText.trim(), completed: false };
    setLists(prev => prev.map(list => list.id === selectedList.id ? { ...list, items: [...list.items, newItem] } : list));
    setSelectedList(prev => prev ? { ...prev, items: [...prev.items, newItem] } : null);
    setNewItemText('');
    addToast({ type: 'success', message: language === 'ru' ? 'Добавлено' : 'Added' });
  };
  
  const deleteItem = (listId: string, itemId: string) => {
    hapticFeedback?.('notification', 'warning')
    setLists(prev => prev.map(list => list.id === listId ? { ...list, items: list.items.filter(i => i.id !== itemId) } : list));
    if (selectedList?.id === listId) {
      setSelectedList(prev => prev ? { ...prev, items: prev.items.filter(i => i.id !== itemId) } : null);
    }
  };
  
  const createList = () => {
    if (!newListName.trim()) return;
    hapticFeedback?.('medium');
    const newList: ShoppingList = { id: Date.now().toString(), name: newListName.trim(), items: [], color: newListColor, icon: 'shopping', createdAt: new Date().toISOString() };
    setLists(prev => [newList, ...prev]);
    setShowNewListModal(false);
    setNewListName('');
    setSelectedList(newList);
    addToast({ type: 'success', message: language === 'ru' ? 'Список создан' : 'List created' });
  };
  
  const deleteList = (listId: string) => {
    hapticFeedback?.('notification', 'warning')
    setLists(prev => prev.filter(l => l.id !== listId));
    if (selectedList?.id === listId) setSelectedList(null);
    addToast({ type: 'info', message: language === 'ru' ? 'Список удалён' : 'List deleted' });
  };
  
  const archiveList = (listId: string) => {
    hapticFeedback?.('medium');
    setLists(prev => prev.map(list => list.id === listId ? { ...list, completedAt: new Date().toISOString() } : list));
    setSelectedList(null);
    addToast({ type: 'success', message: language === 'ru' ? 'Список завершён' : 'List completed' });
  };

  return (
    <div >
      {/* Уникальный фон - зелёно-бирюзовый */}
      <div className="">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-[50%]" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(74, 222, 128, 0.12) 0%, transparent 60%)' }} />
        <div className="absolute top-1/4 left-0 w-1/3 h-1/2" style={{ background: 'radial-gradient(ellipse at left, rgba(20, 184, 166, 0.1) 0%, transparent 50%)' }} />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/3" style={{ background: 'radial-gradient(ellipse at bottom right, rgba(96, 165, 250, 0.08) 0%, transparent 50%)' }} />
        <div className="absolute top-24 right-8 w-1.5 h-1.5 rounded-full bg-green-400 opacity-30 animate-float" />
        <div className="absolute top-40 left-6 w-1 h-1 rounded-full bg-teal-300 opacity-25 animate-float" style={{ animationDelay: '0.5s' }} />
      </div>
      
      <div className="page-scrollable">
        {/* Header */}
        <header className="px-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardDocumentListIcon className="w-6 h-6" style={{ color: '#4ADE80' }} />
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {language === 'ru' ? 'Списки' : 'Lists'}
                </h1>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {stats.activeLists} {language === 'ru' ? 'активных' : 'active'}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { hapticFeedback?.('medium'); setShowNewListModal(true); }}
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)', boxShadow: '0 4px 15px rgba(74, 222, 128, 0.4)' }}
            >
              <PlusIcon className="w-5 h-5" style={{ color: '#0A0A0A' }} />
            </motion.button>
          </div>
        </header>
        
        <main className="px-4 space-y-4 pb-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: language === 'ru' ? 'Списков' : 'Lists', value: stats.totalLists, color: '#4ADE80' },
              { label: language === 'ru' ? 'Элементов' : 'Items', value: stats.totalItems, color: '#14B8A6' },
              { label: language === 'ru' ? 'Выполнено' : 'Done', value: stats.completedItems, color: '#60A5FA' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-3 rounded-xl text-center" style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}>
                <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--surface-dim)' }}>
            {[
              { id: 'active', label: language === 'ru' ? 'Активные' : 'Active', count: activeLists.length },
              { id: 'completed', label: language === 'ru' ? 'Завершённые' : 'Completed', count: completedLists.length },
            ].map((tab) => (
              <motion.button key={tab.id} whileTap={{ scale: 0.95 }}
                onClick={() => { hapticFeedback?.('selection'); setActiveTab(tab.id as any); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ background: activeTab === tab.id ? 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)' : 'transparent', color: activeTab === tab.id ? '#0A0A0A' : 'var(--text-secondary)' }}>
                {tab.label}
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: activeTab === tab.id ? 'rgba(0,0,0,0.2)' : 'var(--surface)', color: activeTab === tab.id ? '#0A0A0A' : 'var(--text-tertiary)' }}>
                  {tab.count}
                </span>
              </motion.button>
            ))}
          </div>
          
          {/* Lists */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {(activeTab === 'active' ? activeLists : completedLists).map((list, index) => {
                const completedCount = list.items.filter(i => i.completed).length;
                const totalCount = list.items.length;
                const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
                
                return (
                  <motion.div key={list.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ delay: index * 0.05 }}
                    onClick={() => { hapticFeedback?.('selection'); setSelectedList(list); }}
                    className="p-4 rounded-xl cursor-pointer active:scale-[0.98] transition-transform"
                    style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${list.color}20` }}>
                        {list.icon === 'shopping' ? <ShoppingCartIcon className="w-5 h-5" style={{ color: list.color }} /> : <ClipboardDocumentListIcon className="w-5 h-5" style={{ color: list.color }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{list.name}</h3>
                          <ChevronRightIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-dim)' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full rounded-full" style={{ background: list.color }} />
                          </div>
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{completedCount}/{totalCount}</span>
                        </div>
                      </div>
                    </div>
                    {totalCount > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {list.items.slice(0, 4).map(item => (
                          <span key={item.id} className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: item.completed ? 'var(--success-subtle)' : 'var(--surface)', color: item.completed ? 'var(--success)' : 'var(--text-secondary)', textDecoration: item.completed ? 'line-through' : 'none' }}>
                            {item.text}
                          </span>
                        ))}
                        {totalCount > 4 && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface)', color: 'var(--text-tertiary)' }}>+{totalCount - 4}</span>}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          
          {/* Empty State */}
          {lists.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-xl text-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)', boxShadow: '0 8px 30px rgba(74, 222, 128, 0.3)' }}>
                <ClipboardDocumentListIcon className="w-10 h-10" style={{ color: '#4ADE80' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'Нет списков' : 'No Lists'}</h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Создайте список покупок или чек-лист' : 'Create a shopping list or checklist'}</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowNewListModal(true)} className="px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mx-auto" style={{ background: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)', color: '#0A0A0A', boxShadow: '0 4px 15px rgba(74, 222, 128, 0.4)' }}>
                <PlusIcon className="w-5 h-5" />
                {language === 'ru' ? 'Создать список' : 'Create List'}
              </motion.button>
            </motion.div>
          )}
          
          {activeTab === 'active' && activeLists.length === 0 && lists.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-xl text-center" style={{ background: 'var(--surface)' }}>
              <CheckCircleSolid className="w-10 h-10 mx-auto mb-3" style={{ color: '#4ADE80' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Все списки завершены!' : 'All lists completed!'}</p>
            </motion.div>
          )}
        </main>
      </div>
      
      {/* List Detail Modal */}
      <AnimatePresence>
        {selectedList && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedList(null)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="w-full max-h-[85vh] rounded-t-3xl overflow-hidden" style={{ background: 'var(--surface)' }}>
              <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} /></div>
              <div className="px-4 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${selectedList.color}20` }}>
                    <ShoppingCartIcon className="w-5 h-5" style={{ color: selectedList.color }} />
                  </div>
                  <div>
                    <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedList.name}</h2>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{selectedList.items.filter(i => i.completed).length}/{selectedList.items.length} {language === 'ru' ? 'выполнено' : 'completed'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => archiveList(selectedList.id)} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--success-subtle)' }}>
                    <ArchiveBoxIcon className="w-4 h-4" style={{ color: 'var(--success)' }} />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => deleteList(selectedList.id)} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--error-subtle)' }}>
                    <TrashIcon className="w-4 h-4" style={{ color: 'var(--error)' }} />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelectedList(null)} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-dim)' }}>
                    <XMarkIcon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  </motion.button>
                </div>
              </div>
              <div className="px-4 pb-4">
                <div className="flex gap-2">
                  <input type="text" value={newItemText} onChange={(e) => setNewItemText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addItemToList()}
                    placeholder={language === 'ru' ? 'Добавить элемент...' : 'Add item...'} className="flex-1 px-4 py-3 rounded-xl text-sm"
                    style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }} />
                  <motion.button whileTap={{ scale: 0.95 }} onClick={addItemToList} disabled={!newItemText.trim()} className="px-4 py-3 rounded-xl font-medium disabled:opacity-50" style={{ background: selectedList.color, color: '#0A0A0A' }}>
                    <PlusIcon className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
              <div className="px-4 pb-8 max-h-[50vh] overflow-y-auto space-y-2">
                <AnimatePresence mode="popLayout">
                  {selectedList.items.map((item, index) => (
                    <motion.div key={item.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: index * 0.02 }}
                      className="flex items-center gap-3 p-3 rounded-xl" style={{ background: item.completed ? 'var(--success-subtle)' : 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => toggleItem(selectedList.id, item.id)} className="flex-shrink-0">
                        {item.completed ? <CheckCircleSolid className="w-6 h-6" style={{ color: '#4ADE80' }} /> : <div className="w-6 h-6 rounded-full border-2" style={{ borderColor: 'var(--border)' }} />}
                      </motion.button>
                      <div className="flex-1">
                        <span className="text-sm" style={{ color: item.completed ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: item.completed ? 'line-through' : 'none' }}>{item.text}</span>
                        {item.quantity && <span className="text-xs ml-2" style={{ color: 'var(--text-tertiary)' }}>{item.quantity} {item.unit}</span>}
                      </div>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => deleteItem(selectedList.id, item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100" style={{ background: 'var(--error-subtle)' }}>
                        <TrashIcon className="w-3.5 h-3.5" style={{ color: 'var(--error)' }} />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {selectedList.items.length === 0 && (
                  <div className="p-8 text-center">
                    <SparklesIcon className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{language === 'ru' ? 'Список пуст' : 'List is empty'}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* New List Modal */}
      <AnimatePresence>
        {showNewListModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={() => setShowNewListModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm p-5 rounded-2xl" style={{ background: 'var(--surface)' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{language === 'ru' ? 'Новый список' : 'New List'}</h2>
              <input type="text" value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder={language === 'ru' ? 'Название списка' : 'List name'}
                className="w-full px-4 py-3 rounded-xl text-sm mb-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }} autoFocus />
              <div className="mb-5">
                <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>{language === 'ru' ? 'Цвет' : 'Color'}</p>
                <div className="flex flex-wrap gap-2">
                  {LIST_COLORS.map(color => (
                    <motion.button key={color} whileTap={{ scale: 0.9 }} onClick={() => setNewListColor(color)} className="w-8 h-8 rounded-lg"
                      style={{ background: color, boxShadow: newListColor === color ? `0 0 0 2px #0A0A0A, 0 0 0 4px ${color}` : 'none' }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowNewListModal(false)} className="flex-1 py-3 rounded-xl font-medium" style={{ background: 'var(--surface-dim)', color: 'var(--text-secondary)' }}>
                  {language === 'ru' ? 'Отмена' : 'Cancel'}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={createList} disabled={!newListName.trim()} className="flex-1 py-3 rounded-xl font-medium disabled:opacity-50" style={{ background: newListColor, color: '#0A0A0A' }}>
                  {language === 'ru' ? 'Создать' : 'Create'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}