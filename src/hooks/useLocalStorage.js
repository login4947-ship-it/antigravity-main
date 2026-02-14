import { useState, useEffect, useCallback } from 'react';

/**
 * Хук для работы с localStorage с автоматической сериализацией JSON
 * @param {string} key - Ключ в localStorage
 * @param {*} initialValue - Начальное значение
 * @returns {[*, Function]} - [значение, функция установки]
 */
export function useLocalStorage(key, initialValue) {
    // Получаем начальное значение из localStorage или используем initialValue
    const [storedValue, setStoredValue] = useState(() => {
        try {
            if (typeof window === 'undefined' || !window.localStorage) return initialValue;
            const item = window.localStorage.getItem(key);
            return item != null && item !== '' ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Ошибка чтения из localStorage для ключа "${key}":`, error);
            return initialValue;
        }
    });

    // Сохраняем в localStorage при изменении значения
    useEffect(() => {
        try {
            if (typeof window === 'undefined' || !window.localStorage) return;
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.warn(`Ошибка записи в localStorage для ключа "${key}":`, error);
        }
    }, [key, storedValue]);

    // Мемоизированная функция установки значения
    const setValue = useCallback((value) => {
        try {
            setStoredValue(prev => {
                const valueToStore = value instanceof Function ? value(prev) : value;
                if (typeof window !== 'undefined' && window.localStorage) {
                    try {
                        window.localStorage.setItem(key, JSON.stringify(valueToStore));
                    } catch (e) {
                        console.warn(`Ошибка записи в localStorage для ключа "${key}":`, e);
                    }
                }
                return valueToStore;
            });
        } catch (error) {
            console.warn(`Ошибка установки значения в localStorage для ключа "${key}":`, error);
        }
    }, [key]);

    return [storedValue, setValue];
}

/**
 * Хук для работы с записями о доходах
 * @returns {Object} - Методы и данные для работы с записями
 */
export function useIncomeRecords() {
    const [records, setRecords] = useLocalStorage('autoservice-income-records', []);

    // Добавить новую запись
    const addRecord = useCallback((record) => {
        const newRecord = {
            ...record,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            createdAt: new Date().toISOString()
        };
        setRecords(prev => [...prev, newRecord]);
        return newRecord;
    }, [setRecords]);

    // Обновить запись
    const updateRecord = useCallback((id, updates) => {
        setRecords(prev => prev.map(record =>
            record.id === id
                ? { ...record, ...updates, updatedAt: new Date().toISOString() }
                : record
        ));
    }, [setRecords]);

    // Удалить запись
    const deleteRecord = useCallback((id) => {
        setRecords(prev => prev.filter(record => record.id !== id));
    }, [setRecords]);

    // Получить запись по ID
    const getRecord = useCallback((id) => {
        return records.find(record => record.id === id);
    }, [records]);

    // Очистить все записи
    const clearAllRecords = useCallback(() => {
        setRecords([]);
    }, [setRecords]);

    return {
        records,
        addRecord,
        updateRecord,
        deleteRecord,
        getRecord,
        clearAllRecords,
        setRecords
    };
}

/**
 * Хук для работы с записями клиентов (бронирование)
 * @returns {Object}
 */
export function useBookingRecords() {
    const [bookings, setBookings] = useLocalStorage('autoservice-bookings', []);

    const addBooking = useCallback((booking) => {
        const newBooking = {
            ...booking,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            createdAt: new Date().toISOString(),
            status: booking.status || 'pending' // pending, in-progress, done, not-done, cancelled
        };
        setBookings(prev => [...prev, newBooking]);
        return newBooking;
    }, [setBookings]);

    const updateBooking = useCallback((id, updates) => {
        setBookings(prev => prev.map(item =>
            item.id === id
                ? { ...item, ...updates, updatedAt: new Date().toISOString() }
                : item
        ));
    }, [setBookings]);

    const deleteBooking = useCallback((id) => {
        setBookings(prev => prev.filter(item => item.id !== id));
    }, [setBookings]);

    return {
        bookings,
        addBooking,
        updateBooking,
        deleteBooking,
        setBookings
    };
}

export default useLocalStorage;
