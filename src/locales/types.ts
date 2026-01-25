// src/locales/types.ts
// Типы для системы интернационализации LifeLedger

export type Locale = 'ru' | 'uz' | 'kz' | 'kg' | 'tj' | 'tr' | 'en';

export interface LocaleInfo {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  dateFormat: string;
  numberFormat: {
    decimal: string;
    thousand: string;
  };
}

export interface TranslationSchema {
  // Navigation
  nav: {
    today: string;
    calendar: string;
    lists: string;
    profile: string;
    home: string;
    finance: string;
    tasks: string;
    habits: string;
    notes: string;
    contacts: string;
    settings: string;
    more: string;
  };

  // Greetings
  greeting: {
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
  };

  // Common
  common: {
    add: string;
    edit: string;
    delete: string;
    cancel: string;
    save: string;
    done: string;
    search: string;
    loading: string;
    noResults: string;
    all: string;
    back: string;
    next: string;
    previous: string;
    confirm: string;
    close: string;
    yes: string;
    no: string;
    ok: string;
    create: string;
    update: string;
    filter: string;
    sort: string;
    export: string;
    import: string;
    share: string;
    copy: string;
    paste: string;
    undo: string;
    redo: string;
  };

  // Tasks module
  tasks: {
    title: string;
    tasks: string;
    newTask: string;
    addTask: string;
    editTask: string;
    taskTitle: string;
    description: string;
    noTasks: string;
    noTasksToday: string;
    addFirstTask: string;
    completed: string;
    pending: string;
    overdue: string;
    today: string;
    unscheduled: string;
    completedToday: string;
    dueDate: string;
    dueTime: string;
    reminder: string;
    repeat: string;
    subtasks: string;
    addSubtask: string;
    project: string;
    projects: string;
    checklist: string;
  };

  // Finance module
  finance: {
    title: string;
    balance: string;
    income: string;
    expense: string;
    transaction: string;
    transactions: string;
    addTransaction: string;
    category: string;
    amount: string;
    date: string;
    note: string;
    budget: string;
    budgets: string;
    goal: string;
    goals: string;
    debt: string;
    debts: string;
    analytics: string;
    history: string;
    transfer: string;
    account: string;
    accounts: string;
    savings: string;
    spent: string;
    remaining: string;
    total: string;
    monthly: string;
    weekly: string;
    daily: string;
    yearly: string;
  };

  // Calendar
  calendar: {
    title: string;
    today: string;
    monthNames: string[];
    monthNamesShort: string[];
    dayNames: string[];
    dayNamesShort: string[];
    week: string;
    month: string;
    year: string;
    event: string;
    events: string;
    addEvent: string;
    noEvents: string;
    allDay: string;
    birthday: string;
    birthdays: string;
    reminder: string;
    reminders: string;
  };

  // Habits
  habits: {
    title: string;
    habit: string;
    addHabit: string;
    streak: string;
    currentStreak: string;
    longestStreak: string;
    completedToday: string;
    progress: string;
    frequency: string;
    daily: string;
    weekly: string;
    target: string;
    achieved: string;
    statistics: string;
  };

  // Notes
  notes: {
    title: string;
    note: string;
    addNote: string;
    editNote: string;
    folder: string;
    folders: string;
    pinned: string;
    recent: string;
    noNotes: string;
    searchNotes: string;
  };

  // Contacts
  contacts: {
    title: string;
    contact: string;
    addContact: string;
    editContact: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    birthday: string;
    company: string;
    position: string;
    group: string;
    groups: string;
    favorite: string;
    favorites: string;
    noContacts: string;
  };

  // Stats
  stats: {
    pending: string;
    completed: string;
    streak: string;
    totalTasks: string;
    completedTasks: string;
    currentStreak: string;
    longestStreak: string;
    today: string;
    thisWeek: string;
    thisMonth: string;
    days: string;
    completionRate: string;
  };

  // Form
  form: {
    taskTitle: string;
    taskDescription: string;
    category: string;
    priority: string;
    date: string;
    time: string;
    repeat: string;
    reminder: string;
    advancedOptions: string;
    createTask: string;
    required: string;
    optional: string;
    invalid: string;
  };

  // Priority
  priority: {
    title: string;
    urgent: string;
    high: string;
    medium: string;
    low: string;
    none: string;
  };

