export const lightTheme = {
    colors: {
        primary: '#D96C4A', // Roasted Orange
        secondary: '#8DA399', // Sage Green
        background: '#F9F7F2', // Paper Cream
        surface: '#FFFFFF', // Pure White
        text: {
            primary: '#2C2420', // Warm Coffee
            secondary: '#5D5550', // Warm Gray
            accent: '#D96C4A',
            inverse: '#FFFFFF',
        },
        border: '#E8E4DA',
        status: {
            success: '#8DA399',
            error: '#D96C4A', // Using primary as error/action for now, or defined deeper
        }
    },
    typography: {
        fontFamily: {
            heading: "'Playfair Display', serif",
            body: "'Inter', sans-serif",
        },
        weights: {
            regular: 400,
            medium: 500,
            bold: 700,
        }
    },
    shadows: {
        card: '0 4px 20px rgba(44, 36, 32, 0.08)',
        sm: '0 2px 8px rgba(44, 36, 32, 0.04)',
    },
    borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '24px',
        circle: '50%',
    },
    breakpoints: {
        mobile: '576px',
        tablet: '768px',
        desktop: '992px',
    }
}

export const darkTheme = {
    ...lightTheme,
    colors: {
        ...lightTheme.colors,
        background: '#1A1C1E', // Warm Charcoal
        surface: '#25282B', // Lighter Charcoal
        text: {
            primary: '#ECE0D8', // Oatmeal
            secondary: '#B0A8A0', // Muted Oatmeal
            accent: '#D96C4A',
            inverse: '#2C2420',
        },
        border: 'rgba(255, 255, 255, 0.05)',
        shadows: {
            ...lightTheme.shadows,
            card: 'none', // Dark mode uses borders/glows rarely, or just flat surfaces
        }
    },
    shadows: {
        card: 'none',
        sm: 'none',
    },
}

export type Theme = typeof lightTheme;
