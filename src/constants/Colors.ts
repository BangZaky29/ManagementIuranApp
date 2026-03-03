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
        background: '#043F2E',
        tint: '#C8F169',
        icon: '#C8F169',
        tabIconDefault: '#C8F169',
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
            background: '#0A1F18',
            backgroundCard: '#122A22',
            textPrimary: '#EEF2E3',
            textSecondary: '#A8C9A0',
            primary: '#78C51C',
            accent: '#C8F169',
            border: '#1E4035',
            white: '#122A22',
            green1: '#0A1F18',
            green2: '#1E4035',
            green3: '#78C51C',
            green4: '#A8C9A0',
            green5: '#EEF2E3',
            danger: '#FF6B6B',
            success: '#78C51C',
            warning: '#FFCC00',
            info: '#2196F3',
            status: Colors.status,
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
        status: Colors.status,
        statusBar: 'dark-content',
    };
};

