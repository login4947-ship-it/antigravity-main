import { formatDate, getMonthNameGenitive } from './dateUtils';
import { formatCurrency } from './formatUtils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Список исполнителей (согласовано с ExecutorSelect.jsx)
const EXECUTORS_MAP = {
    stas: 'Стас',
    zurab: 'Зураб',
    elmin: 'Эльмин',
    sergey: 'Сергей'
};

// Список типов работ (согласовано с WorkTypeSelect.jsx)
const WORK_TYPES_MAP = {
    diagnostics: 'Диагностика',
    maintenance: 'ТО (Масло/Фильтры)',
    suspension: 'Ходовая часть',
    engine: 'Двигатель',
    brakes: 'Тормозная система',
    electrical: 'Электрика',
    air_conditioning: 'Кондиционер',
    heating: 'Отопление',
    chip_tuning: 'Чип-тюнинг',
    block_repair: 'Ремонт блока',
    programming_coding: 'Программирование и кодирование',
    at_repair: 'Ремонт АКПП',
    other: 'Прочее'
};

/**
 * Получить название типа работы для отчета
 * @param {string} workTypeId - ID типа работы
 * @returns {string} Название типа работы или пустая строка
 */
function getWorkTypeNameForReport(workTypeId) {
    if (!workTypeId) return '';
    return WORK_TYPES_MAP[workTypeId] || workTypeId;
}

/**
 * Получить имена исполнителей для отчета
 * @param {Array} executorIds - Массив ID исполнителей
 * @param {Array} users - Список пользователей
 * @returns {string} Имена через запятую или пустая строка
 */
function getExecutorNamesForReport(executorIds, users = []) {
    if (!executorIds || executorIds.length === 0) return '';

    // Маппинг для обратной совместимости со старыми записями (до введения UserManagement)
    const LEGACY_MAP = {
        stas: 'Стас',
        zurab: 'Зураб',
        elmin: 'Эльмин',
        sergey: 'Сергей'
    };

    return executorIds.map(id => {
        // Сначала ищем в динамическом списке пользователей
        const user = users.find(u => u.id === id);
        if (user) return user.fullName || user.username;

        // Если не нашли, ищем в легаси маппинге
        if (LEGACY_MAP[id]) return LEGACY_MAP[id];

        // Если и там нет, и это похоже на ID (начинается с 'u'), возвращаем пустую строку или ID если совсем непонятно
        // Но по просьбе пользователя - никаких айди.
        return '';
    }).filter(name => name !== '').join(', ');
}

/**
 * Генерирует текстовый отчет за месяц
 * @param {Array} records - Массив записей
 * @param {number} year - Год
 * @param {number} month - Месяц (1-12)
 * @param {Array} users - Список пользователей
 * @returns {string} Текстовый отчет
 */
export function generateMonthlyReport(records, year, month, users = []) {
    // Фильтруем записи за указанный месяц
    // Внимание: в records дата хранится как строка YYYY-MM-DD
    const monthRecords = records.filter(record => {
        const date = new Date(record.date);
        return date.getFullYear() === year && (date.getMonth() + 1) === month;
    });

    // Сортируем по дате
    monthRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Рассчитываем итог
    const total = monthRecords.reduce((sum, record) => sum + (Number(record.amount) || 0), 0);

    // Формируем заголовок
    // getMonthNameGenitive ожидает 0-11
    const monthName = getMonthNameGenitive(month - 1);
    let report = `Автосервис — отчет за ${monthName} ${year}\n`;
    report += '═'.repeat(60) + '\n\n';

    // Формируем записи
    if (monthRecords.length === 0) {
        report += 'Нет записей за этот месяц.\n\n';
    } else {
        monthRecords.forEach(record => {
            const dateStr = formatDate(record.date);
            const amountStr = formatCurrency(record.amount);
            const workType = getWorkTypeNameForReport(record.workType);
            const workTypePart = workType ? ` (${workType})` : '';
            const executors = getExecutorNamesForReport(record.executors, users);
            const executorsPart = executors ? ` [${executors}]` : '';
            const comment = record.comment ? ` — ${record.comment}` : '';
            report += `${dateStr} — ${amountStr}${workTypePart}${executorsPart}${comment}\n`;
        });
        report += '\n';
    }

    // Формируем итог
    report += '═'.repeat(60) + '\n';
    report += `ИТОГО ЗА МЕСЯЦ: ${formatCurrency(total)}\n`;

    return report;
}

/**
 * Генерирует полный отчет по всем записям
 * @param {Array} records - Массив записей
 * @param {Array} users - Список пользователей
 * @returns {string} Текстовый отчет
 */
