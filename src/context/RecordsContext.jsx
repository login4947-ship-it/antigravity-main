import React, { createContext, useEffect, useState, useCallback, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { saveToCloud, fetchFromCloud } from '../utils/firebaseSync';
import { useAuth } from './AuthContext';

export const RecordsContext = createContext(null);

const ensureArray = (value, fallback = []) => (Array.isArray(value) ? value : fallback);

export const RecordsProvider = ({ children }) => {
    const { isAuthenticated, currentUser } = useAuth();

    // State for records (нормализуем к массиву на случай повреждённых данных в localStorage)
    const [storedRecords, setRecords] = useLocalStorage('autoservice-income-records', []);
    const [storedBookings, setBookings] = useLocalStorage('autoservice-bookings', []);
    const [storedPrices, setPrices] = useLocalStorage('autoservice-prices', []);
    const records = ensureArray(storedRecords);
    const bookings = ensureArray(storedBookings);
    const prices = ensureArray(storedPrices);

    // Sync status
    const [isInitialLoading, setIsInitialLoading] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(null);

    // Flag to prevent redundant loads
    const hasLoadedRef = useRef(false);

    // Initial Load from Cloud
    const loadFromCloud = useCallback(async (force = false) => {
        if (!isAuthenticated || (hasLoadedRef.current && !force)) return;

        setIsInitialLoading(true);
        console.log('[RecordsContext] Starting cloud load...');

        try {
            const [cloudRecords, cloudBookings, cloudPrices] = await Promise.all([
                fetchFromCloud('Income'),
                fetchFromCloud('Bookings'),
                fetchFromCloud('Prices')
            ]);

            // Сливаем с текущим состоянием, чтобы не потерять локальные изменения, сделанные во время загрузки
            const mergeWithCloud = (current, cloud) => {
                const curr = ensureArray(current);
                const fromCloud = ensureArray(cloud);
                if (fromCloud.length === 0) return curr;
                const cloudIds = new Set(fromCloud.map((x) => x.id));
                const localOnly = curr.filter((x) => !cloudIds.has(x.id));
                return [...fromCloud, ...localOnly];
            };

            if (cloudRecords && Array.isArray(cloudRecords)) {
                setRecords((prev) => mergeWithCloud(prev, cloudRecords));
            }
            if (cloudBookings && Array.isArray(cloudBookings)) {
                setBookings((prev) => mergeWithCloud(prev, cloudBookings));
            }
            if (cloudPrices && Array.isArray(cloudPrices)) {
                setPrices((prev) => mergeWithCloud(prev, cloudPrices));
            }

            setLastSyncTime(new Date());
            hasLoadedRef.current = true;
            console.log('[RecordsContext] Load completed successfully');
        } catch (error) {
            console.error('[RecordsContext] Failed to load from cloud:', error);
        } finally {
            setIsInitialLoading(false);
        }
    }, [isAuthenticated, setRecords, setBookings, setPrices]);

    // Perform load on login (ошибка загрузки не должна ломать приложение)
    useEffect(() => {
        if (isAuthenticated && !hasLoadedRef.current) {
            loadFromCloud().catch((err) => {
                console.warn('[RecordsContext] Initial cloud load failed:', err);
                setIsInitialLoading(false);
            });
        } else if (!isAuthenticated) {
            hasLoadedRef.current = false; // Reset on logout
        }
    }, [isAuthenticated, loadFromCloud]);

    // Income Methods
    const addRecord = useCallback((record) => {
        const newRecord = {
            ...record,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            createdAt: new Date().toISOString()
        };
        setRecords(prev => [...ensureArray(prev), newRecord]);
        return newRecord;
    }, [setRecords]);

    const updateRecord = useCallback((id, updates) => {
        setRecords(prev => ensureArray(prev).map(record =>
            record.id === id
                ? { ...record, ...updates, updatedAt: new Date().toISOString() }
                : record
        ));
    }, [setRecords]);

    const deleteRecord = useCallback((id) => {
        setRecords(prev => ensureArray(prev).filter(record => record.id !== id));
    }, [setRecords]);

    // Booking Methods
    const addBooking = useCallback((booking) => {
        const newBooking = {
            ...booking,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            createdAt: new Date().toISOString(),
            status: booking.status || 'pending'
        };
        setBookings(prev => [...ensureArray(prev), newBooking]);
        return newBooking;
    }, [setBookings]);

    const updateBooking = useCallback((id, updates) => {
        setBookings(prev => ensureArray(prev).map(item =>
            item.id === id
                ? { ...item, ...updates, updatedAt: new Date().toISOString() }
                : item
        ));
    }, [setBookings]);

    const deleteBooking = useCallback((id) => {
        setBookings(prev => ensureArray(prev).filter(item => item.id !== id));
    }, [setBookings]);

    // Price Methods
    const addPrice = useCallback((priceData) => {
        const newPrice = {
            workType: priceData?.workType ?? '',
            carBrand: priceData?.carBrand ?? '',
            price: priceData?.price != null ? String(priceData.price).trim() : '',
            comment: priceData?.comment != null ? String(priceData.comment).trim() : '',
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            createdAt: new Date().toISOString()
        };
        setPrices(prev => [...ensureArray(prev), newPrice]);
        return newPrice;
    }, [setPrices]);

    const updatePrice = useCallback((id, updates) => {
        setPrices(prev => ensureArray(prev).map(item =>
            item.id === id
                ? { ...item, ...updates, updatedAt: new Date().toISOString() }
                : item
        ));
    }, [setPrices]);

    const deletePrice = useCallback((id) => {
        setPrices(prev => ensureArray(prev).filter(item => item.id !== id));
    }, [setPrices]);

    // Auto-Sync Effect (не должен ломать приложение при ошибках)
    useEffect(() => {
        try {
            if (typeof window === 'undefined' || !window.location) return;
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            if (!isAuthenticated || isLocalhost) return;

            const syncData = async (data, collectionName) => {
                try {
                    await saveToCloud(data, collectionName);
                    console.log(`[RecordsContext] Auto-sync: ${collectionName} updated`);
                } catch (err) {
                    console.error(`[RecordsContext] Auto-sync failure: ${collectionName}`, err);
                }
            };

            const timeoutRecords = setTimeout(() => syncData(records, 'Income'), 2000);
            const timeoutBookings = setTimeout(() => syncData(bookings, 'Bookings'), 2000);
            const timeoutPrices = setTimeout(() => syncData(prices, 'Prices'), 2000);

            return () => {
                clearTimeout(timeoutRecords);
                clearTimeout(timeoutBookings);
                clearTimeout(timeoutPrices);
            };
        } catch (_) { /* ignore */ }
    }, [records, bookings, prices, isAuthenticated]);

    const value = React.useMemo(() => ({
        records,
        setRecords,
        addRecord,
        updateRecord,
        deleteRecord,
        bookings,
        setBookings,
        addBooking,
        updateBooking,
        deleteBooking,
        prices,
        setPrices,
        addPrice,
        updatePrice,
        deletePrice,
        isInitialLoading,
        lastSyncTime,
        refreshData: () => loadFromCloud(true)
    }), [
        records, setRecords, addRecord, updateRecord, deleteRecord,
        bookings, setBookings, addBooking, updateBooking, deleteBooking,
        prices, setPrices, addPrice, updatePrice, deletePrice,
        isInitialLoading, lastSyncTime, loadFromCloud
    ]);

    return (
        <RecordsContext.Provider value={value}>
            {children}
        </RecordsContext.Provider>
    );
};
