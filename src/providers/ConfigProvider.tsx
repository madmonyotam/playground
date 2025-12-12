'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppConfig, configService } from '@/lib/config/config';

interface ConfigContextType {
    config: AppConfig;
    updateConfig: (updates: Partial<AppConfig>) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<AppConfig>(configService.getConfig());

    useEffect(() => {
        // Initial setup for direction
        document.documentElement.dir = config.language === 'he' ? 'rtl' : 'ltr';
        document.documentElement.lang = config.language;
    }, []);

    const updateConfig = (updates: Partial<AppConfig>) => {
        const newConfig = { ...config, ...updates };
        setConfig(newConfig);
        configService.updateConfig(updates);

        // Update DOM attributes immediately
        if (updates.language) {
            document.documentElement.dir = updates.language === 'he' ? 'rtl' : 'ltr';
            document.documentElement.lang = updates.language;
        }
    };

    return (
        <ConfigContext.Provider value={{ config, updateConfig }}>
            {children}
        </ConfigContext.Provider>
    );
}

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};
