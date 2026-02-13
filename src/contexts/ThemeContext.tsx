import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColors, ThemeColors } from '../constants/Colors';

type ThemeMode = 'light' | 'dark' | 'system';

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
    const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

    // Load persisted theme on mount
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (saved === 'light' || saved === 'dark' || saved === 'system') {
                    setThemeModeState(saved);
                }
            } catch {
                // Fallback to light
            }
        };
        loadTheme();
    }, []);

    const setThemeMode = useCallback(async (mode: ThemeMode) => {
        setThemeModeState(mode);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
        } catch {
            // Silently fail
        }
    }, []);

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
