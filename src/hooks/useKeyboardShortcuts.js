import { useEffect, useCallback } from 'react';

/**
 * Конфигурация горячих клавиш
 */
export const SHORTCUTS = {
    NEW_RECORD: { key: 'n', ctrl: true, description: 'Новая запись' },
    SAVE_EXPORT: { key: 's', ctrl: true, description: 'Экспорт' },
    TOGGLE_THEME: { key: 'd', ctrl: true, description: 'Сменить тему' },
    CANCEL: { key: 'Escape', ctrl: false, description: 'Отмена' },
    CONFIRM: { key: 'Enter', ctrl: false, description: 'Подтвердить' }
};

/**
 * Хук для обработки горячих клавиш
 * @param {Object} handlers - Объект с обработчиками для каждой комбинации
 * @param {boolean} enabled - Включены ли горячие клавиши
 */
export function useKeyboardShortcuts(handlers, enabled = true) {
    const handleKeyDown = useCallback((event) => {
        if (!enabled) return;

        // Игнорируем, если фокус в поле ввода (кроме Escape и Enter)
        const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
            document.activeElement?.tagName
        );

        // Проверяем каждую комбинацию
        Object.entries(SHORTCUTS).forEach(([action, config]) => {
            const handler = handlers[action];
            if (!handler) return;

            const keyMatches = event.key.toLowerCase() === config.key.toLowerCase() ||
                event.key === config.key;
            const ctrlMatches = config.ctrl === (event.ctrlKey || event.metaKey);

            if (keyMatches && ctrlMatches) {
                // Для Escape и Enter разрешаем работу даже в полях ввода
                if (isInputFocused && !['Escape', 'Enter'].includes(config.key)) {
                    return;
                }

                // Предотвращаем стандартное поведение браузера
                event.preventDefault();
                handler(event);
            }
        });
    }, [handlers, enabled]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

/**
 * Возвращает список доступных горячих клавиш
 * @returns {Array} Массив горячих клавиш с описаниями
 */
export function getShortcutsList() {
    return Object.entries(SHORTCUTS).map(([action, config]) => ({
        action,
        key: config.ctrl ? `Ctrl+${config.key.toUpperCase()}` : config.key,
        description: config.description
    }));
}

export default useKeyboardShortcuts;
