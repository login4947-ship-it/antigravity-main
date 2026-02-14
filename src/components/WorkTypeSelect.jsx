import { useState, useRef, useEffect } from 'react';
import Icons from './Icons';
import { useLanguage } from '../context/LanguageContext';

/**
 * Типы работ
 */
export const WORK_TYPES = [
    { id: 'diagnostics', translationKey: 'typeDiagnostics', emoji: '🔍', color: '#6366f1' },
    { id: 'maintenance', translationKey: 'typeMaintenance', emoji: '🛢️', color: '#10b981' },
    { id: 'suspension', translationKey: 'typeSuspension', emoji: '🔧', color: '#f59e0b' },
    { id: 'engine', translationKey: 'typeEngine', emoji: '⚙️', color: '#ef4444' },
    { id: 'brakes', translationKey: 'typeBrakes', emoji: '🛑', color: '#991b1b' },
    { id: 'electrical', translationKey: 'typeElectrical', emoji: '⚡', color: '#eab308' },
    { id: 'air_conditioning', translationKey: 'typeAirConditioning', emoji: '❄️', color: '#06b6d4' },
    { id: 'heating', translationKey: 'typeHeating', emoji: '♨️', color: '#f97316' },
    { id: 'chip_tuning', translationKey: 'typeChipTuning', emoji: '🧬', color: '#8b5cf6' },
    { id: 'block_repair', translationKey: 'typeBlockRepair', emoji: '📟', color: '#ec4899' },
    { id: 'programming_coding', translationKey: 'typeProgrammingCoding', emoji: '💻', color: '#3b82f6' },
    { id: 'at_repair', translationKey: 'typeAtRepair', emoji: '🕹️', color: '#f59e0b' },
    { id: 'other', translationKey: 'typeOther', emoji: '📦', color: '#6b7280' }
];

/**
 * Получить тип работы по ID
 */
export function getWorkTypeById(id) {
    return WORK_TYPES.find(t => t.id === id);
}

/**
 * Компонент выбора типа работы
 */
function WorkTypeSelect({ value, onChange, hasError, disabled = false }) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Закрытие при клике вне
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (typeId) => {
        if (disabled) return;
        onChange(typeId);
        setIsOpen(false);
    };

    const selectedWorkType = getWorkTypeById(value);

    return (
        <div className="work-type-select" ref={containerRef}>
            <div
                className={`work-type-trigger ${isOpen ? 'open' : ''} ${hasError ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className="trigger-value">
                    {selectedWorkType ? (
                        <div className="selected-value">
                            <span className="type-emoji">{selectedWorkType.emoji}</span>
                            <span className="type-name">{t(selectedWorkType.translationKey)}</span>
                        </div>
                    ) : (
                        <span className="placeholder">{t('placeholderWorkType')}</span>
                    )}
                </div>
                <Icons.ChevronDown size={18} className="chevron-icon" />
            </div>

            {isOpen && !disabled && (
                <div className="work-type-dropdown fade-in">
                    <div className="dropdown-scroll" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                        {WORK_TYPES.map(type => (
                            <div
                                key={type.id}
                                className={`work-type-option ${value === type.id ? 'selected' : ''}`}
                                onClick={() => handleSelect(type.id)}
                            >
                                <span className="type-emoji">{type.emoji}</span>
                                <span className="type-name">{t(type.translationKey)}</span>
                                {value === type.id && <Icons.Check size={16} className="check-icon" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Бейдж типа работы (для таблицы)
 */
export function WorkTypeBadge({ workTypeId }) {
    const { t } = useLanguage();
    const type = getWorkTypeById(workTypeId);
    if (!type) return <span className="text-muted">—</span>;

    return (
        <div className="work-type-badge" style={{ backgroundColor: `${type.color}15`, color: type.color, borderColor: `${type.color}30` }}>
            <span className="badge-emoji">{type.emoji}</span>
            <span className="badge-text" style={{ fontWeight: '600' }}>{t(type.translationKey)}</span>
        </div>
    );
}

export default WorkTypeSelect;
