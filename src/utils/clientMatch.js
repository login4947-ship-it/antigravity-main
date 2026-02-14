/**
 * Нормализация и сравнение клиентов по имени и номеру телефона.
 * Используется для перехода между карточкой дохода и записью клиента.
 */

function normalizeName(str) {
    return (str || '').trim().toLowerCase();
}

function normalizePhone(str) {
    return (str || '').replace(/\D/g, '');
}

/**
 * Проверяет, совпадают ли два клиента (по имени и/или телефону).
 * Совпадение: оба поля совпадают после нормализации.
 * Если у одной стороны поле пустое — считаем совпадением по другому полю.
 * Хотя бы одно из полей (имя или телефон) должно быть задано у обоих.
 */
export function isSameClient(clientA, clientB) {
    const nameA = normalizeName(clientA?.name ?? clientA?.clientName ?? '');
    const nameB = normalizeName(clientB?.name ?? clientB?.clientName ?? '');
    const phoneA = normalizePhone(clientA?.phone ?? clientA?.clientPhone ?? '');
    const phoneB = normalizePhone(clientB?.phone ?? clientB?.clientPhone ?? '');

    const hasAnyA = nameA !== '' || phoneA !== '';
    const hasAnyB = nameB !== '' || phoneB !== '';
    if (!hasAnyA || !hasAnyB) return false;

    const nameMatch = nameA === '' || nameB === '' || nameA === nameB;
    const phoneMatch = phoneA === '' || phoneB === '' || phoneA === phoneB;
    return nameMatch && phoneMatch;
}

/**
 * Находит записи клиентов (bookings), соответствующие клиенту из карточки дохода.
 * @param {Array} bookings - массив записей клиентов { clientName, clientPhone, id }
 * @param {{ name, phone }} client - клиент из записи дохода
 * @returns {Array} массив подходящих booking
 */
export function findMatchingBookings(bookings, client) {
    if (!bookings || !Array.isArray(bookings) || !client) return [];
    return bookings.filter((b) =>
        isSameClient(
            { name: client.name, phone: client.phone },
            { clientName: b.clientName, clientPhone: b.clientPhone }
        )
    );
}

/**
 * Находит записи доходов (records), соответствующие клиенту по имени и телефону.
 * @param {Array} records - массив записей доходов { client: { name, phone }, id }
 * @param {string} clientName
 * @param {string} clientPhone
 * @returns {Array} массив подходящих record
 */
export function findMatchingRecords(records, clientName, clientPhone) {
    if (!records || !Array.isArray(records)) return [];
    const source = { clientName: clientName || '', clientPhone: clientPhone || '' };
    return records.filter((r) =>
        isSameClient(source, r.client || { name: '', phone: '' })
    );
}
