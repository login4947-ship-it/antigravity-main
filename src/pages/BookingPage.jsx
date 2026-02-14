import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icons from '../components/Icons';
import CloudSync from '../components/CloudSync';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useRecords } from '../hooks/useRecords';
import { formatDate } from '../utils/dateUtils';
import { formatCurrency } from '../utils/formatUtils';
import { findMatchingRecords } from '../utils/clientMatch';
import ConfirmDialog from '../components/ConfirmDialog';

function BookingPage({ users }) {
    const { currentUser } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    // Глобальное состояние из контекста
    const { bookings, setBookings, records, addBooking, updateBooking, deleteBooking, isInitialLoading } = useRecords();

    const isAdmin = currentUser?.role === 'admin';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const highlightBookingId = location.state?.highlightBookingId ?? null;
    const highlightRowRef = useRef(null);

    useEffect(() => {
        if (highlightBookingId && highlightRowRef.current) {
            highlightRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [highlightBookingId]);

    useEffect(() => {
        if (!highlightBookingId) return;
        const t = setTimeout(() => {
            navigate(location.pathname, { replace: true, state: {} });
        }, 1500);
        return () => clearTimeout(t);
    }, [highlightBookingId, location.pathname, navigate]);

    // Form State
    const [formData, setFormData] = useState({
        clientName: '',
        clientPhone: '',
        carBrand: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        description: '',
        status: 'pending'
    });

    const handleOpenModal = (booking = null) => {
        // Разрешаем открывать модалку для новой записи всем, для редактирования только админам
        if (booking && !isAdmin) return;

        if (booking) {
            setEditingBooking(booking);
            setFormData({
                clientName: booking.clientName,
                clientPhone: booking.clientPhone,
                carBrand: booking.carBrand,
                date: booking.date,
                time: booking.time || '',
                description: booking.description,
                status: booking.status
            });
        } else {
            setEditingBooking(null);
            setFormData({
                clientName: '',
                clientPhone: '',
                carBrand: '',
                date: new Date().toISOString().split('T')[0],
                time: '',
                description: '',
                status: 'pending'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBooking(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingBooking && !isAdmin) return; // Редактировать может только админ

        if (editingBooking) {
            updateBooking(editingBooking.id, formData);
        } else {
            addBooking(formData);
        }
        handleCloseModal();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [navDialog, setNavDialog] = useState({ open: false, variant: 'confirm', title: '', message: '', onConfirm: null, onCancel: null });

    const handleDelete = (e, id) => {
        e?.stopPropagation?.();
        if (!isAdmin) return;
        setNavDialog({
            open: true,
            variant: 'confirm',
            title: 'Удаление',
            message: 'Удалить эту запись?',
            confirmLabel: 'Удалить',
            onConfirm: () => {
                setNavDialog((d) => ({ ...d, open: false }));
                deleteBooking(id);
            },
            onCancel: () => setNavDialog((d) => ({ ...d, open: false }))
        });
    };

    const handleGoToIncomeCard = (item) => {
        const matching = findMatchingRecords(records, item.clientName, item.clientPhone);
        if (matching.length === 0) {
            setNavDialog({
                open: true,
                variant: 'alert',
                title: 'Не найдено',
                message: 'Карточка дохода с такими данными клиента (имя, телефон) не найдена.',
                onConfirm: () => setNavDialog((d) => ({ ...d, open: false }))
            });
            return;
        }
        const target = matching[0];
        const message =
            matching.length === 1
                ? 'Перейти в карточку дохода на другой странице?'
                : `Найдено записей дохода по этому клиенту: ${matching.length}. Перейти в карточку на другой странице?`;
        setNavDialog({
            open: true,
            variant: 'confirm',
            title: 'Переход',
            message,
            confirmLabel: 'Перейти',
            onConfirm: () => {
                setNavDialog((d) => ({ ...d, open: false }));
                navigate('/', { state: { highlightRecordId: target.id } });
            },
            onCancel: () => setNavDialog((d) => ({ ...d, open: false }))
        });
    };

    // Sorting: Date Descending (newest first, oldest last)
    const sortedBookings = [...bookings].sort((a, b) => {
        const dateA = new Date(a.date + (a.time ? 'T' + a.time : ''));
        const dateB = new Date(b.date + (b.time ? 'T' + b.time : ''));
        return dateB - dateA;
    });

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: 'var(--warning)', color: '#000', label: 'Ожидает' },
            'in-progress': { bg: 'var(--primary)', color: '#fff', label: 'В работе' },
            done: { bg: 'var(--success)', color: '#fff', label: 'Готово' },
            'not-done': { bg: 'var(--danger)', color: '#fff', label: 'Не сделано' },
            cancelled: { bg: 'var(--text-muted)', color: '#fff', label: 'Отмена' }
        };
        const s = styles[status] || styles.pending;
        return (
            <span style={{
                padding: '4px 10px', borderRadius: '12px', background: s.bg, color: s.color,
                fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
                display: 'inline-flex', alignItems: 'center'
            }}>
                {s.label}
            </span>
        );
    };

    return (
        <div className="dashboard-container fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {isInitialLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>{t('loading')}</p>
                </div>
            )}
            <div className="dashboard-actions">
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Icons.Plus size={20} /> Записать клиента
                </button>
            </div>

            <main className="main-content" style={{ flex: 1, overflow: 'hidden' }}>
                <aside className="sidebar">
                    {isAdmin && (
                        <CloudSync
                            records={bookings}
                            onSyncLoad={setBookings}
                            collectionName="Bookings"
                        />
                    )}
                </aside>

                <div className="content-area">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">
                                <Icons.Calendar size={20} />
                                Записи клиентов ({sortedBookings.length})
                            </h2>
                        </div>

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Дата / Время</th>
                                        <th>Клиент</th>
                                        <th>Автомобиль</th>
                                        <th>Проблема / Работы</th>
                                        <th>Статус</th>
                                        <th style={{ width: '80px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                                Нет активных записей
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedBookings.map(item => {
                                            const hasClient = !!(item.clientName || item.clientPhone);
                                            return (
                                                <tr
                                                    key={item.id}
                                                    ref={item.id === highlightBookingId ? highlightRowRef : null}
                                                    style={{
                                                        opacity: item.status === 'cancelled' ? 0.6 : 1,
                                                        backgroundColor: item.id === highlightBookingId ? 'var(--primary)' : undefined,
                                                        color: item.id === highlightBookingId ? 'var(--bg-primary)' : undefined,
                                                        cursor: hasClient ? 'pointer' : 'default'
                                                    }}
                                                    onClick={(e) => {
                                                        if (e.target.closest('.table-actions')) return;
                                                        if (hasClient) handleGoToIncomeCard(item);
                                                    }}
                                                >
                                                    <td data-label="Дата / Время">
                                                        <div style={{ fontWeight: 500 }}>{formatDate(item.date)}</div>
                                                        {item.time && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.time}</div>}
                                                    </td>
                                                    <td data-label="Клиент">
                                                        <div style={{ fontWeight: 500 }}>{item.clientName}</div>
                                                        {item.clientPhone && (
                                                            <a
                                                                href={`tel:${item.clientPhone}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                style={{ fontSize: '0.8rem', color: item.id === highlightBookingId ? 'var(--bg-primary)' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                            >
                                                                <Icons.Phone size={12} /> {item.clientPhone}
                                                            </a>
                                                        )}
                                                    </td>
                                                    <td data-label="Автомобиль">{item.carBrand || '—'}</td>
                                                    <td data-label="Проблема / Работы">{item.description || '—'}</td>
                                                    <td data-label="Статус">{getStatusBadge(item.status)}</td>
                                                    <td data-label="Действия" onClick={(e) => e.stopPropagation()}>
                                                        <div className="table-actions">
                                                            {item.status === 'done' && isAdmin && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-ghost btn-icon"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate('/', { state: { fromBooking: item } });
                                                                    }}
                                                                    title="Создать запись дохода"
                                                                    style={{ color: 'var(--success)', minWidth: 44, minHeight: 44 }}
                                                                >
                                                                    <Icons.Money size={16} />
                                                                </button>
                                                            )}
                                                            {isAdmin && (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-ghost btn-icon"
                                                                        onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }}
                                                                    >
                                                                        <Icons.Edit size={16} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-ghost btn-icon"
                                                                        onClick={(e) => handleDelete(e, item.id)}
                                                                        style={{ color: 'var(--danger)' }}
                                                                    >
                                                                        <Icons.Trash size={16} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            <ConfirmDialog
                open={navDialog.open}
                variant={navDialog.variant}
                title={navDialog.title}
                message={navDialog.message}
                confirmLabel={navDialog.confirmLabel}
                onConfirm={navDialog.onConfirm}
                onCancel={navDialog.onCancel}
            />

            {/* Modal */}
            {isModalOpen && (
                <div className="admin-overlay fade-in" style={{ zIndex: 1100 }}>
                    <div className="admin-modal">
                        <div className="admin-header">
                            <h3>{editingBooking ? 'Редактировать запись' : 'Новая запись'}</h3>
                            <button className="btn btn-ghost btn-icon" onClick={handleCloseModal}>
                                <Icons.X size={20} />
                            </button>
                        </div>
                        <style>{`
                            @media (max-width: 768px) {
                                .booking-form-scroll {
                                    max-height: 60vh !important;
                                    overflow-y: auto !important;
                                    padding-right: 4px;
                                }
                            }
                        `}</style>
                        <form onSubmit={handleSubmit} className="booking-form-scroll" style={{ padding: '20px' }}>
                            <div className="form-group">
                                <label className="form-label">Клиент</label>
                                <input type="text" name="clientName" className="form-input" placeholder="Имя" value={formData.clientName} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Телефон</label>
                                <input type="tel" name="clientPhone" className="form-input" placeholder="+7..." value={formData.clientPhone} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Автомобиль</label>
                                <input type="text" name="carBrand" className="form-input" placeholder="Марка / модель" value={formData.carBrand} onChange={handleChange} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label className="form-label">Дата</label>
                                    <input type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Время (опц)</label>
                                    <input type="time" name="time" className="form-input" value={formData.time} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Описание работ</label>
                                <textarea name="description" className="form-input" rows="3" value={formData.description} onChange={handleChange}></textarea>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Статус</label>
                                <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                                    <option value="pending">Ожидает</option>
                                    <option value="in-progress">В работе</option>
                                    <option value="done">Готово</option>
                                    <option value="not-done">Не сделано</option>
                                    <option value="cancelled">Отмена</option>
                                </select>
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Отмена</button>
                                <button type="submit" className="btn btn-primary">Сохранить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BookingPage;
