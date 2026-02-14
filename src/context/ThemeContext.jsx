import React, { createContext, useContext, useLayoutEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ThemeContext = createContext();

const VALID_THEMES = ['light', 'dark'];

export function ThemeProvider({ children }) {
    const [storedTheme, setStoredTheme] = useLocalStorage('autoservice-theme-v1', 'dark');
    const theme = VALID_THEMES.includes(storedTheme) ? storedTheme : 'dark';

    useLayoutEffect(() => {
        try {
            if (document.documentElement) document.documentElement.setAttribute('data-theme', theme);
        } catch (_) { /* ignore */ }
    }, [theme]);

    const toggleTheme = () => {
        setStoredTheme(prev => (VALID_THEMES.includes(prev) && prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
