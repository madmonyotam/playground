'use client';

import React, { useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { GlobalStyles } from '@/styles/GlobalStyles';
import { lightTheme, darkTheme } from '@/theme/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // TODO: Add persistence or system preference detection
    const [isDark, setIsDark] = useState(false);

    const theme = isDark ? darkTheme : lightTheme;

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    return (
        <StyledThemeProvider theme={theme}>
            <GlobalStyles />
            {/* We can expose toggleTheme via a context if needed, but for now just wrapping */}
            {children}
            {/* Helper toggle for Development visualization - remove later or move to settings */}
            <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
                <button
                    onClick={toggleTheme}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        background: theme.colors.primary,
                        color: '#fff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        fontWeight: 'bold'
                    }}
                >
                    {isDark ? '☀ Light' : '☾ Dark'}
                </button>
            </div>
        </StyledThemeProvider>
    );
}
