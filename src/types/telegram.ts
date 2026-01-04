// src/types/telegram.ts

// Расширяем глобальный тип Window для добавления Telegram WebApp
declare global {
    interface Window {
        Telegram?: {
            WebApp?: TelegramWebApp;
        };
    }
}

export type HapticFeedbackType = 'impact' | 'notification' | 'selection';

export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    [key: string]: any;
}

export interface TelegramWebAppInitData {
    query_id?: string;
    user?: TelegramUser;
    auth_date?: number;
    hash?: string;
    start_param?: string;
    [key: string]: any;
}

export interface HapticFeedback {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
}

export interface BackButton {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback?: () => void) => void;
}

export interface MainButton {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback?: () => void) => void;
}

export interface TelegramWebApp {
    initData: string;
    initDataUnsafe: TelegramWebAppInitData;
    version: string;
    platform: string;
    colorScheme: 'light' | 'dark';
    themeParams: Record<string, string>;
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    headerColor?: string;
    backgroundColor?: string;
    
    // Methods
    ready: () => void;
    expand: () => void;
    close: () => void;
    showAlert: (message: string, callback?: () => void) => void;
    showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
    showPopup: (params: any, callback?: (id: string) => void) => void;
    sendData: (data: string) => void;
    openLink: (url: string, options?: any) => void;
    openTelegramLink: (url: string) => void;
    
    // Optional methods (may not exist in all versions)
    requestFullscreen?: () => void;
    disableVerticalSwipes?: (value: boolean) => void;
    enableClosingConfirmation?: (value: boolean) => void;
    
    // Optional components
    HapticFeedback?: HapticFeedback;
    BackButton?: BackButton;
    MainButton?: MainButton;
    
    // Allow any additional properties
    [key: string]: any;
}

export interface TelegramContextType {
    telegramApp: TelegramWebApp | null;
    user: TelegramUser | null;
    isReady: boolean;
    isTelegram: boolean;
    sendData: (data: any) => boolean;
    showAlert: (message: string) => boolean;
    hapticFeedback: (type: HapticFeedbackType, style?: string) => boolean;
}

export interface UseTelegramReturn extends TelegramContextType {}