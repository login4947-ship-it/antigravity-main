import { useState, useEffect, useRef } from 'react';
import Icons from './Icons';
import ExecutorSelect from './ExecutorSelect';
import WorkTypeSelect from './WorkTypeSelect';
import { useLanguage } from '../context/LanguageContext';

/**
 * Форма добавления/редактирования дохода
 */
function IncomeForm({ onSubmit, editingRecord, onCancelEdit, users = [], defaultMonth = null, defaultDay = null, prefillData = null }) {
    const { t } = useLanguage();

    // Состояние для раскрытия/скрытия формы
    const [isExpanded, setIsExpanded] = useState(false);

    // Получить дату по умолчанию на основе фильтров или сегодня
    const getDefaultDate = () => {
        if (defaultMonth) {
            const year = defaultMonth.year;
            const month = String(defaultMonth.month).padStart(2, '0');
            const day = defaultDay ? String(defaultDay).padStart(2, '0') : '01';
            return `${year}-${month}-${day}`;
        }
        return new Date().toISOString().split('T')[0];
    };

    // Начальное состояние формы
    const initialState = {
        amount: '',
        date: getDefaultDate(),
        workType: '',
        executors: [],
        carBrand: '',
        vin: '',
        comment: '',
        shares: {}, // { userId: amount }
        client: { name: '', phone: '' }
    };

    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});

    // Обновляем дату по умолчанию при смене фильтров (только если не редактируем)
    useEffect(() => {
        if (!editingRecord && !prefillData) {
            setFormData(prev => ({
                ...prev,
                date: getDefaultDate()
            }));
        }
    }, [defaultMonth, defaultDay, editingRecord, prefillData]);

    // Заполнение формы из prefillData (из заявки)
    useEffect(() => {
        if (prefillData && !editingRecord) {
            console.log('Auto-filling form with booking data:', prefillData);
            const bookingDate = prefillData.date ? (prefillData.date.split('T')[0] || prefillData.date) : getDefaultDate();
            setFormData(prev => ({
                ...prev,
                client: {
                    name: prefillData.clientName || '',
                    phone: prefillData.clientPhone || ''
                },
                carBrand: prefillData.carBrand || '',
                date: bookingDate,
                comment: prefillData.description ? `Заявка: ${prefillData.description}` : ''
            }));
            // Раскрываем форму при заполнении из заявки
            setIsExpanded(true);
            // Скролл к форме и фокус на поле суммы (важно для мобильных после перехода по иконке доллара)
            setTimeout(() => {
                formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                amountInputRef.current?.focus();
            }, 150);
        }
    }, [prefillData, editingRecord]);

    // Реф для фокуса на поле суммы и скролла к форме при переходе с заявки
    const amountInputRef = useRef(null);
    const formContainerRef = useRef(null);

    // Заполнение формы при редактировании
    useEffect(() => {
        if (editingRecord) {
            // Раскрываем форму при редактировании
            setIsExpanded(true);

            // Убеждаемся, что дата в формате YYYY-MM-DD для input type="date"
            let recordDate = editingRecord.date;
            if (recordDate && recordDate.includes('T')) {
                recordDate = recordDate.split('T')[0];
            }

            // Если редактируем запись с несколькими исполнителями, но без shares (старая запись),
            // нужно инициализировать shares (например, поровну или 0)
            let initialShares = editingRecord.shares || {};
            const executors = editingRecord.executors || [];

            if (executors.length > 1 && Object.keys(initialShares).length === 0) {
                // Старая запись: делим поровну для старта
                const shareAmount = (editingRecord.amount / executors.length).toFixed(2);
                executors.forEach((id, index) => {
                    // Корректировка копеек для последнего
                    if (index === executors.length - 1) {
                        const sumOthers = shareAmount * (executors.length - 1);
                        initialShares[id] = (editingRecord.amount - sumOthers).toFixed(2);
                    } else {
                        initialShares[id] = shareAmount;
                    }
                });
            }

            setFormData({
                amount: editingRecord.amount.toString(),
                date: recordDate || getDefaultDate(),
                workType: editingRecord.workType || '',
                executors: executors,
                carBrand: editingRecord.carBrand || '',
                vin: editingRecord.vin || '',
                comment: editingRecord.comment || '',
                shares: initialShares,
                client: editingRecord.client || { name: '', phone: '' }
            });
            // Фокус на сумме при начале редактирования
            amountInputRef.current?.focus();
        } else {
            setFormData(initialState);
        }
    }, [editingRecord]);

    // Валидация формы
    const validate = () => {
        const newErrors = {};
        if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
            newErrors.amount = true;
        }
        if (!formData.date) {
            newErrors.date = true;
        }
        if (!formData.workType) {
            newErrors.workType = true;
        }
        if (formData.executors.length === 0) {
            newErrors.executors = true;
        }

        // Валидация shares если больше 1 исполнителя
        if (formData.executors.length > 1) {
            formData.executors.forEach(id => {
                const share = formData.shares[id];
                if (!share || parseFloat(share) < 0) { // разрешаем 0?
                    // newErrors[`share_${id}`] = true; 
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validate()) {
            // Если 1 исполнитель, shares не нужен (или равен полной сумме)
            let finalShares = {};
            if (formData.executors.length > 1) {
                finalShares = formData.shares;
            } else if (formData.executors.length === 1) {
                finalShares = { [formData.executors[0]]: parseFloat(formData.amount) };
            }

            onSubmit({
                ...formData,
                amount: parseFloat(formData.amount),
                shares: finalShares
            });

            // Очищаем форму и сворачиваем если не редактируем
            if (!editingRecord) {
                setFormData(initialState);
                setErrors({});
                setIsExpanded(false);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Очистка ошибки при вводе
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: false }));
        }
    };

    const handleClientChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            client: { ...prev.client, [field]: value }
        }));
    };

    const handleExecutorsChange = (executors) => {
        setFormData(prev => {
            const newShares = {};
            executors.forEach(id => {
                // Если пользователь уже был, сохраняем его долю
                if (prev.executors.includes(id)) {
                    newShares[id] = prev.shares[id] || '';
                } else {
                    newShares[id] = ''; // Новый пользователь - пустая доля
                }
            });

            // Если список стал 1 или 0, сумма считается обычной, shares можно сбросить или игнорировать
            // Если стало > 1, нужно пересчитать Total Amount (но пока доли пустые, Total будет суммой введенных)

            // Расчет новой суммы, если больше 1
            let newAmount = prev.amount;
            if (executors.length > 1) {
                const totalShares = Object.values(newShares).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
                // Если totalShares 0 (все новые), возможно стоит оставить старую сумму?
                // Нет, "Option 2" подразумевает ручной ввод.
                // Временно покажем сумму 0 или сумму тех, что есть.
                newAmount = totalShares > 0 ? totalShares.toString() : '';
            }

            return { ...prev, executors, shares: newShares, amount: newAmount };
        });

        if (errors.executors) {
            setErrors(prev => ({ ...prev, executors: false }));
        }
    };

    const handleShareChange = (userId, value) => {
        // Разрешаем ввод чисел
        setFormData(prev => {
            const newShares = { ...prev.shares, [userId]: value };

            // Пересчитываем общую сумму
            const totalAmount = Object.values(newShares).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

            return {
                ...prev,
                shares: newShares,
                amount: totalAmount > 0 ? totalAmount.toString() : '' // Обновляем Total
            };
        });
    };

    const handleWorkTypeChange = (workType) => {
        setFormData(prev => ({ ...prev, workType }));
        if (errors.workType) {
            setErrors(prev => ({ ...prev, workType: false }));
        }
    };

    // Переключение раскрытия формы
    const toggleExpanded = () => {
        if (!editingRecord) {
            setIsExpanded(!isExpanded);
        }
    };

    const isMultiExecutor = formData.executors.length > 1;

    // Определяем должна ли форма быть раскрыта
    const shouldShowForm = isExpanded || editingRecord;

    return (
        <div ref={formContainerRef} className={`card fade-in ${editingRecord ? 'editing-active' : ''}`}>
            <div
                className="card-header"
                onClick={toggleExpanded}
                style={{
                    cursor: editingRecord ? 'default' : 'pointer',
                    userSelect: 'none'
                }}
            >
                <h2 className="card-title">
                    <span
                        className="icon"
                        style={{
                            transition: 'transform 0.3s ease',
                            transform: shouldShowForm && !editingRecord ? 'rotate(45deg)' : 'rotate(0deg)'
                        }}
                    >
                        {editingRecord ? <Icons.Edit size={20} /> : <Icons.Plus size={20} />}
                    </span>
                    {editingRecord ? t('editRecord') : t('newRecord')}
                </h2>
                {editingRecord && (
                    <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onCancelEdit();
                        }}
                        title={t('cancel')}
                    >
                        <Icons.X size={16} />
                    </button>
                )}
            </div>

            {shouldShowForm && (
                <div
                    className="income-form-scroll-container"
                    style={{
                        maxHeight: 'none',
                        overflowY: 'visible'
                    }}
                >
                    <style>{`
                        @media (max-width: 768px) {
                            .income-form-scroll-container {
                                max-height: 60vh !important;
                                overflow-y: auto !important;
                                padding-right: 4px;
                            }
                        }
                    `}</style>
                    <form onSubmit={handleSubmit} id="income-form" className="slide-down">

                        {/* Исполнители (ставим выше суммы, т.к. сумма зависит от них) */}
                        <div className="form-group">
                            <label className="form-label">
                                {t('executors')}
                            </label>
                            <ExecutorSelect
                                value={formData.executors}
                                onChange={handleExecutorsChange}
                                users={users}
                            />
                            {errors.executors && <span className="error-text">Выберите хотя бы одного исполнителя</span>}
                        </div>

                        {/* Блок распределения долей для нескольких исполнителей */}
                        {isMultiExecutor && (
                            <div className="form-group slide-down" style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                <label className="form-label-sm" style={{ marginBottom: '8px', display: 'block' }}>Распределение суммы:</label>
                                {formData.executors.map(userId => {
                                    const user = users.find(u => u.id === userId);
                                    return (
                                        <div key={userId} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
                                            <div style={{ flex: 1, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {user ? (user.fullName || user.username) : userId}
                                            </div>
                                            <div style={{ width: '120px' }}>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    style={{ padding: '6px 10px', fontSize: '0.9rem' }}
                                                    placeholder="0"
                                                    step="0.01"
                                                    value={formData.shares[userId] || ''}
                                                    onChange={(e) => handleShareChange(userId, e.target.value)}
                                                    required={isMultiExecutor}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Сумма */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="income-amount">
                                {isMultiExecutor ? `${t('amount')} (Итого)` : `${t('amount')} (₾)`}
                            </label>
                            <div className="input-with-icon">
                                <Icons.Money size={20} className="input-icon" />
                                <input
                                    ref={amountInputRef}
                                    type="number"
                                    id="income-amount"
                                    name="amount"
                                    className={`form-input ${errors.amount ? 'error' : ''}`}
                                    placeholder={t('placeholderAmount')}
                                    step="0.01"
                                    min="0.01"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                    readOnly={isMultiExecutor} // Блокируем общий ввод если распределяем вручную
                                    style={isMultiExecutor ? { backgroundColor: 'var(--bg-tertiary)', cursor: 'default' } : {}}
                                />
                            </div>
                            {isMultiExecutor && <div className="form-hint">Сумма рассчитывается автоматически из долей исполнителей</div>}
                        </div>

                        {/* Остальные поля */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="income-date">
                                {t('date')}
                            </label>
                            <div className="input-with-icon">
                                <Icons.Calendar size={20} className="input-icon" />
                                <input
                                    type="date"
                                    id="income-date"
                                    name="date"
                                    className={`form-input ${errors.date ? 'error' : ''}`}
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="income-carBrand">
                                {t('carBrand')}
                            </label>
                            <div className="input-with-icon">
                                <Icons.Car size={20} className="input-icon" />
                                <input
                                    type="text"
                                    id="income-carBrand"
                                    name="carBrand"
                                    className="form-input"
                                    placeholder={t('placeholderCarBrand')}
                                    value={formData.carBrand}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="income-vin">
                                {t('vin')}
                            </label>
                            <div className="input-with-icon">
                                <Icons.Note size={20} className="input-icon" />
                                <input
                                    type="text"
                                    id="income-vin"
                                    name="vin"
                                    className="form-input"
                                    placeholder={t('placeholderVin')}
                                    value={formData.vin}
                                    onChange={handleChange}
                                    maxLength="17"
                                    style={{ textTransform: 'uppercase' }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                {t('workType')}
                            </label>
                            <WorkTypeSelect
                                value={formData.workType}
                                onChange={handleWorkTypeChange}
                                hasError={errors.workType}
                            />
                        </div>

                        {/* Данные клиента */}
                        <div className="form-group" style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <label className="form-label-sm" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Icons.User size={14} /> Клиент
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    style={{ fontSize: '0.9rem' }}
                                    placeholder="Имя"
                                    value={formData.client.name}
                                    onChange={(e) => handleClientChange('name', e.target.value)}
                                />
                                <input
                                    type="tel"
                                    className="form-input"
                                    style={{ fontSize: '0.9rem' }}
                                    placeholder="Телефон"
                                    value={formData.client.phone}
                                    onChange={(e) => handleClientChange('phone', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="income-comment">
                                {t('comment')}
                            </label>
                            <textarea
                                id="income-comment"
                                name="comment"
                                className="form-input"
                                placeholder={t('placeholderComment')}
                                rows="3"
                                value={formData.comment}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button type="submit" className="btn btn-primary btn-block">
                                <Icons.Check size={20} />
                                {editingRecord ? t('save') : t('add')}
                            </button>
                            {editingRecord && (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onCancelEdit}
                                >
                                    {t('cancel')}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default IncomeForm;
