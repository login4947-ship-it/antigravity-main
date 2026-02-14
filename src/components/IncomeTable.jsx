import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';
import { formatCurrency } from '../utils/formatUtils';
import Icons, { EditIcon, TrashIcon, TrophyIcon, ListIcon } from './Icons';
import { ExecutorBadges } from './ExecutorSelect';
import { WorkTypeBadge } from './WorkTypeSelect';
import { useLanguage } from '../context/LanguageContext';
import { useRecords } from '../hooks/useRecords';
import { findMatchingBookings } from '../utils/clientMatch';
import ConfirmDialog from './ConfirmDialog';

/**
 * Таблица записей о доходах
 */
function IncomeTable({ records = [], users = [], onEdit, onDelete, editingId, mostProfitableDate, readOnly = false, highlightRecordId }) {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { bookings } = useRecords();
    const safeRecords = Array.isArray(records) ? records : [];
    const [dialog, setDialog] = useState({ open: false, variant: 'confirm', title: '', message: '', onConfirm: null, onCancel: null });

    // Сортируем записи по дате (новые сначала)
    // Если даты одинаковые, сортируем по времени создания (новые сначала)
    // Сортируем записи по дате и времени создания для стабильности
    const sortedRecords = useMemo(() => {
        return [...safeRecords].sort((a, b) => {
            const dateA = a.date || '';
            const dateB = b.date || '';
            if (dateA !== dateB) return dateB.localeCompare(dateA);
            const timeA = a.createdAt || '';
            const timeB = b.createdAt || '';
            if (timeA !== timeB) return timeB.localeCompare(timeA);
            return (b.id || '').localeCompare(a.id || '');
        });
    }, [safeRecords]);

    const highlightRowRef = useRef(null);
    useEffect(() => {
        if (highlightRecordId && highlightRowRef.current) {
            highlightRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [highlightRecordId]);

    const handleDeleteClick = (e, record) => {
        e.stopPropagation();
        setDialog({
            open: true,
            variant: 'confirm',
            title: t('delete'),
            message: `${t('confirmDelete')} (${record.date}, ${formatCurrency(record.amount)})`,
            confirmLabel: t('delete'),
            onConfirm: () => {
                setDialog((d) => ({ ...d, open: false }));
                onDelete(record.id);
            },
            onCancel: () => setDialog((d) => ({ ...d, open: false }))
        });
    };

    const handleGoToClientCard = (record) => {
        const client = record?.client;
        if (!client || (!client.name && !client.phone)) return;
        const matching = findMatchingBookings(bookings, client);
        if (matching.length === 0) {
            setDialog({
                open: true,
                variant: 'alert',
                title: 'Не найдено',
                message: 'Карточка записи клиента с такими данными (имя, телефон) не найдена.',
                onConfirm: () => setDialog((d) => ({ ...d, open: false }))
            });
            return;
        }
        const target = matching[0];
        const message =
            matching.length === 1
                ? 'Перейти в карточку записи клиента на другой странице?'
                : `Найдено записей клиента: ${matching.length}. Перейти в карточку на другой странице?`;
        setDialog({
            open: true,
            variant: 'confirm',
            title: 'Переход',
            message,
            confirmLabel: 'Перейти',
            onConfirm: () => {
                setDialog((d) => ({ ...d, open: false }));
                navigate('/booking', { state: { highlightBookingId: target.id } });
            },
            onCancel: () => setDialog((d) => ({ ...d, open: false }))
        });
    };

    if (safeRecords.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">
                    <ListIcon size={64} style={{ opacity: 0.5 }} />
                </div>
                <div className="empty-state-title">{t('tableEmpty')}</div>
                <div className="empty-state-text">
                    {t('tableEmptySub')}
                </div>
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th style={{ width: '90px' }}>{t('tableDate')}</th>
                        <th style={{ width: '100px' }}>{t('tableAmount')}</th>
                        <th style={{ width: '130px' }}>{t('carBrand')}</th>
                        <th style={{ width: '240px' }}>{t('tableWorkType')}</th>
                        <th style={{ width: '200px' }}>{t('tableExecutors')}</th>
                        <th style={{ minWidth: '200px' }}>{t('tableComment')}</th>
                        {!readOnly && <th style={{ width: '80px' }}>{t('tableActions')}</th>}
                    </tr>
                </thead>
                <tbody>
                    {sortedRecords.map((record) => {
                        const isEditing = record.id === editingId;
                        const isMostProfitable = record.date === mostProfitableDate && mostProfitableDate;
                        const hasClientInfo = record.client && (record.client.name || record.client.phone);

                        return (
                            <tr
                                key={record.id}
                                ref={record.id === highlightRecordId ? highlightRowRef : null}
                                className={`${isEditing ? 'editing' : ''} ${isMostProfitable ? 'highlight' : ''} ${record.id === highlightRecordId ? 'highlight' : ''}`}
                                onClick={(e) => {
                                    if (e.target.closest('.table-actions')) return;
                                    if (hasClientInfo) handleGoToClientCard(record);
                                }}
                                style={{ cursor: hasClientInfo ? 'pointer' : 'default' }}
                            >
                                <td className="date" data-label={t('tableDate')}>
                                    {isMostProfitable && (
                                        <span title={t('statsBestDay')} style={{ marginRight: '4px', display: 'inline-flex', verticalAlign: 'middle' }}>
                                            <TrophyIcon size={14} style={{ color: 'var(--warning)' }} />
                                        </span>
                                    )}
                                    {formatDate(record.date)}
                                </td>
                                <td className="amount" data-label={t('tableAmount')}>
                                    {formatCurrency(record.amount)}
                                </td>
                                <td data-label={t('carBrand')} style={{ position: 'relative' }}>
                                    <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {record.carBrand || '—'}
                                        {hasClientInfo && (
                                            <div style={{
                                                width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)',
                                                opacity: 0.7
                                            }}></div>
                                        )}
                                    </div>
                                    {record.vin && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{record.vin}</div>}
                                </td>
                                <td data-label={t('tableWorkType')}>
                                    <WorkTypeBadge workTypeId={record.workType} />
                                </td>
                                <td data-label={t('tableExecutors')}>
                                    <ExecutorBadges executorIds={record.executors} users={users} />
                                </td>
                                <td className="comment" data-label={t('tableComment')} title={record.comment || '—'}>
                                    {record.comment || '—'}
                                </td>
                                {!readOnly && (
                                    <td data-label={t('tableActions')} onClick={(e) => e.stopPropagation()}>
                                        <div className="table-actions">
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-icon"
                                                onClick={(e) => { e.stopPropagation(); onEdit(record); }}
                                                title={t('edit')}
                                                disabled={isEditing}
                                            >
                                                <EditIcon size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-icon"
                                                onClick={(e) => handleDeleteClick(e, record)}
                                                title={t('delete')}
                                                disabled={isEditing}
                                                style={{ color: 'var(--danger)' }}
                                            >
                                                <TrashIcon size={16} />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <ConfirmDialog
                open={dialog.open}
                variant={dialog.variant}
                title={dialog.title}
                message={dialog.message}
                confirmLabel={dialog.confirmLabel}
                onConfirm={dialog.onConfirm}
                onCancel={dialog.onCancel}
            />
        </div>
    );
}

export default IncomeTable;
