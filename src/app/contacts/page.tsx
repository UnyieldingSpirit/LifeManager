// src/app/contacts/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';

const GROUP_LABELS: Record<string, { ru: string; en: string; icon: string }> = {
  family:   { ru: 'Семья',    en: 'Family',   icon: '👨‍👩‍👧' },
  friends:  { ru: 'Друзья',   en: 'Friends',  icon: '👫' },
  work:     { ru: 'Работа',   en: 'Work',     icon: '💼' },
  business: { ru: 'Бизнес',   en: 'Business', icon: '🏢' },
  other:    { ru: 'Другие',   en: 'Other',    icon: '👤' },
};

type Tab = 'all' | 'favorites' | 'groups';

export default function ContactsPage() {
  const { hapticFeedback } = useTelegram();
  const profile = useStore((s) => s.profile);
  const contacts = useStore((s) => s.contacts);
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  const language = profile?.settings?.language || 'ru';
  const isRu = language === 'ru';

  const [activeTab, setActiveTab] = useState<Tab>('all');

  const grouped = useMemo(() => {
    const groups: Record<string, typeof contacts> = {};
    contacts.forEach(c => {
      const g = c.group || 'other';
      if (!groups[g]) groups[g] = [];
      groups[g].push(c);
    });
    return groups;
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    if (activeTab === 'favorites') return contacts.filter(c => c.isFavorite);
    return contacts;
  }, [contacts, activeTab]);

  if (contacts.length === 0) {
    return (
      <div className="page-scrollable" style={{ background: '#0A0A0A' }}>
        <div className="page-content px-4">
          <header className="pt-3 pb-4">
            <h1 className="text-xl font-bold" style={{ color: '#F5F5F5' }}>{isRu ? 'Контакты' : 'Contacts'}</h1>
          </header>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <span className="text-5xl mb-4 block">👥</span>
            <h2 className="text-lg font-bold mb-2" style={{ color: '#F5F5F5' }}>
              {isRu ? 'Ваши контакты' : 'Your Contacts'}
            </h2>
            <p className="text-sm mb-6 max-w-[260px] mx-auto" style={{ color: '#737373' }}>
              {isRu 
                ? 'Храните связи, отслеживайте долги, не забывайте дни рождения' 
                : 'Store connections, track debts, remember birthdays'}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { hapticFeedback?.('medium'); openBottomSheet('add-contact'); }}
              className="px-6 py-3 rounded-xl text-sm font-semibold"
              style={{ background: '#EC4899', color: 'white', boxShadow: '0 4px 15px rgba(236,72,153,0.4)' }}
            >
              {isRu ? 'Добавить контакт' : 'Add Contact'}
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
          <h1 className="text-xl font-bold" style={{ color: '#F5F5F5' }}>{isRu ? 'Контакты' : 'Contacts'}</h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { hapticFeedback?.('medium'); openBottomSheet('add-contact'); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#EC489920', border: '1px solid #EC489930' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" style={{ color: '#EC4899' }}>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </motion.button>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 py-2 mb-2">
          {([
            { id: 'all' as Tab, label: isRu ? 'Все' : 'All' },
            { id: 'favorites' as Tab, label: isRu ? '⭐ Избранные' : '⭐ Favorites' },
            { id: 'groups' as Tab, label: isRu ? 'Группы' : 'Groups' },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activeTab === tab.id ? '#EC489920' : 'rgba(255,255,255,0.05)',
                border: activeTab === tab.id ? '1px solid #EC489940' : '1px solid transparent',
                color: activeTab === tab.id ? '#EC4899' : '#737373',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contact List */}
        {activeTab === 'groups' ? (
          <div className="space-y-4 pb-8">
            {Object.entries(grouped).map(([groupId, groupContacts]) => {
              const groupInfo = GROUP_LABELS[groupId] || GROUP_LABELS.other;
              return (
                <div key={groupId}>
                  <p className="text-xs font-semibold mb-2 px-1" style={{ color: '#525252' }}>
                    {groupInfo.icon} {isRu ? groupInfo.ru : groupInfo.en} ({groupContacts.length})
                  </p>
                  <div className="space-y-1.5">
                    {groupContacts.map((contact, i) => (
                      <ContactItem key={contact.id} contact={contact} isRu={isRu} index={i} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-1.5 pb-8">
            {filteredContacts.map((contact, i) => (
              <ContactItem key={contact.id} contact={contact} isRu={isRu} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ContactItem({ contact, isRu, index }: { contact: any; isRu: boolean; index: number }) {
  const hasDebt = (contact.owesMe || 0) > 0 || (contact.iOwe || 0) > 0;
  const hasBirthday = !!contact.birthday;

  // Дни до дня рождения
  const daysUntilBirthday = useMemo(() => {
    if (!contact.birthday) return null;
    const today = new Date();
    const bd = new Date(contact.birthday);
    bd.setFullYear(today.getFullYear());
    if (bd < today) bd.setFullYear(today.getFullYear() + 1);
    return Math.ceil((bd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [contact.birthday]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
        style={{ background: '#EC489920', color: '#EC4899' }}
      >
        {contact.name?.charAt(0)?.toUpperCase() || '?'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {contact.isFavorite && <span className="text-[10px]">⭐</span>}
          <p className="text-sm font-medium truncate" style={{ color: '#F5F5F5' }}>{contact.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {contact.phone && (
            <p className="text-[10px] truncate" style={{ color: '#525252' }}>{contact.phone}</p>
          )}
          {daysUntilBirthday !== null && daysUntilBirthday <= 30 && (
            <span className="text-[9px] px-1 rounded" style={{ background: '#EC489915', color: '#EC4899' }}>
              🎂 {daysUntilBirthday === 0 ? (isRu ? 'Сегодня!' : 'Today!') : `${daysUntilBirthday} ${isRu ? 'дн.' : 'd'}`}
            </span>
          )}
        </div>
      </div>

      {/* Debt indicator */}
      {hasDebt && (
        <div className="flex-shrink-0">
          {(contact.owesMe || 0) > 0 && (
            <span className="text-[10px] font-medium" style={{ color: '#4ADE80' }}>+{contact.owesMe?.toLocaleString()}</span>
          )}
          {(contact.iOwe || 0) > 0 && (
            <span className="text-[10px] font-medium" style={{ color: '#F87171' }}>-{contact.iOwe?.toLocaleString()}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}