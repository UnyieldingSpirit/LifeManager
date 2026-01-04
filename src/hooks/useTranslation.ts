// src/hooks/useTranslation.ts
import { useMemo, useCallback } from 'react';
import { useUserStore } from '@/store/userStore';
import { locales, LocaleKey, Translations } from '@/locales';

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export function useTranslation() {
  const language = useUserStore((state) => state.profile?.settings.language || 'ru');
  
  const translations = useMemo(() => {
    return locales[language as LocaleKey] || locales.ru;
  }, [language]);
  
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.');
      let value: any = translations;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return key; // Return key if translation not found
        }
      }
      
      if (typeof value !== 'string') {
        return key;
      }
      
      // Replace params like {name} or {{count}}
      if (params) {
        return value.replace(/\{\{?(\w+)\}?\}/g, (_, paramKey) => {
          return params[paramKey]?.toString() || `{${paramKey}}`;
        });
      }
      
      return value;
    },
    [translations]
  );
  
  return { t, language, translations };
}