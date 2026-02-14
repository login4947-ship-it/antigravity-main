import { useState, useRef, useEffect, useMemo } from 'react';
import { UserIcon, CheckIcon, XIcon } from './Icons';
import { useLanguage } from '../context/LanguageContext';

/**
 * Цвета для исполнителей (циклично)
 */
const EXECUTOR_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
    '#ef4444', '#06b6d4', '#ec4899', '#84cc16'
];

/**
 * Получить цвет для пользователя по его ID
 */
export function getExecutorColor(id) {
    if (!id) return EXECUTOR_COLORS[0];
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return EXECUTOR_COLORS[hash % EXECUTOR_COLORS.length];
}

/**
 * Получить исполнителя из списка пользователей
 */
export function getExecutorFromUsers(id, users = []) {
    const user = users.find(u => u.id === id);
    if (!user) return null;
    return {
        id: user.id,
        name: user.fullName || user.username,
        color: getExecutorColor(user.id)
    };
}

/**
 * Компонент мульти-выбора исполнителей
 */
function ExecutorSelect({ value = [], onChange, users = [], disabled = false }) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);

    // Только пользователи с ролью "employee" могут быть исполнителями
    const employees = useMemo(() => {
        return users
            .filter(u => u.role === 'employee')
            .map(u => ({
                id: u.id,
                name: u.fullName || u.username,
                color: getExecutorColor(u.id)
            }));
    }, [users]);

    // Закрытие при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleExecutor = (executorId) => {
        if (disabled) return;

        const newValue = value.includes(executorId)
            ? value.filter(id => id !== executorId)
            : [...value, executorId];

        onChange(newValue);
    };

    const clearSelection = (e) => {
        e.stopPropagation();
        onChange([]);
    };

    const selectedExecutors = value
        .map(id => employees.find(e => e.id === id))
        .filter(Boolean);

    // Фильтрация по поиску
    const filteredExecutors = employees.filter(ex =>
        ex.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="executor-select" ref={containerRef}>
            <div
                className={`executor-select-trigger ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className="executor-select-value">
                    {selectedExecutors.length === 0 ? (
                        <span className="executor-select-placeholder">{t('placeholderExecutors')}</span>
                    ) : (
                        <div className="executor-tags">
                            {selectedExecutors.map(executor => (
                                <span
                                    key={executor.id}
                                    className="executor-tag"
                                    style={{ '--executor-color': executor.color }}
                                >
                                    {executor.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="executor-select-actions">
                    {selectedExecutors.length > 0 && !disabled && (
                        <button
                            type="button"
                            className="executor-clear-btn"
                            onClick={clearSelection}
                            title={t('cancel')}
                        >
                            <XIcon size={14} />
                        </button>
                    )}
                    <UserIcon size={18} className="executor-select-icon" />
                </div>
            </div>

            {isOpen && !disabled && (
                <div className="executor-dropdown fade-in">
                    <div className="search-container" style={{ padding: '8px' }}>
                        <input
                            type="text"
                            className="form-input"
                            style={{ height: '36px', fontSize: '1rem' }}
                            placeholder={t('search')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="executor-options-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {filteredExecutors.length > 0 ? (
                            filteredExecutors.map(executor => {
                                const isSelected = value.includes(executor.id);
                                return (
                                    <div
                                        key={executor.id}
                                        className={`executor-option ${isSelected ? 'selected' : ''}`}
                                        onClick={() => toggleExecutor(executor.id)}
                                    >
                                        <div
                                            className="executor-option-indicator"
                                            style={{ '--executor-color': executor.color }}
                                        >
                                            {isSelected && <CheckIcon size={12} />}
                                        </div>
                                        <span className="executor-option-name">{executor.name}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                Сотрудники не найдены
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Компонент отображения исполнителей (для таблицы)
 */
export function ExecutorBadges({ executorIds, users = [] }) {
    if (!executorIds || executorIds.length === 0) {
        return <span className="text-muted">—</span>;
    }

    return (
        <div className="executor-badges">
            {executorIds.map(id => {
                const executor = getExecutorFromUsers(id, users);
                if (!executor) return null;

                return (
                    <span
                        key={id}
                        className="executor-badge"
                        style={{ '--executor-color': executor.color }}
                        title={executor.name}
                    >
                        {executor.name}
                    </span>
                );
            })}
        </div>
    );
}

export default ExecutorSelect;
