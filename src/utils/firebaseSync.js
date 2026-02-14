// База: https://console.firebase.google.com/project/autoservice-db5e3/database/autoservice-db5e3-default-rtdb/data
// URL для REST API (без слэша в конце). Если 404 — скопируй URL со страницы базы в консоли или из Project Settings.
const DEFAULT_FIREBASE_URL = 'https://autoservice-db5e3-default-rtdb.firebaseio.com';
const fromEnv = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_URL?.trim?.()) || '';
export const FIREBASE_URL = (fromEnv || DEFAULT_FIREBASE_URL).replace(/\/+$/, '');

// Определение среды (Localhost -> TEST, остальное -> MASTER)
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const DB_NAME = isLocalhost ? 'TEST' : 'MASTER';
const BACKUP_DB_NAME = 'BACKUP';

/** Три ветки в одной Realtime Database: MASTER (продакшен), TEST (localhost), BACKUP (бэкапы) */
export const DATABASE_BRANCHES = ['MASTER', 'TEST', 'BACKUP'];

/**
 * Проверить подключение к Firebase. Показывает причину, если база не видна.
 * @returns {{ ok: boolean, message?: string, status?: number, url: string }}
 */
export async function checkFirebaseConnection() {
    const url = `${FIREBASE_URL}/.json`;
    try {
        const res = await fetch(url);
        if (res.ok) return { ok: true, url: FIREBASE_URL };
        if (res.status === 404) {
            return { ok: false, status: 404, url: FIREBASE_URL, message: 'Realtime Database не создана. В консоли: Build → Realtime Database → Create Database. Убедитесь, что открыт раздел Realtime Database, а не Firestore.' };
        }
        if (res.status === 401) {
            return { ok: false, status: 401, url: FIREBASE_URL, message: 'Доступ запрещён. Realtime Database → Rules: разрешите read/write (например test mode).' };
        }
        return { ok: false, status: res.status, url: FIREBASE_URL, message: `Ошибка ${res.status}. Проверьте URL базы в .env (VITE_FIREBASE_URL).` };
    } catch (err) {
        return { ok: false, url: FIREBASE_URL, message: (err.message || 'Сеть недоступна') + '. Проверьте URL в .env и что Realtime Database создана (не Firestore).' };
    }
}

if (typeof window !== 'undefined') {
    console.log(`[Firebase] Connection established. Using ${DB_NAME} database branch.`);
    if (isLocalhost) console.warn('[Firebase] Running on localhost. MASTER database is protected and isolated.');
}

/**
 * Загрузить данные из коллекции (аналог листа)
 * @param {string} collectionName - имя коллекции (например, 'Income', 'Users')
 */
export async function fetchFromCloud(collectionName = 'Income') {
    try {
        const fetchUrl = `${FIREBASE_URL}/${DB_NAME}/${collectionName}.json`;
        console.log(`Fetching from: ${fetchUrl}`);

        const response = await fetch(fetchUrl);

        if (response.status === 401) {
            throw new Error('Доступ запрещен (401). В Firebase Console: Realtime Database → Rules — разрешите read/write.');
        }
        if (response.status === 404) {
            throw new Error('База не найдена (404). Создайте Realtime Database: Firebase Console → Build → Realtime Database → Create Database.');
        }
        if (!response.ok) throw new Error(`Ошибка сети: ${response.status}`);

        const data = await response.json();
        // Firebase returns null if no data exists
        return data || [];
    } catch (error) {
        console.error(`Ошибка при загрузке из Firebase (${collectionName}):`, error);
        throw error;
    }
}

/**
 * Сохранить данные в коллекцию
 * @param {Array|Object} data - данные для сохранения
 * @param {string} collectionName - имя коллекции
 */
