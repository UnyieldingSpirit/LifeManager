// src/locales/index.ts

export const locales = {
  ru: {
    // Navigation
    nav: {
      today: 'Сегодня',
      calendar: 'Календарь',
      lists: 'Списки',
      profile: 'Профиль',
    },
    
    // Greetings
    greeting: {
      morning: 'Доброе утро',
      afternoon: 'Добрый день',
      evening: 'Добрый вечер',
      night: 'Доброй ночи',
    },
    
    // Common
    common: {
      add: 'Добавить',
      edit: 'Редактировать',
      delete: 'Удалить',
      cancel: 'Отмена',
      save: 'Сохранить',
      done: 'Готово',
      search: 'Поиск',
      loading: 'Загрузка...',
      noResults: 'Ничего не найдено',
      all: 'Все',
    },
    
    // Tasks
    tasks: {
      title: 'Задача',
      tasks: 'задач',
      newTask: 'Новая задача',
      addTask: 'Добавить задачу',
      editTask: 'Редактировать задачу',
      taskTitle: 'Название задачи',
      description: 'Описание',
      noTasks: 'Нет задач',
      noTasksToday: 'На сегодня задач нет',
      addFirstTask: 'Добавьте первую задачу',
      completed: 'Выполнено',
      pending: 'В процессе',
      overdue: 'Просрочено',
      today: 'Сегодня',
      unscheduled: 'Без даты',
      completedToday: 'Выполнено сегодня',
      dueDate: 'Срок выполнения',
      dueTime: 'Время',
      reminder: 'Напоминание',
      repeat: 'Повтор',
      subtasks: 'Подзадачи',
      addSubtask: 'Добавить подзадачу',
    },
    
    // Stats
    stats: {
      pending: 'В работе',
      completed: 'Выполнено',
      streak: 'Серия дней',
      totalTasks: 'Всего задач',
      completedTasks: 'Выполнено',
      currentStreak: 'Текущая серия',
      longestStreak: 'Лучшая серия',
      today: 'Сегодня',
      thisWeek: 'На этой неделе',
      thisMonth: 'В этом месяце',
      days: 'дней',
    },
    
    // Form
    form: {
      taskTitle: 'Название задачи',
      taskDescription: 'Описание (опционально)',
      category: 'Категория',
      priority: 'Приоритет',
      date: 'Дата',
      time: 'Время',
      repeat: 'Повтор',
      reminder: 'Напоминание',
      advancedOptions: 'Дополнительно',
      createTask: 'Создать задачу',
    },
    
    // Priority
    priority: {
      title: 'Приоритет',
      urgent: 'Срочно',
      high: 'Высокий',
      medium: 'Средний',
      low: 'Низкий',
    },
    
    // Priorities (алиас для совместимости)
    priorities: {
      urgent: 'Срочно',
      high: 'Высокий',
      medium: 'Средний',
      low: 'Низкий',
    },
    
    // Categories
    categories: {
      title: 'Категория',
      work: 'Работа',
      personal: 'Личное',
      shopping: 'Покупки',
      health: 'Здоровье',
      finance: 'Финансы',
      birthday: 'День рождения',
      call: 'Звонок',
      other: 'Другое',
    },
    
    // Repeat
    repeat: {
      none: 'Не повторять',
      daily: 'Ежедневно',
      weekly: 'Еженедельно',
      monthly: 'Ежемесячно',
      yearly: 'Ежегодно',
    },
    
    // Calendar
    calendar: {
      title: 'Календарь',
      today: 'Сегодня',
      monthNames: [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
      ],
      dayNames: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    },
    
    // Lists
    lists: {
      title: 'Списки',
      subtitle: 'Организуйте задачи по категориям',
      allTasks: 'Все задачи',
      createList: 'Создать список',
      listName: 'Название списка',
      byCategory: 'По категориям',
      quickStats: 'Статистика',
      active: 'активных',
      done: 'выполнено',
      total: 'всего',
      tasks: 'задач',
      pending: 'в работе',
      completed: 'выполнено',
      progress: 'Прогресс',
    },
    
    // Profile
    profile: {
      title: 'Профиль',
      settings: 'Настройки',
      statistics: 'Статистика',
      theme: 'Тема',
      themeLight: 'Светлая',
      themeDark: 'Тёмная',
      themeSystem: 'Авто',
      language: 'Язык',
      selectLanguage: 'Выберите язык',
      notifications: 'Уведомления',
      sound: 'Звук',
      haptic: 'Вибрация',
      weekStart: 'Начало недели',
      weekStartsOn: 'Начало недели',
      sunday: 'Воскресенье',
      monday: 'Понедельник',
      taskflowUser: 'Пользователь TaskFlow',
      completedTasks: 'Выполнено задач',
      currentStreak: 'Текущая серия',
      longestStreak: 'Лучшая серия',
      completionRate: 'Процент выполнения',
    },
    
    // Messages
    messages: {
      taskAdded: 'Задача добавлена',
      taskCreated: 'Задача создана',
      taskUpdated: 'Задача обновлена',
      taskDeleted: 'Задача удалена',
      taskCompleted: 'Отлично! Задача выполнена',
      error: 'Произошла ошибка',
      confirmDelete: 'Удалить эту задачу?',
    },
    
    // Empty states
    empty: {
      todayTitle: 'Свободный день!',
      todayDescription: 'Добавьте задачи или отдохните',
      todaySubtitle: 'Добавьте задачи или отдохните',
      calendarTitle: 'Нет задач на эту дату',
      calendarSubtitle: 'Выберите другую дату или добавьте задачу',
      noTasksForDate: 'Нет задач на эту дату',
      listsTitle: 'Списки пусты',
      listsSubtitle: 'Создайте свой первый список',
    },
  },
  
  en: {
    nav: {
      today: 'Today',
      calendar: 'Calendar',
      lists: 'Lists',
      profile: 'Profile',
    },
    
    greeting: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
      night: 'Good night',
    },
    
    common: {
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      cancel: 'Cancel',
      save: 'Save',
      done: 'Done',
      search: 'Search',
      loading: 'Loading...',
      noResults: 'No results found',
      all: 'All',
    },
    
    tasks: {
      title: 'Task',
      tasks: 'tasks',
      newTask: 'New task',
      addTask: 'Add task',
      editTask: 'Edit task',
      taskTitle: 'Task title',
      description: 'Description',
      noTasks: 'No tasks',
      noTasksToday: 'No tasks for today',
      addFirstTask: 'Add your first task',
      completed: 'Completed',
      pending: 'Pending',
      overdue: 'Overdue',
      today: 'Today',
      unscheduled: 'Unscheduled',
      completedToday: 'Completed today',
      dueDate: 'Due date',
      dueTime: 'Time',
      reminder: 'Reminder',
      repeat: 'Repeat',
      subtasks: 'Subtasks',
      addSubtask: 'Add subtask',
    },
    
    stats: {
      pending: 'Pending',
      completed: 'Completed',
      streak: 'Day streak',
      totalTasks: 'Total tasks',
      completedTasks: 'Completed',
      currentStreak: 'Current streak',
      longestStreak: 'Best streak',
      today: 'Today',
      thisWeek: 'This week',
      thisMonth: 'This month',
      days: 'days',
    },
    
    form: {
      taskTitle: 'Task title',
      taskDescription: 'Description (optional)',
      category: 'Category',
      priority: 'Priority',
      date: 'Date',
      time: 'Time',
      repeat: 'Repeat',
      reminder: 'Reminder',
      advancedOptions: 'Advanced',
      createTask: 'Create task',
    },
    
    priority: {
      title: 'Priority',
      urgent: 'Urgent',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
    
    priorities: {
      urgent: 'Urgent',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
    
    categories: {
      title: 'Category',
      work: 'Work',
      personal: 'Personal',
      shopping: 'Shopping',
      health: 'Health',
      finance: 'Finance',
      birthday: 'Birthday',
      call: 'Call',
      other: 'Other',
    },
    
    repeat: {
      none: "Don't repeat",
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
    },
    
    calendar: {
      title: 'Calendar',
      today: 'Today',
      monthNames: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      dayNamesShort: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    },
    
    lists: {
      title: 'Lists',
      subtitle: 'Organize tasks by category',
      allTasks: 'All tasks',
      createList: 'Create list',
      listName: 'List name',
      byCategory: 'By category',
      quickStats: 'Quick stats',
      active: 'active',
      done: 'done',
      total: 'total',
      tasks: 'tasks',
      pending: 'pending',
      completed: 'completed',
      progress: 'Progress',
    },
    
    profile: {
      title: 'Profile',
      settings: 'Settings',
      statistics: 'Statistics',
      theme: 'Theme',
      themeLight: 'Light',
      themeDark: 'Dark',
      themeSystem: 'Auto',
      language: 'Language',
      selectLanguage: 'Select language',
      notifications: 'Notifications',
      sound: 'Sound',
      haptic: 'Haptic',
      weekStart: 'Week starts on',
      weekStartsOn: 'Week starts on',
      sunday: 'Sunday',
      monday: 'Monday',
      taskflowUser: 'TaskFlow User',
      completedTasks: 'Completed tasks',
      currentStreak: 'Current streak',
      longestStreak: 'Longest streak',
      completionRate: 'Completion rate',
    },
    
    messages: {
      taskAdded: 'Task added',
      taskCreated: 'Task created',
      taskUpdated: 'Task updated',
      taskDeleted: 'Task deleted',
      taskCompleted: 'Great! Task completed',
      error: 'An error occurred',
      confirmDelete: 'Delete this task?',
    },
    
    empty: {
      todayTitle: 'Free day!',
      todayDescription: 'Add tasks or take a rest',
      todaySubtitle: 'Add tasks or take a rest',
      calendarTitle: 'No tasks for this date',
      calendarSubtitle: 'Select another date or add a task',
      noTasksForDate: 'No tasks for this date',
      listsTitle: 'Lists are empty',
      listsSubtitle: 'Create your first list',
    },
  },
  
  uz: {
    nav: {
      today: 'Bugun',
      calendar: 'Kalendar',
      lists: "Ro'yxatlar",
      profile: 'Profil',
    },
    
    greeting: {
      morning: 'Xayrli tong',
      afternoon: 'Xayrli kun',
      evening: 'Xayrli kech',
      night: 'Xayrli tun',
    },
    
    common: {
      add: "Qo'shish",
      edit: 'Tahrirlash',
      delete: "O'chirish",
      cancel: 'Bekor qilish',
      save: 'Saqlash',
      done: 'Tayyor',
      search: 'Qidirish',
      loading: 'Yuklanmoqda...',
      noResults: 'Hech narsa topilmadi',
      all: 'Hammasi',
    },
    
    tasks: {
      title: 'Vazifa',
      tasks: 'vazifa',
      newTask: 'Yangi vazifa',
      addTask: "Vazifa qo'shish",
      editTask: 'Vazifani tahrirlash',
      taskTitle: 'Vazifa nomi',
      description: 'Tavsif',
      noTasks: "Vazifalar yo'q",
      noTasksToday: "Bugun uchun vazifalar yo'q",
      addFirstTask: "Birinchi vazifani qo'shing",
      completed: 'Bajarilgan',
      pending: 'Jarayonda',
      overdue: "Muddati o'tgan",
      today: 'Bugun',
      unscheduled: 'Sanasiz',
      completedToday: 'Bugun bajarilgan',
      dueDate: 'Muddat',
      dueTime: 'Vaqt',
      reminder: 'Eslatma',
      repeat: 'Takrorlash',
      subtasks: 'Kichik vazifalar',
      addSubtask: "Kichik vazifa qo'shish",
    },
    
    stats: {
      pending: 'Jarayonda',
      completed: 'Bajarilgan',
      streak: 'Kunlik seriya',
      totalTasks: 'Jami vazifalar',
      completedTasks: 'Bajarilgan',
      currentStreak: 'Joriy seriya',
      longestStreak: 'Eng yaxshi seriya',
      today: 'Bugun',
      thisWeek: 'Bu hafta',
      thisMonth: 'Bu oy',
      days: 'kun',
    },
    
    form: {
      taskTitle: 'Vazifa nomi',
      taskDescription: "Tavsif (ixtiyoriy)",
      category: 'Kategoriya',
      priority: 'Muhimlik',
      date: 'Sana',
      time: 'Vaqt',
      repeat: 'Takrorlash',
      reminder: 'Eslatma',
      advancedOptions: "Qo'shimcha",
      createTask: 'Vazifa yaratish',
    },
    
    priority: {
      title: 'Muhimlik',
      urgent: 'Shoshilinch',
      high: 'Yuqori',
      medium: "O'rta",
      low: 'Past',
    },
    
    priorities: {
      urgent: 'Shoshilinch',
      high: 'Yuqori',
      medium: "O'rta",
      low: 'Past',
    },
    
    categories: {
      title: 'Kategoriya',
      work: 'Ish',
      personal: 'Shaxsiy',
      shopping: 'Xaridlar',
      health: "Sog'liq",
      finance: 'Moliya',
      birthday: "Tug'ilgan kun",
      call: "Qo'ng'iroq",
      other: 'Boshqa',
    },
    
    repeat: {
      none: 'Takrorlamaslik',
      daily: 'Har kuni',
      weekly: 'Har hafta',
      monthly: 'Har oy',
      yearly: 'Har yil',
    },
    
    calendar: {
      title: 'Kalendar',
      today: 'Bugun',
      monthNames: [
        'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
        'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
      ],
      dayNames: ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'],
      dayNamesShort: ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'],
    },
    
    lists: {
      title: "Ro'yxatlar",
      subtitle: "Vazifalarni kategoriya bo'yicha tartibga soling",
      allTasks: 'Barcha vazifalar',
      createList: "Ro'yxat yaratish",
      listName: "Ro'yxat nomi",
      byCategory: "Kategoriya bo'yicha",
      quickStats: 'Statistika',
      active: 'faol',
      done: 'bajarilgan',
      total: 'jami',
      tasks: 'vazifa',
      pending: 'jarayonda',
      completed: 'bajarilgan',
      progress: 'Progress',
    },
    
    profile: {
      title: 'Profil',
      settings: 'Sozlamalar',
      statistics: 'Statistika',
      theme: 'Mavzu',
      themeLight: 'Yorqin',
      themeDark: "Qorong'u",
      themeSystem: 'Avto',
      language: 'Til',
      selectLanguage: 'Tilni tanlang',
      notifications: 'Bildirishnomalar',
      sound: 'Ovoz',
      haptic: 'Tebranish',
      weekStart: 'Hafta boshlanishi',
      weekStartsOn: 'Hafta boshlanishi',
      sunday: 'Yakshanba',
      monday: 'Dushanba',
      taskflowUser: 'TaskFlow foydalanuvchisi',
      completedTasks: 'Bajarilgan vazifalar',
      currentStreak: 'Joriy seriya',
      longestStreak: 'Eng uzun seriya',
      completionRate: 'Bajarish foizi',
    },
    
    messages: {
      taskAdded: "Vazifa qo'shildi",
      taskCreated: 'Vazifa yaratildi',
      taskUpdated: 'Vazifa yangilandi',
      taskDeleted: "Vazifa o'chirildi",
      taskCompleted: 'Ajoyib! Vazifa bajarildi',
      error: 'Xatolik yuz berdi',
      confirmDelete: "Bu vazifani o'chirishni xohlaysizmi?",
    },
    
    empty: {
      todayTitle: "Bo'sh kun!",
      todayDescription: "Vazifa qo'shing yoki dam oling",
      todaySubtitle: "Vazifa qo'shing yoki dam oling",
      calendarTitle: "Bu sana uchun vazifalar yo'q",
      calendarSubtitle: "Boshqa sanani tanlang yoki vazifa qo'shing",
      noTasksForDate: "Bu sana uchun vazifalar yo'q",
      listsTitle: "Ro'yxatlar bo'sh",
      listsSubtitle: "Birinchi ro'yxatingizni yarating",
    },
  },
};

export type LocaleKey = keyof typeof locales;
export type Translations = typeof locales.ru;