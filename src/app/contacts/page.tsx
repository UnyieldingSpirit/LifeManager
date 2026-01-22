// src/app/contacts/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  PhoneIcon,
  CakeIcon,
  StarIcon,
  UserGroupIcon,
  TrashIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid, HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
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

const GROUP_COLORS: Record<string, string> = {
  family: '#EC4899',
  friends: '#3B82F6',
  work: '#F97316',
  business: '#8B5CF6',
  other: '#6B7280',
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
  const deleteContact = useStore((s) => s.deleteContact);
  const openBottomSheet = useStore((s) => s.openBottomSheet);
  const addToast = useStore((s) => s.addToast);
  
  const language = profile?.settings?.language || 'ru';
  const currency = profile?.finance?.currency || 'UZS';
  const dateLocale = language === 'ru' ? ru : enUS;
  const groupLabels = language === 'ru' ? GROUP_LABELS.ru : GROUP_LABELS.en;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'birthdays'>('all');
  
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
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [contacts]);
  
  // Filtered & grouped contacts
  const filteredContacts = useMemo(() => {
    let result = contacts;
    
    if (activeTab === 'favorites') {
      result = result.filter(c => c.isFavorite);
    } else if (activeTab === 'birthdays') {
      result = upcomingBirthdays;
    }
    
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
  }, [contacts, searchQuery, selectedGroup, activeTab, upcomingBirthdays]);
  
  const toggleFavorite = (id: string, name: string, current: boolean) => {
    hapticFeedback?.('selection');
    updateContact(id, { isFavorite: !current });
    addToast({ 
      type: 'success', 
      message: !current 
        ? (language === 'ru' ? `${name} в избранном` : `${name} added to favorites`)
        : (language === 'ru' ? `${name} удалён из избранного` : `${name} removed from favorites`)
    });
  };
  
  const handleDelete = (id: string, name: string) => {
    hapticFeedback?.('notification', 'warning')
    deleteContact(id);
    addToast({ type: 'info', message: `${language === 'ru' ? 'Удалено:' : 'Deleted:'} ${name}` });
  };
  
  const stats = useMemo(() => ({
    total: contacts.length,
    favorites: contacts.filter(c => c.isFavorite).length,
    birthdays: upcomingBirthdays.length,
  }), [contacts, upcomingBirthdays]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0A0A0A' }}>
      {/* ============================================================================
          УНИКАЛЬНЫЙ ФОН СТРАНИЦЫ КОНТАКТОВ
          Тема: Связи, люди, отношения
          Розово-фиолетовое свечение с эффектом социальной сети
          ============================================================================ */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Основной градиент */}
        <div 
          className="absolute top-0 left-0 w-[70%] h-[50%]"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 0% 0%, rgba(236, 72, 153, 0.15) 0%, transparent 60%)',
          }}
        />
        
        {/* Фиолетовое свечение справа */}
        <div 
          className="absolute bottom-0 right-0 w-1/2 h-1/2"
          style={{
            background: 'radial-gradient(ellipse at bottom right, rgba(139, 92, 246, 0.12) 0%, transparent 50%)',
          }}
        />
        
        {/* Центральное свечение */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[40%]"
          style={{
            background: 'radial-gradient(ellipse, rgba(219, 39, 119, 0.08) 0%, transparent 50%)',
          }}
        />
        
        {/* Декоративные элементы - "связи" */}
        <div className="absolute top-24 left-8 w-1.5 h-1.5 rounded-full bg-pink-400 opacity-40 animate-float" />
        <div className="absolute top-36 right-12 w-1 h-1 rounded-full bg-purple-400 opacity-30 animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-48 left-16 w-1 h-1 rounded-full bg-pink-300 opacity-25 animate-float" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Scrollable Content */}
      <div className="page-scrollable">
        {/* Header */}
        <header className="px-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <UserGroupIcon className="w-6 h-6" style={{ color: '#EC4899' }} />
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {language === 'ru' ? 'Контакты' : 'Contacts'}
                </h1>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {contacts.length} {language === 'ru' ? 'контактов' : 'contacts'}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hapticFeedback?.('medium');
                openBottomSheet('add-contact');
              }}
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
                boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)',
              }}
            >
              <PlusIcon className="w-5 h-5 text-white" />
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
              placeholder={language === 'ru' ? 'Поиск контактов...' : 'Search contacts...'}
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
              { id: 'all', label: language === 'ru' ? 'Все' : 'All', icon: UserGroupIcon, count: stats.total },
              { id: 'favorites', label: language === 'ru' ? 'Избранные' : 'Favorites', icon: HeartIcon, count: stats.favorites },
              { id: 'birthdays', label: language === 'ru' ? 'ДР' : 'Birthdays', icon: CakeIcon, count: stats.birthdays },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  hapticFeedback?.('selection');
                  setActiveTab(tab.id as any);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all relative"
                style={{
                  background: activeTab === tab.id ? 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && activeTab !== tab.id && (
                  <span 
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] flex items-center justify-center"
                    style={{ background: '#EC4899', color: 'white' }}
                  >
                    {tab.count}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: stats.total, label: language === 'ru' ? 'Всего' : 'Total', color: '#EC4899' },
              { value: stats.favorites, label: language === 'ru' ? 'Избранных' : 'Favorites', color: '#F472B6' },
              { value: stats.birthdays, label: language === 'ru' ? 'ДР скоро' : 'Birthdays', color: '#DB2777' },
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
          
          {/* Groups Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedGroup(null)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap"
              style={{
                background: !selectedGroup ? '#EC489920' : 'var(--surface)',
                border: `1px solid ${!selectedGroup ? '#EC4899' : 'var(--border)'}`,
                color: !selectedGroup ? '#EC4899' : 'var(--text-secondary)',
              }}
            >
              <UserGroupIcon className="w-4 h-4" />
              <span className="text-xs font-medium">{language === 'ru' ? 'Все группы' : 'All groups'}</span>
            </motion.button>
            
            {Object.entries(GROUP_ICONS).map(([key, icon]) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedGroup(selectedGroup === key ? null : key)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap"
                style={{
                  background: selectedGroup === key ? `${GROUP_COLORS[key]}20` : 'var(--surface)',
                  border: `1px solid ${selectedGroup === key ? GROUP_COLORS[key] : 'var(--border)'}`,
                  color: selectedGroup === key ? GROUP_COLORS[key] : 'var(--text-secondary)',
                }}
              >
                <span>{icon}</span>
                <span className="text-xs font-medium">{groupLabels[key as keyof typeof groupLabels]}</span>
              </motion.button>
            ))}
          </div>
          
          {/* Upcoming Birthdays Card */}
          {upcomingBirthdays.length > 0 && activeTab === 'all' && !selectedGroup && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl"
              style={{ 
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, var(--surface) 100%)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <CakeIcon className="w-5 h-5" style={{ color: '#EC4899' }} />
                <h3 className="text-sm font-semibold" style={{ color: '#EC4899' }}>
                  {language === 'ru' ? 'Ближайшие дни рождения' : 'Upcoming Birthdays'}
                </h3>
              </div>
              <div className="space-y-2">
                {upcomingBirthdays.slice(0, 3).map(contact => (
                  <div 
                    key={contact.id}
                    className="flex items-center justify-between p-2.5 rounded-xl"
                    style={{ background: 'var(--surface-secondary)' }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium"
                        style={{ background: `${GROUP_COLORS[contact.group] || '#EC4899'}20`, color: GROUP_COLORS[contact.group] || '#EC4899' }}
                      >
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{contact.name}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                          {format(new Date(contact.birthday!), 'd MMMM', { locale: dateLocale })}
                        </p>
                      </div>
                    </div>
                    <span 
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{ 
                        background: contact.daysUntil === 0 ? '#EC489930' : '#EC489915',
                        color: '#EC4899',
                      }}
                    >
                      {contact.daysUntil === 0 
                        ? (language === 'ru' ? 'Сегодня! 🎉' : 'Today! 🎉') 
                        : contact.daysUntil === 1
                        ? (language === 'ru' ? 'Завтра' : 'Tomorrow')
                        : `${contact.daysUntil} ${language === 'ru' ? 'дн.' : 'days'}`
                      }
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Contacts List */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + selectedGroup + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {filteredContacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-11 h-11 rounded-full flex items-center justify-center text-base font-semibold relative"
                      style={{ 
                        background: `${GROUP_COLORS[contact.group] || '#EC4899'}20`,
                        color: GROUP_COLORS[contact.group] || '#EC4899',
                      }}
                    >
                      {contact.name.charAt(0).toUpperCase()}
                      {contact.isFavorite && (
                        <div 
                          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: '#0A0A0A' }}
                        >
                          <HeartSolid className="w-3 h-3" style={{ color: '#EC4899' }} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{contact.name}</p>
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ 
                            background: `${GROUP_COLORS[contact.group] || '#6B7280'}15`,
                            color: GROUP_COLORS[contact.group] || '#6B7280',
                          }}
                        >
                          {GROUP_ICONS[contact.group]} {groupLabels[contact.group as keyof typeof groupLabels]}
                        </span>
                        {contact.phone && (
                          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                            {contact.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleFavorite(contact.id, contact.name, contact.isFavorite)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: contact.isFavorite ? '#EC489920' : 'transparent' }}
                    >
                      {contact.isFavorite ? (
                        <HeartSolid className="w-5 h-5" style={{ color: '#EC4899' }} />
                      ) : (
                        <HeartIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                      )}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(contact.id, contact.name)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
                      style={{ background: 'var(--error-subtle)' }}
                    >
                      <TrashIcon className="w-4 h-4" style={{ color: 'var(--error)' }} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          
          {/* Empty State */}
          {contacts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-xl text-center"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            >
              <div 
                className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(219, 39, 119, 0.2) 100%)',
                  boxShadow: '0 8px 30px rgba(236, 72, 153, 0.3)',
                }}
              >
                <UserGroupIcon className="w-10 h-10" style={{ color: '#EC4899' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {language === 'ru' ? 'Нет контактов' : 'No Contacts'}
              </h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                {language === 'ru' ? 'Добавьте первый контакт для управления связями' : 'Add your first contact to manage relationships'}
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => openBottomSheet('add-contact')}
                className="px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mx-auto"
                style={{ 
                  background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)',
                }}
              >
                <PlusIcon className="w-5 h-5" />
                {language === 'ru' ? 'Добавить контакт' : 'Add Contact'}
              </motion.button>
            </motion.div>
          )}
          
          {/* No Results */}
          {contacts.length > 0 && filteredContacts.length === 0 && (
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