export interface AppConfig {
    features: {
        aiChef: boolean;
        premiumThemes: boolean;
    };
    tier: 'FREE' | 'PREMIUM' | 'PAID';
    theme: {
        primaryColor: string;
        secondaryColor: string;
    };
    mode: 'light' | 'dark'; // New property
    useMockData: boolean;
    language: 'en' | 'he';
}

const defaultConfig: AppConfig = {
    features: {
        aiChef: false, // Default to false, toggle via flag
        premiumThemes: false,
    },
    tier: 'FREE',
    theme: {
        primaryColor: '#e74c3c', // Default generic red
        secondaryColor: '#2c3e50',
    },
    mode: 'light',
    useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true',
    language: 'en',
};

// Simple singleton for now, could fetch from remote later
class ConfigService {
    private config: AppConfig;
    private STORAGE_KEY = 'app_config_v1';

    constructor() {
        this.config = { ...defaultConfig };
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                try {
                    this.config = { ...this.config, ...JSON.parse(saved) };
                } catch (e) {
                    console.error('Failed to parse saved config', e);
                }
            }
        }
    }

    getConfig(): AppConfig {
        return this.config;
    }

    updateConfig(updates: Partial<AppConfig>) {
        this.config = { ...this.config, ...updates };
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
        }
    }
}

export const configService = new ConfigService();
