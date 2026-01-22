// src/app/contacts/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  PhoneIcon,
  CakeIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useStore } from '@/store';
import { useTelegram } from '@/hooks';
import { formatCurrency } from '@/lib/utils';

const GROUP_ICONS: Record<string, string> = {
  family: '👨‍👩‍👧',
  friends: '👥',
  work: '💼',
  business: '🏢',
  other: '👤',
};

const GROUP_LABELS = {
  ru: { family: 'Семья', friends: 'Друзья', work: 'Работа', business: 'Бизнес', other: 'Другое' },
  en: { family: 'Family', friends: 'Friends', work: 'Work', business: 'Business', other: 'Other' },
};

export default function ContactsPage() {
  const { hapticFeedback } = useTelegram();
  
  const profile = useStore((s) => s.profile);
  const contacts = useStore((s) => s.contacts);
  const updateContact = useStore((s) => s.updateContact);
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  
  const language = profile?.settings?.language || 'ru';
  const currency = profile?.finance?.currency || 'UZS';
  const dateLocale = language === 'ru' ? ru : enUS;
  const groupLabels = language === 'ru' ? GROUP_LABELS.ru : GROUP_LABELS.en;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  
  // Upcoming birthdays
  const upcomingBirthdays = useMemo(() => {
    const now = new Date();
    return contacts
      .filter(c => c.birthday)
      .map(c => {
        const bday = new Date(c.birthday!);
        const thisYear = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
        if (thisYear < now) thisYear.setFullYear(thisYear.getFullYear() + 1);
        return { ...c, nextBirthday: thisYear, daysUntil: differenceInDays(thisYear, now) };
      })
      .filter(c => c.daysUntil <= 30 && c.daysUntil >= 0)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 3);
  }, [contacts]);
  
  // Filtered & grouped contacts
  const filteredContacts = useMemo(() => {
    let result = contacts;
    
    if (selectedGroup) {
      result = result.filter(c => c.group === selectedGroup);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.phone?.includes(query)
      );
    }
    
    // Sort: favorites first, then alphabetically
    return result.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [contacts, searchQuery, selectedGroup]);
  
  const toggleFavorite = (id: string, current: boolean) => {
    hapticFeedback?.('selection');
    updateContact(id, { isFavorite: !current });
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--background)' }}>
      <header className="px-4 pt-safe">
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {language === 'ru' ? 'Контакты' : 'Contacts'}
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {contacts.length} {language === 'ru' ? 'контактов' : 'contacts'}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              hapticFeedback?.('medium');
              openBottomSheet('add-contact');
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
            placeholder={language === 'ru' ? 'Поиск контактов...' : 'Search contacts...'}
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
        {/* Groups Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedGroup(null)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap"
            style={{
              background: !selectedGroup ? 'var(--primary)' : 'var(--surface)',
              color: !selectedGroup ? '#0A0A0A' : 'var(--text-secondary)',
            }}
          >
            <span className="text-sm">{language === 'ru' ? 'Все' : 'All'}</span>
          </motion.button>
          
          {Object.entries(GROUP_ICONS).map(([key, icon]) => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedGroup(key)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap"
              style={{
                background: selectedGroup === key ? 'var(--primary)' : 'var(--surface)',
                color: selectedGroup === key ? '#0A0A0A' : 'var(--text-secondary)',
              }}
            >
              <span>{icon}</span>
              <span className="text-sm">{groupLabels[key as keyof typeof groupLabels]}</span>
            </motion.button>
          ))}
        </div>
        
        {/* Upcoming Birthdays */}
        {upcomingBirthdays.length > 0 && !selectedGroup && (
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <CakeIcon className="w-4 h-4" style={{ color: '#EC4899' }} />
              {language === 'ru' ? 'Ближайшие дни рождения' : 'Upcoming Birthdays'}
            </h3>
            <div className="space-y-2">
              {upcomingBirthdays.map(contact => (
                <div 
                  key={contact.id}
                  className="flex items-center justify-between p-2 rounded-lg"
                  style={{ background: 'var(--surface-secondary)' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--primary-subtle)' }}>
                      {contact.avatar ? (
                        <img src={contact.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-sm">{contact.name.charAt(0)}</span>
                      )}
                    </div>
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{contact.name}</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#EC489920', color: '#EC4899' }}>
                    {contact.daysUntil === 0 
                      ? (language === 'ru' ? 'Сегодня!' : 'Today!') 
                      : `${contact.daysUntil} ${language === 'ru' ? 'дн.' : 'days'}`
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Contacts List */}
        <div className="space-y-2">
          {filteredContacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'var(--surface)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--primary-subtle)' }}>
                  {contact.avatar ? (
                    <img src={contact.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="font-medium" style={{ color: 'var(--primary)' }}>{contact.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{contact.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {GROUP_ICONS[contact.group]} {groupLabels[contact.group as keyof typeof groupLabels]}
                    {contact.phone && ` • ${contact.phone}`}
                  </p>
                </div>
              </div>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleFavorite(contact.id, contact.isFavorite)}
              >
                {contact.isFavorite ? (
                  <StarSolid className="w-5 h-5" style={{ color: '#FBBF24' }} />
                ) : (
                  <StarIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>
        
        {/* Empty State */}
        {contacts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center"
          >
            <span className="text-4xl mb-4 block">👥</span>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {language === 'ru' ? 'Нет контактов' : 'No Contacts'}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {language === 'ru' ? 'Добавьте первый контакт' : 'Add your first contact'}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => openBottomSheet('add-contact')}
              className="px-6 py-3 rounded-xl font-semibold"
              style={{ background: 'var(--primary)', color: '#0A0A0A' }}
            >
              {language === 'ru' ? 'Добавить контакт' : 'Add Contact'}
            </motion.button>
          </motion.div>
        )}
      </main>
    </div>
  );
}