export async function saveToCloud(data, collectionName = 'Income') {
    try {
        const saveUrl = `${FIREBASE_URL}/${DB_NAME}/${collectionName}.json`;

        const response = await fetch(saveUrl, {
            method: 'PUT', // PUT replaces the data at the location
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 401) {
            throw new Error('Доступ запрещен (401). В Firebase Console: Realtime Database → Rules — разрешите read/write.');
        }
        if (response.status === 404) {
            throw new Error('База не найдена (404). Создайте Realtime Database: Firebase Console → Build → Realtime Database → Create Database.');
        }
        if (!response.ok) throw new Error(`Ошибка при отправке: ${response.status}`);
        return true;
    } catch (error) {
        console.error(`Ошибка при сохранении в Firebase (${collectionName}):`, error);
        throw error;
    }
}

// ============================================
// BACKUP SYSTEM
// ============================================

const BACKUP_HOUR = 1; // 1:00 ночи
const LAST_BACKUP_KEY = 'antigravity_last_backup';

/**
 * Получить дату последнего бэкапа
 */
function getLastBackupDate() {
    const stored = localStorage.getItem(LAST_BACKUP_KEY);
    return stored ? new Date(stored) : null;
}

/**
 * Сохранить дату последнего бэкапа
 */
function setLastBackupDate(date) {
    localStorage.setItem(LAST_BACKUP_KEY, date.toISOString());
}

/**
 * Проверить, нужно ли делать бэкап
 * Условия: прошло более 24 часов с последнего бэкапа ИЛИ сейчас время около 1:00 и сегодня ещё не было бэкапа
 */
function shouldRunBackup() {
    const now = new Date();
    const lastBackup = getLastBackupDate();

    if (!lastBackup) {
        console.log('[Backup] No previous backup found, backup needed');
        return true;
    }

    const hoursSinceBackup = (now - lastBackup) / (1000 * 60 * 60);

    // Если прошло более 24 часов
    if (hoursSinceBackup >= 24) {
        console.log(`[Backup] ${hoursSinceBackup.toFixed(1)} hours since last backup, backup needed`);
        return true;
    }

    // Если сейчас время между 1:00 и 2:00 и последний бэкап был до 1:00 сегодня
    const currentHour = now.getHours();
    if (currentHour === BACKUP_HOUR) {
        const todayBackupTime = new Date(now);
        todayBackupTime.setHours(BACKUP_HOUR, 0, 0, 0);

        if (lastBackup < todayBackupTime) {
            console.log('[Backup] Scheduled backup time reached, backup needed');
            return true;
        }
    }

    return false;
}

/**
 * Копировать всю базу MASTER в BACKUP
 */
async function performBackup() {
    // Только для production (MASTER)
    if (DB_NAME !== 'MASTER') {
        console.log('[Backup] Skipping backup in TEST environment');
        return false;
    }

    try {
        console.log('[Backup] Starting backup of MASTER database...');

        // Загружаем все данные из MASTER
        const masterUrl = `${FIREBASE_URL}/MASTER.json`;
        const response = await fetch(masterUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch MASTER data: ${response.status}`);
        }

        const masterData = await response.json();

        if (!masterData) {
            console.log('[Backup] MASTER database is empty, skipping backup');
            return false;
        }

        // Создаём метаданные бэкапа
        const backupData = {
            timestamp: new Date().toISOString(),
            data: masterData
        };

        // Сохраняем в BACKUP с текущей датой
        const dateKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const backupUrl = `${FIREBASE_URL}/${BACKUP_DB_NAME}/${dateKey}.json`;

        const saveResponse = await fetch(backupUrl, {
            method: 'PUT',
            body: JSON.stringify(backupData),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!saveResponse.ok) {
            throw new Error(`Failed to save backup: ${saveResponse.status}`);
        }

        // Обновляем последнюю версию бэкапа (для быстрого восстановления)
        const latestUrl = `${FIREBASE_URL}/${BACKUP_DB_NAME}/latest.json`;
        await fetch(latestUrl, {
            method: 'PUT',
            body: JSON.stringify(backupData),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        setLastBackupDate(new Date());
        console.log(`[Backup] Backup completed successfully: ${dateKey}`);
        return true;

    } catch (error) {
        console.error('[Backup] Backup failed:', error);
        return false;
    }
}

/**
 * Создать ветки MASTER, TEST, BACKUP в базе (если их ещё нет).
 * Вызывается при старте приложения — подключает и инициализирует все три базы.
 */
export async function ensureDatabaseBranches() {
    const check = await checkFirebaseConnection();
    if (!check.ok) {
        console.warn('[Firebase]', check.message, 'URL:', check.url);
        return;
    }
    for (const branch of DATABASE_BRANCHES) {
        try {
            const url = `${FIREBASE_URL}/${branch}.json`;
            const res = await fetch(url);
            if (res.status === 404) {
                console.warn('[Firebase] Realtime Database не найдена (404). Создайте её в консоли Firebase.');
                return;
            }
            if (!res.ok) continue;
            const data = await res.json();
            if (data !== null && typeof data === 'object') continue; // уже есть данные
            const putRes = await fetch(url, {
                method: 'PUT',
                body: JSON.stringify({}),
                headers: { 'Content-Type': 'application/json' },
            });
            if (putRes.ok) console.log(`[Firebase] Ветка "${branch}" создана.`);
        } catch (e) {
            console.warn(`[Firebase] Ошибка ветки "${branch}":`, e);
        }
    }
}

/**
 * Инициализация системы бэкапов
 * Вызывать при загрузке приложения
 */
export async function initBackupSystem() {
    // Проверяем нужен ли бэкап
    if (shouldRunBackup()) {
        await performBackup();
    } else {
        const lastBackup = getLastBackupDate();
        console.log(`[Backup] Last backup: ${lastBackup?.toLocaleString() || 'never'}`);
    }

    // Настраиваем проверку каждый час
    setInterval(() => {
        if (shouldRunBackup()) {
            performBackup();
        }
    }, 60 * 60 * 1000); // каждый час
}

/**
 * Получить список доступных бэкапов
 */
export async function getBackupsList() {
    try {
        const response = await fetch(`${FIREBASE_URL}/${BACKUP_DB_NAME}.json?shallow=true`);
        if (!response.ok) throw new Error('Failed to fetch backups list');
        const data = await response.json();
        return data ? Object.keys(data).filter(key => key !== 'latest').sort().reverse() : [];
    } catch (error) {
        console.error('[Backup] Failed to get backups list:', error);
        return [];
    }
}

/**
 * Восстановить данные из бэкапа
 * @param {string} dateKey - дата бэкапа (YYYY-MM-DD) или 'latest'
 */
export async function restoreFromBackup(dateKey = 'latest') {
    try {
        console.log(`[Backup] Restoring from backup: ${dateKey}`);

        const response = await fetch(`${FIREBASE_URL}/${BACKUP_DB_NAME}/${dateKey}.json`);
        if (!response.ok) throw new Error(`Backup not found: ${dateKey}`);

        const backupData = await response.json();
        if (!backupData || !backupData.data) {
            throw new Error('Invalid backup data');
        }

        return backupData;
    } catch (error) {
        console.error('[Backup] Restore failed:', error);
        throw error;
    }
}
