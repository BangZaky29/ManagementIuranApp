/**
 * RTPINTAR "Green Nature" Color Palette
 * Modern, Minimalist, User Friendly
 */
export const Colors = {
    // Core Palette
    green1: '#EEF2E3', // Background
    green2: '#C8F169', // Accent / Soft Highlight
    green3: '#78C51C', // Primary Action
    green4: '#2A6F2B', // Dark Green / Subtext
    green5: '#043F2E', // Deep Green / Text / Headings

    // Functional Aliases
    primary: '#78C51C',      // Green 3
    secondary: '#EEF2E3',    // Green 1
    accent: '#C8F169',       // Green 2
    background: '#EEF2E3',   // Green 1 (Main Background)
    backgroundCard: '#FFFFFF', // White for cards on Green 1
    textPrimary: '#043F2E',  // Green 5 (Deep)
    textSecondary: '#2A6F2B',// Green 4
    white: '#FFFFFF',

    // Status
    danger: '#FF6B6B',
    success: '#78C51C', // Match primary green
    warning: '#FFCC00',
    info: '#2196F3',

    // Centralized Status Palette
    status: {
        // Reports
        menunggu: { text: '#F57C00', bg: '#FFF3E0' }, // Orange
        diproses: { text: '#1976D2', bg: '#E3F2FD' }, // Blue
        selesai: { text: '#388E3C', bg: '#E8F5E9' },  // Green
        ditolak: { text: '#D32F2F', bg: '#FFEBEE' },  // Red

        // Payments
        pending: { text: '#F57C00', bg: '#FFF3E0' },
        lunas: { text: '#388E3C', bg: '#E8F5E9' },
        terlambat: { text: '#D32F2F', bg: '#FFEBEE' },

        // Roles
        admin: { text: '#1565C0', bg: '#E3F2FD' },
        security: { text: '#E65100', bg: '#FFF3E0' },
        warga: { text: '#2E7D32', bg: '#E8F5E9' },
    },

    // Navigation Themes
    light: {
        text: '#043F2E',
        background: '#EEF2E3',
        tint: '#78C51C',
        icon: '#2A6F2B',
        tabIconDefault: '#2A6F2B',
        tabIconSelected: '#78C51C',
    },
    dark: {
        text: '#EEF2E3',
        background: '#121212',
        tint: '#78C51C',
        icon: '#A0A0A0',
        tabIconDefault: '#A0A0A0',
        tabIconSelected: '#78C51C',
    },
};

/**
 * Dynamic theme colors — use with ThemeContext
 */
export interface ThemeColors {
    background: string;
    backgroundCard: string;
    textPrimary: string;
    textSecondary: string;
    primary: string;
    accent: string;
    border: string;
    white: string;
    green1: string;
    green2: string;
    green3: string;
    green4: string;
    green5: string;
    danger: string;
    success: string;
    warning: string;
    info: string;
    status: {
        menunggu: { text: string; bg: string };
        diproses: { text: string; bg: string };
        selesai: { text: string; bg: string };
        ditolak: { text: string; bg: string };
        pending: { text: string; bg: string };
        lunas: { text: string; bg: string };
        terlambat: { text: string; bg: string };
        admin: { text: string; bg: string };
        security: { text: string; bg: string };
        warga: { text: string; bg: string };
    };
    statusBar: 'dark-content' | 'light-content';
}

export const getColors = (scheme: 'light' | 'dark'): ThemeColors => {
    if (scheme === 'dark') {
        return {
            background: '#121212',
            backgroundCard: '#1E1E1E',
            textPrimary: '#FFFFFF',
            textSecondary: '#A0A0A0',
            primary: '#78C51C',
            accent: '#C8F169',
            border: '#2C2C2C',
            white: '#FFFFFF',
            green1: '#121212',
            green2: '#1E1E1E',
            green3: '#78C51C',
            green4: '#A0A0A0',
            green5: '#FFFFFF',
            danger: '#E57373',
            success: '#81C784',
            warning: '#FFB74D',
            info: '#64B5F6',
            status: {
                menunggu: { text: '#FFB74D', bg: 'rgba(255, 183, 77, 0.15)' },
                diproses: { text: '#64B5F6', bg: 'rgba(100, 181, 246, 0.15)' },
                selesai: { text: '#81C784', bg: 'rgba(129, 199, 132, 0.15)' },
                ditolak: { text: '#E57373', bg: 'rgba(229, 115, 115, 0.15)' },
                pending: { text: '#FFB74D', bg: 'rgba(255, 183, 77, 0.15)' },
                lunas: { text: '#81C784', bg: 'rgba(129, 199, 132, 0.15)' },
                terlambat: { text: '#E57373', bg: 'rgba(229, 115, 115, 0.15)' },
                admin: { text: '#64B5F6', bg: 'rgba(100, 181, 246, 0.15)' },
                security: { text: '#FFB74D', bg: 'rgba(255, 183, 77, 0.15)' },
                warga: { text: '#81C784', bg: 'rgba(129, 199, 132, 0.15)' },
            },
            statusBar: 'light-content',
        };
    }
    return {
        background: '#EEF2E3',
        backgroundCard: '#FFFFFF',
        textPrimary: '#043F2E',
        textSecondary: '#2A6F2B',
        primary: '#78C51C',
        accent: '#C8F169',
        border: '#C8F169',
        white: '#FFFFFF',
        green1: '#EEF2E3',
        green2: '#C8F169',
        green3: '#78C51C',
        green4: '#2A6F2B',
        green5: '#043F2E',
        danger: '#FF6B6B',
        success: '#78C51C',
        warning: '#FFCC00',
        info: '#2196F3',
        status: Colors.status, // Fallback to original light status colors
        statusBar: 'dark-content',
    };
};

