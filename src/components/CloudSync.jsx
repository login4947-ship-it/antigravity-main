import { useState, useEffect } from 'react';
import Icons from './Icons';
import { saveToCloud, fetchFromCloud, FIREBASE_URL, getBackupsList, restoreFromBackup, checkFirebaseConnection } from '../utils/firebaseSync';
import { useLanguage } from '../context/LanguageContext';

function CloudSync({ records, onSyncLoad, readOnly = false, collectionName = 'Income' }) {
    const { t } = useLanguage();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [status, setStatus] = useState(null); // 'success', 'error'
    const [message, setMessage] = useState('');
    const [backups, setBackups] = useState([]);
    const [showBackups, setShowBackups] = useState(false);
    const [connectionError, setConnectionError] = useState('');

    // Загрузить список бэкапов только если пользователь админ
    useEffect(() => {
        if (!readOnly && showBackups) {
            loadBackups();
        }
    }, [showBackups, readOnly]);

    const loadBackups = async () => {
        try {
            const list = await getBackupsList();
            setBackups(list);
        } catch (err) {
            console.error('Failed to load backups list:', err);
        }
    };

    const handleSaveToCloud = async () => {
        if (readOnly) return;

        setIsSaving(true);
        setStatus(null);
        try {
            await saveToCloud(records, collectionName);
            setStatus('success');
            setMessage(t('syncSuccess'));
        } catch (err) {
            setStatus('error');
            setMessage(err?.message || t('syncError'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleCheckConnection = async () => {
        setConnectionError('');
        const result = await checkFirebaseConnection();
        if (result.ok) {
            setMessage('Подключение к базе успешно. URL: ' + result.url);
            setStatus('success');
        } else {
            setConnectionError(result.message || 'Ошибка подключения');
            setStatus('error');
            setMessage(result.message || t('syncError'));
        }
    };

    const handleLoadFromCloud = async () => {
        if (!window.confirm(t('syncConfirmLoad'))) {
            return;
        }

        setIsLoading(true);
        setStatus(null);
        try {
            const cloudData = await fetchFromCloud(collectionName);

            // Handle Firebase object vs array
            let dataToLoad = [];
            if (Array.isArray(cloudData)) {
                dataToLoad = cloudData.filter(i => i); // remove empty/null
            } else if (cloudData && typeof cloudData === 'object') {
                dataToLoad = Object.values(cloudData);
            }

            if (dataToLoad.length > 0) {
                onSyncLoad(dataToLoad);
                setStatus('success');
                setMessage(t('syncSuccess'));
            } else {
                // It's possible the DB is just empty or has no node yet
                setStatus('success');
                setMessage(t('syncSuccess') + ' (Empty)');
            }
        } catch (err) {
            setStatus('error');
            setMessage(err?.message || t('syncError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestoreBackup = async (dateKey) => {
        if (!window.confirm(`Вы уверены, что хотите восстановить данные из бэкапа за ${dateKey}? Это заменит текущие данные в соответствующей коллекции.`)) {
            return;
        }

        setIsBackingUp(true);
        setStatus(null);
        setShowBackups(false);
        try {
            const backup = await restoreFromBackup(dateKey);

            // Определяем какие данные восстанавливать на основе collectionName
            // Бэкап содержит всю базу MASTER
            const dataToRestore = backup.data[collectionName];

            if (dataToRestore) {
                let formattedData = [];
                if (Array.isArray(dataToRestore)) {
                    formattedData = dataToRestore.filter(i => i);
                } else if (typeof dataToRestore === 'object') {
                    formattedData = Object.values(dataToRestore);
                }

                onSyncLoad(formattedData);
                setStatus('success');
                setMessage(`Данные успешно восстановлены из бэкапа за ${dateKey}`);
            } else {
                setStatus('error');
                setMessage(`В бэкапе не найдены данные для ${collectionName}`);
            }
        } catch (err) {
            setStatus('error');
            setMessage('Ошибка при восстановлении данных из бэкапа');
        } finally {
            setIsBackingUp(false);
        }
    };

    return (
        <div className="card fade-in">
            <div className="card-header">
                <h2 className="card-title">
                    <span className="icon">
                        <Icons.Cloud size={20} />
                    </span>
                    {t('syncTitle')}
                </h2>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                {!readOnly && (
                    <>
                        <button
                            className="btn btn-primary"
                            onClick={handleSaveToCloud}
                            disabled={isSaving || isLoading || isBackingUp}
                            style={{ flex: 1, minWidth: '100px' }}
                        >
                            {isSaving ? <Icons.Refresh size={18} className="spin" /> : <Icons.Save size={18} />}
                            {t('syncSaveBtn')}
                        </button>

                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowBackups(!showBackups)}
                            disabled={isSaving || isLoading || isBackingUp}
                            style={{ flex: 1, minWidth: '100px' }}
                        >
                            <Icons.History size={18} />
                            Бэкап
                        </button>
                    </>
                )}

                <button
                    className={`btn ${readOnly ? 'btn-primary btn-block' : 'btn-secondary'}`}
                    onClick={handleLoadFromCloud}
                    disabled={isSaving || isLoading || isBackingUp}
                    style={readOnly ? {} : { flex: 1, minWidth: '100px' }}
                >
                    {isLoading ? <Icons.Refresh size={18} className="spin" /> : <Icons.Refresh size={18} />}
                    {t('syncLoadBtn')}
                </button>

                <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={handleCheckConnection}
                    title="Проверить подключение к Firebase"
                    style={{ minWidth: '100px' }}
                >
                    <Icons.Cloud size={18} />
                    Проверить
                </button>
            </div>

            {connectionError && (
                <div className="fade-in" style={{ marginTop: '12px', padding: '10px', fontSize: '0.8125rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--danger)' }}>
                    <strong>Подключение:</strong> {connectionError}
                </div>
            )}

            {/* Выпадающий список бэкапов */}
            {showBackups && (
                <div className="fade-in" style={{
                    marginTop: '12px',
                    padding: '8px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', padding: '0 4px' }}>
                        Доступные копии:
                    </div>
                    {backups.length === 0 ? (
                        <div style={{ padding: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Загрузка списка...</div>
                    ) : (
                        backups.map(date => (
                            <button
                                key={date}
                                onClick={() => handleRestoreBackup(date)}
                                className="btn btn-ghost btn-block btn-sm"
                                style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '8px 12px' }}
                            >
                                <Icons.Calendar size={14} style={{ marginRight: '8px' }} />
                                {date}
                            </button>
                        ))
                    )}
                </div>
            )}

            {status && (
                <div
                    className="fade-in"
                    style={{
                        marginTop: '16px',
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8125rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: status === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: status === 'success' ? 'var(--success)' : 'var(--danger)',
                        border: `1px solid ${status === 'success' ? 'var(--success)' : 'var(--danger)'}`
                    }}
                >
                    {status === 'success' ? <Icons.Check size={16} /> : <Icons.Alert size={16} />}
                    <span style={{ flex: 1 }}>{message}</span>
                </div>
            )}
        </div>
    );
}

export default CloudSync;

