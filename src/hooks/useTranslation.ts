'use client';

import { useConfig } from '@/providers/ConfigProvider';
import { en } from '@/locales/en';
import { he } from '@/locales/he';

const locales = { en, he };

export function useTranslation() {
    const { config } = useConfig();
    const locale = locales[config.language] || en;

    const t = (key: string) => {
        const keys = key.split('.');
        let value: unknown = locale;
        for (const k of keys) {
            if (value && typeof value === 'object' && value !== null && k in (value as Record<string, unknown>)) {
                value = (value as Record<string, unknown>)[k];
            } else {
                return key; // Fallback to key if not found
            }
        }
        return value as string;
    };

    return { t, dir: config.language === 'he' ? 'rtl' : 'ltr' };
}
