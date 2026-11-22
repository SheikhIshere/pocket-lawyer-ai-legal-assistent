import { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    isLight: boolean;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme-preference-v4';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(THEME_STORAGE_KEY);
            if (stored === 'dark') return 'dark';
        }
        return 'light';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(THEME_STORAGE_KEY, theme);

            // Update document class for Tailwind dark mode. Remove the
            // opposite class so the document never carries `light dark`.
            if (theme === 'dark') {
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
                document.body.classList.remove('light');
                document.body.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
                document.body.classList.remove('dark');
                document.body.classList.add('light');
            }
        }
    }, [theme]);

    const toggleTheme = () => {
        setThemeState(prev => prev === 'light' ? 'dark' : 'light');
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const value = {
        theme,
        toggleTheme,
        setTheme,
        isLight: theme === 'light',
        isDark: theme === 'dark',
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
