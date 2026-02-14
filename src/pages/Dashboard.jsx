import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IncomeForm from '../components/IncomeForm';
import IncomeTable from '../components/IncomeTable';
import DateFilter from '../components/DateFilter';
import Statistics from '../components/Statistics';
import IncomeChart from '../components/IncomeChart';
import CloudSync from '../components/CloudSync';
import ExportModal from '../components/ExportModal';
import Icons from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRecords } from '../hooks/useRecords';
import { filterByMonth } from '../utils/dateUtils';

function Dashboard({ users }) {
    const { currentUser } = useAuth();
    const { t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();

    // Глобальное состояние из контекста (защита от не-массива)
    const ctx = useRecords();
    const records = Array.isArray(ctx.records) ? ctx.records : [];
    const { setRecords, updateRecord, addRecord, deleteRecord, isInitialLoading } = ctx;

    const [prefillData, setPrefillData] = useState(null);
    const isAdmin = currentUser?.role === 'admin';

    // Состояние фильтров
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedExecutor, setSelectedExecutor] = useState('all');

    // Состояние редактирования
    const [editingRecord, setEditingRecord] = useState(null);

    // Состояние окон
    const [isExportOpen, setIsExportOpen] = useState(false);

    // Реф для фокуса на форме
    const formRef = useRef(null);

    // Обработка данных из заявки при переходе
    useEffect(() => {
        if (location.state?.fromBooking) {
            console.log('Received booking data for prefill:', location.state.fromBooking);
            setPrefillData(location.state.fromBooking);

            // Очищаем состояние навигации, чтобы при перезагрузке не заполнялось снова
            navigate(location.pathname, { replace: true, state: {} });

            // Скроллим к форме (задержка даёт время раскрыться форме и обновиться DOM на мобильных)
            setTimeout(() => {
                formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 400);
        }
    }, [location, navigate]);

    // Подсветка записи дохода при переходе с карточки клиента
    const highlightRecordId = location.state?.highlightRecordId ?? null;
    useEffect(() => {
        if (!highlightRecordId) return;
        const t = setTimeout(() => {
            navigate(location.pathname, { replace: true, state: {} });
        }, 1500);
        return () => clearTimeout(t);
    }, [highlightRecordId, location.pathname, navigate]);

    // Фильтрация записей
    const filteredRecords = useMemo(() => {
        let result = records || [];

        if (selectedMonth) {
            result = filterByMonth(result, selectedMonth.year, selectedMonth.month);
        }

        if (selectedDay && selectedMonth) {
            result = result.filter(record => {
                const date = new Date(record.date);
                return date.getDate() === selectedDay;
            });
        }

        if (selectedExecutor && selectedExecutor !== 'all') {
            result = result.filter(record =>
                record.executors && record.executors.includes(selectedExecutor)
            );
        }

        return result;
    }, [records, selectedMonth, selectedDay, selectedExecutor]);

    const mostProfitableDate = useMemo(() => {
        if (filteredRecords.length === 0) return null;
        const dayTotals = {};
        filteredRecords.forEach(record => {
            dayTotals[record.date] = (dayTotals[record.date] || 0) + record.amount;
        });
        let maxDate = null;
        let maxAmount = 0;
        Object.entries(dayTotals).forEach(([date, amount]) => {
            if (amount > maxAmount) {
                maxAmount = amount;
                maxDate = date;
            }
        });
        return maxDate;
    }, [filteredRecords]);

    const periodLabel = useMemo(() => {
        if (!selectedMonth) return null;
        const monthName = t(`month${selectedMonth.month} `);
        if (selectedDay) {
            return `${selectedDay} ${monthName} ${selectedMonth.year} `;
        }
        return `${monthName} ${selectedMonth.year} `;
    }, [selectedMonth, selectedDay, t]);

    const handleSubmit = useCallback((data) => {
        if (!isAdmin) return;
        if (editingRecord) {
            updateRecord(editingRecord.id, data);
            setEditingRecord(null);
        } else {
            addRecord(data);
            // Очищаем prefillData после успешного создания записи
            setPrefillData(null);
        }
    }, [editingRecord, addRecord, updateRecord, isAdmin]);

    const handleEdit = useCallback((record) => {
        if (!isAdmin) return;
        setEditingRecord(record);
        setPrefillData(null); // Очищаем prefillData при начале редактирования
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [isAdmin]);

    const handleCancelEdit = useCallback(() => {
        setEditingRecord(null);
        // Не очищаем prefillData при отмене редактирования, чтобы данные из заявки остались
    }, []);

    const handleDelete = useCallback((id) => {
        if (!isAdmin) return;
        deleteRecord(id);
        if (editingRecord?.id === id) {
            setEditingRecord(null);
        }
    }, [deleteRecord, editingRecord, isAdmin]);

    const handleResetFilters = useCallback(() => {
        setSelectedMonth(null);
        setSelectedDay(null);
        setSelectedExecutor('all');
    }, []);

    return (
        <div className="dashboard-container fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {isInitialLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>{t('loading')}</p>
                </div>
            )}
            {/* Панель действий Dashboard */}
            <div className="dashboard-actions">
                <button
                    className="btn btn-secondary"
                    onClick={() => setIsExportOpen(true)}
                    disabled={records.length === 0}
                    title={t('export')}
                >
                    <Icons.FileText size={18} /> {t('export')}
                </button>
            </div>

            <main className="main-content" style={{ flex: 1 }}>
                <aside className="sidebar" ref={formRef}>
                    {isAdmin && (
                        <IncomeForm
                            onSubmit={handleSubmit}
                            editingRecord={editingRecord}
                            onCancelEdit={handleCancelEdit}
                            users={users}
                            defaultMonth={selectedMonth}
                            defaultDay={selectedDay}
                            prefillData={prefillData}
                        />
                    )}

                    {isAdmin && (
                        <CloudSync
                            records={records}
                            onSyncLoad={setRecords}
                            readOnly={!isAdmin}
                        />
                    )}
                </aside>

                <div className="content-area">
                    <DateFilter
                        records={records}
                        users={users}
                        selectedMonth={selectedMonth}
                        selectedDay={selectedDay}
                        selectedExecutor={selectedExecutor}
                        onMonthChange={setSelectedMonth}
                        onDayChange={setSelectedDay}
                        onExecutorChange={setSelectedExecutor}
                        onReset={handleResetFilters}
                    />
                    <Statistics
                        records={filteredRecords}
                        allRecords={records}
                        periodLabel={periodLabel}
                    />

                    <IncomeChart records={filteredRecords} />

                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">
                                <span className="icon">
                                    <Icons.List size={20} />
                                </span>
                                {t('incomeList')}
                                {filteredRecords.length !== records.length && (
                                    <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '8px' }}>
                                        ({filteredRecords.length} / {records.length})
                                    </span>
                                )}
                            </h2>
                        </div>

                        <IncomeTable
                            records={filteredRecords}
                            users={users}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            editingId={editingRecord?.id}
                            mostProfitableDate={mostProfitableDate}
                            readOnly={!isAdmin}
                            highlightRecordId={highlightRecordId}
                        />
                    </div>
                </div>
            </main>

            {isExportOpen && (
                <ExportModal
                    records={records}
                    selectedMonth={selectedMonth}
                    onClose={() => setIsExportOpen(false)}
                    users={users}
                />
            )}
        </div>
    );
}

export default Dashboard;