  // Categories
  categories: {
    title: string;
    work: string;
    personal: string;
    shopping: string;
    health: string;
    finance: string;
    birthday: string;
    call: string;
    other: string;
    food: string;
    transport: string;
    entertainment: string;
    education: string;
    travel: string;
    home: string;
    family: string;
    sport: string;
  };

  // Repeat options
  repeat: {
    none: string;
    daily: string;
    weekly: string;
    monthly: string;
    yearly: string;
    custom: string;
    weekdays: string;
    weekends: string;
  };

  // Lists
  lists: {
    title: string;
    subtitle: string;
    allTasks: string;
    createList: string;
    listName: string;
    byCategory: string;
    quickStats: string;
    active: string;
    done: string;
    total: string;
    tasks: string;
    pending: string;
    completed: string;
    progress: string;
  };

  // Profile
  profile: {
    title: string;
    settings: string;
    statistics: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    language: string;
    selectLanguage: string;
    notifications: string;
    sound: string;
    haptic: string;
    weekStart: string;
    weekStartsOn: string;
    sunday: string;
    monday: string;
    taskflowUser: string;
    completedTasks: string;
    currentStreak: string;
    longestStreak: string;
    completionRate: string;
    currency: string;
    dateFormat: string;
    timeFormat: string;
    privacy: string;
    backup: string;
    restore: string;
    about: string;
    version: string;
    feedback: string;
    rateApp: string;
    logout: string;
  };

  // Messages
  messages: {
    taskAdded: string;
    taskCreated: string;
    taskUpdated: string;
    taskDeleted: string;
    taskCompleted: string;
    error: string;
    confirmDelete: string;
    saved: string;
    copied: string;
    exported: string;
    imported: string;
    welcome: string;
    goodbye: string;
    success: string;
    failed: string;
    networkError: string;
    tryAgain: string;
  };

  // Empty states
  empty: {
    todayTitle: string;
    todayDescription: string;
    todaySubtitle: string;
    calendarTitle: string;
    calendarSubtitle: string;
    noTasksForDate: string;
    listsTitle: string;
    listsSubtitle: string;
    noData: string;
    startAdding: string;
  };

  // Onboarding
  onboarding: {
    welcome: string;
    welcomeSubtitle: string;
    getStarted: string;
    skip: string;
    next: string;
    finish: string;
    selectModules: string;
    selectLanguage: string;
    selectCurrency: string;
    setupComplete: string;
    letsGo: string;
    step: string;
    of: string;
  };

  // Currency names
  currencies: {
    UZS: string;
    USD: string;
    EUR: string;
    RUB: string;
    KZT: string;
    KGS: string;
    TJS: string;
    TRY: string;
  };

  // Time periods
  time: {
    now: string;
    today: string;
    yesterday: string;
    tomorrow: string;
    thisWeek: string;
    lastWeek: string;
    nextWeek: string;
    thisMonth: string;
    lastMonth: string;
    nextMonth: string;
    minute: string;
    minutes: string;
    hour: string;
    hours: string;
    day: string;
    days: string;
    week: string;
    weeks: string;
    month: string;
    months: string;
    year: string;
    years: string;
    ago: string;
    left: string;
  };
}

// Информация о поддерживаемых локалях
export const localeInfoMap: Record<Locale, LocaleInfo> = {
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    dir: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: { decimal: ',', thousand: ' ' },
  },
  uz: {
    code: 'uz',
    name: 'Uzbek',
    nativeName: "O'zbekcha",
    flag: '🇺🇿',
    dir: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: { decimal: ',', thousand: ' ' },
  },
  kz: {
    code: 'kz',
    name: 'Kazakh',
    nativeName: 'Қазақша',
    flag: '🇰🇿',
    dir: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: { decimal: ',', thousand: ' ' },
  },
  kg: {
    code: 'kg',
    name: 'Kyrgyz',
    nativeName: 'Кыргызча',
    flag: '🇰🇬',
    dir: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: { decimal: ',', thousand: ' ' },
  },
  tj: {
    code: 'tj',
    name: 'Tajik',
    nativeName: 'Тоҷикӣ',
    flag: '🇹🇯',
    dir: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: { decimal: ',', thousand: ' ' },
  },
  tr: {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    dir: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: { decimal: ',', thousand: '.' },
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: { decimal: '.', thousand: ',' },
  },
};

// Список всех поддерживаемых локалей
export const supportedLocales: Locale[] = ['ru', 'uz', 'kz', 'kg', 'tj', 'tr', 'en'];

// Локаль по умолчанию
export const defaultLocale: Locale = 'ru';