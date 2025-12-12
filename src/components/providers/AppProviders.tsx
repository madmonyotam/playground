'use client'

import React from 'react'
import { ThemeProvider } from 'styled-components'
import { GlobalStyles } from '@/styles/GlobalStyles'
import { ConfigProvider, useConfig } from '@/providers/ConfigProvider'
import { lightTheme, darkTheme } from '@/theme/theme'

// Inner component to access config and apply theme
function ThemedShell({ children }: { children: React.ReactNode }) {
    const { config } = useConfig();

    // Determine base theme (could add dark mode to config later)
    // Determine base theme
    const baseTheme = config.mode === 'dark' ? darkTheme : lightTheme;

    // Override colors with config if present
    const theme = {
        ...baseTheme,
        colors: {
            ...baseTheme.colors,
            primary: config.theme.primaryColor || baseTheme.colors.primary,
            secondary: config.theme.secondaryColor || baseTheme.colors.secondary,
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles />
            {children}
        </ThemeProvider>
    )
}

export default function AppProviders({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ConfigProvider>
            <ThemedShell>
                {children}
            </ThemedShell>
        </ConfigProvider>
    )
}