export function generateFullReport(records, users = []) {
    if (records.length === 0) {
        return 'Нет записей для экспорта.';
    }

    // Группируем записи по месяцам
    const grouped = {};
    records.forEach(record => {
        const date = new Date(record.date);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (!grouped[key]) {
            grouped[key] = {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                records: []
            };
        }
        grouped[key].records.push(record);
    });

    // Сортируем месяцы
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
        const [yearA, monthA] = a.split('-').map(Number);
        const [yearB, monthB] = b.split('-').map(Number);
        if (yearA !== yearB) return yearA - yearB;
        return monthA - monthB;
    });

    // Генерируем отчет
    let report = 'АВТОСЕРВИС — ПОЛНЫЙ ОТЧЕТ\n';
    report += '═'.repeat(60) + '\n';
    report += `Дата формирования: ${formatDate(new Date().toISOString().split('T')[0])}\n\n`;

    let grandTotal = 0;

    sortedKeys.forEach(key => {
        const { year, month, records: monthRecords } = grouped[key];
        const monthTotal = monthRecords.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
        grandTotal += monthTotal;

        const monthName = getMonthNameGenitive(month - 1);
        report += `\n▌ ${monthName.toUpperCase()} ${year}\n`;
        report += '─'.repeat(50) + '\n';

        // Сортируем записи по дате
        monthRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

        monthRecords.forEach(record => {
            const dateStr = formatDate(record.date);
            const amountStr = formatCurrency(record.amount);
            const workType = getWorkTypeNameForReport(record.workType);
            const workTypePart = workType ? ` (${workType})` : '';
            const executors = getExecutorNamesForReport(record.executors, users);
            const executorsPart = executors ? ` [${executors}]` : '';
            const comment = record.comment ? ` — ${record.comment}` : '';
            report += `  ${dateStr} — ${amountStr}${workTypePart}${executorsPart}${comment}\n`;
        });

        report += `  Итого за ${monthName}: ${formatCurrency(monthTotal)}\n`;
    });

    report += '\n' + '═'.repeat(60) + '\n';
    report += `ОБЩИЙ ИТОГ: ${formatCurrency(grandTotal)}\n`;

    return report;
}

/**
 * Генерирует отчет за произвольный период
 * @param {Array} records - Массив записей
 * @param {string} startDate - Начало периода (YYYY-MM-DD)
 * @param {string} endDate - Конец периода (YYYY-MM-DD)
 * @param {Array} users - Список пользователей
 * @returns {string} Текстовый отчет
 */
export function generatePeriodReport(records, startDate, endDate, users = []) {
    // Фильтруем записи за указанный период
    const periodRecords = records.filter(record => {
        return record.date >= startDate && record.date <= endDate;
    });

    // Сортируем по дате
    periodRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Рассчитываем итог
    const total = periodRecords.reduce((sum, record) => sum + (Number(record.amount) || 0), 0);

    // Формируем заголовок
    let report = `Автосервис — отчет за период с ${formatDate(startDate)} по ${formatDate(endDate)}\n`;
    report += '═'.repeat(60) + '\n\n';

    // Формируем записи
    if (periodRecords.length === 0) {
        report += 'Нет записей за этот период.\n\n';
    } else {
        periodRecords.forEach(record => {
            const dateStr = formatDate(record.date);
            const amountStr = formatCurrency(record.amount);
            const carPart = record.carBrand ? ` ${record.carBrand}` : '';
            const vinPart = record.vin ? ` [${record.vin}]` : '';
            const workType = getWorkTypeNameForReport(record.workType);
            const workTypePart = workType ? ` (${workType})` : '';
            const executors = getExecutorNamesForReport(record.executors, users);
            const executorsPart = executors ? ` [${executors}]` : '';
            const comment = record.comment ? ` — ${record.comment}` : '';
            report += `${dateStr} — ${amountStr}${carPart}${vinPart}${workTypePart}${executorsPart}${comment}\n`;
        });
        report += '\n';
    }

    // Формируем итог
    report += '═'.repeat(60) + '\n';
    report += `ОБЩИЙ ИТОГ ЗА ПЕРИОД: ${formatCurrency(total)}\n`;

    return report;
}

/**
 * Скачивает текстовый файл
 * @param {string} content - Содержимое файла
 * @param {string} filename - Имя файла
 */
