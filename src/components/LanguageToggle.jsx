import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import Icons from './Icons';

function LanguageToggle() {
    const { lang, setLang } = useLanguage();

    const toggleLang = () => {
        setLang(lang === 'ru' ? 'ge' : 'ru');
    };

    return (
        <button
            className="btn btn-ghost btn-icon lang-toggle"
            onClick={toggleLang}
            title={lang === 'ru' ? 'Georgian' : 'Russian'}
            style={{ width: 'auto', padding: '0 8px', gap: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}
        >
            <Icons.Globe size={18} />
            <span>{lang.toUpperCase()}</span>
        </button>
    );
}

export default LanguageToggle;
