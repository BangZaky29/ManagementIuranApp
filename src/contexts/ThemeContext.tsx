import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColors, ThemeColors } from '../constants/Colors';
import { useAuth } from './AuthContext';
import { themeService, ThemeMode } from '../services/theme/themeService';

interface ThemeContextType {
    themeMode: ThemeMode;
    isDark: boolean;
    colors: ThemeColors;
    setThemeMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

const THEME_STORAGE_KEY = '@warga_pintar_theme';

const ThemeContext = createContext<ThemeContextType>({
    themeMode: 'light',
    isDark: false,
    colors: getColors('light'),
    setThemeMode: () => { },
    toggleTheme: () => { },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemScheme = useColorScheme();
    const { user } = useAuth();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

    // Load persisted theme on mount or when user changes
    useEffect(() => {
        const loadTheme = async () => {
            try {
                if (user?.id) {
                    // Fetch from DB if user is logged in
                    const dbTheme = await themeService.getUserTheme(user.id);
                    if (dbTheme) {
                        setThemeModeState(dbTheme);
                        await AsyncStorage.setItem(THEME_STORAGE_KEY, dbTheme); // Also sync to local
                        return;
                    }
                }

                // Fallback to local storage if not logged in or DB fetch fails / is null
                const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (saved === 'light' || saved === 'dark' || saved === 'system') {
                    setThemeModeState(saved as ThemeMode);
                }
            } catch {
                // Fallback to light
            }
        };
        loadTheme();
    }, [user?.id]);

    const setThemeMode = useCallback(async (mode: ThemeMode) => {
        setThemeModeState(mode);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
            if (user?.id) {
                // Sync to database silently
                themeService.updateUserTheme(user.id, mode);
            }
        } catch {
            // Silently fail
        }
    }, [user?.id]);

    const toggleTheme = useCallback(() => {
        const next = themeMode === 'dark' ? 'light' : 'dark';
        setThemeMode(next);
    }, [themeMode, setThemeMode]);

    const effectiveScheme: 'light' | 'dark' =
        themeMode === 'system'
            ? (systemScheme ?? 'light')
            : themeMode;

    const isDark = effectiveScheme === 'dark';
    const colors = getColors(effectiveScheme);

    return (
        <ThemeContext.Provider value={{ themeMode, isDark, colors, setThemeMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * Hook to access current theme colors and toggle function
 */
export const useTheme = () => useContext(ThemeContext);
