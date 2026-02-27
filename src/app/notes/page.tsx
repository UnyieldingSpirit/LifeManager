// src/app/notes/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';

type Tab = 'all' | 'pinned' | 'folders';

export default function NotesPage() {
  const { hapticFeedback } = useTelegram();
  const profile = useStore((s) => s.profile);
  const notes = useStore((s) => s.notes);
  const deleteNote = useStore((s) => s.deleteNote);
  const toggleNotePin = useStore((s) => s.toggleNotePin);
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  const language = profile?.settings?.language || 'ru';
  const isRu = language === 'ru';

  const [activeTab, setActiveTab] = useState<Tab>('all');

  const filteredNotes = useMemo(() => {
    if (activeTab === 'pinned') return notes.filter(n => n.isPinned);
    return [...notes].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, activeTab]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return isRu ? 'Только что' : 'Just now';
    if (hours < 24) return `${hours} ${isRu ? 'ч. назад' : 'h ago'}`;
    const days = Math.floor(hours / 24);
    if (days === 1) return isRu ? 'Вчера' : 'Yesterday';
    if (days < 7) return `${days} ${isRu ? 'дн. назад' : 'd ago'}`;
    return date.toLocaleDateString(isRu ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' });
  };

  if (notes.length === 0) {
    return (
      <div className="page-scrollable" style={{ background: '#0A0A0A' }}>
        <div className="page-content px-4">
          <header className="pt-3 pb-4">
            <h1 className="text-xl font-bold" style={{ color: '#F5F5F5' }}>{isRu ? 'Заметки' : 'Notes'}</h1>
          </header>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <span className="text-5xl mb-4 block">📝</span>
            <h2 className="text-lg font-bold mb-2" style={{ color: '#F5F5F5' }}>
              {isRu ? 'Записывайте важное' : 'Write Down Ideas'}
            </h2>
            <p className="text-sm mb-6 max-w-[260px] mx-auto" style={{ color: '#737373' }}>
              {isRu ? 'Идеи, списки, заметки со встреч — всё в одном месте' : 'Ideas, lists, meeting notes — all in one place'}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { hapticFeedback?.('medium'); openBottomSheet('add-note'); }}
              className="px-6 py-3 rounded-xl text-sm font-semibold"
              style={{ background: '#FACC15', color: '#0A0A0A', boxShadow: '0 4px 15px rgba(250,204,21,0.3)' }}
            >
              {isRu ? 'Создать заметку' : 'Create Note'}
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-scrollable" style={{ background: '#0A0A0A' }}>
      <div className="page-content px-4">
        {/* Header */}
        <header className="pt-3 pb-2 flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ color: '#F5F5F5' }}>{isRu ? 'Заметки' : 'Notes'}</h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { hapticFeedback?.('medium'); openBottomSheet('add-note'); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#FACC1520', border: '1px solid #FACC1530' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" style={{ color: '#FACC15' }}>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </motion.button>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 py-2 mb-2">
          {([
            { id: 'all' as Tab, label: isRu ? 'Все' : 'All' },
            { id: 'pinned' as Tab, label: isRu ? '📌 Закреплённые' : '📌 Pinned' },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activeTab === tab.id ? '#FACC1520' : 'rgba(255,255,255,0.05)',
                border: activeTab === tab.id ? '1px solid #FACC1540' : '1px solid transparent',
                color: activeTab === tab.id ? '#FACC15' : '#737373',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notes List */}
        <div className="space-y-2 pb-8">
          {filteredNotes.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-3.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {note.isPinned && <span className="text-xs">📌</span>}
                  <p className="text-sm font-semibold" style={{ color: '#F5F5F5' }}>{note.title}</p>
                </div>
                <span className="text-[10px] flex-shrink-0" style={{ color: '#525252' }}>{formatDate(note.updatedAt)}</span>
              </div>
              {note.content && (
                <p className="text-xs line-clamp-2" style={{ color: '#737373' }}>{note.content}</p>
              )}
              {note.tags && note.tags.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {note.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(250,204,21,0.1)', color: '#FACC15' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}