/**
 * Форматирует число как денежную сумму. Если передана нечисловая строка (например "договорная") — возвращает как есть.
 * @param {number|string} amount - Сумма или текст (например "договорная", "по запросу")
 * @param {boolean} showCurrency - Показывать символ валюты (только для чисел)
 * @returns {string} Отформатированная сумма или исходный текст
 */
export function formatCurrency(amount, showCurrency = true) {
    const str = String(amount ?? '').trim();
    const num = parseFloat(str.replace(/\s/g, '').replace(',', '.'));
    if (str !== '' && isNaN(num)) {
        return str;
    }
    if (str === '' || isNaN(num)) {
        return showCurrency ? '0 BYN' : '0';
    }
    const formatted = new Intl.NumberFormat('ru-RU', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
    return showCurrency ? `${formatted} BYN` : formatted;
}

/**
 * Парсит строку с суммой в число
 * @param {string} value - Строка с суммой
 * @returns {number} Числовое значение
 */
export function parseCurrency(value) {
    // Удаляем все нечисловые символы кроме точки и запятой
    const cleaned = String(value).replace(/[^\d.,]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.round(parsed);
}

/**
 * Склонение слова "день" в зависимости от числа
 * @param {number} days - Количество дней
 * @returns {string} Правильная форма слова
 */
export function pluralizeDays(days) {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'дней';
    }

    if (lastDigit === 1) {
        return 'день';
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'дня';
    }

    return 'дней';
}

/**
 * Склонение слова "запись" в зависимости от числа
 * @param {number} count - Количество записей
 * @returns {string} Правильная форма слова
 */
export function pluralizeRecords(count) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'записей';
    }

    if (lastDigit === 1) {
        return 'запись';
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'записи';
    }

    return 'записей';
}
