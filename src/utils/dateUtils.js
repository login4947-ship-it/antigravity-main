import { useLanguage } from '../context/LanguageContext';

/**
 * Получить название месяца (в родительном падеже для отчетов)
 * @param {number} monthIndex - Индекс месяца (0-11)
 * @returns {string} Название месяца на русском
 */
export function getMonthNameGenitive(monthIndex) {
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    return months[monthIndex] || '';
}

/**
 * Получить название месяца простым списком (1-12)
 */
export function getMonthName(monthNumber) {
    return `month${monthNumber}`;
}

/**
 * Форматирование даты
 */
export function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Получить список доступных месяцев из записей
 */
export function getAvailableMonths(records) {
    const months = new Set();
    records.forEach(record => {
        const date = new Date(record.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        months.add(`${year}-${month}`);
    });

    return Array.from(months)
        .sort((a, b) => {
            const [yearA, monthA] = a.split('-').map(Number);
            const [yearB, monthB] = b.split('-').map(Number);
            return yearB - yearA || monthB - monthA;
        })
        .map(item => {
            const [year, month] = item.split('-').map(Number);
            return { year, month };
        });
}

/**
 * Получить доступные дни для конкретного месяца
 */
export function getAvailableDays(records, year, month) {
    const days = new Set();
    records.forEach(record => {
        const date = new Date(record.date);
        if (date.getFullYear() === year && date.getMonth() + 1 === month) {
            days.add(date.getDate());
        }
    });

    return Array.from(days).sort((a, b) => a - b);
}

/**
 * Фильтрация по месяцу
 */
export function filterByMonth(records, year, month) {
    return records.filter(record => {
        const date = new Date(record.date);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
}
