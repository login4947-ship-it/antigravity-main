import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from './Icons';
import { useLanguage } from '../context/LanguageContext';

/**
 * Переключатель темы (светлая/темная)
 */
function ThemeToggle() {
    const { t } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    const isDark = theme === 'dark';

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={t('theme')}
            aria-label={t('theme')}
        >
            <div className="theme-toggle-slider">
                {isDark ? <MoonIcon size={14} /> : <SunIcon size={14} />}
            </div>
        </button>
    );
}

export default ThemeToggle;
