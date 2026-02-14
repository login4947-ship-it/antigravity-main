import { useMemo } from 'react';
import { getAvailableMonths, getAvailableDays } from '../utils/dateUtils';
import Icons from './Icons';
import { useLanguage } from '../context/LanguageContext';

/**
 * Фильтр записей по дате
 */
function DateFilter({ records = [], users = [], selectedMonth, selectedDay, selectedExecutor, onMonthChange, onDayChange, onExecutorChange, onReset }) {
    const { t } = useLanguage();
    const safeRecords = Array.isArray(records) ? records : [];

    // Список доступных месяцев
    const availableMonths = useMemo(() => getAvailableMonths(safeRecords), [safeRecords]);

    // Список доступных дней для выбранного месяца
    const availableDays = useMemo(() => {
        if (!selectedMonth) return [];
        return getAvailableDays(safeRecords, selectedMonth.year, selectedMonth.month);
    }, [safeRecords, selectedMonth]);

    const handleMonthChange = (e) => {
        const val = e.target.value;
        if (!val) {
            onMonthChange(null);
            onDayChange(null);
            return;
        }

        const [year, month] = val.split('-').map(Number);
        onMonthChange({ year, month });
        onDayChange(null); // Сбрасываем выбранный день при смене месяца
    };

    const handleDayChange = (e) => {
        const val = e.target.value;
        onDayChange(val ? Number(val) : null);
    };

    const handleExecutorChange = (e) => {
        onExecutorChange(e.target.value);
    };

    // Только сотрудники для фильтра
    const employees = useMemo(() => {
        return users.filter(u => u.role === 'employee');
    }, [users]);

    const isFiltered = selectedMonth || selectedDay || (selectedExecutor && selectedExecutor !== 'all');

    return (
        <div className="card fade-in" style={{ marginBottom: '24px', padding: '20px' }}>
            <div className="filter-grid">
                {/* Месяц */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="filter-month" style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                        {t('filterMonth')}
                    </label>
                    <div className="input-with-icon">
                        <select
                            id="filter-month"
                            className="form-input"
                            value={selectedMonth ? `${selectedMonth.year}-${selectedMonth.month}` : ''}
                            onChange={handleMonthChange}
                            style={{ height: '46px', paddingLeft: '12px' }}
                        >
                            <option value="">{t('filterAllMonths')}</option>
                            {availableMonths.map((item) => (
                                <option key={`${item.year}-${item.month}`} value={`${item.year}-${item.month}`}>
                                    {t(`month${item.month}`)} {item.year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Сотрудник */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="filter-executor" style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                        {t('filterExecutor')}
                    </label>
                    <div className="input-with-icon">
                        <select
                            id="filter-executor"
                            className="form-input"
                            value={selectedExecutor || 'all'}
                            onChange={handleExecutorChange}
                            style={{ height: '46px', paddingLeft: '12px' }}
                        >
                            <option value="all">{t('filterAllExecutors')}</option>
                            {employees.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.fullName || user.username}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* День */}
                <div className="form-group" style={{ marginBottom: 0, opacity: selectedMonth ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                    <label className="form-label" htmlFor="filter-day" style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                        {t('filterDay')}
                    </label>
                    <div className="input-with-icon">
                        <select
                            id="filter-day"
                            className="form-input"
                            value={selectedDay || ''}
                            onChange={handleDayChange}
                            disabled={!selectedMonth}
                            style={{ height: '46px', paddingLeft: '12px' }}
                        >
                            <option value="">{t('filterAllDays')}</option>
                            {availableDays.map((day) => (
                                <option key={day} value={day}>
                                    {day} {t('daySuffix')}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Кнопка сброса */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <button
                        className={`btn ${isFiltered ? 'btn-primary' : 'btn-secondary'} filter-reset-button`}
                        onClick={onReset}
                        disabled={!isFiltered}
                        title={t('filterReset')}
                    >
                        <Icons.Refresh size={18} />
                        <span>{t('filterReset')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DateFilter;
