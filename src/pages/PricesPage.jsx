import React, { useState, useMemo } from 'react';
import Icons from '../components/Icons';
import CloudSync from '../components/CloudSync';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useRecords } from '../hooks/useRecords';
import WorkTypeSelect, { WORK_TYPES, getWorkTypeById, WorkTypeBadge } from '../components/WorkTypeSelect';

function PricesPage() {
    const { currentUser } = useAuth();
    const { t } = useLanguage();

    // Глобальное состояние из контекста
    const { prices, setPrices, addPrice, updatePrice, deletePrice, isInitialLoading } = useRecords();

    const isAdmin = currentUser?.role === 'admin';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPrice, setEditingPrice] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Form State
    const [formData, setFormData] = useState({
        workType: '',
        carBrand: '',
        price: '',
        comment: ''
    });

    const handleOpenModal = (priceItem = null) => {
        if (priceItem) {
            setEditingPrice(priceItem);
            setFormData({
                workType: priceItem.workType || '',
                carBrand: priceItem.carBrand || '',
                price: priceItem.price != null ? String(priceItem.price) : '',
                comment: priceItem.comment != null ? String(priceItem.comment) : ''
            });
        } else {
            setEditingPrice(null);
            setFormData({
                workType: '',
                carBrand: '',
                price: '',
                comment: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPrice(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isAdmin) {
            alert('Только администратор может добавлять и изменять цены.');
            return;
        }
        if (!formData.workType) {
            alert('Выберите тип работы.');
            return;
        }

        const payload = {
            workType: formData.workType,
            carBrand: formData.carBrand || '',
            price: formData.price != null ? String(formData.price).trim() : '',
            comment: formData.comment != null ? String(formData.comment).trim() : ''
        };

        if (editingPrice) {
            updatePrice(editingPrice.id, payload);
        } else {
            addPrice(payload);
        }

        // Закрываем после применения обновления состояния
        setTimeout(handleCloseModal, 0);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDelete = (id) => {
        if (!isAdmin) return;
        if (window.confirm('Удалить эту цену?')) {
            deletePrice(id);
        }
    };

    // Фильтрация по категории (тип работ) и сортировка
    const filteredPrices = useMemo(() => {
        let list = Array.isArray(prices) ? prices : [];
        if (selectedCategory !== 'all') {
            list = list.filter((p) => p.workType === selectedCategory);
        }
        return [...list].sort((a, b) => {
            const orderA = WORK_TYPES.findIndex((t) => t.id === a.workType);
            const orderB = WORK_TYPES.findIndex((t) => t.id === b.workType);
            if (orderA !== -1 && orderB !== -1) return orderA - orderB;
            if (orderA !== -1) return -1;
            if (orderB !== -1) return 1;
            return (a.workType || '').localeCompare(b.workType || '');
        });
    }, [prices, selectedCategory]);

    return (
        <div className="dashboard-container fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {isInitialLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>{t('loading')}</p>
                </div>
            )}

            {isAdmin && (
                <div className="dashboard-actions">
                    <button type="button" className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <Icons.Plus size={20} /> Добавить цену
                    </button>
                </div>
            )}

            <main className="main-content" style={{ flex: 1, overflow: 'hidden' }}>
                <aside className="sidebar">
                    {isAdmin && (
                        <CloudSync
                            records={prices}
                            onSyncLoad={setPrices}
                            collectionName="Prices"
                        />
                    )}
                </aside>

                <div className="content-area">
                    <div className="card prices-card">
                        <div className="card-header">
                            <h2 className="card-title">
                                <Icons.Money size={20} />
                                Прейскурант ({filteredPrices.length}{selectedCategory !== 'all' ? ` / ${prices.length}` : ''})
                            </h2>
                        </div>

                        {/* Фильтр по категориям — те же иконки и категории, что в доходах */}
                        <div className="prices-category-filter">
                            <button
                                type="button"
                                className={`prices-category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('all')}
                            >
                                <span className="chip-emoji">📋</span>
                                <span className="chip-name">Все</span>
                            </button>
                            {WORK_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    className={`prices-category-chip ${selectedCategory === type.id ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(type.id)}
                                    style={
                                        selectedCategory === type.id
                                            ? { backgroundColor: `${type.color}20`, color: type.color, borderColor: `${type.color}50` }
                                            : {}
                                    }
                                >
                                    <span className="chip-emoji">{type.emoji}</span>
                                    <span className="chip-name">{t(type.translationKey)}</span>
                                </button>
                            ))}
                        </div>

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Тип работы</th>
                                        <th>Марка машины</th>
                                        <th>Цена</th>
                                        <th>Комментарий</th>
                                        {isAdmin && <th style={{ width: '80px' }}></th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPrices.length === 0 ? (
                                        <tr>
                                            <td colSpan={isAdmin ? 5 : 4} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                                {selectedCategory === 'all' ? 'Цены еще не добавлены' : 'В этой категории нет цен'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPrices.map((item) => (
                                            <tr key={item.id}>
                                                <td data-label="Тип работы">
                                                    {getWorkTypeById(item.workType) ? (
                                                        <WorkTypeBadge workTypeId={item.workType} />
                                                    ) : (
                                                        <span style={{ fontWeight: 500 }}>{item.workType || '—'}</span>
                                                    )}
                                                </td>
                                                <td data-label="Марка машины">{item.carBrand || 'Все марки'}</td>
                                                <td data-label="Цена" style={{ fontWeight: 600, color: 'var(--success)' }}>
                                                    {item.price !== undefined && item.price !== null && String(item.price).trim() !== '' ? String(item.price).trim() : '—'}
                                                </td>
                                                <td data-label="Комментарий" className="prices-comment-cell">
                                                    {item.comment ? item.comment : '—'}
                                                </td>
                                                {isAdmin && (
                                                    <td data-label="Действия">
                                                        <div className="table-actions">
                                                            <button
                                                                type="button"
                                                                className="btn btn-ghost btn-icon"
                                                                onClick={() => handleOpenModal(item)}
                                                                title="Редактировать"
                                                            >
                                                                <Icons.Edit size={16} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-ghost btn-icon"
                                                                onClick={() => handleDelete(item.id)}
                                                                title="Удалить"
                                                                style={{ color: 'var(--danger)' }}
                                                            >
                                                                <Icons.Trash size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="admin-overlay fade-in" style={{ zIndex: 1100 }}>
                    <div className="admin-modal" style={{ maxWidth: '400px' }}>
                        <div className="admin-header">
                            <h3>{editingPrice ? 'Редактировать цену' : 'Новая цена'}</h3>
                            <button type="button" className="btn btn-ghost btn-icon" onClick={handleCloseModal}>
                                <Icons.X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                            <div className="form-group">
                                <label className="form-label">Тип работы</label>
                                <WorkTypeSelect
                                    value={formData.workType}
                                    onChange={(id) => setFormData((prev) => ({ ...prev, workType: id }))}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Марка машины</label>
                                <input
                                    type="text"
                                    name="carBrand"
                                    className="form-input"
                                    placeholder="Оставьте пустым для всех марок"
                                    value={formData.carBrand}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Цена</label>
                                <input
                                    type="text"
                                    name="price"
                                    className="form-input"
                                    placeholder="0 или договорная"
                                    value={formData.price}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Комментарий</label>
                                <textarea
                                    name="comment"
                                    className="form-input"
                                    placeholder="Необязательно"
                                    value={formData.comment}
                                    onChange={handleChange}
                                    rows={3}
                                    style={{ resize: 'vertical', minHeight: '64px' }}
                                />
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

export default PricesPage;
