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
} from '@heroicons/react/24/outline';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';

export default function NotesPage() {
  const { hapticFeedback } = useTelegram();
  
  const profile = useStore((s) => s.profile);
  const notes = useStore((s) => s.notes);
  const noteFolders = useStore((s) => s.noteFolders);
  const deleteNote = useStore((s) => s.deleteNote);
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  
  const language = profile?.settings?.language || 'ru';
  const dateLocale = language === 'ru' ? ru : enUS;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  
  const filteredNotes = useMemo(() => {
    let result = notes;
    
    if (selectedFolder) {
      result = result.filter(n => n.folderId === selectedFolder);
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
  }, [notes, searchQuery, selectedFolder]);
  
  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--background)' }}>
      <header className="px-4 pt-safe">
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {language === 'ru' ? 'Заметки' : 'Notes'}
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {notes.length} {language === 'ru' ? 'заметок' : 'notes'}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              hapticFeedback?.('medium');
              openBottomSheet('add-note');
            }}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--primary)' }}
          >
            <PlusIcon className="w-5 h-5" style={{ color: '#0A0A0A' }} />
          </motion.button>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ru' ? 'Поиск заметок...' : 'Search notes...'}
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </header>
      
      <main className="px-4 space-y-4">
        {/* Folders */}
        {noteFolders.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedFolder(null)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap"
              style={{
                background: !selectedFolder ? 'var(--primary)' : 'var(--surface)',
                color: !selectedFolder ? '#0A0A0A' : 'var(--text-secondary)',
              }}
            >
              <DocumentTextIcon className="w-4 h-4" />
              <span className="text-sm">{language === 'ru' ? 'Все' : 'All'}</span>
            </motion.button>
            
            {noteFolders.map(folder => (
              <motion.button
                key={folder.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedFolder(folder.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap"
                style={{
                  background: selectedFolder === folder.id ? folder.color : 'var(--surface)',
                  color: selectedFolder === folder.id ? '#fff' : 'var(--text-secondary)',
                }}
              >
                <span>{folder.icon}</span>
                <span className="text-sm">{folder.name}</span>
              </motion.button>
            ))}
          </div>
        )}
        
        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <div>
            <h3 className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--primary)' }}>
              📌 {language === 'ru' ? 'Закреплённые' : 'Pinned'}
            </h3>
            <div className="space-y-2">
              {pinnedNotes.map((note, index) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  index={index}
                  language={language}
                  dateLocale={dateLocale}
                  onDelete={() => {
                    hapticFeedback?.('warning');
                    deleteNote(note.id);
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Other Notes */}
        {otherNotes.length > 0 && (
          <div>
            {pinnedNotes.length > 0 && (
              <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>
                {language === 'ru' ? 'Остальные' : 'Others'}
              </h3>
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
                  onDelete={() => {
                    hapticFeedback?.('warning');
                    deleteNote(note.id);
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {notes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center"
          >
            <span className="text-4xl mb-4 block">📝</span>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {language === 'ru' ? 'Нет заметок' : 'No Notes'}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {language === 'ru' ? 'Создайте первую заметку' : 'Create your first note'}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => openBottomSheet('add-note')}
              className="px-6 py-3 rounded-xl font-semibold"
              style={{ background: 'var(--primary)', color: '#0A0A0A' }}
            >
              {language === 'ru' ? 'Добавить заметку' : 'Add Note'}
            </motion.button>
          </motion.div>
        )}
      </main>
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
      transition={{ delay: index * 0.05 }}
      className={`glass-card p-3 ${compact ? '' : 'p-4'}`}
      style={{ background: note.color ? `${note.color}15` : 'var(--surface)' }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className={`font-medium line-clamp-1 ${compact ? 'text-sm' : ''}`} style={{ color: 'var(--text-primary)' }}>
          {note.title || (language === 'ru' ? 'Без названия' : 'Untitled')}
        </h4>
        {note.isPinned && <span className="text-xs">📌</span>}
      </div>
      
      <p className={`line-clamp-2 mb-2 ${compact ? 'text-xs' : 'text-sm'}`} style={{ color: 'var(--text-secondary)' }}>
        {note.content || (language === 'ru' ? 'Пустая заметка' : 'Empty note')}
      </p>
      
      <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
        {format(new Date(note.updatedAt), 'd MMM', { locale: dateLocale })}
      </p>
    </motion.div>
  );
}