export function downloadTextFile(content, filename) {
    // Добавляем BOM для корректного отображения кириллицы в Блокноте
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], { type: 'text/plain;charset=utf-8' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Экспортирует записи за месяц в .txt файл
 * @param {Array} records - Массив записей
 * @param {number} year - Год
 * @param {number} month - Месяц (1-12)
 * @param {Array} users - Список пользователей
 */
export function exportMonthToTxt(records, year, month, users = []) {
    const report = generateMonthlyReport(records, year, month, users);
    const monthName = getMonthNameGenitive(month - 1);
    const filename = `autoservice_${monthName}_${year}.txt`;
    downloadTextFile(report, filename);
}

/**
 * Экспортирует все записи в .txt файл
 * @param {Array} records - Массив записей
 * @param {Array} users - Список пользователей
 */
export function exportAllToTxt(records, users = []) {
    const report = generateFullReport(records, users);
    const filename = `autoservice_full_report_${formatDate(new Date().toISOString().split('T')[0]).replace(/\./g, '-')}.txt`;
    downloadTextFile(report, filename);
}

/**
 * Экспортирует записи за период в .txt файл
 * @param {Array} records - Массив записей
 * @param {string} startDate - Начало периода
 * @param {string} endDate - Конец периода
 * @param {Array} users - Список пользователей
 */
export function exportPeriodToTxt(records, startDate, endDate, users = []) {
    const report = generatePeriodReport(records, startDate, endDate, users);
    const filename = `autoservice_report_${startDate}_to_${endDate}.txt`;
    downloadTextFile(report, filename);
}

/**
 * Экспорт записей в PDF
 * @param {Array} records - Массив записей
 * @param {Object} options - Опции (filename, title)
 * @param {Array} users - Список пользователей
 */
export async function exportToPdf(records, options = {}, users = []) {
    const {
        filename = 'autoservice_report.pdf',
        title = 'Отчет автосервиса',
        period = '',
        executorId = null
    } = options;

    try {
        const doc = new jsPDF();

        // Попытка загрузить шрифт Roboto для поддержки кириллицы
        try {
            const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
            const response = await fetch(fontUrl);
            const fontBlob = await response.blob();
            const reader = new FileReader();

            const fontBase64 = await new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.readAsDataURL(fontBlob);
            });

            doc.addFileToVFS('Roboto-Regular.ttf', fontBase64);
            doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
            doc.setFont('Roboto');
        } catch (fontErr) {
            console.warn('Could not load Cyrillic font, using default:', fontErr);
            alert('Внимание: не удалось загрузить шрифт для кириллицы. Текст может отображаться некорректно.');
        }

        // Стили и заголовок
        doc.setFontSize(18);
        doc.text(title, 14, 20);

        if (period) {
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(period, 14, 30);
        }

        if (executorId) {
            const user = users.find(u => u.id === executorId);
            const execName = user ? (user.fullName || user.username) : 'Сотрудник';
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Сотрудник: ${execName}`, 14, 35);
        }

        // Helper для расчета суммы
        const getRecordAmount = (record) => {
            if (!executorId) return Number(record.amount) || 0;

            // Если фильтруем по сотруднику, ищем его долю
            if (record.shares && record.shares[executorId]) {
                return parseFloat(record.shares[executorId]) || 0;
            }

            // Если долей нет (старая запись), но сотрудник есть в списке -> делим поровну
            if (record.executors && record.executors.includes(executorId)) {
                return (Number(record.amount) || 0) / record.executors.length;
            }

            return 0;
        };

        // Подготовка данных для таблицы
        const tableData = records.map(record => {
            const amount = getRecordAmount(record);
            return [
                formatDate(record.date),
                formatCurrency(amount).replace(/\u00A0/g, ' '),
                record.carBrand || '—',
                getWorkTypeNameForReport(record.workType),
                getExecutorNamesForReport(record.executors, users),
                record.comment || ''
            ];
        });

        // Итоговая сумма
        const total = records.reduce((sum, r) => sum + getRecordAmount(r), 0);
        const formattedTotal = formatCurrency(total).replace(/\u00A0/g, ' ');

        // Генерация таблицы
        autoTable(doc, {
            startY: period ? 40 : 30, // Увеличиваем отступ сверху
            head: [['Дата', 'Сумма', 'Авто', 'Работа', 'Мастера', 'Комментарий']],
            body: tableData,
            foot: [['', `ИТОГО: ${formattedTotal}`, '', '', '', '']],
            theme: 'striped',
            headStyles: {
                fillColor: [102, 126, 234],
                font: 'Roboto',
                fontStyle: 'normal'
            },
            footStyles: {
                fillColor: [241, 245, 249],
                textColor: [30, 41, 59],
                font: 'Roboto',
                fontStyle: 'normal' // Убираем bold, так как мы загрузили только normal шрифт
            },
            styles: {
                fontSize: 8,
                cellPadding: 3,
                font: 'Roboto' // Применяем наш шрифт ко всей таблице
            },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 25 }, // Сумма (уменьшаем)
                2: { cellWidth: 30 },
                3: { cellWidth: 40 }, // Работа (увеличиваем для длинных названий)
                4: { cellWidth: 25 },
                5: { cellWidth: 'auto' }
            },
        });

        doc.save(filename);
    } catch (err) {
        console.error('PDF Export Error:', err);
        alert('Ошибка при создании PDF: ' + err.message);
    }
}
