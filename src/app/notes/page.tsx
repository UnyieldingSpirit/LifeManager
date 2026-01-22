// src/app/notes/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  BookmarkIcon,
  TrashIcon,
  FolderIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';

export default function NotesPage() {
  const { hapticFeedback } = useTelegram();
  
  const profile = useStore((s) => s.profile);
  const notes = useStore((s) => s.notes);
  const noteFolders = useStore((s) => s.noteFolders);
  const deleteNote = useStore((s) => s.deleteNote);
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  const addToast = useStore((s) => s.addToast);
  
  const language = profile?.settings?.language || 'ru';
  const dateLocale = language === 'ru' ? ru : enUS;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pinned' | 'recent'>('all');
  
  const filteredNotes = useMemo(() => {
    let result = notes;
    
    if (selectedFolder) {
      result = result.filter(n => n.folderId === selectedFolder);
    }
    
    if (activeTab === 'pinned') {
      result = result.filter(n => n.isPinned);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(query) || 
        n.content.toLowerCase().includes(query)
      );
    }
    
    // Sort: pinned first, then by date
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, searchQuery, selectedFolder, activeTab]);
  
  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);
  
  const handleDelete = (id: string, title: string) => {
    hapticFeedback?.('warning');
    deleteNote(id);
    addToast({ type: 'info', message: `${language === 'ru' ? 'Удалено:' : 'Deleted:'} ${title || 'Заметка'}` });
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0A0A0A' }}>
      {/* ============================================================================
          УНИКАЛЬНЫЙ ФОН СТРАНИЦЫ ЗАМЕТОК
          Тема: Творчество, идеи, записи
          Жёлто-янтарное свечение с эффектом бумаги
          ============================================================================ */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Основной градиент */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-[50%]"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(251, 191, 36, 0.12) 0%, transparent 60%)',
          }}
        />
        
        {/* Боковое свечение */}
        <div 
          className="absolute top-1/3 right-0 w-1/3 h-1/2"
          style={{
            background: 'radial-gradient(ellipse at right, rgba(245, 158, 11, 0.1) 0%, transparent 50%)',
          }}
        />
        
        {/* Декоративные элементы - "листочки бумаги" */}
        <div className="absolute top-20 right-6 w-1.5 h-1.5 rounded-sm bg-yellow-400 opacity-30 rotate-12 animate-float" />
        <div className="absolute top-32 left-10 w-1 h-1 rounded-sm bg-amber-300 opacity-25 -rotate-6 animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-44 right-14 w-1 h-1 rounded-sm bg-yellow-300 opacity-20 rotate-45 animate-float" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Scrollable Content */}
      <div className="page-scrollable">
        {/* Header */}
        <header className="px-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-6 h-6" style={{ color: '#FBBF24' }} />
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {language === 'ru' ? 'Заметки' : 'Notes'}
                </h1>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {notes.length} {language === 'ru' ? 'заметок' : 'notes'}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hapticFeedback?.('medium');
                openBottomSheet('add-note');
              }}
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)',
              }}
            >
              <PlusIcon className="w-5 h-5" style={{ color: '#0A0A0A' }} />
            </motion.button>
          </div>
        </header>
        
        <main className="px-4 space-y-4 pb-8">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ru' ? 'Поиск заметок...' : 'Search notes...'}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--surface-dim)' }}>
            {[
              { id: 'all', label: language === 'ru' ? 'Все' : 'All', icon: DocumentTextIcon },
              { id: 'pinned', label: language === 'ru' ? 'Закреплённые' : 'Pinned', icon: BookmarkIcon },
              { id: 'recent', label: language === 'ru' ? 'Недавние' : 'Recent', icon: SparklesIcon },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  hapticFeedback?.('selection');
                  setActiveTab(tab.id as any);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: activeTab === tab.id ? 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)' : 'transparent',
                  color: activeTab === tab.id ? '#0A0A0A' : 'var(--text-secondary)',
                }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            ))}
          </div>
          
          {/* Folders */}
          {noteFolders.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedFolder(null)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap"
                style={{
                  background: !selectedFolder ? '#FBBF2420' : 'var(--surface)',
                  border: `1px solid ${!selectedFolder ? '#FBBF24' : 'var(--border)'}`,
                  color: !selectedFolder ? '#FBBF24' : 'var(--text-secondary)',
                }}
              >
                <FolderIcon className="w-4 h-4" />
                <span className="text-xs font-medium">{language === 'ru' ? 'Все папки' : 'All folders'}</span>
              </motion.button>
              
              {noteFolders.map(folder => (
                <motion.button
                  key={folder.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedFolder(folder.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap"
                  style={{
                    background: selectedFolder === folder.id ? `${folder.color}20` : 'var(--surface)',
                    border: `1px solid ${selectedFolder === folder.id ? folder.color : 'var(--border)'}`,
                    color: selectedFolder === folder.id ? folder.color : 'var(--text-secondary)',
                  }}
                >
                  <span>{folder.icon}</span>
                  <span className="text-xs font-medium">{folder.name}</span>
                </motion.button>
              ))}
            </div>
          )}
          
          {/* Stats */}
          {notes.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: notes.length, label: language === 'ru' ? 'Всего' : 'Total', color: '#FBBF24' },
                { value: pinnedNotes.length, label: language === 'ru' ? 'Закреплено' : 'Pinned', color: '#F59E0B' },
                { value: noteFolders.length, label: language === 'ru' ? 'Папок' : 'Folders', color: '#D97706' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-xl text-center"
                  style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
                >
                  <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && activeTab !== 'pinned' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookmarkSolid className="w-4 h-4" style={{ color: '#FBBF24' }} />
                <h3 className="text-sm font-semibold" style={{ color: '#FBBF24' }}>
                  {language === 'ru' ? 'Закреплённые' : 'Pinned'}
                </h3>
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#FBBF2420', color: '#FBBF24' }}>
                  {pinnedNotes.length}
                </span>
              </div>
              <div className="space-y-2">
                {pinnedNotes.map((note, index) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    index={index}
                    language={language}
                    dateLocale={dateLocale}
                    onDelete={() => handleDelete(note.id, note.title)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Other Notes */}
          {otherNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && activeTab !== 'pinned' && (
                <div className="flex items-center gap-2 mb-3">
                  <DocumentTextIcon className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  <h3 className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
                    {language === 'ru' ? 'Остальные' : 'Others'}
                  </h3>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {otherNotes.map((note, index) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    index={index}
                    language={language}
                    dateLocale={dateLocale}
                    compact
                    onDelete={() => handleDelete(note.id, note.title)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Only Pinned Tab */}
          {activeTab === 'pinned' && filteredNotes.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {filteredNotes.map((note, index) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  index={index}
                  language={language}
                  dateLocale={dateLocale}
                  compact
                  onDelete={() => handleDelete(note.id, note.title)}
                />
              ))}
            </div>
          )}
          
          {/* Empty State */}
          {notes.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-xl text-center"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            >
              <div 
                className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
                  boxShadow: '0 8px 30px rgba(251, 191, 36, 0.3)',
                }}
              >
                <DocumentTextIcon className="w-10 h-10" style={{ color: '#FBBF24' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {language === 'ru' ? 'Нет заметок' : 'No Notes'}
              </h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                {language === 'ru' ? 'Создайте первую заметку для записи идей' : 'Create your first note to capture ideas'}
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => openBottomSheet('add-note')}
                className="px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mx-auto"
                style={{ 
                  background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                  color: '#0A0A0A',
                  boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)',
                }}
              >
                <PlusIcon className="w-5 h-5" />
                {language === 'ru' ? 'Добавить заметку' : 'Add Note'}
              </motion.button>
            </motion.div>
          )}
          
          {/* No Results */}
          {notes.length > 0 && filteredNotes.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 rounded-xl text-center"
              style={{ background: 'var(--surface)' }}
            >
              <MagnifyingGlassIcon className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {language === 'ru' ? 'Ничего не найдено' : 'Nothing found'}
              </p>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

function NoteCard({ 
  note, 
  index, 
  language, 
  dateLocale, 
  compact = false,
  onDelete 
}: { 
  note: any;
  index: number;
  language: string;
  dateLocale: typeof ru;
  compact?: boolean;
  onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`rounded-xl overflow-hidden ${compact ? 'p-3' : 'p-4'}`}
      style={{ 
        background: note.color ? `${note.color}15` : 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className={`font-medium line-clamp-1 flex-1 ${compact ? 'text-sm' : ''}`} style={{ color: 'var(--text-primary)' }}>
          {note.title || (language === 'ru' ? 'Без названия' : 'Untitled')}
        </h4>
        {note.isPinned && <BookmarkSolid className="w-4 h-4 flex-shrink-0 ml-1" style={{ color: '#FBBF24' }} />}
      </div>
      
      <p className={`line-clamp-2 mb-3 ${compact ? 'text-xs' : 'text-sm'}`} style={{ color: 'var(--text-secondary)' }}>
        {note.content || (language === 'ru' ? 'Пустая заметка' : 'Empty note')}
      </p>
      
      <div className="flex items-center justify-between">
        <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
          {format(new Date(note.updatedAt), 'd MMM', { locale: dateLocale })}
        </p>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-6 h-6 rounded-md flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
          style={{ background: 'var(--error-subtle)' }}
        >
          <TrashIcon className="w-3.5 h-3.5" style={{ color: 'var(--error)' }} />
        </motion.button>
      </div>
    </motion.div>
  );
}