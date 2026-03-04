/**
 * Warga Pintar - Universal Semantic Color System
 * 
 * Defines one central functional palette that works uniformly across
 * Warga, Admin, and Security roles.
 * 
 * Signature/Brand Center Color: #78C51C
 */

export interface ThemeColors {
    // Brand & Actions
    primary: string;           // #78C51C (Center Color)
    primarySubtle: string;     // Soft background variation for primary
    accent: string;            // Secondary interaction color (e.g. #C8F169)

    // Backgrounds & Surfaces
    background: string;        // Main app background
    surface: string;           // Foreground items like Cards, Modals
    surfaceSubtle: string;     // Secondary background for list items, headers

    // Strokes & Outlines
    border: string;            // Lines, dividers, borders

    // Typography
    textPrimary: string;       // Primary text
    textSecondary: string;     // Subtitles, metadata, disabled text
    textWhite: string;         // Text forced to white regardless of theme (e.g. on primary button)

    // Semantic States (Danger, Success, Warning, Info)
    danger: string;
    dangerBg: string;
    success: string;
    successBg: string;
    warning: string;
    warningBg: string;
    info: string;
    infoBg: string;

    // Specific Status Badges (Role agnostic)
    status: {
        menunggu: { text: string; bg: string };
        diproses: { text: string; bg: string };
        selesai: { text: string; bg: string };
        ditolak: { text: string; bg: string };
        pending: { text: string; bg: string };
        lunas: { text: string; bg: string };
        terlambat: { text: string; bg: string };
        // Role Badges
        admin: { text: string; bg: string };
        security: { text: string; bg: string };
        warga: { text: string; bg: string };
    };

    // React Native system styling matching
    statusBar: 'dark-content' | 'light-content';

    // Legacy Aliases (DO NOT USE IN NEW COMPONENTS)
    green1: string;
    green2: string;
    green3: string;
    green4: string;
    green5: string;
    white: string;
}

export const getThemeColors = (scheme: 'light' | 'dark'): ThemeColors => {
    // 1 CENTER COLOR (Consistent in both modes)
    const SignatureGreen = '#78C51C';
    const SignatureGreenSoft = '#EEF2E3';

    if (scheme === 'dark') {
        return {
            primary: SignatureGreen,
            primarySubtle: 'rgba(120, 197, 28, 0.15)', // Dark mode subtle glow
            accent: '#C8F169',

            background: '#121212',       // True dark base
            surface: '#1E1E1E',          // Slightly elevated card
            surfaceSubtle: '#262626',    // Higher elevation / input backgrounds

            border: '#2C2C2C',           // Subtle dark border

            textPrimary: '#F5F5F5',      // Clear read light gray
            textSecondary: '#A0A0A0',    // Muted text
            textWhite: '#FFFFFF',

            danger: '#EF5350',
            dangerBg: 'rgba(239, 83, 80, 0.15)',
            success: '#66BB6A',
            successBg: 'rgba(102, 187, 106, 0.15)',
            warning: '#FFA726',
            warningBg: 'rgba(255, 167, 38, 0.15)',
            info: '#42A5F5',
            infoBg: 'rgba(66, 165, 245, 0.15)',

            status: {
                menunggu: { text: '#FFA726', bg: 'rgba(255, 167, 38, 0.15)' },
                diproses: { text: '#42A5F5', bg: 'rgba(66, 165, 245, 0.15)' },
                selesai: { text: '#66BB6A', bg: 'rgba(102, 187, 106, 0.15)' },
                ditolak: { text: '#EF5350', bg: 'rgba(239, 83, 80, 0.15)' },
                pending: { text: '#FFA726', bg: 'rgba(255, 167, 38, 0.15)' },
                lunas: { text: '#66BB6A', bg: 'rgba(102, 187, 106, 0.15)' },
                terlambat: { text: '#EF5350', bg: 'rgba(239, 83, 80, 0.15)' },
                admin: { text: '#42A5F5', bg: 'rgba(66, 165, 245, 0.15)' },
                security: { text: '#FFA726', bg: 'rgba(255, 167, 38, 0.15)' },
                warga: { text: '#66BB6A', bg: 'rgba(102, 187, 106, 0.15)' },
            },

            statusBar: 'light-content',

            // Legacy map
            green1: '#121212',
            green2: '#1E1E1E',
            green3: SignatureGreen,
            green4: '#A0A0A0',
            green5: '#F5F5F5',
            white: '#FFFFFF',
        };
    }

    // Default LIGHT MODE (Based on classic Warga soft green/white look)
    return {
        primary: SignatureGreen,
        primarySubtle: SignatureGreenSoft,
        accent: '#C8F169',

        background: SignatureGreenSoft, // Soft greenish base #EEF2E3
        surface: '#FFFFFF',          // Clean white cards
        surfaceSubtle: '#F9FAFB',    // Light greyish/greenish for inputs or headers

        border: '#E5E7EB',           // Light divider

        textPrimary: '#043F2E',      // Deep green text so it fits the green theme
        textSecondary: '#6B7280',    // Standard neutral grey for secondary
        textWhite: '#FFFFFF',

        danger: '#F44336',
        dangerBg: '#FFEBEE',
        success: '#4CAF50',
        successBg: '#E8F5E9',
        warning: '#FF9800',
        warningBg: '#FFF3E0',
        info: '#2196F3',
        infoBg: '#E3F2FD',

        status: {
            menunggu: { text: '#F57C00', bg: '#FFF3E0' },
            diproses: { text: '#1976D2', bg: '#E3F2FD' },
            selesai: { text: '#388E3C', bg: '#E8F5E9' },
            ditolak: { text: '#D32F2F', bg: '#FFEBEE' },
            pending: { text: '#F57C00', bg: '#FFF3E0' },
            lunas: { text: '#388E3C', bg: '#E8F5E9' },
            terlambat: { text: '#D32F2F', bg: '#FFEBEE' },
            admin: { text: '#1565C0', bg: '#E3F2FD' },
            security: { text: '#E65100', bg: '#FFF3E0' },
            warga: { text: '#2E7D32', bg: '#E8F5E9' },
        },

        statusBar: 'dark-content',

        // Legacy map
        green1: SignatureGreenSoft,
        green2: '#C8F169',
        green3: SignatureGreen,
        green4: '#2A6F2B',
        green5: '#043F2E',
        white: '#FFFFFF',
    };
};
